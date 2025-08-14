'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

// Mathematical interaction types
export interface Point2D {
  x: number;
  y: number;
}

export interface MathGesture {
  type: 'pan' | 'zoom' | 'rotate' | 'pinch' | 'tap' | 'draw';
  startPoint: Point2D;
  currentPoint: Point2D;
  delta: Point2D;
  scale?: number;
  rotation?: number;
  velocity?: Point2D;
}

export interface MathBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZoom?: number;
  maxZoom?: number;
}

// Direct manipulation of mathematical objects
export const useMathematicalDrag = (
  onDrag?: (point: Point2D, gesture: MathGesture) => void,
  bounds?: Partial<MathBounds>
) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Point2D>({ x: 0, y: 0 });
  const [dragCurrent, setDragCurrent] = useState<Point2D>({ x: 0, y: 0 });
  const [velocity, setVelocity] = useState<Point2D>({ x: 0, y: 0 });
  
  const lastPosition = useRef<Point2D>({ x: 0, y: 0 });
  const lastTime = useRef<number>(0);

  const constrainPoint = useCallback((point: Point2D): Point2D => {
    if (!bounds) return point;
    
    return {
      x: bounds.minX !== undefined && bounds.maxX !== undefined 
        ? Math.max(bounds.minX, Math.min(bounds.maxX, point.x))
        : point.x,
      y: bounds.minY !== undefined && bounds.maxY !== undefined
        ? Math.max(bounds.minY, Math.min(bounds.maxY, point.y))
        : point.y,
    };
  }, [bounds]);

  const calculateVelocity = useCallback((current: Point2D, timestamp: number) => {
    const deltaTime = timestamp - lastTime.current;
    if (deltaTime === 0) return { x: 0, y: 0 };
    
    const deltaX = current.x - lastPosition.current.x;
    const deltaY = current.y - lastPosition.current.y;
    
    return {
      x: deltaX / deltaTime,
      y: deltaY / deltaTime,
    };
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const point = { x: e.clientX, y: e.clientY };
    const constrainedPoint = constrainPoint(point);
    
    setIsDragging(true);
    setDragStart(constrainedPoint);
    setDragCurrent(constrainedPoint);
    
    lastPosition.current = constrainedPoint;
    lastTime.current = Date.now();
  }, [constrainPoint]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const point = { x: e.clientX, y: e.clientY };
    const constrainedPoint = constrainPoint(point);
    const timestamp = Date.now();
    
    setDragCurrent(constrainedPoint);
    
    const currentVelocity = calculateVelocity(constrainedPoint, timestamp);
    setVelocity(currentVelocity);
    
    if (onDrag) {
      const gesture: MathGesture = {
        type: 'pan',
        startPoint: dragStart,
        currentPoint: constrainedPoint,
        delta: {
          x: constrainedPoint.x - dragStart.x,
          y: constrainedPoint.y - dragStart.y,
        },
        velocity: currentVelocity,
      };
      
      onDrag(constrainedPoint, gesture);
    }
    
    lastPosition.current = constrainedPoint;
    lastTime.current = timestamp;
  }, [isDragging, dragStart, constrainPoint, calculateVelocity, onDrag]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const dragHandlers = {
    onMouseDown: handleMouseDown,
    onMouseMove: handleMouseMove,
    onMouseUp: handleMouseUp,
    onMouseLeave: handleMouseUp,
  };

  return {
    isDragging,
    dragStart,
    dragCurrent,
    dragDelta: {
      x: dragCurrent.x - dragStart.x,
      y: dragCurrent.y - dragStart.y,
    },
    velocity,
    dragHandlers,
  };
};

