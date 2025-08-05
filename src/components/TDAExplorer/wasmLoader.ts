// WASM Loader for TDA Engine
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

export const initializeWasm = async (): Promise<boolean> => {
  if (isInitialized) {
    return true;
  }

  try {
    // Check if WASM files exist
    const wasmResponse = await fetch('/tda_rust_core_bg.wasm');
    if (!wasmResponse.ok) {
      console.warn('WASM file not found, using mock computation');
      return false;
    }

    // TODO: Proper WASM integration would require:
    // 1. Setting up wasm-bindgen integration with Next.js
    // 2. Proper module loading with the generated JS bindings
    // 3. Handling the async initialization properly
    
    console.warn('WASM files found but integration not yet complete, using mock computation');
    return false;
    
    isInitialized = true;
    console.log('TDA WASM module loaded successfully');
    return true;
  } catch (error) {
    console.error('Failed to load WASM module:', error);
    console.warn('Falling back to mock computation');
    return false;
  }
};

export const isWasmReady = (): boolean => {
  return isInitialized && wasmModule !== null;
};

export const createTDAEngine = (): TDAEngine | null => {
  if (!isWasmReady()) {
    console.warn('WASM not ready, returning null');
    return null;
  }

  try {
    // Create a new TDA engine instance using the WASM module
    const engine = new wasmModule.TDAEngine();
    
    return {
      set_points: (points: number[][]) => {
        try {
          // Convert points to the format expected by Rust: Vec<Point2D>
          const rustPoints = points.map(([x, y]) => ({ x, y }));
          engine.set_points(rustPoints);
        } catch (error) {
          console.error('Error setting points:', error);
          throw error;
        }
      },
      compute_vietoris_rips: (maxDistance: number) => {
        // Note: This method exists but we don't need to call it separately
        // The Rust engine will handle this internally in compute_persistence
      },
      compute_persistence: (): PersistenceInterval[] => {
        try {
          // Use maxDistance as the filtration parameter
          const maxDistance = 2.0; // Use a reasonable default
          const result = engine.compute_persistence(maxDistance);
          
          // Extract pairs from the PersistenceDiagram structure
          const diagram = result;
          return diagram.pairs.filter((interval: any) => {
            // Filter out infinite persistence pairs for visualization
            return isFinite(interval.death);
          }).map((interval: any) => ({
            birth: interval.birth,
            death: interval.death,
            dimension: interval.dimension
          }));
        } catch (error) {
          console.error('Error computing persistence:', error);
          throw error;
        }
      }
    };
  } catch (error) {
    console.error('Failed to create TDA engine:', error);
    return null;
  }
};

// Fallback mock engine for when WASM is not available
export const createMockTDAEngine = (): TDAEngine => {
  let currentPoints: number[][] = [];
  let currentMaxDistance = 0.5;

  return {
    set_points: (points: number[][]) => {
      currentPoints = points;
    },
    compute_vietoris_rips: (maxDistance: number) => {
      currentMaxDistance = maxDistance;
    },
    compute_persistence: (): PersistenceInterval[] => {
      // Generate mock persistence intervals based on the points
      const numIntervals = Math.min(10, Math.max(3, currentPoints.length));
      const intervals: PersistenceInterval[] = [];

      for (let i = 0; i < numIntervals; i++) {
        const birth = Math.random() * currentMaxDistance * 0.5;
        const death = currentMaxDistance * (0.6 + Math.random() * 0.4);
        const dimension = Math.random() < 0.7 ? 0 : 1;

        intervals.push({ birth, death, dimension });
      }

      return intervals.sort((a, b) => (b.death - b.birth) - (a.death - a.birth));
    }
  };
};