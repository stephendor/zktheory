/**
 * Visualization Rendering Performance Tests
 * Tests canvas, SVG, WebGL rendering performance and interaction responsiveness
 */

import { VisualizationPerformanceBenchmark } from '../utils/performanceBenchmark';

// Mock DOM environment for testing
const createMockCanvas = (width: number = 800, height: number = 600): HTMLCanvasElement => {
  const canvas = {
    width,
    height,
    getContext: jest.fn(),
    getBoundingClientRect: () => ({ left: 0, top: 0, width, height })
  } as unknown as HTMLCanvasElement;

  return canvas;
};

const createMock2DContext = (): CanvasRenderingContext2D => {
  return {
    clearRect: jest.fn(),
    fillRect: jest.fn(),
    strokeRect: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn(),
    stroke: jest.fn(),
    beginPath: jest.fn(),
    closePath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    translate: jest.fn(),
    scale: jest.fn(),
    rotate: jest.fn(),
    setTransform: jest.fn(),
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    font: '12px Arial',
    textAlign: 'start',
    textBaseline: 'alphabetic'
  } as unknown as CanvasRenderingContext2D;
};

const createMockWebGLContext = (): WebGLRenderingContext => {
  return {
    clear: jest.fn(),
    clearColor: jest.fn(),
    enable: jest.fn(),
    disable: jest.fn(),
    viewport: jest.fn(),
    createShader: jest.fn(() => ({})),
    createProgram: jest.fn(() => ({})),
    attachShader: jest.fn(),
    linkProgram: jest.fn(),
    useProgram: jest.fn(),
    createBuffer: jest.fn(() => ({})),
    bindBuffer: jest.fn(),
    bufferData: jest.fn(),
    getAttribLocation: jest.fn(() => 0),
    enableVertexAttribArray: jest.fn(),
    vertexAttribPointer: jest.fn(),
    drawArrays: jest.fn(),
    drawElements: jest.fn(),
    COLOR_BUFFER_BIT: 16384,
    DEPTH_BUFFER_BIT: 256,
    ARRAY_BUFFER: 34962,
    STATIC_DRAW: 35044,
    TRIANGLES: 4
  } as unknown as WebGLRenderingContext;
};

const createMockSVGElement = (): SVGElement => {
  const children: any[] = [];
  return {
    appendChild: jest.fn((child) => children.push(child)),
    removeChild: jest.fn((child) => {
      const index = children.indexOf(child);
      if (index > -1) children.splice(index, 1);
    }),
    get firstChild() { return children[0] || null; },
    children: children,
    setAttribute: jest.fn(),
    getAttribute: jest.fn(),
    style: {},
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 800, height: 600 })
  } as unknown as SVGElement;
};

