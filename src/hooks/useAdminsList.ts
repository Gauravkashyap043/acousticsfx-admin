import { useQuery } from '@tanstack/react-query';
import { listAdmins } from '../api/admins';

export function useAdminsList(params?: { page?: number; limit?: number }) {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 10;
  return useQuery({
    queryKey: ['admin', 'admins', page, limit],
    queryFn: () => listAdmins({ page, limit }),
  });
}
