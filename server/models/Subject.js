import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    courseCode: { type: String, trim: true, maxlength: 30, default: '' },
    semester: { type: String, trim: true, maxlength: 30, default: '' },
    description: { type: String, trim: true, maxlength: 1000, default: '' },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

export function serializeSubject(s, counts = {}) {
  return {
    id: String(s._id),
    name: s.name,
    courseCode: s.courseCode,
    semester: s.semester,
    description: s.description,
    createdAt: s.createdAt,
    taskCount: counts.total || 0,
    completedCount: counts.completed || 0,
  };
}

export default mongoose.model('Subject', subjectSchema);
