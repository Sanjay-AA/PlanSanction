import React from 'react';
import { Navigate } from 'react-router-dom';
import { useCurrentUser } from '../../services/store';
import { UserRole } from '../../types';

interface RoleRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export const RoleRoute: React.FC<RoleRouteProps> = ({ children, allowedRoles }) => {
  const { currentUser } = useCurrentUser();

  if (!allowedRoles.includes(currentUser.role)) {
    // Redirect to default home for current role
    if (currentUser.role === 'client') {
      return <Navigate to="/client" replace />;
    } else if (currentUser.role === 'officer') {
      return <Navigate to="/officer" replace />;
    } else {
      return <Navigate to="/admin" replace />;
    }
  }

  return <>{children}</>;
};
