import { Router } from 'express';
import { AcademicController } from '../controllers/academic.controller.js';

export const academicRouter = Router();

academicRouter.get('/universities', AcademicController.getUniversities);
academicRouter.get('/majors', AcademicController.getMajors);
