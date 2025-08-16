/**
 * Universal Complexity Provider
 * Context provider for managing mathematical complexity progression state
 * with golden ratio calculations, persistence, and accessibility features
 */

'use client';

import React, { 
  createContext, 
  useContext, 
  useReducer, 
  useEffect, 
  useMemo, 
  useCallback, 
  useRef 
} from 'react';
import type {
  ComplexityLevel,
  ComplexityState,
  ComplexityContextValue,
  ComplexityProviderProps,
  ComplexityLevelId,
  ComplexityValue,
  ComplexityPreferences,
  ComplexityInteraction,
  StorageData,
  GOLDEN_RATIO,
  FIBONACCI_SEQUENCE
} from './types';

// ==========================================
// Default Complexity Levels
// ==========================================

const DEFAULT_COMPLEXITY_LEVELS: ComplexityLevel[] = [
  {
    id: 'foundation',
    emoji: '🌱',
    label: 'Foundation',
    value: 0,
    mathComplexity: 1, // φ^0
    description: 'Simple geometry and basic mathematical concepts with visual explanations',
    mathLevel: 'Basic algebra and arithmetic',
    estimatedTime: '5-10 minutes',
    color: {
      primary: '#10b981', // emerald-500
      secondary: '#34d399', // emerald-400
      text: '#065f46', // emerald-800
      background: '#d1fae5' // emerald-100
    },
    prerequisites: [],
    fibonacciIndex: 0,
    objectives: [
      'Understand basic mathematical notation',
      'Recognize geometric patterns',
      'Apply fundamental arithmetic operations'
    ],
    difficulty: 2
  },
  {
    id: 'conceptual',
    emoji: '🌿',
    label: 'Conceptual',
    value: 1,
    mathComplexity: 1.618, // φ^1
    description: 'Core mathematical principles with pattern emergence and relationships',
    mathLevel: 'Linear algebra and basic calculus',
    estimatedTime: '15-25 minutes',
    color: {
      primary: '#059669', // emerald-600
      secondary: '#10b981', // emerald-500
      text: '#064e3b', // emerald-900
      background: '#a7f3d0' // emerald-200
    },
    prerequisites: ['foundation'],
    fibonacciIndex: 1,
    objectives: [
      'Grasp abstract mathematical concepts',
      'Identify patterns and relationships',
      'Apply linear transformations'
    ],
    difficulty: 4
  },
  {
    id: 'applied',
    emoji: '🌳',
    label: 'Applied',
    value: 2,
    mathComplexity: 2.618, // φ^2
    description: 'Complex systems and practical implementations in real-world contexts',
    mathLevel: 'Advanced calculus and abstract algebra',
    estimatedTime: '30-45 minutes',
    color: {
      primary: '#047857', // emerald-700
      secondary: '#059669', // emerald-600
      text: '#022c22', // emerald-950
      background: '#6ee7b7' // emerald-300
    },
    prerequisites: ['foundation', 'conceptual'],
    fibonacciIndex: 2,
    objectives: [
      'Solve complex mathematical problems',
      'Apply theory to practical situations',
      'Understand system interactions'
    ],
    difficulty: 7
  },
  {
    id: 'research',
    emoji: '🎓',
    label: 'Research',
    value: 3,
    mathComplexity: 4.236, // φ^3
    description: 'Cutting-edge theory and ongoing mathematical research frontiers',
    mathLevel: 'Graduate-level mathematics and beyond',
    estimatedTime: '60+ minutes',
    color: {
      primary: '#065f46', // emerald-800
      secondary: '#047857', // emerald-700
      text: '#022c22', // emerald-950
      background: '#34d399' // emerald-400
    },
    prerequisites: ['foundation', 'conceptual', 'applied'],
    fibonacciIndex: 3,
    objectives: [
      'Engage with current research',
      'Formulate original hypotheses',
      'Contribute to mathematical knowledge'
    ],
    difficulty: 10
  }
];

// ==========================================
// Default Preferences
// ==========================================

const DEFAULT_PREFERENCES: ComplexityPreferences = {
  rememberLastLevel: true,
  autoAdvance: false,
  showMathDetails: true,
  showTimeEstimates: true,
  showPrerequisiteWarnings: true,
  animationSpeed: 'normal',
  highContrast: false,
  reducedMotion: false
};

