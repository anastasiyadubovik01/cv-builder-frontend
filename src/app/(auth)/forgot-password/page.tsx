import type { Metadata } from 'next';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Forgot password | CV Builder',
  description: 'We will sent you an email with further instructions',
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-col">
      <div className="mb-10 text-center text-foreground">
        <h1 className="mb-6 text-[34px] font-regular">Forgot password</h1>
        <p className="text-[16px]">
          We will sent you an email with further instructions
        </p>
      </div>

      <form className="flex flex-col gap-9 mb-8">
        <Input
          type="email"
          placeholder="Email"
          className="w-full bg-transparent p-3 text-[16px]"
          required
        />
        <div className="flex flex-col items-center gap-2 font-medium">
          <Button type="submit" className="w-[220px]">
            Reset password
          </Button>
          <Link href="/sign-in" className="w-[220px]">
            <Button variant="ghost" className="w-full">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
