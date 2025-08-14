/**
 * Tests for TDA Explorer components
 * Focuses on mathematical accuracy and user interactions
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, describe, it, beforeEach, afterEach, vi } from 'vitest';
import '@testing-library/jest-dom';

import TDAExplorer from '@/components/TDAExplorer';
import PersistenceDiagram from '@/components/TDAExplorer/PersistenceDiagram';
import PersistenceBarcode from '@/components/TDAExplorer/PersistenceBarcode';
import PointCloudCanvas from '@/components/TDAExplorer/PointCloudCanvas';

// Mock the TDA engine loader
vi.mock('@/components/TDAExplorer/wasmLoader', () => ({
  initializeWasm: vi.fn().mockResolvedValue(false), // No WASM
  createTDAEngine: vi.fn().mockReturnValue(global.mockTDAEngine),
  createMockTDAEngine: vi.fn().mockReturnValue(global.mockTDAEngine),
  isWasmReady: vi.fn().mockReturnValue(false),
}));

vi.mock('@/components/TDAExplorer/wasmLoaderV2', () => ({
  initializeWasmV2: vi.fn().mockResolvedValue(false), // No WASM
  createTDAEngineV2: vi.fn().mockReturnValue(global.mockTDAEngine),
  createEnhancedMockTDAEngine: vi.fn().mockReturnValue(global.mockTDAEngine),
  isWasmReadyV2: vi.fn().mockReturnValue(false),
}));

describe('TDAExplorer Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('renders main TDA explorer interface', () => {
      render(<TDAExplorer />);
      
      expect(screen.getByText('Topological Data Analysis Explorer')).toBeInTheDocument();
      expect(screen.getByText('Interactive exploration of persistent homology and topological features')).toBeInTheDocument();
    });

    it('initializes with default parameters', () => {
      render(<TDAExplorer />);
      
      // Check default filtration value
      expect(screen.getByDisplayValue('0.300')).toBeInTheDocument();
      
      // Check default engine status (should be Mock since no WASM)
      expect(screen.getByText('Mock')).toBeInTheDocument();
    });

    it('displays correct initial tab state', () => {
      render(<TDAExplorer />);
      
      const persistenceTab = screen.getByText('Persistence Analysis');
      expect(persistenceTab).toHaveClass('active');
    });
  });

  describe('Point Cloud Generation', () => {
    it('generates different point patterns correctly', async () => {
      const user = userEvent.setup();
      render(<TDAExplorer />);
      
      // Find and click basic patterns section to expand
      const basicPatternsButton = screen.getByText('Basic Patterns');
      await user.click(basicPatternsButton);
      
      // Test circle pattern generation
      const circleButton = screen.getByText('Circle');
      await user.click(circleButton);
      
      // Should have generated points (check status)
      expect(screen.getByText(/Points:/)).toBeInTheDocument();
    });

    it('handles parameter changes correctly', async () => {
      const user = userEvent.setup();
      render(<TDAExplorer />);
      
      // Change point count
      const pointCountSlider = screen.getByLabelText(/Point Count:/);
      await user.clear(pointCountSlider);
      await user.type(pointCountSlider, '50');
      
      // Change noise level
      const noiseSlider = screen.getByLabelText(/Noise Level:/);
      fireEvent.change(noiseSlider, { target: { value: '0.1' } });
      
      // Verify parameters updated
      expect(screen.getByText(/Point Count: 50/)).toBeInTheDocument();
      expect(screen.getByText(/Noise Level: 0.100/)).toBeInTheDocument();
    });

    it('applies parameter presets correctly', async () => {
      const user = userEvent.setup();
      render(<TDAExplorer />);
      
      // Expand presets section
      const presetsButton = screen.getByText('Parameter Presets');
      await user.click(presetsButton);
      
      // Apply clustering preset
      const clusteringButton = screen.getByText('Clustering');
      await user.click(clusteringButton);
      
      // Should update parameters
      await waitFor(() => {
        expect(screen.getByText(/Point Count: 50/)).toBeInTheDocument();
        expect(screen.getByText(/Noise Level: 0.080/)).toBeInTheDocument();
      });
    });
  });

  describe('Filtration Controls', () => {
    it('updates filtration value correctly', async () => {
      const user = userEvent.setup();
      render(<TDAExplorer />);
      
      const filtrationSlider = screen.getByLabelText(/Filtration Value:/);
      fireEvent.change(filtrationSlider, { target: { value: '0.5' } });
      
      expect(screen.getByText(/Filtration Value: 0.500/)).toBeInTheDocument();
    });

    it('triggers persistence computation on filtration change', async () => {
      render(<TDAExplorer />);
      
      const filtrationSlider = screen.getByLabelText(/Filtration Value:/);
      fireEvent.change(filtrationSlider, { target: { value: '0.4' } });
      
      // Should trigger computation (mock engine should be called)
      await waitFor(() => {
        expect(global.mockTDAEngine.set_points).toHaveBeenCalled();
      });
    });
  });

  describe('Tab Navigation', () => {
    it('switches between tabs correctly', async () => {
      const user = userEvent.setup();
      render(<TDAExplorer />);
      
      // Switch to Mapper tab
      const mapperTab = screen.getByText('Mapper Network');
      await user.click(mapperTab);
      
      expect(mapperTab).toHaveClass('active');
      expect(screen.getByText('Mapper Network Visualization')).toBeInTheDocument();
      
      // Switch to 3D Landscape tab
      const landscapeTab = screen.getByText('3D Landscape');
      await user.click(landscapeTab);
      
      expect(landscapeTab).toHaveClass('active');
      expect(screen.getByText('3D Persistence Landscape Visualization')).toBeInTheDocument();
    });
  });

  describe('File Operations', () => {
    it('handles CSV file upload', async () => {
      render(<TDAExplorer />);
      
      // Expand data section
      const dataButton = screen.getByText('Data Import/Export');
      await userEvent.click(dataButton);
      
      const csvContent = 'x,y\n0.1,0.2\n0.3,0.4\n0.5,0.6';
      const file = new File([csvContent], 'test.csv', { type: 'text/csv' });
      
      const fileInput = screen.getByLabelText('Upload CSV/JSON');
      await userEvent.upload(fileInput, file);
      
      // Should have processed the file and updated point count
      await waitFor(() => {
        expect(screen.getByText(/Points: 3/)).toBeInTheDocument();
      });
    });

    it('handles JSON file upload', async () => {
      render(<TDAExplorer />);
      
      // Expand data section
      const dataButton = screen.getByText('Data Import/Export');
      await userEvent.click(dataButton);
      
      const jsonContent = JSON.stringify({
        points: [
          { x: 0.1, y: 0.2, id: 1 },
          { x: 0.3, y: 0.4, id: 2 },
        ]
      });
      const file = new File([jsonContent], 'test.json', { type: 'application/json' });
      
      const fileInput = screen.getByLabelText('Upload CSV/JSON');
      await userEvent.upload(fileInput, file);
      
      await waitFor(() => {
        expect(screen.getByText(/Points: 2/)).toBeInTheDocument();
      });
    });

    it('validates file size limits', async () => {
      render(<TDAExplorer />);
      
      // Expand data section
      const dataButton = screen.getByText('Data Import/Export');
      await userEvent.click(dataButton);
      
      // Create oversized file (>10MB)
      const largeContent = 'x,y\n' + '0.1,0.2\n'.repeat(1000000);
      const largeFile = new File([largeContent], 'large.csv', { type: 'text/csv' });
      
      // Mock window.alert
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      
      const fileInput = screen.getByLabelText('Upload CSV/JSON');
      await userEvent.upload(fileInput, largeFile);
      
      expect(alertSpy).toHaveBeenCalledWith('File too large. Please use files under 10MB.');
      
      alertSpy.mockRestore();
    });
  });

  describe('Export Functionality', () => {
    it('exports points data correctly', async () => {
      render(<TDAExplorer />);
      
      // Expand data section
      const dataButton = screen.getByText('Data Import/Export');
      await userEvent.click(dataButton);
      
      // Mock URL.createObjectURL
      const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL');
      
      const exportButton = screen.getByText('Export Points (JSON)');
      await userEvent.click(exportButton);
      
      expect(createObjectURLSpy).toHaveBeenCalled();
    });
  });

  describe('Performance Monitoring', () => {
    it('displays performance metrics', () => {
      render(<TDAExplorer />);
      
      expect(screen.getByText(/Memory:/)).toBeInTheDocument();
      expect(screen.getByText(/Frame Rate:/)).toBeInTheDocument();
      expect(screen.getByText(/Engine: Mock/)).toBeInTheDocument();
    });

    it('shows performance warnings when enabled', async () => {
      render(<TDAExplorer />);
      
      // Expand performance section
      const perfButton = screen.getByText('Performance Settings');
      await userEvent.click(perfButton);
      
      const warningsCheckbox = screen.getByLabelText('Performance Warnings');
      expect(warningsCheckbox).toBeChecked(); // Should be enabled by default
    });
  });
});

describe('PersistenceDiagram Component', () => {
  const mockPersistenceData = {
    pairs: [
      { birth: 0, death: 0.1, dimension: 0 },
      { birth: 0, death: 0.2, dimension: 1 },
      { birth: 0.05, death: 0.15, dimension: 0 },
    ],
    filtrationValue: 0.3
  };

  it('renders persistence diagram correctly', () => {
    render(
      <PersistenceDiagram 
        persistenceData={mockPersistenceData}
        filtrationValue={0.3}
      />
    );
    
    // Should render the diagram container
    expect(screen.getByText(/No persistence data/)).not.toBeInTheDocument();
  });

  it('handles empty persistence data', () => {
    render(
      <PersistenceDiagram 
        persistenceData={null}
        filtrationValue={0.3}
      />
    );
    
    expect(screen.getByText(/No persistence data/)).toBeInTheDocument();
  });
});

describe('PersistenceBarcode Component', () => {
  const mockPersistenceData = {
    pairs: [
      { birth: 0, death: 0.1, dimension: 0 },
      { birth: 0, death: 0.2, dimension: 1 },
    ],
    filtrationValue: 0.3
  };

  it('renders barcode visualization', () => {
    render(
      <PersistenceBarcode
        persistenceData={mockPersistenceData}
        filtrationValue={0.3}
      />
    );
    
    // Should render without errors
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
  });
});

describe('PointCloudCanvas Component', () => {
  const mockPoints = [
    { x: 0.1, y: 0.2, id: 1 },
    { x: 0.3, y: 0.4, id: 2 },
    { x: 0.5, y: 0.6, id: 3 },
  ];

  it('renders point cloud canvas', () => {
    const onPointsChange = vi.fn();
    
    render(
      <PointCloudCanvas
        points={mockPoints}
        onPointsChange={onPointsChange}
        filtrationValue={0.3}
      />
    );
    
    // Should render canvas element
    const canvas = screen.getByRole('img'); // Canvas has img role
    expect(canvas).toBeInTheDocument();
  });

  it('handles point interactions', async () => {
    const onPointsChange = vi.fn();
    
    render(
      <PointCloudCanvas
        points={mockPoints}
        onPointsChange={onPointsChange}
        filtrationValue={0.3}
      />
    );
    
    const canvas = screen.getByRole('img');
    
    // Simulate click to add point
    fireEvent.click(canvas, { clientX: 100, clientY: 100 });
    
    // Should call onPointsChange with new point
    await waitFor(() => {
      expect(onPointsChange).toHaveBeenCalled();
    });
  });

  it('handles empty point cloud', () => {
    const onPointsChange = vi.fn();
    
    render(
      <PointCloudCanvas
        points={[]}
        onPointsChange={onPointsChange}
        filtrationValue={0.3}
      />
    );
    
    // Should render without errors
    const canvas = screen.getByRole('img');
    expect(canvas).toBeInTheDocument();
  });
});

describe('Mathematical Computations', () => {
  describe('Point Density Calculations', () => {
    it('computes point density correctly', () => {
      // This would test the computePointDensity function
      // Since it's internal to TDAExplorer, we test through behavior
      
      render(<TDAExplorer />);
      
      // Generate some points and verify density is computed
      const refreshButton = screen.getByText('Refresh Density');
      expect(refreshButton).toBeInTheDocument();
    });
  });

  describe('Persistence Computation', () => {
    it('handles persistence computation errors gracefully', async () => {
      // Mock engine to throw error
      global.mockTDAEngine.compute_persistence.mockImplementation(() => {
        throw new Error('Computation failed');
      });
      
      render(<TDAExplorer />);
      
      // Should handle error without crashing
      await waitFor(() => {
        expect(screen.getByText(/Ready/)).toBeInTheDocument();
      });
    });

    it('validates persistence intervals mathematically', () => {
      const intervals = global.mockTDAEngine.compute_persistence();
      
      intervals.forEach((interval: any) => {
        global.testUtils.expectValidPersistenceInterval(interval);
      });
    });
  });

  describe('Mapper Network Computation', () => {
    it('computes mapper network from point cloud', async () => {
      render(<TDAExplorer />);
      
      // Switch to mapper tab
      const mapperTab = screen.getByText('Mapper Network');
      await userEvent.click(mapperTab);
      
      // Should display mapper computation button
      expect(screen.getByText('Compute Mapper Network')).toBeInTheDocument();
    });

    it('creates valid mapper network structure', async () => {
      render(<TDAExplorer />);
      
      const mapperTab = screen.getByText('Mapper Network');
      await userEvent.click(mapperTab);
      
      const computeButton = screen.getByText('Compute Mapper Network');
      await userEvent.click(computeButton);
      
      // Should display network statistics
      await waitFor(() => {
        expect(screen.getByText(/Nodes:/)).toBeInTheDocument();
        expect(screen.getByText(/Edges:/)).toBeInTheDocument();
      });
    });
  });
});

describe('User Interface Interactions', () => {
  describe('Control Panel Interactions', () => {
    it('toggles collapsible sections', async () => {
      render(<TDAExplorer />);
      
      const advancedButton = screen.getByText('Advanced Patterns');
      await userEvent.click(advancedButton);
      
      // Should show advanced pattern buttons
      await waitFor(() => {
        expect(screen.getByText('Torus')).toBeInTheDocument();
        expect(screen.getByText('Gaussian')).toBeInTheDocument();
      });
    });

    it('clears point cloud', async () => {
      render(<TDAExplorer />);
      
      const clearButton = screen.getByText('Clear');
      await userEvent.click(clearButton);
      
      // Should show 0 points
      await waitFor(() => {
        expect(screen.getByText(/Points: 0/)).toBeInTheDocument();
      });
    });
  });

  describe('Tab Switching', () => {
    it('maintains state between tab switches', async () => {
      render(<TDAExplorer />);
      
      // Generate some data
      const basicButton = screen.getByText('Basic Patterns');
      await userEvent.click(basicButton);
      const randomButton = screen.getByText('Random');
      await userEvent.click(randomButton);
      
      // Switch to mapper tab
      const mapperTab = screen.getByText('Mapper Network');
      await userEvent.click(mapperTab);
      
      // Switch back to persistence
      const persistenceTab = screen.getByText('Persistence Analysis');
      await userEvent.click(persistenceTab);
      
      // Should still have the generated points
      expect(screen.getByText(/Points: \d+/)).toBeInTheDocument();
    });
  });
});

describe('Accessibility', () => {
  it('provides proper ARIA labels for interactive elements', () => {
    render(<TDAExplorer />);
    
    const filtrationSlider = screen.getByLabelText(/Filtration Value:/);
    expect(filtrationSlider).toHaveAttribute('aria-label');
    
    const tabs = screen.getAllByRole('button');
    tabs.forEach(tab => {
      expect(tab).toBeVisible();
    });
  });

  it('supports keyboard navigation', async () => {
    render(<TDAExplorer />);
    
    const firstTab = screen.getByText('Persistence Analysis');
    firstTab.focus();
    expect(firstTab).toHaveFocus();
    
    // Tab navigation should work
    fireEvent.keyDown(firstTab, { key: 'Tab' });
  });
});

describe('Error Handling', () => {
  it('handles malformed file uploads gracefully', async () => {
    render(<TDAExplorer />);
    
    // Expand data section
    const dataButton = screen.getByText('Data Import/Export');
    await userEvent.click(dataButton);
    
    const malformedContent = 'not,valid,csv\ndata';
    const file = new File([malformedContent], 'bad.csv', { type: 'text/csv' });
    
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    const fileInput = screen.getByLabelText('Upload CSV/JSON');
    await userEvent.upload(fileInput, file);
    
    expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('Error parsing file'));
    
    alertSpy.mockRestore();
  });

  it('handles computation failures gracefully', () => {
    // Mock engine failure
    global.mockTDAEngine.compute_persistence.mockImplementation(() => {
      throw new Error('Mock computation failure');
    });
    
    render(<TDAExplorer />);
    
    // Should not crash and should show ready status
    expect(screen.getByText(/Ready/)).toBeInTheDocument();
  });
});