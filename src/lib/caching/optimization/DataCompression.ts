// Data Compression and Optimization for zktheory mathematical platform
// Implements efficient compression strategies for mathematical data

export interface CompressionOptions {
  algorithm: 'gzip' | 'deflate' | 'lz4' | 'custom';
  level: number; // 1-9 for gzip/deflate, 1-12 for lz4
  threshold: number; // Minimum size to compress (bytes)
  preservePrecision: boolean; // For mathematical data
  customCompression?: (data: any) => Promise<Uint8Array>;
}

export interface CompressionResult {
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  algorithm: string;
  metadata: {
    compressionTime: number;
    decompressionTime: number;
    precision: number;
  };
}

export interface MathematicalDataOptimizer {
  optimizePoints(points: number[][]): number[][];
  optimizeMatrices(matrices: number[][]): number[][];
  optimizeGraphData(graph: any): any;
  optimizeVisualizationData(data: any): any;
}

export class DataCompressionEngine {
  private compressionOptions: CompressionOptions;
  private mathematicalOptimizer: MathematicalDataOptimizer;

  constructor(options: Partial<CompressionOptions> = {}) {
    this.compressionOptions = {
      algorithm: 'gzip',
      level: 6,
      threshold: 1024, // 1KB
      preservePrecision: true,
      ...options
    };

    this.mathematicalOptimizer = new MathematicalDataOptimizerImpl();
  }

  // Compress data with automatic algorithm selection
  async compress(data: any, options?: Partial<CompressionOptions>): Promise<Uint8Array> {
    const startTime = performance.now();
    const mergedOptions = { ...this.compressionOptions, ...options };
    
    try {
      // Serialize data
      const serialized = this.serializeData(data);
      
      // Check if compression is worth it
      if (serialized.length < mergedOptions.threshold) {
        return new TextEncoder().encode(serialized);
      }

      // Optimize mathematical data before compression
      const optimized = this.optimizeMathematicalData(data);
      const optimizedSerialized = this.serializeData(optimized);

      // Choose compression algorithm based on data characteristics
      const algorithm = this.selectCompressionAlgorithm(optimizedSerialized, mergedOptions);
      
      let compressed: Uint8Array;
      
      switch (algorithm) {
        case 'gzip':
          compressed = await this.compressGzip(optimizedSerialized, mergedOptions.level);
          break;
        case 'deflate':
          compressed = await this.compressDeflate(optimizedSerialized, mergedOptions.level);
          break;
        case 'lz4':
          compressed = await this.compressLz4(optimizedSerialized, mergedOptions.level);
          break;
        case 'custom':
          if (mergedOptions.customCompression) {
            compressed = await mergedOptions.customCompression(optimized);
          } else {
            throw new Error('Custom compression function not provided');
          }
          break;
        default:
          throw new Error(`Unsupported compression algorithm: ${algorithm}`);
      }

      const compressionTime = performance.now() - startTime;
      
      console.log(`✅ Data compressed: ${optimizedSerialized.length} → ${compressed.length} bytes (${((1 - compressed.length / optimizedSerialized.length) * 100).toFixed(1)}% reduction) in ${compressionTime.toFixed(2)}ms`);
      
      return compressed;
    } catch (error) {
      console.error('❌ Compression failed:', error);
      // Fallback to uncompressed
      return new TextEncoder().encode(this.serializeData(data));
    }
  }

  // Decompress data
  async decompress(compressed: Uint8Array, algorithm: string): Promise<any> {
    const startTime = performance.now();
    
    try {
      let decompressed: string;
      
      switch (algorithm) {
        case 'gzip':
          decompressed = await this.decompressGzip(compressed);
          break;
        case 'deflate':
          decompressed = await this.decompressDeflate(compressed);
          break;
        case 'lz4':
          decompressed = await this.decompressLz4(compressed);
          break;
        default:
          throw new Error(`Unsupported decompression algorithm: ${algorithm}`);
      }

      const decompressionTime = performance.now() - startTime;
      
      // Deserialize and restore mathematical precision
      const data = this.deserializeData(decompressed);
      const restored = this.restoreMathematicalPrecision(data);
      
      console.log(`✅ Data decompressed: ${compressed.length} → ${decompressed.length} bytes in ${decompressionTime.toFixed(2)}ms`);
      
      return restored;
    } catch (error) {
      console.error('❌ Decompression failed:', error);
      throw error;
    }
  }

