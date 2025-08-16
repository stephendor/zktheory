/**
 * Performance Optimization Utilities
 * Advanced techniques for maintaining 60fps with complex mathematical animations
 */

// ==========================================
// Performance Monitoring
// ==========================================

export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();
  private observers: IntersectionObserver[] = [];
  private rafId: number | null = null;
  private frameCount = 0;
  private lastTime = 0;

  // Track performance metrics
  track(key: string, value: number): void {
    if (!this.metrics.has(key)) {
      this.metrics.set(key, []);
    }
    
    const values = this.metrics.get(key)!;
    values.push(value);
    
    // Keep only last 100 measurements
    if (values.length > 100) {
      values.shift();
    }
  }

  // Get average performance metric
  getAverage(key: string): number {
    const values = this.metrics.get(key) || [];
    if (values.length === 0) return 0;
    
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  // Monitor frame rate
  startFrameRateMonitoring(callback: (fps: number) => void): void {
    const measureFPS = (currentTime: number) => {
      if (this.lastTime !== 0) {
        const delta = currentTime - this.lastTime;
        this.frameCount++;
        
        if (this.frameCount >= 60) {
          const fps = 1000 / (delta / this.frameCount);
          callback(fps);
          this.frameCount = 0;
        }
      }
      
      this.lastTime = currentTime;
      this.rafId = requestAnimationFrame(measureFPS);
    };
    
    this.rafId = requestAnimationFrame(measureFPS);
  }

  // Stop monitoring
  stop(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }

  // Create intersection observer for lazy loading
  createIntersectionObserver(
    callback: (entries: IntersectionObserverEntry[]) => void,
    options?: IntersectionObserverInit
  ): IntersectionObserver {
    const observer = new IntersectionObserver(callback, {
      threshold: 0.1,
      rootMargin: '50px',
      ...options
    });
    
    this.observers.push(observer);
    return observer;
  }
}

// ==========================================
// Lazy Loading Utilities
// ==========================================

export const useLazyLoading = () => {
  const [loadedComponents, setLoadedComponents] = React.useState<Set<string>>(new Set());
  const observerRef = React.useRef<IntersectionObserver | null>(null);

  const registerForLazyLoading = React.useCallback((
    element: HTMLElement | null,
    componentId: string,
    onLoad?: () => void
  ) => {
    if (!element) return;

    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const id = entry.target.getAttribute('data-component-id');
              if (id && !loadedComponents.has(id)) {
                setLoadedComponents(prev => new Set([...prev, id]));
                onLoad?.();
                observerRef.current?.unobserve(entry.target);
              }
            }
          });
        },
        { threshold: 0.1, rootMargin: '50px' }
      );
    }

    element.setAttribute('data-component-id', componentId);
    observerRef.current.observe(element);
  }, [loadedComponents]);

  const isLoaded = React.useCallback((componentId: string) => {
    return loadedComponents.has(componentId);
  }, [loadedComponents]);

  React.useEffect(() => {
    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  return { registerForLazyLoading, isLoaded };
};

// ==========================================
// Animation Optimization
// ==========================================

export class AnimationOptimizer {
  private animationFrames: Map<string, number> = new Map();
  private performanceMode: 'high' | 'balanced' | 'conservative' = 'balanced';

  setPerformanceMode(mode: 'high' | 'balanced' | 'conservative'): void {
    this.performanceMode = mode;
  }

  // Optimized requestAnimationFrame with performance throttling
  requestOptimizedFrame(
    key: string,
    callback: (timestamp: number) => void,
    priority: 'high' | 'medium' | 'low' = 'medium'
  ): void {
    // Cancel existing frame for this key
    const existingFrame = this.animationFrames.get(key);
    if (existingFrame) {
      cancelAnimationFrame(existingFrame);
    }

    // Throttle based on performance mode and priority
    const throttleMap = {
      high: { high: 1, medium: 1, low: 1 },
      balanced: { high: 1, medium: 2, low: 3 },
      conservative: { high: 2, medium: 3, low: 5 }
    };

    const throttle = throttleMap[this.performanceMode][priority];
    let frameCount = 0;

    const throttledCallback = (timestamp: number) => {
      frameCount++;
      if (frameCount >= throttle) {
        callback(timestamp);
        frameCount = 0;
      }
      
      const frameId = requestAnimationFrame(throttledCallback);
      this.animationFrames.set(key, frameId);
    };

    const frameId = requestAnimationFrame(throttledCallback);
    this.animationFrames.set(key, frameId);
  }

  // Cancel animation
  cancelAnimation(key: string): void {
    const frameId = this.animationFrames.get(key);
    if (frameId) {
      cancelAnimationFrame(frameId);
      this.animationFrames.delete(key);
    }
  }

  // Cancel all animations
  cancelAllAnimations(): void {
    this.animationFrames.forEach((frameId) => {
      cancelAnimationFrame(frameId);
    });
    this.animationFrames.clear();
  }

  // Get optimal configuration based on device capabilities
  getOptimalConfig(baseConfig: any): any {
    const deviceMemory = (navigator as any).deviceMemory || 4;
    const hardwareConcurrency = navigator.hardwareConcurrency || 2;
    const pixelRatio = window.devicePixelRatio || 1;

    // Device capability score (0-1)
    const capabilityScore = Math.min(
      (deviceMemory / 8) * 0.4 +
      (hardwareConcurrency / 8) * 0.4 +
      (pixelRatio <= 2 ? 1 : 0.5) * 0.2,
      1
    );

    const performanceMultipliers = {
      high: 1.0,
      balanced: 0.7 + (capabilityScore * 0.3),
      conservative: 0.4 + (capabilityScore * 0.2)
    };

    const multiplier = performanceMultipliers[this.performanceMode];

    return {
      ...baseConfig,
      segments: Math.floor(baseConfig.segments * multiplier),
      particleCount: Math.floor(baseConfig.particleCount * multiplier),
      animationDuration: baseConfig.animationDuration / multiplier,
      quality: Math.max(0.3, multiplier)
    };
  }
}

// ==========================================
// Memory Management
// ==========================================

export class MemoryManager {
  private canvasPool: HTMLCanvasElement[] = [];
  private contextPool: CanvasRenderingContext2D[] = [];
  private maxPoolSize = 5;

  // Get or create canvas from pool
  getCanvas(width: number, height: number): HTMLCanvasElement {
    let canvas = this.canvasPool.pop();
    
    if (!canvas) {
      canvas = document.createElement('canvas');
    }

    canvas.width = width;
    canvas.height = height;
    
    return canvas;
  }

  // Return canvas to pool
  returnCanvas(canvas: HTMLCanvasElement): void {
    if (this.canvasPool.length < this.maxPoolSize) {
      // Clear canvas before returning to pool
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      
      this.canvasPool.push(canvas);
    }
  }

  // Get or create 2D context from pool
  getContext2D(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D context');
    }
    return ctx;
  }

  // Cleanup unused resources
  cleanup(): void {
    this.canvasPool = [];
    this.contextPool = [];
  }

  // Monitor memory usage (if available)
  getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024; // MB
    }
    return 0;
  }
}

