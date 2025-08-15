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

export class PerformanceConfigManager {
  private static instance: PerformanceConfigManager;
  private config: PerformanceConfig;

  private constructor() {
    this.config = this.loadConfiguration();
  }

  static getInstance(): PerformanceConfigManager {
    if (!PerformanceConfigManager.instance) {
      PerformanceConfigManager.instance = new PerformanceConfigManager();
    }
    return PerformanceConfigManager.instance;
  }

  private loadConfiguration(): PerformanceConfig {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const isProduction = process.env.NODE_ENV === 'production';

    // Default configuration
    const defaultConfig: PerformanceConfig = {
      monitoring: {
        enabled: true,
        sampleRate: 1.0,
        bufferSize: 10000,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      },
      alerts: {
        enabled: true,
        anomalyDetection: true,
        thresholdChecking: true
      },
      export: {
        enabled: true,
        autoExport: false,
        exportInterval: 5 * 60 * 1000 // 5 minutes
      },
      optimization: {
        autoCleanup: true,
        cleanupInterval: 10 * 60 * 1000, // 10 minutes
        memoryThreshold: 100 * 1024 * 1024 // 100MB
      }
    };

    // Development overrides
    if (isDevelopment) {
      defaultConfig.monitoring.sampleRate = 1.0; // 100% sampling
      defaultConfig.monitoring.bufferSize = 50000; // Larger buffer
      defaultConfig.alerts.enabled = true;
      defaultConfig.alerts.anomalyDetection = true;
      defaultConfig.export.autoExport = true;
      defaultConfig.export.exportInterval = 2 * 60 * 1000; // 2 minutes
    }

    // Production overrides
    if (isProduction) {
      defaultConfig.monitoring.sampleRate = 0.01; // 1% sampling
      defaultConfig.monitoring.bufferSize = 5000; // Smaller buffer
      defaultConfig.alerts.enabled = false;
      defaultConfig.alerts.anomalyDetection = false;
      defaultConfig.export.autoExport = false;
      defaultConfig.optimization.autoCleanup = true;
      defaultConfig.optimization.cleanupInterval = 5 * 60 * 1000; // 5 minutes
    }

    // Environment variable overrides
    const envConfig = this.loadEnvironmentConfig();
    return this.mergeConfigs(defaultConfig, envConfig);
  }

  private loadEnvironmentConfig(): Partial<PerformanceConfig> {
    const envConfig: Partial<PerformanceConfig> = {};

    // Monitoring configuration
    if (process.env.PERFORMANCE_MONITORING_ENABLED !== undefined) {
      envConfig.monitoring = {
        enabled: process.env.PERFORMANCE_MONITORING_ENABLED === 'true',
        sampleRate: 1.0, // Default value
        bufferSize: 10000, // Default value
        maxAge: 24 * 60 * 60 * 1000 // Default value
      };
    }

    if (process.env.PERFORMANCE_SAMPLE_RATE !== undefined) {
      const sampleRate = parseFloat(process.env.PERFORMANCE_SAMPLE_RATE);
      if (!isNaN(sampleRate) && sampleRate >= 0 && sampleRate <= 1) {
        if (!envConfig.monitoring) {
          envConfig.monitoring = {
            enabled: true,
            sampleRate: 1.0,
            bufferSize: 10000,
            maxAge: 24 * 60 * 60 * 1000
          };
        }
        envConfig.monitoring.sampleRate = sampleRate;
      }
    }

    if (process.env.PERFORMANCE_BUFFER_SIZE !== undefined) {
      const bufferSize = parseInt(process.env.PERFORMANCE_BUFFER_SIZE);
      if (!isNaN(bufferSize) && bufferSize > 0) {
        if (!envConfig.monitoring) {
          envConfig.monitoring = {
            enabled: true,
            sampleRate: 1.0,
            bufferSize: 10000,
            maxAge: 24 * 60 * 60 * 1000
          };
        }
        envConfig.monitoring.bufferSize = bufferSize;
      }
    }

    // Alert configuration
    if (process.env.PERFORMANCE_ALERT_ENABLED !== undefined) {
      envConfig.alerts = {
        enabled: process.env.PERFORMANCE_ALERT_ENABLED === 'true',
        anomalyDetection: true, // Default value
        thresholdChecking: true // Default value
      };
    }

    if (process.env.PERFORMANCE_ANOMALY_DETECTION !== undefined) {
      if (!envConfig.alerts) {
        envConfig.alerts = {
          enabled: true,
          anomalyDetection: true,
          thresholdChecking: true
        };
      }
      envConfig.alerts.anomalyDetection = process.env.PERFORMANCE_ANOMALY_DETECTION === 'true';
    }

    // Export configuration
    if (process.env.PERFORMANCE_EXPORT_ENABLED !== undefined) {
      envConfig.export = {
        enabled: process.env.PERFORMANCE_EXPORT_ENABLED === 'true',
        autoExport: false, // Default value
        exportInterval: 5 * 60 * 1000 // Default value
      };
    }

    if (process.env.PERFORMANCE_AUTO_EXPORT !== undefined) {
      if (!envConfig.export) {
        envConfig.export = {
          enabled: true,
          autoExport: false,
          exportInterval: 5 * 60 * 1000
        };
      }
      envConfig.export.autoExport = process.env.PERFORMANCE_AUTO_EXPORT === 'true';
    }

    // Optimization configuration
    if (process.env.PERFORMANCE_AUTO_CLEANUP !== undefined) {
      envConfig.optimization = {
        autoCleanup: process.env.PERFORMANCE_AUTO_CLEANUP === 'true',
        cleanupInterval: 10 * 60 * 1000, // Default value
        memoryThreshold: 100 * 1024 * 1024 // Default value
      };
    }

    if (process.env.PERFORMANCE_MEMORY_THRESHOLD !== undefined) {
      const memoryThreshold = parseInt(process.env.PERFORMANCE_MEMORY_THRESHOLD);
      if (!isNaN(memoryThreshold) && memoryThreshold > 0) {
        if (!envConfig.optimization) {
          envConfig.optimization = {
            autoCleanup: true,
            cleanupInterval: 10 * 60 * 1000,
            memoryThreshold: 100 * 1024 * 1024
          };
        }
        envConfig.optimization.memoryThreshold = memoryThreshold * 1024 * 1024; // Convert MB to bytes
      }
    }

    return envConfig;
  }

