'use client';

import React, { useState } from 'react';
import {
  MathInput,
  FormulaInput,
  ParameterInput,
  MathDisplay,
  TheoremBlock,
  ProofBlock,
  DefinitionBlock,
  FormulaDisplay,
  MathButton,
  MathWorkspace,
  MathPanel,
  MathVisualization,
} from '../index';

export const MathematicalShowcase: React.FC = () => {
  const [paramValue, setParamValue] = useState<number>(1);
  const [formula, setFormula] = useState<string>('f(x) = x² + 2x + 1');
  
  return (
    <div className="mathematical-showcase p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-math-primary">
            Mathematical Design System
          </h1>
          <p className="text-xl text-gray-600">
            A comprehensive component library for mathematical interfaces
          </p>
        </div>

        {/* Input Components Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-math-primary border-b-2 border-math-primary pb-2">
            Input Components
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Mathematical Input */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Mathematical Input</h3>
              <div className="space-y-4">
                <MathInput 
                  placeholder="Enter a number"
                  semantic="variable"
                  onMathChange={(value, parsed) => {
                    if (parsed !== null && parsed !== undefined) setParamValue(parsed);
                  }}
                />
                <p className="text-sm text-gray-600">
                  Current value: <span className="font-mono text-math-result">{paramValue}</span>
                </p>
              </div>
            </div>

            {/* Formula Input */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Formula Input</h3>
              <FormulaInput
                defaultValue={formula}
                placeholder="Enter mathematical expression"
                onMathChange={(value) => setFormula(value)}
              />
              <p className="text-sm text-gray-600 mt-2">
                Formula: <span className="font-mathematical text-math-primary">{formula}</span>
              </p>
            </div>

            {/* Parameter Input */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Parameter Controls</h3>
              <div className="space-y-4">
                <ParameterInput
                  min={0}
                  max={10}
                  step={0.1}
                  defaultValue={5}
                  unit="units"
                  semantic="constant"
                />
                <ParameterInput
                  placeholder="Vector component"
                  semantic="variable"
                />
              </div>
            </div>

            {/* Mathematical Buttons */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Mathematical Buttons</h3>
              <div className="flex flex-wrap gap-3">
                <MathButton variant="operator" symbol="+" tooltip="Addition" />
                <MathButton variant="operator" symbol="−" tooltip="Subtraction" />
                <MathButton variant="operator" symbol="×" tooltip="Multiplication" />
                <MathButton variant="operator" symbol="÷" tooltip="Division" />
                <MathButton variant="function" symbol="sin" tooltip="Sine function" />
                <MathButton variant="function" symbol="cos" tooltip="Cosine function" />
                <MathButton variant="constant" symbol="π" tooltip="Pi constant" />
                <MathButton variant="constant" symbol="e" tooltip="Euler's number" />
              </div>
            </div>
          </div>
        </section>

        {/* Display Components Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-math-primary border-b-2 border-math-primary pb-2">
            Display Components
          </h2>
          
          {/* Inline Mathematical Display */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Mathematical Expressions</h3>
            <p className="text-gray-700 leading-relaxed">
              The quadratic formula is given by{' '}
              <MathDisplay variant="inline" copyable={true}>
                x = (-b ± √(b² - 4ac)) / 2a
              </MathDisplay>
              , which provides the solutions to any quadratic equation.
            </p>
          </div>

          {/* Block Formula Display */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Formula Display</h3>
            <FormulaDisplay numbered={true} copyable={true}>
              ∫<sub>-∞</sub><sup>∞</sup> e<sup>-x²/2</sup> dx = √(2π)
            </FormulaDisplay>
            <p className="text-gray-600 text-sm mt-2">
              The integral of the standard normal distribution
            </p>
          </div>

          {/* Theorem Block */}
          <TheoremBlock
            title="Fundamental Theorem of Calculus"
            tags={['calculus', 'fundamental']}
            collapsible={true}
            defaultExpanded={true}
          >
            <p className="mb-4">
              If <MathDisplay variant="inline">f</MathDisplay> is continuous on{' '}
              <MathDisplay variant="inline">[a, b]</MathDisplay>, then:
            </p>
            <FormulaDisplay>
              d/dx ∫<sub>a</sub><sup>x</sup> f(t) dt = f(x)
            </FormulaDisplay>
          </TheoremBlock>

          {/* Proof Block */}
          <ProofBlock
            title="Proof of Pythagorean Theorem"
            collapsible={true}
            defaultExpanded={false}
          >
            <div className="space-y-4">
              <p>Consider a right triangle with sides a, b and hypotenuse c.</p>
              <FormulaDisplay>
                Area = (1/2) × a × b = (1/2) × c × h
              </FormulaDisplay>
              <p>Where h is the altitude to the hypotenuse.</p>
              <p>Through geometric manipulation, we arrive at:</p>
              <FormulaDisplay>
                a² + b² = c²
              </FormulaDisplay>
            </div>
          </ProofBlock>

          {/* Definition Block */}
          <DefinitionBlock title="Limit">
            <p className="mb-4">
              The limit of a function f(x) as x approaches a value c is:
            </p>
            <FormulaDisplay>
              lim<sub>x→c</sub> f(x) = L
            </FormulaDisplay>
            <p className="mt-4">
              if for every &epsilon; &gt; 0, there exists &delta; &gt; 0 such that whenever 0 &lt; |x - c| &lt; &delta;,
              we have |f(x) - L| &lt; &epsilon;.
            </p>
          </DefinitionBlock>
        </section>

        {/* Workspace Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-math-primary border-b-2 border-math-primary pb-2">
            Mathematical Workspace
          </h2>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden" style={{ height: '500px' }}>
            <MathWorkspace layout="split" orientation="horizontal" resizable={true}>
              <MathPanel title="Input Panel" collapsible={true}>
                <div className="space-y-4">
                  <FormulaInput 
                    placeholder="f(x) = "
                    defaultValue="sin(x)"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <ParameterInput 
                      placeholder="Min X"
                      defaultValue={-10}
                      semantic="constant"
                    />
                    <ParameterInput 
                      placeholder="Max X"
                      defaultValue={10}
                      semantic="constant"
                    />
                  </div>
                  <div className="flex gap-2">
                    <MathButton variant="primary" size="sm">
                      Plot
                    </MathButton>
                    <MathButton variant="secondary" size="sm">
                      Clear
                    </MathButton>
                  </div>
                </div>
              </MathPanel>
              
              <MathPanel title="Visualization">
                <MathVisualization
                  title="Function Graph"
                  exportable={true}
                  aspectRatio="golden"
                >
                  <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded">
                    <div className="text-center text-gray-500">
                      <div className="text-6xl mb-4">📈</div>
                      <p className="text-lg font-semibold">Interactive Function Graph</p>
                      <p className="text-sm">Visualization would render here</p>
                    </div>
                  </div>
                </MathVisualization>
              </MathPanel>
            </MathWorkspace>
          </div>
        </section>

        {/* Animation Examples */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-math-primary border-b-2 border-math-primary pb-2">
            Interactive Features
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Mathematical Animations</h3>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded border">
                  <div className="math-fade-in">
                    <MathDisplay variant="block" animation="scale-in">
                      f(x) = a·sin(bx + c) + d
                    </MathDisplay>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Mathematical expressions with smooth animations
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Interactive Controls</h3>
              <div className="space-y-4">
                <div className="bg-math-grid p-4 rounded border-2 border-dashed border-gray-300">
                  <div className="text-center text-gray-500">
                    <div className="text-4xl mb-2">🎛️</div>
                    <p>Interactive mathematical controls</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Drag, zoom, and manipulate mathematical objects
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-8 border-t">
          <p className="text-gray-600">
            Mathematical Design System • Built with precision for zktheory
          </p>
          <div className="flex justify-center gap-4 mt-2 text-sm text-gray-500">
            <span>Golden Ratio: φ = {(1 + Math.sqrt(5)) / 2}</span>
            <span>•</span>
            <span>Components: {20}+</span>
            <span>•</span>
            <span>Patterns: Mathematical</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default MathematicalShowcase;