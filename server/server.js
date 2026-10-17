import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app.js';

const PORT = process.env.PORT || 5000;

if (!process.env.MONGO_URI) {
  console.error('Missing MONGO_URI in environment. Copy .env.example to .env and fill it in.');
  process.exit(1);
}
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16) {
  console.error('JWT_SECRET must be set to a random string of at least 16 characters.');
  process.exit(1);
}

try {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected');
  app.listen(PORT, () => console.log(`StudyPilot API running on port ${PORT}`));
} catch (err) {
  console.error('Failed to start server:', err.message);
  process.exit(1);
}
