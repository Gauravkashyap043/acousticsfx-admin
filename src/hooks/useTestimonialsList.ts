import { useQuery } from '@tanstack/react-query';
import { listTestimonials } from '../api/testimonials';

export function useTestimonialsList() {
  return useQuery({
    queryKey: ['admin', 'testimonials'],
    queryFn: () => listTestimonials(),
  });
}
