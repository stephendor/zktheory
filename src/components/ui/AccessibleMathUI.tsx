/**
 * Accessibility-First Mathematical UI Component
 * WCAG AA compliant mathematical content with screen reader support,
 * keyboard navigation, and reduced motion alternatives
 */

'use client';

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { 
  SpeakerWaveIcon, 
  SpeakerXMarkIcon,
  AdjustmentsHorizontalIcon,
  EyeSlashIcon,
  ComputerDesktopIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

// ==========================================
// Constants & Configuration
// ==========================================

const GOLDEN_RATIO = (1 + Math.sqrt(5)) / 2; // φ ≈ 1.618

// WCAG AA compliant color schemes
const ACCESSIBLE_COLORS = {
  normal: {
    primary: '#1d4ed8', // blue-700 - 4.5:1 contrast ratio
    secondary: '#475569', // slate-600 - 7:1 contrast ratio
    accent: '#dc2626', // red-600 - 4.5:1 contrast ratio
    background: '#ffffff',
    surface: '#f8fafc', // slate-50
    border: '#cbd5e1', // slate-300
    text: '#0f172a', // slate-900 - 16:1 contrast ratio
    textSecondary: '#475569' // slate-600 - 7:1 contrast ratio
  },
  highContrast: {
    primary: '#000000',
    secondary: '#000000',
    accent: '#000000',
    background: '#ffffff',
    surface: '#ffffff',
    border: '#000000',
    text: '#000000',
    textSecondary: '#000000'
  },
  darkMode: {
    primary: '#3b82f6', // blue-500
    secondary: '#94a3b8', // slate-400
    accent: '#ef4444', // red-500
    background: '#0f172a', // slate-900
    surface: '#1e293b', // slate-800
    border: '#475569', // slate-600
    text: '#f8fafc', // slate-50
    textSecondary: '#cbd5e1' // slate-300
  }
} as const;

// Mathematical notation accessibility mappings
const MATH_ARIA_LABELS = {
  '∑': 'sum from',
  '∫': 'integral from',
  '∂': 'partial derivative',
  '∇': 'gradient',
  '∞': 'infinity',
  '±': 'plus or minus',
  '≤': 'less than or equal to',
  '≥': 'greater than or equal to',
  '≠': 'not equal to',
  '≈': 'approximately equal to',
  '∈': 'element of',
  '∉': 'not element of',
  '⊆': 'subset of',
  '⊇': 'superset of',
  'φ': 'phi, the golden ratio',
  'π': 'pi',
  'θ': 'theta',
  'α': 'alpha',
  'β': 'beta',
  'γ': 'gamma',
  'δ': 'delta'
} as const;

// ==========================================
// Types
// ==========================================

interface AccessibilitySettings {
  screenReader: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  keyboardOnly: boolean;
  fontSize: 'small' | 'normal' | 'large' | 'xlarge';
  audioDescriptions: boolean;
  mathSpeech: boolean;
  colorScheme: 'normal' | 'highContrast' | 'darkMode';
}

interface MathematicalContentProps {
  expression: string;
  description: string;
  level: 'foundation' | 'conceptual' | 'applied' | 'research';
  speechText?: string;
  visualAlternative?: string;
  tactileDescription?: string;
  keyboardShortcuts?: Array<{
    key: string;
    action: string;
    description: string;
  }>;
}

interface AccessibleMathUIProps {
  children: React.ReactNode;
  mathContent?: MathematicalContentProps;
  initialSettings?: Partial<AccessibilitySettings>;
  onSettingsChange?: (settings: AccessibilitySettings) => void;
  className?: string;
}

// ==========================================
// Accessibility Settings Hook
// ==========================================

const useAccessibilitySettings = (initialSettings?: Partial<AccessibilitySettings>) => {
  const prefersReducedMotion = useReducedMotion();
  const [settings, setSettings] = useState<AccessibilitySettings>({
    screenReader: false,
    highContrast: false,
    reducedMotion: prefersReducedMotion || false,
    keyboardOnly: false,
    fontSize: 'normal',
    audioDescriptions: false,
    mathSpeech: false,
    colorScheme: 'normal',
    ...initialSettings
  });

  // Detect user preferences
  useEffect(() => {
    const mediaQueries = {
      prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)'),
      prefersHighContrast: window.matchMedia('(prefers-contrast: high)'),
      prefersDarkMode: window.matchMedia('(prefers-color-scheme: dark)')
    };

    const updateFromMedia = () => {
      setSettings(prev => ({
        ...prev,
        reducedMotion: mediaQueries.prefersReducedMotion.matches,
        highContrast: mediaQueries.prefersHighContrast.matches,
        colorScheme: mediaQueries.prefersDarkMode.matches ? 'darkMode' : 'normal'
      }));
    };

    // Initial check
    updateFromMedia();

    // Listen for changes
    Object.values(mediaQueries).forEach(mq => {
      mq.addListener(updateFromMedia);
    });

    return () => {
      Object.values(mediaQueries).forEach(mq => {
        mq.removeListener(updateFromMedia);
      });
    };
  }, []);

  const updateSetting = useCallback(<K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  return { settings, updateSetting };
};

// ==========================================
// Mathematical Speech Synthesis
// ==========================================

const useMathSpeech = (enabled: boolean) => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    setIsSupported('speechSynthesis' in window);
  }, []);

  const speakMath = useCallback((text: string, expression: string) => {
    if (!enabled || !isSupported) return;

    // Convert mathematical symbols to speech
    let speechText = text;
    Object.entries(MATH_ARIA_LABELS).forEach(([symbol, description]) => {
      speechText = speechText.replace(new RegExp(symbol, 'g'), description);
    });

    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.rate = 0.8; // Slower for mathematical content
    utterance.pitch = 1.0;
    utterance.volume = 0.8;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    speechSynthesis.speak(utterance);
  }, [enabled, isSupported]);

  const stopSpeaking = useCallback(() => {
    if (isSupported) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isSupported]);

  return { speakMath, stopSpeaking, isSpeaking, isSupported };
};

