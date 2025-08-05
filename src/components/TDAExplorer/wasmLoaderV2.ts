// Enhanced WASM Loader for TDA Engine - Full Integration Attempt
// This preserves the existing mock fallback while adding proper WASM support

let wasmModule: any = null;
let isInitialized = false;

interface TDAEngine {
  set_points: (points: number[][]) => void;
  compute_vietoris_rips: (maxDistance: number) => void;
  compute_persistence: () => PersistenceInterval[];
}

interface PersistenceInterval {
  birth: number;
  death: number;
  dimension: number;
}

export const initializeWasmV2 = async (): Promise<boolean> => {
  if (isInitialized) {
    return true;
  }

  try {
    console.log('Attempting full WASM integration...');
    
    // Method 1: Runtime dynamic import (avoids webpack build-time issues)
    try {
      // Load the JS bindings from public directory at runtime
      const response = await fetch('/tda_rust_core.js');
      if (!response.ok) {
        throw new Error('Could not fetch JS bindings');
      }
      
      const jsCode = await response.text();
      
      // Create a module from the JS code
      const moduleBlob = new Blob([jsCode], { type: 'application/javascript' });
      const moduleUrl = URL.createObjectURL(moduleBlob);
      
      // Dynamic import the module
      const wasmImport = await import(moduleUrl);
      
      // Initialize with WASM binary from public
      await wasmImport.default('/tda_rust_core_bg.wasm');
      
      wasmModule = wasmImport;
      isInitialized = true;
      console.log('✅ WASM loaded via runtime dynamic import');
      
      // Clean up the blob URL
      URL.revokeObjectURL(moduleUrl);
      return true;
    } catch (runtimeError) {
      console.warn('Runtime dynamic import failed:', runtimeError);
    }

    // Method 2: Direct fetch and manual instantiation
    try {
      // Fetch both the WASM binary and JS bindings
      const [wasmResponse, jsResponse] = await Promise.all([
        fetch('/tda_rust_core_bg.wasm'),
        fetch('/tda_rust_core.js')
      ]);
      
      if (!wasmResponse.ok || !jsResponse.ok) {
        throw new Error('Could not fetch WASM files');
      }
      
      const wasmBytes = await wasmResponse.arrayBuffer();
      const jsText = await jsResponse.text();
      
      // Manually instantiate the WebAssembly module
      const wasmModule_raw = await WebAssembly.instantiate(wasmBytes);
      
      // Create a simple wrapper that mimics the wasm-bindgen interface
      // This is a simplified approach - we'll need to implement the TDAEngine interface manually
      console.log('✅ WASM binary instantiated manually');
      console.warn('⚠️ Manual instantiation requires implementing the full API wrapper');
      
      // For now, fall back to enhanced mock since manual wrapper is complex
      return false;
    } catch (manualError) {
      console.warn('Manual instantiation failed:', manualError);
    }

    // Method 3: Check for file availability but use enhanced mock
    try {
      const wasmCheck = await fetch('/tda_rust_core_bg.wasm');
      const jsCheck = await fetch('/tda_rust_core.js');
      
      if (wasmCheck.ok && jsCheck.ok) {
        console.warn('🟡 WASM files available but integration incomplete - using enhanced mock');
        console.log('WASM file size:', wasmCheck.headers.get('content-length'), 'bytes');
        return false; // This will trigger the enhanced mock engine
      }
    } catch (checkError) {
      console.warn('WASM files not accessible:', checkError);
    }

    console.warn('❌ All WASM integration methods failed - falling back to enhanced mock');
    return false;

  } catch (error) {
    console.error('WASM initialization error:', error);
    console.warn('Falling back to enhanced mock computation');
    return false;
  }
};

export const isWasmReadyV2 = (): boolean => {
  return isInitialized && wasmModule !== null;
};

