/**
 * Pattern Generator - Core Mathematical Algorithms
 * 
 * High-performance pattern generation algorithms optimized for the mathematical platform.
 * Implements Penrose tilings, Voronoi diagrams, hexagonal grids, and algebraic curves
 * with φ-based mathematical precision.
 */

import { 
  Point2D, 
  PenroseTile, 
  VoronoiCell, 
  HexagonTile, 
  CurveParameters,
  CurveType,
  ComplexityLevel,
  PatternBounds,
  BoundingBox
} from '../types/patterns';

// ==========================================
// Mathematical Constants
// ==========================================

export const PHI = (1 + Math.sqrt(5)) / 2; // Golden ratio
export const PHI_INVERSE = 1 / PHI;
export const TWO_PI = 2 * Math.PI;
export const SQRT_3 = Math.sqrt(3);

// ==========================================
// Penrose Tiling Generation
// ==========================================

export class PenroseTilingGenerator {
  private static readonly KITE_ANGLES = [36, 72, 72]; // degrees
  private static readonly DART_ANGLES = [36, 36, 108]; // degrees
  
  /**
   * Generates Penrose tiling using deflation method
   */
  static generateTiling(
    bounds: BoundingBox,
    generations: number = 5,
    complexity: ComplexityLevel = 'intermediate'
  ): PenroseTile[] {
    const maxGenerations = this.getMaxGenerations(complexity);
    const actualGenerations = Math.min(generations, maxGenerations);
    
    // Start with initial configuration - 10 kites in a circle
    let tiles = this.createInitialConfiguration(bounds);
    
    // Apply deflation rules
    for (let gen = 0; gen < actualGenerations; gen++) {
      tiles = this.deflateTiles(tiles, gen + 1);
    }
    
    // Filter tiles within bounds and optimize
    return this.optimizeTiles(tiles, bounds);
  }
  
  private static getMaxGenerations(complexity: ComplexityLevel): number {
    const generationLimits = {
      beginner: 3,
      intermediate: 5,
      advanced: 7,
      expert: 9,
      research: 12
    };
    return generationLimits[complexity];
  }
  
  private static createInitialConfiguration(bounds: BoundingBox): PenroseTile[] {
    const center: Point2D = [bounds.x + bounds.width / 2, bounds.y + bounds.height / 2];
    const radius = Math.min(bounds.width, bounds.height) / 4;
    const tiles: PenroseTile[] = [];
    
    // Create 10 kites arranged in a decagon
    for (let i = 0; i < 10; i++) {
      const angle = (i * 36) * Math.PI / 180; // 36 degrees each
      const vertices = this.createKiteVertices(center, radius, angle);
      
      tiles.push({
        type: 'kite',
        vertices,
        generation: 0,
        phi_angle: angle,
        id: `kite_0_${i}`
      });
    }
    
    return tiles;
  }
  
  private static createKiteVertices(center: Point2D, radius: number, angle: number): Point2D[] {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    
    // Kite proportions based on golden ratio
    const r1 = radius;
    const r2 = radius * PHI_INVERSE;
    
    return [
      [center[0] + r1 * cos, center[1] + r1 * sin],
      [center[0] + r2 * Math.cos(angle + Math.PI / 5), center[1] + r2 * Math.sin(angle + Math.PI / 5)],
      [center[0], center[1]],
      [center[0] + r2 * Math.cos(angle - Math.PI / 5), center[1] + r2 * Math.sin(angle - Math.PI / 5)]
    ];
  }
  
  private static deflateTiles(tiles: PenroseTile[], generation: number): PenroseTile[] {
    const newTiles: PenroseTile[] = [];
    
    for (const tile of tiles) {
      if (tile.type === 'kite') {
        newTiles.push(...this.deflateKite(tile, generation));
      } else {
        newTiles.push(...this.deflateDart(tile, generation));
      }
    }
    
    return newTiles;
  }
  
