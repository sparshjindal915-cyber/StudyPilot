import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isOverdue, isDueWithinDays, computeSummary } from '../services/metrics.js';

const now = new Date('2026-10-17T12:00:00Z');
const hours = (h) => new Date(now.getTime() + h * 3600 * 1000).toISOString();

test('a past deadline makes an open task overdue', () => {
  assert.equal(isOverdue({ status: 'todo', deadline: hours(-1) }, now), true);
  assert.equal(isOverdue({ status: 'in_progress', deadline: hours(-48) }, now), true);
});

test('completed tasks are never overdue, even with a past deadline', () => {
  assert.equal(isOverdue({ status: 'completed', deadline: hours(-72) }, now), false);
});

test('tasks without a deadline are never overdue or due soon', () => {
  assert.equal(isOverdue({ status: 'todo', deadline: null }, now), false);
  assert.equal(isDueWithinDays({ status: 'todo', deadline: null }, 7, now), false);
});

test('due-within-7-days covers the boundary correctly', () => {
  assert.equal(isDueWithinDays({ status: 'todo', deadline: hours(1) }, 7, now), true);
  assert.equal(isDueWithinDays({ status: 'todo', deadline: hours(7 * 24) }, 7, now), true);
  assert.equal(isDueWithinDays({ status: 'todo', deadline: hours(7 * 24 + 1) }, 7, now), false);
  assert.equal(isDueWithinDays({ status: 'todo', deadline: hours(-1) }, 7, now), false);
  assert.equal(isDueWithinDays({ status: 'completed', deadline: hours(5) }, 7, now), false);
});

test('computeSummary aggregates totals and per-subject workload', () => {
  const subjects = [
    { _id: 's1', name: 'Operating Systems' },
    { _id: 's2', name: 'DBMS' },
  ];
  const tasks = [
    { _id: 't1', subjectId: 's1', title: 'A', status: 'completed', deadline: hours(-10), priority: 'high', type: 'assignment' },
    { _id: 't2', subjectId: 's1', title: 'B', status: 'todo', deadline: hours(-5), priority: 'low', type: 'lab' },
    { _id: 't3', subjectId: 's1', title: 'C', status: 'in_progress', deadline: hours(24), priority: 'medium', type: 'exam' },
    { _id: 't4', subjectId: 's2', title: 'D', status: 'todo', deadline: null, priority: 'low', type: 'other' },
  ];
  const s = computeSummary(tasks, subjects, now);

  assert.deepEqual(s.totals, {
    total: 4,
    pending: 3,
    inProgress: 1,
    completed: 1,
    overdue: 1,
    dueNext7Days: 1,
    completionRate: 25,
  });
  assert.equal(s.upcoming.length, 1);
  assert.equal(s.upcoming[0].title, 'C');
  assert.equal(s.overdueTasks[0].title, 'B');
  assert.deepEqual(s.bySubject.find((x) => x.name === 'Operating Systems'), {
    subjectId: 's1',
    name: 'Operating Systems',
    total: 3,
    completed: 1,
    pending: 2,
    overdue: 1,
  });
});

test('computeSummary handles a brand new account', () => {
  const s = computeSummary([], [], now);
  assert.equal(s.totals.total, 0);
  assert.equal(s.totals.completionRate, 0);
  assert.deepEqual(s.upcoming, []);
});
