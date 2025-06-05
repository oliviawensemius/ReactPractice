// admin-frontend/src/app/layout.tsx
import { ReactNode } from 'react';
import { ApolloProviderWrapper } from '@/components/ApolloProvider';
import { AuthProvider } from '@/components/AuthProvider';
import './globals.css';

export const metadata = {
  title: 'TeachTeam Admin Dashboard',
  description: 'Administrative interface for TeachTeam tutor selection system',
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <ApolloProviderWrapper>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ApolloProviderWrapper>
      </body>
    </html>
  );
}