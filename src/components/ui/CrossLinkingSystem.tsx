/**
 * Cross-Linking Visual Language Component
 * Contextual bridges between sections with audience awareness
 * Mathematical connections with visual pathways
 */

'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { 
  ArrowPathIcon, 
  LinkIcon, 
  AcademicCapIcon, 
  BriefcaseIcon, 
  CodeBracketIcon,
  EyeIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

// ==========================================
// Constants & Mathematical Configuration
// ==========================================

const GOLDEN_RATIO = (1 + Math.sqrt(5)) / 2; // φ ≈ 1.618
const FIBONACCI_SEQUENCE = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89];

// Audience-specific visual languages
const AUDIENCE_THEMES = {
  business: {
    name: 'Business Leaders',
    icon: BriefcaseIcon,
    color: '#10b981', // emerald-500
    accent: '#047857', // emerald-700
    pattern: 'growth-charts',
    language: 'roi-focused',
    visualStyle: {
      primary: '#10b981',
      secondary: '#6ee7b7',
      background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
      borderStyle: 'solid',
      iconStyle: 'filled'
    }
  },
  technical: {
    name: 'Technical Developers',
    icon: CodeBracketIcon,
    color: '#3b82f6', // blue-500
    accent: '#1d4ed8', // blue-700
    pattern: 'circuit-board',
    language: 'implementation-focused',
    visualStyle: {
      primary: '#3b82f6',
      secondary: '#93c5fd',
      background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
      borderStyle: 'dashed',
      iconStyle: 'outlined'
    }
  },
  academic: {
    name: 'Academic Researchers',
    icon: AcademicCapIcon,
    color: '#8b5cf6', // violet-500
    accent: '#7c3aed', // violet-600
    pattern: 'mathematical-notation',
    language: 'theory-focused',
    visualStyle: {
      primary: '#8b5cf6',
      secondary: '#c4b5fd',
      background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
      borderStyle: 'double',
      iconStyle: 'mathematical'
    }
  }
} as const;

// Connection types with mathematical relationships
const CONNECTION_TYPES = {
  prerequisite: {
    name: 'Prerequisite',
    symbol: '⊆',
    description: 'Required foundation knowledge',
    visualStyle: 'solid-arrow',
    strength: 1.0
  },
  related: {
    name: 'Related Concept',
    symbol: '↔',
    description: 'Bidirectional relationship',
    visualStyle: 'bidirectional-arrow',
    strength: 0.8
  },
  application: {
    name: 'Applied In',
    symbol: '→',
    description: 'Practical implementation',
    visualStyle: 'curved-arrow',
    strength: 0.9
  },
  extension: {
    name: 'Extends To',
    symbol: '⊇',
    description: 'Advanced continuation',
    visualStyle: 'dotted-arrow',
    strength: 0.7
  },
  analogy: {
    name: 'Similar To',
    symbol: '≈',
    description: 'Conceptual similarity',
    visualStyle: 'wavy-line',
    strength: 0.6
  }
} as const;

// ==========================================
// Types
// ==========================================

interface ContentSection {
  id: string;
  title: string;
  type: 'concept' | 'application' | 'theory' | 'tool';
  audience: Array<keyof typeof AUDIENCE_THEMES>;
  complexity: number;
  prerequisites: string[];
  connections: Array<{
    targetId: string;
    type: keyof typeof CONNECTION_TYPES;
    strength: number;
    context?: string;
  }>;
  tags: string[];
  description: string;
  estimatedTime: string;
}

interface CrossLinkProps {
  sections: ContentSection[];
  currentSection: string;
  targetAudience?: keyof typeof AUDIENCE_THEMES;
  onSectionChange?: (sectionId: string) => void;
  onConnectionHover?: (connection: any) => void;
  showAllConnections?: boolean;
  maxConnections?: number;
  visualDensity?: 'minimal' | 'normal' | 'rich';
  className?: string;
}

interface ConnectionVisualizerProps {
  source: ContentSection;
  target: ContentSection;
  connectionType: keyof typeof CONNECTION_TYPES;
  audience: keyof typeof AUDIENCE_THEMES;
  strength: number;
  isActive?: boolean;
  isHovered?: boolean;
  onHover?: (isHovered: boolean) => void;
  onClick?: () => void;
}

// ==========================================
// Connection Path Generator
// ==========================================

