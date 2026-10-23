import { z } from 'zod';

export const universitySchema = z.object({
  id: z.string(),
  name: z.string(),
});
export type University = z.infer<typeof universitySchema>;

export const universityListSchema = z.array(universitySchema);

export const majorSchema = z.object({
  id: z.string(),
  name: z.string(),
});
export type Major = z.infer<typeof majorSchema>;

export const majorListSchema = z.array(majorSchema);
