import { useQuery } from '@tanstack/react-query';
import { listContactSubmissions } from '../api/contactSubmissions';

export function useContactSubmissionsList(params?: { limit?: number; skip?: number }) {
  return useQuery({
    queryKey: ['admin', 'contact-submissions', params],
    queryFn: () => listContactSubmissions(params),
  });
}
