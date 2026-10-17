import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Subject from '../models/Subject.js';
import Task from '../models/Task.js';

// Creates a demo account: demo@studypilot.dev / demo12345
await mongoose.connect(process.env.MONGO_URI);

const email = 'demo@studypilot.dev';
const existing = await User.findOne({ email });
if (existing) {
  await Task.deleteMany({ userId: existing._id });
  await Subject.deleteMany({ userId: existing._id });
  await existing.deleteOne();
}

const user = await User.create({
  name: 'Demo Student',
  email,
  passwordHash: await bcrypt.hash('demo12345', 12),
});

const names = [
  ['Operating Systems', 'CS301'],
  ['Database Systems', 'CS302'],
  ['Computer Networks', 'CS303'],
  ['Discrete Mathematics', 'MA201'],
];
const subjects = await Subject.insertMany(
  names.map(([name, courseCode]) => ({ userId: user._id, name, courseCode, semester: 'Sem 5' }))
);

const day = 24 * 3600 * 1000;
const at = (d) => new Date(Date.now() + d * day);
const [os, db, net, math] = subjects.map((s) => s._id);

const tasks = [
  { subjectId: os, title: 'Assignment 3: Process scheduling', type: 'assignment', deadline: at(2), priority: 'high', status: 'in_progress', estimatedMinutes: 180 },
  { subjectId: os, title: 'Mid-sem exam', type: 'exam', deadline: at(6), priority: 'high', status: 'todo' },
  { subjectId: os, title: 'Revise memory management', type: 'study_session', deadline: at(4), priority: 'medium', status: 'todo', estimatedMinutes: 90 },
  { subjectId: db, title: 'DBMS lab: normalization', type: 'lab', deadline: at(-2), priority: 'medium', status: 'todo' },
  { subjectId: db, title: 'ER diagram assignment', type: 'assignment', deadline: at(-5), priority: 'low', status: 'completed', completedAt: at(-6) },
  { subjectId: db, title: 'SQL practice set', type: 'study_session', deadline: at(1), priority: 'low', status: 'todo', estimatedMinutes: 60 },
  { subjectId: net, title: 'Subnetting worksheet', type: 'assignment', deadline: at(3), priority: 'medium', status: 'todo' },
  { subjectId: net, title: 'Read TCP congestion control chapter', type: 'study_session', priority: 'low', status: 'todo' },
  { subjectId: math, title: 'Graph theory problem set', type: 'assignment', deadline: at(5), priority: 'high', status: 'todo' },
  { subjectId: math, title: 'Quiz 2', type: 'exam', deadline: at(-1), priority: 'medium', status: 'completed', completedAt: at(-1) },
];
await Task.insertMany(tasks.map((t) => ({ ...t, userId: user._id })));

console.log('Seeded demo data. Log in with demo@studypilot.dev / demo12345');
await mongoose.disconnect();