// ==========================================
// Storage Management
// ==========================================

const STORAGE_KEY = 'zktheory_complexity_state';
const STORAGE_VERSION = '1.0.0';

const saveToStorage = (state: ComplexityState): void => {
  try {
    const data: StorageData = {
      version: STORAGE_VERSION,
      timestamp: Date.now(),
      state,
      checksum: generateChecksum(state)
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save complexity state to localStorage:', error);
  }
};

const loadFromStorage = (): ComplexityState | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const data: StorageData = JSON.parse(stored);
    
    // Verify version compatibility
    if (data.version !== STORAGE_VERSION) {
      console.warn('Complexity state version mismatch, resetting to defaults');
      return null;
    }

    // Verify data integrity
    if (generateChecksum(data.state) !== data.checksum) {
      console.warn('Complexity state checksum mismatch, resetting to defaults');
      return null;
    }

    return data.state;
  } catch (error) {
    console.warn('Failed to load complexity state from localStorage:', error);
    return null;
  }
};

const generateChecksum = (state: ComplexityState): string => {
  // Simple checksum for data integrity
  const str = JSON.stringify({
    currentLevel: state.currentLevel.id,
    unlockedLevels: state.unlockedLevels,
    progress: state.progress,
    preferences: state.preferences
  });
  
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return hash.toString(36);
};

// ==========================================
// State Reducer
// ==========================================

type ComplexityAction = 
  | { type: 'SET_LEVEL'; payload: ComplexityLevelId }
  | { type: 'ADVANCE_LEVEL' }
  | { type: 'RESET_PROGRESS' }
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<ComplexityPreferences> }
  | { type: 'MARK_LEVEL_COMPLETE'; payload: ComplexityLevelId }
  | { type: 'TRACK_INTERACTION'; payload: Omit<ComplexityInteraction, 'timestamp'> }
  | { type: 'UPDATE_TIME_SPENT'; payload: { level: ComplexityLevelId; time: number } }
  | { type: 'HYDRATE_STATE'; payload: ComplexityState };

const complexityReducer = (state: ComplexityState, action: ComplexityAction): ComplexityState => {
  switch (action.type) {
    case 'SET_LEVEL': {
      const newLevel = state.availableLevels.find(level => level.id === action.payload);
      if (!newLevel) return state;

      return {
        ...state,
        currentLevel: newLevel,
        session: {
          ...state.session,
          interactions: [
            ...state.session.interactions,
            {
              timestamp: Date.now(),
              type: 'level_change',
              fromLevel: state.currentLevel.id,
              toLevel: action.payload
            }
          ]
        }
      };
    }

    case 'ADVANCE_LEVEL': {
      const currentIndex = state.availableLevels.findIndex(level => level.id === state.currentLevel.id);
      const nextLevel = state.availableLevels[currentIndex + 1];
      
      if (!nextLevel) return state;

      // Check prerequisites
      const missingPrereqs = nextLevel.prerequisites.filter(
        prereq => !state.unlockedLevels.includes(prereq)
      );
      
      if (missingPrereqs.length > 0) return state;

      return {
        ...state,
        currentLevel: nextLevel,
        unlockedLevels: state.unlockedLevels.includes(nextLevel.id) 
          ? state.unlockedLevels 
          : [...state.unlockedLevels, nextLevel.id],
        session: {
          ...state.session,
          interactions: [
            ...state.session.interactions,
            {
              timestamp: Date.now(),
              type: 'level_change',
              fromLevel: state.currentLevel.id,
              toLevel: nextLevel.id
            }
          ]
        }
      };
    }

    case 'RESET_PROGRESS': {
      const foundationLevel = state.availableLevels.find(level => level.id === 'foundation');
      if (!foundationLevel) return state;

      return {
        ...state,
        currentLevel: foundationLevel,
        unlockedLevels: ['foundation'],
        progress: { foundation: 0, conceptual: 0, applied: 0, research: 0 },
        session: {
          startTime: Date.now(),
          timeSpentPerLevel: { foundation: 0, conceptual: 0, applied: 0, research: 0 },
          interactions: [{
            timestamp: Date.now(),
            type: 'level_change',
            toLevel: 'foundation'
          }]
        }
      };
    }

    case 'UPDATE_PREFERENCES': {
      return {
        ...state,
        preferences: {
          ...state.preferences,
          ...action.payload
        },
        session: {
          ...state.session,
          interactions: [
            ...state.session.interactions,
            {
              timestamp: Date.now(),
              type: 'settings_change',
              context: action.payload
            }
          ]
        }
      };
    }

    case 'MARK_LEVEL_COMPLETE': {
      return {
        ...state,
        progress: {
          ...state.progress,
          [action.payload]: 1
        },
        unlockedLevels: state.unlockedLevels.includes(action.payload)
          ? state.unlockedLevels
          : [...state.unlockedLevels, action.payload]
      };
    }

    case 'TRACK_INTERACTION': {
      return {
        ...state,
        session: {
          ...state.session,
          interactions: [
            ...state.session.interactions,
            {
              ...action.payload,
              timestamp: Date.now()
            }
          ]
        }
      };
    }

    case 'UPDATE_TIME_SPENT': {
      return {
        ...state,
        session: {
          ...state.session,
          timeSpentPerLevel: {
            ...state.session.timeSpentPerLevel,
            [action.payload.level]: state.session.timeSpentPerLevel[action.payload.level] + action.payload.time
          }
        }
      };
    }

    case 'HYDRATE_STATE': {
      return action.payload;
    }

    default:
      return state;
  }
};

