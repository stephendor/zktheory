'use client';

import React, { useState, useEffect, useCallback } from 'react';
import PointCloudCanvas from './PointCloudCanvas';
import PersistenceDiagram from './PersistenceDiagram';
import PersistenceBarcode from './PersistenceBarcode';
import MapperVisualization from './MapperVisualization';
import PersistenceLandscape3D from './PersistenceLandscape3D';
import { initializeWasm, createTDAEngine, createMockTDAEngine, isWasmReady } from './wasmLoader';
import { initializeWasmV2, createTDAEngineV2, createEnhancedMockTDAEngine, isWasmReadyV2 } from './wasmLoaderV2';

interface Point {
  x: number;
  y: number;
  id: number;
  density?: number;
  color?: string;
  label?: string;
}

interface PersistenceInterval {
  birth: number;
  death: number;
  dimension: number;
}

interface PersistenceData {
  pairs: PersistenceInterval[];
  filtrationValue: number;
}

interface MapperNode {
  id: string;
  label: string;
  x: number;
  y: number;
  radius: number;
  size: number;
  color: string;
  points: Point[];
  fx?: number | null;
  fy?: number | null;
}

interface MapperLink {
  source: string;
  target: string;
  weight: number;
  distance: number;
}

interface MapperData {
  nodes: MapperNode[];
  links: MapperLink[];
}

