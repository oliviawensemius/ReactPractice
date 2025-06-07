// frontend/components/CandidateUnavailableListener.tsx - Fixed version
'use client';

import React, { useEffect, useState } from 'react';
import { useSubscription } from '@apollo/client';
import { gql } from '@apollo/client';

const CANDIDATE_UNAVAILABLE_SUBSCRIPTION = gql`
  subscription CandidateUnavailable {
    candidateUnavailable {
      candidateId
      candidateName
      candidateEmail
      reason
      timestamp
      affectedCourses
      notifiedBy
    }
  }
`;

interface UnavailableCandidate {
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  reason: string;
  timestamp: string;
  affectedCourses: string[];
  notifiedBy: string;
}

export const CandidateUnavailableListener: React.FC = () => {
  const [unavailableCandidates, setUnavailableCandidates] = useState<UnavailableCandidate[]>([]);
  const [notifications, setNotifications] = useState<UnavailableCandidate[]>([]);

  // Subscribe to real-time candidate unavailable notifications
  const { data, error, loading } = useSubscription(CANDIDATE_UNAVAILABLE_SUBSCRIPTION, {
    onData: ({ data: subscriptionData }) => {
      if (subscriptionData?.data?.candidateUnavailable) {
        const notification = subscriptionData.data.candidateUnavailable;
        
        console.log('🚨 HD FEATURE: Real-time notification received via GraphQL subscription:', notification);
        
        // Add to unavailable candidates list (persistent)
        setUnavailableCandidates(prev => {
          const existing = prev.find(c => c.candidateId === notification.candidateId);
          if (existing) {
            return prev.map(c => 
              c.candidateId === notification.candidateId ? notification : c
            );
          }
          return [...prev, notification];
        });

        // Add to notifications list (for toast display)
        setNotifications(prev => [...prev, notification]);

        // Show browser notification if supported
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          new Notification('⚠️ Candidate Unavailable - TeachTeam', {
            body: `${notification.candidateName} is no longer available for hiring.\nReason: ${notification.reason}`,
            icon: '/favicon.ico',
            tag: `candidate-${notification.candidateId}`, // Prevent duplicates
          });
        }

        // Play notification sound (optional)
        if (typeof window !== 'undefined') {
          try {
            const audio = new Audio('/notification-sound.mp3');
            audio.play().catch(() => {}); // Ignore errors
          } catch (e) {
            // Ignore audio errors
          }
        }
      }
    },
    onError: (error) => {
      console.error('GraphQL Subscription Error:', error);
    },
  });

  // Request notification permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('Notification permission:', permission);
      });
    }
  }, []);

  // Dismiss notification toast
  const dismissNotification = (index: number) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
  };

  // Auto-dismiss notifications after 10 seconds
  useEffect(() => {
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        setNotifications(prev => prev.slice(1));
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [notifications]);

  return (
    <>
      {/* Real-time Notification Toasts */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification, index) => (
          <div
            key={`${notification.candidateId}-${notification.timestamp}`}
            className="bg-red-600 text-white p-4 rounded-lg shadow-lg max-w-sm animate-slide-in border border-red-700"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <span className="text-xs bg-red-800 px-2 py-1 rounded font-semibold">
                    HD FEATURE - REAL-TIME
                  </span>
                </div>
                <h4 className="font-semibold text-sm">🚨 Candidate Unavailable</h4>
                <p className="text-sm mt-1">{notification.candidateName}</p>
                <p className="text-xs mt-1 opacity-90">{notification.reason}</p>
                {notification.affectedCourses && notification.affectedCourses.length > 0 && (
                  <p className="text-xs mt-1 opacity-90">
                    Affects {notification.affectedCourses.length} course(s)
                  </p>
                )}
                <p className="text-xs mt-2 opacity-75">
                  Via GraphQL Subscription • {new Date(notification.timestamp).toLocaleTimeString()}
                </p>
              </div>
              <button
                onClick={() => dismissNotification(index)}
                className="text-white hover:text-gray-200 ml-2 text-lg leading-none"
                aria-label="Dismiss notification"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Connection Status */}
      {error && (
        <div className="fixed bottom-4 left-4 bg-red-600 text-white p-3 rounded-lg shadow-lg">
          <p className="text-sm">WebSocket error: {error.message}</p>
        </div>
      )}

      {/* For debugging - show connection status */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-2 rounded text-xs">
          <p>🔄 GraphQL Subscriptions: {loading ? 'Connecting...' : error ? 'Error' : 'Connected'}</p>
          <p>📊 Unavailable candidates: {unavailableCandidates.length}</p>
        </div>
      )}
    </>
  );
};

// Hook for other components to use candidate availability data
export const useCandidateAvailability = () => {
  const [unavailableCandidates, setUnavailableCandidates] = useState<UnavailableCandidate[]>([]);

  useSubscription(CANDIDATE_UNAVAILABLE_SUBSCRIPTION, {
    onData: ({ data: subscriptionData }) => {
      if (subscriptionData?.data?.candidateUnavailable) {
        const notification = subscriptionData.data.candidateUnavailable;
        setUnavailableCandidates(prev => {
          const existing = prev.find(c => c.candidateId === notification.candidateId);
          if (existing) {
            return prev.map(c => 
              c.candidateId === notification.candidateId ? notification : c
            );
          }
          return [...prev, notification];
        });
      }
    },
    onError: (error) => {
      console.error('GraphQL Subscription Error in hook:', error);
    },
  });

  const isCandidateUnavailable = (candidateId: string): boolean => {
    return unavailableCandidates.some(c => c.candidateId === candidateId);
  };

  const getUnavailableInfo = (candidateId: string): UnavailableCandidate | undefined => {
    return unavailableCandidates.find(c => c.candidateId === candidateId);
  };

  return { isCandidateUnavailable, getUnavailableInfo, unavailableCandidates };
};