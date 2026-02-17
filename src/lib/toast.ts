import { toast as sonnerToast } from 'sonner';
import { ApiError } from './api';

export const toast = {
  error: (err: unknown) => {
    const message =
      err instanceof ApiError
        ? err.message
        : err instanceof Error
          ? err.message
          : 'Something went wrong';
    sonnerToast.error(message);
  },
  success: (message: string) => sonnerToast.success(message),
  ...sonnerToast,
};
