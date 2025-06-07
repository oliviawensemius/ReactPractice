// components/WelcomeOverlay.tsx
import React, { useEffect, useState } from 'react';

interface WelcomeOverlayProps {
  username: string;
  onTimeout: () => void;
  timeout?: number; // in milliseconds
}

const WelcomeOverlay: React.FC<WelcomeOverlayProps> = ({ 
  username, 
  onTimeout,
  timeout = 30000 // default 30 seconds
}) => {
  const [timeLeft, setTimeLeft] = useState(timeout / 1000);
  
  useEffect(() => {
    // Countdown timer
    const intervalId = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalId);
          onTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Auto-dismiss after timeout
    const timerId = setTimeout(() => {
      onTimeout();
    }, timeout);

    // Clean up
    return () => {
      clearInterval(intervalId);
      clearTimeout(timerId);
    };
  }, [timeout, onTimeout]);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-lg w-full mx-4 text-center transform animate-fadeIn">
        <h1 className="text-4xl font-bold text-emerald-600 mb-4">
          Welcome, {username}!
        </h1>
        <p className="text-xl text-gray-700 mb-6">
          We&apos;re glad to have you back at TeachTeam.
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
          <div 
            className="bg-emerald-600 h-2.5 rounded-full transition-all duration-1000 ease-linear" 
            style={{ width: `${(timeLeft / (timeout/1000)) * 100}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-500">
          This message will close in {timeLeft} seconds
        </p>
        <button
          onClick={onTimeout}
          className="mt-6 px-6 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
        >
          Continue Now
        </button>
      </div>
    </div>
  );
};

export default WelcomeOverlay;