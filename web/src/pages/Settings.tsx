import { Card, PageHeader } from '../components/ui';
import { useAuth } from '../lib/auth';

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
      <PageHeader title="Settings" />
      <Card className="p-5 sm:p-6">
        <h2 className="font-bold">Account</h2>
        <dl className="mt-3 grid grid-cols-[8rem_1fr] gap-y-2 text-sm">
          <dt className="text-slate-500">Name</dt><dd>{user?.name}</dd>
          <dt className="text-slate-500">Email</dt><dd>{user?.email}</dd>
          <dt className="text-slate-500">Account type</dt><dd className="capitalize">{user?.role}</dd>
          <dt className="text-slate-500">Sign-in</dt><dd>Google account (no WorkNest password)</dd>
        </dl>
      </Card>
    </div>
  );
}
