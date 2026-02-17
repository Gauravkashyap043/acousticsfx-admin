import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createAdmin, updateAdmin, deleteAdmin } from '../api/admins';

export function useCreateAdminMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      email: string;
      password: string;
      role?: string;
      visibleTabs?: string[];
    }) => createAdmin(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'admins'] });
    },
  });
}

export function useUpdateAdminMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: { role?: string; visibleTabs?: string[] };
    }) => updateAdmin(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'admins'] });
    },
  });
}

export function useDeleteAdminMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAdmin(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'admins'] });
    },
  });
}
