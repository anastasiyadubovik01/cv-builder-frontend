import { SearchIcon } from '@/components/icons/search-icon';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

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

      <Input
        type="search"
        floatingLabel={false}
        containerClassName="flex-1"
        className="h-auto border-0 bg-transparent p-0 text-base leading-[23px] tracking-[0.15px] text-foreground outline-none placeholder:text-[var(--search-placeholder)] hover:border-0 focus:border-0"
        {...props}
      />
    </div>
  );
}
