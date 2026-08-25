'use client';

import { useTheme } from 'next-themes';
import { useTranslation } from 'react-i18next';
import {
  toast as sonnerToast,
  Toaster as Sonner,
  type ToasterProps,
} from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      closeButton
      icons={{
        success: null,
        info: null,
        warning: null,
        error: null,
        loading: null,
      }}
      toastOptions={{
        classNames: {
          toast:
            '!w-[280px] !min-h-[80px] !p-0 !m-0 relative font-sans rounded-xl border flex flex-col justify-start items-start overflow-hidden box-border',
          content:
            '!p-0 !m-0 !py-2 !pl-4 !pr-9 !w-full flex flex-col items-start',

          title: '!text-base !font-medium !leading-tight !m-0 !p-0',
          description: '!text-sm !text-current !font-regular !mt-2 !m-0 !p-0',

          closeButton:
            '!absolute !top-2 !right-3 !left-auto !bottom-auto !transform-none !m-0 !p-0 !w-6 !h-6 !min-w-[24px] !min-h-[24px] !max-w-[24px] !max-h-[24px] inline-flex items-center justify-center !bg-transparent !border-none !outline-none !text-current opacity-90 hover:opacity-100 transition-opacity [&>svg]:!w-3 [&>svg]:!h-3 [&>svg]:!min-w-[12px] [&>svg]:!min-h-[12px] [&>svg]:!max-w-[12px] [&>svg]:!max-h-[12px] [&>svg]:!block',

          success: '!bg-[#66BB6A] !text-[#335D35] !border-[#335D35]',
          error:
            '!bg-[#C63031] !text-[#F5F5F7] !border-[#631818] [&_button]:!text-[#F5F5F7]',
          warning: '!bg-[#FFB800] !text-[#7F5C00] !border-[#7F5C00]',
          info: '!bg-[#29B6F6] !text-[#145B7B] !border-[#145B7B]',
        },
      }}
      {...props}
    />
  );
};

export function useToast() {
  const { t } = useTranslation();

  return {
    success: (
      message: string,
      options?: Omit<Parameters<typeof sonnerToast.success>[1], 'description'>,
    ) => {
      return sonnerToast.success(t('toast.success'), {
        description: message,
        ...options,
      });
    },
    error: (
      message: string,
      options?: Omit<Parameters<typeof sonnerToast.error>[1], 'description'>,
    ) => {
      return sonnerToast.error(t('toast.error'), {
        description: message,
        ...options,
      });
    },
    warning: (
      message: string,
      options?: Omit<Parameters<typeof sonnerToast.warning>[1], 'description'>,
    ) => {
      return sonnerToast.warning(t('toast.warning'), {
        description: message,
        ...options,
      });
    },
    info: (
      message: string,
      options?: Omit<Parameters<typeof sonnerToast.info>[1], 'description'>,
    ) => {
      return sonnerToast.info(t('toast.info'), {
        description: message,
        ...options,
      });
    },
  };
}

export { Toaster };