// ==========================================
// Performance-aware Canvas Rendering
// ==========================================

export class OptimizedCanvasRenderer {
  private offscreenCanvas: OffscreenCanvas | null = null;
  private worker: Worker | null = null;
  private memoryManager = new MemoryManager();

  constructor(private performanceMode: 'high' | 'balanced' | 'conservative' = 'balanced') {}

  // Initialize offscreen rendering if supported
  initOffscreenRendering(): boolean {
    if (typeof OffscreenCanvas !== 'undefined' && typeof Worker !== 'undefined') {
      try {
        // Create worker for offscreen rendering
        const workerCode = `
          self.onmessage = function(e) {
            const { canvas, renderData } = e.data;
            const ctx = canvas.getContext('2d');
            
            // Perform rendering operations
            // ... rendering code ...
            
            self.postMessage({ type: 'renderComplete' });
          };
        `;
        
        const blob = new Blob([workerCode], { type: 'application/javascript' });
        this.worker = new Worker(URL.createObjectURL(blob));
        
        return true;
      } catch (error) {
        console.warn('Offscreen rendering not available:', error);
        return false;
      }
    }
    return false;
  }

  // Render with performance optimizations
  renderOptimized(
    canvas: HTMLCanvasElement,
    renderFunction: (ctx: CanvasRenderingContext2D) => void,
    options: { useOffscreen?: boolean; cacheKey?: string } = {}
  ): void {
    const ctx = this.memoryManager.getContext2D(canvas);
    
    // Apply performance-based optimizations
    switch (this.performanceMode) {
      case 'conservative':
        ctx.imageSmoothingEnabled = false;
        break;
      case 'balanced':
        ctx.imageSmoothingQuality = 'medium';
        break;
      case 'high':
        ctx.imageSmoothingQuality = 'high';
        break;
    }

    // Execute rendering
    renderFunction(ctx);
  }

  // Cleanup resources
  cleanup(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.memoryManager.cleanup();
  }
}

// ==========================================
// Device Capability Detection
// ==========================================

export const detectDeviceCapabilities = () => {
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  const isLowEndDevice = (navigator as any).deviceMemory && (navigator as any).deviceMemory <= 2;
  const hasReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pixelRatio = window.devicePixelRatio || 1;
  const cores = navigator.hardwareConcurrency || 2;

  const capabilities = {
    isMobile,
    isLowEndDevice,
    hasReducedMotion,
    supportsWebGL: !!document.createElement('canvas').getContext('webgl'),
    supportsOffscreenCanvas: typeof OffscreenCanvas !== 'undefined',
    supportsWorkers: typeof Worker !== 'undefined',
    pixelRatio,
    cores,
    memory: (navigator as any).deviceMemory || 4
  };

  // Determine recommended performance mode
  let recommendedMode: 'high' | 'balanced' | 'conservative' = 'balanced';
  
  if (isLowEndDevice || isMobile || hasReducedMotion || cores <= 2) {
    recommendedMode = 'conservative';
  } else if (capabilities.memory >= 8 && cores >= 4 && pixelRatio <= 2) {
    recommendedMode = 'high';
  }

  return { ...capabilities, recommendedMode };
};

// ==========================================
// React Hooks
// ==========================================

import React from 'react';

export const usePerformanceMode = () => {
  const [performanceMode, setPerformanceMode] = React.useState<'high' | 'balanced' | 'conservative'>('balanced');
  
  React.useEffect(() => {
    const capabilities = detectDeviceCapabilities();
    setPerformanceMode(capabilities.recommendedMode);
  }, []);

  return { performanceMode, setPerformanceMode };
};

export const useAnimationOptimizer = () => {
  const optimizerRef = React.useRef<AnimationOptimizer | null>(null);
  
  if (!optimizerRef.current) {
    optimizerRef.current = new AnimationOptimizer();
  }

  React.useEffect(() => {
    return () => {
      optimizerRef.current?.cancelAllAnimations();
    };
  }, []);

  return optimizerRef.current;
};

export const useMemoryManager = () => {
  const managerRef = React.useRef<MemoryManager | null>(null);
  
  if (!managerRef.current) {
    managerRef.current = new MemoryManager();
  }

  React.useEffect(() => {
    return () => {
      managerRef.current?.cleanup();
    };
  }, []);

  return managerRef.current;
};