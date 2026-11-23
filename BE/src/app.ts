import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { errorHandler } from './middlewares/error.middleware.js';
import { academicRouter } from './routes/academic.routes.js';
import { authRouter } from './routes/auth.routes.js';
import { healthRouter } from './routes/health.routes.js';
import { profileRouter } from './routes/profile.routes.js';
import { userRouter } from './routes/user.routes.js';

export const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

// Routes
app.use(healthRouter);
app.use(authRouter);
app.use(profileRouter);
app.use(academicRouter);
app.use(userRouter);

// Centralized error handler
app.use(errorHandler);
