/**
 * Visual Test Setup Configuration
 * Enhanced setup for visual regression and mathematical visualization testing
 */

import '@testing-library/jest-dom';

// Mock ResizeObserver for visual tests
global.ResizeObserver = class ResizeObserver {
  constructor(cb) {
    this.cb = cb;
  }
  observe() {
    this.cb([{ borderBoxSize: { inlineSize: 0, blockSize: 0 } }], this);
  }
  unobserve() {}
  disconnect() {}
};

// Mock IntersectionObserver for visual tests
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Enhanced Canvas2D context for mathematical visualizations
const mockCanvas2DContext = {
  fillRect: jest.fn(),
  clearRect: jest.fn(),
  getImageData: jest.fn(() => ({ data: new Array(4) })),
  putImageData: jest.fn(),
  createImageData: jest.fn(() => ({ data: [] })),
  setTransform: jest.fn(),
  drawImage: jest.fn(),
  save: jest.fn(),
  fillText: jest.fn(),
  restore: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  closePath: jest.fn(),
  stroke: jest.fn(),
  fill: jest.fn(),
  arc: jest.fn(),
  scale: jest.fn(),
  rotate: jest.fn(),
  translate: jest.fn(),
  clip: jest.fn(),
  quadraticCurveTo: jest.fn(),
  bezierCurveTo: jest.fn(),
  arcTo: jest.fn(),
  isPointInPath: jest.fn(() => false),
  measureText: jest.fn(() => ({ width: 0 })),
  createLinearGradient: jest.fn(() => ({
    addColorStop: jest.fn()
  })),
  createRadialGradient: jest.fn(() => ({
    addColorStop: jest.fn()
  }))
};

// Mock HTMLCanvasElement for mathematical visualizations
HTMLCanvasElement.prototype.getContext = jest.fn((contextType) => {
  if (contextType === '2d') {
    return mockCanvas2DContext;
  }
  if (contextType === 'webgl' || contextType === 'experimental-webgl') {
    return {
      createShader: jest.fn(),
      shaderSource: jest.fn(),
      compileShader: jest.fn(),
      createProgram: jest.fn(),
      attachShader: jest.fn(),
      linkProgram: jest.fn(),
      useProgram: jest.fn(),
      createBuffer: jest.fn(),
      bindBuffer: jest.fn(),
      bufferData: jest.fn(),
      getAttribLocation: jest.fn(() => 0),
      enableVertexAttribArray: jest.fn(),
      vertexAttribPointer: jest.fn(),
      drawArrays: jest.fn(),
      clearColor: jest.fn(),
      clear: jest.fn(),
      viewport: jest.fn(),
      getUniformLocation: jest.fn(() => ({})),
      uniform2f: jest.fn(),
      uniform1f: jest.fn(),
      uniformMatrix4fv: jest.fn(),
      ARRAY_BUFFER: 34962,
      STATIC_DRAW: 35044,
      COLOR_BUFFER_BIT: 16384,
      VERTEX_SHADER: 35633,
      FRAGMENT_SHADER: 35632,
      TRIANGLES: 4,
      FLOAT: 5126
    };
  }
  return null;
});

// Mock canvas methods for visual testing
HTMLCanvasElement.prototype.toDataURL = jest.fn(() => 'data:image/png;base64,mock');
HTMLCanvasElement.prototype.getBoundingClientRect = jest.fn(() => ({
  top: 0,
  left: 0,
  right: 800,
  bottom: 600,
  width: 800,
  height: 600
}));

// Mock window.getComputedStyle for layout calculations
window.getComputedStyle = jest.fn(() => ({
  getPropertyValue: jest.fn(() => ''),
  width: '800px',
  height: '600px'
}));

// Mock requestAnimationFrame for animation testing
global.requestAnimationFrame = jest.fn(cb => setTimeout(cb, 16));
global.cancelAnimationFrame = jest.fn(id => clearTimeout(id));

// Mock performance.now for consistent timing in tests
const mockPerformanceNow = jest.fn(() => Date.now());
Object.defineProperty(global.performance, 'now', {
  value: mockPerformanceNow,
  writable: true
});

