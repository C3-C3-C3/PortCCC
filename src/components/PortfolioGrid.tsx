import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppState, Project } from '../types';
import ProjectCard from './ProjectCard';

interface PortfolioGridProps {
  activeState: AppState;
  isPeeking: boolean;
  projects: Project[];
  isGridAtBottom: boolean;
  onNavigate: (state: AppState) => void;
  onSelectProject: (project: Project) => void;
  checkGridScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  gridWrapperRef: React.RefObject<HTMLDivElement | null>;
}

export default function PortfolioGrid({
  activeState,
  isPeeking,
  projects,
  isGridAtBottom,
  onNavigate,
  onSelectProject,
  checkGridScroll,
  gridWrapperRef
}: PortfolioGridProps) {
  const prevStateRef = useRef<AppState>(activeState);
  const isDirectJump =
    (prevStateRef.current === 'hero' && activeState === 'services') ||
    (prevStateRef.current === 'services' && activeState === 'hero');

  useEffect(() => {
    prevStateRef.current = activeState;
  }, [activeState]);

  return (
    <motion.div
      className="fixed left-0 right-0 h-screen shadow-[0_-20px_60px_rgba(27,242,163,0.15),0_-4px_20px_rgba(105,158,191,0.1)] z-30 flex flex-col rounded-t-xl overflow-hidden border-t border-transparent/20"
      initial={{ top: '100vh' }}
      animate={{
        top: activeState === 'hero' ? (isPeeking ? '88vh' : '100vh') : (activeState === 'services' ? '-100vh' : '0vh'),
        opacity: activeState === 'services' ? 0 : 1,
        borderRadius: activeState === 'projects' ? '0px' : '12px',
      }}
      transition={{ duration: isDirectJump ? 0 : 0.8, ease: [0.77, 0, 0.175, 1] }}
      style={{
        pointerEvents: activeState === 'services' ? 'none' : 'auto',
      }}
    >
      <div className="flex justify-between items-center px-6 md:px-10 py-4 border-b border-transparent/15 shrink-0 z-20">
        <div className="flex items-center gap-4">
          <h2 className="font-sans text-lg md:text-xl font-black text-brand-red uppercase tracking-tight">
            Proyectos destacados
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <button
              onClick={() => onNavigate('hero')}
              className="font-sans text-[11px] font-bold tracking-wider uppercase transition-all duration-300 bg-white text-brand-red px-4 py-2 rounded-lg cursor-none flex items-center justify-center shadow-[0_0_10px_rgba(0,255,255,0.2)] hover:text-brand-green hover:shadow-[0_0_15px_rgba(27,242,163,0.3)]"
            >
              Inicio
            </button>
            <button
              onClick={() => onNavigate('services')}
              className="font-sans text-[11px] font-bold tracking-wider uppercase transition-all duration-300 bg-white text-brand-red px-4 py-2 rounded-lg cursor-none flex items-center justify-center gap-1.5 shadow-[0_0_10px_rgba(0,255,255,0.2)] hover:text-brand-green hover:shadow-[0_0_15px_rgba(27,242,163,0.3)]"
            >
              ↓ Servicios
            </button>
          </div>
        </div>
      </div>

      <div
        ref={gridWrapperRef}
        onScroll={checkGridScroll}
        className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar px-6 md:px-10 py-8 pb-20 md:pb-24"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 lg:gap-10 pb-6 md:pb-8">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onOpenDetail={(proj) => onSelectProject(proj)}
            />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {activeState === 'projects' && isGridAtBottom && (
          <motion.div
            className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 pointer-events-none z-40"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <span className="font-sans text-[10px] font-bold text-brand-red tracking-[0.15em] uppercase">
              Scroll ↓
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
