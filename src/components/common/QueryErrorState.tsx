import { useTranslation } from 'react-i18next';
import { Button, type ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type QueryErrorStateProps = {
  message: string;
  onRetry?: () => void | Promise<unknown>;
  retryLabel?: string;
  buttonVariant?: ButtonProps['variant'];
  className?: string;
};

export function QueryErrorState({
  message,
  onRetry,
  retryLabel,
  buttonVariant = 'default',
  className,
}: QueryErrorStateProps) {
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        'flex min-h-0 flex-1 flex-col items-center justify-center gap-4 py-8 text-center',
        className,
      )}
    >
      <p className="text-base text-foreground">{message}</p>
      {onRetry && (
        <Button
          type="button"
          variant={buttonVariant}
          onClick={() => void onRetry()}
        >
          {retryLabel || t('retry', 'Retry')}
        </Button>
      )}
    </div>
  );
}
