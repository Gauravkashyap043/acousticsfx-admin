import { useQuery } from '@tanstack/react-query';
import { getContentByKey } from '../api/content';

export function useContentByKey(key: string | null) {
  return useQuery({
    queryKey: ['admin', 'content', key],
    queryFn: () => getContentByKey(key!),
    enabled: !!key,
  });
}
