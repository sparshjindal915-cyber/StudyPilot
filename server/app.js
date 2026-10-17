import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.js';
import subjectRoutes from './routes/subjects.js';
import taskRoutes from './routes/tasks.js';
import dashboardRoutes from './routes/dashboard.js';
import { notFound, errorHandler } from './middleware/error.js';

const app = express();

app.set('trust proxy', 1);
app.use(helmet());
app.use(
  cors({
    origin: (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map((s) => s.trim()),
    credentials: true,
  })
);
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    time: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
