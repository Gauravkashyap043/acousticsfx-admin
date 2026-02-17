import { useQuery } from '@tanstack/react-query';
import { listContent } from '../api/content';

export function useContentList(params?: { limit?: number; skip?: number }) {
  return useQuery({
    queryKey: ['admin', 'content', params],
    queryFn: () => listContent(params),
  });
}
