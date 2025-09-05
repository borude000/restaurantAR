import { useEffect, useRef } from "react";
import "@google/model-viewer";

interface ModelViewerProps {
  src: string;
  alt: string;
  className?: string;
}

// Extend the HTMLElement interface to include model-viewer
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': any;
    }
  }
}

export default function ModelViewer({ src, alt, className = "" }: ModelViewerProps) {
  const modelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Model viewer will automatically load when the component mounts
  }, [src]);

  return (
    <model-viewer
      ref={modelRef}
      src={src}
      alt={alt}
      auto-rotate
      camera-controls
      loading="lazy"
      className={`w-full h-64 ${className}`}
      style={{
        backgroundColor: '#f0f0f0',
        borderRadius: '8px',
      }}
      data-testid="model-viewer"
    />
  );
}