import { Role } from '@prisma/client';

export interface TokenPayload {
  userId: string;
  email: string;
  role: Role;
}

export interface UserSummary {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  profileCompleted: boolean;
}
