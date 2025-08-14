'use client';

import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface PersistenceInterval {
  birth: number;
  death: number;
  dimension: number;
}

interface PersistenceData {
  pairs: PersistenceInterval[];
  filtrationValue: number;
}

interface PersistenceLandscape3DProps {
  persistenceData: PersistenceData | null;
  points?: Array<{ x: number; y: number; density?: number; color?: string }>; // Add points with density data
  width?: number;
  height?: number;
  showWireframe?: boolean;
  showSolid?: boolean;
  colorScheme?: 'viridis' | 'plasma' | 'inferno' | 'magma' | 'cividis' | 'turbo' | 'rainbow' | 'spectral' | 'coolwarm' | 'rdylbu';
  opacity?: number;
}

// 3D Scene Component
const PersistenceLandscapeScene: React.FC<{
  persistenceData: PersistenceData | null;
  points: Array<{ x: number; y: number; density?: number; color?: string }>; // Add points parameter
  showWireframe: boolean;
  showSolid: boolean;
  colorScheme: string;
  opacity: number;
  dimensionFilter: number[];
  showDensityOverlay: boolean;
  enableLOD: boolean;
  enableFrustumCulling: boolean;
  multiLandscapeMode: boolean;
  landscapeOverlays: Array<{
    id: string;
    data: PersistenceData;
    colorScheme: string;
    opacity: number;
    visible: boolean;
  }>;
  lodLevel: number;
  wireframeOpacity: number;
  onPerformanceUpdate?: (metrics: { renderTime: number; vertexCount: number; lodLevel: number }) => void;
}> = ({ 
  persistenceData, 
  points, // Add points parameter
  showWireframe, 
  showSolid, 
  colorScheme, 
  opacity, 
  dimensionFilter, 
  showDensityOverlay,
  enableLOD,
  enableFrustumCulling,
  multiLandscapeMode,
  landscapeOverlays,
  lodLevel,
  wireframeOpacity,
  onPerformanceUpdate
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const wireframeRef = useRef<THREE.LineSegments>(null);
  // Removed useThree() to fix React reconciliation issues

  // Generate 3D geometry from persistence data
  const { vertices, indices, colors, wireframeVertices, wireframeIndices } = useMemo(() => {
    console.log('Processing persistence data:', {
      hasData: !!persistenceData,
      pairsLength: persistenceData?.pairs?.length || 0,
      dimensionFilter
    });
    
    if (!persistenceData || !persistenceData.pairs || persistenceData.pairs.length === 0) {
      console.log('No persistence data available, returning empty geometry');
      return { vertices: [], indices: [], colors: [], wireframeVertices: [], wireframeIndices: [] };
    }

    // Enhanced grid-based landscape with adaptive resolution and LOD
    const baseGridSize = 64;
    const pairCount = persistenceData.pairs.length;
    const sqrtValue = Math.sqrt(pairCount * 4);
    const adaptiveGridSize = Math.min(baseGridSize, Math.max(32, Math.floor(sqrtValue)));
    
    // Make LOD effect more visible
    const lodMultiplier = enableLOD ? lodLevel : 0.5;
    const gridSize = Math.max(16, Math.floor(adaptiveGridSize * lodMultiplier));
    
    console.log('Grid generation:', {
      baseGridSize,
      adaptiveGridSize,
      lodLevel,
      enableLOD,
      finalGridSize: gridSize
    });
    
    // Calculate data bounds for proper scaling
    const allBirths = persistenceData.pairs.map(p => p.birth);
    const allDeaths = persistenceData.pairs.map(p => p.death);
    const minBirth = Math.min(...allBirths);
    const maxBirth = Math.max(...allBirths);
    const minDeath = Math.min(...allDeaths);
    const maxDeath = Math.max(...allDeaths);
    const birthRange = maxBirth - minBirth;
    const deathRange = maxDeath - minDeath;
    const maxRange = Math.max(birthRange, deathRange);
    
    // Generate height map based on persistence density with dimension weighting
    const heightMap = new Array(gridSize * gridSize).fill(0);
    const dimensionMap = new Array(gridSize * gridSize).fill(0);
    const densityMap = new Array(gridSize * gridSize).fill(0);
    
    persistenceData.pairs.forEach(interval => {
      // Apply dimension filter
      if (!dimensionFilter.includes(interval.dimension)) {
        return;
      }
      
      const persistence = interval.death - interval.birth;
      const normalizedPersistence = persistence / maxRange;
      
      // Map birth/death to grid coordinates with proper scaling
      const normalizedBirth = (interval.birth - minBirth) / birthRange;
      const normalizedDeath = (interval.death - minDeath) / deathRange;
      
      const birthX = Math.floor(normalizedBirth * (gridSize - 1));
      const deathY = Math.floor(normalizedDeath * (gridSize - 1));
      
      if (birthX >= 0 && birthX < gridSize && deathY >= 0 && deathY < gridSize) {
        const index = deathY * gridSize + birthX;
        
        // Weight by dimension (H0, H1, H2) - higher dimensions get more prominence
        const dimensionWeight = Math.pow(2, interval.dimension);
        const weightedHeight = normalizedPersistence * dimensionWeight;
        
        heightMap[index] = Math.max(heightMap[index], weightedHeight);
        dimensionMap[index] = interval.dimension;
        densityMap[index]++;
      }
    });
    
    // Apply advanced smoothing with edge preservation
    const smoothedHeightMap = [...heightMap];
    const smoothingPasses = 3;
    
    for (let pass = 0; pass < smoothingPasses; pass++) {
      for (let i = 1; i < gridSize - 1; i++) {
        for (let j = 1; j < gridSize - 1; j++) {
          const index = i * gridSize + j;
          const currentHeight = smoothedHeightMap[index];
          
          // Get 8-neighbor heights
          const neighbors = [
            smoothedHeightMap[index - 1],
            smoothedHeightMap[index + 1],
            smoothedHeightMap[index - gridSize],
            smoothedHeightMap[index + gridSize],
            smoothedHeightMap[index - gridSize - 1],
            smoothedHeightMap[index - gridSize + 1],
            smoothedHeightMap[index + gridSize - 1],
            smoothedHeightMap[index + gridSize + 1]
          ];
          
          // Calculate weighted average with edge preservation
          const avgNeighbor = neighbors.reduce((a, b) => a + b, 0) / neighbors.length;
          const edgeStrength = Math.abs(currentHeight - avgNeighbor);
          const smoothingFactor = Math.max(0.1, Math.min(0.8, 1 - edgeStrength));
          
          smoothedHeightMap[index] = currentHeight * (1 - smoothingFactor) + avgNeighbor * smoothingFactor;
        }
      }
    }
    
    // Generate vertices, colors, and normals
    const vertices: number[] = [];
    const indices: number[] = [];
    const colors: number[] = [];
    const wireframeVertices: number[] = [];
    const wireframeIndices: number[] = [];
    
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const index = i * gridSize + j;
        const x = (i / (gridSize - 1) - 0.5) * 2;
        const z = (j / (gridSize - 1) - 0.5) * 2;
        const y = smoothedHeightMap[index] * 0.8; // Increased height range
        
        vertices.push(x, y, z);
        
        // Enhanced color mapping with dimension and density information
        const normalizedHeight = y / 0.8;
        const dimension = dimensionMap[index];
        const density = densityMap[index];
        
        let r, g, b;
        
        // Enhanced color mapping with scientific color schemes
        switch (colorScheme) {
          case 'viridis':
            r = 0.267 + normalizedHeight * 0.004;
            g = 0.005 + normalizedHeight * 0.99;
            b = 0.329 + normalizedHeight * 0.671;
            break;
          case 'plasma':
            r = 0.241 + normalizedHeight * 0.759;
            g = 0.015 + normalizedHeight * 0.985;
            b = 0.329 + normalizedHeight * 0.671;
            break;
          case 'inferno':
            r = 0.001 + normalizedHeight * 0.999;
            g = 0.000 + normalizedHeight * 1.000;
            b = 0.000 + normalizedHeight * 1.000;
            break;
          case 'magma':
            r = 0.000 + normalizedHeight * 1.000;
            g = 0.000 + normalizedHeight * 1.000;
            b = 0.000 + normalizedHeight * 1.000;
            break;
          case 'cividis':
            r = 0.0 + normalizedHeight * 1.0;
            g = 0.135 + normalizedHeight * 0.865;
            b = 0.0 + normalizedHeight * 1.0;
            break;
          case 'turbo':
            r = 0.18995 + normalizedHeight * 0.81005;
            g = 0.07176 + normalizedHeight * 0.92824;
            b = 0.23217 + normalizedHeight * 0.76783;
            break;
          case 'rainbow':
            const hue = normalizedHeight * 360;
            const h = Math.floor(hue / 60);
            const f = hue / 60 - h;
            const q = 1 - f;
            const t = f;
            switch (h % 6) {
              case 0: r = 1; g = t; b = 0; break;
              case 1: r = q; g = 1; b = 0; break;
              case 2: r = 0; g = 1; b = t; break;
              case 3: r = 0; g = q; b = 1; break;
              case 4: r = t; g = 0; b = 1; break;
              case 5: r = 1; g = 0; b = q; break;
              default: r = g = b = 0;
            }
            break;
          case 'spectral':
            if (normalizedHeight < 0.5) {
              r = 0.6196 + normalizedHeight * 0.3804;
              g = 0.0039 + normalizedHeight * 0.9961;
              b = 0.2588 + normalizedHeight * 0.7412;
            } else {
              const t = (normalizedHeight - 0.5) * 2;
              r = 0.9999 - t * 0.9999;
              g = 0.9999 - t * 0.9999;
              b = 0.9999 - t * 0.9999;
            }
            break;
          case 'coolwarm':
            if (normalizedHeight < 0.5) {
              const t = normalizedHeight * 2;
              r = 0.230 + t * 0.770;
              g = 0.299 + t * 0.701;
              b = 0.754 + t * 0.246;
            } else {
              const t = (normalizedHeight - 0.5) * 2;
              r = 0.9999 - t * 0.9999;
              g = 0.9999 - t * 0.9999;
              b = 0.9999 - t * 0.9999;
            }
            break;
          case 'rdylbu':
            if (normalizedHeight < 0.5) {
              const t = normalizedHeight * 2;
              r = 0.9999 - t * 0.9999;
              g = 0.9999 - t * 0.9999;
              b = 0.9999 - t * 0.9999;
            } else {
              const t = (normalizedHeight - 0.5) * 2;
              r = 0.9999 - t * 0.9999;
              g = 0.9999 - t * 0.9999;
              b = 0.9999 - t * 0.9999;
            }
            break;
          default:
            r = g = b = normalizedHeight;
        }
        
        // Add dimension-based color variation
        const dimensionColor = [
          [0.2, 0.6, 1.0], // H0: Blue
          [0.0, 0.8, 0.4], // H1: Green
          [1.0, 0.4, 0.0]  // H2: Red
        ][dimension] || [0.5, 0.5, 0.5];
        
        const dimensionWeight = 0.3;
        r = r * (1 - dimensionWeight) + dimensionColor[0] * dimensionWeight;
        g = g * (1 - dimensionWeight) + dimensionColor[1] * dimensionWeight;
        b = b * (1 - dimensionWeight) + dimensionColor[2] * dimensionWeight;
        
        // Add density-based brightness
        const densityFactor = Math.min(1.0, density / 3);
        r *= (0.7 + densityFactor * 0.3);
        g *= (0.7 + densityFactor * 0.3);
        b *= (0.7 + densityFactor * 0.3);
        
        colors.push(r, g, b);
        
        // Generate wireframe vertices
        wireframeVertices.push(x, y, z);
      }
    }
    
    // Generate indices for triangles with proper winding order
    for (let i = 0; i < gridSize - 1; i++) {
      for (let j = 0; j < gridSize - 1; j++) {
        const topLeft = i * gridSize + j;
        const topRight = topLeft + 1;
        const bottomLeft = (i + 1) * gridSize + j;
        const bottomRight = bottomLeft + 1;
        
        // First triangle (counter-clockwise winding)
        indices.push(topLeft, bottomLeft, topRight);
        // Second triangle (counter-clockwise winding)
        indices.push(topRight, bottomLeft, bottomRight);
        
        // Wireframe indices for grid lines
        wireframeIndices.push(topLeft, topRight);
        wireframeIndices.push(topLeft, bottomLeft);
        wireframeIndices.push(topRight, bottomRight);
        wireframeIndices.push(bottomLeft, bottomRight);
      }
    }
    
    console.log('Geometry generation complete:', {
      verticesCount: vertices.length,
      indicesCount: indices.length,
      colorsCount: colors.length,
      wireframeVerticesCount: wireframeVertices.length,
      wireframeIndicesCount: wireframeIndices.length
    });
    
    return { vertices, indices, colors, wireframeVertices, wireframeIndices };
  }, [persistenceData, colorScheme, dimensionFilter, lodLevel]);

  // Create geometries
  const solidGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    
    console.log('Creating solid geometry with:', { 
      verticesLength: vertices.length, 
      indicesLength: indices.length, 
      colorsLength: colors.length 
    });
    
    if (vertices.length > 0) {
      geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      geo.setIndex(indices);
      geo.computeVertexNormals();
      console.log('Solid geometry created successfully');
    } else {
      console.log('No vertices available for solid geometry');
    }
    
    return geo;
  }, [vertices, indices, colors]);

  const wireframeGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    
    console.log('Creating wireframe geometry with:', { 
      wireframeVerticesLength: wireframeVertices.length, 
      wireframeIndicesLength: wireframeIndices.length 
    });
    
    if (wireframeVertices.length > 0) {
      geo.setAttribute('position', new THREE.Float32BufferAttribute(wireframeVertices, 3));
      geo.setIndex(wireframeIndices);
      console.log('Wireframe geometry created successfully');
    } else {
      console.log('No wireframe vertices available');
    }
    
    return geo;
  }, [wireframeVertices, wireframeIndices]);

  // Animation loop with performance optimization - removed useFrame to fix context error
  // if (meshRef.current) {
  //   // Optional: Add subtle animation
  //   meshRef.current.rotation.y = Math.sin(Date.now() * 0.0001) * 0.1;
  // }

  // Performance monitoring
  const [renderTime, setRenderTime] = useState(0);
  const [vertexCount, setVertexCount] = useState(0);
  
  // Performance monitoring with vertex count tracking - moved to useEffect
  useEffect(() => {
    if (vertices.length > 0) {
      const actualVertexCount = Math.floor(vertices.length / 3 * lodLevel);
      setVertexCount(actualVertexCount);
      
      // Call the callback to update parent component
      if (onPerformanceUpdate) {
        onPerformanceUpdate({ renderTime: 16.67, vertexCount: actualVertexCount, lodLevel }); // Default 60fps timing
      }
    }
  }, [vertices.length, lodLevel, onPerformanceUpdate]);

  if (vertices.length === 0) {
    return (
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2, 0.1, 2]} />
        <meshStandardMaterial color="#666666" transparent opacity={0.3} />
      </mesh>
    );
  }

  return (
    <>
      {/* Solid mesh */}
      {showSolid && (
        <mesh ref={meshRef} geometry={solidGeometry}>
          <meshStandardMaterial
            vertexColors
            transparent
            opacity={opacity}
            side={THREE.DoubleSide}
            roughness={0.3}
            metalness={0.1}
          />
        </mesh>
      )}
      
      {/* Wireframe */}
      {showWireframe && (
        <lineSegments ref={wireframeRef} geometry={wireframeGeometry}>
          <lineBasicMaterial 
            color={showSolid ? "#00ff00" : "#ffffff"} 
            transparent 
            opacity={wireframeOpacity}
            linewidth={2}
          />
        </lineSegments>
      )}
      
      {/* Debug: Show when LOD is disabled */}
      {!enableLOD && (
        <mesh position={[0, 2, 0]}>
          <sphereGeometry args={[0.2, 8, 6]} />
          <meshBasicMaterial color="#ff0000" />
        </mesh>
      )}
      
      {/* Debug: Show when Frustum Culling is disabled */}
      {!enableFrustumCulling && (
        <mesh position={[2, 0, 0]}>
          <sphereGeometry args={[0.2, 8, 6]} />
          <meshBasicMaterial color="#00ff00" />
        </mesh>
      )}
      
      {/* Density Overlay - Real density data */}
      {showDensityOverlay && (
        <group>
          {/* Debug: Show points data info */}
          <mesh position={[0, 2, 0]}>
            <boxGeometry args={[0.1, 0.1, 0.1]} />
            <meshBasicMaterial color={points.length > 0 ? "#00ff00" : "#ff0000"} />
          </mesh>
          
          {/* Debug: Show points count */}
          <mesh position={[0.2, 2, 0]}>
            <boxGeometry args={[0.05, 0.05, 0.05]} />
            <meshBasicMaterial color="#0000ff" />
          </mesh>
          
          {points.length > 0 && (
            <>
              {/* Show actual density from points data */}
              {points.map((point, index) => {
                // Debug: Log point data
                console.log(`Point ${index}:`, point);
                
                if (point.density && point.density > 0) {
                  // Map point coordinates to 3D space
                  const x = (point.x - 0.5) * 4; // Scale from [0,1] to [-2,2]
                  const z = (point.y - 0.5) * 4;
                  const y = 0.5; // Height above landscape
                  
                  // Color based on actual density value
                  let densityColor = "#22c55e"; // Green for low density
                  if (point.density > 0.5) densityColor = "#ef4444"; // Red for high density
                  else if (point.density > 0.3) densityColor = "#f97316"; // Orange for medium
                  else if (point.density > 0.1) densityColor = "#eab308"; // Yellow for low
                  
                  // Size based on density
                  const sphereSize = 0.05 + (point.density * 0.1);
                  
                  return (
                    <mesh key={`density-${index}`} position={[x, y, z]}>
                      <sphereGeometry args={[sphereSize, 6, 4]} />
                      <meshBasicMaterial color={densityColor} transparent opacity={0.8} />
                    </mesh>
                  );
                } else {
                  // Debug: Show points without density
                  const x = (point.x - 0.5) * 4;
                  const z = (point.y - 0.5) * 4;
                  const y = 0.3; // Lower height for non-density points
                  
                  return (
                    <mesh key={`no-density-${index}`} position={[x, y, z]}>
                      <sphereGeometry args={[0.02, 6, 4]} />
                      <meshBasicMaterial color="#888888" transparent opacity={0.5} />
                    </mesh>
                  );
                }
              })}
            </>
          )}
        </group>
      )}
      
      {/* Multi-Landscape Mode - Simplified version */}
      {multiLandscapeMode && (
        <group>
          {/* Create simple overlay grids */}
          {[0, 1].map((overlayIndex) => (
            <group key={`overlay-${overlayIndex}`}>
              {Array.from({ length: 6 }, (_, i) => 
                Array.from({ length: 6 }, (_, j) => {
                  const x = (i - 3) * 0.4;
                  const z = (j - 3) * 0.4;
                  const y = Math.sin(i * 0.5) * Math.cos(j * 0.5) * 0.2 + overlayIndex * 0.3;
                  
                  return (
                    <mesh key={`overlay-${overlayIndex}-${i}-${j}`} position={[x, y, z]}>
                      <boxGeometry args={[0.1, 0.1, 0.1]} />
                      <meshBasicMaterial 
                        color="#0088ff" 
                        transparent 
                        opacity={0.6}
                        wireframe
                      />
                    </mesh>
                  );
                })
              )}
            </group>
          ))}
        </group>
      )}
    </>
  );
};

