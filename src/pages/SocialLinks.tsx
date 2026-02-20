import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Facebook, Instagram, Twitter, Linkedin, Youtube, ExternalLink } from 'lucide-react';
import { getContentByKey, updateContent } from '../api/content';
import { inputClass, primaryBtnClass } from '../lib/styles';
import PageShell from '../components/PageShell';
import { InlineLoader } from '../components/EmptyState';

const PLATFORMS = [
  { key: 'social.facebook', label: 'Facebook', icon: Facebook, placeholder: 'https://facebook.com/yourpage' },
  { key: 'social.instagram', label: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/yourhandle' },
  { key: 'social.twitter', label: 'X / Twitter', icon: Twitter, placeholder: 'https://x.com/yourhandle' },
  { key: 'social.linkedin', label: 'LinkedIn', icon: Linkedin, placeholder: 'https://linkedin.com/company/yourco' },
  { key: 'social.youtube', label: 'YouTube', icon: Youtube, placeholder: 'https://youtube.com/@yourchannel' },
] as const;

type SocialValues = Record<string, string>;

export default function SocialLinks() {
  const queryClient = useQueryClient();
  const [values, setValues] = useState<SocialValues>({});
  const [dirty, setDirty] = useState(false);

  const queries = useQuery({
    queryKey: ['admin', 'social-links'],
    queryFn: async () => {
      const results = await Promise.allSettled(
        PLATFORMS.map((p) => getContentByKey(p.key))
      );
      const map: SocialValues = {};
      results.forEach((r, i) => {
        map[PLATFORMS[i].key] = r.status === 'fulfilled' ? r.value.value : '';
      });
      return map;
    },
  });

  useEffect(() => {
    if (queries.data) {
      setValues(queries.data);
      setDirty(false);
    }
  }, [queries.data]);

  const mutation = useMutation({
    mutationFn: async (vals: SocialValues) => {
      await Promise.all(
        PLATFORMS.map((p) =>
          updateContent(p.key, { value: vals[p.key] ?? '', type: 'text' })
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'social-links'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'content'] });
      setDirty(false);
    },
  });

  const handleChange = (key: string, val: string) => {
    setValues((prev) => ({ ...prev, [key]: val }));
    setDirty(true);
  };

  return (
    <PageShell title="Social Links">
      {queries.isLoading && <InlineLoader />}
      {queries.isError && (
        <p className="text-sm text-red-600">Failed to load social links. Make sure content keys are seeded.</p>
      )}
      {queries.data && (
        <div className="max-w-xl">
          <p className="text-sm text-gray-500 mb-6">
            Manage your social media links. Leave a field empty to hide that icon on the website.
          </p>
          <div className="flex flex-col gap-4">
            {PLATFORMS.map((platform) => {
              const Icon = platform.icon;
              const url = values[platform.key] ?? '';
              return (
                <div key={platform.key} className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 text-gray-600 shrink-0">
                    <Icon size={20} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      {platform.label}
                    </label>
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => handleChange(platform.key, e.target.value)}
                      placeholder={platform.placeholder}
                      className={inputClass}
                    />
                  </div>
                  {url && (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 p-2 text-gray-400 hover:text-primary-500 transition-colors"
                      title="Open link"
                    >
                      <ExternalLink size={16} />
                    </a>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => mutation.mutate(values)}
              disabled={!dirty || mutation.isPending}
              className={primaryBtnClass}
            >
              {mutation.isPending ? 'Saving…' : 'Save changes'}
            </button>
            {mutation.isError && (
              <p className="mt-2 text-sm text-red-600">
                {(mutation.error as Error).message}
              </p>
            )}
            {mutation.isSuccess && !dirty && (
              <p className="mt-2 text-sm text-green-600">Saved successfully.</p>
            )}
          </div>
        </div>
      )}
    </PageShell>
  );
}
