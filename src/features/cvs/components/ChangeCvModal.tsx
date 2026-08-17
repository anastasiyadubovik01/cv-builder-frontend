'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ChangeDialog } from '@/components/dialogs/ChangeDialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  createActionTitles,
  updateActionTitles,
} from '@/components/dialogs/types';

export interface ChangeCvModalProps {
  type: createActionTitles | updateActionTitles;
  trigger: React.ReactNode;
  onSubmit?: (data: {
    name: string;
    education: string;
    description: string;
  }) => void;
}

export function ChangeCvModal({ type, trigger, onSubmit }: ChangeCvModalProps) {
  const { t } = useTranslation();

  const [name, setName] = useState('');
  const [education, setEducation] = useState('');
  const [description, setDescription] = useState('');

  const handleConfirm = () => {
    onSubmit?.({ name, education, description });
    setName('');
    setEducation('');
    setDescription('');
  };

  return (
    <ChangeDialog
      actionTitle={type}
      itemType="CV"
      onConfirm={handleConfirm}
      trigger={trigger}
      t={t}
    >
      <div className="flex flex-col gap-9">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('cvs.name', 'Name')}
          required
        />

        <Input
          value={education}
          onChange={(e) => setEducation(e.target.value)}
          placeholder={t('cvs.education', 'Education')}
        />

        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t('cvs.description', 'Description')}
        />
      </div>
    </ChangeDialog>
  );
}
