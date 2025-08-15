/**
 * Resource Management System for Mathematical Test Execution
 * Optimizes CPU, memory, and worker allocation for parallel mathematical computations
 */

import { performance } from 'perf_hooks';
import { cpus } from 'os';

export interface ResourceConfiguration {
  maxWorkers: number;
  memoryLimitMB: number;
  cpuThreshold: number;
  timeoutMs: number;
  retries: number;
  priorityLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface ResourceUsage {
  cpuUsage: number;
  memoryUsageMB: number;
  activeWorkers: number;
  queuedTasks: number;
  averageTaskDuration: number;
}

export interface TestResourceMetrics {
  taskId: string;
  category: string;
  startTime: number;
  endTime?: number;
  peakMemoryMB: number;
  cpuTime: number;
  workerAssigned: number;
  success: boolean;
  error?: string;
}

/**
 * Resource allocation strategies for different test categories
 */
export const ResourceProfiles = {
  unit: {
    maxWorkers: Math.max(1, Math.floor(cpus().length * 0.9)),
    memoryLimitMB: 512,
    cpuThreshold: 80,
    timeoutMs: 5000,
    retries: 1,
    priorityLevel: 'medium' as const
  },
  
  mathematical: {
    maxWorkers: Math.max(1, Math.floor(cpus().length * 0.6)),
    memoryLimitMB: 2048,
    cpuThreshold: 90,
    timeoutMs: 30000,
    retries: 2,
    priorityLevel: 'high' as const
  },
  
  performance: {
    maxWorkers: 1, // Sequential execution to avoid interference
    memoryLimitMB: 4096,
    cpuThreshold: 95,
    timeoutMs: 60000,
    retries: 1,
    priorityLevel: 'critical' as const
  },
  
  visual: {
    maxWorkers: Math.max(1, Math.floor(cpus().length * 0.4)),
    memoryLimitMB: 1024,
    cpuThreshold: 85,
    timeoutMs: 15000,
    retries: 3,
    priorityLevel: 'medium' as const
  },
  
  integration: {
    maxWorkers: Math.max(1, Math.floor(cpus().length * 0.5)),
    memoryLimitMB: 1536,
    cpuThreshold: 85,
    timeoutMs: 45000,
    retries: 2,
    priorityLevel: 'high' as const
  }
};

/**
 * Memory monitoring utilities
 */
export class MemoryMonitor {
  private static memorySnapshots: Array<{timestamp: number, usage: NodeJS.MemoryUsage}> = [];
  private static readonly MAX_SNAPSHOTS = 100;

  static takeSnapshot(): NodeJS.MemoryUsage {
    const usage = process.memoryUsage();
    this.memorySnapshots.push({
      timestamp: Date.now(),
      usage
    });

    // Keep only recent snapshots
    if (this.memorySnapshots.length > this.MAX_SNAPSHOTS) {
      this.memorySnapshots = this.memorySnapshots.slice(-this.MAX_SNAPSHOTS);
    }

    return usage;
  }

  static getCurrentMemoryMB(): number {
    const usage = process.memoryUsage();
    return usage.heapUsed / (1024 * 1024);
  }

  static getPeakMemoryMB(): number {
    if (this.memorySnapshots.length === 0) return 0;
    
    const peak = Math.max(...this.memorySnapshots.map(s => s.usage.heapUsed));
    return peak / (1024 * 1024);
  }

  static getMemoryTrend(): 'increasing' | 'decreasing' | 'stable' {
    if (this.memorySnapshots.length < 5) return 'stable';
    
    const recent = this.memorySnapshots.slice(-5);
    const trend = recent.reduce((acc, snapshot, index) => {
      if (index === 0) return acc;
      const prev = recent[index - 1];
      return acc + (snapshot.usage.heapUsed - prev.usage.heapUsed);
    }, 0);

    const threshold = 10 * 1024 * 1024; // 10MB threshold
    if (trend > threshold) return 'increasing';
    if (trend < -threshold) return 'decreasing';
    return 'stable';
  }

