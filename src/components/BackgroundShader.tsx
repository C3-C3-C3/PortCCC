import { useEffect, useRef } from 'react';
import { AppState } from '../types';

interface BackgroundShaderProps {
  activeState: AppState;
}

export default function BackgroundShader({ activeState }: BackgroundShaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let script = document.getElementById('unicorn-studio-script') as HTMLScriptElement;
    
    const initializeUnicorn = () => {
      const u = (window as any).UnicornStudio;
      if (u && u.init) {
        try {
          u.init();
        } catch (err) {
          console.error('Error initializing Unicorn Studio:', err);
        }
      }
    };

    if (!script) {
      script = document.createElement('script');
      script.id = 'unicorn-studio-script';
      script.src = 'https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.2.6/dist/unicornStudio.umd.js';
      script.async = true;
      script.onload = () => {
        initializeUnicorn();
      };
      document.head.appendChild(script);
    } else {
      if ((window as any).UnicornStudio) {
        initializeUnicorn();
      } else {
        const prevOnload = script.onload;
        script.onload = (e) => {
          if (prevOnload) (prevOnload as any)(e);
          initializeUnicorn();
        };
      }
    }

    // Attempt init in case it's already loaded globally
    initializeUnicorn();
  }, []);

  const isActive = true; // Always show the background shader

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-0 pointer-events-none transition-opacity duration-1000 ease-in-out"
      style={{
        opacity: isActive ? 1 : 0,
      }}
    >
      <div 
        data-us-project="ijyWmNHlmbzEktyoP96v"
        className="absolute inset-0 w-full h-full"
        style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
      />
      {/* Capa blanca constante para mantener la misma transparencia en todas las secciones */}
      <div 
        className="absolute inset-0 bg-white/90 pointer-events-none z-10 transition-colors duration-700 ease-in-out" 
      />
    </div>
  );
}
