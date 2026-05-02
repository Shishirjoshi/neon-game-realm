import { useEffect, useState } from "react";

export interface ViewportSize {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLandscape: boolean;
  isPortrait: boolean;
}

/**
 * Breakpoints for responsive design
 */
export const BREAKPOINTS = {
  xs: 320,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

/**
 * Hook to track viewport size and device type
 */
export function useViewport(): ViewportSize {
  const [viewport, setViewport] = useState<ViewportSize>({
    width: typeof window !== "undefined" ? window.innerWidth : 1024,
    height: typeof window !== "undefined" ? window.innerHeight : 768,
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isLandscape: false,
    isPortrait: false,
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setViewport({
        width,
        height,
        isMobile: width < BREAKPOINTS.md,
        isTablet: width >= BREAKPOINTS.md && width < BREAKPOINTS.lg,
        isDesktop: width >= BREAKPOINTS.lg,
        isLandscape: width > height,
        isPortrait: height > width,
      });
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  return viewport;
}

/**
 * Hook to detect if device prefers reduced motion
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return prefersReducedMotion;
}

/**
 * Get responsive grid columns
 */
export function getResponsiveGridCols(viewport: ViewportSize): string {
  if (viewport.isMobile) return "grid-cols-1";
  if (viewport.isTablet) return "grid-cols-2";
  return "grid-cols-3 lg:grid-cols-4";
}

/**
 * Get responsive chess board size
 */
export function getResponsiveChessBoardSize(viewport: ViewportSize): number {
  if (viewport.isMobile) return 48; // 6 * 8 = 48px per square
  if (viewport.isTablet) return 56; // 7 * 8 = 56px per square
  return 64; // 8 * 8 = 64px per square (standard)
}

/**
 * Get responsive padding
 */
export function getResponsivePadding(viewport: ViewportSize): string {
  if (viewport.isMobile) return "p-2";
  if (viewport.isTablet) return "p-4";
  return "p-6";
}

/**
 * Utility class generator for responsive design
 */
export function getResponsiveClasses(
  viewport: ViewportSize,
  config: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
  }
): string {
  if (viewport.isMobile) return config.mobile || "";
  if (viewport.isTablet) return config.tablet || "";
  return config.desktop || "";
}
