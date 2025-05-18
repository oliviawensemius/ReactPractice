// frontend/app/(dashboard)/courses/page.tsx
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import CourseManagement from '@/components/lecturer/CourseManagement';

export default function ManageCoursesPage() {
  const router = useRouter();

  // Auth check - only lecturers allowed
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) {
      router.push('/signin');
    } else if (user.role !== 'lecturer') {
      router.push('/tutor');
    }
  }, [router]);

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold text-emerald-800 mb-6">Manage Courses</h1>
      <p className="text-gray-600 mb-8">
        Add or remove courses that you teach. Applications for your assigned courses will appear in your dashboard.
      </p>
      
      <CourseManagement />
    </div>
  );
}