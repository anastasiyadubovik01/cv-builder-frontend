import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@apollo/client/react';
import { toast } from '@/components/ui/sonner';
import { VERIFY_MAIL_MUTATION } from '@/api/auth';
import { mapServerError } from '@/lib/helpers/errorMapper';
import { verifyMailSchema } from '@/lib/validations/auth';

export function useEmailVerificationForm() {
  const { t } = useTranslation();
  const router = useRouter();

  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | undefined>();

  const [verifyMail, { loading }] = useMutation(VERIFY_MAIL_MUTATION, {
    onCompleted: () => {
      router.push('/');
      router.refresh();
    },
  });

  const validateForm = (): boolean => {
    const result = verifyMailSchema.safeParse({ otp });

    if (!result.success) {
      const issue = result.error.issues[0];
      if (issue) {
        setError(issue.message);
      }
      return false;
    }

    setError(undefined);
    return true;
  };

  const handleOtpChange = (value: string) => {
    setOtp(value);
    if (error) {
      setError(undefined);
    }
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await verifyMail({
        variables: {
          mail: { otp },
        },
      });
    } catch (err: unknown) {
      const translationKey = mapServerError(err);
      if (
        translationKey === 'auth.errors.invalidOtp' ||
        translationKey === 'auth.errors.expiredOtp'
      ) {
        setError(translationKey);
      } else {
        toast.error(t(translationKey));
      }
      console.error('Email verification error:', err);
    }
  };

  return {
    otp,
    error,
    loading,
    handleOtpChange,
    handleSubmit,
  };
}
