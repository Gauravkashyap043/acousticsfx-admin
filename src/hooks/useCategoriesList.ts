import { useQuery } from '@tanstack/react-query';
import { listCategories } from '../api/categories';

export function useCategoriesList() {
  return useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: () => listCategories(),
  });
}
