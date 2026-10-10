import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { toast } from 'sonner';
import { ApiError } from './api';

/** Puts server-side field errors onto the form, and toasts anything else. */
export function applyServerErrors<T extends FieldValues>(err: unknown, setError: UseFormSetError<T>) {
  if (err instanceof ApiError && Object.keys(err.fieldErrors).length) {
    for (const [field, messages] of Object.entries(err.fieldErrors)) {
      setError(field as Path<T>, { message: messages[0] });
    }
    return;
  }
  toast.error(err instanceof Error ? err.message : 'Something went wrong');
}

export const toastError = (err: unknown) => toast.error(err instanceof Error ? err.message : 'Something went wrong');