  static detectMemoryLeak(): boolean {
    const trend = this.getMemoryTrend();
    const currentMB = this.getCurrentMemoryMB();
    const peakMB = this.getPeakMemoryMB();
    
    // Simple heuristic: if memory is consistently increasing and current usage is high
    return trend === 'increasing' && currentMB > 1000 && (currentMB / peakMB) > 0.8;
  }

  static generateMemoryReport(): {
    current: number;
    peak: number;
    trend: string;
    snapshots: number;
    potentialLeak: boolean;
  } {
    return {
      current: this.getCurrentMemoryMB(),
      peak: this.getPeakMemoryMB(),
      trend: this.getMemoryTrend(),
      snapshots: this.memorySnapshots.length,
      potentialLeak: this.detectMemoryLeak()
    };
  }

  static cleanup(): void {
    this.memorySnapshots = [];
    if (global.gc) {
      global.gc();
    }
  }
}

/**
 * CPU monitoring utilities
 */
export class CPUMonitor {
  private static cpuUsageSamples: number[] = [];
  private static readonly MAX_SAMPLES = 50;

  static async measureCPUUsage(): Promise<number> {
    // Simple CPU usage measurement using process.cpuUsage()
    const startUsage = process.cpuUsage();
    const startTime = performance.now();
    
    // Small delay to measure usage
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const endUsage = process.cpuUsage(startUsage);
    const endTime = performance.now();
    
    const totalTime = (endTime - startTime) * 1000; // Convert to microseconds
    const cpuTime = endUsage.user + endUsage.system;
    const usage = (cpuTime / totalTime) * 100;
    
    this.cpuUsageSamples.push(usage);
    if (this.cpuUsageSamples.length > this.MAX_SAMPLES) {
      this.cpuUsageSamples = this.cpuUsageSamples.slice(-this.MAX_SAMPLES);
    }
    
    return Math.min(100, Math.max(0, usage)); // Clamp between 0-100
  }

  static getAverageCPUUsage(): number {
    if (this.cpuUsageSamples.length === 0) return 0;
    return this.cpuUsageSamples.reduce((sum, usage) => sum + usage, 0) / this.cpuUsageSamples.length;
  }

  static isHighCPUUsage(threshold: number = 80): boolean {
    return this.getAverageCPUUsage() > threshold;
  }

  static cleanup(): void {
    this.cpuUsageSamples = [];
  }
}

/**
 * Worker pool management for parallel test execution
 */
export class WorkerPool {
  private static activeWorkers = new Map<number, TestResourceMetrics>();
  private static workerQueue: Array<{taskId: string, priority: number}> = [];
  private static nextWorkerId = 1;

  static allocateWorker(taskId: string, category: string, priority: 'low' | 'medium' | 'high' | 'critical'): number {
    const config = ResourceProfiles[category as keyof typeof ResourceProfiles] || ResourceProfiles.unit;
    
    // Check if we can allocate a new worker
    if (this.activeWorkers.size >= config.maxWorkers) {
      const priorityValue = this.getPriorityValue(priority);
      this.workerQueue.push({ taskId, priority: priorityValue });
      return -1; // No worker available
    }

    const workerId = this.nextWorkerId++;
    const metrics: TestResourceMetrics = {
      taskId,
      category,
      startTime: performance.now(),
      peakMemoryMB: MemoryMonitor.getCurrentMemoryMB(),
      cpuTime: 0,
      workerAssigned: workerId,
      success: false
    };

    this.activeWorkers.set(workerId, metrics);
    return workerId;
  }

  static releaseWorker(workerId: number, success: boolean, error?: string): TestResourceMetrics | null {
    const metrics = this.activeWorkers.get(workerId);
    if (!metrics) return null;

    metrics.endTime = performance.now();
    metrics.success = success;
    metrics.error = error;
    metrics.peakMemoryMB = Math.max(metrics.peakMemoryMB, MemoryMonitor.getCurrentMemoryMB());

    this.activeWorkers.delete(workerId);

    // Process queued tasks
    if (this.workerQueue.length > 0) {
      // Sort by priority and allocate to highest priority task
      this.workerQueue.sort((a, b) => b.priority - a.priority);
      const nextTask = this.workerQueue.shift();
      if (nextTask) {
        // Note: In a real implementation, we'd need to notify the waiting task
        console.log(`Worker ${workerId} released, allocating to queued task ${nextTask.taskId}`);
      }
    }

    return metrics;
  }

