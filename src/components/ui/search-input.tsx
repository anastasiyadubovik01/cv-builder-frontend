import { SearchIcon } from '@/components/icons/search-icon';
import { cn } from '@/lib/utils';

type SearchInputProps = React.ComponentProps<'input'>;

export function SearchInput({ className, ...props }: SearchInputProps) {
  return (
    <div
      className={cn(
        'flex h-10 w-[320px] items-center gap-3 rounded-[40px] border border-[var(--search-border)] px-4 lg:h-[45px]',
        className,
      )}
    >
      <SearchIcon className="size-6 shrink-0 text-[var(--search-icon)]" />

      <input
        type="search"
        placeholder="Search"
        className="w-full bg-transparent text-base leading-[23px] tracking-[0.15px] text-foreground outline-none placeholder:text-[var(--search-placeholder)]"
        {...props}
      />
    </div>
  );
}
