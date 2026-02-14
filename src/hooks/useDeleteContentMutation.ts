import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteContent } from '../api/content';

export function useDeleteContentMutation() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (key: string) => deleteContent(key),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['admin', 'content'] });
    },
  });
}
