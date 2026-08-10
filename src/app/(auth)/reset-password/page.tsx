import type { Metadata } from 'next';
import { PasswordInput } from '@/components/ui/password-input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Reset password | CV Builder',
  description: 'Here you should write a new password and confirm it',
};

export default function ResetPasswordPage() {
  return (
    <div className="flex flex-col">
      <div className="mb-10 text-center text-foreground">
        <h1 className="mb-6 text-[34px] font-regular">Reset password</h1>
        <p className="text-[16px]">
          Here you should write a new password and confirm it
        </p>
      </div>

      <form className="flex flex-col gap-9 mb-8">
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
        <div className="flex flex-col items-center gap-2 font-medium">
          <Button type="submit" className="w-[120px]">
            Submit
          </Button>
          <Link href="/sign-in" className="w-[120px]">
            <Button variant="ghost" className="w-full">
              Go to sign in
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