  private static deflateKite(kite: PenroseTile, generation: number): PenroseTile[] {
    // Penrose deflation rules for kite
    const newTiles: PenroseTile[] = [];
    const vertices = kite.vertices;
    
    // Split kite into smaller kite and dart using golden ratio
    const [v0, v1, v2, v3] = vertices;
    
    // Calculate split points using φ
    const split1 = this.interpolatePoint(v0, v1, PHI_INVERSE);
    const split2 = this.interpolatePoint(v0, v3, PHI_INVERSE);
    
    // Create new kite
    newTiles.push({
      type: 'kite',
      vertices: [split1, v1, v2, split2],
      generation,
      phi_angle: kite.phi_angle,
      id: `kite_${generation}_${kite.id}`
    });
    
    // Create new dart
    newTiles.push({
      type: 'dart',
      vertices: [v0, split1, split2],
      generation,
      phi_angle: kite.phi_angle + Math.PI / 5,
      id: `dart_${generation}_${kite.id}`
    });
    
    return newTiles;
  }
  
  private static deflateDart(dart: PenroseTile, generation: number): PenroseTile[] {
    // Penrose deflation rules for dart
    const newTiles: PenroseTile[] = [];
    const vertices = dart.vertices;
    
    // Split dart into smaller dart and kite
    const [v0, v1, v2] = vertices;
    
    // Calculate split point using φ
    const split = this.interpolatePoint(v1, v2, PHI_INVERSE);
    
    // Create new dart
    newTiles.push({
      type: 'dart',
      vertices: [v0, v1, split],
      generation,
      phi_angle: dart.phi_angle,
      id: `dart_${generation}_${dart.id}_1`
    });
    
    // Create new kite
    newTiles.push({
      type: 'kite',
      vertices: [v0, split, v2],
      generation,
      phi_angle: dart.phi_angle - Math.PI / 5,
      id: `kite_${generation}_${dart.id}_2`
    });
    
    return newTiles;
  }
  
  private static interpolatePoint(p1: Point2D, p2: Point2D, t: number): Point2D {
    return [
      p1[0] + (p2[0] - p1[0]) * t,
      p1[1] + (p2[1] - p1[1]) * t
    ];
  }
  
  private static optimizeTiles(tiles: PenroseTile[], bounds: BoundingBox): PenroseTile[] {
    // Filter tiles that intersect with bounds
    return tiles.filter(tile => this.tileIntersectsBounds(tile, bounds));
  }
  
  private static tileIntersectsBounds(tile: PenroseTile, bounds: BoundingBox): boolean {
    const tileBounds = this.calculateTileBounds(tile);
    
    return !(tileBounds.maxX < bounds.x || 
             tileBounds.minX > bounds.x + bounds.width ||
             tileBounds.maxY < bounds.y || 
             tileBounds.minY > bounds.y + bounds.height);
  }
  
  private static calculateTileBounds(tile: PenroseTile): PatternBounds {
    const xs = tile.vertices.map(v => v[0]);
    const ys = tile.vertices.map(v => v[1]);
    
    return {
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minY: Math.min(...ys),
      maxY: Math.max(...ys)
    };
  }
}

// ==========================================
// Voronoi Diagram Generation
// ==========================================

export class VoronoiGenerator {
  /**
   * Generates Voronoi diagram using Fortune's algorithm
   */
  static generateDiagram(
    bounds: BoundingBox,
    pointCount: number = 50,
    seedPattern: 'random' | 'fibonacci' | 'golden-spiral' | 'grid' = 'fibonacci',
    complexity: ComplexityLevel = 'intermediate'
  ): VoronoiCell[] {
    const adjustedPointCount = this.getAdjustedPointCount(pointCount, complexity);
    const sites = this.generateSites(bounds, adjustedPointCount, seedPattern);
    
    return this.computeVoronoiCells(sites, bounds);
  }
  
  private static getAdjustedPointCount(baseCount: number, complexity: ComplexityLevel): number {
    const multipliers = {
      beginner: 0.5,
      intermediate: 1.0,
      advanced: 1.5,
      expert: 2.0,
      research: 3.0
    };
    return Math.floor(baseCount * multipliers[complexity]);
  }
  
  private static generateSites(
    bounds: BoundingBox, 
    count: number, 
    pattern: 'random' | 'fibonacci' | 'golden-spiral' | 'grid'
  ): Point2D[] {
    switch (pattern) {
      case 'fibonacci':
        return this.generateFibonacciSites(bounds, count);
      case 'golden-spiral':
        return this.generateGoldenSpiralSites(bounds, count);
      case 'grid':
        return this.generateGridSites(bounds, count);
      default:
        return this.generateRandomSites(bounds, count);
    }
  }
  
