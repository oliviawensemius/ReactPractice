import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import './globals.css';

export const metadata = {
  title: 'TeachTeam',
  description: 'Tutor Selection System for the School of Computer Science',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <MainLayout>
          {children}
        </MainLayout>
      </body>
    </html>
  );
}