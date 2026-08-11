import type { Metadata } from 'next';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { AuthTabs } from '../_components/auth-tabs';

export const metadata: Metadata = {
  title: 'Sign Up | CV Builder',
  description: 'Sign up to continue',
};

export default function SignUpPage() {
  return (
    <>
      <AuthTabs />
      <div className="flex flex-col">
        <div className="mb-10 text-center text-foreground">
          <h1 className="mb-5 text-[34px] font-regular">Sign up now</h1>
          <p className="text-[16px]">Welcome! Sign up to continue</p>
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
          <PasswordInput
            type="password"
            placeholder="Confirm Password"
            className="w-full bg-transparent p-3 text-[16px]"
            required
          />
          <div className="flex flex-col items-center gap-2 font-medium mt-2">
            <Button type="submit" className="w-[220px]">
              Create Account
            </Button>
            <Link href="/sign-in" className="w-[220px]">
              <Button variant="ghost" className="w-full">
                I have an account
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}