const generateConnectionPath = (
  start: { x: number; y: number },
  end: { x: number; y: number },
  type: keyof typeof CONNECTION_TYPES,
  curvature = 0.3
) => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // Control points based on connection type
  const midX = start.x + dx / 2;
  const midY = start.y + dy / 2;
  
  switch (type) {
    case 'prerequisite':
      // Straight line with slight curve
      return `M ${start.x} ${start.y} Q ${midX} ${midY - distance * curvature} ${end.x} ${end.y}`;
    
    case 'related':
      // S-curve for bidirectional
      const cp1X = start.x + dx * 0.3;
      const cp1Y = start.y - distance * curvature;
      const cp2X = end.x - dx * 0.3;
      const cp2Y = end.y + distance * curvature;
      return `M ${start.x} ${start.y} C ${cp1X} ${cp1Y} ${cp2X} ${cp2Y} ${end.x} ${end.y}`;
    
    case 'application':
      // Curved arrow
      return `M ${start.x} ${start.y} Q ${midX + distance * curvature} ${midY} ${end.x} ${end.y}`;
    
    case 'extension':
      // Gentle arc
      return `M ${start.x} ${start.y} Q ${midX} ${midY + distance * curvature * 0.5} ${end.x} ${end.y}`;
    
    case 'analogy':
      // Wavy line
      const waves = Math.floor(distance / 50);
      let path = `M ${start.x} ${start.y}`;
      for (let i = 1; i <= waves; i++) {
        const t = i / waves;
        const x = start.x + dx * t;
        const y = start.y + dy * t + Math.sin(t * Math.PI * 2) * 20;
        path += ` L ${x} ${y}`;
      }
      path += ` L ${end.x} ${end.y}`;
      return path;
    
    default:
      return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
  }
};

// ==========================================
// Connection Visualizer Component
// ==========================================

const ConnectionVisualizer: React.FC<ConnectionVisualizerProps> = ({
  source,
  target,
  connectionType,
  audience,
  strength,
  isActive = false,
  isHovered = false,
  onHover,
  onClick
}) => {
  const connectionDef = CONNECTION_TYPES[connectionType];
  const audienceTheme = AUDIENCE_THEMES[audience];
  
  // Calculate positions (simplified for demo)
  const sourcePos = { x: 100, y: 100 };
  const targetPos = { x: 300, y: 200 };
  
  const pathData = generateConnectionPath(sourcePos, targetPos, connectionType);
  
  return (
    <g
      className="connection-group cursor-pointer"
      onMouseEnter={() => onHover?.(true)}
      onMouseLeave={() => onHover?.(false)}
      onClick={onClick}
    >
      {/* Connection Path */}
      <motion.path
        d={pathData}
        fill="none"
        stroke={audienceTheme.color}
        strokeWidth={isActive ? 3 : isHovered ? 2.5 : 2}
        strokeOpacity={strength}
        strokeDasharray={connectionDef.visualStyle === 'dotted-arrow' ? '5,5' : undefined}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: 'easeInOut' }}
      />
      
      {/* Connection Label */}
      <motion.text
        x={(sourcePos.x + targetPos.x) / 2}
        y={(sourcePos.y + targetPos.y) / 2 - 10}
        textAnchor="middle"
        className="text-xs font-medium"
        fill={audienceTheme.color}
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0.7 }}
      >
        {connectionDef.symbol}
      </motion.text>
    </g>
  );
};

// ==========================================
// Section Preview Card Component
// ==========================================

