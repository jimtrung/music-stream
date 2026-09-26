/**
 * Utility functions for constructing full URLs from relative paths
 */

const getBackendBaseUrl = (): string => {
  const ipAddress = import.meta.env.VITE_IP_ADDRESS || '127.0.0.1';
  const minioPort = import.meta.env.VITE_MINIO_PORT || '9000';
  return `http://${ipAddress}:${minioPort}/musicstream`;
};

/**
 * Convert a relative audio URL to a full URL
 * @example
 * getAudioUrl('/audio/tracks/01110c3c-33b2-4f4b-8ec2-43c7e261c599.mp3')
 * // Returns: http://127.0.0.1:9000/musicstream/audio/tracks/01110c3c-33b2-4f4b-8ec2-43c7e261c599.mp3
 */
export const getAudioUrl = (audioUrl?: string): string | undefined => {
  if (!audioUrl) return undefined;
  if (audioUrl.startsWith('http')) return audioUrl;
  return `${getBackendBaseUrl()}${audioUrl}`;
};

/**
 * Convert a relative cover URL to a full URL
 * @example
 * getCoverUrl('/images/covers/0d711029-b882-472c-930b-773ef3f1227d.jpg')
 * // Returns: http://127.0.0.1:9000/musicstream/images/covers/0d711029-b882-472c-930b-773ef3f1227d.jpg
 */
export const getCoverUrl = (coverUrl?: string): string | undefined => {
  if (!coverUrl) return undefined;
  if (coverUrl.startsWith('http')) return coverUrl;
  return `${getBackendBaseUrl()}${coverUrl}`;
};

export const DEFAULT_PLAYLIST_COVER = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=1000&auto=format&fit=crop';
