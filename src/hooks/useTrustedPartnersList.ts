import { useQuery } from '@tanstack/react-query';
import { listTrustedPartners } from '../api/trustedPartners';

export function useTrustedPartnersList() {
  return useQuery({
    queryKey: ['admin', 'trusted-partners'],
    queryFn: () => listTrustedPartners(),
  });
}
