
import React, { useState, useCallback, memo, useEffect } from 'react';

interface FastImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
  priority?: boolean;
}

export const FastImage = memo<FastImageProps>(({ 
  src, 
  alt, 
  className = '', 
  loading = 'lazy',
  onLoad,
  onError,
  priority = false
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setHasError(true);
    onError?.();
  }, [onError]);

  // Preload critical images
  useEffect(() => {
    if (priority && src) {
      const preloadImg = new Image();
      preloadImg.src = src;
    }
  }, [src, priority]);

  if (hasError) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
        <span className="text-gray-400 text-xs">✨</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`${className} transition-opacity duration-150 ${
        isLoaded ? 'opacity-100' : 'opacity-0'
      }`}
      loading={loading}
      decoding="async"
      onLoad={handleLoad}
      onError={handleError}
      style={{
        contentVisibility: 'auto',
        containIntrinsicSize: '200px 200px'
      }}
    />
  );
});

FastImage.displayName = 'FastImage';
