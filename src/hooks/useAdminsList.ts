import { useQuery } from '@tanstack/react-query';
import { listAdmins } from '../api/admins';

export function useAdminsList() {
  return useQuery({
    queryKey: ['admin', 'admins'],
    queryFn: () => listAdmins(),
  });
}