// ==========================================
// Keyboard Navigation Hook
// ==========================================

const useKeyboardNavigation = (
  mathContent?: MathematicalContentProps,
  onInteraction?: (action: string) => void
) => {
  const [focusedElement, setFocusedElement] = useState<string | null>(null);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    const { key, altKey, ctrlKey, shiftKey } = event;

    // Custom math shortcuts
    if (mathContent?.keyboardShortcuts) {
      const shortcut = mathContent.keyboardShortcuts.find(s => 
        s.key === key || 
        s.key === `${ctrlKey ? 'Ctrl+' : ''}${altKey ? 'Alt+' : ''}${shiftKey ? 'Shift+' : ''}${key}`
      );

      if (shortcut) {
        event.preventDefault();
        onInteraction?.(shortcut.action);
        return;
      }
    }

    // Standard navigation
    switch (key) {
      case 'Tab':
        // Let browser handle tab navigation
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        onInteraction?.('activate');
        break;
      case 'Escape':
        event.preventDefault();
        setFocusedElement(null);
        onInteraction?.('escape');
        break;
      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
        event.preventDefault();
        onInteraction?.(`navigate-${key.toLowerCase().replace('arrow', '')}`);
        break;
    }
  }, [mathContent, onInteraction]);

  return { handleKeyDown, focusedElement, setFocusedElement };
};

// ==========================================
// Mathematical Content Component
// ==========================================

