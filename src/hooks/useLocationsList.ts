import { useQuery } from '@tanstack/react-query';
import { listLocations } from '../api/locations';

export function useLocationsList() {
  return useQuery({
    queryKey: ['admin', 'locations'],
    queryFn: () => listLocations(),
  });
}
