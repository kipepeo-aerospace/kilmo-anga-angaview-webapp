import React from 'react';
import { Navigate } from 'react-router-dom';
import { useMsal, useAccount } from '@azure/msal-react';
import { InteractionStatus } from '@azure/msal-browser';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { accounts, inProgress } = useMsal();
  const account = useAccount(accounts[0] || null);

  const isLoading = inProgress !== InteractionStatus.None;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!account) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