const TDAExplorer: React.FC = () => {
  const [points, setPoints] = useState<Point[]>([]);
  const [filtrationValue, setFiltrationValue] = useState<number>(0.3);
  const [persistenceData, setPersistenceData] = useState<PersistenceData | null>(null);
  const [mapperData, setMapperData] = useState<MapperData | null>(null);
  const [isComputing, setIsComputing] = useState<boolean>(false);
  const [wasmLoaded, setWasmLoaded] = useState<boolean>(false);
  const [tdaEngine, setTdaEngine] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'persistence' | 'mapper' | '3d-landscape'>('persistence');
  const [expandedSections, setExpandedSections] = useState<{
    basic: boolean;
    advanced: boolean;
    data: boolean;
    presets: boolean;
    performance: boolean;
  }>({
    basic: false,
    advanced: false,
    data: false,
    presets: false,
    performance: false
  });
  const [pointCount, setPointCount] = useState<number>(25);
  const [noiseLevel, setNoiseLevel] = useState<number>(0.05);
  const [densityRadius, setDensityRadius] = useState<number>(0.2);
  const [performanceSettings, setPerformanceSettings] = useState<{
    enableLazyLoading: boolean;
    maxPointsForRealTime: number;
    enablePerformanceWarnings: boolean;
    targetFrameRate: number;
  }>({
    enableLazyLoading: true,
    maxPointsForRealTime: 100,
    enablePerformanceWarnings: true,
    targetFrameRate: 60
  });
  const [performanceMetrics, setPerformanceMetrics] = useState<{
    computationTime: number;
    renderTime: number;
    memoryUsage: number;
    totalMemory: number;
    frameRate: number;
    lastFrameTime: number;
  }>({
    computationTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    totalMemory: 0,
    frameRate: 0,
    lastFrameTime: 0
  });

  // State variables for 3D Landscape controls
  const [showWireframeState, setShowWireframeState] = useState<boolean>(true);
  const [showSolidState, setShowSolidState] = useState<boolean>(true);
  const [colorSchemeState, setColorSchemeState] = useState<'viridis' | 'plasma' | 'inferno' | 'magma' | 'cividis' | 'turbo' | 'rainbow' | 'spectral' | 'coolwarm' | 'rdylbu'>('viridis');
  const [opacityState, setOpacityState] = useState<number>(0.8);
  
  // Additional state variables for 3D Landscape
  const [dimensionFilter, setDimensionFilter] = useState<number[]>([0, 1, 2]);
  const [showDensityOverlay, setShowDensityOverlay] = useState<boolean>(false);
  const [enableLOD, setEnableLOD] = useState<boolean>(true);
  const [enableFrustumCulling, setEnableFrustumCulling] = useState<boolean>(true);
  const [multiLandscapeMode, setMultiLandscapeMode] = useState<boolean>(false);
  const [landscapeOverlays, setLandscapeOverlays] = useState<Array<{
    id: string;
    name: string;
    data: any;
    visible: boolean;
    opacity: number;
    color: string;
  }>>([]);
  const [lodLevel, setLodLevel] = useState<number>(1);
  const [wireframeOpacity, setWireframeOpacity] = useState<number>(0.3);

  // Section toggle helper
  const toggleSection = useCallback((section: 'basic' | 'advanced' | 'data' | 'presets' | 'performance') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  // Enhanced performance monitoring with frame rate and computation tracking
  const updatePerformanceMetrics = useCallback(() => {
    if ('performance' in window) {
      const memory = (performance as any).memory;
      const now = performance.now();
      
      // Calculate frame rate
      if (performanceMetrics.lastFrameTime) {
        const frameTime = now - performanceMetrics.lastFrameTime;
        const frameRate = frameTime > 0 ? Math.round(1000 / frameTime) : 0;
        setPerformanceMetrics(prev => ({
          ...prev,
          frameRate,
          lastFrameTime: now
        }));
      } else {
        setPerformanceMetrics(prev => ({
          ...prev,
          lastFrameTime: now
        }));
      }
      
      // Update memory usage
      if (memory) {
        const usedMemory = Math.round(memory.usedJSHeapSize / 1024 / 1024);
        const totalMemory = Math.round(memory.totalJSHeapSize / 1024 / 1024);
        setPerformanceMetrics(prev => ({
          ...prev,
          memoryUsage: usedMemory,
          totalMemory
        }));
      }
    }
  }, [performanceMetrics.lastFrameTime]);

  // Initialize WASM on component mount
  useEffect(() => {
    const loadWasm = async () => {
      // Toggle between V1 (current working) and V2 (full integration attempt)
      const useV2Integration = false; // Set to true to test full integration
      
      if (useV2Integration) {
    
        try {
          const success = await initializeWasmV2();
          if (success) {
            const engine = createTDAEngineV2();
            if (engine) {
              setTdaEngine(engine);
              setWasmLoaded(true);
      
              return;
            }
          }
          
          // Fallback to enhanced mock
  
          const enhancedMockEngine = createEnhancedMockTDAEngine();
          setTdaEngine(enhancedMockEngine);
          setWasmLoaded(false);
        } catch (error) {
          console.error('V2 initialization error:', error);
          const enhancedMockEngine = createEnhancedMockTDAEngine();
          setTdaEngine(enhancedMockEngine);
          setWasmLoaded(false);
        }
      } else {
        // Use the current working V1 system

        try {
          const success = await initializeWasm();
          if (success) {
            const engine = createTDAEngine();
            setTdaEngine(engine);
            setWasmLoaded(true);

          } else {
            // Use original mock engine
            const mockEngine = createMockTDAEngine();
            setTdaEngine(mockEngine);
            setWasmLoaded(false);

          }
        } catch (error) {
          console.error('V1 initialization error:', error);
          const mockEngine = createMockTDAEngine();
          setTdaEngine(mockEngine);
          setWasmLoaded(false);
  
        }
      }
    };
    
    loadWasm();
  }, []);

  // Update performance metrics periodically
  useEffect(() => {
    const interval = setInterval(updatePerformanceMetrics, 1000);
    return () => clearInterval(interval);
  }, [updatePerformanceMetrics]);

  // Initialize with some points
  useEffect(() => {
    if (points.length === 0) {
      generateSampleData('random');
    }
  }, []);

  // Enhanced file upload with better error handling and validation
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File too large. Please use files under 10MB.');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      
      try {
        if (file.name.endsWith('.csv')) {
          // Enhanced CSV parsing with better error handling
          const lines = content.split('\n').filter(line => line.trim());
          if (lines.length < 2) {
            throw new Error('CSV must have at least a header row and one data row');
          }
          
          const headers = lines[0].split(',').map(h => h.trim());
          const newPoints: Point[] = [];
          
          for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            if (values.length >= 2) {
              const x = parseFloat(values[0]);
              const y = parseFloat(values[1]);
              if (!isNaN(x) && !isNaN(y)) {
                newPoints.push({
                  x, y, id: Date.now() + i
                });
              }
            }
          }
          
          if (newPoints.length > 0) {
            const enhancedPoints = computePointDensity(newPoints);
            setPoints(enhancedPoints);
            // Update point count to match loaded data
            setPointCount(newPoints.length);
          } else {
            throw new Error('No valid points found in CSV');
          }
        } else if (file.name.endsWith('.json')) {
          // Enhanced JSON parsing with better structure support
          const data = JSON.parse(content);
          let newPoints: Point[] = [];
          
          if (Array.isArray(data)) {
            newPoints = data.map((point, index) => ({
              x: parseFloat(point.x) || 0,
              y: parseFloat(point.y) || 0,
              id: point.id || Date.now() + index
            }));
          } else if (data.points && Array.isArray(data.points)) {
            newPoints = data.points.map((point: any, index: number) => ({
              x: parseFloat(point.x) || 0,
              y: parseFloat(point.y) || 0,
              id: point.id || Date.now() + index
            }));
          } else if (data.coordinates && Array.isArray(data.coordinates)) {
            // Support for alternative JSON structure
            newPoints = data.coordinates.map((coord: any, index: number) => ({
              x: parseFloat(coord[0]) || 0,
              y: parseFloat(coord[1]) || 0,
              id: Date.now() + index
            }));
          }
          
          if (newPoints.length > 0) {
            const enhancedPoints = computePointDensity(newPoints);
            setPoints(enhancedPoints);
            setPointCount(newPoints.length);
          } else {
            throw new Error('No valid points found in JSON');
          }
        } else {
          throw new Error('Unsupported file format. Please use .csv or .json files.');
        }
        
        // Show success message
  
      } catch (error) {
        console.error('Error parsing file:', error);
        alert(`Error parsing file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };
    
    reader.onerror = () => {
      alert('Error reading file. Please try again.');
    };
    
    reader.readAsText(file);
    // Reset file input
    event.target.value = '';
  };

  // Enhanced export functionality with multiple formats
  const exportPoints = (format: 'json' | 'csv' = 'json') => {
    if (points.length === 0) return;
    
    if (format === 'json') {
      const data = {
        metadata: {
          generated: new Date().toISOString(),
          pointCount: points.length,
          parameters: {
            pointCount,
            noiseLevel,
            densityRadius,
            filtrationValue
          },
          engine: wasmLoaded ? 'WASM' : 'Mock'
        },
        points: points.map(p => ({ 
          x: p.x, 
          y: p.y, 
          id: p.id, 
          density: p.density,
          color: p.color,
          label: p.label
        }))
      };
      
      const jsonBlob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(jsonBlob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `tda-points-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (format === 'csv') {
      const csvContent = [
        'x,y,id,density,color,label',
        ...points.map(p => `${p.x},${p.y},${p.id},${p.density || 0},${p.color || ''},${p.label || ''}`)
      ].join('\n');
      
      const csvBlob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(csvBlob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `tda-points-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  // Export persistence results
  const exportPersistenceResults = () => {
    if (!persistenceData) {
      alert('No persistence data to export. Please compute persistence first.');
      return;
    }
    
    const data = {
      metadata: {
        generated: new Date().toISOString(),
        pointCount: points.length,
        filtrationValue,
        engine: wasmLoaded ? 'WASM' : 'Mock'
      },
      persistence: {
        pairs: persistenceData.pairs,
        filtrationValue: persistenceData.filtrationValue
      },
      statistics: {
        totalIntervals: persistenceData.pairs.length,
        h0Intervals: persistenceData.pairs.filter(p => p.dimension === 0).length,
        h1Intervals: persistenceData.pairs.filter(p => p.dimension === 1).length,
        h2Intervals: persistenceData.pairs.filter(p => p.dimension === 2).length,
        maxPersistence: Math.max(...persistenceData.pairs.map(p => p.death - p.birth)),
        avgPersistence: persistenceData.pairs.reduce((sum, p) => sum + (p.death - p.birth), 0) / persistenceData.pairs.length
      }
    };
    
    const jsonBlob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(jsonBlob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `tda-persistence-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Enhanced screenshot export with better quality
  const exportScreenshot = () => {
    if (points.length === 0) return;
    
    // Create a high-quality canvas for export
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set high-resolution canvas
    const scale = 2; // 2x for high DPI
    canvas.width = 1200 * scale;
    canvas.height = 800 * scale;
    
    // Scale context for high DPI
    ctx.scale(scale, scale);
    
    // Draw background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 1200, 800);
    
    // Draw title
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('TDA Explorer Visualization', 600, 50);
    
    // Draw metadata
    ctx.fillStyle = '#6b7280';
    ctx.font = '18px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Generated: ${new Date().toLocaleString()}`, 50, 100);
    ctx.fillText(`Points: ${points.length}`, 50, 130);
    ctx.fillText(`Filtration Value: ${filtrationValue.toFixed(3)}`, 50, 160);
    ctx.fillText(`Engine: ${wasmLoaded ? 'WASM' : 'Mock'}`, 50, 190);
    
    // Draw persistence info if available
    if (persistenceData) {
      ctx.fillText(`Persistence Intervals: ${persistenceData.pairs.length}`, 50, 220);
      const h0Count = persistenceData.pairs.filter(p => p.dimension === 0).length;
      const h1Count = persistenceData.pairs.filter(p => p.dimension === 1).length;
      ctx.fillText(`H0: ${h0Count}, H1: ${h1Count}`, 50, 250);
    }
    
    // Draw point cloud representation
    ctx.fillStyle = '#3b82f6';
    points.forEach(point => {
      const x = 50 + (point.x * 400);
      const y = 300 + (point.y * 200);
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.fill();
    });
    
    // Create download link
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `tda-visualization-${new Date().toISOString().split('T')[0]}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Compute point density for color coding
  const computePointDensity = (points: Point[]): Point[] => {
    return points.map(point => {
      let neighborCount = 0;
      
      // Count neighbors within a certain radius
      points.forEach(otherPoint => {
        if (otherPoint.id !== point.id) {
          const distance = Math.sqrt(
            Math.pow(point.x - otherPoint.x, 2) + 
            Math.pow(point.y - otherPoint.y, 2)
          );
          if (distance < densityRadius) { // Dynamic neighbor radius
            neighborCount++;
          }
        }
      });
      
      // Calculate density as percentage of total points (excluding self)
      const totalPossibleNeighbors = points.length - 1;
      const normalizedDensity = totalPossibleNeighbors > 0 ? neighborCount / totalPossibleNeighbors : 0;
      
      // Assign color based on density
      const color = normalizedDensity > 0.5 ? '#ef4444' : 
                   normalizedDensity > 0.3 ? '#f97316' : 
                   normalizedDensity > 0.1 ? '#eab308' : '#22c55e';
      
      return {
        ...point,
        density: normalizedDensity,
        color: color,
        label: `P${point.id} (density: ${normalizedDensity.toFixed(3)})`
      };
    });
  };

  // Enhanced data generation with lazy loading support
  const generateSampleData = (type: 'circle' | 'clusters' | 'random' | 'torus' | 'gaussian' | 'spiral' | 'grid' | 'annulus') => {
    let newPoints: Point[] = [];
    
    // Check if we should use lazy loading for large datasets
    const shouldUseLazyLoading = performanceSettings.enableLazyLoading && pointCount > performanceSettings.maxPointsForRealTime;
    
    if (shouldUseLazyLoading) {
      // Start with a subset of points for immediate display
      const initialPoints = Math.min(pointCount, performanceSettings.maxPointsForRealTime);
      generatePointsSubset(type, initialPoints, 0);
      
      // Schedule the rest of the points to be generated progressively
      setTimeout(() => {
        generatePointsSubset(type, pointCount - initialPoints, initialPoints);
      }, 100);
      
      return;
    }
    
    // Generate all points at once for smaller datasets
    generatePointsSubset(type, pointCount, 0);
  };

  // Helper function to generate points in subsets
  const generatePointsSubset = (type: 'circle' | 'clusters' | 'random' | 'torus' | 'gaussian' | 'spiral' | 'grid' | 'annulus', count: number, startIndex: number) => {
    let newPoints: Point[] = [];
    
    switch (type) {
      case 'circle':
        for (let i = 0; i < pointCount; i++) {
          const angle = (2 * Math.PI * i) / pointCount;
          const radius = 0.3;
          const noise = (Math.random() - 0.5) * noiseLevel;
          newPoints.push({
            x: 0.5 + (radius + noise) * Math.cos(angle),
            y: 0.5 + (radius + noise) * Math.sin(angle),
            id: Date.now() + i
          });
        }
        break;
      case 'clusters':
        const clusters = [
          { centerX: 0.3, centerY: 0.3 },
          { centerX: 0.7, centerY: 0.7 }
        ];
        const pointsPerCluster = Math.ceil(pointCount / clusters.length);
        clusters.forEach((cluster, clusterIndex) => {
          for (let i = 0; i < pointsPerCluster; i++) {
            newPoints.push({
              x: cluster.centerX + (Math.random() - 0.5) * noiseLevel * 3,
              y: cluster.centerY + (Math.random() - 0.5) * noiseLevel * 3,
              id: Date.now() + clusterIndex * 1000 + i
            });
          }
        });
        break;
      case 'random':
        for (let i = 0; i < pointCount; i++) {
          newPoints.push({
            x: Math.random(),
            y: Math.random(),
            id: Date.now() + i
          });
        }
        break;
      case 'torus':
        // Create a torus-like structure (two concentric circles)
        const pointsPerRing = Math.ceil(pointCount / 2);
        for (let i = 0; i < pointsPerRing; i++) {
          const angle = (2 * Math.PI * i) / pointsPerRing;
          const radius1 = 0.2;
          const radius2 = 0.4;
          const noise = (Math.random() - 0.5) * noiseLevel;
          
          // Inner circle
          newPoints.push({
            x: 0.5 + (radius1 + noise) * Math.cos(angle),
            y: 0.5 + (radius1 + noise) * Math.sin(angle),
            id: Date.now() + i
          });
          
          // Outer circle
          newPoints.push({
            x: 0.5 + (radius2 + noise) * Math.cos(angle),
            y: 0.5 + (radius2 + noise) * Math.sin(angle),
            id: Date.now() + i + 1000
          });
        }
        break;
      case 'gaussian':
        // Create points with Gaussian distribution
        for (let i = 0; i < pointCount; i++) {
          const u1 = Math.random();
          const u2 = Math.random();
          // Box-Muller transform for normal distribution
          const z1 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
          const z2 = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2);
          
          newPoints.push({
            x: 0.5 + noiseLevel * 4 * z1,
            y: 0.5 + noiseLevel * 4 * z2,
            id: Date.now() + i
          });
        }
        break;
      case 'spiral':
        // Create a spiral pattern
        for (let i = 0; i < pointCount; i++) {
          const t = (i / pointCount) * 4 * Math.PI;
          const radius = 0.1 + (t / (4 * Math.PI)) * 0.3;
          const noise = (Math.random() - 0.5) * noiseLevel;
          
          newPoints.push({
            x: 0.5 + (radius + noise) * Math.cos(t),
            y: 0.5 + (radius + noise) * Math.sin(t),
            id: Date.now() + i
          });
        }
        break;
      case 'grid':
        // Create a regular grid with some noise
        const gridSize = Math.ceil(Math.sqrt(pointCount));
        for (let i = 0; i < gridSize; i++) {
          for (let j = 0; j < gridSize; j++) {
            if (newPoints.length < pointCount) {
              const noise = (Math.random() - 0.5) * noiseLevel;
              newPoints.push({
                x: 0.1 + (i / (gridSize - 1)) * 0.8 + noise,
                y: 0.1 + (j / (gridSize - 1)) * 0.8 + noise,
                id: Date.now() + i * gridSize + j
              });
            }
          }
        }
        break;
      case 'annulus':
        // Create an annulus (ring) structure
        for (let i = 0; i < pointCount; i++) {
          const angle = (2 * Math.PI * i) / pointCount;
          const radius = 0.25 + Math.random() * 0.15; // Random radius between 0.25 and 0.4
          const noise = (Math.random() - 0.5) * noiseLevel;
          
          newPoints.push({
            x: 0.5 + (radius + noise) * Math.cos(angle),
            y: 0.5 + (radius + noise) * Math.sin(angle),
            id: Date.now() + i
          });
        }
        break;
    }
    
    // Compute density and color coding for the new points
    const enhancedPoints = computePointDensity(newPoints);
    
    if (startIndex === 0) {
      // First batch - replace all points
      setPoints(enhancedPoints);
    } else {
      // Subsequent batches - append to existing points
      setPoints(prevPoints => {
        const existingPoints = prevPoints.slice(0, startIndex);
        return [...existingPoints, ...enhancedPoints];
      });
    }
  };

  // Enhanced persistence computation with performance tracking
  const computePersistence = useCallback(() => {
    if (points.length < 3 || !tdaEngine) {
      setPersistenceData(null);
      return;
    }

    const startTime = performance.now();
    setIsComputing(true);
    
    try {
      // Set points in the TDA engine
      const pointsArray = points.map(p => [p.x, p.y]);
      tdaEngine.set_points(pointsArray);
      
      // Compute Vietoris-Rips complex
      const complexStartTime = performance.now();
      tdaEngine.compute_vietoris_rips(filtrationValue);
      const complexTime = performance.now() - complexStartTime;
      
      // Compute persistence
      const persistenceStartTime = performance.now();
      const persistenceIntervals = tdaEngine.compute_persistence();
      const persistenceTime = performance.now() - persistenceStartTime;
      
      const totalTime = performance.now() - startTime;
      
      // Update performance metrics
      setPerformanceMetrics(prev => ({
        ...prev,
        computationTime: totalTime,
        renderTime: prev.renderTime
      }));
      
      const computedData: PersistenceData = {
        pairs: persistenceIntervals.map((interval: any) => ({
          birth: interval.birth,
          death: interval.death,
          dimension: interval.dimension
        })),
        filtrationValue: filtrationValue
      };
      
      const endTime = performance.now();
      setPerformanceMetrics(prev => ({
        ...prev,
        computationTime: endTime - startTime
      }));
      
      setPersistenceData(computedData);
      setIsComputing(false);
  
    } catch (error) {
      console.error('Persistence computation failed:', error);
      setIsComputing(false);
    }
  }, [points, filtrationValue, tdaEngine, wasmLoaded]);

  // Mapper computation - deterministic based on point positions
  const computeMapper = useCallback(() => {
    if (points.length < 5) {
      setMapperData(null);
      return;
    }

    // Ensure points have density data
    const enhancedPoints = points.some(p => p.density !== undefined) ? points : computePointDensity(points);
    
    const numClusters = Math.min(8, Math.max(3, Math.floor(enhancedPoints.length / 3)));
    const nodes: MapperNode[] = [];
    const links: MapperLink[] = [];

    // Sort points for deterministic behavior
    const sortedPoints = [...enhancedPoints].sort((a, b) => a.x - b.x || a.y - b.y);

    // Create nodes (clusters) using deterministic spacing
    for (let i = 0; i < numClusters; i++) {
      const pointIndex = Math.floor((i * sortedPoints.length) / numClusters);
      const centerPoint = sortedPoints[pointIndex];
      const clusterSize = 3 + (i % 4); // Deterministic cluster sizes: 3,4,5,6,3,4...
      
      // Use k-means-like approach: find points closest to this center
      const distances = sortedPoints.map(p => ({
        point: p,
        distance: Math.sqrt(Math.pow(p.x - centerPoint.x, 2) + Math.pow(p.y - centerPoint.y, 2))
      }));
      distances.sort((a, b) => a.distance - b.distance);
      const clusterPoints = distances.slice(0, Math.min(clusterSize, sortedPoints.length)).map(d => d.point);

      nodes.push({
        id: `cluster_${i}`,
        label: `C${i}`,
        x: centerPoint.x * 400 + 200, // Center in visualization area
        y: centerPoint.y * 300 + 150,
        radius: 8 + clusterSize * 2,
        size: clusterPoints.length,
        color: `hsl(${(i * 360) / numClusters}, 70%, 60%)`,
        points: clusterPoints
      });
    }

    // Create links between clusters based on shared boundary points
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dist = Math.sqrt(
          Math.pow(nodes[i].x - nodes[j].x, 2) + 
          Math.pow(nodes[i].y - nodes[j].y, 2)
        );
        
        // Deterministic linking based on distance threshold
        if (dist < 200) {
          const weight = Math.max(0.1, 1 - dist / 200);
          links.push({
            source: nodes[i].id,
            target: nodes[j].id,
            weight: weight,
            distance: dist
          });
        }
      }
    }

    setMapperData({ nodes, links });
  }, [points]);

  // Handle point changes
  const handlePointsChange = (newPoints: Point[]) => {
    setPoints(newPoints);
  };

  // Handle filtration value change
  const handleFiltrationChange = (value: number) => {
    setFiltrationValue(value);
  };

  // Auto-compute when points or filtration changes
  useEffect(() => {
    if (points.length > 0) {
      computePersistence();
    }
  }, [computePersistence]);

  // Regenerate points when parameters change
  useEffect(() => {
    if (points.length > 0) {
      // Regenerate points with new parameters
      const currentType = 'random'; // Default type, could be made configurable
      generateSampleData(currentType);
    }
  }, [pointCount, noiseLevel, densityRadius]);

  // Parameter presets for common TDA scenarios
  const applyParameterPreset = (preset: 'clustering' | 'topology' | 'density' | 'sparse' | 'dense') => {
    switch (preset) {
      case 'clustering':
        setPointCount(50);
        setNoiseLevel(0.08);
        setDensityRadius(0.15);
        setFiltrationValue(0.4);
        break;
      case 'topology':
        setPointCount(75);
        setNoiseLevel(0.03);
        setDensityRadius(0.12);
        setFiltrationValue(0.25);
        break;
      case 'density':
        setPointCount(100);
        setNoiseLevel(0.05);
        setDensityRadius(0.08);
        setFiltrationValue(0.3);
        break;
      case 'sparse':
        setPointCount(30);
        setNoiseLevel(0.15);
        setDensityRadius(0.25);
        setFiltrationValue(0.5);
        break;
      case 'dense':
        setPointCount(150);
        setNoiseLevel(0.02);
        setDensityRadius(0.06);
        setFiltrationValue(0.2);
        break;
    }
    
    // Regenerate data with new parameters
    generateSampleData('random');
  };

  return (
    <div className="tda-explorer">
      <header className="tda-header">
        <h1>Topological Data Analysis Explorer</h1>
        <p>Interactive exploration of persistent homology and topological features</p>
      </header>
      
      <div className="tda-content">
        {/* Left Control Panel - Analysis & Performance Controls */}
        <div className="tda-controls">
          <h3>Analysis & Performance</h3>
          
          {/* Filtration Control - Always Visible */}
          <div className="control-section">
            <h4>Filtration</h4>
            <div className="filtration-control">
              <label htmlFor="filtration">
                Filtration Value: {filtrationValue.toFixed(3)}
              </label>
              <input
                id="filtration"
                type="range"
                min="0.1"
                max="1.0"
                step="0.01"
                value={filtrationValue}
                onChange={(e) => handleFiltrationChange(parseFloat(e.target.value))}
                className="filtration-slider"
              />
            </div>
          </div>

          {/* Data Import/Export - Collapsible */}
          <div className="control-section collapsible">
            <button 
              className="section-header"
              onClick={() => toggleSection('data')}
            >
              <span>Data Import/Export</span>
              <span className={`expand-icon ${expandedSections.data ? 'expanded' : ''}`}>
                ▼
              </span>
            </button>
            {expandedSections.data && (
              <div className="section-content">
                <div className="import-section">
                  <input
                    type="file"
                    accept=".csv,.json"
                    onChange={(e) => handleFileUpload(e)}
                    className="file-input"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="btn btn-primary file-upload-label">
                    Upload CSV/JSON
                  </label>
                </div>
                
                <div className="export-section">
                  <div className="button-grid">
                    <button 
                      onClick={() => exportPoints('json')}
                      className="btn btn-secondary"
                      disabled={points.length === 0}
                    >
                      Export Points (JSON)
                    </button>
                    <button 
                      onClick={() => exportPoints('csv')}
                      className="btn btn-secondary"
                      disabled={points.length === 0}
                    >
                      Export Points (CSV)
                    </button>
                    <button 
                      onClick={() => exportScreenshot()}
                      className="btn btn-success"
                      disabled={points.length === 0}
                    >
                      Export Screenshot (High DPI)
                    </button>
                    <button 
                      onClick={exportPersistenceResults}
                      className="btn btn-success"
                      disabled={!persistenceData}
                    >
                      Export Persistence Results
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Performance Settings - Collapsible */}
          <div className="control-section collapsible">
            <button 
              className="section-header"
              onClick={() => toggleSection('performance')}
            >
              <span>Performance Settings</span>
              <span className={`expand-icon ${expandedSections.performance ? 'expanded' : ''}`}>
                ▼
              </span>
            </button>
            {expandedSections.performance && (
              <div className="section-content">
                <div className="performance-setting">
                  <label className="setting-label">
                    <input
                      type="checkbox"
                      checked={performanceSettings.enableLazyLoading}
                      onChange={(e) => setPerformanceSettings(prev => ({
                        ...prev,
                        enableLazyLoading: e.target.checked
                      }))}
                    />
                    Enable Lazy Loading
                  </label>
                  <span className="setting-description">
                    Load large datasets progressively for better performance
                  </span>
                </div>
                
                <div className="performance-setting">
                  <label className="setting-label">
                    Max Points for Real-time:
                    <input
                      type="range"
                      min="50"
                      max="200"
                      step="25"
                      value={performanceSettings.maxPointsForRealTime}
                      onChange={(e) => setPerformanceSettings(prev => ({
                        ...prev,
                        maxPointsForRealTime: parseInt(e.target.value)
                      }))}
                      className="setting-slider"
                    />
                    <span className="setting-value">{performanceSettings.maxPointsForRealTime}</span>
                  </label>
                </div>
                
                <div className="performance-setting">
                  <label className="setting-label">
                    <input
                      type="checkbox"
                      checked={performanceSettings.enablePerformanceWarnings}
                      onChange={(e) => setPerformanceSettings(prev => ({
                        ...prev,
                        enablePerformanceWarnings: e.target.checked
                      }))}
                    />
                    Performance Warnings
                  </label>
                  <span className="setting-description">
                    Show warnings for performance issues
                  </span>
                </div>
                
                <div className="performance-setting">
                  <label className="setting-label">
                    Target Frame Rate:
                    <select
                      value={performanceSettings.targetFrameRate}
                      onChange={(e) => setPerformanceSettings(prev => ({
                        ...prev,
                        targetFrameRate: parseInt(e.target.value)
                      }))}
                      className="setting-select"
                    >
                      <option value={30}>30 FPS (Performance)</option>
                      <option value={60}>60 FPS (Balanced)</option>
                      <option value={120}>120 FPS (Quality)</option>
                    </select>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Performance Monitoring Section */}
          <div className="control-section compact-info">
            <h4>Status & Performance</h4>
            <div className="compact-metrics">
              <div className="metric-row">
                <span className="metric-label">Points:</span>
                <span className="metric-value">{points.length}</span>
              </div>
              <div className="metric-row">
                <span className="metric-label">Status:</span>
                <span className="metric-value">{isComputing ? 'Computing...' : 'Ready'}</span>
              </div>
              <div className="metric-row">
                <span className="metric-label">Engine:</span>
                <span className="metric-value">{wasmLoaded ? 'WASM' : 'Mock'}</span>
              </div>
              <div className="metric-row">
                <span className="metric-label">Memory:</span>
                <span className="metric-value">{performanceMetrics.memoryUsage}MB</span>
              </div>
              <div className="metric-row">
                <span className="metric-label">Frame Rate:</span>
                <span className={`metric-value ${performanceMetrics.frameRate < 30 ? 'warning' : ''}`}>
                  {performanceMetrics.frameRate} FPS
                </span>
              </div>
              {performanceMetrics.computationTime > 0 && (
                <div className="metric-row">
                  <span className="metric-label">Compute:</span>
                  <span className="metric-value">{performanceMetrics.computationTime.toFixed(0)}ms</span>
                </div>
              )}
            </div>
            
            {/* Performance Warnings */}
            {performanceSettings.enablePerformanceWarnings && performanceMetrics.frameRate < 30 && performanceMetrics.frameRate > 0 && (
              <div className="performance-warning">
                <span className="warning-icon">⚠️</span>
                <span className="warning-text">Low frame rate detected</span>
              </div>
            )}
            {performanceSettings.enablePerformanceWarnings && performanceMetrics.memoryUsage > 100 && (
              <div className="performance-warning">
                <span className="warning-icon">⚠️</span>
                <span className="warning-text">High memory usage</span>
              </div>
            )}
            
            {/* Performance Optimization Hints */}
            {performanceSettings.enableLazyLoading && points.length > performanceSettings.maxPointsForRealTime && (
              <div className="performance-hint">
                <strong>Lazy Loading Active:</strong> Large dataset ({points.length} points) loaded progressively for optimal performance.
              </div>
            )}
            {performanceMetrics.computationTime > 100 && (
              <div className="performance-hint">
                <strong>Performance Tip:</strong> Consider reducing point count or using parameter presets for faster computation.
              </div>
            )}
          </div>
          
          {/* Compact Density Legend */}
          <div className="control-section compact-legend">
            <h4>Density Legend</h4>
            <div className="compact-legend-items">
              <div className="legend-row">
                <span className="legend-color" style={{ backgroundColor: '#ef4444' }}></span>
                <span>High</span>
              </div>
              <div className="legend-row">
                <span className="legend-color" style={{ backgroundColor: '#f97316' }}></span>
                <span>Medium</span>
              </div>
              <div className="legend-row">
                <span className="legend-color" style={{ backgroundColor: '#eab308' }}></span>
                <span>Low</span>
              </div>
              <div className="legend-row">
                <span className="legend-color" style={{ backgroundColor: '#22c55e' }}></span>
                <span>Very Low</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="visualization-container">
          <div className="tab-controls">
            <button 
              className={`tab-button ${activeTab === 'persistence' ? 'active' : ''}`}
              onClick={() => setActiveTab('persistence')}
            >
              Persistence Analysis
            </button>
            <button 
              className={`tab-button ${activeTab === 'mapper' ? 'active' : ''}`}
              onClick={() => setActiveTab('mapper')}
            >
              Mapper Network
            </button>
            <button 
              className={`tab-button ${activeTab === '3d-landscape' ? 'active' : ''}`}
              onClick={() => setActiveTab('3d-landscape')}
            >
              3D Landscape
            </button>
          </div>

          {activeTab === 'persistence' && (
            <>
              <div className="point-cloud-section">
                <h3>Point Cloud Visualization</h3>
                <PointCloudCanvas
                  points={points}
                  onPointsChange={handlePointsChange}
                  filtrationValue={filtrationValue}
                />
              </div>
              
              <div className="persistence-analysis-grid">
                <div className="viz-panel">
                  <h3>Persistence Diagram</h3>
                  <PersistenceDiagram
                    persistenceData={persistenceData}
                    filtrationValue={filtrationValue}
                  />
                </div>
                
                <div className="viz-panel">
                  <h3>Persistence Barcode</h3>
                  <PersistenceBarcode
                    persistenceData={persistenceData}
                    filtrationValue={filtrationValue}
                  />
                </div>
              </div>
            </>
          )}

          {activeTab === 'mapper' && (
            <>
              <div className="mapper-main-section">
                <h3>Mapper Network Visualization</h3>
                <MapperVisualization
                  mapperData={mapperData}
                  width={800}
                  height={600}
                />
              </div>
              
              <div className="mapper-control-section">
                <div className="mapper-input-panel">
                  <h3>Point Cloud Input</h3>
                  <PointCloudCanvas
                    points={points}
                    onPointsChange={handlePointsChange}
                    filtrationValue={filtrationValue}
                    width={300}
                    height={300}
                  />
                  <button 
                    onClick={computeMapper}
                    disabled={points.length < 5}
                    className="btn btn-primary compute-button"
                  >
                    Compute Mapper Network
                  </button>
                  {mapperData && (
                    <div className="mapper-stats">
                      <p><strong>Nodes:</strong> {mapperData.nodes?.length || 0}</p>
                      <p><strong>Edges:</strong> {mapperData.links?.length || 0}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === '3d-landscape' && (
            <>
              <div className="landscape-main-section">
                <h3>3D Persistence Landscape Visualization</h3>
                <div className="landscape-description">
                  <p>
                    Explore your persistence data in 3D space. The landscape height represents the density of persistence intervals, 
                    while colors indicate the persistence values. Use the controls to adjust visualization parameters and camera angles.
                  </p>
                </div>
                <PersistenceLandscape3D
                  persistenceData={persistenceData}
                  points={points} // Pass the actual points with density data
                  width={800}
                  height={600}
                  showWireframe={showWireframeState}
                  showSolid={showSolidState}
                  colorScheme={colorSchemeState}
                  opacity={opacityState}
                />
              </div>
              
              <div className="landscape-info-section">
                <div className="info-panel">
                  <h4>3D Landscape Features</h4>
                  <ul>
                    <li><strong>Height Mapping:</strong> Landscape elevation represents persistence density</li>
                    <li><strong>Color Schemes:</strong> Multiple scientific color palettes (Viridis, Plasma, Inferno, Magma)</li>
                    <li><strong>Camera Controls:</strong> Orbit, zoom, and pan with preset views</li>
                    <li><strong>Rendering Options:</strong> Toggle between wireframe, solid, and combined modes</li>
                    <li><strong>Performance:</strong> Optimized WebGL rendering for smooth 60 FPS</li>
                  </ul>
                </div>
                
                {persistenceData && (
                  <div className="landscape-stats">
                    <h4>Landscape Statistics</h4>
                    <p><strong>Total Intervals:</strong> {persistenceData.pairs.length}</p>
                    <p><strong>Max Persistence:</strong> {Math.max(...persistenceData.pairs.map(p => p.death - p.birth)).toFixed(3)}</p>
                    <p><strong>Avg Persistence:</strong> {(persistenceData.pairs.reduce((sum, p) => sum + (p.death - p.birth), 0) / persistenceData.pairs.length).toFixed(3)}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        
        {/* Right Control Panel - Point Cloud Generation */}
        <div className="tda-right-controls">
          <h3>Point Cloud Generation</h3>
          
          {/* Basic Patterns - Collapsible */}
          <div className="control-section collapsible">
            <button 
              className="section-header"
              onClick={() => toggleSection('basic')}
            >
              <span>Basic Patterns</span>
              <span className={`expand-icon ${expandedSections.basic ? 'expanded' : ''}`}>
                ▼
              </span>
            </button>
            {expandedSections.basic && (
              <div className="section-content">
                <div className="button-grid">
                  <button onClick={() => generateSampleData('circle')} className="btn btn-primary">
                    Circle
                  </button>
                  <button onClick={() => generateSampleData('clusters')} className="btn btn-primary">
                    Clusters
                  </button>
                  <button onClick={() => generateSampleData('random')} className="btn btn-primary">
                    Random
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Advanced Patterns - Collapsible */}
          <div className="control-section collapsible">
            <button 
              className="section-header"
              onClick={() => toggleSection('advanced')}
            >
              <span>Advanced Patterns</span>
              <span className={`expand-icon ${expandedSections.advanced ? 'expanded' : ''}`}>
                ▼
              </span>
            </button>
            {expandedSections.advanced && (
              <div className="section-content">
                <div className="button-grid">
                  <button onClick={() => generateSampleData('torus')} className="btn btn-primary">
                    Torus
                  </button>
                  <button onClick={() => generateSampleData('gaussian')} className="btn btn-primary">
                    Gaussian
                  </button>
                  <button onClick={() => generateSampleData('spiral')} className="btn btn-primary">
                    Spiral
                  </button>
                  <button onClick={() => generateSampleData('grid')} className="btn btn-primary">
                    Grid
                  </button>
                  <button onClick={() => generateSampleData('annulus')} className="btn btn-primary">
                    Annulus
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Action Buttons - Always Visible */}
          <div className="control-section">
            <h4>Actions</h4>
            <div className="button-grid">
              <button onClick={() => setPoints([])} className="btn btn-secondary">
                Clear
              </button>
              <button 
                onClick={() => points.length > 0 && setPoints(computePointDensity(points))} 
                className="btn btn-success"
                disabled={points.length === 0}
              >
                Refresh Density
              </button>
            </div>
          </div>
          
          {/* Parameters - Always Visible */}
          <div className="control-section">
            <h4>Generation Parameters</h4>
            
            <div className="parameter-group">
              <label htmlFor="pointCount">
                Point Count: {pointCount}
              </label>
              <input
                id="pointCount"
                type="range"
                min="10"
                max="100"
                step="5"
                value={pointCount}
                onChange={(e) => setPointCount(parseInt(e.target.value))}
                className="parameter-slider"
              />
            </div>
            
            <div className="parameter-group">
              <label htmlFor="noiseLevel">
                Noise Level: {noiseLevel.toFixed(3)}
              </label>
              <input
                id="noiseLevel"
                type="range"
                min="0.01"
                max="0.2"
                step="0.01"
                value={noiseLevel}
                onChange={(e) => setNoiseLevel(parseFloat(e.target.value))}
                className="parameter-slider"
              />
            </div>
            
            <div className="parameter-group">
              <label htmlFor="densityRadius">
                Density Radius: {densityRadius.toFixed(3)}
              </label>
              <input
                id="densityRadius"
                type="range"
                min="0.05"
                max="0.3"
                step="0.01"
                value={densityRadius}
                onChange={(e) => setDensityRadius(parseFloat(e.target.value))}
                className="parameter-slider"
              />
            </div>
          </div>
          
          {/* Parameter Presets - Collapsible */}
          <div className="control-section collapsible">
            <button 
              className="section-header"
              onClick={() => toggleSection('presets')}
            >
              <span>Parameter Presets</span>
              <span className={`expand-icon ${expandedSections.presets ? 'expanded' : ''}`}>
                ▼
              </span>
            </button>
            {expandedSections.presets && (
              <div className="section-content">
                <div className="preset-grid">
                  <button 
                    onClick={() => applyParameterPreset('clustering')}
                    className="btn btn-outline preset-btn"
                    title="Optimized for cluster detection"
                  >
                    Clustering
                  </button>
                  <button 
                    onClick={() => applyParameterPreset('topology')}
                    className="btn btn-outline preset-btn"
                    title="Optimized for topological features"
                  >
                    Topology
                  </button>
                  <button 
                    onClick={() => applyParameterPreset('density')}
                    className="btn btn-outline preset-btn"
                    title="Optimized for density analysis"
                  >
                    Density
                  </button>
                  <button 
                    onClick={() => applyParameterPreset('sparse')}
                    className="btn btn-outline preset-btn"
                    title="Optimized for sparse data"
                  >
                    Sparse
                  </button>
                  <button 
                    onClick={() => applyParameterPreset('dense')}
                    className="btn btn-outline preset-btn"
                    title="Optimized for dense data"
                  >
                    Dense
                  </button>
                </div>
                <div className="preset-info">
                  <p className="preset-description">
                    Click any preset to automatically configure optimal parameters for different TDA scenarios.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TDAExplorer;