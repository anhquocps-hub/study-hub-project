import { Request, Response, NextFunction } from 'express';
import { AcademicService } from '../services/academic.service.js';

export class AcademicController {
  static async getUniversities(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const universities = await AcademicService.getUniversities();
      res.status(200).json(universities);
    } catch (error) {
      next(error);
    }
  }

  static async getMajors(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const universityId = req.query.universityId ? String(req.query.universityId) : undefined;
      const majors = await AcademicService.getMajors(universityId);
      res.status(200).json(majors);
    } catch (error) {
      next(error);
    }
  }
}
