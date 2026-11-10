import React, { useRef, useState, useEffect } from 'react';

interface MarqueeTextProps {
  text: string;
  className?: string;
  speed?: number; // pixels per second
  pauseDuration?: number; // ms pause at start and end
}

export const MarqueeText: React.FC<MarqueeTextProps> = ({
  text,
  className = '',
  speed = 28,
  pauseDuration = 1800,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [overflowDistance, setOverflowDistance] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    const textEl = textRef.current;
    if (!container || !textEl) return;

    const checkOverflow = () => {
      const containerWidth = container.clientWidth;
      const textWidth = textEl.scrollWidth;
      const diff = textWidth - containerWidth;
      // If text exceeds container by more than 3px, enable floating animation
      setOverflowDistance(diff > 3 ? diff : 0);
    };

    // Initial check and next frame check for font rendering
    checkOverflow();
    const rafId = requestAnimationFrame(checkOverflow);

    // Watch for container resizes (responsive flex layouts)
    const resizeObserver = new ResizeObserver(() => {
      checkOverflow();
    });

    resizeObserver.observe(container);
    resizeObserver.observe(textEl);

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(checkOverflow).catch(() => {});
    }

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
    };
  }, [text]);

  const duration = overflowDistance > 0 ? overflowDistance / speed : 0;

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden whitespace-nowrap relative min-w-0 max-w-full ${className}`}
      title={text}
    >
      <span
        ref={textRef}
        className={`inline-block ${overflowDistance > 0 ? 'marquee-floating' : ''}`}
        style={
          overflowDistance > 0
            ? ({
                '--scroll-dist': `-${overflowDistance + 8}px`,
                '--duration': `${Math.max(duration + 2.5, 4.5)}s`,
                '--pause-delay': `${pauseDuration / 1000}s`,
              } as React.CSSProperties)
            : undefined
        }
      >
        {text}
      </span>
    </div>
  );
};
