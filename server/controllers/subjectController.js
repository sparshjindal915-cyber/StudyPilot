import { z } from 'zod';
import Subject, { serializeSubject } from '../models/Subject.js';
import Task from '../models/Task.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { escapeRegex } from '../utils/escapeRegex.js';

const fields = {
  name: z.string().trim().min(1, 'Subject name is required').max(100),
  courseCode: z.string().trim().max(30).optional(),
  semester: z.string().trim().max(30).optional(),
  description: z.string().trim().max(1000).optional(),
};

export const createSubjectSchema = z.object(fields);
export const updateSubjectSchema = z
  .object(fields)
  .partial()
  .refine((d) => Object.keys(d).length > 0, 'Provide at least one field to update');

async function assertUniqueName(userId, name, excludeId) {
  const filter = { userId, name: new RegExp(`^${escapeRegex(name)}$`, 'i') };
  if (excludeId) filter._id = { $ne: excludeId };
  if (await Subject.exists(filter)) {
    throw new ApiError(409, 'Validation failed', [
      { field: 'name', message: 'You already have a subject with this name' },
    ]);
  }
}

async function countsFor(userId, subjectId) {
  const match = { userId };
  if (subjectId) match.subjectId = subjectId;
  const rows = await Task.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$subjectId',
        total: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
      },
    },
  ]);
  return new Map(rows.map((r) => [String(r._id), r]));
}

async function findOwned(req) {
  const subject = await Subject.findOne({ _id: req.params.id, userId: req.user._id });
  if (!subject) throw new ApiError(404, 'Subject not found');
  return subject;
}

export const listSubjects = asyncHandler(async (req, res) => {
  const [subjects, counts] = await Promise.all([
    Subject.find({ userId: req.user._id }).sort({ name: 1 }),
    countsFor(req.user._id),
  ]);
  res.json({ subjects: subjects.map((s) => serializeSubject(s, counts.get(String(s._id)))) });
});

export const createSubject = asyncHandler(async (req, res) => {
  await assertUniqueName(req.user._id, req.body.name);
  const subject = await Subject.create({ ...req.body, userId: req.user._id });
  res.status(201).json({ subject: serializeSubject(subject) });
});

export const getSubject = asyncHandler(async (req, res) => {
  const subject = await findOwned(req);
  const counts = await countsFor(req.user._id, subject._id);
  res.json({ subject: serializeSubject(subject, counts.get(String(subject._id))) });
});

export const updateSubject = asyncHandler(async (req, res) => {
  const subject = await findOwned(req);
  if (req.body.name) await assertUniqueName(req.user._id, req.body.name, subject._id);
  Object.assign(subject, req.body);
  await subject.save();
  const counts = await countsFor(req.user._id, subject._id);
  res.json({ subject: serializeSubject(subject, counts.get(String(subject._id))) });
});

export const deleteSubject = asyncHandler(async (req, res) => {
  const subject = await findOwned(req);
  const linked = await Task.countDocuments({ userId: req.user._id, subjectId: subject._id });
  if (linked > 0) {
    throw new ApiError(
      409,
      `This subject still has ${linked} task${linked === 1 ? '' : 's'}. Reassign or delete them first.`
    );
  }
  await subject.deleteOne();
  res.json({ message: 'Subject deleted' });
});
