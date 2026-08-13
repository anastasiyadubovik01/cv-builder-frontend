import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@apollo/client/react';
import { VERIFY_MAIL_MUTATION } from '@/api/auth';
import { handleFormError } from '@/lib/error/errorHandler';
import { verifyMailSchema } from '@/lib/validations/auth';

const FIELD_ERROR_KEYS = [
  'auth.errors.invalidOtp',
  'auth.errors.expiredOtp',
] as const;

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

  const handleOtpChange = (value: string) => {
    setOtp(value);
    if (error) {
      setError(undefined);
    }
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    const result = verifyMailSchema.safeParse({ otp });
    if (!result.success) {
      const issue = result.error.issues[0];
      if (issue) {
        setError(issue.message);
      }
      return;
    }

    setError(undefined);

    try {
      await verifyMail({
        variables: {
          mail: { otp },
        },
      });
    } catch (err: unknown) {
      handleFormError(err, {
        t,
        fieldErrorKeys: FIELD_ERROR_KEYS,
        setFieldError: setError,
        context: 'Email verification error',
      });
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
