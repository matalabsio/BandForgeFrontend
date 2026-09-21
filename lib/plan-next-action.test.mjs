/**
 * Node tests for resolveDoneDayPrimaryAction priority (mirrors plan-next-action.ts).
 */
import assert from "node:assert/strict";
import test from "node:test";

const PLAN_AHEAD_MAX_DAYS = 1;

function localIso(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addCalendarDays(iso, days) {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + days);
  return localIso(d);
}

function countableTasks(day) {
  return day.tasks.filter(
    (t) => t.status !== "skipped" && t.task_type !== "watch",
  );
}

function isPlanTaskUnavailable(task) {
  return (
    !task.hub_id ||
    (typeof task.href === "string" && task.href.includes("unavailable=1"))
  );
}

function findPlanDay(weeks, date) {
  for (const week of weeks) {
    const found = week.days.find((d) => d.date === date);
    if (found) return found;
  }
  return null;
}

function flattenPlanDays(weeks) {
  const days = [];
  for (const week of weeks) {
    for (const day of week.days) days.push(day);
  }
  return days.sort((a, b) => a.date.localeCompare(b.date));
}

function isPlanDayFullyComplete(day) {
  if (!day) return true;
  const tasks = countableTasks(day);
  if (tasks.length === 0) return true;
  return tasks.every((t) => t.status === "done");
}

function areAllPriorPlanDaysComplete(weeks, date) {
  for (const day of flattenPlanDays(weeks)) {
    if (day.date >= date) continue;
    if (!isPlanDayFullyComplete(day)) return false;
  }
  return true;
}

function isDayAccessible(date, today, examDate, weeks) {
  if (examDate && date > examDate) return false;
  if (date <= today) return true;
  if (date > addCalendarDays(today, PLAN_AHEAD_MAX_DAYS)) return false;
  if (!weeks) return false;
  const todayDay = findPlanDay(weeks, today);
  if (!isPlanDayFullyComplete(todayDay)) return false;
  if (!areAllPriorPlanDaysComplete(weeks, date)) return false;
  return true;
}

function firstActionableIncompleteTask(day) {
  if (!day) return null;
  return (
    countableTasks(day).find(
      (t) => t.status !== "done" && !isPlanTaskUnavailable(t),
    ) ?? null
  );
}

function countMissedDays(weeks, today, examDate) {
  const missed = [];
  for (const week of weeks) {
    for (const day of week.days) {
      if (day.date >= today) continue;
      if (!isDayAccessible(day.date, today, examDate, weeks)) continue;
      const tasks = countableTasks(day);
      if (tasks.length === 0) continue;
      const incomplete = tasks.filter((t) => t.status !== "done").length;
      if (incomplete > 0) {
        missed.push({ date: day.date, incompleteCount: incomplete });
      }
    }
  }
  return missed.sort((a, b) => a.date.localeCompare(b.date));
}

function getOldestCatchUpTarget(weeks, today, examDate) {
  const missed = countMissedDays(weeks, today, examDate);
  if (missed.length === 0) return null;
  for (const entry of missed) {
    const day = findPlanDay(weeks, entry.date);
    const task = firstActionableIncompleteTask(day);
    if (task) return { missed, date: entry.date, task };
  }
  return null;
}

function getNextAheadTarget(weeks, today, examDate) {
  const tomorrow = addCalendarDays(today, 1);
  if (!isDayAccessible(tomorrow, today, examDate, weeks)) return null;
  const day = findPlanDay(weeks, tomorrow);
  const task = firstActionableIncompleteTask(day);
  if (!task) return null;
  return { date: tomorrow, task };
}

function weeksWithDayMarkedDone(weeks, date) {
  return weeks.map((week) => ({
    ...week,
    days: week.days.map((day) => {
      if (day.date !== date) return day;
      return {
        ...day,
        tasks: day.tasks.map((t) =>
          t.status === "skipped" ? t : { ...t, status: "done" },
        ),
      };
    }),
  }));
}

function studyPlanDayHref(date, opts = {}) {
  const q = new URLSearchParams({ date });
  if (opts.skill) q.set("skill", opts.skill);
  if (opts.unavailable) q.set("unavailable", "1");
  return `/study-plan?${q.toString()}`;
}

function planTaskOpenHref(task) {
  return task.href || `/practice/${task.module}/${task.hub_id}`;
}

