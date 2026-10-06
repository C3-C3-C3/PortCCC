import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppState, Project } from './types';
import Navigation from './components/Navigation';
import CustomCursor from './components/CustomCursor';
import BackgroundShader from './components/BackgroundShader';
import ScrambleText from './components/ScrambleText';
import HeroSection from './components/HeroSection';
import PortfolioGrid from './components/PortfolioGrid';
import ProjectCard from './components/ProjectCard';
import ServicesSection from './components/ServicesSection';
import AboutSection from './components/AboutSection';
import ProjectDetailModal from './components/ProjectDetailModal';
import LoadingScreen from './components/LoadingScreen';

const PROJECTS: Project[] = [
  {
    id: '1',
    title: 'Branding',
    tags: 'Branding · Identidad Visual',
    color: '#EA5628',
    gradient: 'linear-gradient(135deg, #00FFC2 0%, #EA5628 100%)',
    details: 'Análisis estratégica y diseño de marca.',
    image: 'https://drive.google.com/file/d/1zLgQG4x9zjvPKCfe_9CAwGLjVsCDEhJ8/view?usp=drive_link',
    images: [
      'https://drive.google.com/file/d/1zLgQG4x9zjvPKCfe_9CAwGLjVsCDEhJ8/view?usp=drive_link',
      'https://drive.google.com/file/d/1sk6kyEidTrqrlwjIqzFSv5ffBV1wwd8i/view?usp=drive_link',
      'https://drive.google.com/file/d/1RV7n3K8X-NWHOVS8xvoWgIHb8s-wVIkF/view?usp=drive_link',
      'https://drive.google.com/file/d/1cGHDHd1St-zfT2U_6hWaNSKBtMi4zdph/view?usp=drive_link',
      'https://drive.google.com/file/d/1PBf5ER8YVcxxTCyXHNgVkUN41eV72KkN/view?usp=drive_link'
    ]
  },
  {
    id: '2',
    title: 'Opening - B/side',
    tags: 'Motion Grafiphics',
    color: '#00FFC2',
    gradient: 'linear-gradient(135deg, #2B1F21 0%, #00FFC2 100%)',
    details: 'Exploración de ritmo y morfología en animación tridimensional interactiva.',
    video: 'https://drive.google.com/file/d/15o5Sh7MGyC9vC-zMbcQfkU3OGMGE8ZG4/view?usp=drive_link',
  },
  {
    id: '3',
    title: 'Campaña de concientisacion para la seguridad ',
    tags: 'Video - Story Board - Animación',
    color: '#EA5628',
    gradient: 'linear-gradient(135deg, #EA5628 0%, #2B1F21 100%)',
    details: 'Dirección de arte e ilustración para la edición de colección de Revista Montevideo.',
    video: 'https://www.youtube.com/watch?v=BYy8S3d-71U',
    videos: [
      'https://www.youtube.com/watch?v=BYy8S3d-71U',
      'https://www.youtube.com/watch?v=o_BxJP7YffY',
      'https://www.youtube.com/watch?v=saPCm-1aQAw',
      'https://www.youtube.com/watch?v=8GB4NhI1vy8',
      'https://www.youtube.com/watch?v=vEjAW2b80Gk'
    ]
  },
  {
    id: '4',
    title: 'Social Archive',
    tags: 'Digital Content · Social Media',
    color: '#2B1F21',
    gradient: 'linear-gradient(135deg, #00FFC2 0%, #2B1F21 100%)',
    details: 'Campaña interactiva y diseño de cuadrículas editoriales digitales para plataformas.',
    image: 'https://drive.google.com/file/d/1Brlfu9BNF9kU1zq6T9NTNhmC3ta1ypGK/view?usp=drive_link',
    images: [
      'https://drive.google.com/file/d/1Brlfu9BNF9kU1zq6T9NTNhmC3ta1ypGK/view?usp=drive_link',
      'https://drive.google.com/file/d/1IK751vGA_g-hwG8SIpaA2z1GBtjD9ppd/view?usp=drive_link',
      'https://drive.google.com/file/d/14s_Tl2--9GZuucwfwft8MoPVUVTFEhP0/view?usp=drive_link',
      'https://drive.google.com/file/d/1u6K8V_JvuX3LMmeWxbDUyC9XBGN0zY07/view?usp=drive_link',
      'https://drive.google.com/file/d/1lNfmkO4K6sfRzF-JCnUZMw6loHOG-4fq/view?usp=drive_link'
    ]
  },
  {
    id: '5',
    title: 'Diseño de merchandising',
    tags: 'Imprecion en tela - Diseño ergonómico - Branding aplicado - Merchandising ',
    color: '#00FFC2',
    gradient: 'linear-gradient(135deg, #EA5628 0%, #00FFC2 100%)',
    details: 'Estudio de concepto y aplicación marcaria estratégica para impactar en el día a día de tus usuarios y compradores.',
    image: 'https://drive.google.com/file/d/1F1xTUh_P1RB-iVRhdyqK6sldQq2_u5dQ/view?usp=drive_link',
    images: [
      'https://drive.google.com/file/d/1F1xTUh_P1RB-iVRhdyqK6sldQq2_u5dQ/view?usp=drive_link',
      'https://drive.google.com/file/d/1wkx9dyIDxN9aeosErRzrgIaPz9rTKoHT/view?usp=drive_link',
      'https://drive.google.com/file/d/1V9of14OQMTVHKJEYikI9kRVo0WFKUsGG/view?usp=drive_link',
      'https://drive.google.com/file/d/1Eq3wzG4qLFgS6lM1VoCfh7sclbou7lHG/view?usp=drive_link',
      'https://drive.google.com/file/d/1Tbk35euBNS0-5S7uyD9L-sV8IXlDlapk/view?usp=drive_link'
    ]
  },
  {
    id: '6',
    title: 'Game Maker - Ilustración UI',
    tags: 'Ilustración - 3D - Concept Art',
    color: '#EA5628',
    gradient: 'linear-gradient(135deg, #2B1F21 0%, #EA5628 100%)',
    details: 'Composición y conceptualización de ilustraciones complejas para uso web.',
    image: 'https://drive.google.com/file/d/13yFVS2SQAA4kY9rsq-pAg81ikO2ZhUBT/view?usp=drive_link',
    images: [
      'https://drive.google.com/file/d/13yFVS2SQAA4kY9rsq-pAg81ikO2ZhUBT/view?usp=drive_link',
      'https://drive.google.com/file/d/1P0J_XxrDnJIZvPDoLWLHkDtTy-CvFDdh/view?usp=drive_link',
      'https://drive.google.com/file/d/1_6Nj0nYgKwR_Cad3B5yNYl1Mc4ar0tU1/view?usp=drive_link',
      'https://drive.google.com/file/d/1QEZLzjDDAtoflZepO-qRQARFGk_3dx01/view?usp=drive_link',
      'https://drive.google.com/file/d/1FLK8AZE-nrTTqHB_NioEHWWqgSlpBYAA/view?usp=drive_link',
      'https://drive.google.com/file/d/10IsurJH2uES9EFWR9hCQZHt5arM0A8H1/view?usp=drive_link',
      'https://drive.google.com/file/d/1GSfcTC-HPBQbewmzrt__LiZyS_rOnzVc/view?usp=drive_link',
      'https://drive.google.com/file/d/1bUo0BMBpLfdfHJ7JGmUzIu-nTtIaCYCL/view?usp=drive_link',
      'https://drive.google.com/file/d/1qJXrZTIlTmF1o6Q9lxenScKD1NY10yLQ/view?usp=drive_link',
      'https://drive.google.com/file/d/1_nJQd2Jvig4sDvVaoDPc6H_vasS0aCc-/view?usp=drive_link',
      'https://drive.google.com/file/d/1qtgG5NMNP6YX4zZ4cWPBRDYPmU3Y69Ac/view?usp=drive_link'
    ]
  }
];