describe('Visualization Rendering Performance', () => {
  let visualBenchmark: VisualizationPerformanceBenchmark;

  beforeEach(() => {
    visualBenchmark = new VisualizationPerformanceBenchmark();
  });

  afterEach(() => {
    visualBenchmark.reset();
  });

  describe('Canvas 2D Rendering Performance', () => {
    test('should benchmark simple shapes rendering', async () => {
      const canvas = createMockCanvas();
      const ctx = createMock2DContext();
      canvas.getContext = jest.fn(() => ctx);

      const renderSimpleShapes = (context: CanvasRenderingContext2D) => {
        // Draw rectangles
        for (let i = 0; i < 100; i++) {
          context.fillStyle = `hsl(${i * 3.6}, 70%, 50%)`;
          context.fillRect(i * 5, i * 3, 20, 20);
        }

        // Draw circles
        for (let i = 0; i < 50; i++) {
          context.beginPath();
          context.arc(i * 10, 200, 10, 0, Math.PI * 2);
          context.fill();
        }
      };

      const result = await visualBenchmark.benchmarkCanvasRendering(
        canvas,
        renderSimpleShapes,
        30
      );

      expect(result.operation).toBe('canvas_rendering');
      expect(result.executionTime).toBeGreaterThan(0);
      expect(result.executionTime).toBeLessThan(100); // Should render simple shapes quickly
      expect(result.iterations).toBe(30);

      // Verify canvas methods were called
      expect(ctx.clearRect).toHaveBeenCalled();
      expect(ctx.fillRect).toHaveBeenCalled();
      expect(ctx.arc).toHaveBeenCalled();

      console.log(`Canvas 2D simple shapes: ${result.executionTime.toFixed(2)}ms`);
    });

    test('should benchmark complex mathematical visualization', async () => {
      const canvas = createMockCanvas();
      const ctx = createMock2DContext();
      canvas.getContext = jest.fn(() => ctx);

      const renderMathVisualization = (context: CanvasRenderingContext2D) => {
        // Simulate rendering a complex mathematical graph
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const scale = 100;

        // Draw function: sin(x) * cos(y)
        for (let x = -4; x <= 4; x += 0.1) {
          for (let y = -3; y <= 3; y += 0.1) {
            const value = Math.sin(x) * Math.cos(y);
            const intensity = Math.abs(value);
            
            context.fillStyle = `rgba(255, 0, 0, ${intensity})`;
            context.fillRect(
              centerX + x * scale,
              centerY + y * scale,
              2, 2
            );
          }
        }

        // Draw axes
        context.strokeStyle = '#000';
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(0, centerY);
        context.lineTo(canvas.width, centerY);
        context.moveTo(centerX, 0);
        context.lineTo(centerX, canvas.height);
        context.stroke();
      };

      const result = await visualBenchmark.benchmarkCanvasRendering(
        canvas,
        renderMathVisualization,
        10 // Fewer iterations for complex rendering
      );

      expect(result.executionTime).toBeGreaterThan(0);
      expect(result.executionTime).toBeLessThan(500); // Complex visualization should still be reasonable

      console.log(`Canvas 2D complex math visualization: ${result.executionTime.toFixed(2)}ms`);
    });

    test('should benchmark graph rendering performance', async () => {
      const canvas = createMockCanvas();
      const ctx = createMock2DContext();
      canvas.getContext = jest.fn(() => ctx);

      const renderGraph = (context: CanvasRenderingContext2D) => {
        // Simulate Cayley graph rendering
        const nodeCount = 20;
        const nodes = [];
        
        // Generate nodes
        for (let i = 0; i < nodeCount; i++) {
          nodes.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            id: i
          });
        }

        // Draw edges
        context.strokeStyle = '#666';
        context.lineWidth = 1;
        for (let i = 0; i < nodeCount; i++) {
          for (let j = i + 1; j < nodeCount; j++) {
            if (Math.random() < 0.3) { // 30% connection probability
              context.beginPath();
              context.moveTo(nodes[i].x, nodes[i].y);
              context.lineTo(nodes[j].x, nodes[j].y);
              context.stroke();
            }
          }
        }

        // Draw nodes
        context.fillStyle = '#007acc';
        for (const node of nodes) {
          context.beginPath();
          context.arc(node.x, node.y, 8, 0, Math.PI * 2);
          context.fill();
          
          // Node labels
          context.fillStyle = '#fff';
          context.font = '12px Arial';
          context.textAlign = 'center';
          context.fillText(node.id.toString(), node.x, node.y + 4);
          context.fillStyle = '#007acc';
        }
      };

      const result = await visualBenchmark.benchmarkCanvasRendering(
        canvas,
        renderGraph,
        20
      );

      expect(result.executionTime).toBeLessThan(200); // Graph rendering should be efficient

      console.log(`Canvas 2D graph rendering: ${result.executionTime.toFixed(2)}ms`);
    });
  });

  describe('WebGL Rendering Performance', () => {
    test('should benchmark WebGL rendering setup', async () => {
      const canvas = createMockCanvas();
      const gl = createMockWebGLContext();
      canvas.getContext = jest.fn(() => gl);

      const renderWebGL = (context: WebGLRenderingContext) => {
        // Simulate 3D rendering setup
        context.clearColor(0.0, 0.0, 0.0, 1.0);
        context.enable(context.DEPTH_TEST);
        
        // Simulate buffer operations
        const buffer = context.createBuffer();
        context.bindBuffer(context.ARRAY_BUFFER, buffer);
        
        // Simulate vertex data
        const vertices = new Float32Array([
          -1.0, -1.0, 0.0,
           1.0, -1.0, 0.0,
           0.0,  1.0, 0.0
        ]);
        context.bufferData(context.ARRAY_BUFFER, vertices, context.STATIC_DRAW);
        
        // Simulate drawing
        context.drawArrays(context.TRIANGLES, 0, 3);
      };

      const result = await visualBenchmark.benchmarkWebGLRendering(
        canvas,
        renderWebGL,
        50
      );

      expect(result.operation).toBe('webgl_rendering');
      expect(result.executionTime).toBeGreaterThan(0);
      expect(result.executionTime).toBeLessThan(50); // WebGL should be fast

      // Verify WebGL methods were called
      expect(gl.clear).toHaveBeenCalled();
      expect(gl.clearColor).toHaveBeenCalled();
      expect(gl.drawArrays).toHaveBeenCalled();

      console.log(`WebGL rendering: ${result.executionTime.toFixed(2)}ms`);
    });

    test('should benchmark 3D mathematical surface rendering', async () => {
      const canvas = createMockCanvas();
      const gl = createMockWebGLContext();
      canvas.getContext = jest.fn(() => gl);

      const render3DSurface = (context: WebGLRenderingContext) => {
        // Simulate rendering a mathematical surface z = sin(x) * cos(y)
        const resolution = 50;
        const vertices = [];
        
        for (let i = 0; i < resolution; i++) {
          for (let j = 0; j < resolution; j++) {
            const x = (i / resolution - 0.5) * 4;
            const y = (j / resolution - 0.5) * 4;
            const z = Math.sin(x) * Math.cos(y);
            
            vertices.push(x, y, z);
          }
        }

        const buffer = context.createBuffer();
        context.bindBuffer(context.ARRAY_BUFFER, buffer);
        context.bufferData(context.ARRAY_BUFFER, new Float32Array(vertices), context.STATIC_DRAW);
        
        // Simulate multiple draw calls for surface triangulation
        for (let i = 0; i < resolution - 1; i++) {
          context.drawArrays(context.TRIANGLES, i * 6, 6);
        }
      };

      const result = await visualBenchmark.benchmarkWebGLRendering(
        canvas,
        render3DSurface,
        20
      );

      expect(result.executionTime).toBeLessThan(100); // 3D surface should render efficiently

      console.log(`WebGL 3D mathematical surface: ${result.executionTime.toFixed(2)}ms`);
    });
  });

  describe('SVG Rendering Performance', () => {
    test('should benchmark SVG mathematical notation rendering', async () => {
      const svg = createMockSVGElement();

      const renderMathNotation = () => {
        // Simulate rendering mathematical notation in SVG
        const equations = [
          'x² + y² = r²',
          '∫f(x)dx = F(x) + C',
          'Σ(i=1 to n) i = n(n+1)/2',
          '∇²φ = 0',
          'e^(iπ) + 1 = 0'
        ];

        equations.forEach((equation, index) => {
          const textElement = {
            textContent: equation,
            setAttribute: jest.fn()
          };
          svg.appendChild(textElement);
        });

        // Add mathematical symbols
        for (let i = 0; i < 20; i++) {
          const symbol = {
            setAttribute: jest.fn(),
            textContent: ['∞', '∂', '∇', '∫', '∑', '∏'][i % 6]
          };
          svg.appendChild(symbol);
        }
      };

      const result = await visualBenchmark.benchmarkSVGRendering(
        svg,
        renderMathNotation,
        40
      );

      expect(result.operation).toBe('svg_rendering');
      expect(result.executionTime).toBeGreaterThan(0);
      expect(result.executionTime).toBeLessThan(100); // SVG text should render quickly

      console.log(`SVG mathematical notation: ${result.executionTime.toFixed(2)}ms`);
    });

    test('should benchmark SVG graph visualization', async () => {
      const svg = createMockSVGElement();

      const renderSVGGraph = () => {
        // Simulate rendering a graph in SVG
        const nodeCount = 15;
        const nodes = [];

        // Create nodes
        for (let i = 0; i < nodeCount; i++) {
          const circle = {
            setAttribute: jest.fn(),
            style: {}
          };
          nodes.push({
            element: circle,
            x: Math.random() * 400 + 50,
            y: Math.random() * 300 + 50
          });
          svg.appendChild(circle);
        }

        // Create edges
        const edgeCount = nodeCount * 2;
        for (let i = 0; i < edgeCount; i++) {
          const line = {
            setAttribute: jest.fn(),
            style: {}
          };
          svg.appendChild(line);
        }

        // Add labels
        for (let i = 0; i < nodeCount; i++) {
          const text = {
            setAttribute: jest.fn(),
            textContent: `v${i}`
          };
          svg.appendChild(text);
        }
      };

      const result = await visualBenchmark.benchmarkSVGRendering(
        svg,
        renderSVGGraph,
        25
      );

      expect(result.executionTime).toBeLessThan(150); // SVG graph should render reasonably fast

      console.log(`SVG graph visualization: ${result.executionTime.toFixed(2)}ms`);
    });

    test('should benchmark complex SVG mathematical diagrams', async () => {
      const svg = createMockSVGElement();

      const renderComplexDiagram = () => {
        // Simulate rendering a complex mathematical diagram
        
        // Create coordinate system
        const axes = ['x-axis', 'y-axis'];
        axes.forEach(axis => {
          const line = { setAttribute: jest.fn() };
          svg.appendChild(line);
        });

        // Create grid lines
        for (let i = 0; i < 20; i++) {
          const gridLine = { setAttribute: jest.fn() };
          svg.appendChild(gridLine);
        }

        // Create function curves
        const functions = ['sin', 'cos', 'tan', 'exp'];
        functions.forEach(func => {
          const path = { setAttribute: jest.fn() };
          svg.appendChild(path);
        });

        // Add mathematical annotations
        for (let i = 0; i < 10; i++) {
          const annotation = {
            setAttribute: jest.fn(),
            textContent: `f(${i}) = ${Math.sin(i).toFixed(2)}`
          };
          svg.appendChild(annotation);
        }

        // Add geometric shapes
        const shapes = ['rect', 'circle', 'ellipse', 'polygon'];
        shapes.forEach(shape => {
          for (let i = 0; i < 5; i++) {
            const element = { setAttribute: jest.fn() };
            svg.appendChild(element);
          }
        });
      };

      const result = await visualBenchmark.benchmarkSVGRendering(
        svg,
        renderComplexDiagram,
        15
      );

      expect(result.executionTime).toBeLessThan(300); // Complex diagrams may take longer

      console.log(`SVG complex mathematical diagram: ${result.executionTime.toFixed(2)}ms`);
    });
  });

  describe('Rendering Performance Comparison', () => {
    test('should compare Canvas vs SVG performance for similar content', async () => {
      const canvas = createMockCanvas();
      const ctx = createMock2DContext();
      canvas.getContext = jest.fn(() => ctx);
      
      const svg = createMockSVGElement();

      // Canvas rendering
      const canvasResult = await visualBenchmark.benchmarkCanvasRendering(
        canvas,
        (context) => {
          for (let i = 0; i < 100; i++) {
            context.beginPath();
            context.arc(i * 5, i * 3, 3, 0, Math.PI * 2);
            context.fill();
          }
        },
        30
      );

      // SVG rendering  
      const svgResult = await visualBenchmark.benchmarkSVGRendering(
        svg,
        () => {
          for (let i = 0; i < 100; i++) {
            const circle = { setAttribute: jest.fn() };
            svg.appendChild(circle);
          }
        },
        30
      );

      expect(canvasResult.executionTime).toBeGreaterThan(0);
      expect(svgResult.executionTime).toBeGreaterThan(0);

      const ratio = svgResult.executionTime / canvasResult.executionTime;
      
      console.log(`Canvas vs SVG Performance Comparison:`);
      console.log(`  Canvas: ${canvasResult.executionTime.toFixed(2)}ms`);
      console.log(`  SVG: ${svgResult.executionTime.toFixed(2)}ms`);
      console.log(`  Ratio (SVG/Canvas): ${ratio.toFixed(2)}x`);

      // Both should complete in reasonable time
      expect(canvasResult.executionTime).toBeLessThan(200);
      expect(svgResult.executionTime).toBeLessThan(200);
    });
  });

  describe('Interactive Performance', () => {
    test('should benchmark rendering responsiveness', async () => {
      const canvas = createMockCanvas();
      const ctx = createMock2DContext();
      canvas.getContext = jest.fn(() => ctx);

      // Simulate interactive rendering (e.g., mouse hover effects)
      const interactiveRender = (context: CanvasRenderingContext2D) => {
        // Redraw with highlight effects
        for (let i = 0; i < 50; i++) {
          const isHighlighted = Math.random() < 0.1; // 10% highlighted
          
          context.fillStyle = isHighlighted ? '#ff6b6b' : '#4ecdc4';
          context.beginPath();
          context.arc(i * 10, 100, isHighlighted ? 6 : 4, 0, Math.PI * 2);
          context.fill();
          
          if (isHighlighted) {
            context.strokeStyle = '#fff';
            context.lineWidth = 2;
            context.stroke();
          }
        }
      };

      const result = await visualBenchmark.benchmarkCanvasRendering(
        canvas,
        interactiveRender,
        100 // More iterations to test responsiveness
      );

      // Interactive rendering should be very fast (<16ms for 60fps)
      expect(result.executionTime).toBeLessThan(16);

      console.log(`Interactive rendering performance: ${result.executionTime.toFixed(2)}ms (60fps = 16.67ms)`);
    });
  });

  describe('Performance Scaling', () => {
    test('should benchmark rendering performance with increasing complexity', async () => {
      const canvas = createMockCanvas();
      const ctx = createMock2DContext();
      canvas.getContext = jest.fn(() => ctx);

      const complexities = [10, 50, 100, 200, 500];
      const results = [];

      for (const complexity of complexities) {
        const result = await visualBenchmark.benchmarkCanvasRendering(
          canvas,
          (context) => {
            for (let i = 0; i < complexity; i++) {
              context.fillStyle = `hsl(${i}, 70%, 50%)`;
              context.fillRect(i % 20 * 10, Math.floor(i / 20) * 10, 8, 8);
            }
          },
          20
        );

        results.push({
          complexity,
          time: result.executionTime
        });

        console.log(`Complexity ${complexity}: ${result.executionTime.toFixed(2)}ms`);
      }

      // Performance should scale roughly linearly with complexity
      const firstResult = results[0];
      const lastResult = results[results.length - 1];
      const scalingFactor = lastResult.time / firstResult.time;
      const complexityFactor = lastResult.complexity / firstResult.complexity;

      // Scaling should be better than quadratic
      expect(scalingFactor).toBeLessThan(Math.pow(complexityFactor, 2));

      console.log(`Scaling factor: ${scalingFactor.toFixed(2)}x for ${complexityFactor}x complexity increase`);
    });
  });
});