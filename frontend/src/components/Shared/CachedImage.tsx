import React, { useState, useEffect } from 'react';
import { Icon } from '../Icons/Icons';
import styles from './CachedImage.module.css';

interface CachedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt?: string;
  className?: string;
  fallbackIcon?: React.ComponentProps<typeof Icon>['name'];
  iconSize?: number;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}

// Global cache to store object URLs for images
const globalImageCache = new Map<string, string>();
// Keep track of pending requests to avoid duplicate fetches
const pendingRequests = new Map<string, Promise<string>>();

const fetchImageAsBlob = async (url: string): Promise<string> => {
  if (globalImageCache.has(url)) {
    return globalImageCache.get(url)!;
  }
  
  if (pendingRequests.has(url)) {
    return pendingRequests.get(url)!;
  }

  const promise = fetch(url, { cache: 'force-cache' })
    .then(res => {
      if (!res.ok) throw new Error('Network response was not ok');
      return res.blob();
    })
    .then(blob => {
      const objectUrl = URL.createObjectURL(blob);
      globalImageCache.set(url, objectUrl);
      pendingRequests.delete(url);
      return objectUrl;
    })
    .catch(err => {
      pendingRequests.delete(url);
      throw err;
    });

  pendingRequests.set(url, promise);
  return promise;
};

const CachedImage: React.FC<CachedImageProps> = ({
  src,
  alt = 'image',
  className = '',
  fallbackIcon = 'Music',
  iconSize = 24,
  objectFit = 'cover',
  ...rest
}) => {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!src) {
      setObjectUrl(null);
      setIsLoaded(false);
      setHasError(false);
      return;
    }

    let isMounted = true;
    setIsLoaded(false);
    setHasError(false);

    // If it's a data URL or already an object URL, just use it directly
    if (src.startsWith('data:') || src.startsWith('blob:')) {
      setObjectUrl(src);
      return;
    }

    // Try to fetch or get from cache
    fetchImageAsBlob(src)
      .then(url => {
        if (isMounted) {
          setObjectUrl(url);
        }
      })
      .catch(err => {
        console.error(`Failed to load image from ${src}:`, err);
        if (isMounted) {
          setHasError(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [src]);

  const handleLoad = () => setIsLoaded(true);
  const handleError = () => setHasError(true);

  const showPlaceholder = !objectUrl || hasError || !isLoaded;

  return (
    <div className={`${styles.imageContainer} ${className}`}>
      {/* Background Icon Placeholder */}
      {showPlaceholder && (
        <div className={styles.placeholder}>
          <Icon name={fallbackIcon} size={iconSize} />
        </div>
      )}
      
      {/* Actual Image */}
      {objectUrl && !hasError && (
        <img
          src={objectUrl}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          className={`${styles.image} ${isLoaded ? styles.loaded : ''}`}
          style={{ objectFit }}
          {...rest}
        />
      )}
    </div>
  );
};

export default CachedImage;
