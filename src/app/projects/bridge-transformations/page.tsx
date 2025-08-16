import React from 'react';
import PenroseBackground from '@/components/geometric-patterns/components/PenroseBackground';
import IntegratedMathematicalBridge from '@/components/mathematical/Integration/IntegratedMathematicalBridge';

export const metadata = {
  title: 'Mathematical Bridge Transformations — ZKTheory',
  description:
    'Interactive animated transformations connecting elliptic curves, abstract algebra, and topology with synchronized concept mapping.',
};

export default function BridgeTransformationsPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden">
      {/* Subtle animated geometric background */}
      <div className="absolute inset-0 -z-10">
        <PenroseBackground
          animate
          audience="technical"
          performance="balanced"
          density="sparse"
          goldenRatio
          interactiveZoom={false}
          className="opacity-30 md:opacity-40"
        />
        <div className="radial-contrast-overlay" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Mathematical Bridge Transformations
          </h1>
          <p className="mt-2 max-w-3xl text-gray-600 dark:text-gray-300">
            Explore animated morphisms between elliptic curves, abstract algebra, and topology. Synchronize with
            concept mapping to see relationships and learning paths emerge in real time.
          </p>
        </header>

        {/* Responsive container: allow horizontal scroll on small screens */}
        <section className="w-full overflow-x-auto">
          <div className="min-w-[1200px]">
            <IntegratedMathematicalBridge
              layout="side-by-side"
              showIntegrationControls
              enableSynchronization
              width={1200}
              height={720}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
