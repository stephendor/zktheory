# Mathematical Visualization Embedding Strategy

## Architecture Overview

### Tier 1: Embedded Interactive Demos (Pyodide)
Fast-loading, browser-based Python execution embedded directly in portfolio pages.

**Target Load Time:** < 15 seconds
**Complexity Level:** Undergraduate accessible
**Libraries:** NumPy, matplotlib, basic SciPy

#### Project 1: Complex Function Visualizer
- **Location:** `/src/components/interactive/ComplexDomainColoring.tsx`
- **Features:** 
  - Input field for complex functions
  - Real-time domain coloring visualization
  - Preset functions (rational, polynomial, trigonometric)
  - Educational tooltips explaining zeros, poles, conformal mapping

#### Project 2: Cayley Graph Explorer  
- **Location:** `/src/components/interactive/CayleyGraphExplorer.tsx`
- **Features:**
  - Dropdown for common groups (S₄, D₆, A₅)
  - Generator set selection
  - Interactive 2D/3D graph rendering
  - Subgroup highlighting

#### Project 3: Wavelet Audio Analyzer
- **Location:** `/src/components/interactive/WaveletAnalyzer.tsx` 
- **Features:**
  - Audio file upload/microphone input
  - Real-time scalogram generation
  - Synchronized audio playback with time-frequency visualization

### Tier 2: Complete Computational Environment

**Repository:** `mathematical-explorations-python`
**Platform:** GitHub with Binder/Colab integration

#### Advanced Notebooks:
1. `differential_geometry_geomstats.ipynb` - Full geomstats capabilities
2. `topological_data_analysis.ipynb` - Complete giotto-tda pipeline  
3. `harmonic_analysis_wavelets.ipynb` - Comprehensive PyWavelets
4. `algebraic_structures_sage.ipynb` - SageMath integration

## Technical Implementation

### Pyodide Integration Pattern:
```typescript
// components/interactive/MathInteractive.tsx
import { useEffect, useState } from 'react';

export function MathInteractive() {
  const [pyodide, setPyodide] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPyodide() {
      const pyodideInstance = await loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/"
      });
      
      await pyodideInstance.loadPackage(["numpy", "matplotlib"]);
      setPyodide(pyodideInstance);
      setLoading(false);
    }
    loadPyodide();
  }, []);

  return (
    <div className="math-interactive">
      {loading ? <LoadingSpinner /> : <PythonConsole pyodide={pyodide} />}
    </div>
  );
}
```

### Progressive Enhancement:
1. Static mathematical content loads immediately
2. Interactive components load asynchronously  
3. Full notebooks available via "Explore Further" links

## Educational Progression

### Beginner → Intermediate → Advanced
1. **Embedded demos** - Visual intuition building
2. **Guided notebooks** - Hands-on exploration  
3. **Research projects** - Open-ended investigation

## Performance Considerations

### Bundle Optimization:
- Lazy load mathematical packages
- Use CDN for Pyodide distribution
- Implement service worker caching
- Progressive web app capabilities

### User Experience:
- Loading progress indicators
- Graceful fallbacks for older browsers
- Mobile-responsive mathematical visualizations
