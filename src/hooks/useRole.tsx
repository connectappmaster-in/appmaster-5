import { useAuth } from "@/contexts/AuthContext";

type AppRole = 'owner' | 'admin' | 'manager' | 'staff' | 'viewer';

export const useRole = () => {
  const { userRole, accountType, orgRole, appmasterRole } = useAuth();

  const hasRole = (role: AppRole): boolean => {
    if (accountType === 'personal' || orgRole === 'individual_user') {
      // Personal accounts have full access
      return true;
    }
    return userRole === role;
  };

  const hasAnyRole = (roles: AppRole[]): boolean => {
    if (accountType === 'personal' || orgRole === 'individual_user') {
      // Personal accounts have full access
      return true;
    }
    return userRole ? roles.includes(userRole as AppRole) : false;
  };

  const isAdmin = (): boolean => {
    // Check both org-level role and user role
    if (orgRole === 'super_admin' || orgRole === 'org_admin') {
      return true;
    }
    return hasAnyRole(['owner', 'admin']);
  };

  const isSuperAdmin = (): boolean => {
    return orgRole === 'super_admin' || appmasterRole === 'super_admin';
  };

  const canManageUsers = (): boolean => {
    if (accountType === 'personal' || orgRole === 'individual_user') {
      // Personal accounts don't have user management
      return false;
    }
    // Super admins and org admins can manage users
    return orgRole === 'super_admin' || orgRole === 'org_admin' || hasAnyRole(['owner', 'admin']);
  };

  const canManageTools = (): boolean => {
    // Super admins and org admins can manage tools
    if (orgRole === 'super_admin' || orgRole === 'org_admin') {
      return true;
    }
    return hasAnyRole(['owner', 'admin', 'manager']);
  };

  return {
    userRole,
    accountType,
    orgRole,
    hasRole,
    hasAnyRole,
    isAdmin,
    isSuperAdmin,
    canManageUsers,
    canManageTools,
  };
};