// Zoom and pan for mathematical visualizations
export const useMathematicalZoomPan = (
  initialZoom: number = 1,
  initialPan: Point2D = { x: 0, y: 0 },
  bounds?: Partial<MathBounds>
) => {
  const [zoom, setZoom] = useState(initialZoom);
  const [pan, setPan] = useState(initialPan);
  const [isInteracting, setIsInteracting] = useState(false);
  
  const elementRef = useRef<HTMLElement>(null);

  const constrainZoom = useCallback((newZoom: number): number => {
    if (!bounds) return newZoom;
    
    const minZoom = bounds.minZoom ?? 0.1;
    const maxZoom = bounds.maxZoom ?? 10;
    
    return Math.max(minZoom, Math.min(maxZoom, newZoom));
  }, [bounds]);

  const constrainPan = useCallback((newPan: Point2D, currentZoom: number): Point2D => {
    if (!bounds || !elementRef.current) return newPan;
    
    // Calculate bounds based on zoom level
    const element = elementRef.current;
    const rect = element.getBoundingClientRect();
    
    const maxPanX = (rect.width * (currentZoom - 1)) / 2;
    const maxPanY = (rect.height * (currentZoom - 1)) / 2;
    
    return {
      x: Math.max(-maxPanX, Math.min(maxPanX, newPan.x)),
      y: Math.max(-maxPanY, Math.min(maxPanY, newPan.y)),
    };
  }, [bounds]);

  const zoomIn = useCallback((factor: number = 1.5, center?: Point2D) => {
    setZoom((prevZoom) => {
      const newZoom = constrainZoom(prevZoom * factor);
      
      // If center is provided, adjust pan to zoom towards that point
      if (center) {
        setPan((prevPan) => {
          const zoomDelta = newZoom / prevZoom - 1;
          const newPan = {
            x: prevPan.x - center.x * zoomDelta,
            y: prevPan.y - center.y * zoomDelta,
          };
          return constrainPan(newPan, newZoom);
        });
      }
      
      return newZoom;
    });
  }, [constrainZoom, constrainPan]);

  const zoomOut = useCallback((factor: number = 1.5, center?: Point2D) => {
    zoomIn(1 / factor, center);
  }, [zoomIn]);

  const zoomTo = useCallback((newZoom: number, center?: Point2D) => {
    const constrainedZoom = constrainZoom(newZoom);
    setZoom(constrainedZoom);
    
    if (center) {
      setPan((prevPan) => {
        const zoomRatio = constrainedZoom / zoom;
        const newPan = {
          x: center.x + (prevPan.x - center.x) * zoomRatio,
          y: center.y + (prevPan.y - center.y) * zoomRatio,
        };
        return constrainPan(newPan, constrainedZoom);
      });
    }
  }, [constrainZoom, constrainPan, zoom]);

  const panBy = useCallback((delta: Point2D) => {
    setPan((prevPan) => {
      const newPan = {
        x: prevPan.x + delta.x,
        y: prevPan.y + delta.y,
      };
      return constrainPan(newPan, zoom);
    });
  }, [constrainPan, zoom]);

  const panTo = useCallback((newPan: Point2D) => {
    setPan(constrainPan(newPan, zoom));
  }, [constrainPan, zoom]);

  const resetView = useCallback(() => {
    setZoom(initialZoom);
    setPan(initialPan);
  }, [initialZoom, initialPan]);

  // Handle wheel events for zooming
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    
    const delta = e.deltaY;
    const zoomFactor = delta > 0 ? 0.9 : 1.1;
    
    // Get mouse position relative to element
    const rect = elementRef.current?.getBoundingClientRect();
    if (rect) {
      const center = {
        x: e.clientX - rect.left - rect.width / 2,
        y: e.clientY - rect.top - rect.height / 2,
      };
      
      if (delta > 0) {
        zoomOut(1 / zoomFactor, center);
      } else {
        zoomIn(zoomFactor, center);
      }
    }
  }, [zoomIn, zoomOut]);

  // Handle touch events for pinch-to-zoom
  const [touches, setTouches] = useState<TouchList | null>(null);
  const [initialDistance, setInitialDistance] = useState(0);
  const [touchInitialZoom, setTouchInitialZoom] = useState(1);

  const getTouchDistance = useCallback((touches: TouchList): number => {
    if (touches.length < 2) return 0;
    
    const touch1 = touches[0];
    const touch2 = touches[1];
    
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  }, []);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2) {
      setTouches(e.touches);
      setInitialDistance(getTouchDistance(e.touches));
      setTouchInitialZoom(zoom);
      setIsInteracting(true);
    }
  }, [getTouchDistance, zoom]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2 && touches && initialDistance > 0) {
      e.preventDefault();
      
      const currentDistance = getTouchDistance(e.touches);
      const scale = currentDistance / initialDistance;
      const newZoom = constrainZoom(touchInitialZoom * scale);
      
      setZoom(newZoom);
    }
  }, [touches, initialDistance, touchInitialZoom, getTouchDistance, constrainZoom]);

  const handleTouchEnd = useCallback(() => {
    setTouches(null);
    setInitialDistance(0);
    setIsInteracting(false);
  }, []);

  // Set up event listeners
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('wheel', handleWheel, { passive: false });
    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('wheel', handleWheel);
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleWheel, handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Generate transform string
  const transform = `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`;

  return {
    zoom,
    pan,
    isInteracting,
    elementRef,
    transform,
    zoomIn,
    zoomOut,
    zoomTo,
    panBy,
    panTo,
    resetView,
    // Convenience methods
    zoomToFit: () => zoomTo(1, { x: 0, y: 0 }),
    center: () => panTo({ x: 0, y: 0 }),
  };
};

