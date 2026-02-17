import { useRef, useState } from 'react';
import { uploadImage } from '../api/upload';

const inputClass =
  'w-full py-2 px-3 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400/30';
const labelClass = 'block text-sm font-medium text-gray-600 mb-1';
const buttonClass =
  'py-2 px-3 text-sm font-medium text-white bg-primary-600 border-0 rounded-lg cursor-pointer hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-400/50 disabled:opacity-60';

interface ImageUploadFieldProps {
  label: string;
  hint?: string;
  value: string;
  onChange: (url: string) => void;
}

export function ImageUploadField({ label, hint, value, onChange }: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please choose an image (JPEG, PNG, GIF, or WebP).');
      return;
    }
    e.target.value = '';
    setUploading(true);
    try {
      const { url } = await uploadImage(file);
      onChange(url);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <span className={labelClass}>{label}</span>
      {hint && <p className="text-xs text-gray-500 mb-1">{hint}</p>}
      <div className="flex flex-col gap-2">
        <div className="flex gap-2 items-center flex-wrap">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className={buttonClass}
          >
            {uploading ? 'Uploading…' : 'Choose image to upload'}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            className="hidden"
            onChange={handleFile}
          />
          {value && (
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary-400 hover:underline"
            >
              Open current image
            </a>
          )}
        </div>
        {value && (
          <div className="rounded-lg border border-gray-300 overflow-hidden bg-gray-50 max-w-[280px]">
            <img src={value} alt="" className="w-full h-auto object-cover max-h-40" />
          </div>
        )}
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
          placeholder="Or paste an image URL"
        />
      </div>
    </div>
  );
}
