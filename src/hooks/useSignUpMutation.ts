import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext.js';
import { signUp as signUpApi } from '../api/auth';

export function useSignupMutation() {
  const { setToken } = useAuth();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      signUpApi(email, password),
    onSuccess: (data) => {
      setToken(data.token);
    },
  });
}
