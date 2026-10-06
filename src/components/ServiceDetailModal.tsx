import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Service, Project } from '../types';
import { ChevronLeft, ChevronRight, Share2, Check, MessageSquare, ArrowRight, Home } from 'lucide-react';

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

interface ServiceDetailModalProps {
  service: Service | null;
  services: Service[];
  onClose: () => void;
  onSelectService: (service: Service) => void;
  onOpenProject?: (project: Project) => void;
  isCovered?: boolean;
  onGoHome?: () => void;
}


interface ServiceProjectCardProps {
  project: Project;
  onOpenProject?: (project: Project) => void;
  serviceId?: string;
}

function ServiceProjectCard({ project, onOpenProject, serviceId }: ServiceProjectCardProps) {
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

  const primaryUrl = project.image || (project.images && project.images[0]) || project.video || (project.videos && project.videos[0]) || '';
  const isYt = primaryUrl ? getYouTubeId(primaryUrl) !== null : false;
  const isVid = primaryUrl ? isVideoUrl(primaryUrl) : false;
  const optimizedUrl = getOptimizedMediaUrl(primaryUrl);

  const ytId = isYt ? getYouTubeId(primaryUrl) : null;
  const ytPoster = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : '';

  return (
    <div 
      onClick={() => onOpenProject?.(project)}
      className="aspect-[4/3] rounded-2xl bg-black/40 backdrop-blur-sm flex items-center justify-center overflow-hidden relative group cursor-none transition-all duration-500 shadow-none"
    >
      {primaryUrl ? (
        <>
          {/* Blurred Background Media for Filling Card Space */}
          {isVid ? (
            <video
              src={optimizedUrl}
              muted
              playsInline
              loop
              autoPlay
              className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-60 transition-transform duration-700 ease-in-out z-0 group-hover:scale-110"
            />
          ) : isYt ? (
            <img loading="lazy" decoding="async"
              src={ytPoster}
              alt=""
              className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-60 transition-transform duration-700 ease-in-out z-0 group-hover:scale-110"
            />
          ) : (
            <img loading="lazy" decoding="async"
              src={optimizedUrl}
              alt=""
              className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-60 transition-transform duration-700 ease-in-out z-0 group-hover:scale-110"
            />
          )}

          {/* Foreground Media */}
          {isVid ? (
            <video
              src={optimizedUrl}
              muted
              playsInline
              loop
              autoPlay
              className="absolute inset-0 w-full h-full object-contain transition-all duration-700 ease-in-out z-10 group-hover:scale-105"
            />
          ) : isYt ? (
            <div className="absolute inset-0 w-full h-full flex items-center justify-center transition-all duration-700 ease-in-out z-10 overflow-hidden rounded-xl group-hover:scale-105">
              <iframe
                src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&loop=1&playlist=${ytId}&controls=0&modestbranding=1&rel=0&iv_load_policy=3&disablekb=1`}
                allow="autoplay; encrypted-media"
                className="w-full aspect-video"
                style={{ border: 'none', pointerEvents: 'none' }}
              />
            </div>
          ) : (
            <img loading="lazy" decoding="async"
              src={optimizedUrl}
              alt={project.title}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out z-10 group-hover:scale-105 ${serviceId === '4' ? 'object-center' : 'object-top'}`}
            />
          )}
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white/40 text-xs font-sans uppercase tracking-wider">Sin imagen</div>
        </div>
      )}

      {/* Title & Info Overlay */}
      <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-20 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <h3 className="text-white font-sans font-bold text-lg">
          {project.title}
        </h3>
        {project.tags && (
          <p className="text-slate-300 font-sans text-xs font-medium tracking-wide truncate mt-0.5">
            {project.tags}
          </p>
        )}
        <span className="text-brand-green font-sans text-xs uppercase tracking-widest mt-1">
          Ver Proyecto →
        </span>
      </div>
    </div>
  );
}