const MathematicalContent: React.FC<{
  content: MathematicalContentProps;
  settings: AccessibilitySettings;
  colors: typeof ACCESSIBLE_COLORS.normal;
}> = ({ content, settings, colors }) => {
  const { speakMath, stopSpeaking, isSpeaking } = useMathSpeech(settings.mathSpeech);
  const { handleKeyDown } = useKeyboardNavigation(content, (action) => {
    if (action === 'activate') {
      speakMath(content.speechText || content.description, content.expression);
    }
  });

  const fontSizeClass = {
    small: 'text-sm',
    normal: 'text-base',
    large: 'text-lg',
    xlarge: 'text-xl'
  }[settings.fontSize];

  return (
    <div
      className={`mathematical-content p-4 rounded-lg border-2 ${fontSizeClass}`}
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border,
        color: colors.text
      }}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      role="region"
      aria-label="Mathematical content"
    >
      {/* Expression Display */}
      <div className="mb-4">
        <h3 className="font-semibold mb-2" style={{ color: colors.primary }}>
          Mathematical Expression
        </h3>
        
        <div 
          className="font-mono text-2xl p-3 rounded border"
          style={{ 
            backgroundColor: colors.background,
            borderColor: colors.border,
            fontFamily: 'KaTeX_Main, "Times New Roman", serif'
          }}
          aria-label={content.speechText || content.description}
          role="img"
        >
          {content.expression}
        </div>

        {/* Audio Control */}
        {settings.mathSpeech && (
          <button
            className="mt-2 flex items-center space-x-2 px-3 py-1 rounded transition-colors"
            style={{
              backgroundColor: colors.primary,
              color: colors.background
            }}
            onClick={() => {
              if (isSpeaking) {
                stopSpeaking();
              } else {
                speakMath(content.speechText || content.description, content.expression);
              }
            }}
            aria-label={isSpeaking ? 'Stop speech' : 'Speak mathematical expression'}
          >
            {isSpeaking ? (
              <SpeakerXMarkIcon className="w-4 h-4" />
            ) : (
              <SpeakerWaveIcon className="w-4 h-4" />
            )}
            <span className="text-sm">
              {isSpeaking ? 'Stop' : 'Speak'}
            </span>
          </button>
        )}
      </div>

      {/* Description */}
      <div className="mb-4">
        <h4 className="font-medium mb-2" style={{ color: colors.primary }}>
          Description
        </h4>
        <p style={{ color: colors.textSecondary }}>
          {content.description}
        </p>
      </div>

      {/* Visual Alternative */}
      {content.visualAlternative && (
        <div className="mb-4">
          <h4 className="font-medium mb-2" style={{ color: colors.primary }}>
            Visual Alternative
          </h4>
          <p style={{ color: colors.textSecondary }}>
            {content.visualAlternative}
          </p>
        </div>
      )}

      {/* Tactile Description */}
      {content.tactileDescription && settings.screenReader && (
        <div className="mb-4">
          <h4 className="font-medium mb-2" style={{ color: colors.primary }}>
            Tactile Description
          </h4>
          <p style={{ color: colors.textSecondary }}>
            {content.tactileDescription}
          </p>
        </div>
      )}

      {/* Keyboard Shortcuts */}
      {content.keyboardShortcuts && settings.keyboardOnly && (
        <div>
          <h4 className="font-medium mb-2" style={{ color: colors.primary }}>
            Keyboard Shortcuts
          </h4>
          <ul className="space-y-1">
            {content.keyboardShortcuts.map((shortcut, index) => (
              <li key={index} className="flex items-center space-x-2 text-sm">
                <kbd 
                  className="px-2 py-1 rounded font-mono"
                  style={{ 
                    backgroundColor: colors.border,
                    color: colors.text
                  }}
                >
                  {shortcut.key}
                </kbd>
                <span style={{ color: colors.textSecondary }}>
                  {shortcut.description}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// ==========================================
// Accessibility Settings Panel
// ==========================================

const AccessibilityPanel: React.FC<{
  settings: AccessibilitySettings;
  onSettingChange: <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => void;
  colors: typeof ACCESSIBLE_COLORS.normal;
}> = ({ settings, onSettingChange, colors }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div 
      className="accessibility-panel border rounded-lg p-4"
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border
      }}
    >
      <button
        className="flex items-center justify-between w-full mb-4"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-controls="accessibility-options"
      >
        <div className="flex items-center space-x-2">
          <AdjustmentsHorizontalIcon className="w-5 h-5" style={{ color: colors.primary }} />
          <span className="font-medium" style={{ color: colors.text }}>
            Accessibility Settings
          </span>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <InformationCircleIcon className="w-5 h-5" style={{ color: colors.primary }} />
        </motion.div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            id="accessibility-options"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* Color Scheme */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                Color Scheme
              </label>
              <select
                value={settings.colorScheme}
                onChange={(e) => onSettingChange('colorScheme', e.target.value as any)}
                className="w-full p-2 border rounded"
                style={{
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.text
                }}
              >
                <option value="normal">Normal</option>
                <option value="highContrast">High Contrast</option>
                <option value="darkMode">Dark Mode</option>
              </select>
            </div>

            {/* Font Size */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                Font Size
              </label>
              <select
                value={settings.fontSize}
                onChange={(e) => onSettingChange('fontSize', e.target.value as any)}
                className="w-full p-2 border rounded"
                style={{
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.text
                }}
              >
                <option value="small">Small</option>
                <option value="normal">Normal</option>
                <option value="large">Large</option>
                <option value="xlarge">Extra Large</option>
              </select>
            </div>

            {/* Boolean Settings */}
            {[
              { key: 'reducedMotion', label: 'Reduced Motion' },
              { key: 'mathSpeech', label: 'Mathematical Speech' },
              { key: 'screenReader', label: 'Screen Reader Optimized' },
              { key: 'keyboardOnly', label: 'Keyboard Only Navigation' },
              { key: 'audioDescriptions', label: 'Audio Descriptions' }
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id={key}
                  checked={settings[key as keyof AccessibilitySettings] as boolean}
                  onChange={(e) => onSettingChange(key as any, e.target.checked)}
                  className="w-4 h-4 rounded"
                  style={{ accentColor: colors.primary }}
                />
                <label htmlFor={key} className="text-sm" style={{ color: colors.text }}>
                  {label}
                </label>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ==========================================
// Main Accessible Math UI Component
// ==========================================

export const AccessibleMathUI: React.FC<AccessibleMathUIProps> = ({
  children,
  mathContent,
  initialSettings,
  onSettingsChange,
  className = ''
}) => {
  const { settings, updateSetting } = useAccessibilitySettings(initialSettings);
  const colors = ACCESSIBLE_COLORS[settings.colorScheme];

  // Notify parent of settings changes
  useEffect(() => {
    onSettingsChange?.(settings);
  }, [settings, onSettingsChange]);

  return (
    <div 
      className={`accessible-math-ui ${className}`}
      style={{
        backgroundColor: colors.background,
        color: colors.text,
        fontSize: settings.fontSize === 'large' ? '1.125rem' : 
                  settings.fontSize === 'xlarge' ? '1.25rem' : 
                  settings.fontSize === 'small' ? '0.875rem' : '1rem'
      }}
    >
      {/* Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 px-4 py-2 rounded"
        style={{
          backgroundColor: colors.primary,
          color: colors.background
        }}
      >
        Skip to main content
      </a>

      {/* Accessibility Panel */}
      <div className="mb-6">
        <AccessibilityPanel
          settings={settings}
          onSettingChange={updateSetting}
          colors={colors}
        />
      </div>

      {/* Mathematical Content */}
      {mathContent && (
        <div className="mb-6">
          <MathematicalContent
            content={mathContent}
            settings={settings}
            colors={colors}
          />
        </div>
      )}

      {/* Main Content */}
      <main id="main-content" className="focus:outline-none" tabIndex={-1}>
        {children}
      </main>

      {/* Screen Reader Live Region */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        id="math-announcements"
      />

      {/* Keyboard Navigation Help */}
      {settings.keyboardOnly && (
        <div 
          className="fixed bottom-4 right-4 p-3 rounded-lg border shadow-lg max-w-xs"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border
          }}
        >
          <div className="flex items-center space-x-2 mb-2">
                            <ComputerDesktopIcon className="w-4 h-4" style={{ color: colors.primary }} />
            <span className="text-sm font-medium" style={{ color: colors.text }}>
              Keyboard Help
            </span>
          </div>
          <ul className="text-xs space-y-1" style={{ color: colors.textSecondary }}>
            <li>Tab: Navigate elements</li>
            <li>Enter/Space: Activate</li>
            <li>Escape: Close/Cancel</li>
            <li>Arrows: Navigate content</li>
          </ul>
        </div>
      )}

      {/* Accessibility Status */}
      <div className="sr-only">
        <p>
          Accessibility settings active: 
          Color scheme: {settings.colorScheme}, 
          Font size: {settings.fontSize}, 
          Reduced motion: {settings.reducedMotion ? 'enabled' : 'disabled'}, 
          Math speech: {settings.mathSpeech ? 'enabled' : 'disabled'}
        </p>
      </div>
    </div>
  );
};

export default AccessibleMathUI;