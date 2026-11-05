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
    const checkOverflow = () => {
      if (containerRef.current && textRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const textWidth = textRef.current.scrollWidth;
        const diff = textWidth - containerWidth;
        setOverflowDistance(diff > 4 ? diff : 0);
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [text]);

  const duration = overflowDistance > 0 ? (overflowDistance / speed) : 0;

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden whitespace-nowrap relative max-w-full ${className}`}
      title={text}
    >
      <span
        ref={textRef}
        className={`inline-block ${overflowDistance > 0 ? 'marquee-floating' : ''}`}
        style={
          overflowDistance > 0
            ? ({
                '--scroll-dist': `-${overflowDistance + 6}px`,
                '--duration': `${Math.max(duration, 3.5)}s`,
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