// ==========================================
// Context Creation
// ==========================================

const ComplexityContext = createContext<ComplexityContextValue | null>(null);

// ==========================================
// Provider Component
// ==========================================

export const ComplexityProvider: React.FC<ComplexityProviderProps> = ({
  children,
  initialState,
  customLevels,
  persistence = { enabled: true },
  analytics = { enabled: true },
  onStateChange,
  onLevelChange,
  onProgressUpdate
}) => {
  // ==========================================
  // State Initialization
  // ==========================================
  
  const levels = customLevels || DEFAULT_COMPLEXITY_LEVELS;
  const foundationLevel = levels.find(level => level.id === 'foundation') || levels[0];

  const createInitialState = useCallback((): ComplexityState => {
    const baseState: ComplexityState = {
      currentLevel: foundationLevel,
      availableLevels: levels,
      unlockedLevels: ['foundation'],
      progress: { foundation: 0, conceptual: 0, applied: 0, research: 0 },
      preferences: DEFAULT_PREFERENCES,
      session: {
        startTime: Date.now(),
        timeSpentPerLevel: { foundation: 0, conceptual: 0, applied: 0, research: 0 },
        interactions: []
      }
    };

    return {
      ...baseState,
      ...initialState
    };
  }, [foundationLevel, levels, initialState]);

  const [state, dispatch] = useReducer(complexityReducer, null, () => {
    if (persistence.enabled) {
      const stored = loadFromStorage();
      if (stored) {
        // Merge stored state with current levels in case they've been updated
        return {
          ...stored,
          availableLevels: levels,
          currentLevel: levels.find(level => level.id === stored.currentLevel.id) || foundationLevel
        };
      }
    }
    return createInitialState();
  });

  // ==========================================
  // Persistence Effect
  // ==========================================
  
  useEffect(() => {
    if (persistence.enabled) {
      saveToStorage(state);
    }
    onStateChange?.(state);
  }, [state, persistence.enabled, onStateChange]);

  // ==========================================
  // Time Tracking Effect
  // ==========================================
  
  const lastLevelRef = useRef(state.currentLevel.id);
  const lastUpdateRef = useRef(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const timeDelta = now - lastUpdateRef.current;
      
      if (timeDelta > 1000) { // Update every second
        dispatch({
          type: 'UPDATE_TIME_SPENT',
          payload: {
            level: state.currentLevel.id,
            time: timeDelta
          }
        });
        lastUpdateRef.current = now;
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [state.currentLevel.id]);

  // ==========================================
  // Action Creators
  // ==========================================
  
  const actions = useMemo(() => ({
    setLevel: (level: ComplexityLevelId) => {
      const oldLevel = state.currentLevel;
      dispatch({ type: 'SET_LEVEL', payload: level });
      const newLevel = state.availableLevels.find(l => l.id === level);
      if (newLevel && oldLevel.id !== level) {
        onLevelChange?.(newLevel, oldLevel);
      }
    },

    advanceLevel: () => {
      const oldLevel = state.currentLevel;
      dispatch({ type: 'ADVANCE_LEVEL' });
      // onLevelChange will be called in the next render if level actually changed
    },

    resetProgress: () => {
      dispatch({ type: 'RESET_PROGRESS' });
    },

    updatePreferences: (preferences: Partial<ComplexityPreferences>) => {
      dispatch({ type: 'UPDATE_PREFERENCES', payload: preferences });
    },

    markLevelComplete: (level: ComplexityLevelId) => {
      dispatch({ type: 'MARK_LEVEL_COMPLETE', payload: level });
      onProgressUpdate?.(level, 1);
    },

    trackInteraction: (interaction: Omit<ComplexityInteraction, 'timestamp'>) => {
      if (analytics.enabled && analytics.trackInteractions) {
        dispatch({ type: 'TRACK_INTERACTION', payload: interaction });
      }
    }
  }), [state.currentLevel, state.availableLevels, analytics, onLevelChange, onProgressUpdate]);

  // ==========================================
  // Computed Values
  // ==========================================
  
  const computed = useMemo(() => ({
    canAdvance: (() => {
      const currentIndex = state.availableLevels.findIndex(level => level.id === state.currentLevel.id);
      const nextLevel = state.availableLevels[currentIndex + 1];
      if (!nextLevel) return false;
      
      const missingPrereqs = nextLevel.prerequisites.filter(
        prereq => !state.unlockedLevels.includes(prereq)
      );
      return missingPrereqs.length === 0;
    })(),

    canGoBack: (() => {
      const currentIndex = state.availableLevels.findIndex(level => level.id === state.currentLevel.id);
      return currentIndex > 0;
    })(),

    nextLevel: (() => {
      const currentIndex = state.availableLevels.findIndex(level => level.id === state.currentLevel.id);
      return state.availableLevels[currentIndex + 1] || null;
    })(),

    previousLevel: (() => {
      const currentIndex = state.availableLevels.findIndex(level => level.id === state.currentLevel.id);
      return state.availableLevels[currentIndex - 1] || null;
    })(),

    totalProgress: (() => {
      const totalLevels = state.availableLevels.length;
      const completedLevels = Object.values(state.progress).filter(p => p === 1).length;
      const currentProgress = state.progress[state.currentLevel.id] || 0;
      return (completedLevels + currentProgress) / totalLevels;
    })(),

    isLevelUnlocked: (level: ComplexityLevelId): boolean => {
      return state.unlockedLevels.includes(level);
    },

    getMissingPrerequisites: (level: ComplexityLevelId): ComplexityLevelId[] => {
      const targetLevel = state.availableLevels.find(l => l.id === level);
      if (!targetLevel) return [];
      
      return targetLevel.prerequisites.filter(
        prereq => !state.unlockedLevels.includes(prereq)
      );
    },

    getTimeSpent: (level?: ComplexityLevelId): number => {
      if (level) {
        return state.session.timeSpentPerLevel[level] || 0;
      }
      return Object.values(state.session.timeSpentPerLevel).reduce((total, time) => total + time, 0);
    }
  }), [state]);

  // ==========================================
  // Context Value
  // ==========================================
  
  const contextValue = useMemo((): ComplexityContextValue => ({
    state,
    actions,
    computed
  }), [state, actions, computed]);

  // ==========================================
  // Render
  // ==========================================
  
  return (
    <ComplexityContext.Provider value={contextValue}>
      {children}
    </ComplexityContext.Provider>
  );
};

// ==========================================
// Custom Hook
// ==========================================

export const useComplexityContext = (): ComplexityContextValue => {
  const context = useContext(ComplexityContext);
  
  if (!context) {
    throw new Error('useComplexityContext must be used within a ComplexityProvider');
  }
  
  return context;
};

export default ComplexityProvider;