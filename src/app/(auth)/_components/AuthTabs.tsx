'use client';

import * as React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

export function AuthTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();

  const value = pathname === '/sign-in' ? 'sign-in' : 'sign-up';

  const handleTabChange = (val: string) => {
    router.push(`/${val}`);
  };

  return (
    <Tabs
      value={value}
      onValueChange={handleTabChange}
      className="fixed top-0 left-1/2 -translate-x-1/2 mt-[calc(6px+8px)]"
    >
      <TabsList>
        <TabsTrigger value="sign-in">{t('auth.tabs.signIn')}</TabsTrigger>
        <TabsTrigger value="sign-up">{t('auth.tabs.signUp')}</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