  static getResourceUsage(): ResourceUsage {
    const activeWorkers = this.activeWorkers.size;
    const queuedTasks = this.workerQueue.length;
    
    const durations = Array.from(this.activeWorkers.values())
      .filter(m => m.endTime)
      .map(m => m.endTime! - m.startTime);
    
    const averageTaskDuration = durations.length > 0 
      ? durations.reduce((sum, d) => sum + d, 0) / durations.length 
      : 0;

    return {
      cpuUsage: CPUMonitor.getAverageCPUUsage(),
      memoryUsageMB: MemoryMonitor.getCurrentMemoryMB(),
      activeWorkers,
      queuedTasks,
      averageTaskDuration
    };
  }

  static getAllMetrics(): TestResourceMetrics[] {
    return Array.from(this.activeWorkers.values());
  }

  static cleanup(): void {
    this.activeWorkers.clear();
    this.workerQueue = [];
    this.nextWorkerId = 1;
  }

  private static getPriorityValue(priority: 'low' | 'medium' | 'high' | 'critical'): number {
    const priorities = { low: 1, medium: 2, high: 3, critical: 4 };
    return priorities[priority];
  }
}

/**
 * Main resource manager orchestrating all resource monitoring and allocation
 */
export class TestResourceManager {
  private static instance: TestResourceManager | null = null;
  private monitoring = false;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private resourceMetrics: TestResourceMetrics[] = [];

  static getInstance(): TestResourceManager {
    if (!this.instance) {
      this.instance = new TestResourceManager();
    }
    return this.instance;
  }

  /**
   * Start resource monitoring
   */
  startMonitoring(intervalMs: number = 5000): void {
    if (this.monitoring) return;

    this.monitoring = true;
    this.monitoringInterval = setInterval(async () => {
      MemoryMonitor.takeSnapshot();
      await CPUMonitor.measureCPUUsage();
      
      // Check for resource constraints
      this.checkResourceConstraints();
    }, intervalMs);

    console.log('Resource monitoring started');
  }

  /**
   * Stop resource monitoring
   */
  stopMonitoring(): void {
    if (!this.monitoring) return;

    this.monitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    console.log('Resource monitoring stopped');
  }

  /**
   * Execute a test with resource monitoring
   */
  async executeWithResourceMonitoring<T>(
    taskId: string,
    category: keyof typeof ResourceProfiles,
    testFn: () => Promise<T>
  ): Promise<T> {
    const config = ResourceProfiles[category];
    const workerId = WorkerPool.allocateWorker(taskId, category, config.priorityLevel);

    if (workerId === -1) {
      throw new Error(`No workers available for task ${taskId} in category ${category}`);
    }

    const startMemory = MemoryMonitor.getCurrentMemoryMB();
    const startTime = performance.now();

    try {
      // Set up timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(`Task ${taskId} timed out after ${config.timeoutMs}ms`)), config.timeoutMs);
      });

      // Execute the test with timeout
      const result = await Promise.race([
        testFn(),
        timeoutPromise
      ]);

      // Check memory usage
      const endMemory = MemoryMonitor.getCurrentMemoryMB();
      const memoryUsed = endMemory - startMemory;

      if (memoryUsed > config.memoryLimitMB) {
        console.warn(`Task ${taskId} exceeded memory limit: ${memoryUsed}MB > ${config.memoryLimitMB}MB`);
      }

      const metrics = WorkerPool.releaseWorker(workerId, true);
      if (metrics) {
        this.resourceMetrics.push(metrics);
      }

