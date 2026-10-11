import type { Request, Response } from 'express';
import { checkHealth } from '../services/health.service.js';

export async function getHealth(_request: Request, response: Response): Promise<void> {
  try {
    response.json(await checkHealth());
  } catch (error) {
    console.error('Health check failed:', error);
    response.status(503).json({ status: 'unavailable', database: 'disconnected' });
  }
}
