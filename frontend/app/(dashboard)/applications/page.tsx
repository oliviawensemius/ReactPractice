// frontend/app/(dashboard)/applications/page.tsx
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import MyApplications from '@/components/tutor/MyApplications';

export default function MyApplicationsPage() {
  const router = useRouter();

  // Auth check - only candidates allowed
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) {
      router.push('/signin');
    } else if (user.role !== 'candidate') {
      router.push('/lecturer');
    }
  }, [router]);

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-3xl font-bold text-emerald-800 mb-2">My Applications</h1>
      <p className="text-gray-600 mb-8">
        View and track all your tutor and lab assistant applications.
      </p>
      
      <MyApplications />
    </div>
  );
}