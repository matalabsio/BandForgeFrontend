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
  const actionable = tasks.filter(
    (t) => t.status !== "skipped" && isContinueEligibleTask(t),
  );
  if (actionable.length === 0) return null;

  const current = currentTaskId
    ? actionable.find((t) => t.id === currentTaskId)
    : undefined;
  // Skip only the same step on this hub (id churn), not Practice→Submit siblings.
  const blockedHub = current?.hub_id ?? opts.skipHubId ?? null;
  const blockedType = current?.task_type ?? null;

  const isOpen = (row) => {
    if (row.status === "done") return false;
    if (row.id === currentTaskId) return false;
    if (
      blockedHub &&
      blockedType &&
      row.hub_id === blockedHub &&
      row.task_type === blockedType &&
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

test("speaking Practice done → next is Speaking Submit same hub", () => {
  const today = localDateKey();
  const practiceId = `t-${today}-speaking-practice-s1`;
  const submitId = `t-${today}-speaking-submit-s1`;
  const tasks = [
    {
      id: practiceId,
      module: "speaking",
      task_type: "practice",
      hub_id: "hub-s",
      status: "done",
      href: "/test/1/speaking?from=plan&task=practice",
    },
    {
      id: submitId,
      module: "speaking",
      task_type: "submit",
      hub_id: "hub-s",
      status: "pending",
      href: "/test/1/speaking?from=plan&task=submit",
    },
  ];
  const next = nextPendingPlanDayTask(tasks, practiceId);
  assert.ok(next);
  assert.equal(next.id, submitId);
  assert.equal(next.task_type, "submit");
});

test("speaking Submit done → next is other skill or null", () => {
  const today = localDateKey();
  const practiceId = `t-${today}-speaking-practice-s1`;
  const submitId = `t-${today}-speaking-submit-s1`;
  const readingId = `t-${today}-reading-practice-s2`;

  const onlySpeaking = [
    {
      id: practiceId,
      module: "speaking",
      task_type: "practice",
      hub_id: "hub-s",
      status: "done",
      href: "/test/1/speaking",
    },
    {
      id: submitId,
      module: "speaking",
      task_type: "submit",
      hub_id: "hub-s",
      status: "done",
      href: "/test/1/speaking",
    },
  ];
  assert.equal(nextPendingPlanDayTask(onlySpeaking, submitId), null);

  const withReading = [
    ...onlySpeaking,
    {
      id: readingId,
      module: "reading",
      task_type: "practice",
      hub_id: "hub-r",
      status: "pending",
      href: "/test/1/reading",
    },
  ];
  const next = nextPendingPlanDayTask(withReading, submitId);
  assert.ok(next);
  assert.equal(next.id, readingId);
});

test("writing Practice done → next is Writing Submit same hub", () => {
  const today = localDateKey();
  const practiceId = `t-${today}-writing-practice-s1`;
  const submitId = `t-${today}-writing-submit-s1`;
  const tasks = [
    {
      id: practiceId,
      module: "writing",
      task_type: "practice",
      hub_id: "hub-w",
      status: "done",
      href: "/test/writing/task/1?from=plan&task=practice",
    },
    {
      id: submitId,
      module: "writing",
      task_type: "submit",
      hub_id: "hub-w",
      status: "pending",
      href: "/test/writing/task/2?from=plan&task=submit",
    },
  ];
  const next = nextPendingPlanDayTask(tasks, practiceId);
  assert.ok(next);
  assert.equal(next.id, submitId);
  assert.equal(next.task_type, "submit");
});

test("listening Practice skips same-hub practice (id churn) and finds Reading", () => {
  const today = localDateKey();
  const listeningId = `t-${today}-listening-practice-s1`;
  const listeningChurn = `t-${today}-listening-practice-s1b`;
  const readingId = `t-${today}-reading-practice-s2`;
  const tasks = [
    {
      id: listeningId,
      module: "listening",
      task_type: "practice",
      hub_id: "hub-l",
      status: "done",
      href: "/test/1/listening",
    },
    {
      id: listeningChurn,
      module: "listening",
      task_type: "practice",
      hub_id: "hub-l",
      status: "pending",
      href: "/test/1/listening",
    },
    {
      id: readingId,
      module: "reading",
      task_type: "practice",
      hub_id: "hub-r",
      status: "pending",
      href: "/test/1/reading",
    },
  ];
  const next = nextPendingPlanDayTask(tasks, listeningId);
  assert.ok(next);
  assert.equal(next.id, readingId);
  assert.equal(next.module, "reading");
});
