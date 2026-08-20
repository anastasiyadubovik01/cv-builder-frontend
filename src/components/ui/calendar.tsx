'use client';

import * as React from 'react';
import {
  DayPicker,
  getDefaultClassNames,
  type DayButton,
  type Locale,
  type DayPickerProps,
} from 'react-day-picker';
import { addMonths, subMonths, setMonth, setYear } from 'date-fns';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

type CalendarView = 'days' | 'months' | 'years';

const MONTH_KEYS = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
] as const;

type CalendarProps = DayPickerProps & {
  buttonVariant?: React.ComponentProps<typeof Button>['variant'];
};

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  locale,
  formatters,
  components,
  month: externalMonth,
  onMonthChange,
  ...props
}: CalendarProps) {
  const { t } = useTranslation();
  const defaultClassNames = getDefaultClassNames();

  const [view, setView] = React.useState<CalendarView>('days');

  const initialDate = React.useMemo(() => {
    if (externalMonth) return externalMonth;
    if ('selected' in props && props.selected instanceof Date) {
      return props.selected;
    }
    return new Date();
  }, [externalMonth, props]);

  const [internalMonth, setInternalMonth] = React.useState<Date>(initialDate);

  const displayMonth = externalMonth || internalMonth;

  const handleMonthChange = (newMonth: Date) => {
    setInternalMonth(newMonth);
    onMonthChange?.(newMonth);
  };

  const currentYear = displayMonth.getFullYear();
  const startYear = Math.floor(currentYear / 12) * 12;
  const years = React.useMemo(
    () => Array.from({ length: 12 }, (_, i) => startYear + i),
    [startYear],
  );

  const handlePrev = () => {
    if (view === 'days') handleMonthChange(subMonths(displayMonth, 1));
    if (view === 'months')
      handleMonthChange(setYear(displayMonth, currentYear - 1));
    if (view === 'years')
      handleMonthChange(setYear(displayMonth, currentYear - 12));
  };

  const handleNext = () => {
    if (view === 'days') handleMonthChange(addMonths(displayMonth, 1));
    if (view === 'months')
      handleMonthChange(setYear(displayMonth, currentYear + 1));
    if (view === 'years')
      handleMonthChange(setYear(displayMonth, currentYear + 12));
  };

  return (
    <div
      className={cn(
        'bg-background px-[28px] pt-[23px] pb-[34px] text-[18px] rounded-xl border shadow-sm w-[449px]',
        className,
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1 font-medium px-3">
          <button
            onClick={() => setView(view === 'months' ? 'days' : 'months')}
            className={cn(
              'hover:text-destructive transition-colors cursor-pointer pr-3',
              view === 'months' && 'text-destructive',
            )}
          >
            {t(`months.${MONTH_KEYS[displayMonth.getMonth()]}`)}
          </button>
          <button
            type="button"
            onClick={() => setView(view === 'years' ? 'days' : 'years')}
            className={cn(
              'hover:text-destructive transition-colors cursor-pointer pl-3',
              view === 'years' && 'text-destructive',
            )}
          >
            {displayMonth.getFullYear()}
          </button>
        </div>

        <div className="flex items-center gap-5 px-3">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrev}
            className="size-10 rounded-full p-0"
          >
            <ChevronLeftIcon className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleNext}
            className="size-10 rounded-full p-0"
          >
            <ChevronRightIcon className="size-4" />
          </Button>
        </div>
      </div>

      {view === 'months' && (
        <div className="grid grid-cols-3 gap-y-5 gap-x-1.5 mt-[53px] mb-[6px]">
          {MONTH_KEYS.map((monthKey, idx) => {
            const isSelected = displayMonth.getMonth() === idx;
            return (
              <button
                key={monthKey}
                type="button"
                onClick={() => {
                  handleMonthChange(setMonth(displayMonth, idx));
                  setView('days');
                }}
                className={cn(
                  'h-[34px] w-[127px] rounded transition-colors cursor-pointer font-normal',
                  isSelected
                    ? 'bg-destructive text-[#F5F5F7]'
                    : 'hover:bg-muted text-foreground',
                )}
              >
                {t(`months.${monthKey}`)}
              </button>
            );
          })}
        </div>
      )}

      {view === 'years' && (
        <div className="grid grid-cols-3 gap-y-5 gap-x-1.5 mt-[53px] mb-[6px]">
          {years.map((yr) => {
            const isSelected = displayMonth.getFullYear() === yr;
            return (
              <button
                key={yr}
                type="button"
                onClick={() => {
                  handleMonthChange(setYear(displayMonth, yr));
                  setView('months');
                }}
                className={cn(
                  'h-[34px] w-[127px] rounded transition-colors cursor-pointer font-normal',
                  isSelected
                    ? 'bg-destructive text-[#F5F5F7]'
                    : 'hover:bg-muted text-foreground',
                )}
              >
                {yr}
              </button>
            );
          })}
        </div>
      )}

      {view === 'days' && (
        <DayPicker
          showOutsideDays={showOutsideDays}
          month={displayMonth}
          onMonthChange={handleMonthChange}
          locale={locale}
          formatters={{
            formatWeekdayName: (date) => {
              const weekdays = t('weekdays.short', { returnObjects: true });
              if (Array.isArray(weekdays)) {
                return weekdays[date.getDay()];
              }
              return date.toLocaleString(locale?.code || 'en-US', {
                weekday: 'narrow',
              });
            },
            ...formatters,
          }}
          classNames={{
            root: cn('w-full', defaultClassNames.root),
            months: cn('flex flex-col gap-4', defaultClassNames.months),
            month: cn('flex w-full flex-col gap-2', defaultClassNames.month),
            month_caption: 'hidden',
            nav: 'hidden',
            month_grid: cn(
              'w-full border-collapse',
              defaultClassNames.month_grid,
            ),
            weekdays: cn('flex justify-between', defaultClassNames.weekdays),
            weekday: cn(
              'w-8 text-center font-medium text-foreground select-none',
              defaultClassNames.weekday,
            ),
            week: cn(
              'mt-1 flex w-full justify-between',
              defaultClassNames.week,
            ),
            day: cn(
              'group/day relative aspect-square h-8 w-8 rounded-full p-0 text-center select-none',
              defaultClassNames.day,
            ),
            outside: cn('text-muted-foreground/30', defaultClassNames.outside),
            disabled: cn(
              'text-muted-foreground opacity-50',
              defaultClassNames.disabled,
            ),
            hidden: cn('invisible', defaultClassNames.hidden),
            ...classNames,
          }}
          components={{
            Root: ({ className, rootRef, ...props }) => (
              <div
                data-slot="calendar"
                ref={rootRef}
                className={cn(className)}
                {...props}
              />
            ),
            DayButton: ({ ...props }) => (
              <CalendarDayButton locale={locale} {...props} />
            ),
            ...components,
          }}
          {...(props as DayPickerProps)}
        />
      )}
    </div>
  );
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  locale,
  ...props
}: React.ComponentProps<typeof DayButton> & { locale?: Partial<Locale> }) {
  const defaultClassNames = getDefaultClassNames();

  const ref = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  const isOutside = modifiers.outside;

  return (
    <Button
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString(locale?.code)}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-outside={isOutside}
      className={cn(
        'relative isolate z-10 size-8 rounded-full border-0',
        'text-[18px] font-normal',
        'text-foreground',
        'data-[outside=true]:text-[#aeaeae] data-[outside=true]:dark:text-[#626262]',
        'data-[selected-single=true]:bg-destructive',
        'data-[selected-single=true]:text-white',
        'data-[selected-single=true]:hover:bg-destructive/90',
        'hover:bg-muted hover:text-foreground',

        'data-[selected-single=true]:relative',
        'data-[selected-single=true]:before:absolute',
        'data-[selected-single=true]:before:inset-1/2',
        'data-[selected-single=true]:before:-translate-x-1/2',
        'data-[selected-single=true]:before:-translate-y-1/2',
        'data-[selected-single=true]:before:w-[41px]',
        'data-[selected-single=true]:before:h-[41px]',
        'data-[selected-single=true]:before:bg-destructive',
        'data-[selected-single=true]:before:rounded-full',
        'data-[selected-single=true]:before:-z-10',
        'data-[selected-single=true]:text-white',
        'data-[selected-single=true]:hover:before:bg-destructive/90',

        defaultClassNames.day,
        className,
      )}
      {...props}
    />
  );
}

export { Calendar, CalendarDayButton };
