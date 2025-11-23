import { useAuth } from "@/contexts/AuthContext";

type AppRole = 'owner' | 'admin' | 'manager' | 'staff' | 'viewer';

export const useRole = () => {
  const { userRole, accountType } = useAuth();

  const hasRole = (role: AppRole): boolean => {
    if (accountType === 'personal') {
      // Personal accounts have full access
      return true;
    }
    return userRole === role;
  };

  const hasAnyRole = (roles: AppRole[]): boolean => {
    if (accountType === 'personal') {
      // Personal accounts have full access
      return true;
    }
    return userRole ? roles.includes(userRole as AppRole) : false;
  };

  const isAdmin = (): boolean => {
    return hasAnyRole(['owner', 'admin']);
  };

  const canManageUsers = (): boolean => {
    if (accountType === 'personal') {
      // Personal accounts don't have user management
      return false;
    }
    return hasAnyRole(['owner', 'admin']);
  };

  const canManageTools = (): boolean => {
    return hasAnyRole(['owner', 'admin', 'manager']);
  };

  return {
    userRole,
    accountType,
    hasRole,
    hasAnyRole,
    isAdmin,
    canManageUsers,
    canManageTools,
  };
};
