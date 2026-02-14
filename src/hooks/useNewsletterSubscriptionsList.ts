import { useQuery } from '@tanstack/react-query';
import { listNewsletterSubscriptions } from '../api/newsletter';

export function useNewsletterSubscriptionsList() {
  return useQuery({
    queryKey: ['admin', 'newsletter-subscriptions'],
    queryFn: listNewsletterSubscriptions,
  });
}
