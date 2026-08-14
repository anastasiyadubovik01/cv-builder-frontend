import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { cn } from '@/lib/utils';

type UserDetailsLayoutProps = {
  children: React.ReactNode;
  params: Promise<{
    id: string;
  }>;
};

const tabs = [
  {
    label: 'PROFILE',
    href: '',
  },
  {
    label: 'SKILLS',
    href: 'skills',
  },
  {
    label: 'LANGUAGES',
    href: 'languages',
  },
];

export default async function UserDetailsLayout({
  children,
  params,
}: UserDetailsLayoutProps) {
  const { id } = await params;

  // временно
  const userName = 'Rostislav Harlanov';

  return (
    <div className="min-h-screen">
      <Breadcrumbs
        items={[
          {
            label: 'Employees',
            href: '/users',
          },
          {
            label: userName,
          },
          {
            label: 'Profile',
          },
        ]}
      />

      <div className="px-5">
        <nav className="flex h-12">
          {tabs.map((tab, index) => (
            <div
              key={tab.label}
              className={cn(
                'flex h-12 w-[150px] items-center justify-center text-[14px] leading-[18px] font-semibold tracking-[0.4px]',
                index === 0
                  ? 'border-b-2 border-destructive text-destructive'
                  : 'text-foreground',
              )}
            >
              {tab.label}
            </div>
          ))}
        </nav>

        {children}
      </div>
    </div>
  );
}
