const DAY_MS = 24 * 60 * 60 * 1000;

export const isCompleted = (t) => t.status === 'completed';

// Overdue = has a deadline in the past AND is not completed.
export const isOverdue = (t, now = new Date()) =>
  !isCompleted(t) && !!t.deadline && new Date(t.deadline) < now;

// Due soon = not completed, deadline between now and now + N days.
export const isDueWithinDays = (t, days = 7, now = new Date()) => {
  if (isCompleted(t) || !t.deadline) return false;
  const d = new Date(t.deadline);
  return d >= now && d <= new Date(now.getTime() + days * DAY_MS);
};

const brief = (t, subjectNames) => ({
  id: String(t._id ?? t.id),
  title: t.title,
  deadline: t.deadline,
  priority: t.priority,
  status: t.status,
  type: t.type,
  subjectId: String(t.subjectId),
  subjectName: subjectNames.get(String(t.subjectId)) || 'Unknown',
});

const byDeadline = (a, b) => new Date(a.deadline) - new Date(b.deadline);

export function computeSummary(tasks, subjects, now = new Date()) {
  const subjectNames = new Map(subjects.map((s) => [String(s._id ?? s.id), s.name]));

  const total = tasks.length;
  const completed = tasks.filter(isCompleted).length;
  const pending = total - completed;
  const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
  const overdue = tasks.filter((t) => isOverdue(t, now));
  const dueNext7Days = tasks.filter((t) => isDueWithinDays(t, 7, now));
  const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);

  const bySubject = subjects.map((s) => {
    const id = String(s._id ?? s.id);
    const mine = tasks.filter((t) => String(t.subjectId) === id);
    const done = mine.filter(isCompleted).length;
    return {
      subjectId: id,
      name: s.name,
      total: mine.length,
      completed: done,
      pending: mine.length - done,
      overdue: mine.filter((t) => isOverdue(t, now)).length,
    };
  });

  const upcoming = tasks
    .filter((t) => !isCompleted(t) && t.deadline && new Date(t.deadline) >= now)
    .sort(byDeadline)
    .slice(0, 6)
    .map((t) => brief(t, subjectNames));

  const overdueTasks = [...overdue]
    .sort(byDeadline)
    .slice(0, 6)
    .map((t) => brief(t, subjectNames));

  return {
    totals: {
      total,
      pending,
      inProgress,
      completed,
      overdue: overdue.length,
      dueNext7Days: dueNext7Days.length,
      completionRate,
    },
    upcoming,
    overdueTasks,
    bySubject,
  };
}
