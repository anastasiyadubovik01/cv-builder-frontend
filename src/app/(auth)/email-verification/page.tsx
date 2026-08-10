import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { DigitsInputOTP } from '@/components/ui/digits-input-otp';

export const metadata: Metadata = {
  title: 'Email verification | CV Builder',
  description: 'Enter the verification code we sent to your email',
};

export default function EmailVerificationPage() {
  return (
    <div className="flex flex-col">
      <div className="mb-10 text-center text-foreground">
        <h1 className="mb-6 text-[34px] font-regular">Email verification</h1>
        <p className="text-[16px]">
          Enter the verification code we sent to your email.
        </p>
      </div>

      <form className="flex flex-col gap-9 mb-8">
        <div className="flex justify-center">
          <DigitsInputOTP />
        </div>
        <div className="flex flex-col items-center gap-2 font-medium">
          <Button type="submit" className="w-[160px]">
            Confirm
          </Button>
          <Link href="/" className="w-[160px]">
            <Button variant="ghost" className="w-full">
              Later
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
