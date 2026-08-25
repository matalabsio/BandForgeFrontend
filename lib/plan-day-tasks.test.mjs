/**
 * Node test runner for plan-day-tasks helpers (keep in sync with plan-day-tasks.ts).
 */
import assert from "node:assert/strict";
import test from "node:test";

function localDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function planDateFromTaskId(taskId) {
  if (!taskId) return null;
  const m = /^t-(\d{4}-\d{2}-\d{2})-/.exec(taskId);
  return m?.[1] ?? null;
}

function findPlanDay(weeks, date) {
  for (const week of weeks) {
    const found = week.days.find((d) => d.date === date);
    if (found) return found;
  }
  return null;
}

function tasksForPlanDate(profile, planDate, today = localDateKey()) {
  if (planDate === today) {
    return profile.todays_tasks ?? [];
  }
  const day = findPlanDay(profile.study_plan?.weeks ?? [], planDate);
  return day?.tasks ?? [];
}

function isPlanPracticeSkill(skill) {
  return (
    skill === "listening" ||
    skill === "reading" ||
    skill === "writing" ||
    skill === "speaking"
  );
}

function isContinueEligibleTask(row) {
  if (!isPlanPracticeSkill(row.module)) return false;
  const href = (row.href ?? "").trim();
  if (href.includes("/content-library")) return false;
  return true;
}

function nextPendingPlanDayTask(tasks, currentTaskId, opts = {}) {
  const preferExercise = opts.preferExercise !== false;
  const skipHubId = opts.skipHubId ?? null;
  const actionable = tasks.filter(
    (t) => t.status !== "skipped" && isContinueEligibleTask(t),
  );
  if (actionable.length === 0) return null;

  const current = currentTaskId
    ? actionable.find((t) => t.id === currentTaskId)
    : undefined;
  const blockedHub = skipHubId || current?.hub_id || null;

  const isOpen = (row) => {
    if (row.status === "done") return false;
    if (row.id === currentTaskId) return false;
    if (
      blockedHub &&
      row.hub_id === blockedHub &&
      (row.task_type === "practice" || row.task_type === "submit")
    ) {
      return false;
    }
    return true;
  };

  const idx = currentTaskId
    ? actionable.findIndex((t) => t.id === currentTaskId)
    : -1;
  const after = (idx >= 0 ? actionable.slice(idx + 1) : actionable).filter(
    isOpen,
  );
  const pool = after.length > 0 ? after : actionable.filter(isOpen);
  if (pool.length === 0) return null;

  if (preferExercise) {
    const exercise = pool.find(
      (t) => t.task_type === "practice" || t.task_type === "submit",
    );
    if (exercise) return exercise;
  }
  return pool[0] ?? null;
}

/**
 * Simulate ensurePlanDayTasksCached refresh: resolve planDate from taskId,
 * load that day's tasks (not always todays_tasks), mark current done.
 */
function refreshCacheForContinue(profile, currentTaskId, cachedPlanDate) {
  const today = localDateKey();
  const planDate =
    planDateFromTaskId(currentTaskId) ?? cachedPlanDate ?? today;
  const incoming = tasksForPlanDate(profile, planDate, today);
  return incoming.map((t) =>
    t.id === currentTaskId ? { ...t, status: "done" } : t,
  );
}

test("planDateFromTaskId parses t-YYYY-MM-DD-… ids", () => {
  assert.equal(
    planDateFromTaskId("t-2026-08-26-listening-practice-s1"),
    "2026-08-26",
  );
  assert.equal(
    planDateFromTaskId("t-2026-08-26-reading-watch-s2"),
    "2026-08-26",
  );
  assert.equal(planDateFromTaskId("legacy-no-date"), null);
  assert.equal(planDateFromTaskId(null), null);
});

function addCalendarDays(iso, days) {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + days);
  return localDateKey(d);
}