  // Get compression statistics
  getCompressionStats(original: any, compressed: Uint8Array): CompressionResult {
    const originalSize = new TextEncoder().encode(this.serializeData(original)).length;
    const compressedSize = compressed.length;
    const compressionRatio = 1 - (compressedSize / originalSize);

    return {
      originalSize,
      compressedSize,
      compressionRatio,
      algorithm: this.compressionOptions.algorithm,
      metadata: {
        compressionTime: 0, // Would be set during actual compression
        decompressionTime: 0, // Would be set during actual decompression
        precision: this.calculatePrecision(original)
      }
    };
  }

  // Private methods
  private serializeData(data: any): string {
    // Custom serialization for mathematical data
    if (this.isMathematicalData(data)) {
      return this.serializeMathematicalData(data);
    }
    
    // Standard JSON serialization for other data
    return JSON.stringify(data);
  }

  private deserializeData(serialized: string): any {
    try {
      return JSON.parse(serialized);
    } catch (error) {
      console.error('❌ Failed to deserialize data:', error);
      throw error;
    }
  }

  private isMathematicalData(data: any): boolean {
    return Array.isArray(data) && 
           (this.isPointCloud(data) || this.isMatrix(data) || this.isGraphData(data));
  }

  private isPointCloud(data: any): boolean {
    return Array.isArray(data) && 
           data.length > 0 && 
           Array.isArray(data[0]) && 
           typeof data[0][0] === 'number';
  }

  private isMatrix(data: any): boolean {
    return Array.isArray(data) && 
           data.length > 0 && 
           Array.isArray(data[0]) && 
           data.every(row => Array.isArray(row) && row.length === data[0].length);
  }

  private isGraphData(data: any): boolean {
    return data && typeof data === 'object' && 
           (data.nodes || data.edges || data.vertices);
  }

  private serializeMathematicalData(data: any): string {
    if (this.isPointCloud(data)) {
      return this.serializePointCloud(data);
    } else if (this.isMatrix(data)) {
      return this.serializeMatrix(data);
    } else if (this.isGraphData(data)) {
      return this.serializeGraphData(data);
    }
    
    return JSON.stringify(data);
  }

  private serializePointCloud(points: number[][]): string {
    // Optimize point cloud serialization
    const precision = this.calculatePrecision(points);
    const factor = Math.pow(10, precision);
    
    // Convert to integers for better compression
    const optimized = points.map(point => 
      point.map(coord => Math.round(coord * factor))
    );
    
    return JSON.stringify({
      type: 'pointcloud',
      precision,
      factor,
      data: optimized
    });
  }

  private serializeMatrix(matrix: number[][]): string {
    // Optimize matrix serialization
    const precision = this.calculatePrecision(matrix);
    const factor = Math.pow(10, precision);
    
    // Convert to integers and store dimensions
    const optimized = matrix.map(row => 
      row.map(val => Math.round(val * factor))
    );
    
    return JSON.stringify({
      type: 'matrix',
      precision,
      factor,
      rows: matrix.length,
      cols: matrix[0]?.length || 0,
      data: optimized
    });
  }

  private serializeGraphData(graph: any): string {
    // Optimize graph data serialization
    const optimized: any = { type: 'graph' };
    
    if (graph.nodes) {
      optimized.nodes = graph.nodes.map((node: any) => ({
        id: node.id,
        x: Math.round(node.x * 1000) / 1000,
        y: Math.round(node.y * 1000) / 1000,
        z: node.z ? Math.round(node.z * 1000) / 1000 : undefined
      }));
    }
    
    if (graph.edges) {
      optimized.edges = graph.edges.map((edge: any) => ({
        source: edge.source,
        target: edge.target,
        weight: edge.weight ? Math.round(edge.weight * 1000) / 1000 : undefined
      }));
    }
    
    return JSON.stringify(optimized);
  }

  private calculatePrecision(data: any): number {
    if (this.isPointCloud(data)) {
      return this.calculatePointCloudPrecision(data);
    } else if (this.isMatrix(data)) {
      return this.calculateMatrixPrecision(data);
    }
    
    return 6; // Default precision
  }

