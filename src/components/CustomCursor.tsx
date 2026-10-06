import { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
  const coreRef = useRef<HTMLDivElement>(null);
  const auraRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Detect touch capability
    const touchCheck = () => {
      setIsTouchDevice(
        'ontouchstart' in window || navigator.maxTouchPoints > 0
      );
    };
    touchCheck();

    if (isTouchDevice) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    
    // Core (inner dot) - high responsiveness (almost instant, 85% lerp)
    let coreX = mouseX;
    let coreY = mouseY;
    
    // Aura (outer ring) - elegant trail (35% lerp)
    let auraX = mouseX;
    let auraY = mouseY;

    // Scale animation state
    const isMouseDownRef = { current: false };
    let coreScale = 1;
    let auraScale = 1;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isVisible) setIsVisible(true);
    };

    const onMouseLeave = () => {
      setIsVisible(false);
      isMouseDownRef.current = false;
    };

    const onMouseEnter = () => {
      setIsVisible(true);
    };

    // Global click action - snap aura to core so concentric alignment is perfect on click
    const onMouseDown = () => {
      isMouseDownRef.current = true;
      auraX = coreX;
      auraY = coreY;
    };
    
    const onMouseUp = () => {
      isMouseDownRef.current = false;
    };

    const onBlur = () => {
      isMouseDownRef.current = false;
      setIsVisible(false);
    };

    // Track hovered elements
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;
      
      const isHoverable = 
        target.tagName === 'A' || 
        target.tagName === 'BUTTON' ||
        target.closest('a') !== null ||
        target.closest('button') !== null ||
        target.closest('.proj-card') !== null ||
        target.closest('.service-item') !== null;

      setIsHovering(!!isHoverable);
    };

    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('blur', onBlur);
    window.addEventListener('mouseover', handleMouseOver);

    // Smooth lerp animation for the custom cursor elements
    let animationId: number;
    const updateCursor = () => {
      // Core lerp is very fast (0.85)
      coreX += (mouseX - coreX) * 0.85;
      coreY += (mouseY - coreY) * 0.85;
      
      // Aura lerp is smoother (0.35), but speeds up on click to stay locked to core
      const auraLerpSpeed = isMouseDownRef.current ? 0.85 : 0.35;
      auraX += (mouseX - auraX) * auraLerpSpeed;
      auraY += (mouseY - auraY) * auraLerpSpeed;

      // Smoothly lerp scale targets
      const targetCoreScale = isMouseDownRef.current ? 0.6 : 1;
      const targetAuraScale = isMouseDownRef.current ? 1.35 : 1;
      coreScale += (targetCoreScale - coreScale) * 0.25;
      auraScale += (targetAuraScale - auraScale) * 0.25;

      if (coreRef.current) {
        coreRef.current.style.left = `${coreX}px`;
        coreRef.current.style.top = `${coreY}px`;
        coreRef.current.style.transform = `translate(-50%, -50%) scale(${coreScale.toFixed(4)})`;
      }
      
      if (auraRef.current) {
        auraRef.current.style.left = `${auraX}px`;
        auraRef.current.style.top = `${auraY}px`;
        auraRef.current.style.transform = `translate(-50%, -50%) scale(${auraScale.toFixed(4)})`;
      }
      
      animationId = requestAnimationFrame(updateCursor);
    };
    updateCursor();

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('mouseover', handleMouseOver);
      cancelAnimationFrame(animationId);
    };
  }, [isVisible, isTouchDevice]);

  if (isTouchDevice) return null;

  return (
    <>
      {/* 1. Inner Core - Ultra precise & responsive */}
      <div
        ref={coreRef}
        className={`fixed top-0 left-0 rounded-full pointer-events-none z-[10000] transition-[width,height,background-color,opacity] duration-200 ease-out will-change-[left,top,width,height] ${
          isVisible ? 'opacity-100' : 'opacity-0'
        } ${isHovering ? 'w-2 h-2 bg-brand-green' : 'w-1.5 h-1.5 bg-brand-green'}`}
        style={{ cursor: 'none' }}
      />

      {/* 2. Outer Aura - Soft fluid trailing ring */}
      <div
        ref={auraRef}
        className={`fixed top-0 left-0 rounded-full border pointer-events-none z-[9999] transition-[width,height,border-color,opacity] duration-300 ease-out will-change-[left,top,width,height] ${
          isVisible ? 'opacity-100' : 'opacity-0'
        } ${
          isHovering 
            ? 'w-10 h-10 border-brand-green/60 bg-brand-green/5' 
            : 'w-6 h-6 border-brand-green/30 bg-transparent'
        }`}
        style={{ cursor: 'none' }}
      >
        {/* Glow details inside the aura */}
        <div
          className={`absolute inset-0 rounded-full transition-all duration-300 ${
            isHovering
              ? 'shadow-[0_0_8px_2px_rgba(27,242,163,0.45),inset_0_0_6px_2px_rgba(27,242,163,0.3)]'
              : 'shadow-[0_0_5px_1px_rgba(27,242,163,0.2),inset_0_0_3px_1px_rgba(27,242,163,0.1)]'
          }`}
        />
      </div>
    </>
  );
}
