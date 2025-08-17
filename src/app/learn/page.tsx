/**
 * Learn Section - Progressive Educational Pathways
 * Implementation based on ZKTheory Site Architecture
 * Three-path audience router with progressive complexity disclosure
 */

import React from 'react';
import type { Metadata } from 'next';
import { LearnPathRouter } from '@/components/sections/LearnPathRouter';
import { PenroseBackground } from '@/components/geometric-patterns/components/PenroseBackground';

export const metadata: Metadata = {
  title: 'Learn ZKTheory — Progressive Mathematical Discovery',
  description: 'Explore Zero-Knowledge Proofs through three tailored learning paths: Business, Technical, and Academic. Progressive complexity from foundation to research level.',
  keywords: 'zero-knowledge proofs, cryptography, mathematics, learning, education, blockchain, privacy',
};

export default function LearnPage() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden">
      {/* Penrose Tiling Background - Progressive Complexity Theme */}
      <div className="absolute inset-0 -z-10">
        <PenroseBackground
          animate
          complexity="intermediate"
          audience="academic"
          performance="balanced"
          density="medium"
          goldenRatio
          interactiveZoom={true}
          className="opacity-30"
        />
      </div>

      {/* Soft radial overlay for content readability */}
      <div aria-hidden className="absolute inset-0 bg-gradient-radial from-transparent via-slate-900/20 to-slate-900/40 -z-5" />

      {/* Learn Path Router Section */}
      <section className="relative z-10">
        <LearnPathRouter
          enableProgressiveDisclosure
          showComplexityIndicators
          enablePathTransitions
          performanceMode="balanced"
          accessibilityOptimized
          businessConfig={{
            focusAreas: ['roi', 'compliance', 'implementation'],
            complexityRange: ['🌱', '🌿', '🌳'],
            timeCommitment: 'flexible'
          }}
          technicalConfig={{
            focusAreas: ['fundamentals', 'protocols', 'implementation'],
            complexityRange: ['🌿', '🌳', '🏔️'],
            timeCommitment: 'structured'
          }}
          academicConfig={{
            focusAreas: ['theory', 'research', 'collaboration'],
            complexityRange: ['🌳', '🏔️', '🎓'],
            timeCommitment: 'deep-dive'
          }}
        />
      </section>
    </main>
  );
}
