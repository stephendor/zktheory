import React from 'react';
import type { Metadata } from 'next';

// Client components rendered within
// Explicitly import the folder index to avoid resolving the sibling .tsx file
import TriplePathHeroSection from '../components/sections/TriplePathHeroSection/index';
import PenroseBackground from '../components/geometric-patterns/components/PenroseBackground';

export const metadata: Metadata = {
  title: 'ZKTheory — Mathematical Elegance Meets Practical Innovation',
  description: 'Explore three tailored paths—Business, Technical, and Academic—united by a central golden-spiral visualization and geometric tiling.',
};

export default function LandingPage() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden">
      {/* Subtle Penrose tiling backdrop for mathematical ambiance */}
      <div className="absolute inset-0 -z-10">
        <PenroseBackground
          animate
          complexity="intermediate"
          audience="technical"
          performance="balanced"
          density="sparse"
          goldenRatio
          interactiveZoom={false}
          className="opacity-40"
        />
      </div>

      {/* Soft radial overlay to improve contrast for hero content */}
  <div aria-hidden className="radial-contrast-overlay -z-10" />

      {/* Triple-path hero with central golden spiral */}
      <section className="relative">
        <TriplePathHeroSection
          elementId="hero"
          styles={{
            self: {
              height: 'screen',
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              padding: ['p-0'],
            },
          }}
          performanceMode="balanced"
          enableParallax
          enableHoverPreview
          enablePathTransitions
          reduceMotion={false}
          highContrast={false}
          screenReaderOptimized
          businessConfig={{ roiCalculatorEnabled: true }}
          technicalConfig={{ playgroundEnabled: true }}
          academicConfig={{ collaborationEnabled: true }}
        />
      </section>
    </main>
  );
}
