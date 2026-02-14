import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext.js';
import { login as loginApi } from '../api/auth';

export function useLoginMutation() {
  const { setToken } = useAuth();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      loginApi(email, password),
    onSuccess: (data) => {
      setToken(data.token);
    },
  });
}
