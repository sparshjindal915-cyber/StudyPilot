import Task from '../models/Task.js';
import Subject from '../models/Subject.js';
import asyncHandler from '../utils/asyncHandler.js';
import { computeSummary } from '../services/metrics.js';

export const getSummary = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const [tasks, subjects] = await Promise.all([
    Task.find({ userId }).lean(),
    Subject.find({ userId }).sort({ name: 1 }).lean(),
  ]);
  res.json(computeSummary(tasks, subjects, new Date()));
});
