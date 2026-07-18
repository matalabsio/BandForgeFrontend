/**
 * Node test runner for study-plan-calendar (keep in sync with study-plan-calendar.ts).
 */
import assert from "node:assert/strict";
import test from "node:test";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function isDayAccessible(date, today, examDate) {
  if (date > today) return false;
  if (examDate && date > examDate) return false;
  return true;
}

function isDayAfterExam(date, examDate) {
  return Boolean(examDate && date > examDate);
}

function countableTasks(day) {
  return day.tasks.filter((t) => t.status !== "skipped");
}

function dayStatus(day, today, examDate) {
  if (isDayAfterExam(day.date, examDate)) return "locked";
  if (!isDayAccessible(day.date, today, examDate)) return "locked";
  if (day.date === today) {
    const tasks = countableTasks(day);
    if (tasks.length > 0 && tasks.every((t) => t.status === "done")) {
      return "completed";
    }
    if (tasks.some((t) => t.status === "done")) return "in_progress";
    return "today";
  }
  const tasks = countableTasks(day);
  if (tasks.length === 0) return "open";
  if (tasks.every((t) => t.status === "done")) return "completed";
  if (tasks.some((t) => t.status === "done")) return "in_progress";
  return "open";
}

function countMissedDays(weeks, today, examDate) {
  const missed = [];
  for (const week of weeks) {
    for (const day of week.days) {
      if (day.date >= today) continue;
      if (!isDayAccessible(day.date, today, examDate)) continue;
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

test("isDayAccessible blocks future and post-exam days", () => {
  const today = "2026-07-17";
  assert.equal(isDayAccessible("2026-07-18", today, "2026-08-01"), false);
  assert.equal(isDayAccessible("2026-07-16", today, "2026-07-10"), false);
  assert.equal(isDayAccessible("2026-07-16", today, "2026-08-01"), true);
});

test("dayStatus marks future days locked", () => {
  const today = "2026-07-17";
  const day = {
    date: "2026-07-20",
    tasks: [{ status: "pending" }],
  };
  assert.equal(dayStatus(day, today, "2026-08-01"), "locked");
});

test("countMissedDays finds incomplete past days only", () => {
  const today = "2026-07-17";
  const weeks = [
    {
      days: [
        {
          date: "2026-07-15",
          tasks: [{ status: "pending" }, { status: "done" }],
        },
        {
          date: "2026-07-17",
          tasks: [{ status: "pending" }],
        },
        {
          date: "2026-07-20",
          tasks: [{ status: "pending" }],
        },
      ],
    },
  ];
  const missed = countMissedDays(weeks, today, "2026-08-01");
  assert.equal(missed.length, 1);
  assert.equal(missed[0].date, "2026-07-15");
  assert.equal(missed[0].incompleteCount, 1);
});