// Mock D3 selection methods for mathematical visualization tests
global.d3 = {
  select: jest.fn(() => ({
    selectAll: jest.fn(() => ({
      data: jest.fn(() => ({
        enter: jest.fn(() => ({
          append: jest.fn(() => ({
            attr: jest.fn(() => ({
              style: jest.fn()
            })),
            style: jest.fn()
          }))
        })),
        exit: jest.fn(() => ({
          remove: jest.fn()
        })),
        attr: jest.fn(),
        style: jest.fn(),
        text: jest.fn(),
        on: jest.fn()
      }))
    })),
    append: jest.fn(() => ({
      attr: jest.fn(),
      style: jest.fn()
    })),
    attr: jest.fn(),
    style: jest.fn(),
    on: jest.fn()
  })),
  scaleLinear: jest.fn(() => ({
    domain: jest.fn(() => ({
      range: jest.fn(() => (x => x))
    })),
    range: jest.fn(() => (x => x))
  })),
  scaleOrdinal: jest.fn(() => jest.fn()),
  extent: jest.fn(() => [0, 100]),
  max: jest.fn(() => 100),
  min: jest.fn(() => 0)
};

// Mock Three.js for 3D mathematical visualizations
global.THREE = {
  Scene: jest.fn(() => ({
    add: jest.fn(),
    remove: jest.fn()
  })),
  Camera: jest.fn(),
  PerspectiveCamera: jest.fn(() => ({
    position: { set: jest.fn() },
    lookAt: jest.fn()
  })),
  WebGLRenderer: jest.fn(() => ({
    setSize: jest.fn(),
    render: jest.fn(),
    domElement: document.createElement('canvas')
  })),
  Mesh: jest.fn(() => ({
    position: { set: jest.fn() },
    rotation: { set: jest.fn() }
  })),
  SphereGeometry: jest.fn(),
  MeshBasicMaterial: jest.fn(),
  Vector3: jest.fn(() => ({
    set: jest.fn(),
    add: jest.fn(),
    normalize: jest.fn()
  })),
  Color: jest.fn()
};

// Mock KaTeX for LaTeX rendering tests
global.katex = {
  render: jest.fn((tex, element, options) => {
    element.innerHTML = `<span class="katex-mock">${tex}</span>`;
  }),
  renderToString: jest.fn((tex, options) => `<span class="katex-mock">${tex}</span>`)
};

// Mathematical test utilities
global.MathTestUtils = {
  // Generate test mathematical expressions
  generateTestExpressions: () => [
    '\\frac{1}{2}',
    '\\sum_{i=1}^{n} x_i',
    '\\int_{0}^{1} f(x) dx',
    '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}'
  ],
  
  // Create mock point cloud data for TDA tests
  generatePointCloud: (size = 10, dimensions = 2) => {
    return Array(size).fill(null).map(() => 
      Array(dimensions).fill(null).map(() => Math.random() * 10)
    );
  },
  
  // Create test group structure for group theory tests
  createTestGroup: (order = 4) => ({
    id: `C${order}`,
    name: `Cyclic Group C${order}`,
    order,
    elements: Array(order).fill(null).map((_, i) => ({
      id: i === 0 ? 'e' : `g${i}`,
      label: i === 0 ? 'e' : `g^${i}`,
      order: i === 0 ? 1 : order
    })),
    isAbelian: true
  }),
  
  // Visual comparison utilities
  compareCanvasImages: jest.fn(() => ({ match: true, difference: 0 })),
  
  // Performance measurement utilities
  measureRenderTime: jest.fn(async (renderFn) => {
    const start = performance.now();
    await renderFn();
    return performance.now() - start;
  })
};

// Enhanced error handling for visual tests
const originalConsoleError = console.error;
console.error = (...args) => {
  // Filter out known visual test warnings
  const message = args[0];
  if (typeof message === 'string') {
    if (message.includes('Warning: ReactDOM.render is deprecated') ||
        message.includes('Warning: componentWillMount has been renamed') ||
        message.includes('canvas.getContext') ||
        message.includes('ResizeObserver loop')) {
      return; // Suppress known visual test warnings
    }
  }
  originalConsoleError.apply(console, args);
};

// Set up global test environment variables
process.env.NODE_ENV = 'test';
process.env.VISUAL_TESTING = 'true';

// Configure test timeouts for visual operations
jest.setTimeout(10000); // 10 seconds for visual tests