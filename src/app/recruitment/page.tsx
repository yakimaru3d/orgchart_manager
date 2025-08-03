'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DashboardLayout from '@/components/layout/dashboard-layout';
import RecruitmentPlanList from '@/components/recruitment/recruitment-plan-list';

// React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function RecruitmentPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <DashboardLayout>
        <div className="container mx-auto p-6">
          <RecruitmentPlanList />
        </div>
      </DashboardLayout>
    </QueryClientProvider>
  );
}