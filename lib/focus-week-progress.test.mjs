/**
 * Node test runner for focus week progress (keep in sync with focus-week-progress.ts).
 */
import assert from "node:assert/strict";
import test from "node:test";

const WEEKDAY_LETTERS = ["M", "T", "W", "T", "F", "S", "S"];

function localIsoToday(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function mondayWeekDates(todayIso) {
  const dt = new Date(`${todayIso}T12:00:00`);
  const day = dt.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  dt.setDate(dt.getDate() + mondayOffset);
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(dt);
    x.setDate(dt.getDate() + i);
    const y = x.getFullYear();
    const m = String(x.getMonth() + 1).padStart(2, "0");
    const dd = String(x.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`;
  });
}

function weekFocusBars(plan, focusSkillKeys, weeklyHubCompletions = [], todayIso = localIsoToday()) {
  const dates = mondayWeekDates(todayIso);
  const byDate = new Map();
  for (const week of plan?.weeks ?? []) {
    for (const day of week.days) {
      byDate.set(day.date, day.tasks ?? []);
    }
  }

  const skillFilter =
    focusSkillKeys.length > 0
      ? new Set(focusSkillKeys.map((k) => k.toLowerCase()))
      : null;

  const planDoneHubIds = new Set();
  for (const week of plan?.weeks ?? []) {
    for (const day of week.days) {
      for (const task of day.tasks ?? []) {
        if (task.status === "skipped") continue;
        if (skillFilter && !skillFilter.has((task.module || "").toLowerCase())) continue;
        if (task.status === "done" && task.hub_id) planDoneHubIds.add(task.hub_id);
      }
    }
  }

  const hubCompletions = weeklyHubCompletions.filter((row) => {
    if (!skillFilter) return true;
    return skillFilter.has((row.skill || "").toLowerCase());
  });

  let planWeekDone = 0;
  let planWeekTotal = 0;
  const hubsCreditedThisWeek = new Set();

  const bars = dates.map((date, i) => {
    const tasks = (byDate.get(date) ?? []).filter((task) => {
      if (task.status === "skipped") return false;
      if (!skillFilter) return true;
      return skillFilter.has((task.module || "").toLowerCase());
    });
    const planDone = tasks.filter((task) => task.status === "done").length;
    const planTotal = tasks.length;

    const dayHubIds = new Set();
    for (const row of hubCompletions) {
      if (row.date === date && !planDoneHubIds.has(row.hub_id)) {
        dayHubIds.add(row.hub_id);
      }
    }
    const hubDone = dayHubIds.size;
    const dayDone =
      planTotal > 0 ? Math.min(planDone + hubDone, planTotal) : hubDone > 0 ? hubDone : 0;

    if (date <= todayIso) {
      planWeekDone += planDone;
      planWeekTotal += planTotal;
      for (const hubId of dayHubIds) hubsCreditedThisWeek.add(hubId);
    }

    let pct = 0;
    if (planTotal > 0) pct = Math.min(100, Math.round((dayDone / planTotal) * 100));
    else if (hubDone > 0) pct = 100;

    return { letter: WEEKDAY_LETTERS[i], pct, isToday: date === todayIso };
  });

  let weekDone = planWeekDone + hubsCreditedThisWeek.size;
  let weekTotal = planWeekTotal > 0 ? planWeekTotal : hubsCreditedThisWeek.size;
  weekDone = weekTotal > 0 ? Math.min(weekDone, weekTotal) : weekDone;

  return {
    bars,
    done: weekDone,
    total: weekTotal,
    pct: weekTotal > 0 ? Math.min(100, Math.round((weekDone / weekTotal) * 100)) : 0,
  };
}

const todayIso = localIsoToday();
const monday = mondayWeekDates(todayIso)[0];

const basePlan = {
  weekly_focus: "Focus: Writing",
  weeks: [
    {
      id: "w1",
      label: "Week 1",
      focus: "Writing",
      days: [
        {
          date: monday,
          label: "Mon",
          tasks: [
            {
              id: "t1",
              title: "Writing practice",
              module: "writing",
              task_type: "practice",
              hub_id: "hub-a",
              status: "pending",
            },
          ],
        },
        {
          date: todayIso,
          label: "Today",
          tasks: [
            {
              id: "t2",
              title: "Writing submit",
              module: "writing",
              task_type: "submit",
              hub_id: "hub-b",
              status: "pending",
            },
          ],
        },
      ],
    },
  ],
};

test("weekFocusBars counts hub completion when plan tasks are still pending", () => {
  const result = weekFocusBars(
    basePlan,
    ["writing"],
    [{ date: todayIso, skill: "writing", hub_id: "hub-done" }],
    todayIso,
  );
  assert.equal(result.done, 1);
  assert.equal(result.total, 2);
  assert.equal(result.pct, 50);
});

test("weekFocusBars does not double-count hub already marked done on plan", () => {
  const plan = {
    ...basePlan,
    weeks: [
      {
        ...basePlan.weeks[0],
        days: basePlan.weeks[0].days.map((day) => ({
          ...day,
          tasks: day.tasks.map((task) =>
            task.id === "t1" ? { ...task, status: "done" } : task,
          ),
        })),
      },
    ],
  };
  const result = weekFocusBars(
    plan,
    ["writing"],
    [{ date: monday, skill: "writing", hub_id: "hub-a" }],
    todayIso,
  );
  assert.equal(result.done, 1);
  assert.equal(result.total, 2);
});

test("weekFocusBars sets day column pct for partial completion", () => {
  const result = weekFocusBars(
    {
      ...basePlan,
      weeks: [
        {
          ...basePlan.weeks[0],
          days: [
            {
              date: todayIso,
              label: "Today",
              tasks: [
                {
                  id: "t1",
                  title: "Writing practice",
                  module: "writing",
                  task_type: "practice",
                  hub_id: "hub-a",
                  status: "done",
                },
                {
                  id: "t2",
                  title: "Writing submit",
                  module: "writing",
                  task_type: "submit",
                  hub_id: "hub-b",
                  status: "pending",
                },
              ],
            },
          ],
        },
      ],
    },
    ["writing"],
    [],
    todayIso,
  );
  const todayBar = result.bars.find((bar) => bar.isToday);
  assert.ok(todayBar);
  assert.equal(todayBar.pct, 50);
});
