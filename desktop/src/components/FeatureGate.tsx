import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { Navigate } from 'react-router-dom';

interface FeatureGateProps {
  children: React.ReactNode;
  feature?: string;
  minPlan?: 'STARTER' | 'PRO' | 'ENTERPRISE';
  fallback?: React.ReactNode;
}

export const useFeatureAccess = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const clinic = user?.clinic;

  const hasAccess = (feature?: string, minPlan?: 'STARTER' | 'PRO' | 'ENTERPRISE') => {
    // SYSTEM_ADMIN gets everything
    if (user?.role === 'SYSTEM_ADMIN') return true;
    if (!clinic) return false;

    const currentPlan = clinic.subscription_plan?.toUpperCase() || 'STARTER';
    const features = clinic.custom_features || [];

    // 1. Check if it's explicitly unlocked via custom features
    if (feature && features.includes(feature)) {
      return true;
    }

    // 2. Check Plan Level
    if (minPlan) {
      if (minPlan === 'STARTER') return true;
      if (minPlan === 'PRO' && ['PRO', 'ENTERPRISE'].includes(currentPlan)) return true;
      if (minPlan === 'ENTERPRISE' && currentPlan === 'ENTERPRISE') return true;
      return false;
    }

    return true;
  };

  return { hasAccess };
};

const FeatureGate: React.FC<FeatureGateProps> = ({ children, feature, minPlan, fallback }) => {
  const { hasAccess } = useFeatureAccess();

  if (!hasAccess(feature, minPlan)) {
    if (fallback) return <>{fallback}</>;
    // If it's used as a Route wrapper and fails, redirect to dashboard or show an upgrade screen
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default FeatureGate;