  private calculatePointCloudPrecision(points: number[][]): number {
    let maxDecimalPlaces = 0;
    
    for (const point of points) {
      for (const coord of point) {
        const decimalPlaces = this.countDecimalPlaces(coord);
        maxDecimalPlaces = Math.max(maxDecimalPlaces, decimalPlaces);
      }
    }
    
    return Math.min(maxDecimalPlaces, 6); // Cap at 6 decimal places
  }

  private calculateMatrixPrecision(matrix: number[][]): number {
    let maxDecimalPlaces = 0;
    
    for (const row of matrix) {
      for (const val of row) {
        const decimalPlaces = this.countDecimalPlaces(val);
        maxDecimalPlaces = Math.max(maxDecimalPlaces, decimalPlaces);
      }
    }
    
    return Math.min(maxDecimalPlaces, 6);
  }

  private countDecimalPlaces(num: number): number {
    if (Math.floor(num) === num) return 0;
    
    const str = num.toString();
    const decimalIndex = str.indexOf('.');
    
    if (decimalIndex === -1) return 0;
    
    return str.length - decimalIndex - 1;
  }

  private optimizeMathematicalData(data: any): any {
    if (this.isPointCloud(data)) {
      return this.mathematicalOptimizer.optimizePoints(data);
    } else if (this.isMatrix(data)) {
      return this.mathematicalOptimizer.optimizeMatrices(data);
    } else if (this.isGraphData(data)) {
      return this.mathematicalOptimizer.optimizeGraphData(data);
    }
    
    return data;
  }

  private restoreMathematicalPrecision(data: any): any {
    if (data && typeof data === 'object' && data.type) {
      switch (data.type) {
        case 'pointcloud':
          return this.restorePointCloud(data);
        case 'matrix':
          return this.restoreMatrix(data);
        case 'graph':
          return this.restoreGraphData(data);
      }
    }
    
    return data;
  }

  private restorePointCloud(data: any): number[][] {
    const { precision, factor, data: points } = data;
    return points.map((point: number[]) => 
      point.map(coord => coord / factor)
    );
  }

  private restoreMatrix(data: any): number[][] {
    const { precision, factor, data: matrix } = data;
    return matrix.map((row: number[]) => 
      row.map(val => val / factor)
    );
  }

  private restoreGraphData(data: any): any {
    const restored: any = {};
    
    if (data.nodes) {
      restored.nodes = data.nodes.map((node: any) => ({
        ...node,
        x: node.x,
        y: node.y,
        z: node.z
      }));
    }
    
    if (data.edges) {
      restored.edges = data.edges.map((edge: any) => ({
        ...edge,
        weight: edge.weight
      }));
    }
    
    return restored;
  }

  private selectCompressionAlgorithm(data: string, options: CompressionOptions): string {
    const dataLength = data.length;
    
    // For small data, use faster algorithms
    if (dataLength < 5000) {
      return 'lz4';
    }
    
    // For mathematical data, prefer gzip for better compression
    if (data.includes('"type"') && (data.includes('"pointcloud"') || data.includes('"matrix"'))) {
      return 'gzip';
    }
    
    // Default to gzip for good balance
    return 'gzip';
  }

  // Compression implementations
  private async compressGzip(data: string, level: number): Promise<Uint8Array> {
    // Use CompressionStream API if available
    if ('CompressionStream' in window) {
      const stream = new CompressionStream('gzip');
      const writer = stream.writable.getWriter();
      const reader = stream.readable.getReader();
      
      const encoder = new TextEncoder();
      const input = encoder.encode(data);
      
      await writer.write(input);
      await writer.close();
      
      const chunks: Uint8Array[] = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }
      
      // Combine chunks
      const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
      const result = new Uint8Array(totalLength);
      let offset = 0;
      
      for (const chunk of chunks) {
        result.set(chunk, offset);
        offset += chunk.length;
      }
      
      return result;
    }
    