// Mathematical selection and manipulation
export const useMathematicalSelection = <T>(
  items: T[],
  multiSelect: boolean = false
) => {
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number>(-1);

  const selectItem = useCallback((index: number, ctrlKey?: boolean, shiftKey?: boolean) => {
    if (index < 0 || index >= items.length) return;

    setSelectedItems((prev) => {
      const newSelection = new Set(prev);

      if (multiSelect && shiftKey && lastSelectedIndex >= 0) {
        // Range selection
        const start = Math.min(lastSelectedIndex, index);
        const end = Math.max(lastSelectedIndex, index);
        for (let i = start; i <= end; i++) {
          newSelection.add(i);
        }
      } else if (multiSelect && ctrlKey) {
        // Toggle selection
        if (newSelection.has(index)) {
          newSelection.delete(index);
        } else {
          newSelection.add(index);
        }
      } else {
        // Single selection
        newSelection.clear();
        newSelection.add(index);
      }

      return newSelection;
    });

    setLastSelectedIndex(index);
  }, [items.length, multiSelect, lastSelectedIndex]);

  const clearSelection = useCallback(() => {
    setSelectedItems(new Set());
    setLastSelectedIndex(-1);
  }, []);

  const selectAll = useCallback(() => {
    if (!multiSelect) return;
    setSelectedItems(new Set(items.map((_, index) => index)));
  }, [items, multiSelect]);

  const isSelected = useCallback((index: number) => {
    return selectedItems.has(index);
  }, [selectedItems]);

  const getSelectedItems = useCallback(() => {
    return Array.from(selectedItems).map(index => items[index]);
  }, [selectedItems, items]);

  return {
    selectedIndices: Array.from(selectedItems),
    selectedItems: getSelectedItems(),
    selectItem,
    clearSelection,
    selectAll,
    isSelected,
    hasSelection: selectedItems.size > 0,
    selectionCount: selectedItems.size,
  };
};

// Mathematical formula parsing and manipulation
export const useMathematicalFormula = (
  initialFormula: string = '',
  onFormulaChange?: (formula: string, isValid: boolean) => void
) => {
  const [formula, setFormula] = useState(initialFormula);
  const [isValid, setIsValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [variables, setVariables] = useState<Set<string>>(new Set());
  const [functions, setFunctions] = useState<Set<string>>(new Set());

  // Simple formula parsing (in a real implementation, this would use a proper math parser)
  const parseFormula = useCallback((formula: string) => {
    try {
      // Extract variables (single letters)
      const variableMatches = formula.match(/[a-zA-Z](?![a-zA-Z])/g) || [];
      const extractedVariables = new Set(variableMatches);
      
      // Extract functions (word followed by parentheses)
      const functionMatches = formula.match(/[a-zA-Z]+(?=\()/g) || [];
      const extractedFunctions = new Set(functionMatches);
      
      // Basic validation (simplified)
      const hasBalancedParentheses = (formula.match(/\(/g) || []).length === (formula.match(/\)/g) || []).length;
      const hasValidCharacters = /^[a-zA-Z0-9+\-*/^().=<>\s]*$/.test(formula);
      
      const formulaIsValid = hasBalancedParentheses && hasValidCharacters;
      
      setVariables(extractedVariables);
      setFunctions(extractedFunctions);
      setIsValid(formulaIsValid);
      setErrorMessage(formulaIsValid ? '' : 'Invalid formula syntax');
      
      if (onFormulaChange) {
        onFormulaChange(formula, formulaIsValid);
      }
      
      return {
        isValid: formulaIsValid,
        variables: extractedVariables,
        functions: extractedFunctions,
        errorMessage: formulaIsValid ? '' : 'Invalid formula syntax',
      };
    } catch (error) {
      setIsValid(false);
      setErrorMessage('Formula parsing error');
      return {
        isValid: false,
        variables: new Set<string>(),
        functions: new Set<string>(),
        errorMessage: 'Formula parsing error',
      };
    }
  }, [onFormulaChange]);

  const updateFormula = useCallback((newFormula: string) => {
    setFormula(newFormula);
    parseFormula(newFormula);
  }, [parseFormula]);

  const insertSymbol = useCallback((symbol: string, position?: number) => {
    setFormula((prev) => {
      const pos = position !== undefined ? position : prev.length;
      const newFormula = prev.slice(0, pos) + symbol + prev.slice(pos);
      parseFormula(newFormula);
      return newFormula;
    });
  }, [parseFormula]);

  const replaceVariable = useCallback((oldVar: string, newVar: string) => {
    const newFormula = formula.replace(new RegExp(`\\b${oldVar}\\b`, 'g'), newVar);
    updateFormula(newFormula);
  }, [formula, updateFormula]);

  // Initialize parsing on mount
  useEffect(() => {
    if (initialFormula) {
      parseFormula(initialFormula);
    }
  }, [initialFormula, parseFormula]);

  return {
    formula,
    isValid,
    errorMessage,
    variables: Array.from(variables),
    functions: Array.from(functions),
    updateFormula,
    insertSymbol,
    replaceVariable,
    clear: () => updateFormula(''),
  };
};

export default {
  useMathematicalDrag,
  useMathematicalZoomPan,
  useMathematicalSelection,
  useMathematicalFormula,
};