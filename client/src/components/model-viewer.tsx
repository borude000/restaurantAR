import { useEffect, useRef, useState } from "react";
import "@google/model-viewer";
import { Button } from "@/components/ui/button";
import { Camera, RotateCcw } from "lucide-react";
import { FadeIn, TapScale } from "@/components/ui/motion";

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
  const [progress, setProgress] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Attach model-viewer events for progress and error diagnostics
    const el = modelRef.current as any | null;
    setProgress(0);
    setIsLoading(true);
    setError(null);

    if (!el) return;

    const onProgress = (event: any) => {
      // totalProgress ranges 0..1
      const p = Math.round((event.detail?.totalProgress ?? 0) * 100);
      setProgress(p);
    };

    const onLoad = () => {
      console.timeEnd?.("model-load-time");
      setIsLoading(false);
      setProgress(100);
    };

    const onError = (e: any) => {
      const msg = e?.detail?.message || e?.message || "Failed to load model";
      setError(String(msg));
      setIsLoading(false);
      console.error("model-viewer error:", e);
    };

    console.time?.("model-load-time");
    el.addEventListener("progress", onProgress);
    el.addEventListener("load", onLoad);
    el.addEventListener("error", onError);

    return () => {
      el.removeEventListener("progress", onProgress);
      el.removeEventListener("load", onLoad);
      el.removeEventListener("error", onError);
    };
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
        crossorigin="anonymous"
        className="w-full h-64"
        style={{
          backgroundColor: '#f0f0f0',
          borderRadius: '8px',
        }}
        data-testid="model-viewer"
      />

      {/* Loading / Progress overlay */}
      {isLoading && (
        <FadeIn className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 rounded-md">
          <div className="w-40 h-2 bg-white/40 rounded overflow-hidden">
            <div
              className="h-full bg-white"
              style={{ width: `${progress}%`, transition: 'width 150ms linear' }}
            />
          </div>
          <div className="mt-2 text-white text-sm">Loading model… {progress}%</div>
        </FadeIn>
      )}

      {/* Error overlay */}
      {error && (
        <FadeIn className="absolute inset-0 flex items-center justify-center bg-red-600/70 rounded-md p-3">
          <div className="text-white text-sm text-center">
            Failed to load 3D model.
            <br />
            <span className="opacity-90">{error}</span>
          </div>
        </FadeIn>
      )}
      
      {/* AR Controls */}
      <div className="absolute bottom-4 right-4 flex space-x-2">
        <TapScale>
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
        </TapScale>
        
        {isARMode && (
          <TapScale>
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
          </TapScale>
        )}
      </div>
    </div>
  );
}