    // Fallback to pako or other library
    throw new Error('CompressionStream not supported, install pako library for fallback');
  }

  private async decompressGzip(compressed: Uint8Array): Promise<string> {
    if ('DecompressionStream' in window) {
      const stream = new DecompressionStream('gzip');
      const writer = stream.writable.getWriter();
      const reader = stream.readable.getReader();
      
      await writer.write(compressed as BufferSource);
      await writer.close();
      
      const chunks: Uint8Array[] = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }
      
      // Combine chunks
      const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
      const result = new Uint8Array(totalLength);
      let offset = 0;
      
      for (const chunk of chunks) {
        result.set(chunk, offset);
        offset += chunk.length;
      }
      
      return new TextDecoder().decode(result);
    }
    
    throw new Error('DecompressionStream not supported, install pako library for fallback');
  }

  private async compressDeflate(data: string, level: number): Promise<Uint8Array> {
    // Similar to gzip but with deflate algorithm
    throw new Error('Deflate compression not yet implemented');
  }

  private async decompressDeflate(compressed: Uint8Array): Promise<string> {
    throw new Error('Deflate decompression not yet implemented');
  }

  private async compressLz4(data: string, level: number): Promise<Uint8Array> {
    // LZ4 compression (would need LZ4 library)
    throw new Error('LZ4 compression not yet implemented');
  }

  private async decompressLz4(compressed: Uint8Array): Promise<string> {
    throw new Error('LZ4 decompression not yet implemented');
  }
}

// Mathematical data optimizer implementation
class MathematicalDataOptimizerImpl implements MathematicalDataOptimizer {
  optimizePoints(points: number[][]): number[][] {
    // Remove duplicate points
    const uniquePoints = new Map<string, number[]>();
    
    for (const point of points) {
      const key = point.map(coord => coord.toFixed(6)).join(',');
      if (!uniquePoints.has(key)) {
        uniquePoints.set(key, point);
      }
    }
    
    // Sort by x, then y for better compression
    return Array.from(uniquePoints.values()).sort((a, b) => {
      if (Math.abs(a[0] - b[0]) < 1e-6) {
        return a[1] - b[1];
      }
      return a[0] - b[0];
    });
  }

  optimizeMatrices(matrices: number[][]): number[][] {
    // For sparse matrices, convert to sparse format
    const density = this.calculateMatrixDensity(matrices);
    
    if (density < 0.3) {
      return this.convertToSparseFormat(matrices);
    }
    
    return matrices;
  }

  optimizeGraphData(graph: any): any {
    // Optimize graph structure for compression
    const optimized: any = {};
    
    if (graph.nodes) {
      // Sort nodes by ID for better compression
      optimized.nodes = graph.nodes.sort((a: any, b: any) => a.id - b.id);
    }
    
    if (graph.edges) {
      // Sort edges by source, then target
      optimized.edges = graph.edges.sort((a: any, b: any) => {
        if (a.source === b.source) {
          return a.target - b.target;
        }
        return a.source - b.source;
      });
    }
    
    return optimized;
  }

  private calculateMatrixDensity(matrix: number[][]): number {
    let nonZeroCount = 0;
    let totalCount = 0;
    
    for (const row of matrix) {
      for (const val of row) {
        totalCount++;
        if (Math.abs(val) > 1e-10) {
          nonZeroCount++;
        }
      }
    }
    
    return nonZeroCount / totalCount;
  }

  optimizeVisualizationData(data: any): any {
    // Optimize visualization data for compression
    if (!data) return data;
    
    const optimized: any = { ...data };
    
    // Optimize common visualization data patterns
    if (data.positions && Array.isArray(data.positions)) {
      optimized.positions = this.optimizePoints(data.positions);
    }
    
    if (data.colors && Array.isArray(data.colors)) {
      // Remove duplicate colors and sort for better compression
      const uniqueColors = [...new Set(data.colors)];
      optimized.colors = uniqueColors.sort();
    }
    
    if (data.indices && Array.isArray(data.indices)) {
      // Sort indices for better compression
      optimized.indices = [...data.indices].sort((a, b) => a - b);
    }
    
    return optimized;
  }

  private convertToSparseFormat(matrix: number[][]): number[][] {
    const sparse: number[][] = [];
    
    for (let i = 0; i < matrix.length; i++) {
      for (let j = 0; j < matrix[i].length; j++) {
        if (Math.abs(matrix[i][j]) > 1e-10) {
          sparse.push([i, j, matrix[i][j]]);
        }
      }
    }
    
    return sparse;
  }
}

// Export singleton instance
export const dataCompressionEngine = new DataCompressionEngine();