  private static generateFibonacciSites(bounds: BoundingBox, count: number): Point2D[] {
    const sites: Point2D[] = [];
    const phi = PHI;
    
    for (let i = 0; i < count; i++) {
      const t = i / count;
      const angle = 2 * Math.PI * i / phi;
      const radius = Math.sqrt(t) * Math.min(bounds.width, bounds.height) / 2;
      
      const x = bounds.x + bounds.width / 2 + radius * Math.cos(angle);
      const y = bounds.y + bounds.height / 2 + radius * Math.sin(angle);
      
      sites.push([x, y]);
    }
    
    return sites;
  }
  
  private static generateGoldenSpiralSites(bounds: BoundingBox, count: number): Point2D[] {
    const sites: Point2D[] = [];
    const center: Point2D = [bounds.x + bounds.width / 2, bounds.y + bounds.height / 2];
    const maxRadius = Math.min(bounds.width, bounds.height) / 2;
    
    for (let i = 0; i < count; i++) {
      const t = i / count;
      const angle = t * 4 * Math.PI; // 2 full rotations
      const radius = t * maxRadius;
      
      // Golden spiral growth factor
      const spiralRadius = radius * Math.pow(PHI, t * 2);
      const finalRadius = Math.min(spiralRadius, maxRadius);
      
      const x = center[0] + finalRadius * Math.cos(angle);
      const y = center[1] + finalRadius * Math.sin(angle);
      
      sites.push([x, y]);
    }
    
    return sites;
  }
  
  private static generateGridSites(bounds: BoundingBox, count: number): Point2D[] {
    const sites: Point2D[] = [];
    const cols = Math.ceil(Math.sqrt(count * bounds.width / bounds.height));
    const rows = Math.ceil(count / cols);
    
    const cellWidth = bounds.width / cols;
    const cellHeight = bounds.height / rows;
    
    for (let row = 0; row < rows && sites.length < count; row++) {
      for (let col = 0; col < cols && sites.length < count; col++) {
        // Add small random offset to avoid perfect grid
        const offsetX = (Math.random() - 0.5) * cellWidth * 0.3;
        const offsetY = (Math.random() - 0.5) * cellHeight * 0.3;
        
        const x = bounds.x + (col + 0.5) * cellWidth + offsetX;
        const y = bounds.y + (row + 0.5) * cellHeight + offsetY;
        
        sites.push([x, y]);
      }
    }
    
    return sites;
  }
  
  private static generateRandomSites(bounds: BoundingBox, count: number): Point2D[] {
    const sites: Point2D[] = [];
    
    for (let i = 0; i < count; i++) {
      const x = bounds.x + Math.random() * bounds.width;
      const y = bounds.y + Math.random() * bounds.height;
      sites.push([x, y]);
    }
    
    return sites;
  }
  
  private static computeVoronoiCells(sites: Point2D[], bounds: BoundingBox): VoronoiCell[] {
    // Simplified Voronoi computation using distance-based approach
    // For production, consider using a robust library like d3-delaunay
    const cells: VoronoiCell[] = [];
    const resolution = 200; // Grid resolution for approximation
    
    for (let i = 0; i < sites.length; i++) {
      const site = sites[i];
      const vertices = this.approximateVoronoiCell(site, sites, bounds, resolution);
      
      if (vertices.length >= 3) {
        cells.push({
          site,
          vertices,
          neighbors: [], // Would be computed in full implementation
          area: this.calculatePolygonArea(vertices),
          centroid: this.calculateCentroid(vertices),
          id: `voronoi_${i}`
        });
      }
    }
    
    return cells;
  }
  
  private static approximateVoronoiCell(
    site: Point2D, 
    allSites: Point2D[], 
    bounds: BoundingBox, 
    resolution: number
  ): Point2D[] {
    // Simplified approach - in production use proper Voronoi algorithm
    const vertices: Point2D[] = [];
    const angles = [];
    
    // Generate points around the site in a circle
    for (let angle = 0; angle < TWO_PI; angle += TWO_PI / 32) {
      let maxDistance = Math.min(bounds.width, bounds.height);
      
      // Find intersection with nearest site
      for (const otherSite of allSites) {
        if (otherSite === site) continue;
        
        const distance = this.distanceToSite(site, otherSite, angle);
        maxDistance = Math.min(maxDistance, distance);
      }
      
      const x = site[0] + maxDistance * Math.cos(angle);
      const y = site[1] + maxDistance * Math.sin(angle);
      
      // Clamp to bounds
      const clampedX = Math.max(bounds.x, Math.min(bounds.x + bounds.width, x));
      const clampedY = Math.max(bounds.y, Math.min(bounds.y + bounds.height, y));
      
      vertices.push([clampedX, clampedY]);
    }
    
    return vertices;
  }
  
