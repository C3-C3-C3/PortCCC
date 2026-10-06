import React, { useRef, useState, useEffect } from 'react';
import { Project } from '../types';
import { ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';
import { GlowingEffect } from './ui/glowing-effect';

interface ProjectCardProps {
  project: Project;
  onOpenDetail?: (project: Project) => void;
}

const KNOWN_VIDEO_DRIVE_IDS = new Set([
  '15o5Sh7MGyC9vC-zMbcQfkU3OGMGE8ZG4',
  '1MHMlndrs7iJetPtrefTMbB7SwkcvKXmH',
  '1acS299paZ1Qo3OnEK0saiuBNxVx00z8f',
  '1F8yivIuy_GY7nVjOfsJL8JAh_4Hvk5Jl',
  '17hkgxw8t2oNh4WX6QOV2bGwdiW5_u7Ww',
  '1-aifqXkRSn19z66Imj2sJTSqtENtW3wy'
]);

const getDriveId = (url: string): string | null => {
  if (!url) return null;
  const match = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/) ||
                url.match(/drive\.google\.com\/uc\?.*?id=([a-zA-Z0-9_-]+)/) ||
                url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
};

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

export default function ProjectCard({ project, onOpenDetail }: ProjectCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Map<number, HTMLVideoElement>>(new Map());
  const bgVideoRefs = useRef<Map<number, HTMLVideoElement>>(new Map());
  
  const [tiltStyle, setTiltStyle] = useState({});
  const [isHovered, setIsHovered] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [detectedVideos, setDetectedVideos] = useState<Set<string>>(new Set());
  
  const maxTilt = 8; // Max tilt angle

  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    return match ? match[1] : null;
  };

  const isVideoUrl = React.useCallback((url: string): boolean => {
    if (!url) return false;
    const clean = url.trim();
    if (getYouTubeId(clean)) return false; // YouTube will be treated separately
    if (detectedVideos.has(clean)) return true;
    if (project.video && clean === project.video.trim()) return true;
    if (project.videos && project.videos.some(v => v.trim() === clean)) return true;
    if (/\.(mp4|webm|ogg|mov)($|\?)/i.test(clean)) return true;
    const driveId = getDriveId(clean);
    if (driveId && KNOWN_VIDEO_DRIVE_IDS.has(driveId)) {
      return true;
    }
    return false;
  }, [project.video, project.videos, detectedVideos]);

  // Check unknown URLs against /api/media-type
  useEffect(() => {
    const checkUrls = async () => {
      const urlsToCheck: string[] = [];
      if (project.video) urlsToCheck.push(project.video);
      if (project.videos) project.videos.forEach(u => urlsToCheck.push(u));
      if (project.images) project.images.forEach(u => urlsToCheck.push(u));
      if (project.image) urlsToCheck.push(project.image);

      for (const rawUrl of urlsToCheck) {
        if (!rawUrl) continue;
        const clean = rawUrl.trim();
        if (isVideoUrl(clean)) continue;

        try {
          const res = await fetch(`/api/media-type?url=${encodeURIComponent(clean)}`);
          if (res.ok) {
            const data = await res.json();
            if (data.type === 'video') {
              setDetectedVideos(prev => new Set(prev).add(clean));
            }
          }
        } catch {
          // Ignore network errors
        }
      }
    };
    checkUrls();
  }, [project.video, project.videos, project.images, project.image, isVideoUrl]);

  // Build a unified media array
  const mediaItems = React.useMemo(() => {
    const items: { type: 'video' | 'image' | 'youtube', url: string }[] = [];
    const seenUrls = new Set<string>();

    const addUrl = (rawUrl?: string) => {
      if (!rawUrl) return;
      const url = rawUrl.trim();
      if (!url || seenUrls.has(url)) return;
      seenUrls.add(url);

      const isYt = getYouTubeId(url) !== null;
      const isVid = isVideoUrl(url);
      items.push({ type: isYt ? 'youtube' : (isVid ? 'video' : 'image'), url });
    };
    
    if (project.video) {
      addUrl(project.video);
    }
    if (project.videos && project.videos.length > 0) {
      project.videos.forEach(addUrl);
    }

    if (project.images && project.images.length > 0) {
      project.images.forEach(addUrl);
    } else if (project.image) {
      addUrl(project.image);
    }
    
    return items;
  }, [project.video, project.videos, project.images, project.image, isVideoUrl]);

  // Manage playback and auto-advance for active media slide
  useEffect(() => {
    if (mediaItems.length === 0) return;
    const activeIdx = (currentIdx % mediaItems.length + mediaItems.length) % mediaItems.length;
    const currentMedia = mediaItems[activeIdx];

    // Handle video play/pause
    videoRefs.current.forEach((vid, idx) => {
      if (!vid) return;
      if (idx === activeIdx) {
        vid.muted = true;
        const promise = vid.play();
        if (promise !== undefined) {
          promise.catch(() => {});
        }
      } else {
        vid.pause();
        vid.currentTime = 0;
      }
    });

    bgVideoRefs.current.forEach((vid, idx) => {
      if (!vid) return;
      if (idx === activeIdx) {
        vid.muted = true;
        const promise = vid.play();
        if (promise !== undefined) {
          promise.catch(() => {});
        }
      } else {
        vid.pause();
        vid.currentTime = 0;
      }
    });

    // If active item is an image and there are multiple media items, set auto-advance timer
    if (currentMedia?.type === 'image' && mediaItems.length > 1) {
      const timer = setTimeout(() => {
        setCurrentIdx(prev => (prev + 1) % mediaItems.length);
      }, 4500); // 4.5 seconds per image
      return () => clearTimeout(timer);
    }
  }, [currentIdx, mediaItems]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    
    const rotateY = x * maxTilt * 2;
    const rotateX = -y * maxTilt * 2;
    
    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
      transition: 'transform 0.1s ease-out',
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTiltStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)',
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    const activeIdx = (currentIdx % mediaItems.length + mediaItems.length) % mediaItems.length;
    const activeVid = videoRefs.current.get(activeIdx);
    if (activeVid) {
      activeVid.muted = true;
      activeVid.play().catch(() => {});
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mediaItems.length > 1) {
      setCurrentIdx(prev => (prev + 1) % mediaItems.length);
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mediaItems.length > 1) {
      setCurrentIdx(prev => (prev - 1 + mediaItems.length) % mediaItems.length);
    }
  };

  return (
    <div
      ref={cardRef}
      className="relative w-full h-[var(--card-h,70vh)] min-h-[400px] cursor-none transition-all duration-500 ease-out will-change-transform flex flex-col rounded-sm p-[1.5px]"
      style={{
        transformStyle: 'preserve-3d',
        ...tiltStyle,
      }}
      onClick={() => onOpenDetail?.(project)}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <GlowingEffect
        spread={40}
        glow={true}
        disabled={false}
        proximity={120}
        inactiveZone={0.01}
        borderWidth={2}
      />
      <div
        className="proj-card relative z-10 overflow-hidden bg-white border border-brand-green/20 select-none flex flex-col flex-1 group rounded-sm w-full h-full min-h-[inherit] shadow-[0_0_10px_rgba(0,255,255,0.2)] hover:shadow-[0_0_15px_rgba(27,242,163,0.3)] transition-all duration-300"
      >
        {/* Glow highlight overlay */}
        <div
          className="absolute inset-0 pointer-events-none z-20 transition-opacity duration-500 rounded-sm opacity-0"
        />
        
        {/* Project Thumbnail container */}
        <div className="w-full flex-1 min-h-[240px] overflow-hidden relative bg-white z-10">
            {mediaItems.length > 0 ? (
              <div className="absolute inset-0 w-full h-full group/img bg-white z-10">
                {mediaItems.map((media, idx) => {
                  const isActive = idx === (currentIdx % mediaItems.length);
                  
                  const visibilityClasses = isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none';
                  const foregroundHover = isHovered ? 'scale-105 brightness-110' : 'scale-100 brightness-95';
                  const backgroundHover = isHovered ? 'scale-[1.15] brightness-100' : 'scale-110 brightness-100';

                if (media.type === 'video') {
                  const posterUrl = project.image && !isVideoUrl(project.image) && project.image !== project.video
                    ? getOptimizedMediaUrl(project.image)
                    : undefined;

                  return (
                    <div key={media.url + '_' + idx} className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${visibilityClasses}`}>
                      {/* Blurred Background Video */}
                      <video
                        ref={(el) => {
                          if (el) {
                            bgVideoRefs.current.set(idx, el);
                          } else {
                            bgVideoRefs.current.delete(idx);
                          }
                        }}
                        src={getOptimizedMediaUrl(media.url)}
                        poster={posterUrl}
                        loop={mediaItems.length === 1}
                        muted
                        playsInline
                        preload={isActive ? "auto" : "metadata"}
                        className={`absolute inset-0 w-full h-full object-cover blur-2xl opacity-50 transition-transform duration-700 ease-in-out z-0 ${backgroundHover}`}
                      />
                      {/* Foreground Video */}
                      <video
                        ref={(el) => {
                          if (el) {
                            videoRefs.current.set(idx, el);
                          } else {
                            videoRefs.current.delete(idx);
                          }
                        }}
                        src={getOptimizedMediaUrl(media.url)}
                        poster={posterUrl}
                        loop={mediaItems.length === 1}
                        muted
                        playsInline
                        preload={isActive ? "auto" : "metadata"}
                        onEnded={() => {
                          if (mediaItems.length > 1) {
                            setCurrentIdx(prev => (prev + 1) % mediaItems.length);
                          } else {
                            const vid = videoRefs.current.get(idx);
                            if (vid) {
                              vid.currentTime = 0;
                              vid.play().catch(() => {});
                            }
                          }
                        }}
                        onError={() => {
                          if (mediaItems.length > 1 && isActive) {
                            setTimeout(() => {
                              setCurrentIdx(prev => (prev + 1) % mediaItems.length);
                            }, 3000);
                          }
                        }}
                        className={`absolute inset-0 w-full h-full object-contain transition-all duration-700 ease-in-out z-10 ${foregroundHover}`}
                      />
                    </div>
                  );
                }
                
                if (media.type === 'youtube') {
                  const ytId = getYouTubeId(media.url);
                  const posterUrl = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
                  return (
                    <div key={media.url + '_' + idx} className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${visibilityClasses}`}>
                      {/* Blurred Background for Youtube */}
                      <img loading="lazy" decoding="async"
                        src={posterUrl}
                        alt=""
                        className={`absolute inset-0 w-full h-full object-cover blur-2xl opacity-50 transition-transform duration-700 ease-in-out z-0 ${backgroundHover}`}
                      />
                      {/* Foreground Youtube iframe */}
                      <div className={`absolute inset-0 w-full h-full flex items-center justify-center transition-all duration-700 ease-in-out z-10 overflow-hidden rounded-xl ${foregroundHover}`}>
                        <iframe
                          src={`https://www.youtube.com/embed/${ytId}?autoplay=${isActive ? 1 : 0}&mute=1&loop=1&playlist=${ytId}&controls=0&modestbranding=1&rel=0&iv_load_policy=3&disablekb=1`}
                          allow="autoplay; encrypted-media"
                          className="w-full aspect-video"
                          style={{ border: 'none', pointerEvents: 'none' }}
                        />
                      </div>
                    </div>
                  );
                }
                
                return (
                  <div key={media.url + '_' + idx} className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${visibilityClasses}`}>
                    {/* Blurred Background Image */}
                    <img loading="lazy" decoding="async"
                      src={getOptimizedMediaUrl(media.url)}
                      alt=""
                      className={`absolute inset-0 w-full h-full object-cover blur-2xl opacity-50 transition-transform duration-700 ease-in-out z-0 ${backgroundHover}`}
                    />
                    {/* Foreground Image */}
                    <img loading="lazy" decoding="async"
                      src={getOptimizedMediaUrl(media.url)}
                      alt={`${project.title} - media ${idx + 1}`}
                      onError={() => {
                        // Fallback: if image fails to load, mark as video
                        setDetectedVideos(prev => new Set(prev).add(media.url));
                      }}
                      className={`absolute inset-0 w-full h-full object-contain transition-all duration-700 ease-in-out z-10 ${foregroundHover}`}
                    />
                  </div>
                );
              })}
              
              {/* Gallery Navigation Controls */}
              {mediaItems.length > 1 && (
                <>
                  <div className="absolute left-2 top-1/2 -translate-y-1/2 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={handlePrev}
                      className="p-2 text-white hover:text-brand-green transition-all duration-300 cursor-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                      title="Imagen anterior"
                    >
                      <ChevronLeft className="w-8 h-8" />
                    </button>
                  </div>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={handleNext}
                      className="p-2 text-white hover:text-brand-green transition-all duration-300 cursor-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                      title="Siguiente imagen"
                    >
                      <ChevronRight className="w-8 h-8" />
                    </button>
                  </div>
                  
                  {/* Pagination Dots */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
                    {mediaItems.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentIdx(idx);
                        }}
                        className={`h-1.5 rounded-full transition-all duration-300 cursor-none ${
                          idx === (currentIdx % mediaItems.length)
                            ? 'w-5 bg-brand-green'
                            : 'w-1.5 bg-white/50 hover:bg-white'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-black/50">
               {/* Ambient subtle grid */}
               <svg
                viewBox="0 0 320 220"
                className={`w-full h-full object-cover transition-transform duration-700 ease-out ${
                  isHovered ? 'scale-110 brightness-110' : 'scale-100 brightness-50'
                }`}
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <pattern id="cardGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#cardGrid)" />
                <rect width="100%" height="100%" fill={project.gradient || '#333'} opacity="0.8" />
              </svg>
            </div>
          )}
        </div>

        {/* Project Info Panel */}
        <div className="proj-info bg-white p-4 border-t border-brand-green/10 flex-shrink-0 z-20 relative flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="proj-title font-sans font-bold text-sm text-brand-red uppercase tracking-wider group-hover:text-brand-green transition-colors duration-300 truncate">
              {project.title}
            </h3>
            <p className="proj-tags mt-0.5 font-sans text-xs text-brand-blue font-semibold tracking-wide truncate">
              {project.tags}
            </p>
            <div className="mt-1 font-sans text-[11px] text-brand-darkred line-clamp-1 italic">
              {project.details}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
