'use client';
import React from 'react';

interface HeaderProps {
  title: string;
  userRole?: 'lecturer' | 'applicant' | 'candidate';
  username?: string;
}

const Header: React.FC<HeaderProps> = ({ 
  title, 
  userRole, 
  username 
}) => {
  // Only show user info if username exists and is not empty
  const isAuthenticated = username && username.trim() !== '';

  return (
    <header className="bg-lime-200 py-20 px-4">
      <div className="container mx-auto">
        <div className="flex justify-between">
          <div className="max-w-4xl">
            <h1 className="text-5xl font-bold text-emerald-800 mb-4">{title}</h1>
            <p className="text-xl text-emerald-800 max-w-xl">
              Tutor and Lab Assistant Selection System for the School of Computer Science
            </p>
          </div>
          
          {isAuthenticated && (
            <div className="bg-emerald-700 text-white px-4 py-2 rounded-lg h-fit">
              <p>
                Logged in as: <strong>{username}</strong>
                <span className="ml-2 text-emerald-200">
                  ({userRole === 'lecturer' ? 'Lecturer' : 'Tutor Applicant'})
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;