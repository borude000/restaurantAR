import { useEffect, useRef, useState } from "react";
import "@google/model-viewer";
import { Button } from "@/components/ui/button";
import { Camera, RotateCcw } from "lucide-react";

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
  const [isARMode, setIsARMode] = useState(false);

  useEffect(() => {
    // Model viewer will automatically load when the component mounts
  }, [src]);


  const handleARClick = () => {
    if (modelRef.current && 'activateAR' in modelRef.current) {
      (modelRef.current as any).activateAR();
      setIsARMode(true);
    }
  };

  const handleRegularView = () => {
    setIsARMode(false);
  };

  return (
    <div className={`relative ${className}`}>
         <model-viewer
           ref={modelRef}
           src={src}
        alt={alt}
        auto-rotate
        camera-controls
        ar
        ar-modes="webxr scene-viewer quick-look"
        loading="lazy"
        environment-image="neutral"
        poster="https://modelviewer.dev/shared-assets/models/Astronaut.webp"
        shadow-intensity="1"
        className="w-full h-64"
        style={{
          backgroundColor: '#f0f0f0',
          borderRadius: '8px',
        }}
        data-testid="model-viewer"
      />
      
      {/* AR Controls */}
      <div className="absolute bottom-4 right-4 flex space-x-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={handleARClick}
          className="bg-black/70 text-white hover:bg-black/80"
          data-testid="button-ar-view"
        >
          <Camera size={16} className="mr-1" />
          AR View
        </Button>
        
        {isARMode && (
          <Button
            size="sm"
            variant="secondary"
            onClick={handleRegularView}
            className="bg-black/70 text-white hover:bg-black/80"
            data-testid="button-regular-view"
          >
            <RotateCcw size={16} className="mr-1" />
            Regular
          </Button>
        )}
      </div>
    </div>
  );
}