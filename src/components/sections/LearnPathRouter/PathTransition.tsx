/**
 * Path Transition Component
 * Smooth visual transitions between learning paths
 * Mathematical animations for path switching
 */

'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import classNames from 'classnames';
import { PathTransitionProps, AudiencePath } from './types';

export const PathTransition: React.FC<PathTransitionProps> = ({
  fromPath,
  toPath,
  onTransitionComplete,
  className
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [transitionPhase, setTransitionPhase] = useState<'enter' | 'active' | 'exit'>('enter');

  useEffect(() => {
    // Start transition sequence
    const startTransition = async () => {
      // Enter phase
      setTransitionPhase('enter');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Active phase
      setTransitionPhase('active');
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // Exit phase
      setTransitionPhase('exit');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Complete transition
      setIsVisible(false);
      onTransitionComplete();
    };

    startTransition();
  }, [onTransitionComplete]);

  const containerClasses = classNames(
    'path-transition',
    'fixed inset-0 z-50',
    'flex items-center justify-center',
    'bg-slate-900/95 backdrop-blur-sm',
    className
  );

  const getPathIcon = (path: AudiencePath | null) => {
    if (!path) return '🔍';
    return path.icon;
  };

  const getPathColor = (path: AudiencePath | null) => {
    if (!path) return 'text-slate-400';
    
    switch (path.color) {
      case 'business':
        return 'text-blue-400';
      case 'technical':
        return 'text-emerald-400';
      case 'academic':
        return 'text-purple-400';
      default:
        return 'text-slate-400';
    }
  };

  const getPathLabel = (path: AudiencePath | null) => {
    if (!path) return 'Exploration';
    return path.label;
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={containerClasses}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-center">
            {/* Transition Icon */}
            <motion.div
              className="mb-8"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ 
                scale: transitionPhase === 'active' ? 1.2 : 1,
                rotate: transitionPhase === 'active' ? 0 : -180
              }}
              transition={{ 
                duration: 0.6, 
                ease: 'easeInOut',
                scale: { duration: 0.3, repeat: transitionPhase === 'active' ? 1 : 0 }
              }}
            >
              <span className="text-8xl">🔄</span>
            </motion.div>

            {/* From Path */}
            <motion.div
              className="mb-6"
              initial={{ opacity: 1, x: 0 }}
              animate={{ 
                opacity: transitionPhase === 'exit' ? 0 : 1,
                x: transitionPhase === 'exit' ? -100 : 0
              }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex items-center justify-center gap-3 mb-2">
                <span className={classNames('text-3xl', getPathColor(fromPath))}>
                  {getPathIcon(fromPath)}
                </span>
                <span className="text-lg text-slate-400">from</span>
              </div>
              <h3 className={classNames('text-xl font-medium', getPathColor(fromPath))}>
                {getPathLabel(fromPath)}
              </h3>
            </motion.div>

            {/* Transition Arrow */}
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: transitionPhase === 'active' ? 1 : 0,
                scale: transitionPhase === 'active' ? 1 : 0
              }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <div className="flex items-center justify-center gap-2">
                <motion.div
                  className="w-8 h-0.5 bg-math-primary"
                  initial={{ width: 0 }}
                  animate={{ width: 32 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                />
                <motion.span
                  className="text-math-primary text-2xl"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                >
                  →
                </motion.span>
                <motion.div
                  className="w-8 h-0.5 bg-math-primary"
                  initial={{ width: 0 }}
                  animate={{ width: 32 }}
                  transition={{ duration: 0.4, delay: 0.6 }}
                />
              </div>
            </motion.div>

            {/* To Path */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, x: 100 }}
              animate={{ 
                opacity: transitionPhase === 'active' ? 1 : 0,
                x: transitionPhase === 'active' ? 0 : 100
              }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <div className="flex items-center justify-center gap-3 mb-2">
                <span className="text-lg text-slate-400">to</span>
                <span className={classNames('text-3xl', getPathColor(toPath))}>
                  {getPathIcon(toPath)}
                </span>
              </div>
              <h3 className={classNames('text-xl font-medium', getPathColor(toPath))}>
                {getPathLabel(toPath)}
              </h3>
            </motion.div>

            {/* Loading Animation */}
            <motion.div
              className="flex justify-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: transitionPhase === 'active' ? 1 : 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-math-primary rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              ))}
            </motion.div>

            {/* Transition Message */}
            <motion.p
              className="text-slate-400 mt-6 max-w-md mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: transitionPhase === 'active' ? 1 : 0,
                y: transitionPhase === 'active' ? 0 : 20
              }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              {transitionPhase === 'enter' && 'Preparing your learning journey...'}
              {transitionPhase === 'active' && 'Switching to your selected path...'}
              {transitionPhase === 'exit' && 'Almost there...'}
            </motion.p>

            {/* Mathematical Pattern Background */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
              <motion.div
                className="absolute inset-0 opacity-10"
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: 'linear'
                }}
              >
                <div className="w-full h-full bg-gradient-to-br from-math-primary/20 via-math-secondary/20 to-math-accent/20" />
              </motion.div>
              
              {/* Geometric patterns */}
              <div className="absolute top-1/4 left-1/4 w-32 h-32 border border-math-primary/30 rounded-full" />
              <div className="absolute top-3/4 right-1/4 w-24 h-24 border border-math-secondary/30 transform rotate-45" />
              <div className="absolute bottom-1/4 left-1/3 w-16 h-16 border border-math-accent/30 transform -rotate-45" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