  private mergeConfigs(defaultConfig: PerformanceConfig, envConfig: Partial<PerformanceConfig>): PerformanceConfig {
    const merged = { ...defaultConfig };

    if (envConfig.monitoring) {
      merged.monitoring = { ...merged.monitoring, ...envConfig.monitoring };
    }

    if (envConfig.alerts) {
      merged.alerts = { ...merged.alerts, ...envConfig.alerts };
    }

    if (envConfig.export) {
      merged.export = { ...merged.export, ...envConfig.export };
    }

    if (envConfig.optimization) {
      merged.optimization = { ...merged.optimization, ...envConfig.optimization };
    }

    return merged;
  }

  getConfig(): PerformanceConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<PerformanceConfig>): void {
    this.config = this.mergeConfigs(this.config, updates);
    this.saveConfiguration();
  }

  private saveConfiguration(): void {
    // In a real application, this would save to localStorage, database, or API
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('performance-config', JSON.stringify(this.config));
      } catch (error) {
        console.warn('Failed to save performance configuration:', error);
      }
    }
  }

  loadSavedConfiguration(): void {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('performance-config');
        if (saved) {
          const parsed = JSON.parse(saved);
          this.config = this.mergeConfigs(this.config, parsed);
        }
      } catch (error) {
        console.warn('Failed to load saved performance configuration:', error);
      }
    }
  }

  resetToDefaults(): void {
    this.config = this.loadConfiguration();
    this.saveConfiguration();
  }

  isMonitoringEnabled(): boolean {
    return this.config.monitoring.enabled;
  }

  isAlertsEnabled(): boolean {
    return this.config.alerts.enabled;
  }

  isExportEnabled(): boolean {
    return this.config.export.enabled;
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

  shouldUseIdleCallback(): boolean {
    // Use requestIdleCallback for non-critical operations in production
    return process.env.NODE_ENV === 'production' && 
           typeof window !== 'undefined' && 
           'requestIdleCallback' in window;
  }

  shouldUseWebWorkers(): boolean {
    // Use Web Workers for heavy computations in production
    return process.env.NODE_ENV === 'production' && 
           typeof window !== 'undefined' && 
           'Worker' in window;
  }

  getOptimizationLevel(): 'minimal' | 'balanced' | 'aggressive' {
    if (process.env.NODE_ENV === 'production') {
      return 'aggressive';
    } else if (process.env.NODE_ENV === 'development') {
      return 'balanced';
    }
    return 'minimal';
  }

  getEnvironmentInfo(): {
    environment: string;
    isProduction: boolean;
    isDevelopment: boolean;
    supportsIdleCallback: boolean;
    supportsWebWorkers: boolean;
    supportsPerformanceMemory: boolean;
  } {
    return {
      environment: process.env.NODE_ENV || 'unknown',
      isProduction: process.env.NODE_ENV === 'production',
      isDevelopment: process.env.NODE_ENV === 'development',
      supportsIdleCallback: typeof window !== 'undefined' && 'requestIdleCallback' in window,
      supportsWebWorkers: typeof window !== 'undefined' && 'Worker' in window,
      supportsPerformanceMemory: typeof window !== 'undefined' && 'performance' in window && 'memory' in (performance as any)
    };
  }
}

export const performanceConfig = PerformanceConfigManager.getInstance();
