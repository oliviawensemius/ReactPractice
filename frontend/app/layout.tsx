// frontend/app/layout.tsx - Updated to include GraphQL subscriptions
'use client';

import React from 'react';
import { ApolloProvider } from '@apollo/client';
import MainLayout from '@/components/layout/MainLayout';
import { apolloClient } from '@/lib/apollo-websocket-client';
import { CandidateUnavailableListener } from '@/components/CandidateUnavailableListener';
import './globals.css';

// Note: Since we're using 'use client', we can't export metadata frontend\components\CandidateUnavailableListener.tsx

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ApolloProvider client={apolloClient}>
          <MainLayout>
            {children}
          </MainLayout>
          <CandidateUnavailableListener />
        </ApolloProvider>
      </body>
    </html>
  );
}