  private static distanceToSite(site1: Point2D, site2: Point2D, angle: number): number {
    // Calculate distance from site1 in given direction to perpendicular bisector with site2
    const dx = site2[0] - site1[0];
    const dy = site2[1] - site1[1];
    const midX = site1[0] + dx / 2;
    const midY = site1[1] + dy / 2;
    
    // Simplified calculation
    const siteDistance = Math.sqrt(dx * dx + dy * dy);
    return siteDistance / 2;
  }
  
  private static calculatePolygonArea(vertices: Point2D[]): number {
    let area = 0;
    for (let i = 0; i < vertices.length; i++) {
      const j = (i + 1) % vertices.length;
      area += vertices[i][0] * vertices[j][1];
      area -= vertices[j][0] * vertices[i][1];
    }
    return Math.abs(area) / 2;
  }
  
  private static calculateCentroid(vertices: Point2D[]): Point2D {
    let x = 0, y = 0;
    for (const vertex of vertices) {
      x += vertex[0];
      y += vertex[1];
    }
    return [x / vertices.length, y / vertices.length];
  }
}

// ==========================================
// Hexagonal Grid Generation
// ==========================================

export class HexGridGenerator {
  static generateGrid(
    bounds: BoundingBox,
    hexSize: number = 30,
    pattern: 'regular' | 'circuit' | 'honeycomb' = 'regular',
    complexity: ComplexityLevel = 'intermediate'
  ): HexagonTile[] {
    const adjustedSize = this.getAdjustedHexSize(hexSize, complexity);
    const hexagons: HexagonTile[] = [];
    
    const hexWidth = adjustedSize * SQRT_3;
    const hexHeight = adjustedSize * 2;
    const vertSpacing = hexHeight * 0.75;
    
    const cols = Math.ceil(bounds.width / hexWidth) + 2;
    const rows = Math.ceil(bounds.height / vertSpacing) + 2;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const hexCenter = this.calculateHexCenter(col, row, hexWidth, vertSpacing, bounds);
        
        if (this.isHexInBounds(hexCenter, adjustedSize, bounds)) {
          const vertices = this.calculateHexVertices(hexCenter, adjustedSize);
          const layer = this.calculateHexLayer(col, row, cols, rows);
          
          hexagons.push({
            center: hexCenter,
            vertices,
            neighbors: [], // Would be computed for full implementation
            layer,
            active: pattern === 'circuit' ? this.isCircuitActive(col, row) : true,
            id: `hex_${row}_${col}`
          });
        }
      }
    }
    
    return hexagons;
  }
  
  private static getAdjustedHexSize(baseSize: number, complexity: ComplexityLevel): number {
    const sizeMultipliers = {
      beginner: 1.5,
      intermediate: 1.0,
      advanced: 0.8,
      expert: 0.6,
      research: 0.5
    };
    return baseSize * sizeMultipliers[complexity];
  }
  
  private static calculateHexCenter(
    col: number, 
    row: number, 
    hexWidth: number, 
    vertSpacing: number, 
    bounds: BoundingBox
  ): Point2D {
    const offsetX = (row % 2) * hexWidth / 2; // Offset every other row
    const x = bounds.x + col * hexWidth + offsetX;
    const y = bounds.y + row * vertSpacing;
    
    return [x, y];
  }
  
  private static isHexInBounds(center: Point2D, size: number, bounds: BoundingBox): boolean {
    const margin = size * 1.2; // Include partially visible hexagons
    return center[0] > bounds.x - margin && 
           center[0] < bounds.x + bounds.width + margin &&
           center[1] > bounds.y - margin && 
           center[1] < bounds.y + bounds.height + margin;
  }
  
  private static calculateHexVertices(center: Point2D, size: number): Point2D[] {
    const vertices: Point2D[] = [];
    
    for (let i = 0; i < 6; i++) {
      const angle = (i * 60) * Math.PI / 180;
      const x = center[0] + size * Math.cos(angle);
      const y = center[1] + size * Math.sin(angle);
      vertices.push([x, y]);
    }
    
    return vertices;
  }
  
  private static calculateHexLayer(col: number, row: number, cols: number, rows: number): number {
    const centerCol = Math.floor(cols / 2);
    const centerRow = Math.floor(rows / 2);
    
    return Math.max(Math.abs(col - centerCol), Math.abs(row - centerRow));
  }
  
  private static isCircuitActive(col: number, row: number): boolean {
    // Create circuit-like patterns
    return (col + row) % 3 === 0 || (col % 2 === 0 && row % 3 === 1);
  }
}

