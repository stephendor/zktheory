'use client';

import React, { useState, useEffect, useCallback } from 'react';
import PointCloudCanvas from './PointCloudCanvas';
import PersistenceDiagram from './PersistenceDiagram';
import PersistenceBarcode from './PersistenceBarcode';
import MapperVisualization from './MapperVisualization';
import { initializeWasm, createTDAEngine, createMockTDAEngine, isWasmReady } from './wasmLoader';
import { initializeWasmV2, createTDAEngineV2, createEnhancedMockTDAEngine, isWasmReadyV2 } from './wasmLoaderV2';

interface Point {
  x: number;
  y: number;
  id: number;
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
  const [activeTab, setActiveTab] = useState<'persistence' | 'mapper'>('persistence');

  // Initialize WASM on component mount
  useEffect(() => {
    const loadWasm = async () => {
      // Toggle between V1 (current working) and V2 (full integration attempt)
      const useV2Integration = false; // Set to true to test full integration
      
      if (useV2Integration) {
        console.log('🔄 Testing V2 WASM integration...');
        try {
          const success = await initializeWasmV2();
          if (success) {
            const engine = createTDAEngineV2();
            if (engine) {
              setTdaEngine(engine);
              setWasmLoaded(true);
              console.log('✅ V2 WASM TDA Engine ready');
              return;
            }
          }
          
          // Fallback to enhanced mock
          console.log('🔄 V2 WASM failed, using enhanced mock');
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
        console.log('🔄 Using V1 WASM integration (current working)...');
        try {
          const success = await initializeWasm();
          if (success) {
            const engine = createTDAEngine();
            setTdaEngine(engine);
            setWasmLoaded(true);
            console.log('✅ V1 TDA Engine ready');
          } else {
            // Use original mock engine
            const mockEngine = createMockTDAEngine();
            setTdaEngine(mockEngine);
            setWasmLoaded(false);
            console.log('🔄 Using V1 mock TDA engine');
          }
        } catch (error) {
          console.error('V1 initialization error:', error);
          const mockEngine = createMockTDAEngine();
          setTdaEngine(mockEngine);
          setWasmLoaded(false);
          console.log('🔄 Fallback to V1 mock TDA engine');
        }
      }
    };
    
    loadWasm();
  }, []);

  // Generate sample data
  const generateSampleData = (type: 'circle' | 'clusters' | 'random') => {
    let newPoints: Point[] = [];
    
    switch (type) {
      case 'circle':
        for (let i = 0; i < 20; i++) {
          const angle = (2 * Math.PI * i) / 20;
          const radius = 0.3;
          const noise = (Math.random() - 0.5) * 0.05;
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
        clusters.forEach((cluster, clusterIndex) => {
          for (let i = 0; i < 15; i++) {
            newPoints.push({
              x: cluster.centerX + (Math.random() - 0.5) * 0.15,
              y: cluster.centerY + (Math.random() - 0.5) * 0.15,
              id: Date.now() + clusterIndex * 20 + i
            });
          }
        });
        break;
      case 'random':
        for (let i = 0; i < 25; i++) {
          newPoints.push({
            x: Math.random(),
            y: Math.random(),
            id: Date.now() + i
          });
        }
        break;
    }
    
    setPoints(newPoints);
  };

  // Persistence computation - uses WASM when available, falls back to mock
  const computePersistence = useCallback(() => {
    if (points.length < 3 || !tdaEngine) {
      setPersistenceData(null);
      return;
    }

    setIsComputing(true);
    
    try {
      // Set points in the TDA engine
      const pointsArray = points.map(p => [p.x, p.y]);
      tdaEngine.set_points(pointsArray);
      
      // Compute Vietoris-Rips complex
      tdaEngine.compute_vietoris_rips(filtrationValue);
      
      // Compute persistence
      const persistenceIntervals = tdaEngine.compute_persistence();
      
      const computedData: PersistenceData = {
        pairs: persistenceIntervals.map((interval: any) => ({
          birth: interval.birth,
          death: interval.death,
          dimension: interval.dimension
        })),
        filtrationValue: filtrationValue
      };
      
      setPersistenceData(computedData);
      setIsComputing(false);
      console.log(`Used ${wasmLoaded ? 'WASM' : 'mock'} computation`);
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

    const numClusters = Math.min(8, Math.max(3, Math.floor(points.length / 3)));
    const nodes: MapperNode[] = [];
    const links: MapperLink[] = [];

    // Sort points for deterministic behavior
    const sortedPoints = [...points].sort((a, b) => a.x - b.x || a.y - b.y);

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

  return (
    <div className="tda-explorer">
      <header className="tda-header">
        <h1>Topological Data Analysis Explorer</h1>
        <p>Interactive exploration of persistent homology and topological features</p>
      </header>
      
      <div className="tda-content">
        <div className="tda-controls">
          <h3>Sample Data</h3>
          <div className="button-group">
            <button onClick={() => generateSampleData('circle')} className="btn btn-primary">
              Circle
            </button>
            <button onClick={() => generateSampleData('clusters')} className="btn btn-primary">
              Clusters
            </button>
            <button onClick={() => generateSampleData('random')} className="btn btn-primary">
              Random
            </button>
            <button onClick={() => setPoints([])} className="btn btn-secondary">
              Clear
            </button>
          </div>
          
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
          
          <div className="info-panel">
            <p><strong>Points:</strong> {points.length}</p>
            <p><strong>Status:</strong> {isComputing ? 'Computing...' : 'Ready'}</p>
            <p><strong>Engine:</strong> {wasmLoaded ? 'WASM' : 'Mock'}</p>
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
          </div>

          {activeTab === 'persistence' && (
            <div className="visualization-grid">
              <div className="viz-panel">
                <h3>Point Cloud</h3>
                <PointCloudCanvas
                  points={points}
                  onPointsChange={handlePointsChange}
                  filtrationValue={filtrationValue}
                />
              </div>
              
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
          )}

          {activeTab === 'mapper' && (
            <div className="mapper-container">
              <div className="viz-panel mapper-main">
                <MapperVisualization
                  mapperData={mapperData}
                  width={800}
                  height={600}
                />
              </div>
              <div className="viz-panel mapper-side">
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
          )}
        </div>
      </div>
    </div>
  );
};

export default TDAExplorer;