test("tasksForPlanDate uses todays_tasks only for calendar today", () => {
  const today = localDateKey();
  const tomorrow = addCalendarDays(today, 1);
  const profile = {
    todays_tasks: [
      {
        id: `t-${today}-listening-practice-s1`,
        module: "listening",
        task_type: "practice",
        hub_id: "hub-l",
        status: "done",
        href: "/practice/listening/hub-l/exercise",
      },
    ],
    study_plan: {
      weeks: [
        {
          id: "w1",
          label: "W1",
          focus: "",
          days: [
            {
              date: today,
              label: "Mon",
              tasks: [],
            },
            {
              date: tomorrow,
              label: "Tue",
              tasks: [
                {
                  id: `t-${tomorrow}-listening-practice-s1`,
                  module: "listening",
                  task_type: "practice",
                  hub_id: "hub-l-tmr",
                  status: "pending",
                  href: "/practice/listening/hub-l-tmr/exercise",
                },
                {
                  id: `t-${tomorrow}-reading-watch-s2`,
                  module: "reading",
                  task_type: "watch",
                  hub_id: "hub-r-tmr",
                  status: "pending",
                  href: "/practice/reading/hub-r-tmr",
                },
              ],
            },
          ],
        },
      ],
    },
  };

  const todayTasks = tasksForPlanDate(profile, today, today);
  assert.equal(todayTasks.length, 1);
  assert.equal(todayTasks[0].id, `t-${today}-listening-practice-s1`);

  const tomorrowTasks = tasksForPlanDate(profile, tomorrow, today);
  assert.equal(tomorrowTasks.length, 2);
  assert.equal(tomorrowTasks[0].module, "listening");
  assert.equal(tomorrowTasks[1].module, "reading");
});

test("tomorrow Continue finds reading after listening (not todays_tasks overwrite)", () => {
  const today = localDateKey();
  const tomorrow = addCalendarDays(today, 1);
  const listeningId = `t-${tomorrow}-listening-practice-s1`;
  const readingId = `t-${tomorrow}-reading-watch-s2`;

  const profile = {
    // Calendar today is fully done — old bug would overwrite with this only.
    todays_tasks: [
      {
        id: `t-${today}-writing-submit-s1`,
        module: "writing",
        task_type: "submit",
        hub_id: "hub-w",
        status: "done",
        href: "/practice/writing/hub-w/exercise",
      },
    ],
    study_plan: {
      weeks: [
        {
          id: "w1",
          label: "W1",
          focus: "",
          days: [
            {
              date: tomorrow,
              label: "Tue",
              tasks: [
                {
                  id: listeningId,
                  module: "listening",
                  task_type: "practice",
                  hub_id: "hub-l",
                  status: "pending",
                  href: "/practice/listening/hub-l/exercise",
                },
                {
                  id: readingId,
                  module: "reading",
                  task_type: "watch",
                  hub_id: "hub-r",
                  status: "pending",
                  href: "/practice/reading/hub-r",
                },
              ],
            },
          ],
        },
      ],
    },
  };

  // Bug path: always use todays_tasks → cannot find next tomorrow task.
  const buggy = (profile.todays_tasks ?? []).map((t) =>
    t.id === listeningId ? { ...t, status: "done" } : t,
  );
  assert.equal(
    nextPendingPlanDayTask(buggy, listeningId, { skipHubId: "hub-l" }),
    null,
  );

  // Fixed path: refresh for planDate from taskId.
  const fixed = refreshCacheForContinue(profile, listeningId, tomorrow);
  const next = nextPendingPlanDayTask(fixed, listeningId, {
    skipHubId: "hub-l",
  });
  assert.ok(next);
  assert.equal(next.id, readingId);
  assert.equal(next.module, "reading");
});

test("today Continue still finds next task from todays_tasks", () => {
  const today = localDateKey();
  const listeningId = `t-${today}-listening-practice-s1`;
  const readingId = `t-${today}-reading-practice-s2`;

  const profile = {
    todays_tasks: [
      {
        id: listeningId,
        module: "listening",
        task_type: "practice",
        hub_id: "hub-l",
        status: "pending",
        href: "/practice/listening/hub-l/exercise",
      },
      {
        id: readingId,
        module: "reading",
        task_type: "practice",
        hub_id: "hub-r",
        status: "pending",
        href: "/practice/reading/hub-r/exercise",
      },
    ],
    study_plan: { weeks: [] },
  };

  const refreshed = refreshCacheForContinue(profile, listeningId, today);
  const next = nextPendingPlanDayTask(refreshed, listeningId, {
    skipHubId: "hub-l",
  });
  assert.ok(next);
  assert.equal(next.id, readingId);
});
