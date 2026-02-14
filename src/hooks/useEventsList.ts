import { useQuery } from '@tanstack/react-query';
import { listEvents } from '../api/events';

export function useEventsList() {
  return useQuery({
    queryKey: ['admin', 'events'],
    queryFn: () => listEvents(),
  });
}
