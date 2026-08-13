import { cookies } from 'next/headers';
import { Sidebar } from '@/components/layout/Sidebar';
import { getRoleFromJwt } from '@/lib/helpers/jwt';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  const role = accessToken ? getRoleFromJwt(accessToken) : null;

  return (
    <div className="flex min-h-screen">
      <Sidebar role={role} />

      <main className="flex-1">{children}</main>
    </div>
  );
}
