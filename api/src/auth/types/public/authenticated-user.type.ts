import { UserRole } from '@/src/users/types';

export type AuthenticatedUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
};
