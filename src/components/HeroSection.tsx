import React from 'react';
import { motion } from 'motion/react';
import ScrambleText from './ScrambleText';
import { AppState } from '../types';

interface HeroSectionProps {
  activeState: AppState;
  isPeeking: boolean;
  mousePos: { x: number; y: number };
}

export default function HeroSection({ activeState, isPeeking, mousePos }: HeroSectionProps) {
  return (
    <motion.section
      className="absolute inset-0 h-screen flex flex-col items-center justify-center text-center z-10 pointer-events-none"
      initial={{ opacity: 1, scale: 1 }}
      animate={{
        opacity: activeState === 'hero' ? 1 : 0,
        scale: activeState === 'hero' ? 1 : 0.9,
        y: isPeeking ? -40 : 0,
      }}
      transition={{ duration: 0.75, ease: [0.77, 0, 0.175, 1] }}
      style={{
        pointerEvents: 'none',
      }}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none z-0 opacity-30 overflow-hidden perspective-[1000px]">
        <motion.div 
          className="font-serif italic text-center leading-[0.85] text-[13.5vw] md:text-[9.5vw] uppercase text-transparent select-none max-w-[95vw]"
          animate={{
            rotateX: mousePos.y * -20,
            rotateY: mousePos.x * 20,
            x: mousePos.x * 40,
            y: mousePos.y * 40
          }}
          transition={{ type: 'spring', stiffness: 80, damping: 20, mass: 0.4 }}
          style={{
            WebkitTextStroke: '1.2px #00FFC2',
            filter: 'drop-shadow(0 0 6px rgba(0,255,194,0.4))',
            transformStyle: 'preserve-3d',
          }}
        >
          SOLUCIONES WEB
          <br />
          Y VISUALES
        </motion.div>
      </div>

      <h1 
        className="relative z-10 font-sans font-black text-brand-red leading-[0.95] md:leading-[0.95] tracking-tight text-[9.5vw] md:text-[6.2vw] uppercase select-none transition-all duration-300 max-w-[95vw] text-center"
        style={{
          pointerEvents: activeState === 'hero' ? 'auto' : 'none',
        }}
      >
        <ScrambleText text="SOLUCIONES WEB" delay={300} duration={1200} triggerOnHover className="justify-center text-brand-red" />
        <br />
        <ScrambleText text="Y VISUALES" delay={650} duration={1200} triggerOnHover className="justify-center text-brand-red" />
      </h1>
      <p 
        className="relative z-10 mt-6 font-sans text-[13px] md:text-[15px] font-bold text-brand-blue uppercase tracking-[0.15em] transition-all duration-300"
        style={{
          pointerEvents: activeState === 'hero' ? 'auto' : 'none',
        }}
      >
        Diseño gráfico · Animación · Ilustración · Montevideo, UY
      </p>

      <motion.div
        className="absolute bottom-10 flex flex-col items-center gap-2 z-10 transition-all duration-300"
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        style={{
          pointerEvents: activeState === 'hero' ? 'auto' : 'none',
        }}
      >
        <span className="font-sans text-[10px] font-bold text-brand-red tracking-[0.15em] uppercase">
          Scroll ↓
        </span>
      </motion.div>
    </motion.section>
  );
}