export default function ServiceDetailModal({
  service,
  services,
  onClose,
  onSelectService,
  onOpenProject,
  isCovered,
  onGoHome,
}: ServiceDetailModalProps) {
  const [copied, setCopied] = useState(false);
  const [direction, setDirection] = useState(0);

  // Modal scroll lock
  useEffect(() => {
    if (service) {
      document.body.classList.add('service-modal-open');
    }
    return () => {
      document.body.classList.remove('service-modal-open');
    };
  }, [service]);

  // Keyboard accessibility
  useEffect(() => {
    if (!service) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        handleNextService();
      } else if (e.key === 'ArrowLeft') {
        handlePrevService();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [service, services]);

  if (!service) return null;

  const currentIndexInList = services.findIndex(s => s.id === service.id);
  
  const handlePrevService = () => {
    if (services.length === 0) return;
    setDirection(-1);
    const prevIdx = (currentIndexInList - 1 + services.length) % services.length;
    onSelectService(services[prevIdx]);
  };

  const handleNextService = () => {
    if (services.length === 0) return;
    setDirection(1);
    const nextIdx = (currentIndexInList + 1) % services.length;
    onSelectService(services[nextIdx]);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const wheelVariants = {
    enter: (direction: number) => ({
      rotate: direction > 0 ? 90 : -90,
      opacity: 0,
    }),
    center: {
      rotate: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      rotate: direction > 0 ? -90 : 90,
      opacity: 0,
    })
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

        {/* Ambient Glows */}
        <div 
          className="absolute inset-0 opacity-40 transition-all duration-1000 z-0 mix-blend-screen"
          style={{ background: service.gradient }} 
        />
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-brand-green/10 rounded-full blur-[140px] pointer-events-none z-0" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-brand-green/10 rounded-full blur-[140px] pointer-events-none z-0" />

        {/* Top Header Navigation Bar */}
        <div className="px-6 md:px-12 py-3 flex items-center justify-between gap-4 bg-transparent z-30 shrink-0 overflow-visible">
          <div className="flex items-center gap-3 overflow-visible">
            <div className="flex items-center gap-2">
              <div className="p-1 -m-1 overflow-visible">
                
                  










<button
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg bg-transparent border border-white/30 text-white hover:border-brand-green hover:text-brand-green text-xs font-sans font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-none shadow-md hover:shadow-[0_0_15px_rgba(27,242,163,0.3)]"
                  >
                    <ChevronLeft className="w-4 h-4 text-current" />
                    <span>Volver a Servicios</span>
                  </button>



                
              </div>

              {onGoHome && (
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
              Servicio
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-visible">
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
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden relative z-20 w-full">
          <AnimatePresence mode="popLayout" custom={direction}>
            <motion.div
              key={service.id}
              custom={direction}
              variants={wheelVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 overflow-y-auto no-scrollbar px-6 md:px-12 py-12 flex flex-col items-center w-full"
              style={{ transformOrigin: '50% 300vh' }}
            >
              <div className="py-4 md:py-8 text-white flex flex-col space-y-6 w-full max-w-4xl shrink-0">
                <div className="space-y-4 text-center">
                  <span className="font-sans text-sm font-extrabold text-brand-green tracking-[0.2em] uppercase block mb-2">
                    Área de Especialidad
                  </span>
                  <h1 className="font-sans font-black text-4xl md:text-5xl lg:text-6xl text-white uppercase tracking-tight leading-tight">
                    {service.name}
                  </h1>
                </div>

                <p className="font-sans text-lg md:text-xl text-slate-200 leading-relaxed font-normal text-center max-w-2xl mx-auto">
                  {service.description}
                </p>
              </div>

              {/* Projects Gallery Section */}
              <div className="w-full max-w-7xl mt-16 space-y-10 pb-20 shrink-0">
                <div className="flex flex-wrap justify-center gap-6 md:gap-8">
                  {service.projects && service.projects.length > 0 ? (
                    service.projects.map((proj, idx) => (
                      <div key={proj.id || idx} className="w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.333rem)]">
                        <ServiceProjectCard 
                          serviceId={service.id}
                          project={proj} 
                          onOpenProject={onOpenProject} 
                        />
                      </div>
                    ))
                  ) : (
                    [1, 2, 3, 4, 5, 6].map((item) => (
                      <div key={item} className="w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.333rem)]">
                        <div 
                          className="aspect-[4/3] rounded-2xl bg-black/40 backdrop-blur-sm  flex items-center justify-center overflow-hidden relative group cursor-none"
                        >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none" />
                        <div className="z-0 flex flex-col items-center gap-3 opacity-30 group-hover:opacity-100 transition-opacity duration-500 text-brand-green">
                          <div className="w-12 h-12 rounded-full border border-current flex items-center justify-center">
                            <span className="font-sans text-xl">+</span>
                          </div>
                          <p className="font-sans text-[10px] uppercase tracking-widest text-white text-center px-4">
                            Próximamente
                          </p>
                        </div>
                      </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Arrows */}
        {services.length > 1 && (
          <>
            <div className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-40 p-1 -m-1 overflow-visible">
              
                
<button
                  onClick={handlePrevService}
                  className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-transparent border border-white/30 text-white hover:border-brand-green hover:text-brand-green transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-[0_0_15px_rgba(27,242,163,0.3)] cursor-none group"
                >
                  <ChevronLeft className="w-6 h-6 text-current transition-transform duration-200 group-hover:-translate-x-0.5" />
                </button>



              
            </div>
            <div className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-40 p-1 -m-1 overflow-visible">
              
                
<button
                  onClick={handleNextService}
                  className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-transparent border border-white/30 text-white hover:border-brand-green hover:text-brand-green transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-[0_0_15px_rgba(27,242,163,0.3)] cursor-none group"
                >
                  <ChevronRight className="w-6 h-6 text-current transition-transform duration-200 group-hover:translate-x-0.5" />
                </button>



              
            </div>
          </>
        )}

        {/* Bottom Footer */}
        <div className="px-6 md:px-12 py-3 bg-transparent text-[11px] font-sans font-bold text-white flex justify-between items-center shrink-0 z-30">
          <span className="text-white font-semibold">{service.name}</span>
          <span className="tracking-widest uppercase text-white">Servicios — Camilo Clavera</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