function resolveDoneDayPrimaryAction(opts) {
  const { weeks, today, examDate } = opts;
  const missed = weeks.length ? countMissedDays(weeks, today, examDate) : [];
  const missedDayCount = missed.length;
  const catchUp =
    weeks.length > 0 ? getOldestCatchUpTarget(weeks, today, examDate) : null;

  if (catchUp?.task) {
    return {
      kind: "catch_up",
      href: planTaskOpenHref(catchUp.task),
      label:
        missedDayCount === 1
          ? "Catch up on previous day"
          : `Catch up on ${missedDayCount} previous days`,
      catchUpIsPrimary: true,
      missedDayCount,
    };
  }

  if (missedDayCount > 0) {
    const oldest = missed[0];
    return {
      kind: "full_plan",
      href: studyPlanDayHref(oldest.date, { unavailable: true }),
      label: "View full plan",
      catchUpIsPrimary: false,
      missedDayCount,
    };
  }

  const weeksForAhead =
    opts.markTodayDoneForAhead && weeks.length
      ? weeksWithDayMarkedDone(weeks, today)
      : weeks;
  const ahead =
    weeksForAhead.length > 0
      ? getNextAheadTarget(weeksForAhead, today, examDate)
      : null;

  if (ahead?.task) {
    return {
      kind: "tomorrow",
      href: planTaskOpenHref(ahead.task),
      label: "Start tomorrow's plan",
      catchUpIsPrimary: false,
      missedDayCount: 0,
    };
  }

  return {
    kind: "full_plan",
    href: "/study-plan",
    label: "View full plan",
    catchUpIsPrimary: false,
    missedDayCount: 0,
  };
}

const TODAY = "2026-07-17";
const EXAM = "2026-08-01";

function clearPlan() {
  return [
    {
      days: [
        {
          date: "2026-07-16",
          tasks: [
            {
              id: "y1",
              status: "done",
              hub_id: "h1",
              task_type: "practice",
              href: "/p/y",
            },
          ],
        },
        {
          date: TODAY,
          tasks: [
            {
              id: "t1",
              status: "done",
              hub_id: "h2",
              task_type: "practice",
              href: "/p/t",
            },
          ],
        },
        {
          date: "2026-07-18",
          tasks: [
            {
              id: "tm1",
              status: "pending",
              hub_id: "h3",
              task_type: "practice",
              module: "listening",
              href: "/practice/listening/h3",
            },
          ],
        },
      ],
    },
  ];
}

test("resolveDoneDayPrimaryAction prefers catch-up over tomorrow", () => {
  const weeks = clearPlan();
  weeks[0].days[0].tasks[0].status = "pending";
  const action = resolveDoneDayPrimaryAction({
    weeks,
    today: TODAY,
    examDate: EXAM,
    markTodayDoneForAhead: true,
  });
  assert.equal(action.kind, "catch_up");
  assert.equal(action.catchUpIsPrimary, true);
  assert.match(action.label, /previous day/);
});

test("resolveDoneDayPrimaryAction uses tomorrow when clear", () => {
  const action = resolveDoneDayPrimaryAction({
    weeks: clearPlan(),
    today: TODAY,
    examDate: EXAM,
    markTodayDoneForAhead: true,
  });
  assert.equal(action.kind, "tomorrow");
  assert.equal(action.label, "Start tomorrow's plan");
  assert.equal(action.href, "/practice/listening/h3");
});

test("resolveDoneDayPrimaryAction full plan when missed only unavailable", () => {
  const weeks = clearPlan();
  weeks[0].days[0].tasks[0] = {
    id: "y-bad",
    status: "pending",
    hub_id: null,
    task_type: "practice",
    module: "writing",
    href: "/study-plan?date=2026-07-16&skill=writing&unavailable=1",
  };
  const action = resolveDoneDayPrimaryAction({
    weeks,
    today: TODAY,
    examDate: EXAM,
    markTodayDoneForAhead: true,
  });
  assert.equal(action.kind, "full_plan");
  assert.equal(
    action.href,
    "/study-plan?date=2026-07-16&unavailable=1",
  );
  assert.equal(action.label, "View full plan");
});

test("resolveDoneDayPrimaryAction full plan when nothing left", () => {
  const weeks = clearPlan();
  weeks[0].days[2].tasks[0].status = "done";
  const action = resolveDoneDayPrimaryAction({
    weeks,
    today: TODAY,
    examDate: EXAM,
    markTodayDoneForAhead: true,
  });
  assert.equal(action.kind, "full_plan");
  assert.equal(action.href, "/study-plan");
});

test("resolveDoneDayPrimaryAction never returns practice hub browse path as default", () => {
  const action = resolveDoneDayPrimaryAction({
    weeks: [],
    today: TODAY,
    examDate: EXAM,
  });
  assert.equal(action.href, "/study-plan");
  assert.ok(!action.href.includes("/practice/"));
});
