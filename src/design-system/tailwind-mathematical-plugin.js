const plugin = require('tailwindcss/plugin');
const mathematicalTokens = require('./mathematical-tokens.json');

const mathematicalPlugin = plugin(function({ addBase, addComponents, addUtilities, theme }) {
  // Add mathematical CSS custom properties to base
  addBase({
    ':root': {
      // Mathematical colors
      '--math-primary': mathematicalTokens.mathematical.colors.primary['mathematical-blue'],
      '--math-secondary': mathematicalTokens.mathematical.colors.primary['mathematical-purple'],
      '--math-accent': mathematicalTokens.mathematical.colors.primary['mathematical-green'],
      '--math-warning': mathematicalTokens.mathematical.colors.primary['mathematical-orange'],
      '--math-error': mathematicalTokens.mathematical.colors.primary['mathematical-red'],
      
      // Semantic colors
      '--math-variable': mathematicalTokens.mathematical.colors.semantic.variable,
      '--math-constant': mathematicalTokens.mathematical.colors.semantic.constant,
      '--math-operator': mathematicalTokens.mathematical.colors.semantic.operator,
      '--math-result': mathematicalTokens.mathematical.colors.semantic.result,
      
      // Spacing
      '--space-phi': mathematicalTokens.mathematical.spacing.golden.phi,
      '--space-phi-squared': mathematicalTokens.mathematical.spacing.golden['phi-squared'],
      '--space-phi-inverse': mathematicalTokens.mathematical.spacing.golden['phi-inverse'],
      
      // Typography
      '--font-mathematical': mathematicalTokens.mathematical.typography.fonts.mathematical.join(', '),
      '--font-code': mathematicalTokens.mathematical.typography.fonts.code.join(', '),
      
      // Animation easing
      '--ease-golden': mathematicalTokens.mathematical.animation.easing.golden,
      '--ease-fibonacci': mathematicalTokens.mathematical.animation.easing.fibonacci,
      '--ease-harmonic': mathematicalTokens.mathematical.animation.easing.harmonic,
    },
    
    // Mathematical typography base styles
    '.math-formula': {
      fontFamily: 'var(--font-mathematical)',
      fontSize: mathematicalTokens.mathematical.typography.scales.mathematical['formula-display'],
      lineHeight: '1.2',
      color: 'var(--math-primary)',
    },
    
    '.math-theorem': {
      fontFamily: 'var(--font-mathematical)',
      fontSize: mathematicalTokens.mathematical.typography.scales.mathematical['theorem-header'],
      fontWeight: mathematicalTokens.mathematical.typography.weights.bold,
      color: 'var(--math-primary)',
    },
    
    '.math-proof': {
      fontFamily: 'var(--font-mathematical)',
      fontSize: mathematicalTokens.mathematical.typography.scales.mathematical['proof-step'],
      lineHeight: '1.5',
      color: 'var(--math-secondary)',
    },
    
    '.math-code': {
      fontFamily: 'var(--font-code)',
      fontSize: mathematicalTokens.mathematical.typography.scales.mathematical.base,
      backgroundColor: 'rgb(248 250 252)',
      padding: '0.125rem 0.25rem',
      borderRadius: '0.25rem',
      border: '1px solid rgb(226 232 240)',
    }
  });

  // Add mathematical component classes
  addComponents({
    // Mathematical input components
    '.math-input': {
      fontFamily: 'var(--font-code)',
      fontSize: mathematicalTokens.mathematical.typography.scales.mathematical.base,
      padding: `${mathematicalTokens.mathematical.spacing.fibonacci['3']} ${mathematicalTokens.mathematical.spacing.fibonacci['4']}`,
      border: '2px solid transparent',
      borderRadius: mathematicalTokens.mathematical.borders.radius.soft,
      backgroundColor: 'rgb(248 250 252)',
      color: 'var(--math-primary)',
      transition: 'all 300ms var(--ease-golden)',
      
      '&:focus': {
        outline: 'none',
        borderColor: 'var(--math-primary)',
        boxShadow: mathematicalTokens.mathematical.shadows['data-viz'].focus,
        backgroundColor: 'white',
      },
      
      '&::placeholder': {
        color: 'rgb(148 163 184)',
        fontStyle: 'italic',
      }
    },
    
    '.math-input-formula': {
      fontFamily: 'var(--font-mathematical)',
      fontSize: mathematicalTokens.mathematical.typography.scales.mathematical['proof-step'],
      minHeight: mathematicalTokens.mathematical.grid['mathematical-baseline'],
      lineHeight: '1.4',
    },
    
    // Mathematical display components
    '.math-display': {
      padding: mathematicalTokens.mathematical.spacing.fibonacci['6'],
      backgroundColor: 'rgb(248 250 252)',
      borderRadius: mathematicalTokens.mathematical.borders.radius.soft,
      border: '1px solid rgb(226 232 240)',
      marginTop: mathematicalTokens.mathematical.spacing.fibonacci['6'],
      marginBottom: mathematicalTokens.mathematical.spacing.fibonacci['6'],
    },
    
    '.math-display-inline': {
      display: 'inline-block',
      padding: `${mathematicalTokens.mathematical.spacing.fibonacci['1']} ${mathematicalTokens.mathematical.spacing.fibonacci['2']}`,
      backgroundColor: 'rgb(248 250 252)',
      borderRadius: mathematicalTokens.mathematical.borders.radius.subtle,
      fontFamily: 'var(--font-mathematical)',
      fontSize: mathematicalTokens.mathematical.typography.scales.mathematical.base,
    },
    
    '.math-display-block': {
      display: 'block',
      textAlign: 'center',
      padding: mathematicalTokens.mathematical.spacing.fibonacci['8'],
      backgroundColor: 'white',
      border: '2px solid rgb(226 232 240)',
      borderRadius: mathematicalTokens.mathematical.borders.radius.round,
      boxShadow: mathematicalTokens.mathematical.shadows.mathematical.soft,
      fontFamily: 'var(--font-mathematical)',
      fontSize: mathematicalTokens.mathematical.typography.scales.mathematical['theorem-header'],
      marginTop: mathematicalTokens.mathematical.spacing.fibonacci['8'],
      marginBottom: mathematicalTokens.mathematical.spacing.fibonacci['8'],
    },
    
    // Mathematical button components
    '.math-btn': {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: `${mathematicalTokens.mathematical.spacing.fibonacci['3']} ${mathematicalTokens.mathematical.spacing.fibonacci['6']}`,
      fontSize: mathematicalTokens.mathematical.typography.scales.mathematical.base,
      fontWeight: mathematicalTokens.mathematical.typography.weights.medium,
      borderRadius: mathematicalTokens.mathematical.borders.radius.soft,
      border: '2px solid transparent',
      cursor: 'pointer',
      transition: 'all 300ms var(--ease-golden)',
      
      '&:hover': {
        transform: 'translateY(-1px)',
        boxShadow: mathematicalTokens.mathematical.shadows['data-viz'].hover,
      },
      
      '&:active': {
        transform: 'translateY(0)',
        boxShadow: mathematicalTokens.mathematical.shadows['data-viz'].active,
      },
      
      '&:focus': {
        outline: 'none',
        boxShadow: mathematicalTokens.mathematical.shadows['data-viz'].focus,
      }
    },
    
    '.math-btn-primary': {
      backgroundColor: 'var(--math-primary)',
      color: 'white',
      
      '&:hover': {
        backgroundColor: '#1d4ed8',
      }
    },
    
    '.math-btn-secondary': {
      backgroundColor: 'white',
      color: 'var(--math-primary)',
      borderColor: 'var(--math-primary)',
      
      '&:hover': {
        backgroundColor: 'var(--math-primary)',
        color: 'white',
      }
    },
    
    // Mathematical workspace components
    '.math-workspace': {
      display: 'grid',
      gap: mathematicalTokens.mathematical.spacing.fibonacci['6'],
      padding: mathematicalTokens.mathematical.spacing.fibonacci['8'],
      backgroundColor: 'rgb(248 250 252)',
      borderRadius: mathematicalTokens.mathematical.borders.radius.round,
      border: '1px solid rgb(226 232 240)',
    },
    
    '.math-workspace-split': {
      display: 'grid',
      gridTemplateColumns: `1fr ${mathematicalTokens.mathematical.spacing.golden.phi}fr`,
      gap: mathematicalTokens.mathematical.spacing.fibonacci['8'],
    },
    
    // Mathematical visualization containers
    '.math-viz-container': {
      position: 'relative',
      backgroundColor: 'white',
      borderRadius: mathematicalTokens.mathematical.borders.radius.round,
      border: '2px solid rgb(226 232 240)',
      boxShadow: mathematicalTokens.mathematical.shadows.mathematical.medium,
      overflow: 'hidden',
    },
    
    '.math-viz-controls': {
      position: 'absolute',
      top: mathematicalTokens.mathematical.spacing.fibonacci['4'],
      right: mathematicalTokens.mathematical.spacing.fibonacci['4'],
      display: 'flex',
      gap: mathematicalTokens.mathematical.spacing.fibonacci['2'],
      zIndex: mathematicalTokens.mathematical['z-index']['mathematical-overlay'],
    }
  });

  // Add mathematical utility classes
  addUtilities({
    // Mathematical spacing utilities
    '.space-phi': { gap: 'var(--space-phi)' },
    '.space-phi-squared': { gap: 'var(--space-phi-squared)' },
    '.space-phi-inverse': { gap: 'var(--space-phi-inverse)' },
    
    '.m-phi': { margin: 'var(--space-phi)' },
    '.mt-phi': { marginTop: 'var(--space-phi)' },
    '.mr-phi': { marginRight: 'var(--space-phi)' },
    '.mb-phi': { marginBottom: 'var(--space-phi)' },
    '.ml-phi': { marginLeft: 'var(--space-phi)' },
    
    '.p-phi': { padding: 'var(--space-phi)' },
    '.pt-phi': { paddingTop: 'var(--space-phi)' },
    '.pr-phi': { paddingRight: 'var(--space-phi)' },
    '.pb-phi': { paddingBottom: 'var(--space-phi)' },
    '.pl-phi': { paddingLeft: 'var(--space-phi)' },
    
    // Mathematical color utilities
    '.text-math-primary': { color: 'var(--math-primary)' },
    '.text-math-secondary': { color: 'var(--math-secondary)' },
    '.text-math-accent': { color: 'var(--math-accent)' },
    '.text-math-warning': { color: 'var(--math-warning)' },
    '.text-math-error': { color: 'var(--math-error)' },
    '.text-math-variable': { color: 'var(--math-variable)' },
    '.text-math-constant': { color: 'var(--math-constant)' },
    '.text-math-operator': { color: 'var(--math-operator)' },
    '.text-math-result': { color: 'var(--math-result)' },
    
    '.bg-math-primary': { backgroundColor: 'var(--math-primary)' },
    '.bg-math-secondary': { backgroundColor: 'var(--math-secondary)' },
    '.bg-math-accent': { backgroundColor: 'var(--math-accent)' },
    
    // Mathematical border utilities
    '.border-math-primary': { borderColor: 'var(--math-primary)' },
    '.border-math-secondary': { borderColor: 'var(--math-secondary)' },
    '.border-math-accent': { borderColor: 'var(--math-accent)' },
    
    // Mathematical typography utilities
    '.font-mathematical': { fontFamily: 'var(--font-mathematical)' },
    '.font-math-code': { fontFamily: 'var(--font-code)' },
    
    // Mathematical transition utilities
    '.transition-golden': { 
      transition: 'all 300ms var(--ease-golden)',
    },
    '.transition-fibonacci': { 
      transition: 'all 300ms var(--ease-fibonacci)',
    },
    '.transition-harmonic': { 
      transition: 'all 300ms var(--ease-harmonic)',
    },
    
    // Mathematical grid utilities
    '.grid-golden': {
      display: 'grid',
      gridTemplateColumns: `1fr ${mathematicalTokens.mathematical.spacing.golden.phi}fr`,
    },
    '.grid-fibonacci': {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 2fr 3fr 5fr',
    },
    
    // Mathematical aspect ratios
    '.aspect-golden': { aspectRatio: '1.618 / 1' },
    '.aspect-square': { aspectRatio: '1 / 1' },
    '.aspect-mathematical': { aspectRatio: '4 / 3' },
    
    // Mathematical responsive utilities
    ...Object.keys(mathematicalTokens.mathematical.breakpoints).reduce((acc, breakpoint) => {
      const value = mathematicalTokens.mathematical.breakpoints[breakpoint];
      acc[`@media (min-width: ${value})`] = {
        [`.${breakpoint}\\:math-workspace-responsive`]: {
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        }
      };
      return acc;
    }, {})
  });
}, {
  theme: {
    extend: {
      // Extend theme with mathematical values
      colors: {
        'math': {
          'primary': mathematicalTokens.mathematical.colors.primary['mathematical-blue'],
          'secondary': mathematicalTokens.mathematical.colors.primary['mathematical-purple'],
          'accent': mathematicalTokens.mathematical.colors.primary['mathematical-green'],
          'warning': mathematicalTokens.mathematical.colors.primary['mathematical-orange'],
          'error': mathematicalTokens.mathematical.colors.primary['mathematical-red'],
          'variable': mathematicalTokens.mathematical.colors.semantic.variable,
          'constant': mathematicalTokens.mathematical.colors.semantic.constant,
          'operator': mathematicalTokens.mathematical.colors.semantic.operator,
          'result': mathematicalTokens.mathematical.colors.semantic.result,
        }
      },
      fontFamily: {
        'mathematical': mathematicalTokens.mathematical.typography.fonts.mathematical,
        'math-code': mathematicalTokens.mathematical.typography.fonts.code,
      },
      spacing: {
        ...mathematicalTokens.mathematical.spacing.fibonacci,
        'phi': mathematicalTokens.mathematical.spacing.golden.phi,
        'phi-squared': mathematicalTokens.mathematical.spacing.golden['phi-squared'],
        'phi-inverse': mathematicalTokens.mathematical.spacing.golden['phi-inverse'],
      },
      fontSize: {
        'formula-xl': mathematicalTokens.mathematical.typography.scales.mathematical['formula-display'],
        'theorem': mathematicalTokens.mathematical.typography.scales.mathematical['theorem-header'],
        'proof': mathematicalTokens.mathematical.typography.scales.mathematical['proof-step'],
        'math-sm': mathematicalTokens.mathematical.typography.scales.mathematical.annotation,
        'math-xs': mathematicalTokens.mathematical.typography.scales.mathematical.subscript,
      },
      boxShadow: {
        'math-subtle': mathematicalTokens.mathematical.shadows.mathematical.subtle,
        'math-soft': mathematicalTokens.mathematical.shadows.mathematical.soft,
        'math-medium': mathematicalTokens.mathematical.shadows.mathematical.medium,
        'math-strong': mathematicalTokens.mathematical.shadows.mathematical.strong,
        'math-hover': mathematicalTokens.mathematical.shadows['data-viz'].hover,
        'math-active': mathematicalTokens.mathematical.shadows['data-viz'].active,
        'math-focus': mathematicalTokens.mathematical.shadows['data-viz'].focus,
      },
      borderRadius: {
        'math-sharp': mathematicalTokens.mathematical.borders.radius.sharp,
        'math-subtle': mathematicalTokens.mathematical.borders.radius.subtle,
        'math-soft': mathematicalTokens.mathematical.borders.radius.soft,
        'math-round': mathematicalTokens.mathematical.borders.radius.round,
      },
      animation: {
        'golden': `pulse 2s ${mathematicalTokens.mathematical.animation.easing.golden} infinite`,
        'fibonacci': `bounce 1s ${mathematicalTokens.mathematical.animation.easing.fibonacci} infinite`,
      },
      screens: {
        'mathematical-workspace': mathematicalTokens.mathematical.breakpoints['mathematical-workspace'],
        'large-formula': mathematicalTokens.mathematical.breakpoints['large-formula'],
      }
    }
  }
});

module.exports = mathematicalPlugin;