const SectionPreviewCard: React.FC<{
  section: ContentSection;
  audience: keyof typeof AUDIENCE_THEMES;
  isConnected?: boolean;
  connectionType?: keyof typeof CONNECTION_TYPES;
  onHover?: (isHovered: boolean) => void;
  onClick?: () => void;
}> = ({
  section,
  audience,
  isConnected = false,
  connectionType,
  onHover,
  onClick
}) => {
  const audienceTheme = AUDIENCE_THEMES[audience];
  const connectionDef = connectionType ? CONNECTION_TYPES[connectionType] : null;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="relative bg-white rounded-lg border-2 p-4 cursor-pointer"
      style={{
        borderColor: audienceTheme.color,
        borderStyle: audienceTheme.visualStyle.borderStyle,
        background: isHovered ? audienceTheme.visualStyle.background : 'white'
      }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onMouseEnter={() => {
        setIsHovered(true);
        onHover?.(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        onHover?.(false);
      }}
      onClick={onClick}
    >
      {/* Connection Badge */}
      {isConnected && connectionDef && (
        <div 
          className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
          style={{ backgroundColor: audienceTheme.color }}
        >
          {connectionDef.symbol}
        </div>
      )}

      {/* Section Header */}
      <div className="flex items-center space-x-3 mb-3">
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
          style={{ backgroundColor: audienceTheme.color }}
        >
          <audienceTheme.icon className="w-5 h-5" />
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-sm">{section.title}</h3>
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <span>Complexity: {section.complexity}/5</span>
            <span>•</span>
            <span>{section.estimatedTime}</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
        {section.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-3">
        {section.tags.slice(0, 3).map(tag => (
          <span 
            key={tag}
            className="px-2 py-1 text-xs rounded-full"
            style={{ 
              backgroundColor: `${audienceTheme.color}20`,
              color: audienceTheme.accent
            }}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Prerequisites */}
      {section.prerequisites.length > 0 && (
        <div className="text-xs text-gray-500 mb-2">
          <span className="font-medium">Prerequisites:</span> {section.prerequisites.length}
        </div>
      )}

      {/* Connection Context */}
      {connectionDef && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-2 text-xs">
            <ArrowPathIcon className="w-3 h-3" style={{ color: audienceTheme.color }} />
            <span style={{ color: audienceTheme.color }}>{connectionDef.description}</span>
          </div>
        </div>
      )}

      {/* Hover Action */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute inset-x-4 bottom-4 flex items-center justify-between"
          >
            <div className="flex items-center space-x-2 text-xs" style={{ color: audienceTheme.color }}>
              <EyeIcon className="w-4 h-4" />
              <span>Preview content</span>
            </div>
            <ChevronRightIcon className="w-4 h-4" style={{ color: audienceTheme.color }} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ==========================================
// Main Cross-Linking System Component
// ==========================================

export const CrossLinkingSystem: React.FC<CrossLinkProps> = ({
  sections,
  currentSection,
  targetAudience = 'business',
  onSectionChange,
  onConnectionHover,
  showAllConnections = false,
  maxConnections = 6,
  visualDensity = 'normal',
  className = ''
}) => {
  const prefersReducedMotion = useReducedMotion();
  
  // ==========================================
  // State Management
  // ==========================================
  
  const [hoveredConnection, setHoveredConnection] = useState<string | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<keyof typeof CONNECTION_TYPES | 'all'>('all');

  // ==========================================
  // Current Section Data
  // ==========================================
  
  const currentSectionData = useMemo(() => 
    sections.find(s => s.id === currentSection),
    [sections, currentSection]
  );

  // ==========================================
  // Connected Sections
  // ==========================================
  
  const connectedSections = useMemo(() => {
    if (!currentSectionData) return [];
    
    let connections = currentSectionData.connections;
    
    // Filter by connection type if specified
    if (filterType !== 'all') {
      connections = connections.filter(conn => conn.type === filterType);
    }
    
    // Sort by strength and limit
    connections = connections
      .sort((a, b) => b.strength - a.strength)
      .slice(0, maxConnections);
    
    // Map to full section data
    return connections.map(conn => {
      const targetSection = sections.find(s => s.id === conn.targetId);
      return targetSection ? {
        section: targetSection,
        connection: conn
      } : null;
    }).filter(Boolean);
  }, [currentSectionData, sections, filterType, maxConnections]);

  // ==========================================
  // Audience-Filtered Sections
  // ==========================================
  
  const audienceRelevantSections = useMemo(() => {
    return connectedSections.filter((item): item is NonNullable<typeof item> => 
      item !== null && item.section?.audience.includes(targetAudience)
    );
  }, [connectedSections, targetAudience]);

  // ==========================================
  // Event Handlers
  // ==========================================
  
  const handleSectionClick = useCallback((sectionId: string) => {
    onSectionChange?.(sectionId);
  }, [onSectionChange]);

  const handleConnectionHover = useCallback((connectionId: string, isHovered: boolean) => {
    setHoveredConnection(isHovered ? connectionId : null);
    
    const connectionData = connectedSections.find((item) => 
      item?.connection.targetId === connectionId
    );
    
    if (connectionData) {
      onConnectionHover?.(isHovered ? connectionData : null);
    }
  }, [connectedSections, onConnectionHover]);

  // ==========================================
  // Render Functions
  // ==========================================
  
  const renderConnectionFilters = () => (
    <div className="flex items-center space-x-2 mb-6">
      <span className="text-sm font-medium text-gray-700">Show connections:</span>
      
      <div className="flex space-x-1">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1 text-xs rounded-full transition-colors ${
            filterType === 'all'
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        
        {Object.entries(CONNECTION_TYPES).map(([type, def]) => (
          <button
            key={type}
            onClick={() => setFilterType(type as keyof typeof CONNECTION_TYPES)}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              filterType === type
                ? `text-white`
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            style={{
              backgroundColor: filterType === type ? AUDIENCE_THEMES[targetAudience].color : undefined
            }}
          >
            {def.symbol} {def.name}
          </button>
        ))}
      </div>
    </div>
  );

  const renderAudienceSelector = () => (
    <div className="flex items-center space-x-2 mb-4">
      <span className="text-sm font-medium text-gray-700">Perspective:</span>
      
      <div className="flex space-x-1">
        {Object.entries(AUDIENCE_THEMES).map(([key, theme]) => {
          const isSelected = targetAudience === key;
          const Icon = theme.icon;
          
          return (
            <button
              key={key}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                isSelected
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={{
                backgroundColor: isSelected ? theme.color : undefined
              }}
            >
              <Icon className="w-4 h-4" />
              <span>{theme.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  // ==========================================
  // Main Render
  // ==========================================
  
  return (
    <div className={`cross-linking-system ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Related Content
        </h2>
        <p className="text-sm text-gray-600">
          Explore mathematical connections from your current perspective
        </p>
      </div>

      {/* Controls */}
      {renderAudienceSelector()}
      {renderConnectionFilters()}

      {/* Current Section Context */}
      {currentSectionData && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-3 mb-2">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
              style={{ backgroundColor: AUDIENCE_THEMES[targetAudience].color }}
            >
              <LinkIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{currentSectionData.title}</h3>
              <p className="text-xs text-gray-500">
                {currentSectionData.connections.length} connections • 
                Complexity {currentSectionData.complexity}/5
              </p>
            </div>
          </div>
          
          <p className="text-sm text-gray-600">
            {currentSectionData.description}
          </p>
        </div>
      )}

      {/* Connected Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {audienceRelevantSections.map(({ section, connection }) => (
          <SectionPreviewCard
            key={section.id}
            section={section}
            audience={targetAudience}
            isConnected
            connectionType={connection.type}
            onHover={(isHovered) => handleConnectionHover(section.id, isHovered)}
            onClick={() => handleSectionClick(section.id)}
          />
        ))}
      </div>

      {/* Empty State */}
      {audienceRelevantSections.length === 0 && (
        <div className="text-center py-12">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: `${AUDIENCE_THEMES[targetAudience].color}20` }}
          >
            <LinkIcon className="w-8 h-8" style={{ color: AUDIENCE_THEMES[targetAudience].color }} />
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No connections found
          </h3>
          
          <p className="text-sm text-gray-600 max-w-md mx-auto">
            Try adjusting the connection type filter or explore a different section 
            to discover mathematical relationships.
          </p>
        </div>
      )}

      {/* Mathematical Context Panel */}
      <AnimatePresence>
        {hoveredConnection && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-6 right-6 bg-white rounded-xl shadow-xl border border-gray-200 p-4 z-50"
          >
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                style={{ backgroundColor: AUDIENCE_THEMES[targetAudience].color }}
              >
                <ArrowPathIcon className="w-5 h-5" />
              </div>
              
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">Mathematical Connection</h4>
                <p className="text-sm text-gray-600">
                  Hover over connections to see their mathematical relationships
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Accessibility Information */}
      <div className="sr-only">
        <p>
          Cross-linking system showing {audienceRelevantSections.length} related sections 
          from {targetAudience} perspective. Current section: {currentSectionData?.title}. 
          Filter: {filterType === 'all' ? 'All connection types' : CONNECTION_TYPES[filterType as keyof typeof CONNECTION_TYPES]?.name}.
        </p>
      </div>
    </div>
  );
};

export default CrossLinkingSystem;