import { useAuthStore } from '../store/useAuthStore';
import { Role } from '../types';

export const checkRole = (allowedRoles: Role[]): boolean => {
  const { user } = useAuthStore.getState();
  if (!user) return false;
  return allowedRoles.includes(user.role);
};

export const isSuperAdmin = (): boolean => checkRole(['SuperAdmin']);
export const isAdminOrSuperAdmin = (): boolean => checkRole(['SuperAdmin', 'Admin']);
export const canEditContent = (): boolean => checkRole(['SuperAdmin', 'Admin', 'Editor']);
