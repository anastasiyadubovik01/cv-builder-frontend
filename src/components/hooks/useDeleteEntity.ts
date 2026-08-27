import { useTranslation } from 'react-i18next';
import { useMutation } from '@apollo/client/react';
import { useToast } from '@/components/ui/sonner';
import { handleFormError } from '@/lib/error/errorHandler';
import { OperationVariables } from '@apollo/client';
import { DocumentNode } from 'graphql';

type ExtraMutationOptions<TData, TVars extends OperationVariables> = Parameters<
  typeof useMutation<TData, TVars>
>[1];

type UseDeleteEntityConfig<
  TData,
  TVars extends OperationVariables,
  TArgs extends unknown[],
> = {
  mutation: DocumentNode;
  successMessageKey: string;
  defaultSuccessMessage?: string;
  errorContext: string;
  buildVariables: (...args: TArgs) => TVars;
  isSuccessCheck?: (data: TData | null | undefined) => boolean;
  onSuccess?: () => void | Promise<void>;
  mutationOptions?: ExtraMutationOptions<TData, TVars>;
};

export function useDeleteEntity<
  TData = unknown,
  TVars extends OperationVariables = OperationVariables,
  TArgs extends unknown[] = unknown[],
>({
  mutation,
  successMessageKey,
  defaultSuccessMessage = '',
  errorContext,
  buildVariables,
  isSuccessCheck,
  onSuccess,
  mutationOptions,
}: UseDeleteEntityConfig<TData, TVars, TArgs>) {
  const { t } = useTranslation();
  const toast = useToast();
  const [mutate, { loading }] = useMutation<TData, TVars>(
    mutation,
    mutationOptions,
  );

  const handleDelete = async (...args: TArgs): Promise<boolean> => {
    try {
      const response = await mutate({
        variables: buildVariables(...args),
      });

      if (isSuccessCheck && !isSuccessCheck(response.data)) {
        return false;
      }

      toast.success(
        defaultSuccessMessage
          ? t(successMessageKey, defaultSuccessMessage)
          : t(successMessageKey),
      );
      await onSuccess?.();
      return true;
    } catch (err) {
      handleFormError(err, { t, context: errorContext });
      return false;
    }
  };

  return {
    handleDelete,
    loading,
    t,
  };
}
