/**
 * Prepares raster images for upload without visible quality loss:
 * only downscales when the longest edge exceeds MAX_EDGE_PX (very large sources).
 * Original files are sent as-is when already within limits — no re-encode for size.
 * When downscaling, format is preserved (PNG/WebP/JPEG) with high-quality settings.
 */
const MAX_EDGE_PX = 8192;
const JPEG_QUALITY = 0.92;
const WEBP_QUALITY = 0.95;

function outputMimeAndQuality(fileType: string): { mime: string; quality?: number } {
  if (fileType === 'image/png') return { mime: 'image/png' };
  if (fileType === 'image/webp') return { mime: 'image/webp', quality: WEBP_QUALITY };
  return { mime: 'image/jpeg', quality: JPEG_QUALITY };
}

function extensionForMime(mime: string): string {
  if (mime === 'image/png') return 'png';
  if (mime === 'image/webp') return 'webp';
  return 'jpg';
}

export async function compressImageForUpload(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) return file;
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') return file;

  let bitmap: ImageBitmap | null = null;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }

  try {
    const { width, height } = bitmap;
    if (width < 1 || height < 1) return file;

    const maxDim = Math.max(width, height);
    const scale = Math.min(1, MAX_EDGE_PX / maxDim);
    if (scale >= 1) {
      return file;
    }

    const w = Math.max(1, Math.round(width * scale));
    const h = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;

    ctx.drawImage(bitmap, 0, 0, w, h);

    const { mime, quality } = outputMimeAndQuality(file.type);
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), mime, quality);
    });

    if (!blob) return file;
    if (blob.size >= file.size) return file;

    const baseName = file.name.replace(/\.[^.]+$/, '') || 'image';
    const ext = extensionForMime(mime);
    return new File([blob], `${baseName}.${ext}`, { type: mime });
  } finally {
    bitmap.close();
  }
}
