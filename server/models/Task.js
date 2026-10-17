import mongoose from 'mongoose';

export const TASK_TYPES = ['assignment', 'exam', 'study_session', 'lab', 'other'];
export const PRIORITIES = ['low', 'medium', 'high'];
export const STATUSES = ['todo', 'in_progress', 'completed'];

const taskSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 2000, default: '' },
    type: { type: String, enum: TASK_TYPES, default: 'assignment' },
    // Deadline and completion are independent: a late task is NOT completed.
    deadline: { type: Date, default: null },
    priority: { type: String, enum: PRIORITIES, default: 'medium' },
    status: { type: String, enum: STATUSES, default: 'todo' },
    estimatedMinutes: { type: Number, min: 1, max: 10080, default: null },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

taskSchema.index({ userId: 1, deadline: 1 });

export default mongoose.model('Task', taskSchema);
