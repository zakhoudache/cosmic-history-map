
import { useEffect, useState, useRef, RefObject } from 'react';

// Hook to detect when an element is visible in the viewport
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
): [RefObject<HTMLElement>, boolean] {
  const elementRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  const defaultOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1,
  };

  const mergedOptions = { ...defaultOptions, ...options };

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, mergedOptions);

    observer.observe(element);

    return () => {
      observer.unobserve(element);
      observer.disconnect();
    };
  }, [mergedOptions]);

  return [elementRef, isVisible];
}

// Hook to create staggered animations for multiple elements
export function useStaggeredAnimation(
  totalItems: number,
  baseDelay: number = 100
): (index: number) => number {
  return (index: number) => index * baseDelay;
}

// Function to apply intersection observer to multiple elements
export function initScrollAnimations(): void {
  if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
    const elements = document.querySelectorAll('.animate-on-scroll');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    elements.forEach((element) => {
      observer.observe(element);
    });
  } else {
    // Fallback for browsers that don't support IntersectionObserver
    document.querySelectorAll('.animate-on-scroll').forEach((element) => {
      element.classList.add('is-visible');
    });
  }
}

// Hook for triggering animations on mount
export function useAnimateOnMount(delay: number = 0): boolean {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timeout);
  }, [delay]);

  return isVisible;
}

// Hook for smooth counter animation
export function useSmoothCounter(
  end: number,
  start: number = 0,
  duration: number = 1000
): number {
  const [count, setCount] = useState(start);
  
  useEffect(() => {
    if (count !== end) {
      const startTime = Date.now();
      const difference = end - start;
      
      const step = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        setCount(Math.floor(start + difference * progress));
        
        if (progress < 1) {
          requestAnimationFrame(step);
        }
      };
      
      requestAnimationFrame(step);
    }
  }, [start, end, duration, count]);
  
  return count;
}
