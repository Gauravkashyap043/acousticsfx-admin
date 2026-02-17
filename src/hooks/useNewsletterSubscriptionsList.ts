import { useQuery } from '@tanstack/react-query';
import { listNewsletterSubscriptions } from '../api/newsletter';

export function useNewsletterSubscriptionsList(params?: { limit?: number; skip?: number }) {
  return useQuery({
    queryKey: ['admin', 'newsletter-subscriptions', params],
    queryFn: () => listNewsletterSubscriptions(params),
  });
}
