import { motion } from 'motion/react';
import { useState } from 'react';

interface ScrambleTextProps {
  text: string;
  delay?: number;
  duration?: number; // Kept for API compatibility
  triggerOnHover?: boolean;
  className?: string;
}

export default function ScrambleText({
  text,
  delay = 0,
  className = '',
}: ScrambleTextProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Split text into characters
  const characters = Array.from(text);

  // Animation variants for individual characters
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.04,
        delayChildren: delay / 1000,
      },
    },
  };

  const charVariants = {
    hidden: {
      y: '102%',
      rotateX: 60,
      skewY: 8,
      opacity: 0,
    },
    visible: {
      y: '0%',
      rotateX: 0,
      skewY: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1] as const, // Custom ultra-smooth cubic-bezier (out-expo)
      },
    },
  };

  return (
    <motion.span
      className={`inline-flex flex-wrap justify-center md:justify-start overflow-visible py-0 ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      onMouseLeave={() => setHoveredIndex(null)}
      style={{ perspective: '1000px' }}
    >
      {characters.map((char, index) => {
        if (char === ' ') {
          return (
            <span key={index} className="inline-block" style={{ width: '0.25em' }}>
              &nbsp;
            </span>
          );
        }

        // Determine hover state for wave/magnetic ripple effect
        const isDirectlyHovered = hoveredIndex === index;
        const isNeighbor = hoveredIndex !== null && Math.abs(hoveredIndex - index) === 1;
        
        let yOffset = 0;
        let scale = 1;
        let rotate = 0;
        let skew = 0;
        let color = '#EA5628'; // brand-red default (Primario)

        if (isDirectlyHovered) {
          yOffset = -15;
          scale = 1.15;
          rotate = -6;
          skew = -4;
          color = '#00FFC2'; // pops to brand-green (Terciario)
        } else if (isNeighbor) {
          yOffset = -6;
          scale = 1.05;
          rotate = -2;
          skew = -1;
          color = '#00FFC2'; // neighbor slides to brand-green (Terciario)
        }

        return (
          <span
            key={index}
            className="relative inline-block overflow-visible cursor-none select-none transition-all duration-300 ease-out"
            onMouseEnter={() => setHoveredIndex(index)}
            style={{
              transform: `translate3d(0, ${yOffset}px, 0) scale(${scale}) rotate(${rotate}deg) skewX(${skew}deg)`,
              color: color,
              transformOrigin: 'bottom center',
              willChange: 'transform, color',
            }}
          >
            {/* Split character double roll-up/reveal structure */}
            <span className="relative block overflow-hidden px-[0.18em] mx-[-0.18em]" style={{ height: '1.02em', lineHeight: '1' }}>
              {/* Primary letter (slides up on hover) */}
              <span
                className="block"
                style={{
                  transform: isDirectlyHovered ? 'translateY(-100%)' : 'translateY(0%)',
                  opacity: isDirectlyHovered ? 0 : 1,
                  transitionProperty: 'transform, opacity',
                  transitionDuration: isDirectlyHovered ? '250ms, 120ms' : '500ms, 400ms',
                  transitionTimingFunction: 'cubic-bezier(0.16,1,0.3,1)',
                }}
              >
                <motion.span variants={charVariants} className="block">
                  {char}
                </motion.span>
              </span>

              {/* Rolling clone from bottom (slides in on hover) */}
              <span
                className="absolute inset-y-0 left-[0.18em] right-[0.18em] block font-serif font-medium italic"
                style={{
                  transform: isDirectlyHovered ? 'translateY(0%)' : 'translateY(100%)',
                  opacity: isDirectlyHovered ? 1 : 0,
                  transitionProperty: 'transform, opacity',
                  transitionDuration: isDirectlyHovered ? '500ms, 300ms' : '300ms, 200ms',
                  transitionTimingFunction: 'cubic-bezier(0.16,1,0.3,1)',
                  color: '#000000',
                  textShadow: '0 0 8px #FACC15, 0 0 16px #FACC15, 0 0 24px rgba(250,204,21,0.6)',
                }}
              >
                {char}
              </span>
            </span>
          </span>
        );
      })}
    </motion.span>
  );
}
