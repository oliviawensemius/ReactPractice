// admin-frontend/src/components/Sidebar.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Sidebar: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/courses', label: 'Course Management', icon: '📚' },
    { href: '/lecturers', label: 'Lecturer Management', icon: '👨‍🏫' },
    { href: '/candidates', label: 'Candidate Management', icon: '👨‍🎓' },
    { href: '/reports', label: 'Reports', icon: '📈' },
  ];

  return (
    <aside className="w-64 bg-white shadow-md">
      <nav className="mt-6">
        <div className="px-4">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Administration
          </h2>
        </div>
        <div className="mt-2 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center px-4 py-2 text-sm font-medium rounded-md mx-2 transition-colors ${
                  isActive
                    ? 'bg-emerald-100 text-emerald-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;