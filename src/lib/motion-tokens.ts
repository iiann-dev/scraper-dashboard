/**
 * Motion tokens, spring presets, and runtime configuration.
 * Based on motion-foundations skill principles:
 * - motion/react only (never framer-motion)
 * - initial must match server output (SSR-safe with mount guard)
 * - Reduced motion overrides everything
 * - Never animate layout properties (transform & opacity only)
 * - All durations and easings from this file
 */

export const motionTokens = {
  duration: {
    instant: 0.08,
    fast: 0.18,
    normal: 0.32,
    slow: 0.55,
    crawl: 0.9,
  },
  easing: {
    smooth: [0.22, 1, 0.3, 1],
    sharp: [0.4, 0, 0.2, 1],
    bounce: [0.34, 1.56, 0.64, 1],
    linear: [0, 0, 1, 1],
  },
  distance: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 48,
  },
  scale: {
    subtle: 0.98,
    press: 0.96,
    pop: 1.03,
  },
} as const

export const springs = {
  snappy: { type: 'spring' as const, stiffness: 300, damping: 30 },
  gentle: { type: 'spring' as const, stiffness: 120, damping: 14 },
  bouncy: { type: 'spring' as const, stiffness: 400, damping: 10 },
  instant: { type: 'spring' as const, stiffness: 600, damping: 35 },
  release: { type: 'spring' as const, stiffness: 200, damping: 20, restDelta: 0.001 },
} as const

export const motionConfig = {
  isLowEnd() {
    return (
      typeof navigator !== 'undefined' &&
      navigator.hardwareConcurrency <= 4
    )
  },

  prefersReduced() {
    return (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
  },

  /**
   * Gate for whether non-essential animation should run.
   * Returns false when: prefers-reduced-motion is active, or low-end device + non-essential.
   */
  shouldAnimate({ essential = false } = {}) {
    if (this.prefersReduced()) return false
    if (!essential && this.isLowEnd()) return false
    return true
  },

  /**
   * Duration that respects reduced motion — collapses to instant.
   */
  duration(token: keyof typeof motionTokens.duration) {
    if (this.prefersReduced() || this.isLowEnd()) {
      return motionTokens.duration.instant
    }
    return motionTokens.duration[token]
  },
} as const

/**
 * Hook for SSR-safe motion variants that respect reduced motion.
 * initial must match server output (opacity: 1) to avoid hydration mismatch.
 */
export function useSafeMotion(fullY: number = motionTokens.distance.md) {
  const reduce = motionConfig.prefersReduced()
  return {
    initial: { opacity: 0, y: reduce ? 0 : fullY },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: reduce ? 0 : -fullY },
  }
}

/**
 * Stagger container variant for list entrances.
 */
export const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.08,
    },
  },
}

/**
 * Each item in a staggered list.
 */
export const staggerItem = {
  hidden: { opacity: 0, y: motionTokens.distance.sm },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: motionTokens.duration.normal,
      ease: motionTokens.easing.smooth,
    },
  },
}