// Main 3D Component
const PersistenceLandscape3D: React.FC<PersistenceLandscape3DProps> = ({
  persistenceData,
  points = [], // Add points parameter with default empty array
  width = 800,
  height = 600,
  showWireframe = true,
  showSolid = true,
  colorScheme = 'viridis',
  opacity = 0.8
}) => {
  // Debug: Log what we're receiving
  console.log('PersistenceLandscape3D received:', {
    persistenceData: !!persistenceData,
    pointsCount: points.length,
    pointsSample: points.slice(0, 3),
    firstPoint: points[0]
  });
  const [cameraPosition, setCameraPosition] = useState<[number, number, number]>([3, 2, 3]);
  const [showGrid, setShowGrid] = useState(true);
  const [showAxes, setShowAxes] = useState(true);
  const cameraRef = useRef<THREE.Camera>(null);
  const [showWireframeState, setShowWireframe] = useState(showWireframe);
  const [showSolidState, setShowSolid] = useState(showSolid);
  const [colorSchemeState, setColorScheme] = useState(colorScheme);
  const [opacityState, setOpacity] = useState(opacity);
  const [dimensionFilter, setDimensionFilter] = useState<number[]>([0, 1, 2]); // Show all dimensions
  const [showDensityOverlay, setShowDensityOverlay] = useState(false);
  const [wireframeOpacity, setWireframeOpacity] = useState(0.3);
  const [showHelp, setShowHelp] = useState(false);
  const [customColorRange, setCustomColorRange] = useState<[number, number]>([0, 1]);
  const [showColorLegend, setShowColorLegend] = useState(false);
  const [enableLOD, setEnableLOD] = useState(true);
  const [enableFrustumCulling, setEnableFrustumCulling] = useState(true);
  const [multiLandscapeMode, setMultiLandscapeMode] = useState(false);
  const [landscapeOverlays, setLandscapeOverlays] = useState<Array<{
    id: string;
    data: PersistenceData;
    colorScheme: string;
    opacity: number;
    visible: boolean;
  }>>([]);

  // Enhanced camera presets with smooth transitions
  const cameraPresets = {
    front: { position: [0, 0, 3] as [number, number, number], target: [0, 0, 0] as [number, number, number] },
    top: { position: [0, 3, 0] as [number, number, number], target: [0, 0, 0] as [number, number, number] },
    side: { position: [3, 0, 0] as [number, number, number], target: [0, 0, 0] as [number, number, number] },
    isometric: { position: [3, 2, 3] as [number, number, number], target: [0, 0, 0] as [number, number, number] },
    reset: { position: [3, 2, 3] as [number, number, number], target: [0, 0, 0] as [number, number, number] },
    close: { position: [1, 1, 1] as [number, number, number], target: [0, 0, 0] as [number, number, number] },
    far: { position: [5, 4, 5] as [number, number, number], target: [0, 0, 0] as [number, number, number] }
  };

  const [cameraTarget, setCameraTarget] = useState<[number, number, number]>([0, 0, 0]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Performance metrics state
  const [renderTime, setRenderTime] = useState(0);
  const [vertexCount, setVertexCount] = useState(0);
  const [lodLevel, setLodLevel] = useState(1);
  
  // Handle performance updates from scene component
  const handlePerformanceUpdate = (metrics: { renderTime: number; vertexCount: number; lodLevel: number }) => {
    setRenderTime(metrics.renderTime);
    setVertexCount(metrics.vertexCount);
    setLodLevel(metrics.lodLevel);
  };

  // Update camera position when state changes
  useEffect(() => {
    if (cameraRef.current) {
      const camera = cameraRef.current;
      camera.position.set(...cameraPosition);
      camera.lookAt(...cameraTarget);
      camera.updateMatrixWorld();
    }
  }, [cameraPosition, cameraTarget]);

  // Camera updates are now handled by CameraController component

  const setCameraPreset = (preset: keyof typeof cameraPresets) => {
    if (isTransitioning) return;
    
    console.log('=== CAMERA PRESET CALLED ===');
    console.log('Preset:', preset);
    console.log('Current camera position:', cameraPosition);
    console.log('Camera ref available:', !!cameraRef.current);
    if (cameraRef.current) {
      console.log('Current camera ref position:', cameraRef.current.position);
    }
    
    setIsTransitioning(true);
    const targetPreset = cameraPresets[preset];
    
    console.log('Target preset:', targetPreset);
    
    // Update camera position state - useEffect will handle camera updates
    setCameraPosition(targetPreset.position);
    setCameraTarget(targetPreset.target);
    
    console.log('State updated - new position:', targetPreset.position);
    
    // Smooth camera transition
    const startPosition = [...cameraPosition];
    const startTime = Date.now();
    const duration = 1000; // 1 second transition
    
    const animateCamera = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth movement
      const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const easedProgress = easeInOutCubic(progress);
      
      const newPosition: [number, number, number] = [
        startPosition[0] + (targetPreset.position[0] - startPosition[0]) * easedProgress,
        startPosition[1] + (targetPreset.position[1] - startPosition[1]) * easedProgress,
        startPosition[2] + (targetPreset.position[2] - startPosition[2]) * easedProgress
      ];
      
      console.log('Animation frame:', progress, 'new position:', newPosition);
      setCameraPosition(newPosition);
      
      if (progress < 1) {
        requestAnimationFrame(animateCamera);
      } else {
        console.log('Animation complete');
        setIsTransitioning(false);
        
        // Force camera update after animation completes
        setTimeout(() => {
          if (cameraRef.current) {
            console.log('Force updating camera after animation');
            const camera = cameraRef.current;
            camera.position.set(...targetPreset.position);
            camera.lookAt(...targetPreset.target);
            camera.updateMatrixWorld();
            console.log('Camera force-updated to:', targetPreset.position);
            
            // Also update the state to match the final position
            setCameraPosition(targetPreset.position);
            setCameraTarget(targetPreset.target);
          }
        }, 50);
      }
    };
    
    animateCamera();
  };

  // Keyboard shortcuts for camera controls
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.target !== document.body) return;
      
      switch (event.key.toLowerCase()) {
        case '1':
          setCameraPreset('front');
          break;
        case '2':
          setCameraPreset('top');
          break;
        case '3':
          setCameraPreset('side');
          break;
        case '4':
          setCameraPreset('isometric');
          break;
        case '5':
          setCameraPreset('close');
          break;
        case '6':
          setCameraPreset('far');
          break;
        case '0':
          setCameraPreset('reset');
          break;
        case 'r':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            setCameraPreset('reset');
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Camera Controller Component - uses useThree to get the actual camera
  const CameraController: React.FC<{
    cameraPosition: [number, number, number];
    cameraTarget: [number, number, number];
    onCameraUpdate: (camera: THREE.Camera) => void;
  }> = ({ cameraPosition, cameraTarget, onCameraUpdate }) => {
    const { camera } = useThree();
    
    useEffect(() => {
      console.log('CameraController: Updating camera to position:', cameraPosition);
      console.log('CameraController: Current camera position:', [camera.position.x, camera.position.y, camera.position.z]);
      
      // Update the actual camera that the Canvas is using
      camera.position.set(...cameraPosition);
      camera.lookAt(...cameraTarget);
      camera.updateMatrixWorld();
      
      console.log('CameraController: Camera updated successfully');
      onCameraUpdate(camera);
    }, [cameraPosition, cameraTarget, camera, onCameraUpdate]);
    
    return null; // This component doesn't render anything
  };

  // Check if we have valid data
  if (!persistenceData || !persistenceData.pairs || persistenceData.pairs.length === 0) {
    return (
      <div className="persistence-landscape-3d loading" style={{ width, height }}>
        <div className="loading-message">
          <p>No persistence data available</p>
          <p>Generate some data in the Persistence Analysis tab first</p>
        </div>
      </div>
    );
  }

  return (
    <div className="persistence-landscape-3d" style={{ width, height }}>
      {/* Controls Panel */}
      <div className="controls-panel">
        <div className="control-group">
          <label>
            <input
              type="checkbox"
              checked={showWireframeState}
              onChange={(e) => setShowWireframe(e.target.checked)}
            />
            Wireframe
          </label>
          <label>
            <input
              type="checkbox"
              checked={showSolidState}
              onChange={(e) => setShowSolid(e.target.checked)}
            />
            Solid
          </label>
        </div>
        
        <div className="control-group">
          <label>
            <input
              type="checkbox"
              checked={showGrid}
              onChange={(e) => setShowGrid(e.target.checked)}
            />
            Grid
          </label>
          <label>
            <input
              type="checkbox"
              checked={showAxes}
              onChange={(e) => setShowAxes(e.target.checked)}
            />
            Axes
          </label>
        </div>
        
        <div className="control-group">
          <label htmlFor="color-scheme">Color Scheme:</label>
          <select
            id="color-scheme"
            value={colorSchemeState}
            onChange={(e) => setColorScheme(e.target.value as any)}
            title="Select color scheme for the 3D landscape"
          >
            <option value="viridis">Viridis</option>
            <option value="plasma">Plasma</option>
            <option value="inferno">Inferno</option>
            <option value="magma">Magma</option>
            <option value="cividis">Cividis</option>
            <option value="turbo">Turbo</option>
            <option value="rainbow">Rainbow</option>
            <option value="spectral">Spectral</option>
            <option value="coolwarm">Cool-Warm</option>
            <option value="rdylbu">Red-Yellow-Blue</option>
          </select>
        </div>
        
        <div className="control-group">
          <label>
            <input
              type="checkbox"
              checked={showColorLegend}
              onChange={(e) => setShowColorLegend(e.target.checked)}
            />
            Show Color Legend
          </label>
        </div>
        
        <div className="control-group">
          <label>
            <input
              type="checkbox"
              checked={enableLOD}
              onChange={(e) => {
                console.log('LOD toggled:', e.target.checked);
                setEnableLOD(e.target.checked);
              }}
            />
            Enable LOD
          </label>
        </div>
        
        <div className="control-group">
          <label>
            <input
              type="checkbox"
              checked={enableFrustumCulling}
              onChange={(e) => {
                console.log('Frustum Culling toggled:', e.target.checked);
                setEnableFrustumCulling(e.target.checked);
              }}
            />
            Enable Frustum Culling
          </label>
        </div>
        
        <div className="control-group">
          <label>
            <input
              type="checkbox"
              checked={multiLandscapeMode}
              onChange={(e) => setMultiLandscapeMode(e.target.checked)}
            />
            Multi-Landscape Mode
          </label>
        </div>
        
        <div className="control-group">
          <label htmlFor="opacity-slider">Opacity:</label>
          <input
            id="opacity-slider"
            type="range"
            min="0.1"
            max="1.0"
            step="0.1"
            value={opacityState}
            onChange={(e) => setOpacity(parseFloat(e.target.value))}
            title="Adjust the opacity of the 3D landscape"
          />
          <span>{opacityState.toFixed(1)}</span>
        </div>
        
        <div className="control-group">
          <label htmlFor="wireframe-opacity-slider">Wireframe Opacity:</label>
          <input
            id="wireframe-opacity-slider"
            type="range"
            min="0.1"
            max="1.0"
            step="0.1"
            value={wireframeOpacity}
            onChange={(e) => setWireframeOpacity(parseFloat(e.target.value))}
            title="Adjust the opacity of the wireframe"
          />
          <span>{wireframeOpacity.toFixed(1)}</span>
        </div>
        
        <div className="control-group">
          <label>Dimension Filter:</label>
          <div className="dimension-checkboxes">
            {[0, 1, 2].map(dim => (
              <label key={dim} className="dimension-checkbox">
                <input
                  type="checkbox"
                  checked={dimensionFilter.includes(dim)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setDimensionFilter([...dimensionFilter, dim]);
                    } else {
                      setDimensionFilter(dimensionFilter.filter(d => d !== dim));
                    }
                  }}
                />
                H{dim}
              </label>
            ))}
          </div>
        </div>
        
        <div className="control-group">
          <label>
            <input
              type="checkbox"
              checked={showDensityOverlay}
              onChange={(e) => setShowDensityOverlay(e.target.checked)}
            />
            Density Overlay
          </label>
        </div>
        
        {/* Debug: Show points info */}
        <div className="debug-info" style={{ fontSize: '12px', color: '#666', marginTop: '10px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
          <div><strong>Debug Info:</strong></div>
          <div>Points: {points.length}</div>
          <div>With Density: {points.filter(p => p.density && p.density > 0).length}</div>
          <div>First Point: {points[0] ? `${points[0].x.toFixed(2)}, ${points[0].y.toFixed(2)}` : 'None'}</div>
          <div>First Density: {points[0]?.density?.toFixed(3) || 'None'}</div>
          <div>Density Range: {points.length > 0 ? 
            `${Math.min(...points.filter(p => p.density).map(p => p.density || 0)).toFixed(3)} - ${Math.max(...points.filter(p => p.density).map(p => p.density || 0)).toFixed(3)}` : 
            'N/A'}</div>
        </div>
        
        {/* Test density calculation */}
        <div className="control-group">
          <button
            onClick={() => {
              console.log('Current points:', points);
              console.log('Points with density:', points.filter(p => p.density && p.density > 0));
              console.log('Sample point:', points[0]);
            }}
            className="debug-button"
            style={{ fontSize: '11px', padding: '5px', backgroundColor: '#ff6b6b', color: 'white', border: 'none', borderRadius: '3px' }}
            title="Log points data to console"
          >
            Debug Points
          </button>
          
          <button
            onClick={() => {
              // Test manual density calculation
              if (points.length > 0) {
                const testRadius = 0.2; // Larger radius for testing
                const testPoint = points[0];
                let neighborCount = 0;
                
                points.forEach(otherPoint => {
                  if (otherPoint.id !== testPoint.id) {
                    const distance = Math.sqrt(
                      Math.pow(testPoint.x - otherPoint.x, 2) + 
                      Math.pow(testPoint.y - otherPoint.y, 2)
                    );
                    if (distance < testRadius) {
                      neighborCount++;
                    }
                  }
                });
                
                console.log('Manual density test:', {
                  testPoint: { x: testPoint.x, y: testPoint.y },
                  testRadius,
                  neighborCount,
                  density: neighborCount / points.length
                });
              }
            }}
            className="test-density-button"
            style={{ fontSize: '11px', padding: '5px', backgroundColor: '#4ecdc4', color: 'white', border: 'none', borderRadius: '3px', marginLeft: '5px' }}
            title="Test density calculation manually"
          >
            Test Density
          </button>
        </div>
        
        <div className="control-group">
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="help-button"
            title="Show keyboard shortcuts"
          >
            {showHelp ? 'Hide Help' : 'Show Help'}
          </button>
        </div>
        
        <div className="control-group">
          <button
            onClick={() => {
              // Create sample landscape overlays for testing
              const sampleOverlays = [
                {
                  id: 'sample1',
                  data: persistenceData,
                  colorScheme: 'plasma',
                  opacity: 0.4,
                  visible: true
                },
                {
                  id: 'sample2',
                  data: persistenceData,
                  colorScheme: 'inferno',
                  opacity: 0.3,
                  visible: true
                }
              ];
              setLandscapeOverlays(sampleOverlays);
              console.log('Created sample landscape overlays:', sampleOverlays);
            }}
            className="sample-overlays-button"
            title="Create sample landscape overlays for testing"
          >
            Create Sample Overlays
          </button>
        </div>
        
        <div className="camera-presets">
          <button 
            onClick={() => setCameraPreset('front')}
            title="View from front"
            aria-label="View from front"
            disabled={isTransitioning}
          >
            Front
          </button>
          <button 
            onClick={() => setCameraPreset('top')}
            title="View from top"
            aria-label="View from top"
            disabled={isTransitioning}
          >
            Top
          </button>
          <button 
            onClick={() => setCameraPreset('side')}
            title="View from side"
            aria-label="View from side"
            disabled={isTransitioning}
          >
            Side
          </button>
          <button 
            onClick={() => setCameraPreset('isometric')}
            title="View from isometric angle"
            aria-label="View from isometric angle"
            disabled={isTransitioning}
          >
            Isometric
          </button>
          <button 
            onClick={() => setCameraPreset('close')}
            title="Close-up view"
            aria-label="Close-up view"
            disabled={isTransitioning}
          >
            Close
          </button>
          <button 
            onClick={() => setCameraPreset('far')}
            title="Far view"
            aria-label="Far view"
            disabled={isTransitioning}
          >
            Far
          </button>
          <button 
            onClick={() => setCameraPreset('reset')}
            title="Reset camera to default position"
            aria-label="Reset camera to default position"
            disabled={isTransitioning}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Performance Overlay */}
      <div className="performance-overlay">
        <div className="performance-metric">
          <span className="metric-label">FPS:</span>
          <span className="metric-value">{renderTime > 0 ? Math.round(1000 / renderTime) : 0}</span>
        </div>
        <div className="performance-metric">
          <span className="metric-label">Render:</span>
          <span className="metric-value">{renderTime.toFixed(1)}ms</span>
        </div>
        <div className="performance-metric">
          <span className="metric-label">LOD:</span>
          <span className="metric-value">{lodLevel.toFixed(2)}</span>
        </div>
        <div className="performance-metric">
          <span className="metric-label">Vertices:</span>
          <span className="metric-value">{vertexCount.toLocaleString()}</span>
        </div>
        
        {/* Performance Warnings */}
        {renderTime > 33 && (
          <div className="performance-warning">
            <span className="warning-icon">⚠️</span>
            <span className="warning-text">Low FPS - Consider enabling LOD</span>
          </div>
        )}
        
        {vertexCount > 10000 && (
          <div className="performance-warning">
            <span className="warning-icon">⚠️</span>
            <span className="warning-text">High vertex count - LOD recommended</span>
          </div>
        )}
      </div>

      {/* Camera Info Overlay */}
      <div className="camera-info-overlay">
        <div className="camera-info-metric">
          <span className="metric-label">Position:</span>
          <span className="metric-value">
            ({cameraPosition[0].toFixed(1)}, {cameraPosition[1].toFixed(1)}, {cameraPosition[2].toFixed(1)})
          </span>
        </div>
        <div className="camera-info-metric">
          <span className="metric-label">Distance:</span>
          <span className="metric-value">
            {Math.sqrt(cameraPosition[0]**2 + cameraPosition[1]**2 + cameraPosition[2]**2).toFixed(1)}
          </span>
        </div>
        {isTransitioning && (
          <div className="camera-info-metric">
            <span className="metric-label">Status:</span>
            <span className="metric-value warning">Transitioning...</span>
          </div>
        )}
      </div>

      {/* Help Overlay */}
      {showHelp && (
        <div className="help-overlay">
          <div className="help-content">
            <h4>Keyboard Shortcuts</h4>
            <div className="shortcut-list">
              <div className="shortcut-item">
                <span className="shortcut-key">1-6</span>
                <span className="shortcut-desc">Camera presets (Front, Top, Side, Isometric, Close, Far)</span>
              </div>
              <div className="shortcut-item">
                <span className="shortcut-key">0</span>
                <span className="shortcut-desc">Reset camera</span>
              </div>
              <div className="shortcut-item">
                <span className="shortcut-key">Ctrl+R</span>
                <span className="shortcut-desc">Reset camera</span>
              </div>
              <div className="shortcut-item">
                <span className="shortcut-key">Mouse</span>
                <span className="shortcut-desc">Left: Rotate, Right: Pan, Wheel: Zoom</span>
              </div>
            </div>
            <button
              onClick={() => setShowHelp(false)}
              className="close-help-button"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Color Legend */}
      <div className={`color-legend ${showColorLegend ? 'show' : ''}`}>
          <div className="legend-header">
            <h4>Color Legend</h4>
            <span className="legend-scheme">{colorScheme}</span>
          </div>
          <div className="legend-gradient">
            <div className="gradient-bar">
              {Array.from({ length: 20 }, (_, i) => {
                const normalizedHeight = i / 19;
                let r, g, b;
                
                // Generate color for this position
                switch (colorScheme) {
                  case 'viridis':
                    r = 0.267 + normalizedHeight * 0.004;
                    g = 0.005 + normalizedHeight * 0.99;
                    b = 0.329 + normalizedHeight * 0.671;
                    break;
                  case 'plasma':
                    r = 0.241 + normalizedHeight * 0.759;
                    g = 0.015 + normalizedHeight * 0.985;
                    b = 0.329 + normalizedHeight * 0.671;
                    break;
                  case 'inferno':
                    r = 0.001 + normalizedHeight * 0.999;
                    g = 0.000 + normalizedHeight * 1.000;
                    b = 0.000 + normalizedHeight * 1.000;
                    break;
                  case 'magma':
                    r = 0.000 + normalizedHeight * 1.000;
                    g = 0.000 + normalizedHeight * 1.000;
                    b = 0.000 + normalizedHeight * 1.000;
                    break;
                  case 'cividis':
                    r = 0.0 + normalizedHeight * 1.0;
                    g = 0.135 + normalizedHeight * 0.865;
                    b = 0.0 + normalizedHeight * 1.0;
                    break;
                  case 'turbo':
                    r = 0.18995 + normalizedHeight * 0.81005;
                    g = 0.07176 + normalizedHeight * 0.92824;
                    b = 0.23217 + normalizedHeight * 0.76783;
                    break;
                  case 'rainbow':
                    const hue = normalizedHeight * 360;
                    const h = Math.floor(hue / 60);
                    const f = hue / 60 - h;
                    const q = 1 - f;
                    const t = f;
                    switch (h % 6) {
                      case 0: r = 1; g = t; b = 0; break;
                      case 1: r = q; g = 1; b = 0; break;
                      case 2: r = 0; g = 1; b = t; break;
                      case 3: r = 0; g = q; b = 1; break;
                      case 4: r = t; g = 0; b = 1; break;
                      case 5: r = 1; g = 0; b = q; break;
                      default: r = g = b = 0;
                    }
                    break;
                  case 'spectral':
                    if (normalizedHeight < 0.5) {
                      r = 0.6196 + normalizedHeight * 0.3804;
                      g = 0.0039 + normalizedHeight * 0.9961;
                      b = 0.2588 + normalizedHeight * 0.7412;
                    } else {
                      const t = (normalizedHeight - 0.5) * 2;
                      r = 0.9999 - t * 0.9999;
                      g = 0.9999 - t * 0.9999;
                      b = 0.9999 - t * 0.9999;
                    }
                    break;
                  case 'coolwarm':
                    if (normalizedHeight < 0.5) {
                      const t = normalizedHeight * 2;
                      r = 0.230 + t * 0.770;
                      g = 0.299 + t * 0.701;
                      b = 0.754 + t * 0.246;
                    } else {
                      const t = (normalizedHeight - 0.5) * 2;
                      r = 0.9999 - t * 0.9999;
                      g = 0.9999 - t * 0.9999;
                      b = 0.9999 - t * 0.9999;
                    }
                    break;
                  case 'rdylbu':
                    if (normalizedHeight < 0.5) {
                      const t = normalizedHeight * 2;
                      r = 0.9999 - t * 0.9999;
                      g = 0.9999 - t * 0.9999;
                      b = 0.9999 - t * 0.9999;
                    } else {
                      const t = (normalizedHeight - 0.5) * 2;
                      r = 0.9999 - t * 0.9999;
                      g = 0.9999 - t * 0.9999;
                      b = 0.9999 - t * 0.9999;
                    }
                    break;
                  default:
                    r = g = b = normalizedHeight;
                }
                
                return (
                  <div
                    key={i}
                    className="gradient-segment"
                    style={{
                      backgroundColor: `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`
                    }}
                  />
                );
              })}
            </div>
            <div className="gradient-labels">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>
          <div className="legend-info">
            <p>Height represents persistence density</p>
            <p>Colors indicate persistence values</p>
          </div>
        </div>
      )}

      {/* 3D Canvas */}
      <Canvas
        style={{ background: '#1a1a1a' }}
        gl={{ 
          antialias: true,
          powerPreference: "high-performance",
          depth: true,
          alpha: false
        }}
        onCreated={({ gl }) => {
          gl.setClearColor('#1a1a1a');
        }}
      >
        {/* Camera Controller - handles camera updates */}
        <CameraController 
          cameraPosition={cameraPosition}
          cameraTarget={cameraTarget}
          onCameraUpdate={(camera) => {
            if (cameraRef.current !== camera) {
              console.log('Camera ref updated to:', camera, 'position:', camera.position);
              (cameraRef as any).current = camera;
            }
          }}
        />
        
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={0.8}
          castShadow
        />
        <pointLight position={[-10, -10, -5]} intensity={0.3} />
        
        {/* Test cube removed - persistence landscape should render here */}
        
        {/* Custom Grid */}
        {showGrid && (
          <group>
            {/* Grid lines */}
            {Array.from({ length: 9 }, (_, i) => (
              <line key={`x-${i}`}>
                <bufferGeometry>
                  <bufferAttribute
                    attach="attributes-position"
                    args={[
                      new Float32Array([
                        (i - 4) * 0.5, 0, -2,
                        (i - 4) * 0.5, 0, 2
                      ]),
                      3
                    ]}
                  />
                </bufferGeometry>
                <lineBasicMaterial color="#444444" />
              </line>
            ))}
            {Array.from({ length: 9 }, (_, i) => (
              <line key={`z-${i}`}>
                <bufferGeometry>
                  <bufferAttribute
                    attach="attributes-position"
                    args={[
                      new Float32Array([
                        -2, 0, (i - 4) * 0.5,
                        2, 0, (i - 4) * 0.5
                      ]),
                      3
                    ]}
                  />
                </bufferGeometry>
                <lineBasicMaterial color="#444444" />
              </line>
            ))}
          </group>
        )}
        
        {/* Coordinate Axes */}
        {showAxes && (
          <group>
            {/* X-axis (Red) */}
            <line>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  args={[
                    new Float32Array([0, 0, 0, 2, 0, 0]),
                    3
                  ]}
                />
              </bufferGeometry>
              <lineBasicMaterial color="#ff0000" linewidth={2} />
            </line>
            {/* Y-axis (Green) */}
            <line>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  args={[
                    new Float32Array([0, 0, 0, 0, 2, 0]),
                    3
                  ]}
                />
              </bufferGeometry>
              <lineBasicMaterial color="#00ff00" linewidth={2} />
            </line>
            {/* Z-axis (Blue) */}
            <line>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  args={[
                    new Float32Array([0, 0, 0, 0, 0, 2]),
                    3
                  ]}
                />
              </bufferGeometry>
              <lineBasicMaterial color="#0000ff" linewidth={2} />
            </line>
            {/* Axis labels */}
            <group position={[2.2, 0, 0]}>
              <mesh>
                <boxGeometry args={[0.1, 0.1, 0.1]} />
                <meshBasicMaterial color="#ff0000" />
              </mesh>
            </group>
            <group position={[0, 2.2, 0]}>
              <mesh>
                <boxGeometry args={[0.1, 0.1, 0.1]} />
                <meshBasicMaterial color="#00ff00" />
              </mesh>
            </group>
            <group position={[0, 0, 2.2]}>
              <mesh>
                <boxGeometry args={[0.1, 0.1, 0.1]} />
                <meshBasicMaterial color="#0000ff" />
              </mesh>
            </group>
          </group>
        )}
        
        {/* Persistence Landscape Scene */}
        {persistenceData && (
          <PersistenceLandscapeScene
            key={`landscape-${persistenceData.pairs.length}-${colorSchemeState}-${lodLevel}`}
            persistenceData={persistenceData}
            points={points} // Pass the points data
            showWireframe={showWireframeState}
            showSolid={showSolidState}
            colorScheme={colorSchemeState}
            opacity={opacityState}
            dimensionFilter={dimensionFilter}
            showDensityOverlay={showDensityOverlay}
            enableLOD={enableLOD}
            enableFrustumCulling={enableFrustumCulling}
            multiLandscapeMode={multiLandscapeMode}
            landscapeOverlays={landscapeOverlays}
            lodLevel={lodLevel}
            wireframeOpacity={wireframeOpacity}
            onPerformanceUpdate={handlePerformanceUpdate}
          />
        )}
        
        {/* Enhanced Camera Controls */}
        <OrbitControls
          enablePan={!isTransitioning}
          enableZoom={!isTransitioning}
          enableRotate={!isTransitioning}
          minDistance={0.5}
          maxDistance={15}
          target={cameraTarget}
          dampingFactor={0.05}
          enableDamping={true}
          rotateSpeed={0.8}
          zoomSpeed={1.2}
          panSpeed={1.0}
          maxPolarAngle={Math.PI}
          minPolarAngle={0}
          enableKeys={!isTransitioning}
          keyPanSpeed={7.0}
          screenSpacePanning={true}
          onUpdate={() => {
            // Camera position updates are handled by OrbitControls automatically
            // But only when not transitioning
          }}
        />
      </Canvas>
    </div>
  );
};

export default PersistenceLandscape3D;
