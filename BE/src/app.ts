import cors from 'cors';
import express from 'express';
import { healthRouter } from './routes/health.routes.js';

export const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173' }));
app.use(express.json());
app.use(healthRouter);
