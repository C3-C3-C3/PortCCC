"use client";

import React, { memo, useCallback, useEffect, useRef } from "react";

export interface GlowingEffectProps {
  blur?: number;
  inactiveZone?: number;
  proximity?: number;
  spread?: number;
  variant?: "default" | "white";
  glow?: boolean;
  className?: string;
  disabled?: boolean;
  borderWidth?: number;
}

export const GlowingEffect = memo(
  ({
    blur = 0,
    inactiveZone = 0.01,
    proximity = 120,
    spread = 40,
    variant = "default",
    glow = true,
    className = "",
    disabled = false,
    borderWidth = 2,
  }: GlowingEffectProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const lastPosition = useRef({ x: 0, y: 0 });
    const animationFrameId = useRef<number | null>(null);

    const handleMove = useCallback(
      (e?: MouseEvent | TouchEvent | PointerEvent) => {
        if (!containerRef.current) return;

        if (animationFrameId.current) {
          cancelAnimationFrame(animationFrameId.current);
        }

        animationFrameId.current = requestAnimationFrame(() => {
          const element = containerRef.current;
          if (!element) return;

          const rect = element.getBoundingClientRect();
          const x = e
            ? e instanceof MouseEvent
              ? e.clientX
              : e.touches?.[0]?.clientX ?? lastPosition.current.x
            : lastPosition.current.x;
          const y = e
            ? e instanceof MouseEvent
              ? e.clientY
              : e.touches?.[0]?.clientY ?? lastPosition.current.y
            : lastPosition.current.y;

          if (e) {
            lastPosition.current = { x, y };
          }

          const center = [rect.left + rect.width / 2, rect.top + rect.height / 2];
          const distanceFromCenter = Math.hypot(x - center[0], y - center[1]);
          const inactiveRadius =
            0.5 * Math.min(rect.width, rect.height) * inactiveZone;

          if (distanceFromCenter < inactiveRadius) {
            element.style.setProperty("--active", "0");
            return;
          }

          const isActive =
            x >= rect.left - proximity &&
            x <= rect.right + proximity &&
            y >= rect.top - proximity &&
            y <= rect.bottom + proximity;

          element.style.setProperty("--active", isActive ? "1" : "0");

          if (!isActive) return;

          const currentAngle =
            parseFloat(element.style.getPropertyValue("--start")) || 0;
          const targetAngle =
            (180 * Math.atan2(y - center[1], x - center[0])) / Math.PI + 90;

          const angleDiff = ((targetAngle - currentAngle + 180) % 360) - 180;
          const newAngle = currentAngle + angleDiff * 0.3;

          element.style.setProperty("--start", String(newAngle));
        });
      },
      [inactiveZone, proximity]
    );

    useEffect(() => {
      if (disabled) return;

      const handleScroll = () => handleMove();
      const handlePointerMove = (e: PointerEvent) => handleMove(e);

      window.addEventListener("scroll", handleScroll, { passive: true });
      window.addEventListener("pointermove", handlePointerMove, { passive: true });

      return () => {
        if (animationFrameId.current) {
          cancelAnimationFrame(animationFrameId.current);
        }
        window.removeEventListener("scroll", handleScroll);
        window.removeEventListener("pointermove", handlePointerMove);
      };
    }, [handleMove, disabled]);

    const gradientPattern =
      variant === "white"
        ? "#ffffff, #ffffff 15deg, transparent 30deg, transparent 330deg, #ffffff 360deg"
        : "#1bf2a3, #00ffff 25deg, #e63946 50deg, transparent 75deg, transparent 285deg, #1bf2a3 360deg";

    return (
      <div
        ref={containerRef}
        style={
          {
            "--blur": `${blur}px`,
            "--spread": `${spread}px`,
            "--start": "0",
            "--active": "0",
            "--glowing-effect-border-width": `${borderWidth}px`,
            "--repeating-conic-gradient-gradient-1": gradientPattern,
          } as React.CSSProperties
        }
        className={`pointer-events-none absolute -inset-[var(--glowing-effect-border-width)] rounded-[inherit] transition-opacity duration-300 z-20 ${
          glow ? "opacity-100" : "opacity-0"
        } ${className}`}
      >
        <div
          className="absolute inset-0 rounded-[inherit]"
          style={{
            padding: `${borderWidth}px`,
            background: `conic-gradient(from calc(var(--start) * 1deg), var(--repeating-conic-gradient-gradient-1))`,
            WebkitMask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
            WebkitMaskComposite: `xor`,
            maskComposite: `exclude`,
            opacity: `var(--active)`,
            filter: blur ? `blur(${blur}px)` : undefined,
            transition: `opacity 0.2s ease`,
          }}
        />
        {/* Soft glowing aura behind the border */}
        <div
          className="absolute -inset-1 rounded-[inherit] transition-opacity duration-300 blur-xs pointer-events-none opacity-0"
          style={{
            background: `conic-gradient(from calc(var(--start) * 1deg), #1bf2a3, #00ffff 30deg, transparent 80deg)`,
            opacity: 0,
          }}
        />
      </div>
    );
  }
);

GlowingEffect.displayName = "GlowingEffect";
