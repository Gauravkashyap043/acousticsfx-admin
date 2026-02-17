import { useQuery } from '@tanstack/react-query';
import { listClients } from '../api/clients';

export function useClientsList() {
  return useQuery({
    queryKey: ['admin', 'clients'],
    queryFn: () => listClients(),
  });
}