export default function App() {
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [activeState, setActiveState] = useState<AppState>('hero');
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isPeeking, setIsPeeking] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [wheelCount, setWheelCount] = useState(0);
  const [isGridAtBottom, setIsGridAtBottom] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const projects = PROJECTS;
  const customLogo = '';
  const [selectedProjectModal, setSelectedProjectModal] = useState<Project | null>(null);
  const [projectModalSource, setProjectModalSource] = useState<'featured' | 'service'>('featured');

  const gridWrapperRef = useRef<HTMLDivElement>(null);
  const wheelResetTimerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartYRef = useRef<number>(0);

  // Handle mouse move for background serigraphic text tilt parallax effect
  useEffect(() => {
    if (activeState !== 'hero') return;

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) - 0.5;
      const y = (e.clientY / window.innerHeight) - 0.5;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [activeState]);

  // Set transient animation lock
  const lockAnimation = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsAnimating(false);
    }, 850);
  };

  // State transitions
  const goToHero = () => {
    if (isAnimating) return;
    lockAnimation();
    setActiveState('hero');
    setIsPeeking(false);
    setWheelCount(0);
  };

  const goToProjects = () => {
    if (isAnimating) return;
    lockAnimation();
    setActiveState('projects');
    setIsPeeking(false);
    setWheelCount(0);
  };

  const goToServices = () => {
    if (isAnimating) return;
    lockAnimation();
    setActiveState('services');
  };

  const goToAbout = () => {
    if (isAnimating) return;
    lockAnimation();
    setIsAboutOpen(true);
  };

  const closeAbout = () => {
    if (isAnimating) return;
    lockAnimation();
    setIsAboutOpen(false);
  };

  const handleNavigate = (state: AppState) => {
    if (state === 'hero') { setIsAboutOpen(false); goToHero(); }
    if (state === 'projects') { setIsAboutOpen(false); goToProjects(); }
    if (state === 'services') { setIsAboutOpen(false); goToServices(); }
    if (state === 'about') goToAbout();
  };

  // Check if grid is scrolled to bottom
  const checkGridScroll = () => {
    const el = gridWrapperRef.current;
    if (!el) return;
    const isBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 10;
    setIsGridAtBottom(isBottom);
  };

  // Handle wheel events with proper debounce and peek support
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isAnimating) return;
      if (document.body.classList.contains('project-modal-open') || document.body.classList.contains('service-modal-open') || document.body.classList.contains('modal-open')) return;

      const deltaY = e.deltaY;
      const isDown = deltaY > 0;

      if (activeState === 'hero') {
        if (isDown) {
          // Debounced Peek behavior
          if (wheelResetTimerRef.current) clearTimeout(wheelResetTimerRef.current);
          
          setWheelCount((prev) => {
            const next = prev + 1;
            if (next === 1) {
              setIsPeeking(true);
              wheelResetTimerRef.current = setTimeout(() => {
                setIsPeeking(false);
                setWheelCount(0);
              }, 1200);
            } else if (next >= 2) {
              goToProjects();
            }
            return next;
          });
        } else {
          setIsPeeking(false);
          setWheelCount(0);
        }
      } else if (activeState === 'projects') {
        const el = gridWrapperRef.current;
        if (!el) return;

        if (isDown) {
          // Check if scrolled fully to bottom of projects grid
          const isAtBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 5;
          if (isAtBottom) {
            goToServices();
          }
        } else {
          // Return to Hero if scrolled back to top
          if (el.scrollTop <= 0) {
            goToHero();
          }
        }
      } else if (activeState === 'services') {
        const servicesEl = document.getElementById('services-section-wrapper');
        if (!isDown) {
          if (!servicesEl || servicesEl.scrollTop <= 5) {
            goToProjects();
          }
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [activeState, isAnimating, wheelCount]);

  // Handle Touch/Mobile Swipes
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (document.body.classList.contains('project-modal-open') || document.body.classList.contains('service-modal-open') || document.body.classList.contains('modal-open')) return;
      touchStartYRef.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (isAnimating) return;
      if (document.body.classList.contains('project-modal-open') || document.body.classList.contains('service-modal-open') || document.body.classList.contains('modal-open')) return;

      const deltaY = touchStartYRef.current - e.changedTouches[0].clientY;
      const threshold = 50; // min swipe distance in px

      if (activeState === 'hero') {
        if (deltaY > threshold) {
          // Swipe up → go to projects
          if (isPeeking) {
            goToProjects();
          } else {
            setIsPeeking(true);
            setTimeout(() => setIsPeeking(false), 2000);
          }
        } else if (deltaY < -threshold) {
          setIsPeeking(false);
        }
      } else if (activeState === 'projects') {
        const el = gridWrapperRef.current;
        if (!el) return;

        if (deltaY > threshold) {
          // Swipe up at bottom of grid → go to services
          const isAtBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 10;
          if (isAtBottom) {
            goToServices();
          }
        } else if (deltaY < -threshold) {
          // Swipe down at top of grid → go to hero
          if (el.scrollTop <= 0) {
            goToHero();
          }
        }
      } else if (activeState === 'services') {
        const servicesEl = document.getElementById('services-section-wrapper');
        if (deltaY < -threshold) {
          // Swipe down on services → go to projects if at top of section
          if (!servicesEl || servicesEl.scrollTop <= 5) {
            goToProjects();
          }
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [activeState, isAnimating, isPeeking]);

  // Keyboard navigation support for premium accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnimating) return;
      if (document.body.classList.contains('project-modal-open') || document.body.classList.contains('service-modal-open') || document.body.classList.contains('modal-open')) return;

      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        if (activeState === 'hero') {
          goToProjects();
        } else if (activeState === 'projects') {
          const el = gridWrapperRef.current;
          if (el) {
            const isAtBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 20;
            if (isAtBottom) {
              goToServices();
            } else {
              // Smoothly scroll down inside grid
              el.scrollBy({ top: 300, behavior: 'smooth' });
            }
          }
        } else if (activeState === 'services') {
          const servicesEl = document.getElementById('services-section-wrapper');
          if (servicesEl) {
            servicesEl.scrollBy({ top: 300, behavior: 'smooth' });
          }
        }
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        if (activeState === 'services') {
          const servicesEl = document.getElementById('services-section-wrapper');
          if (!servicesEl || servicesEl.scrollTop <= 5) {
            goToProjects();
          } else {
            servicesEl.scrollBy({ top: -300, behavior: 'smooth' });
          }
        } else if (activeState === 'projects') {
          const el = gridWrapperRef.current;
          if (el) {
            if (el.scrollTop <= 5) {
              goToHero();
            } else {
              // Smoothly scroll up inside grid
              el.scrollBy({ top: -300, behavior: 'smooth' });
            }
          }
        }
      } else if (e.key === 'Home') {
        goToHero();
      } else if (e.key === 'End') {
        goToServices();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeState, isAnimating]);

  // Calculate card heights dynamically based on viewport size and headers
  useEffect(() => {
    const sizeCards = () => {
      const headerH = 80; // approximate project bar header height
      const padding = 24;
      const peekScale = 0.82; // peek ratio
      const availableH = (window.innerHeight - headerH - padding) * peekScale;
      document.documentElement.style.setProperty('--card-h', `${availableH}px`);
    };

    sizeCards();
    window.addEventListener('resize', sizeCards);
    return () => window.removeEventListener('resize', sizeCards);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-white select-none cursor-none">
      <AnimatePresence>
        {isAppLoading && <LoadingScreen key="app-loading-screen" projects={projects} onComplete={() => setIsAppLoading(false)} />}
      </AnimatePresence>

      {/* Dynamic Noise WebGL Shader Background */}
      <BackgroundShader activeState={activeState} />

      {/* Floating Global Custom Cursor */}
      <CustomCursor />

      {/* Primary Navigation System */}
      <Navigation activeState={isAboutOpen ? 'about' : activeState} onNavigate={handleNavigate} />

      {/* Main Pages Wrapper (Slides Left when About is active) */}
      <motion.div
        className="absolute inset-0 w-full h-full"
        animate={{ x: isAboutOpen ? '-100vw' : '0vw' }}
        transition={{ duration: 0.8, ease: [0.77, 0, 0.175, 1] }}
      >
        <HeroSection activeState={activeState} isPeeking={isPeeking} mousePos={mousePos} />

        <PortfolioGrid 
          activeState={activeState} 
          isPeeking={isPeeking} 
          projects={projects} 
          isGridAtBottom={isGridAtBottom} 
          onNavigate={handleNavigate} 
          onSelectProject={(p) => {
            setProjectModalSource('featured');
            setSelectedProjectModal(p);
          }} 
          checkGridScroll={checkGridScroll} 
          gridWrapperRef={gridWrapperRef} 
        />

        {/* PANEL 3: SERVICES & CONTACT PANEL */}
        <ServicesSection
          isVisible={activeState === 'services'}
          isCovered={!!selectedProjectModal}
          onBackToProjects={goToProjects}
          customLogo={customLogo}
          onOpenProject={(p) => {
            setProjectModalSource('service');
            setSelectedProjectModal(p);
          }}
          onGoHome={goToHero}
        />
      </motion.div>

      {/* About Section */}
      <AboutSection isVisible={isAboutOpen} onBack={closeAbout} mousePos={mousePos} />

      {/* SECONDARY WINDOW: PROJECT DETAIL MODAL */}
      <ProjectDetailModal
        project={selectedProjectModal}
        projects={projectModalSource === 'featured' ? projects : []}
        onClose={() => setSelectedProjectModal(null)}
        onSelectProject={(proj) => {
          setProjectModalSource('featured');
          setSelectedProjectModal(proj);
        }}
        onGoHome={() => {
          setSelectedProjectModal(null);
          goToHero();
        }}
      />
    </div>
  );
}