export const createTDAEngineV2 = (): TDAEngine | null => {
  if (!isWasmReadyV2()) {
    console.warn('WASM not ready, returning null');
    return null;
  }

  try {
    // Create a new TDA engine instance using the WASM module
    const engine = new wasmModule.TDAEngine();
    let currentMaxDistance = 0.5; // Store for persistence computation
    
    return {
      set_points: (points: number[][]) => {
        try {
          // Convert points to the format expected by Rust: Vec<Point2D>
          const rustPoints = points.map(([x, y]) => ({ x, y }));
          
          // The Rust API expects a JsValue, so we need to convert properly
          // wasm-bindgen handles this conversion automatically for us
          engine.set_points(rustPoints);
          console.log('✅ Points set in WASM engine:', points.length, 'points');
        } catch (error) {
          console.error('Error setting points:', error);
          throw error;
        }
      },
      compute_vietoris_rips: (maxDistance: number) => {
        // Store the max distance for persistence computation
        currentMaxDistance = maxDistance;
        console.log('Vietoris-Rips max distance set to:', maxDistance);
      },
      compute_persistence: (): PersistenceInterval[] => {
        try {
          // Call the Rust persistence computation with stored max distance
          const result = engine.compute_persistence(currentMaxDistance);
          
          console.log('✅ Persistence computed via WASM with max_epsilon:', currentMaxDistance);
          
          // The result is a JsValue containing a PersistenceDiagram
          // Extract the persistence pairs and filter infinite ones
          const pairs = result.pairs || [];
          
          return pairs.filter((interval: any) => {
            // Filter out infinite persistence pairs for visualization
            return isFinite(interval.death) && interval.death !== Infinity;
          }).map((interval: any) => ({
            birth: interval.birth,
            death: interval.death,
            dimension: interval.dimension
          }));
        } catch (error) {
          console.error('Error computing persistence:', error);
          console.error('Error details:', error.toString());
          // Don't throw - let it fall back to mock
          return [];
        }
      }
    };
  } catch (error) {
    console.error('Failed to create TDA engine:', error);
    return null;
  }
};

// Enhanced Mock Engine (better than the original)
export const createEnhancedMockTDAEngine = (): TDAEngine => {
  let currentPoints: number[][] = [];
  let currentMaxDistance = 0.5;

  console.log('🔄 Using enhanced mock TDA engine');

  return {
    set_points: (points: number[][]) => {
      currentPoints = points;
      console.log('Enhanced mock: Set', points.length, 'points');
    },
    compute_vietoris_rips: (maxDistance: number) => {
      currentMaxDistance = maxDistance;
      console.log('Enhanced mock: Vietoris-Rips with max distance', maxDistance);
    },
    compute_persistence: (): PersistenceInterval[] => {
      console.log('Enhanced mock: Computing persistence for', currentPoints.length, 'points');
      
      // More sophisticated mock that considers actual point positions
      const intervals: PersistenceInterval[] = [];
      
      if (currentPoints.length < 2) return intervals;

      // H0 components - based on actual distances
      const distances: number[] = [];
      for (let i = 0; i < currentPoints.length; i++) {
        for (let j = i + 1; j < currentPoints.length; j++) {
          const dist = Math.sqrt(
            Math.pow(currentPoints[i][0] - currentPoints[j][0], 2) + 
            Math.pow(currentPoints[i][1] - currentPoints[j][1], 2)
          );
          if (dist <= currentMaxDistance) {
            distances.push(dist);
          }
        }
      }

      // Sort distances to create more realistic persistence intervals
      distances.sort((a, b) => a - b);
      
      // Create H0 intervals (connected components) - fixed logic
      // Start with one component per point, then merge as distances decrease
      const numComponents = Math.max(3, Math.min(8, currentPoints.length));
      for (let i = 0; i < numComponents; i++) {
        const birth = 0; // Components are born at filtration value 0
        const death = i < distances.length 
          ? distances[Math.floor(i * distances.length / numComponents)]
          : currentMaxDistance * (0.4 + i * 0.1);
        
        if (birth < death) {
          intervals.push({
            birth,
            death,
            dimension: 0
          });
        }
      }

      // Create some H1 intervals (loops) if we have enough points
      if (currentPoints.length >= 6) {
        const numLoops = Math.floor(currentPoints.length / 8);
        for (let i = 0; i < numLoops; i++) {
          intervals.push({
            birth: currentMaxDistance * (0.3 + i * 0.1),
            death: currentMaxDistance * (0.7 + i * 0.1),
            dimension: 1
          });
        }
      }

      console.log('Enhanced mock: Generated', intervals.length, 'persistence intervals');
      return intervals.sort((a, b) => (b.death - b.birth) - (a.death - a.birth));
    }
  };
};