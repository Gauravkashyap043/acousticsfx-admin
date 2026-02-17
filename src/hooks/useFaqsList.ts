import { useQuery } from '@tanstack/react-query';
import { listFaqs } from '../api/faqs';

export function useFaqsList() {
  return useQuery({
    queryKey: ['admin', 'faqs'],
    queryFn: () => listFaqs(),
  });
}
