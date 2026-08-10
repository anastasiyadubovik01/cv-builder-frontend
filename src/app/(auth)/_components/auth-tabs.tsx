'use client';

import * as React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePathname, useRouter } from 'next/navigation';

export function AuthTabs() {
  const router = useRouter();
  const pathname = usePathname();

  const value = pathname === '/sign-in' ? 'sign-in' : 'sign-up';

  const handleTabChange = (value: string) => {
    router.push(`/${value}`);
  };

  return (
    <Tabs
      value={value}
      onValueChange={handleTabChange}
      className="fixed top-0 left-1/2 -translate-x-1/2 mt-[calc(6px+8px)]"
    >
      <TabsList>
        <TabsTrigger value="sign-in">Sign in</TabsTrigger>
        <TabsTrigger value="sign-up">Sign up</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
