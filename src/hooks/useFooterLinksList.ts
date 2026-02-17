import { useQuery } from '@tanstack/react-query';
import { listFooterLinks } from '../api/footerLinks';

export function useFooterLinksList() {
  return useQuery({
    queryKey: ['admin', 'footer-links'],
    queryFn: () => listFooterLinks(),
  });
}
