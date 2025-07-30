import React, { useState, useCallback } from 'react';

interface CayleyGraphProps {
  className?: string;
}

interface GroupConfig {
  groupType: 'SymmetricGroup' | 'DihedralGroup' | 'AlternatingGroup';
  parameter: number;
  generators: string;
}

interface GraphData {
  vertices: Array<{ id: string; x: number; y: number; label: string; color: string }>;
  edges: Array<{ source: string; target: string; color: string }>;
}

export const CayleyGraphExplorer: React.FC<CayleyGraphProps> = ({ className = '' }) => {
  const [config, setConfig] = useState<GroupConfig>({
    groupType: 'SymmetricGroup',
    parameter: 3,
    generators: '(1,2), (1,2,3)'
  });
  
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubgroup, setSelectedSubgroup] = useState<string>('None');
  const [cosetType, setCosetType] = useState<'None' | 'Left' | 'Right'>('None');
  const [showCenter, setShowCenter] = useState(false);

  // Mock data for S3 as an example
  const generateMockS3Graph = useCallback((): GraphData => {
    // Arrange vertices in a hexagonal pattern, scaled for SVG coordinates
    const vertices = [
      { id: 'e', x: 300, y: 200, label: 'e', color: '#3498db' },
      { id: '(1,2)', x: 450, y: 150, label: '(1,2)', color: '#e74c3c' },
      { id: '(1,3)', x: 450, y: 250, label: '(1,3)', color: '#e74c3c' },
      { id: '(2,3)', x: 300, y: 300, label: '(2,3)', color: '#e74c3c' },
      { id: '(1,2,3)', x: 150, y: 250, label: '(1,2,3)', color: '#27ae60' },
      { id: '(1,3,2)', x: 150, y: 150, label: '(1,3,2)', color: '#27ae60' }
    ];

    const edges = [
      { source: 'e', target: '(1,2)', color: '#e74c3c' },
      { source: 'e', target: '(1,2,3)', color: '#27ae60' },
      { source: '(1,2)', target: '(2,3)', color: '#e74c3c' },
      { source: '(1,2)', target: '(1,3,2)', color: '#27ae60' },
      { source: '(1,3)', target: '(2,3)', color: '#27ae60' },
      { source: '(1,3)', target: 'e', color: '#e74c3c' },
      { source: '(2,3)', target: '(1,3)', color: '#e74c3c' },
      { source: '(2,3)', target: '(1,2,3)', color: '#27ae60' },
      { source: '(1,2,3)', target: '(1,3,2)', color: '#e74c3c' },
      { source: '(1,2,3)', target: '(1,3)', color: '#27ae60' },
      { source: '(1,3,2)', target: '(1,2)', color: '#27ae60' },
      { source: '(1,3,2)', target: '(2,3)', color: '#e74c3c' }
    ];

    return { vertices, edges };
  }, []);

  const generateGraph = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For now, we'll generate mock data for S3
      if (config.groupType === 'SymmetricGroup' && config.parameter === 3) {
        const mockData = generateMockS3Graph();
        setGraphData(mockData);
      } else {
        setError(`Graph generation for ${config.groupType} with parameter ${config.parameter} is not yet implemented. This would require a SageMath backend.`);
      }
    } catch (err) {
      setError('Failed to generate graph');
    } finally {
      setIsLoading(false);
    }
  }, [config, generateMockS3Graph]);

  const getVertexColor = (vertex: GraphData['vertices'][0]) => {
    if (showCenter && vertex.id === 'e') {
      return '#f39c12'; // Orange for center
    }
    
    if (selectedSubgroup === 'identity' && vertex.id === 'e') {
      return '#9b59b6'; // Purple for selected subgroup
    }
    
    if (selectedSubgroup === 'transposition' && ['e', '(1,2)'].includes(vertex.id)) {
      return '#9b59b6';
    }
    
    if (selectedSubgroup === 'cycle' && ['e', '(1,2,3)', '(1,3,2)'].includes(vertex.id)) {
      return '#9b59b6';
    }
    
    return vertex.color;
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Interactive Cayley Graph Explorer</h3>
        
        {/* Configuration Panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Group Type
            </label>
            <select
              value={config.groupType}
              onChange={(e) => setConfig(prev => ({ 
                ...prev, 
                groupType: e.target.value as GroupConfig['groupType'] 
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="SymmetricGroup">Symmetric Group</option>
              <option value="DihedralGroup">Dihedral Group</option>
              <option value="AlternatingGroup">Alternating Group</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Parameter (n)
            </label>
            <input
              type="number"
              min="2"
              max="6"
              value={config.parameter}
              onChange={(e) => setConfig(prev => ({ 
                ...prev, 
                parameter: parseInt(e.target.value) || 2 
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Generators
            </label>
            <input
              type="text"
              value={config.generators}
              onChange={(e) => setConfig(prev => ({ 
                ...prev, 
                generators: e.target.value 
              }))}
              placeholder="e.g., (1,2), (1,2,3)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <button
          onClick={generateGraph}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-md transition-colors"
        >
          {isLoading ? 'Generating...' : 'Generate Cayley Graph'}
        </button>
      </div>

      {/* Graph Display */}
      <div className="mb-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
            {error}
          </div>
        )}
        
        {graphData && (
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h4 className="text-lg font-semibold mb-4 text-center">
              Cayley Graph for {config.groupType} S₃
            </h4>
            <div className="flex justify-center">
              <svg width="600" height="400" viewBox="0 0 600 400" className="border rounded-lg bg-white">
                {/* Edges */}
                {graphData.edges.map((edge, index) => {
                  const sourceVertex = graphData.vertices.find(v => v.id === edge.source);
                  const targetVertex = graphData.vertices.find(v => v.id === edge.target);
                  
                  if (!sourceVertex || !targetVertex) return null;
                  
                  return (
                    <line
                      key={`edge-${index}`}
                      x1={sourceVertex.x}
                      y1={sourceVertex.y}
                      x2={targetVertex.x}
                      y2={targetVertex.y}
                      stroke={edge.color}
                      strokeWidth="2"
                      opacity="0.7"
                    />
                  );
                })}
                
                {/* Vertices */}
                {graphData.vertices.map((vertex) => (
                  <g key={vertex.id}>
                    <circle
                      cx={vertex.x}
                      cy={vertex.y}
                      r="25"
                      fill={getVertexColor(vertex)}
                      stroke="#2c3e50"
                      strokeWidth="2"
                    />
                    <text
                      x={vertex.x}
                      y={vertex.y + 5}
                      textAnchor="middle"
                      fontSize="12"
                      fontFamily="Arial, sans-serif"
                      fill="white"
                      fontWeight="bold"
                    >
                      {vertex.label}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
            
            {/* Legend */}
            <div className="mt-4 flex justify-center">
              <div className="bg-white rounded-lg p-3 border text-sm">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
                    <span>Identity</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                    <span>Transpositions</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                    <span>3-cycles</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {!graphData && !isLoading && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p>Click "Generate Cayley Graph" to create a visualization</p>
          </div>
        )}
        
        {isLoading && (
          <div className="border border-gray-200 rounded-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Generating Cayley graph...</p>
          </div>
        )}
      </div>

      {/* Highlighting Controls */}
      {graphData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Highlight Subgroup
            </label>
            <select
              value={selectedSubgroup}
              onChange={(e) => setSelectedSubgroup(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="None">None</option>
              <option value="identity">⟨e⟩ (Trivial)</option>
              <option value="transposition">⟨(1,2)⟩ (Order 2)</option>
              <option value="cycle">⟨(1,2,3)⟩ (Order 3)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Coset Type
            </label>
            <select
              value={cosetType}
              onChange={(e) => setCosetType(e.target.value as typeof cosetType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={selectedSubgroup === 'None'}
            >
              <option value="None">None</option>
              <option value="Left">Left Cosets</option>
              <option value="Right">Right Cosets</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => setShowCenter(!showCenter)}
              className={`px-4 py-2 rounded-md transition-colors ${
                showCenter 
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              {showCenter ? 'Hide Center' : 'Show Center'}
            </button>
          </div>
        </div>
      )}

      {/* Information Panel */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-800 mb-2">About This Tool</h4>
        <p className="text-sm text-gray-600 mb-2">
          This is a demonstration interface for the Cayley Graph Explorer. Currently showing S₃ (Symmetric Group of degree 3) with generators (1,2) and (1,2,3).
        </p>
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>Red edges:</strong> Generated by transposition (1,2)</p>
          <p><strong>Green edges:</strong> Generated by 3-cycle (1,2,3)</p>
          <p><strong>Purple highlighting:</strong> Selected subgroup elements</p>
          <p><strong>Orange highlighting:</strong> Group center (identity element)</p>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          <strong>Note:</strong> Full functionality with arbitrary groups requires a SageMath backend. 
          The original Jupyter notebook provides complete interactive capabilities for all supported group types.
        </p>
      </div>
    </div>
  );
};

export default CayleyGraphExplorer;
