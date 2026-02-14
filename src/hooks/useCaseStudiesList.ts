import { useQuery } from '@tanstack/react-query';
import { listCaseStudies } from '../api/caseStudies';

export function useCaseStudiesList() {
  return useQuery({
    queryKey: ['admin', 'case-studies'],
    queryFn: () => listCaseStudies(),
  });
}
