import { useEffect, useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Project } from '../types';

interface LoadingScreenProps {
  projects?: Project[];
  onComplete: () => void;
}

const getOptimizedMediaUrl = (url: string) => {
  if (!url) return url;
  const cleanUrl = url.trim();
  const driveMatch = cleanUrl.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/) ||
                     cleanUrl.match(/drive\.google\.com\/uc\?.*?id=([a-zA-Z0-9_-]+)/) ||
                     cleanUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (driveMatch && driveMatch[1]) {
    const directDriveUrl = `https://drive.google.com/uc?export=view&id=${driveMatch[1]}`;
    return `/api/proxy-image?url=${encodeURIComponent(directDriveUrl)}&v=2`;
  }
  return cleanUrl;
};

// Delays between flashing images, accelerating progressively towards the end
// Starts at 450ms for clear appreciation, accelerating smoothly down to a crisp 120ms floor
const DELAYS = [450, 380, 320, 260, 210, 170, 140, 120, 120];

// Exact sequence of 9 images requested by the user:
// 1. Proj destacado 6, img 1
// 2. Proj destacado 1, img 2
// 3. Ilustración proj 1, img 5
// 4. Branding proj 2, img 3
// 5. Proj destacado 6, img 2
// 6. Proj destacado 1, img 4
// 7. Proj destacado 4, img 4
// 8. Branding proj 5, img 2
// 9. Ilustración proj 9, img 1
const CURATED_FLASH_IMAGES = [
  'https://drive.google.com/file/d/13yFVS2SQAA4kY9rsq-pAg81ikO2ZhUBT/view?usp=drive_link',
  'https://drive.google.com/file/d/1sk6kyEidTrqrlwjIqzFSv5ffBV1wwd8i/view?usp=drive_link',
  'https://drive.google.com/file/d/109JmK5Lv9Fwu-zin5lCgOJRZgU-862g3/view?usp=drive_link',
  'https://drive.google.com/file/d/1lZRKxjuTU21IE9TQV7xPlihiGu2iTPhA/view?usp=drive_link',
  'https://drive.google.com/file/d/1P0J_XxrDnJIZvPDoLWLHkDtTy-CvFDdh/view?usp=drive_link',
  'https://drive.google.com/file/d/1cGHDHd1St-zfT2U_6hWaNSKBtMi4zdph/view?usp=drive_link',
  'https://drive.google.com/file/d/1u6K8V_JvuX3LMmeWxbDUyC9XBGN0zY07/view?usp=drive_link',
  'https://drive.google.com/file/d/1zI7DpRX1JCVBXSWSUOfxS8ZZ5QAawUmw/view?usp=drive_link',
  'https://drive.google.com/file/d/1h_ACHbLjGyEaKST-XWw3p3LQAutIuGeT/view?usp=drive_link',
];

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'loading' | 'expanding'>('loading');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Use the exact curated sequence of 9 images with optimized media URLs
  const flashImages = useMemo(() => {
    return CURATED_FLASH_IMAGES.map(url => getOptimizedMediaUrl(url));
  }, []);

  // Phase 1: Smooth, perceptible 2.0-second numeric progress synchronized with GPU pre-decoding
  useEffect(() => {
    if (phase !== 'loading') return;

    let isMounted = true;
    const total = flashImages.length;
    let imagesLoaded = total === 0;

    // Load and GPU-decode every image into memory
    let loadedCount = 0;
    const safetyTimeout = setTimeout(() => {
      if (!isMounted) return;
      imagesLoaded = true;
    }, 2200);

    if (total > 0) {
      flashImages.forEach((src) => {
        const img = new Image();

        const markLoaded = () => {
          if (!isMounted) return;
          loadedCount++;
          if (loadedCount >= total) {
            imagesLoaded = true;
          }
        };

        img.onload = markLoaded;
        img.onerror = markLoaded;

        if (typeof img.decode === 'function') {
          img.decode()
            .then(markLoaded)
            .catch(() => {
              if (img.complete) markLoaded();
            });
        }

        img.src = src;
        if (img.complete) {
          markLoaded();
        }
      });
    }

    // Smooth 2.0-second counter (20ms * 100 ticks = 2000ms)
    let current = 0;
    const ticker = setInterval(() => {
      if (!isMounted) return;

      // Advance smoothly towards 100 if assets are ready, or hold at 99% until fully ready
      const maxAllowed = imagesLoaded ? 100 : 99;

      if (current < maxAllowed) {
        current += 1;
        setProgress(current);
      }

      if (current >= 100 && imagesLoaded) {
        clearInterval(ticker);
        setTimeout(() => {
          if (isMounted) setPhase('expanding');
        }, 120);
      }
    }, 20);

    return () => {
      isMounted = false;
      clearTimeout(safetyTimeout);
      clearInterval(ticker);
    };
  }, [phase, flashImages]);

  // Phase 2: Expanding aperture & flashing images with zero black gaps
  useEffect(() => {
    if (phase !== 'expanding') return;

    let isMounted = true;
    const timeouts: NodeJS.Timeout[] = [];
    const totalImages = flashImages.length;
    let accumulatedTime = 0;

    if (totalImages > 0) {
      DELAYS.slice(0, totalImages).forEach((delay, index) => {
        accumulatedTime += delay;
        const t = setTimeout(() => {
          if (!isMounted) return;
          setCurrentImageIndex(index);
          // When reaching the last image, trigger fade out transparency so no static image remains
          if (index === totalImages - 1) {
            const fadeT = setTimeout(() => {
              if (isMounted) setIsFadingOut(true);
            }, 100);
            timeouts.push(fadeT);
          }
        }, accumulatedTime);
        timeouts.push(t);
      });
    }

    const completionTime = Math.max(accumulatedTime + 200, 2450);
    const completeTimer = setTimeout(() => {
      if (!isMounted) return;
      onCompleteRef.current();
    }, completionTime);
    timeouts.push(completeTimer);

    return () => {
      isMounted = false;
      timeouts.forEach(clearTimeout);
    };
  }, [phase, flashImages.length]);

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-[#111111] flex items-center justify-center overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.6, ease: "easeInOut" } }}
    >
      {/* Phase 1: The Loader ("La Carga") */}
      <AnimatePresence>
        {phase === 'loading' && (
          <motion.div
            key="loading-indicator"
            className="relative flex items-center justify-center z-20"
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.2 }}
          >
            <svg
              width="128"
              height="128"
              viewBox="0 0 128 128"
              className="w-32 h-32"
              style={{ transform: 'rotate(-90deg)' }}
            >
              <circle
                cx="64"
                cy="64"
                r={radius}
                stroke="rgba(234, 86, 40, 0.2)"
                strokeWidth="3"
                fill="transparent"
              />
              <circle
                cx="64"
                cy="64"
                r={radius}
                stroke="#EA5628"
                strokeWidth="3"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{
                  transition: 'stroke-dashoffset 0.08s linear'
                }}
              />
            </svg>
            <div className="absolute text-[#EA5628] font-sans font-medium text-sm tracking-widest pointer-events-none select-none">
              {progress}%
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase 2: Full-screen 3-column flashing images (Left/Right at 50% opacity, Center at 100%) */}
      {phase === 'expanding' && (
        <motion.div
          className="absolute inset-0 pointer-events-none z-10 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: isFadingOut ? 0 : 1 }}
          transition={{ duration: isFadingOut ? 0.25 : 0.15, ease: "easeOut" }}
        >
          {flashImages.map((src, index) => (
            <div
              key={src}
              className="absolute inset-0 w-full h-full grid grid-cols-3 pointer-events-none overflow-hidden"
              style={{
                display: index === currentImageIndex ? 'grid' : 'none',
              }}
            >
              <div className="relative w-full h-full overflow-hidden opacity-50">
                <img
                  src={src}
                  alt="Flashing Project Left"
                  className="w-full h-full object-cover pointer-events-none"
                />
              </div>
              <div className="relative w-full h-full overflow-hidden">
                <img
                  src={src}
                  alt="Flashing Project Center"
                  className="w-full h-full object-cover pointer-events-none"
                />
              </div>
              <div className="relative w-full h-full overflow-hidden opacity-50">
                <img
                  src={src}
                  alt="Flashing Project Right"
                  className="w-full h-full object-cover pointer-events-none"
                />
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
