import React, { useEffect, useRef, useState, ReactNode } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right' | 'glow' | 'zoom';
  delay?: number;
  duration?: number;
  className?: string;
  triggerOnce?: boolean;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  direction = 'up',
  delay = 0,
  duration = 700,
  className = '',
  triggerOnce = true
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (triggerOnce && domRef.current) {
              observer.unobserve(domRef.current);
            }
          } else if (!triggerOnce) {
            setIsVisible(false);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    const current = domRef.current;
    if (current) {
      observer.observe(current);
    }

    return () => {
      if (current) observer.unobserve(current);
    };
  }, [triggerOnce]);

  // Direction transform styles
  const getTransform = () => {
    if (isVisible) return 'none';
    switch (direction) {
      case 'up':
        return 'translateY(32px) scale(0.98)';
      case 'down':
        return 'translateY(-32px) scale(0.98)';
      case 'left':
        return 'translateX(36px)';
      case 'right':
        return 'translateX(-36px)';
      case 'zoom':
        return 'scale(0.92)';
      case 'glow':
        return 'translateY(16px)';
      default:
        return 'translateY(28px)';
    }
  };

  return (
    <div
      ref={domRef}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        transition: `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
        willChange: 'opacity, transform'
      }}
      className={`${className} ${isVisible && direction === 'glow' ? 'animate-border-glow' : ''}`}
    >
      {children}
    </div>
  );
};
