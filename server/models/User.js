import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export function serializeUser(u) {
  return { id: String(u._id), name: u.name, email: u.email, createdAt: u.createdAt };
}

export default mongoose.model('User', userSchema);
