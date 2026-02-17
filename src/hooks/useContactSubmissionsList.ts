import { useQuery } from '@tanstack/react-query';
import { listContactSubmissions } from '../api/contactSubmissions';

export function useContactSubmissionsList() {
  return useQuery({
    queryKey: ['admin', 'contact-submissions'],
    queryFn: listContactSubmissions,
  });
}
