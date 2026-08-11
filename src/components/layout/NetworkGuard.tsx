'use client';

import { useEffect, useState } from 'react';

import { NoInternetError } from '@/components/layout/NoInternetError';

type NetworkGuardProps = {
  children: React.ReactNode;
};

export function NetworkGuard({ children }: NetworkGuardProps) {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOnline) {
    return <NoInternetError />;
  }

  return children;
}
