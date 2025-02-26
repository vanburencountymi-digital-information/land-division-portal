export const ROLES = {
  USER: 'user',
  TOWNSHIP: 'township',
  ADMIN: 'admin',
  ADDRESS_ADMINISTRATOR: 'address_administrator'
};

export const rolePermissions = {
  [ROLES.USER]: {
    canViewDashboard: true,
    canViewParcelViewer: true,
    canViewApplications: true,
    canCreateApplications: true,
    canManageWorkflows: false,
    canApproveApplications: false,
    canManageUsers: false,
  },
  [ROLES.TOWNSHIP]: {
    canViewDashboard: true,
    canViewParcelViewer: true,
    canViewApplications: true,
    canCreateApplications: false,
    canManageWorkflows: true,
    canApproveApplications: true,
    canManageUsers: false,
  },
  [ROLES.ADMIN]: {
    canViewDashboard: true,
    canViewParcelViewer: true,
    canViewApplications: true,
    canCreateApplications: true,
    canManageWorkflows: true,
    canApproveApplications: true,
    canManageUsers: true,
  },
  [ROLES.ADDRESS_ADMINISTRATOR]: {
    canViewDashboard: true,
    canViewParcelViewer: true,
    canViewApplications: true,
    canCreateApplications: false,
    canManageWorkflows: true,
    canApproveApplications: true,
    canManageUsers: false,
  },
};

export const hasPermission = (userRole, permission) => {
  if (!userRole || !rolePermissions[userRole]) return false;
  return rolePermissions[userRole][permission] || false;
};
