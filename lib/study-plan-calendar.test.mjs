/**
 * Node test runner for study-plan-calendar (keep in sync with study-plan-calendar.ts).
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
  // Match study-plan-calendar.ts — ignore skipped + watch.
  // Speaking Practice done ⇒ ignore Submit for the same hub.
  const raw = day.tasks.filter(
    (t) => t.status !== "skipped" && t.task_type !== "watch",
  );
  const speakingPracticeDone = new Set(
    raw
      .filter(
        (t) =>
          t.module === "speaking" &&
          t.task_type === "practice" &&
          t.status === "done",
      )
      .map((t) => String(t.hub_id || "").trim())
      .filter(Boolean),
  );
  return raw.filter((t) => {
    if (
      t.module === "speaking" &&
      t.task_type === "submit" &&
      speakingPracticeDone.has(String(t.hub_id || "").trim())
    ) {
      return false;
    }
    return true;
  });
}

function isPlanTaskUnavailable(task) {
  return (
    !task.hub_id ||
    (typeof task.href === "string" && task.href.includes("unavailable=1"))
  );
}

function firstActionableIncompleteTask(day) {
  if (!day) return null;
  return (
    sortPlanTasks(countableTasks(day)).find(
      (t) => t.status !== "done" && !isPlanTaskUnavailable(t),
    ) ?? null
  );
}

function flattenPlanDays(weeks) {
  const days = [];
  for (const week of weeks) {
    for (const day of week.days) days.push(day);
  }
  return days.sort((a, b) => a.date.localeCompare(b.date));
}

function findPlanDay(weeks, date) {
  for (const week of weeks) {
    const found = week.days.find((d) => d.date === date);
    if (found) return found;
  }
  return null;
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

function isDayAfterExam(date, examDate) {
  return Boolean(examDate && date > examDate);
}

function dayStatus(day, today, examDate, weeks) {
  if (isDayAfterExam(day.date, examDate)) return "locked";
  if (!isDayAccessible(day.date, today, examDate, weeks)) return "locked";
  if (day.date === today) {
    const tasks = countableTasks(day);
    if (tasks.length > 0 && tasks.every((t) => t.status === "done")) {
      return "completed";
    }
    if (tasks.some((t) => t.status === "done")) return "in_progress";
    return "today";
  }
  const tasks = countableTasks(day);
  const isAhead = day.date > today;
  if (tasks.length === 0) return isAhead ? "ahead" : "open";
  if (tasks.every((t) => t.status === "done")) return "completed";
  if (tasks.some((t) => t.status === "done")) return "in_progress";
  return isAhead ? "ahead" : "open";
}

function sortPlanTasks(tasks) {
  return [...tasks];
}

function getNextAheadTarget(weeks, today, examDate) {
  const tomorrow = addCalendarDays(today, 1);
  if (!isDayAccessible(tomorrow, today, examDate, weeks)) return null;
  const day = findPlanDay(weeks, tomorrow);
  const task = firstActionableIncompleteTask(day);
  if (!task) return null;
  return { date: tomorrow, task };
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

function studyPlanDayHref(date, opts = {}) {
  const q = new URLSearchParams({ date });
  if (opts.skill) q.set("skill", opts.skill);
  if (opts.unavailable) q.set("unavailable", "1");
  return `/study-plan?${q.toString()}`;
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

const TODAY = "2026-07-17";
const EXAM = "2026-08-01";

function makeWeeks({ yesterdayDone, todayDone, tomorrowPending = true }) {
  return [
    {
      days: [
        {
          date: "2026-07-16",
          label: "Thu",
          tasks: [
            {
              id: "y1",
              status: yesterdayDone ? "done" : "pending",
              hub_id: "hub-y",
              task_type: "practice",
            },
          ],
        },
        {
          date: TODAY,
          label: "Fri",
          tasks: [
            {
              id: "t1",
              status: todayDone ? "done" : "pending",
              hub_id: "hub-t",
              task_type: "practice",
            },
          ],
        },
        {
          date: "2026-07-18",
          label: "Sat",
          tasks: [
            {
              id: "tm1",
              status: tomorrowPending ? "pending" : "done",
              hub_id: "hub-tm",
              task_type: "practice",
            },
          ],
        },
        {
          date: "2026-07-19",
          label: "Sun",
          tasks: [
            {
              id: "d2",
              status: "pending",
              hub_id: "hub-d2",
              task_type: "practice",
            },
          ],
        },
      ],
    },
  ];
}

test("isDayAccessible blocks future when today incomplete", () => {
  const weeks = makeWeeks({ yesterdayDone: true, todayDone: false });
  assert.equal(isDayAccessible("2026-07-18", TODAY, EXAM, weeks), false);
});

test("isDayAccessible blocks tomorrow when past day incomplete even if today done", () => {
  const weeks = makeWeeks({ yesterdayDone: false, todayDone: true });
  assert.equal(isDayAccessible("2026-07-18", TODAY, EXAM, weeks), false);
});

test("isDayAccessible unlocks tomorrow when all prior + today done", () => {
  const weeks = makeWeeks({ yesterdayDone: true, todayDone: true });
  assert.equal(isDayAccessible("2026-07-18", TODAY, EXAM, weeks), true);
});

test("isDayAccessible keeps day+2 locked even when tomorrow unlocked", () => {
  const weeks = makeWeeks({ yesterdayDone: true, todayDone: true });
  assert.equal(isDayAccessible("2026-07-19", TODAY, EXAM, weeks), false);
});

test("isDayAccessible blocks post-exam days", () => {
  const weeks = makeWeeks({ yesterdayDone: true, todayDone: true });
  assert.equal(isDayAccessible("2026-07-16", TODAY, "2026-07-10", weeks), false);
});

test("dayStatus marks locked future and ahead when unlocked", () => {
  const lockedWeeks = makeWeeks({ yesterdayDone: true, todayDone: false });
  assert.equal(
    dayStatus(
      { date: "2026-07-18", tasks: [{ status: "pending" }] },
      TODAY,
      EXAM,
      lockedWeeks,
    ),
    "locked",
  );

  const openWeeks = makeWeeks({ yesterdayDone: true, todayDone: true });
  assert.equal(
    dayStatus(
      { date: "2026-07-18", tasks: [{ status: "pending" }] },
      TODAY,
      EXAM,
      openWeeks,
    ),
    "ahead",
  );
});

test("getNextAheadTarget null when backlog; returns tomorrow task when clear", () => {
  const backlog = makeWeeks({ yesterdayDone: false, todayDone: true });
  assert.equal(getNextAheadTarget(backlog, TODAY, EXAM), null);

  const clear = makeWeeks({ yesterdayDone: true, todayDone: true });
  const target = getNextAheadTarget(clear, TODAY, EXAM);
  assert.ok(target);
  assert.equal(target.date, "2026-07-18");
  assert.equal(target.task.id, "tm1");
});

test("countMissedDays finds incomplete past days only", () => {
  const weeks = makeWeeks({ yesterdayDone: false, todayDone: false });
  const missed = countMissedDays(weeks, TODAY, EXAM);
  assert.equal(missed.length, 1);
  assert.equal(missed[0].date, "2026-07-16");
  assert.equal(missed[0].incompleteCount, 1);
});

test("getOldestCatchUpTarget skips speaking submit when practice is done", () => {
  const weeks = [
    {
      days: [
        {
          date: "2026-07-15",
          label: "Wed",
          tasks: [
            {
              id: "sp-practice",
              status: "done",
              hub_id: "hub-speak",
              task_type: "practice",
              module: "speaking",
              href: "/p/aaaaaaa1",
            },
            {
              id: "sp-submit",
              status: "pending",
              hub_id: "hub-speak",
              task_type: "submit",
              module: "speaking",
              href: "/p/aaaaaaa2",
            },
          ],
        },
        {
          date: "2026-07-16",
          label: "Thu",
          tasks: [
            {
              id: "li-practice",
              status: "pending",
              hub_id: "hub-listen",
              task_type: "practice",
              module: "listening",
              href: "/p/bbbbbbb1",
            },
          ],
        },
        {
          date: TODAY,
          label: "Fri",
          tasks: [{ id: "t", status: "done", hub_id: "h", task_type: "practice", module: "listening" }],
        },
      ],
    },
  ];
  const target = getOldestCatchUpTarget(weeks, TODAY, EXAM);
  assert.ok(target);
  assert.equal(target.date, "2026-07-16");
  assert.equal(target.task.id, "li-practice");
});

test("getOldestCatchUpTarget skips unavailable tasks and advances to next day", () => {
  const weeks = [
    {
      days: [
        {
          date: "2026-07-15",
          label: "Wed",
          tasks: [
            {
              id: "old-unavail",
              status: "pending",
              hub_id: null,
              task_type: "practice",
              module: "writing",
              href: "/study-plan?date=2026-07-15&skill=writing&unavailable=1",
            },
          ],
        },
        {
          date: "2026-07-16",
          label: "Thu",
          tasks: [
            {
              id: "y-ok",
              status: "pending",
              hub_id: "hub-y",
              task_type: "practice",
              module: "listening",
              href: "/practice/listening/hub-y",
            },
          ],
        },
        {
          date: TODAY,
          label: "Fri",
          tasks: [
            {
              id: "t1",
              status: "done",
              hub_id: "hub-t",
              task_type: "practice",
            },
          ],
        },
      ],
    },
  ];
  const target = getOldestCatchUpTarget(weeks, TODAY, EXAM);
  assert.ok(target);
  assert.equal(target.date, "2026-07-16");
  assert.equal(target.task.id, "y-ok");
  assert.equal(target.missed.length, 2);
});

test("getOldestCatchUpTarget null when all missed tasks unavailable", () => {
  const weeks = [
    {
      days: [
        {
          date: "2026-07-16",
          label: "Thu",
          tasks: [
            {
              id: "y-bad",
              status: "pending",
              hub_id: null,
              task_type: "practice",
              href: "/study-plan?skill=writing&unavailable=1",
            },
          ],
        },
        {
          date: TODAY,
          label: "Fri",
          tasks: [
            {
              id: "t1",
              status: "done",
              hub_id: "hub-t",
              task_type: "practice",
            },
          ],
        },
      ],
    },
  ];
  assert.equal(getOldestCatchUpTarget(weeks, TODAY, EXAM), null);
});

test("getNextAheadTarget skips unavailable tomorrow task", () => {
  const weeks = makeWeeks({ yesterdayDone: true, todayDone: true });
  weeks[0].days[2].tasks[0].hub_id = null;
  weeks[0].days[2].tasks[0].href =
    "/study-plan?date=2026-07-18&skill=listening&unavailable=1";
  assert.equal(getNextAheadTarget(weeks, TODAY, EXAM), null);
});

test("studyPlanDayHref builds Full plan deep link", () => {
  assert.equal(
    studyPlanDayHref("2026-07-16", { skill: "writing", unavailable: true }),
    "/study-plan?date=2026-07-16&skill=writing&unavailable=1",
  );
});
