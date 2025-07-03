import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Chart.js components with no SSR
const LineChart = dynamic(() => import('react-chartjs-2').then(mod => mod.Line), { ssr: false });
const BarChart = dynamic(() => import('react-chartjs-2').then(mod => mod.Bar), { ssr: false });
const PieChart = dynamic(() => import('react-chartjs-2').then(mod => mod.Pie), { ssr: false });
const DoughnutChart = dynamic(() => import('react-chartjs-2').then(mod => mod.Doughnut), { ssr: false });

interface ChartProps {
  type: 'line' | 'bar' | 'pie' | 'doughnut';
  data: any;
  options?: any;
  title?: string;
  description?: string;
  className?: string;
}

export default function Chart({ 
  type, 
  data, 
  options = {}, 
  title, 
  description, 
  className = '' 
}: ChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Register Chart.js components dynamically
    import('chart.js').then((ChartJS) => {
      ChartJS.Chart.register(
        ChartJS.CategoryScale,
        ChartJS.LinearScale,
        ChartJS.PointElement,
        ChartJS.LineElement,
        ChartJS.BarElement,
        ChartJS.Title,
        ChartJS.Tooltip,
        ChartJS.Legend,
        ChartJS.ArcElement
      );
    });
  }, []);

  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: !!title,
        text: title,
      },
    },
    ...options,
  };

  const renderChart = () => {
    if (!isMounted) {
      return (
        <div className="flex items-center justify-center h-full bg-gray-100 rounded">
          <p className="text-gray-500">Loading chart...</p>
        </div>
      );
    }

    switch (type) {
      case 'line':
        return <LineChart data={data} options={defaultOptions} />;
      case 'bar':
        return <BarChart data={data} options={defaultOptions} />;
      case 'pie':
        return <PieChart data={data} options={defaultOptions} />;
      case 'doughnut':
        return <DoughnutChart data={data} options={defaultOptions} />;
      default:
        return <div>Unsupported chart type</div>;
    }
  };

  return (
    <div className={`chart-container bg-white p-6 rounded-lg shadow-sm border ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      )}
      {description && (
        <p className="text-sm text-gray-600 mb-4">{description}</p>
      )}
      <div className="relative h-64 w-full">
        {renderChart()}
      </div>
    </div>
  );
}
