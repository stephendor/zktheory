export interface PerformanceConfig {
  monitoring: {
    enabled: boolean;
    sampleRate: number;
    bufferSize: number;
    maxAge: number;
  };
  alerts: {
    enabled: boolean;
    anomalyDetection: boolean;
    thresholdChecking: boolean;
  };
  export: {
    enabled: boolean;
    autoExport: boolean;
    exportInterval: number;
  };
  optimization: {
    autoCleanup: boolean;
    cleanupInterval: number;
    memoryThreshold: number;
  };
}

// Safe environment detection for browser compatibility
const safeGetEnv = (key: string, defaultValue: string = ''): string => {
  try {
    if (typeof window !== 'undefined') {
      // Client-side: use default values
      return defaultValue;
    }
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key] || defaultValue;
    }
    return defaultValue;
  } catch {
    return defaultValue;
  }
};

const getNodeEnv = (): string => {
  return safeGetEnv('NODE_ENV', 'production');
};

export class PerformanceConfigManager {
  private static instance: PerformanceConfigManager | null = null;
  private config: PerformanceConfig;

  private constructor() {
    this.config = this.createDefaultConfig();
  }

  static getInstance(): PerformanceConfigManager {
    if (!PerformanceConfigManager.instance) {
      PerformanceConfigManager.instance = new PerformanceConfigManager();
    }
    return PerformanceConfigManager.instance;
  }

  private createDefaultConfig(): PerformanceConfig {
    const nodeEnv = getNodeEnv();
    const isDevelopment = nodeEnv === 'development';

    return {
      monitoring: {
        enabled: isDevelopment,
        sampleRate: 1.0,
        bufferSize: 10000,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      },
      alerts: {
        enabled: isDevelopment,
        anomalyDetection: false,
        thresholdChecking: true
      },
      export: {
        enabled: false,
        autoExport: false,
        exportInterval: 5 * 60 * 1000 // 5 minutes
      },
      optimization: {
        autoCleanup: true,
        cleanupInterval: 10 * 60 * 1000, // 10 minutes
        memoryThreshold: 100 * 1024 * 1024 // 100MB
      }
    };
  }

  getConfig(): PerformanceConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<PerformanceConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  isMonitoringEnabled(): boolean {
    return this.config.monitoring.enabled;
  }

  getSampleRate(): number {
    return this.config.monitoring.sampleRate;
  }

  getBufferSize(): number {
    return this.config.monitoring.bufferSize;
  }

  getMaxAge(): number {
    return this.config.monitoring.maxAge;
  }
}

// Lazy initialization
let configManagerInstance: PerformanceConfigManager | null = null;

export const getPerformanceConfig = (): PerformanceConfigManager => {
  if (!configManagerInstance) {
    configManagerInstance = PerformanceConfigManager.getInstance();
  }
  return configManagerInstance;
};

// Export for backwards compatibility
export const performanceConfig = {
  get instance() {
    return getPerformanceConfig();
  }
};
