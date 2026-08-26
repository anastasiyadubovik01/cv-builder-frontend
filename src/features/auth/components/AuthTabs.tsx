'use client';

import * as React from 'react';
import { NavTabs } from '@/components/ui/nav-tabs';
import { useTranslation } from 'react-i18next';

export function AuthTabs() {
  const { t } = useTranslation();

  const authTabs = [
    { key: 'sign-in', label: t('auth.tabs.signIn'), href: '/sign-in' },
    { key: 'sign-up', label: t('auth.tabs.signUp'), href: '/sign-up' },
  ];

  return (
    <div className="fixed top-0 left-1/2 -translate-x-1/2 mt-[calc(6px+8px)]">
      <NavTabs items={authTabs} />
    </div>
  );
}