// ==========================================
// Algebraic Curve Generation
// ==========================================

export class AlgebraicCurveGenerator {
  /**
   * Generates points for various algebraic curves
   */
  static generateCurve(
    curveType: CurveType,
    parameters: CurveParameters,
    bounds: BoundingBox,
    resolution: number = 1000
  ): Point2D[] {
    const adjustedResolution = Math.min(resolution, 2000); // Performance limit
    
    switch (curveType) {
      case 'lemniscate':
        return this.generateLemniscate(parameters, bounds, adjustedResolution);
      case 'cassini-oval':
        return this.generateCassiniOval(parameters, bounds, adjustedResolution);
      case 'cardioid':
        return this.generateCardioid(parameters, bounds, adjustedResolution);
      case 'rose':
        return this.generateRose(parameters, bounds, adjustedResolution);
      case 'spiral':
        return this.generateSpiral(parameters, bounds, adjustedResolution);
      case 'parametric':
        return this.generateParametric(parameters, bounds, adjustedResolution);
      default:
        return this.generateLemniscate(parameters, bounds, adjustedResolution);
    }
  }
  
  private static generateLemniscate(
    params: CurveParameters,
    bounds: BoundingBox,
    resolution: number
  ): Point2D[] {
    const a = params.a || 100; // Scale parameter
    const points: Point2D[] = [];
    const centerX = bounds.x + bounds.width / 2;
    const centerY = bounds.y + bounds.height / 2;
    
    for (let i = 0; i <= resolution; i++) {
      const t = (i / resolution) * TWO_PI;
      const denominator = 1 + Math.sin(t) ** 2;
      
      if (denominator > 0) {
        const r = a * Math.sqrt(2 * Math.cos(2 * t) / denominator);
        const x = centerX + r * Math.cos(t);
        const y = centerY + r * Math.sin(t);
        
        if (!isNaN(x) && !isNaN(y)) {
          points.push([x, y]);
        }
      }
    }
    
    return points;
  }
  
  private static generateCassiniOval(
    params: CurveParameters,
    bounds: BoundingBox,
    resolution: number
  ): Point2D[] {
    const a = params.a || 80;  // Focus distance
    const b = params.b || 100; // Shape parameter
    const points: Point2D[] = [];
    const centerX = bounds.x + bounds.width / 2;
    const centerY = bounds.y + bounds.height / 2;
    
    for (let i = 0; i <= resolution; i++) {
      const t = (i / resolution) * TWO_PI;
      const cos2t = Math.cos(2 * t);
      const discriminant = b ** 4 - a ** 4 * Math.sin(2 * t) ** 2;
      
      if (discriminant >= 0) {
        const r = Math.sqrt(a ** 2 * cos2t + Math.sqrt(discriminant));
        const x = centerX + r * Math.cos(t);
        const y = centerY + r * Math.sin(t);
        
        if (!isNaN(x) && !isNaN(y)) {
          points.push([x, y]);
        }
      }
    }
    
    return points;
  }
  
  private static generateCardioid(
    params: CurveParameters,
    bounds: BoundingBox,
    resolution: number
  ): Point2D[] {
    const a = params.a || 80; // Scale parameter
    const points: Point2D[] = [];
    const centerX = bounds.x + bounds.width / 2;
    const centerY = bounds.y + bounds.height / 2;
    
    for (let i = 0; i <= resolution; i++) {
      const t = (i / resolution) * TWO_PI;
      const r = a * (1 - Math.cos(t));
      const x = centerX + r * Math.cos(t);
      const y = centerY + r * Math.sin(t);
      
      points.push([x, y]);
    }
    
    return points;
  }
  
