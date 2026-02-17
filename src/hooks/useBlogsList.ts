import { useQuery } from '@tanstack/react-query';
import { listBlogs } from '../api/blogs';

export function useBlogsList() {
  return useQuery({
    queryKey: ['admin', 'blogs'],
    queryFn: () => listBlogs(),
  });
}
