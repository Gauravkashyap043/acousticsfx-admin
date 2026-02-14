import { useQuery } from '@tanstack/react-query';
import { listProducts } from '../api/products';

export function useProductsList() {
  return useQuery({
    queryKey: ['admin', 'products'],
    queryFn: () => listProducts(),
  });
}
