import { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <main className="w-full max-w-[560px]">{children}</main>
    </div>
  );
}
