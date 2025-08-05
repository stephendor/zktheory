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
    // Try to load the WASM module
    const wasmPath = '/tda_rust_core_bg.wasm';
    const jsPath = '/tda_rust_core.js';

    // Check if WASM files exist
    const wasmResponse = await fetch(wasmPath);
    if (!wasmResponse.ok) {
      console.warn('WASM file not found, using mock computation');
      return false;
    }

    // Dynamically import the WASM module
    const wasmModulePromise = import(jsPath);
    wasmModule = await wasmModulePromise;
    
    // Initialize the module
    await wasmModule.default();
    
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
          engine.set_points(points);
        } catch (error) {
          console.error('Error setting points:', error);
          throw error;
        }
      },
      compute_vietoris_rips: (maxDistance: number) => {
        try {
          engine.compute_vietoris_rips(maxDistance);
        } catch (error) {
          console.error('Error computing Vietoris-Rips complex:', error);
          throw error;
        }
      },
      compute_persistence: (): PersistenceInterval[] => {
        try {
          const result = engine.compute_persistence();
          // Convert WASM result to TypeScript interface
          return result.map((interval: any) => ({
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