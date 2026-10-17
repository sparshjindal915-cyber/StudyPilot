export const TASK_TYPES = [
  { value: 'assignment', label: 'Assignment' },
  { value: 'exam', label: 'Exam' },
  { value: 'study_session', label: 'Study session' },
  { value: 'lab', label: 'Lab' },
  { value: 'other', label: 'Other' },
];

export const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

export const STATUSES = [
  { value: 'todo', label: 'To do' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
];

export const labelOf = (list, value) => list.find((i) => i.value === value)?.label ?? value;

export const SORT_OPTIONS = [
  { value: 'deadline', label: 'Deadline (soonest)' },
  { value: '-deadline', label: 'Deadline (latest)' },
  { value: '-priority', label: 'Priority (high first)' },
  { value: 'priority', label: 'Priority (low first)' },
  { value: '-createdAt', label: 'Newest' },
  { value: 'title', label: 'Title (A–Z)' },
];