      return result;
    } catch (error) {
      const metrics = WorkerPool.releaseWorker(workerId, false, error instanceof Error ? error.message : 'Unknown error');
      if (metrics) {
        this.resourceMetrics.push(metrics);
      }
      throw error;
    }
  }

  /**
   * Get optimal configuration for a test category based on current resources
   */
  getOptimalConfiguration(category: keyof typeof ResourceProfiles): ResourceConfiguration {
    const baseConfig = ResourceProfiles[category];
    const currentUsage = WorkerPool.getResourceUsage();
    
    // Adjust configuration based on current resource usage
    let adjustedConfig = { ...baseConfig };

    // Reduce workers if CPU usage is high
    if (currentUsage.cpuUsage > 80) {
      adjustedConfig.maxWorkers = Math.max(1, Math.floor(adjustedConfig.maxWorkers * 0.7));
    }

    // Reduce memory limits if memory usage is high
    if (currentUsage.memoryUsageMB > 2048) {
      adjustedConfig.memoryLimitMB = Math.floor(adjustedConfig.memoryLimitMB * 0.8);
    }

    // Increase timeout if system is under load
    if (currentUsage.cpuUsage > 70 || currentUsage.memoryUsageMB > 1536) {
      adjustedConfig.timeoutMs = Math.floor(adjustedConfig.timeoutMs * 1.5);
    }

    return adjustedConfig;
  }

  /**
   * Generate comprehensive resource usage report
   */
  generateResourceReport(): {
    summary: ResourceUsage;
    memory: ReturnType<typeof MemoryMonitor.generateMemoryReport>;
    cpu: { average: number; high: boolean };
    workers: { total: number; completed: number; failed: number };
    recommendations: string[];
  } {
    const summary = WorkerPool.getResourceUsage();
    const memory = MemoryMonitor.generateMemoryReport();
    const cpu = {
      average: CPUMonitor.getAverageCPUUsage(),
      high: CPUMonitor.isHighCPUUsage()
    };

    const completedTasks = this.resourceMetrics.filter(m => m.success).length;
    const failedTasks = this.resourceMetrics.filter(m => !m.success).length;

    const workers = {
      total: completedTasks + failedTasks,
      completed: completedTasks,
      failed: failedTasks
    };

    const recommendations = this.generateRecommendations(summary, memory, cpu);

    return {
      summary,
      memory,
      cpu,
      workers,
      recommendations
    };
  }

  /**
   * Cleanup all resources
   */
  cleanup(): void {
    this.stopMonitoring();
    WorkerPool.cleanup();
    MemoryMonitor.cleanup();
    CPUMonitor.cleanup();
    this.resourceMetrics = [];
  }

  private checkResourceConstraints(): void {
    const usage = WorkerPool.getResourceUsage();
    
    if (usage.cpuUsage > 90) {
      console.warn('High CPU usage detected:', usage.cpuUsage);
    }
    
    if (usage.memoryUsageMB > 3072) {
      console.warn('High memory usage detected:', usage.memoryUsageMB, 'MB');
    }
    
    if (MemoryMonitor.detectMemoryLeak()) {
      console.warn('Potential memory leak detected');
    }
  }

  private generateRecommendations(
    summary: ResourceUsage,
    memory: ReturnType<typeof MemoryMonitor.generateMemoryReport>,
    cpu: { average: number; high: boolean }
  ): string[] {
    const recommendations: string[] = [];

    if (cpu.high) {
      recommendations.push('Consider reducing parallel workers due to high CPU usage');
    }

    if (memory.current > 2048) {
      recommendations.push('High memory usage detected - consider running tests in smaller batches');
    }

    if (memory.potentialLeak) {
      recommendations.push('Potential memory leak detected - review test cleanup procedures');
    }

    if (summary.queuedTasks > 10) {
      recommendations.push('Large task queue detected - consider increasing worker count or splitting test suites');
    }

    if (summary.averageTaskDuration > 30000) {
      recommendations.push('Long-running tasks detected - review test timeouts and optimization opportunities');
    }

    return recommendations;
  }
}

/**
 * Convenience function for executing tests with resource monitoring
 */
export async function runWithResourceMonitoring<T>(
  taskId: string,
  category: keyof typeof ResourceProfiles,
  testFn: () => Promise<T>
): Promise<T> {
  const manager = TestResourceManager.getInstance();
  return manager.executeWithResourceMonitoring(taskId, category, testFn);
}

/**
 * Export resource utilities
 */
export const ResourceUtils = {
  TestResourceManager,
  WorkerPool,
  MemoryMonitor,
  CPUMonitor,
  ResourceProfiles,
  runWithResourceMonitoring
};

export default ResourceUtils;