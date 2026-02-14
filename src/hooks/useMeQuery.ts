import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext.js';
import { me } from '../api/auth';

export function useMeQuery() {
  const { token } = useAuth();

  return useQuery({
    queryKey: ['me'],
    queryFn: me,
    enabled: !!token,
    retry: false,
    staleTime: 5 * 60 * 1000,
    throwOnError: false,
  });
}
