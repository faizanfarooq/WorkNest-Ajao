import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { z } from 'zod';
import { ChangePasswordSchema } from '@shared/schemas';
import { Button, Card, Input, PageHeader } from '../components/ui';
import { api, setAccessToken } from '../lib/api';
import { useAuth } from '../lib/auth';
import { applyServerErrors } from '../lib/forms';

type Values = z.infer<typeof ChangePasswordSchema>;

export default function SettingsPage() {
  const { user } = useAuth();
  const form = useForm<Values>({ resolver: zodResolver(ChangePasswordSchema) });
  const { errors, isSubmitting } = form.formState;

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      // Changing the password signs out every other device and returns a fresh session for this one.
      const { accessToken } = await api<{ accessToken: string }>('/auth/change-password', { method: 'POST', body: values });
      setAccessToken(accessToken);
      form.reset({ currentPassword: '', newPassword: '' });
      toast.success('Password changed. Other devices have been signed out.');
    } catch (err) {
      applyServerErrors(err, form.setError);
    }
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
      <PageHeader title="Settings" />
      <Card className="mb-6 p-5 sm:p-6">
        <h2 className="font-bold">Account</h2>
        <dl className="mt-3 grid grid-cols-[8rem_1fr] gap-y-2 text-sm">
          <dt className="text-slate-500">Name</dt><dd>{user?.name}</dd>
          <dt className="text-slate-500">Email</dt><dd>{user?.email}</dd>
          <dt className="text-slate-500">Account type</dt><dd className="capitalize">{user?.role}</dd>
        </dl>
      </Card>
      <Card className="p-5 sm:p-6">
        <h2 className="font-bold">Change password</h2>
        <form onSubmit={onSubmit} className="mt-4 space-y-4" noValidate>
          <Input label="Current password" type="password" autoComplete="current-password" error={errors.currentPassword?.message} {...form.register('currentPassword')} />
          <Input label="New password" type="password" autoComplete="new-password" hint="At least 8 characters, with a letter and a number" error={errors.newPassword?.message} {...form.register('newPassword')} />
          <Button type="submit" loading={isSubmitting}>Update password</Button>
        </form>
      </Card>
    </div>
  );
}