  private static generateRose(
    params: CurveParameters,
    bounds: BoundingBox,
    resolution: number
  ): Point2D[] {
    const a = params.a || 80;  // Scale parameter
    const n = params.n || 5;   // Number of petals
    const points: Point2D[] = [];
    const centerX = bounds.x + bounds.width / 2;
    const centerY = bounds.y + bounds.height / 2;
    
    for (let i = 0; i <= resolution; i++) {
      const t = (i / resolution) * TWO_PI;
      const r = a * Math.cos(n * t);
      const x = centerX + r * Math.cos(t);
      const y = centerY + r * Math.sin(t);
      
      points.push([x, y]);
    }
    
    return points;
  }
  
  private static generateSpiral(
    params: CurveParameters,
    bounds: BoundingBox,
    resolution: number
  ): Point2D[] {
    const a = params.a || 5;   // Spiral tightness
    const b = params.b || 10;  // Growth rate
    const points: Point2D[] = [];
    const centerX = bounds.x + bounds.width / 2;
    const centerY = bounds.y + bounds.height / 2;
    const maxRadius = Math.min(bounds.width, bounds.height) / 2;
    
    for (let i = 0; i <= resolution; i++) {
      const t = (i / resolution) * 6 * Math.PI; // 3 full rotations
      const r = Math.min(a + b * t, maxRadius);
      const x = centerX + r * Math.cos(t);
      const y = centerY + r * Math.sin(t);
      
      points.push([x, y]);
    }
    
    return points;
  }
  
  private static generateParametric(
    params: CurveParameters,
    bounds: BoundingBox,
    resolution: number
  ): Point2D[] {
    if (!params.custom) {
      return this.generateLemniscate(params, bounds, resolution);
    }
    
    const points: Point2D[] = [];
    const tMin = params.t_min || 0;
    const tMax = params.t_max || TWO_PI;
    const centerX = bounds.x + bounds.width / 2;
    const centerY = bounds.y + bounds.height / 2;
    
    for (let i = 0; i <= resolution; i++) {
      const t = tMin + (i / resolution) * (tMax - tMin);
      
      try {
        const x = centerX + params.custom.x(t, params);
        const y = centerY + params.custom.y(t, params);
        
        if (!isNaN(x) && !isNaN(y)) {
          points.push([x, y]);
        }
      } catch (error) {
        console.warn('Error evaluating parametric curve at t =', t, error);
      }
    }
    
    return points;
  }
}

// ==========================================
// Utility Functions
// ==========================================

export class PatternUtils {
  /**
   * Calculates optimal pattern density based on viewport size and performance level
   */
  static calculateOptimalDensity(
    bounds: BoundingBox,
    baseCount: number,
    performance: 'battery' | 'balanced' | 'performance' = 'balanced'
  ): number {
    const area = bounds.width * bounds.height;
    const baseArea = 800 * 600; // Reference area
    const areaRatio = area / baseArea;
    
    const performanceMultipliers = {
      battery: 0.5,
      balanced: 1.0,
      performance: 2.0
    };
    
    return Math.floor(baseCount * Math.sqrt(areaRatio) * performanceMultipliers[performance]);
  }
  
  /**
   * Converts screen coordinates to pattern coordinates
   */
  static screenToPatternCoords(
    screenPoint: Point2D,
    bounds: BoundingBox,
    patternBounds: PatternBounds
  ): Point2D {
    const scaleX = (patternBounds.maxX - patternBounds.minX) / bounds.width;
    const scaleY = (patternBounds.maxY - patternBounds.minY) / bounds.height;
    
    return [
      patternBounds.minX + (screenPoint[0] - bounds.x) * scaleX,
      patternBounds.minY + (screenPoint[1] - bounds.y) * scaleY
    ];
  }
  
  /**
   * Interpolates between two colors using mathematical easing
   */
  static interpolateColor(
    color1: string,
    color2: string,
    t: number,
    easing: 'linear' | 'golden' | 'fibonacci' = 'golden'
  ): string {
    const easedT = this.applyEasing(t, easing);
    
    // Convert hex colors to RGB for interpolation
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);
    
    if (!rgb1 || !rgb2) return color1;
    
    const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * easedT);
    const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * easedT);
    const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * easedT);
    
    return `rgb(${r}, ${g}, ${b})`;
  }
  
  private static applyEasing(t: number, easing: 'linear' | 'golden' | 'fibonacci'): number {
    switch (easing) {
      case 'golden':
        return t * PHI - Math.floor(t * PHI);
      case 'fibonacci':
        return Math.sin(t * Math.PI / 2);
      default:
        return t;
    }
  }
  
  private static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }
}