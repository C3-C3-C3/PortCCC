import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Project } from '../types';

import { X, ChevronLeft, ChevronRight, Play, Maximize2, Share2, Check, Sparkles, Film, Image as ImageIcon, MessageSquare, ArrowRight, ArrowUpRight, Home } from 'lucide-react';

interface ProjectDetailModalProps {
  project: Project | null;
  projects: Project[];
  onClose: () => void;
  onSelectProject: (project: Project) => void;
  onGoHome?: () => void;
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

export default function ProjectDetailModal({
  project,
  projects,
  onClose,
  onSelectProject,
  onGoHome,
}: ProjectDetailModalProps) {
  const [activeMediaIdx, setActiveMediaIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isFullscreenMedia, setIsFullscreenMedia] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const ytIframeRef = useRef<HTMLIFrameElement>(null);
  const [isPlayingYt, setIsPlayingYt] = useState(true);

  // Reset active media index when project changes
  useEffect(() => {
    setActiveMediaIdx(0);
    setIsFullscreenMedia(false);
  }, [project?.id]);
  
  useEffect(() => {
    setIsPlayingYt(true);
  }, [activeMediaIdx, project?.id]);

  const toggleYouTube = () => {
    if (!ytIframeRef.current) return;
    const nextState = !isPlayingYt;
    setIsPlayingYt(nextState);
    const command = nextState ? 'playVideo' : 'pauseVideo';
    ytIframeRef.current.contentWindow?.postMessage(JSON.stringify({ event: 'command', func: command, args: [] }), '*');
  };

  // Modal scroll lock
  useEffect(() => {
    if (project) {
      document.body.classList.add('project-modal-open');
    }
    return () => {
      document.body.classList.remove('project-modal-open');
    };
  }, [project]);

  // Keyboard accessibility
  useEffect(() => {
    if (!project) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else {
        const idx = projects.findIndex(p => p.id === project.id);
        if (idx !== -1) {
          if (e.key === 'ArrowRight') {
            const nextIdx = (idx + 1) % projects.length;
            onSelectProject(projects[nextIdx]);
          } else if (e.key === 'ArrowLeft') {
            const prevIdx = (idx - 1 + projects.length) % projects.length;
            onSelectProject(projects[prevIdx]);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [project, projects]);

  if (!project) return null;

  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    return match ? match[1] : null;
  };

  const isVideoUrl = (url: string) => {
    if (!url) return false;
    const clean = url.trim();
    if (getYouTubeId(clean)) return false;
    if (project.videos && project.videos.some(v => v.trim() === clean)) return true;
    if (project.video && project.video.trim() === clean) return true;
    if (/\.(mp4|webm|ogg|mov)($|\?)/i.test(clean)) return true;
    return false;
  };

  // Build list of media items
  const mediaItems: { type: 'video' | 'image' | 'youtube'; url: string }[] = [];
  const seenUrls = new Set<string>();

  const addMedia = (url?: string) => {
    if (!url) return;
    const clean = url.trim();
    if (!clean || seenUrls.has(clean)) return;
    seenUrls.add(clean);
    
    const isYt = getYouTubeId(clean) !== null;
    mediaItems.push({
      type: isYt ? 'youtube' : (isVideoUrl(clean) ? 'video' : 'image'),
      url: clean,
    });
  };

  if (project.video) addMedia(project.video);
  if (project.videos && project.videos.length > 0) project.videos.forEach(addMedia);
  if (project.images && project.images.length > 0) project.images.forEach(addMedia);
  if (project.image) addMedia(project.image);

  const currentMedia = mediaItems[activeMediaIdx % Math.max(1, mediaItems.length)];

  // Navigation between projects
  const currentIndexInList = projects.findIndex(p => p.id === project.id);
  
  const handlePrevProject = () => {
    if (projects.length === 0) return;
    const prevIdx = (currentIndexInList - 1 + projects.length) % projects.length;
    onSelectProject(projects[prevIdx]);
  };

  const handleNextProject = () => {
    if (projects.length === 0) return;
    const nextIdx = (currentIndexInList + 1) % projects.length;
    onSelectProject(projects[nextIdx]);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 bg-[#050508] text-white flex flex-col justify-between overflow-hidden cursor-none w-screen h-screen origin-center"
        initial={{
          opacity: 0,
          scale: 0.84,
          borderRadius: '32px',
          clipPath: 'inset(10% 10% 10% 10% round 32px)',
        }}
        animate={{
          opacity: 1,
          scale: 1,
          borderRadius: '0px',
          clipPath: 'inset(0% 0% 0% 0% round 0px)',
        }}
        exit={{
          opacity: 0,
          scale: 0.86,
          borderRadius: '32px',
          clipPath: 'inset(10% 10% 10% 10% round 32px)',
        }}
        transition={{
          duration: 0.5,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        {/* Custom High-Res Background Image Layer with Translucent Glass Overlay */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <img loading="lazy" decoding="async"
            src="https://lh3.googleusercontent.com/d/1AxH9s5W1xCiQ89oS4kPuF42DYuqMKuR6=w2560"
            alt=""
            className="w-full h-full object-cover object-center opacity-85 filter brightness-105 contrast-110"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050508]/40 via-[#050508]/20 to-[#050508]/50 mix-blend-multiply" />
        </div>

        {/* Ambient Glass Glow background overlay */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-brand-green/10 rounded-full blur-[140px] pointer-events-none z-0" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-brand-green/10 rounded-full blur-[140px] pointer-events-none z-0" />

        {/* Top Header Navigation Bar (Transparent) */}
        <div className="px-6 md:px-12 py-3 flex items-center justify-between gap-4 bg-transparent z-30 shrink-0 overflow-visible">
          <div className="flex items-center gap-3 overflow-visible">
            {/* GRUPO 1: Botón Principal de Navegación */}
            <div className="flex items-center gap-2">
              <div className="p-1 -m-1 overflow-visible">
                
                  
<button
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg bg-transparent border border-white/30 text-white hover:border-brand-green hover:text-brand-green text-xs font-sans font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-none shadow-md hover:shadow-[0_0_15px_rgba(27,242,163,0.3)]"
                  >
                    <ChevronLeft className="w-4 h-4 text-current" />
                    <span>{currentIndexInList !== -1 ? 'Volver a Proyectos' : 'Cerrar Proyecto'}</span>
                  </button>

                
              </div>

              {currentIndexInList === -1 && onGoHome && (
                <div className="p-1 -m-1 overflow-visible">
                  
                    
<button
                      onClick={onGoHome}
                      className="px-4 py-2 rounded-lg bg-transparent border border-white/30 text-white hover:border-brand-green hover:text-brand-green text-xs font-sans font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-none shadow-md hover:shadow-[0_0_15px_rgba(27,242,163,0.3)]"
                      title="Volver al inicio"
                    >
                      <Home className="w-4 h-4 text-current" />
                      <span className="hidden sm:inline">Inicio</span>
                    </button>

                  
                </div>
              )}
            </div>

            <span className="hidden sm:inline-block font-sans text-xs text-white font-bold tracking-widest uppercase pl-3 border-l border-white/15">
              {project.tags}
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-visible">
            {/* GRUPO 2: Botón Secundario de Compartir */}
            <div className="p-1 -m-1 overflow-visible">
              
                
<button
                  onClick={handleCopyLink}
                  className="px-4 py-2 rounded-lg bg-transparent border border-white/30 text-white hover:border-brand-green hover:text-brand-green text-xs font-sans font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-none shadow-md hover:shadow-[0_0_15px_rgba(27,242,163,0.3)]"
                  title="Copiar enlace"
                >
                  {copied ? <Check className="w-4 h-4 text-brand-green" /> : <Share2 className="w-4 h-4 text-current" />}
                  <span className="hidden sm:inline">{copied ? 'Enlace Copiado' : 'Compartir'}</span>
                </button>

              
            </div>

            {/* GRUPO 2: Botón Cerrar */}
            <div className="p-1 -m-1 overflow-visible">
              
                
<button
                  onClick={onClose}
                  className="w-9 h-9 rounded-lg bg-transparent border border-white/30 text-white hover:border-brand-green hover:text-brand-green transition-all duration-300 cursor-none flex items-center justify-center shadow-md hover:shadow-[0_0_15px_rgba(27,242,163,0.3)]"
                  title="Cerrar vista (Esc)"
                >
                  <X className="w-4 h-4 text-current" />
                </button>

              
            </div>
          </div>
        </div>

        {/* Main Content Page Container */}
        <div className="flex-1 w-full max-w-7xl mx-auto px-6 md:px-12 py-6 md:py-8 overflow-y-auto no-scrollbar relative z-10 flex flex-col justify-center">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch pb-2">
            {/* Left Column: Media Stage (Glassmorphic Player) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-7 xl:col-span-8 bg-white/10 backdrop-blur-sm p-3 md:p-5 rounded-3xl border-none flex flex-col justify-between shadow-[0_16px_40px_rgba(0,0,0,0.5)] overflow-visible"
            >
              {/* Featured Media Player / Viewer */}
              <div className="relative w-full aspect-video sm:aspect-[16/10] bg-black/50 rounded-2xl overflow-hidden border-none flex items-center justify-center group shadow-xl">
                {currentMedia ? (
                  currentMedia.type === 'youtube' ? (
                    <div className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-auto group overflow-hidden">
                      {/* Blurred Background Poster */}
                      <img loading="lazy" decoding="async"
                        src={`https://img.youtube.com/vi/${getYouTubeId(currentMedia.url)}/hqdefault.jpg`}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-60 transition-transform duration-700 ease-in-out z-0"
                      />
                      {/* Invisible overlay to block YouTube UI hover & allow custom play/pause */}
                      <div 
                        className="absolute inset-0 z-20 cursor-pointer flex items-center justify-center" 
                        onClick={toggleYouTube}
                      >
                        {!isPlayingYt && (
                          <div className="w-16 h-16 rounded-full bg-brand-green flex items-center justify-center shadow-[0_0_30px_rgba(27,242,163,0.5)] transition-transform hover:scale-110">
                            <Play className="w-8 h-8 ml-1 fill-black text-black" />
                          </div>
                        )}
                      </div>
                      <div className="absolute inset-0 z-10 w-full h-full pointer-events-none flex items-center justify-center">
                        <iframe
                          ref={ytIframeRef}
                          key={currentMedia.url}
                          src={`https://www.youtube.com/embed/${getYouTubeId(currentMedia.url)}?autoplay=1&mute=0&controls=0&modestbranding=1&rel=0&enablejsapi=1&disablekb=1&iv_load_policy=3`}
                          allow="autoplay; encrypted-media"
                          className="w-full aspect-video"
                          style={{ border: 'none' }}
                        />
                      </div>
                    </div>
                  ) : currentMedia.type === 'video' ? (
                    <video
                      key={currentMedia.url}
                      ref={videoRef}
                      src={getOptimizedMediaUrl(currentMedia.url)}
                      controls
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className={`absolute inset-0 w-full h-full overflow-y-auto overflow-x-hidden no-scrollbar bg-black/80 rounded-2xl ${!(project?.tags || '').toLowerCase().includes('web') ? 'flex items-center justify-center' : ''}`}>
                      <img loading="lazy" decoding="async"
                        src={getOptimizedMediaUrl(currentMedia.url)}
                        alt={project?.title || ''}
                        className={(project?.tags || '').toLowerCase().includes('web') ? "w-full h-auto min-h-full object-cover" : "w-full h-full object-contain"}
                      />
                    </div>
                  )
                ) : (
                  <div className="text-slate-500 font-sans text-xs">Sin media disponible</div>
                )}

                {/* Media Type Indicator */}
                {currentMedia && (
                  <div className="absolute top-3 left-3 z-10 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-mono font-bold tracking-wider border-none flex items-center gap-1.5 shadow-lg pointer-events-none">
                    {currentMedia.type === 'video' || currentMedia.type === 'youtube' ? (
                      <>
                        <Film className="w-3 h-3 text-white" />
                        <span className="text-white">VIDEO</span>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-3 h-3 text-white" />
                        <span className="text-white">IMAGEN</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* GRUPO 4: Media Thumbnails Selector */}
              {mediaItems.length > 1 && (
                <div className="mt-4 flex flex-wrap justify-center items-center gap-3.5 py-4 px-3 overflow-visible">
                  {mediaItems.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveMediaIdx(idx)}
                      className={`relative w-20 h-14 rounded-xl transition-all duration-300 cursor-none flex-shrink-0 backdrop-blur-md p-0.5 ${
                        idx === activeMediaIdx
                          ? 'border-2 border-transparent shadow-[0_0_24px_rgba(27,242,163,0.7)] scale-105 bg-black/40 z-10'
                          : 'border-none bg-black/30 hover:bg-black/50 opacity-75 hover:opacity-100 hover:scale-102 z-0'
                      }`}
                    >
                      <div className="w-full h-full rounded-[10px] overflow-hidden relative">
                        {item.type === 'video' ? (
                          <div className="w-full h-full flex items-center justify-center text-brand-green bg-black/60">
                            <Play className="w-5 h-5 fill-brand-green" />
                          </div>
                        ) : item.type === 'youtube' ? (
                          <>
                            <img loading="lazy" decoding="async"
                              src={`https://img.youtube.com/vi/${getYouTubeId(item.url)}/default.jpg`}
                              alt={`Thumbnail ${idx + 1}`}
                              className="w-full h-full object-cover opacity-80"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Play className="w-5 h-5 fill-brand-green text-brand-green drop-shadow-md" />
                            </div>
                          </>
                        ) : (
                          <img loading="lazy" decoding="async"
                            src={getOptimizedMediaUrl(item.url)}
                            alt={`Thumbnail ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Right Column: Essential Info Panel (Glassmorphism) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5 xl:col-span-4 p-6 md:p-8 rounded-3xl border-none bg-white/10 backdrop-blur-sm text-white flex flex-col justify-between shadow-[0_16px_40px_rgba(0,0,0,0.5)] space-y-6"
            >
              <div className="space-y-5">
                <div>
                  <span className="font-sans text-xs font-extrabold text-brand-green tracking-widest uppercase block mb-1">
                    {project.tags}
                  </span>
                  <h1 className="font-sans font-black text-2xl md:text-3xl text-white uppercase tracking-tight leading-tight">
                    {project.title}
                  </h1>
                </div>

                <p className="font-sans text-sm md:text-base text-slate-200 leading-relaxed font-normal">
                  {project.details}
                </p>

                {/* Botón que inicia el diálogo */}
                <div className="pt-2 p-1 -m-1 overflow-visible">
                  
                    <a
                      href={`mailto:c.clavera.c@gmail.com?subject=${encodeURIComponent(`Consulta sobre proyecto: ${project.title}`)}`}
                      className="w-full py-2.5 px-4 rounded-lg bg-transparent border border-white/30 text-white hover:border-brand-green hover:text-brand-green font-sans text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 cursor-none shadow-md hover:shadow-[0_0_15px_rgba(27,242,163,0.3)]"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-current" />
                      <span>Iniciar Diálogo</span>
                      <ArrowRight className="w-3.5 h-3.5 text-current" />
                    </a>
                  
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Flechas de navegación de proyectos */}
        {projects.length > 1 && currentIndexInList !== -1 && (
          <>
            <div className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-40 p-1 -m-1 overflow-visible">
              
                
<button
                  onClick={handlePrevProject}
                  className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-transparent border border-white/30 text-white hover:border-brand-green hover:text-brand-green transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-[0_0_15px_rgba(27,242,163,0.3)] cursor-none group"
                  aria-label="Proyecto anterior"
                  title="Proyecto anterior"
                >
                  <ChevronLeft className="w-6 h-6 text-current transition-transform duration-200 group-hover:-translate-x-0.5" />
                </button>

              
            </div>

            <div className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-40 p-1 -m-1 overflow-visible">
              
                
<button
                  onClick={handleNextProject}
                  className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-transparent border border-white/30 text-white hover:border-brand-green hover:text-brand-green transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-[0_0_15px_rgba(27,242,163,0.3)] cursor-none group"
                  aria-label="Siguiente proyecto"
                  title="Siguiente proyecto"
                >
                  <ChevronRight className="w-6 h-6 text-current transition-transform duration-200 group-hover:translate-x-0.5" />
                </button>

              
            </div>
          </>
        )}

        {/* Bottom Status / Footer Bar (Transparent) */}
        <div className="px-6 md:px-12 py-3 bg-transparent text-[11px] font-sans font-bold text-white flex justify-between items-center shrink-0 z-30">
          <span className="text-white font-semibold">{project.title}</span>
          <span className="tracking-widest uppercase text-white">Portafolio — Camilo Clavera</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
