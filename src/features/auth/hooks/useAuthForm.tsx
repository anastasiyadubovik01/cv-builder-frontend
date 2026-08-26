import React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { DocumentNode } from 'graphql';
import { useMutation } from '@apollo/client/react';
import type { ZodType } from 'zod';
import { setAuthCookies } from '@/app/actions/auth';
import { handleFormError } from '@/lib/error/errorHandler';
import { useValidatedForm } from '@/components/hooks/useValidatedForm';
import { TypedDocumentNode } from '@apollo/client';

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface UseAuthFormOptions<
  TFieldValues extends Record<string, string>,
  TData,
> {
  initialValues: TFieldValues;
  schema: ZodType<TFieldValues>;
  mutation: TypedDocumentNode<TData, { auth: TFieldValues }> | DocumentNode;
  getTokens: (data: TData) => AuthTokens | undefined | null;
  redirectTo: string;
  errorContext: string;
}

export function useAuthForm<
  TFieldValues extends Record<string, string>,
  TData,
>({
  initialValues,
  schema,
  mutation,
  getTokens,
  redirectTo,
  errorContext,
}: UseAuthFormOptions<TFieldValues, TData>) {
  const { t } = useTranslation();
  const router = useRouter();

  const { formData, errors, validateForm, validateField, setFieldValue } =
    useValidatedForm<TFieldValues>({
      initialValues,
      schema,
    });

  const [submitMutation, { loading }] = useMutation<
    TData,
    { auth: TFieldValues }
  >(mutation, {
    onCompleted: async (data) => {
      const tokens = getTokens(data);

      if (tokens?.access_token && tokens?.refresh_token) {
        await setAuthCookies({
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
        });
        router.push(redirectTo);
        router.refresh();
      }
    },
  });

  const handleChange =
    (field: keyof TFieldValues) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFieldValue(field, e.target.value);
    };

  const handleBlur = (field: keyof TFieldValues) => () => {
    validateField(field);
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await submitMutation({
        variables: {
          auth: formData,
        },
      });
    } catch (err: unknown) {
      handleFormError(err, {
        t,
        context: errorContext,
      });
    }
  };

  return {
    formData,
    errors,
    loading,
    handleChange,
    handleBlur,
    handleSubmit,
  };
}
