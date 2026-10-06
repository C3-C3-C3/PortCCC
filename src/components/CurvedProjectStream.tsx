import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Project } from '../types';

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

export interface TextBounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
  centerY: number;
}

interface CurvedProjectStreamProps {
  projects: Project[];
  isVisible: boolean;
  textBounds?: TextBounds | null;
  onOpenProject?: (project: Project) => void;
}

export default function CurvedProjectStream({
  projects,
  isVisible,
  textBounds,
}: CurvedProjectStreamProps) {
  const [continuousOffset, setContinuousOffset] = useState(0);
  const [windowDimensions, setWindowDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // Measure window dimensions
  useEffect(() => {
    const updateSize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Collect and interleave ALL images from ALL projects in the service (not just cover images)
  const allImages = useMemo(() => {
    if (!projects || projects.length === 0) return [];
    
    // Group images per project
    const projectImageLists = projects.map((p) => {
      const list: string[] = [];
      if (p.image) list.push(p.image);
      if (p.images && p.images.length > 0) {
        for (const img of p.images) {
          if (img && !list.includes(img)) {
            list.push(img);
          }
        }
      }
      return list;
    });

    // Interleave across projects (round-robin)
    const maxLen = Math.max(...projectImageLists.map((l) => l.length), 0);
    const interleaved: string[] = [];
    for (let col = 0; col < maxLen; col++) {
      for (let pIdx = 0; pIdx < projectImageLists.length; pIdx++) {
        if (projectImageLists[pIdx][col]) {
          interleaved.push(projectImageLists[pIdx][col]);
        }
      }
    }

    return interleaved.length > 0 ? interleaved : [];
  }, [projects]);

  // Preload first few images for instant visual smoothness
  useEffect(() => {
    if (allImages.length === 0) return;
    const toPreload = allImages.slice(0, 8);
    toPreload.forEach((url) => {
      const img = new Image();
      img.src = getOptimizedMediaUrl(url);
    });
  }, [allImages]);

  // Continuous smooth animation moving slowly along the curve
  useEffect(() => {
    if (!isVisible) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      lastTimeRef.current = null;
      return;
    }

    // Steady, graceful pace
    const speed = 0.022;

    const step = (time: number) => {
      if (lastTimeRef.current !== null) {
        const delta = (time - lastTimeRef.current) / 1000;
        setContinuousOffset((prev) => prev + delta * speed);
      }
      lastTimeRef.current = time;
      animFrameRef.current = requestAnimationFrame(step);
    };

    animFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      lastTimeRef.current = null;
    };
  }, [isVisible]);

  if (!isVisible || allImages.length === 0) {
    return null;
  }

  const { width, height } = windowDimensions;
  const isMobile = width < 768;

  // Geometry: Position of the arc center (adjusted 1cm / ~38px lower as requested)
  const verticalShift = isMobile ? 0 : 22;
  const centerY = Math.round(height * 0.5 - verticalShift);

  // Circular radius: made significantly smaller (0.44 instead of 0.60) so the arc is tighter, more closed and pronounced
  const radius = Math.round(height * 0.44);

  // Maximum vertical reach from center for cards in screen (symmetrical above and below centerY)
  const maxDy = height * 0.38; // Fade reaches 0 cleanly inside screen
  const fullDy = height * 0.19; // Central zone with alpha = 1

  // Max angle along the circle corresponding to maxDy
  const sinMax = Math.min(maxDy / radius, 0.88);
  const thetaMax = Math.asin(sinMax); // Reaches ~59 degrees for a much more closed, dramatic curve
  const cosMax = Math.cos(thetaMax);

  // 50% larger cards: half-width is now ~95px on mobile, ~130px on desktop
  const cardHalfWidth = isMobile ? 95 : 130;

  // Anchor the circle horizontally so that cards stay a bit further to the left of the text
  const defaultTextLeft = width - (isMobile ? 180 : Math.max(width * 0.25, 340));
  const textLeft = textBounds && textBounds.left > 0 ? textBounds.left : defaultTextLeft;

  // Distance from the text left edge to the rightmost point of the arc
  const textClearance = isMobile ? 45 : 95;
  // Shift entire arc 3cm (~114px) to the right as requested
  const rightShift = isMobile ? 60 : 114;
  const rightmostCardX = textLeft - cardHalfWidth - textClearance + rightShift;

  // Horizontal center Xc of the circle
  const centerX = rightmostCardX + radius * cosMax;

  // Exactly 5 images in screen at all times:
  // 1 doing fade-in at top, 3 fully visible in center, 1 doing fade-out at bottom.
  // 6 slots in the continuous cycle so 1 is in hidden transit.
  const TOTAL_SLOTS = 6;
  const stepAngle = (2 * thetaMax) / 4.15;
  const totalAngularSpan = TOTAL_SLOTS * stepAngle;
  const thetaStart = -thetaMax - stepAngle * 0.85;

  const slots = Array.from({ length: TOTAL_SLOTS }, (_, k) => k);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-20"
    >
      <AnimatePresence>
        {slots.map((slotIndex) => {
          // Continuous progress and lap tracking
          const absoluteProgress = continuousOffset + slotIndex / TOTAL_SLOTS;
          const lap = Math.floor(absoluteProgress);
          const u = absoluteProgress - lap; // strictly in [0, 1)

          // Angle on the circle whose radius center is at (centerX, centerY)
          const theta = thetaStart + u * totalAngularSpan;

          // x and y coordinates along the circular arc
          const x = centerX - radius * Math.cos(theta);
          const y = centerY + radius * Math.sin(theta);

          // Perfectly symmetrical alpha relative to the elevated horizontal center axis centerY
          const dy = Math.abs(y - centerY);

          let alpha = 0;
          if (dy <= fullDy) {
            // Exactly 3 cards in this central zone have full opacity (alpha = 1)
            alpha = 1;
          } else if (dy < maxDy) {
            // Smooth symmetrical fade:
            // 1 card fading in at top (y < centerY)
            // 1 card fading out at bottom (y > centerY)
            const ratio = (maxDy - dy) / (maxDy - fullDy);
            alpha = Math.sin((ratio * Math.PI) / 2);
          } else {
            // Fully dissolved before reaching screen edges (no cut-off)
            alpha = 0;
          }

          // Scale and depth dynamics:
          // 20% larger (+20% -> 1.20) as cards approach the center,
          // and 50% smaller (-50% -> 0.50) as cards move toward the edges.
          const edgeDistRatio = Math.min(1, dy / maxDy);
          const scaleCurve = Math.cos((edgeDistRatio * Math.PI) / 2);
          const scale = 0.50 + 0.70 * scaleCurve; // 1.20 at center, 0.50 at edges

          // Layering: The card closest to the center has the highest z-index so it renders in front
          const zIndex = Math.round(10 + scaleCurve * 40);

          // Image index cycles through all interleaved images of the service.
          // Updates only when crossing boundaries with alpha = 0.
          const imgIndex = (lap * TOTAL_SLOTS + slotIndex) % allImages.length;
          const rawUrl = allImages[imgIndex];
          const imageUrl = getOptimizedMediaUrl(rawUrl);

          return (
            <motion.div
              key={`slot-${slotIndex}`}
              style={{
                position: 'absolute',
                left: `${x}px`,
                top: `${y}px`,
                transform: `translate(-50%, -50%) scale(${scale})`, // Centered, scaled and upright
                zIndex, // Center card is in front of the others
                opacity: alpha,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: alpha }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="pointer-events-none select-none"
            >
              {/* 50% larger cards: square format, prominent shadow, semi-transparent frosted frame */}
              <div className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-72 lg:h-72 aspect-square p-2.5 sm:p-3 rounded-2xl bg-white/45 backdrop-blur-md border border-white/60 shadow-[0_24px_50px_-10px_rgba(0,0,0,0.26)] overflow-hidden flex items-center justify-center">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover rounded-xl select-none pointer-events-none"
                  />
                ) : (
                  <div className="w-full h-full rounded-xl bg-gray-100" />
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
}
