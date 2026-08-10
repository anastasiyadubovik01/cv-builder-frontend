import type { Metadata } from 'next';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { AuthTabs } from '../_components/auth-tabs';

export const metadata: Metadata = {
  title: 'Sign In | CV Builder',
  description: 'Sign in to continue',
};

export default function SignInPage() {
  return (
    <>
      <AuthTabs />
      <div className="flex flex-col">
        <div className="mb-10 text-center text-foreground">
          <h1 className="mb-5 text-[34px] font-regular">Welcome back</h1>
          <p className="text-[16px]">Hello again! Sign in to continue</p>
        </div>

        <form className="flex flex-col gap-9">
          <Input
            type="email"
            placeholder="Email"
            className="w-full bg-transparent p-3 text-[16px]"
            required
          />
          <PasswordInput
            type="password"
            placeholder="Password"
            className="w-full bg-transparent p-3 text-[16px]"
            required
          />
          <div className="flex flex-col items-center gap-2 font-medium mt-2">
            <Button type="submit" className="w-[160px]">
              Sign in
            </Button>
            <Link href="/forgot-password" className="w-[160px]">
              <Button variant="ghost" className="w-full">
                Forgot password
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}
