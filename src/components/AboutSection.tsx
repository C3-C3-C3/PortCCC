import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { GlowingEffect } from './ui/glowing-effect';

interface AboutSectionProps {
  isVisible: boolean;
  onBack: () => void;
  mousePos?: { x: number; y: number };
}

const getOptimizedMediaUrl = (url: string) => {
  if (!url) return url;
  const cleanUrl = url.trim();
  
  const driveMatch = cleanUrl.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch && driveMatch[1]) {
    const directDriveUrl = `https://drive.google.com/uc?export=view&id=${driveMatch[1]}`;
    return `/api/proxy-image?url=${encodeURIComponent(directDriveUrl)}&v=2`;
  }
  
  const driveUcMatch = cleanUrl.match(/drive\.google\.com\/uc\?.*?id=([a-zA-Z0-9_-]+)/);
  if (driveUcMatch && driveUcMatch[1]) {
    const directDriveUrl = `https://drive.google.com/uc?export=view&id=${driveUcMatch[1]}`;
    return `/api/proxy-image?url=${encodeURIComponent(directDriveUrl)}&v=2`;
  }
  
  return cleanUrl;
};

export default function AboutSection({ isVisible, onBack, mousePos }: AboutSectionProps) {
  const [localMousePos, setLocalMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!isVisible) return;
    const handleMove = (e: MouseEvent) => {
      setLocalMousePos({
        x: (e.clientX / window.innerWidth) - 0.5,
        y: (e.clientY / window.innerHeight) - 0.5,
      });
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, [isVisible]);

  const currentMouse = mousePos || localMousePos;

  return (
    <motion.div
      className="fixed top-0 right-0 w-screen h-screen bg-transparent z-40 overflow-hidden flex flex-col items-center justify-center cursor-none"
      initial={{ x: '100vw' }}
      animate={{ x: isVisible ? '0vw' : '100vw' }}
      transition={{ duration: 0.8, ease: [0.77, 0, 0.175, 1] }}
      style={{
        pointerEvents: isVisible ? 'auto' : 'none',
      }}
    >
      {/* Background Graphic Layer from Google Drive */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden">
        <motion.div
          className="w-full h-full flex items-center justify-center"
          initial={{ opacity: 0, scale: 1.15 }}
          animate={{
            opacity: isVisible ? 0.5 : 0,
            scale: isVisible ? 1.25 : 1.15,
          }}
          transition={{ duration: 1.0, ease: 'easeInOut' }}
        >
          <motion.img
            src={getOptimizedMediaUrl('https://drive.google.com/file/d/1mJ2675EQfcZfGAVuAz5r5gahHzeUcPzF/view?usp=drive_link')}
            alt="Fondo Sobre Mí"
            className="w-full h-full object-cover object-center pointer-events-none select-none"
            animate={{
              rotate: -30 + currentMouse.x * 8,
              x: currentMouse.x * 55,
              y: currentMouse.y * 55,
            }}
            transition={{
              type: 'spring',
              stiffness: 70,
              damping: 20,
              mass: 0.4,
            }}
          />
        </motion.div>
      </div>

      <div className="relative z-10 max-w-5xl w-full px-8 md:px-16 flex flex-col md:flex-row items-center gap-12 perspective-[1000px]">
        
        {/* Profile / Image Card with Parallax & EaseInOut styled like Proyectos destacados */}
        <motion.div 
          className="flex-1 w-full flex justify-center"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ 
            opacity: isVisible ? 1 : 0, 
            scale: isVisible ? 1 : 0.95,
            x: currentMouse.x * 35,
            y: isVisible ? currentMouse.y * 35 : 20,
          }}
          transition={{
            opacity: { duration: 1.0, ease: 'easeInOut' },
            scale: { duration: 1.0, ease: 'easeInOut' },
            x: { type: 'spring', stiffness: 70, damping: 20, mass: 0.4 },
            y: { type: 'spring', stiffness: 70, damping: 20, mass: 0.4 },
          }}
        >
          <motion.div 
            className="relative w-64 sm:w-72 md:w-80 h-[380px] md:h-[430px] select-none flex flex-col group/card"
            animate={{
              rotateX: currentMouse.y * -14,
              rotateY: currentMouse.x * 14,
            }}
            transition={{ type: 'spring', stiffness: 70, damping: 20, mass: 0.4 }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            <GlowingEffect
              spread={40}
              glow={true}
              disabled={false}
              proximity={120}
              inactiveZone={0.01}
              borderWidth={2}
            />
            <div className="proj-card relative z-10 overflow-hidden bg-white border border-brand-green/20 select-none flex flex-col flex-1 group rounded-sm w-full h-full shadow-[0_0_10px_rgba(0,255,255,0.2)] hover:shadow-[0_0_15px_rgba(27,242,163,0.3)] transition-all duration-300">
              <img
                src={getOptimizedMediaUrl('https://drive.google.com/file/d/1Tap_xjwyYnlU_sUCdkFzOsyphds3TRkt/view?usp=drive_link')}
                alt="C. Clavera - Foto Sobre Mí"
                className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          </motion.div>
        </motion.div>

        {/* Content with Parallax & EaseInOut */}
        <div className="flex-1 w-full text-left flex flex-col">
          <motion.h2 
            className="font-sans font-black text-brand-red text-5xl md:text-7xl uppercase tracking-tight mb-6"
            initial={{ opacity: 0, y: 25 }}
            animate={{ 
              opacity: isVisible ? 1 : 0,
              x: currentMouse.x * 25,
              y: isVisible ? currentMouse.y * 25 : 25,
            }}
            transition={{
              opacity: { duration: 1.0, ease: 'easeInOut' },
              x: { type: 'spring', stiffness: 70, damping: 20, mass: 0.4 },
              y: { type: 'spring', stiffness: 70, damping: 20, mass: 0.4 },
            }}
          >
            Sobre Mí
          </motion.h2>

          <motion.p 
            className="font-sans text-lg md:text-xl font-bold text-black mb-8 leading-relaxed max-w-xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ 
              opacity: isVisible ? 1 : 0,
              x: currentMouse.x * 18,
              y: isVisible ? currentMouse.y * 18 : 30,
            }}
            transition={{
              opacity: { duration: 1.0, ease: 'easeInOut' },
              x: { type: 'spring', stiffness: 70, damping: 20, mass: 0.4 },
              y: { type: 'spring', stiffness: 70, damping: 20, mass: 0.4 },
            }}
          >
            Hola, soy C. Clavera. Especialista en branding, animación y dirección de arte con base en Montevideo, UY.
            Creo soluciones visuales dinámicas y estratégicas para elevar la comunicación de tu marca.
          </motion.p>

          <motion.div 
            className="flex flex-col gap-4"
            initial={{ opacity: 0, y: 35 }}
            animate={{ 
              opacity: isVisible ? 1 : 0,
              x: currentMouse.x * 12,
              y: isVisible ? currentMouse.y * 12 : 35,
            }}
            transition={{
              opacity: { duration: 1.0, ease: 'easeInOut' },
              x: { type: 'spring', stiffness: 70, damping: 20, mass: 0.4 },
              y: { type: 'spring', stiffness: 70, damping: 20, mass: 0.4 },
            }}
          >
            <button
              onClick={onBack}
              className="self-start px-6 py-3 rounded-lg bg-white text-brand-red text-sm font-sans font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-none shadow-[0_0_10px_rgba(0,255,255,0.2)] hover:text-brand-green hover:shadow-[0_0_15px_rgba(27,242,163,0.3)]"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Volver a Inicio</span>
            </button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
