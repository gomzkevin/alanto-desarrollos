import React from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import SecurityDashboard from '@/components/dashboard/SecurityDashboard';
import { useProtectedRoute } from '@/hooks/optimized/useProtectedRoute';
import { FeatureGate } from '@/components/common/FeatureGate';

const SecurityPage: React.FC = () => {
  const { hasAccess, isLoading } = useProtectedRoute({ requireSubscription: false });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!hasAccess) {
    return null;
  }

  return (
    <DashboardLayout>
      <FeatureGate feature="audit_logs" mode="block">
        <SecurityDashboard />
      </FeatureGate>
    </DashboardLayout>
  );
};

export default SecurityPage;