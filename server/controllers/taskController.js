import { z } from 'zod';
import Task, { TASK_TYPES, PRIORITIES, STATUSES } from '../models/Task.js';
import Subject from '../models/Subject.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { escapeRegex } from '../utils/escapeRegex.js';
import { objectId } from '../utils/schemas.js';
import { isOverdue } from '../services/metrics.js';

const fields = {
  title: z.string().trim().min(1, 'Title is required').max(120),
  description: z.string().trim().max(2000),
  subjectId: objectId,
  type: z.enum(TASK_TYPES),
  deadline: z.string().datetime({ offset: true, message: 'Invalid deadline' }).nullable(),
  priority: z.enum(PRIORITIES),
  status: z.enum(STATUSES),
  estimatedMinutes: z
    .number({ invalid_type_error: 'Estimate must be a number' })
    .int('Estimate must be a whole number of minutes')
    .min(1)
    .max(10080)
    .nullable(),
};

export const createTaskSchema = z.object({
  title: fields.title,
  subjectId: fields.subjectId,
  description: fields.description.optional(),
  type: fields.type.optional(),
  deadline: fields.deadline.optional(),
  priority: fields.priority.optional(),
  status: fields.status.optional(),
  estimatedMinutes: fields.estimatedMinutes.optional(),
});

export const updateTaskSchema = z
  .object(fields)
  .partial()
  .refine((d) => Object.keys(d).length > 0, 'Provide at least one field to update');

export const listQuerySchema = z.object({
  status: fields.status.optional(),
  priority: fields.priority.optional(),
  type: fields.type.optional(),
  subjectId: objectId.optional(),
  search: z.string().trim().max(100).optional(),
  overdue: z.enum(['true', 'false']).optional(),
  from: z.string().datetime({ offset: true }).optional(),
  to: z.string().datetime({ offset: true }).optional(),
  sort: z
    .enum(['deadline', '-deadline', 'priority', '-priority', 'createdAt', '-createdAt', 'title'])
    .default('deadline'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});

const PRIORITY_RANK = { low: 1, medium: 2, high: 3 };

export function serializeTask(t, now = new Date()) {
  const populated = t.subjectId && t.subjectId.name;
  const subject = populated
    ? { id: String(t.subjectId._id), name: t.subjectId.name, courseCode: t.subjectId.courseCode }
    : null;
  return {
    id: String(t._id),
    title: t.title,
    description: t.description,
    subjectId: subject ? subject.id : String(t.subjectId),
    subject,
    type: t.type,
    deadline: t.deadline,
    priority: t.priority,
    status: t.status,
    estimatedMinutes: t.estimatedMinutes,
    completedAt: t.completedAt,
    isOverdue: isOverdue(t, now),
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  };
}

async function assertSubjectOwned(subjectId, userId) {
  const owned = await Subject.exists({ _id: subjectId, userId });
  if (!owned) {
    throw new ApiError(400, 'Validation failed', [
      { field: 'subjectId', message: 'Subject not found' },
    ]);
  }
}

async function findOwned(req) {
  const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
  if (!task) throw new ApiError(404, 'Task not found');
  return task;
}

const populateSubject = (docOrQuery) => docOrQuery.populate('subjectId', 'name courseCode');

function comparator(sort) {
  const desc = sort.startsWith('-');
  const key = desc ? sort.slice(1) : sort;
  const dir = desc ? -1 : 1;
  return (a, b) => {
    if (key === 'deadline') {
      // Tasks without a deadline always go last.
      if (!a.deadline && !b.deadline) return 0;
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return (new Date(a.deadline) - new Date(b.deadline)) * dir;
    }
    if (key === 'priority') return (PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]) * dir;
    if (key === 'title') return a.title.localeCompare(b.title);
    return (new Date(a.createdAt) - new Date(b.createdAt)) * dir;
  };
}

export const listTasks = asyncHandler(async (req, res) => {
  const q = req.validQuery;
  const now = new Date();
  const filter = { userId: req.user._id };

  if (q.status) filter.status = q.status;
  if (q.priority) filter.priority = q.priority;
  if (q.type) filter.type = q.type;
  if (q.subjectId) filter.subjectId = q.subjectId;
  if (q.search) {
    const rx = new RegExp(escapeRegex(q.search), 'i');
    filter.$or = [{ title: rx }, { description: rx }];
  }

  const deadline = {};
  if (q.overdue === 'true') {
    deadline.$lt = now;
    if (q.status === 'completed') filter._id = { $in: [] }; // completed tasks are never overdue
    else if (!q.status) filter.status = { $ne: 'completed' };
  }
  if (q.from) deadline.$gte = new Date(q.from);
  if (q.to) deadline.$lt = new Date(q.to);
  if (Object.keys(deadline).length) filter.deadline = deadline;

  const tasks = await populateSubject(Task.find(filter));
  tasks.sort(comparator(q.sort));

  const start = (q.page - 1) * q.limit;
  res.json({
    tasks: tasks.slice(start, start + q.limit).map((t) => serializeTask(t, now)),
    pagination: { page: q.page, limit: q.limit, total: tasks.length },
  });
});

export const createTask = asyncHandler(async (req, res) => {
  const data = req.body;
  await assertSubjectOwned(data.subjectId, req.user._id);

  const task = new Task({
    ...data,
    deadline: data.deadline ? new Date(data.deadline) : null,
    userId: req.user._id,
  });
  if (task.status === 'completed') task.completedAt = new Date();
  await task.save();
  await populateSubject(task);
  res.status(201).json({ task: serializeTask(task) });
});

export const getTask = asyncHandler(async (req, res) => {
  const task = await populateSubject(
    Task.findOne({ _id: req.params.id, userId: req.user._id })
  );
  if (!task) throw new ApiError(404, 'Task not found');
  res.json({ task: serializeTask(task) });
});

export const updateTask = asyncHandler(async (req, res) => {
  const task = await findOwned(req);
  const data = req.body;

  if (data.subjectId) await assertSubjectOwned(data.subjectId, req.user._id);

  for (const key of ['title', 'description', 'subjectId', 'type', 'priority', 'estimatedMinutes']) {
    if (key in data) task[key] = data[key];
  }
  if ('deadline' in data) task.deadline = data.deadline ? new Date(data.deadline) : null;

  if (data.status && data.status !== task.status) {
    task.status = data.status;
    task.completedAt = data.status === 'completed' ? new Date() : null;
  }

  await task.save();
  await populateSubject(task);
  res.json({ task: serializeTask(task) });
});

export const deleteTask = asyncHandler(async (req, res) => {
  const task = await findOwned(req);
  await task.deleteOne();
  res.json({ message: 'Task deleted' });
});
