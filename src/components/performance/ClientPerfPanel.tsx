"use client";

import React from "react";
import { performanceMetrics } from "@/lib/performance";

type Metric = {
  label: string;
  value: string | number;
};

export default function ClientPerfPanel() {
  const [metrics, setMetrics] = React.useState<Metric[]>([]);
  const [running, setRunning] = React.useState(true);
  // Start as null so SSR and initial CSR render match; set on mount only
  const [mountedAt, setMountedAt] = React.useState<string | null>(null);
  const [isMounted, setIsMounted] = React.useState(false);
  const [fpsHistory, setFpsHistory] = React.useState<number[]>([]);
  const [heapHistory, setHeapHistory] = React.useState<number[]>([]);
  const [longTasks, setLongTasks] = React.useState<{ count: number; total: number; max: number }>({ count: 0, total: 0, max: 0 });
  const [collectedCount, setCollectedCount] = React.useState<number>(0);

  React.useEffect(() => {
    const t = new Date().toLocaleTimeString();
    setMountedAt(t);
    // eslint-disable-next-line no-console
    console.log("ClientPerfPanel mounted at", t);
    setIsMounted(true);
  }, []);

  // Periodically read collector size
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const id = setInterval(() => {
      try {
        const all = performanceMetrics.getMetrics();
        setCollectedCount(all.length);
      } catch {}
    }, 2000);
    return () => clearInterval(id);
  }, []);

  const publish = React.useCallback((
    label: string,
    value: number,
    unit: string,
    category: 'computation' | 'rendering' | 'memory' | 'interaction',
    meta?: Record<string, any>
  ) => {
    try {
      performanceMetrics.collectMetric({
        id: `client_${label.replace(/\s+/g, '_').toLowerCase()}`,
        timestamp: Date.now(),
        category,
        value,
        unit,
        metadata: meta,
      });
    } catch {}
  }, []);

  // FPS measurement via rAF
  React.useEffect(() => {
    if (!running) return;
    if (typeof window === 'undefined') return;
    let frames = 0;
    let rafId = 0;
    let lastTime = performance.now();

    const loop = () => {
      frames++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        const fps = Math.round((frames * 1000) / (now - lastTime));
        frames = 0;
        lastTime = now;
        setMetrics((prev) => upsert(prev, { label: "FPS", value: fps }));
        setFpsHistory((prev) => clampHistory([...prev, fps], 60));
        publish('FPS', fps, 'fps', 'rendering');
      }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [running, publish]);

  // Navigation timing (once)
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    if (nav) {
      const ttfb = Math.round(nav.responseStart - nav.requestStart);
      const domContentLoaded = Math.round(nav.domContentLoadedEventEnd - nav.startTime);
      const load = Math.round(nav.loadEventEnd - nav.startTime);
      setMetrics((prev) => upsertMany(prev, [
        { label: "TTFB (ms)", value: ttfb },
        { label: "DOM Content Loaded (ms)", value: domContentLoaded },
        { label: "Load (ms)", value: load },
      ]));
      publish('TTFB', ttfb, 'ms', 'rendering');
      publish('DOM Content Loaded', domContentLoaded, 'ms', 'rendering');
      publish('Load', load, 'ms', 'rendering');
    }
  }, [publish]);

  // Core Web Vitals (best-effort in dev)
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!("PerformanceObserver" in window)) return;
    const supported: string[] = (PerformanceObserver as any).supportedEntryTypes || [];
    const observers: PerformanceObserver[] = [];

    try {
      if (supported.includes("largest-contentful-paint")) {
        const lcpObs = new PerformanceObserver((list) => {
          const last = list.getEntries().pop() as PerformanceEntry | undefined;
          if (last) {
            const v = Math.round((last as any).startTime);
            setMetrics((prev) => upsert(prev, { label: "LCP (ms)", value: v }));
            publish('LCP', v, 'ms', 'rendering');
          }
        });
        lcpObs.observe({ type: "largest-contentful-paint", buffered: true } as PerformanceObserverInit);
        observers.push(lcpObs);
      }
    } catch {}

    try {
      if (supported.includes("first-input")) {
        const fidObs = new PerformanceObserver((list) => {
          const entry: any = list.getEntries()[0];
          if (entry) {
            const v = Math.round(entry.processingStart - entry.startTime);
            setMetrics((prev) => upsert(prev, { label: "FID (ms)", value: v }));
            publish('FID', v, 'ms', 'interaction');
          }
        });
        fidObs.observe({ type: "first-input", buffered: true } as PerformanceObserverInit);
        observers.push(fidObs);
      }
    } catch {}

    try {
      if (supported.includes("layout-shift")) {
        const clsObs = new PerformanceObserver((list) => {
          const entries: any[] = list.getEntries() as any[];
          let cls = 0;
          for (const e of entries) if (!e.hadRecentInput) cls += e.value || 0;
          const v = Number(cls.toFixed(3));
          setMetrics((prev) => upsert(prev, { label: "CLS", value: v }));
          publish('CLS', v, 'score', 'rendering');
        });
        clsObs.observe({ type: "layout-shift", buffered: true } as PerformanceObserverInit);
        observers.push(clsObs);
      }
    } catch {}

    return () => observers.forEach((o) => {
      try { o.disconnect(); } catch {}
    });
  }, []);

  // First Contentful Paint (FCP)
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const supported: string[] = (PerformanceObserver as any).supportedEntryTypes || [];
    if (supported.includes('paint')) {
      try {
        const paintObs = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const fcp = entries.find((e: any) => (e as any).name === 'first-contentful-paint') as any;
          if (fcp) {
            const v = Math.round(fcp.startTime);
            setMetrics((prev) => upsert(prev, { label: 'FCP (ms)', value: v }));
            publish('FCP', v, 'ms', 'rendering');
          }
        });
        paintObs.observe({ type: 'paint', buffered: true } as PerformanceObserverInit);
        return () => {
          try { paintObs.disconnect(); } catch {}
        };
      } catch {}
    } else {
      // Fallback to existing entries if available
      const fcp = performance.getEntriesByName('first-contentful-paint')[0] as any;
      if (fcp) {
        const v = Math.round(fcp.startTime);
        setMetrics((prev) => upsert(prev, { label: 'FCP (ms)', value: v }));
        publish('FCP', v, 'ms', 'rendering');
      }
    }
    return undefined;
  }, [publish]);

  // Long Tasks aggregation
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('PerformanceObserver' in window)) return;
    const supported: string[] = (PerformanceObserver as any).supportedEntryTypes || [];
    if (!supported.includes('longtask')) return;
    try {
      const ltObs = new PerformanceObserver((list) => {
        const entries = list.getEntries() as any[];
        setLongTasks((prev) => {
          let count = prev.count;
          let total = prev.total;
          let max = prev.max;
          for (const e of entries) {
            const dur = Math.round(e.duration);
            count += 1;
            total += dur;
            if (dur > max) max = dur;
          }
          // reflect in metric list too
          setMetrics((m) => upsertMany(m, [
            { label: 'Long Tasks (count)', value: count },
            { label: 'Long Tasks Total (ms)', value: total },
            { label: 'Longest Task (ms)', value: max },
          ]));
          publish('Long Tasks (count)', count, 'count', 'computation');
          publish('Long Tasks Total', total, 'ms', 'computation');
          publish('Longest Task', max, 'ms', 'computation');
          return { count, total, max };
        });
      });
      ltObs.observe({ type: 'longtask', buffered: true } as PerformanceObserverInit);
      return () => {
        try { ltObs.disconnect(); } catch {}
      };
    } catch {}
    return undefined;
  }, []);

  // Memory (Chrome only)
  React.useEffect(() => {
    if (!running) return;
    if (typeof window === 'undefined') return;
    const id = setInterval(() => {
      const anyNav: any = (performance as any);
      const mem = anyNav?.memory;
      if (mem && typeof mem.usedJSHeapSize === "number") {
        const mb = Math.round(mem.usedJSHeapSize / (1024 * 1024));
        setMetrics((prev) => upsert(prev, { label: "JS Heap (MB)", value: mb }));
        publish('JS Heap', mb, 'MB', 'memory');
        setHeapHistory((prev) => clampHistory([...prev, mb], 60));
      }
      setMetrics((prev) => upsert(prev, { label: "Now (ms)", value: Math.round(performance.now()) }));
    }, 1000);
    return () => clearInterval(id);
  }, [running, publish]);

  if (!isMounted) return null;

  return (
    <div className="mt-8 p-4 rounded-lg border-2 border-gray-300 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800">Performance Panel (client)</h3>
        <button
          className={`px-3 py-1 rounded text-sm font-medium ${running ? "bg-red-100 text-red-700 border border-red-300" : "bg-green-100 text-green-700 border border-green-300"}`}
          onClick={() => setRunning((r) => !r)}
        >
          {running ? "Pause" : "Resume"}
        </button>
      </div>
      <div className="flex items-center gap-2 mb-3">
        <button
          className="px-3 py-1 rounded text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50"
          onClick={() => {
            setMetrics([]);
            setFpsHistory([]);
            setHeapHistory([]);
            setLongTasks({ count: 0, total: 0, max: 0 });
          }}
        >
          Reset
        </button>
  <span className="text-xs text-gray-500 ml-2">Collected: {collectedCount}</span>
        <button
          className="px-3 py-1 rounded text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50"
          onClick={() => {
            try { performanceMetrics.clearMetrics(); } catch {}
          }}
        >
          Clear Collected
        </button>
        <button
          className="px-3 py-1 rounded text-sm font-medium border border-blue-300 text-blue-700 hover:bg-blue-50"
          onClick={async () => {
            const payload = {
              mountedAt,
              metrics: Object.fromEntries(metrics.map(m => [m.label, m.value])),
              fpsHistory,
              heapHistory,
              longTasks,
              timestamp: new Date().toISOString(),
            };
            const text = JSON.stringify(payload, null, 2);
            try {
              if (navigator?.clipboard?.writeText) {
                await navigator.clipboard.writeText(text);
              } else {
                // eslint-disable-next-line no-console
                console.log(text);
              }
            } catch (e) {
              // eslint-disable-next-line no-console
              console.warn('Copy failed, logging instead', e);
              // eslint-disable-next-line no-console
              console.log(text);
            }
          }}
        >
          Copy JSON
        </button>
        <button
          className="px-3 py-1 rounded text-sm font-medium border border-indigo-300 text-indigo-700 hover:bg-indigo-50"
          onClick={async () => {
            try {
              const data = performanceMetrics.getMetrics();
              const text = JSON.stringify(data, null, 2);
              if (navigator?.clipboard?.writeText) {
                await navigator.clipboard.writeText(text);
              } else {
                // eslint-disable-next-line no-console
                console.log(text);
              }
            } catch (e) {
              // eslint-disable-next-line no-console
              console.warn('Export failed', e);
            }
          }}
        >
          Export Collected
        </button>
      </div>
      <div className="text-xs text-gray-500 mb-3">
        Mounted at: <span suppressHydrationWarning>{mountedAt ?? "—"}</span>
      </div>
      {metrics.length === 0 && (
        <div className="mb-3 p-3 rounded border border-yellow-300 bg-yellow-50 text-yellow-800 text-sm">
          Waiting for metrics… interact with the page and give it 1-2 seconds.
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {metrics.map((m) => (
          <div key={m.label} className="p-3 rounded border bg-gray-50">
            <div className="text-xs uppercase tracking-wide text-gray-500">{m.label}</div>
            <div className="text-xl font-bold text-gray-800 mt-1">{m.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function upsert(arr: Metric[], item: Metric): Metric[] {
  const idx = arr.findIndex((m) => m.label === item.label);
  if (idx === -1) return [...arr, item];
  const next = arr.slice();
  next[idx] = item;
  return next;
}

function upsertMany(arr: Metric[], items: Metric[]): Metric[] {
  return items.reduce((acc, it) => upsert(acc, it), arr);
}

function clampHistory(arr: number[], max = 60): number[] {
  if (arr.length <= max) return arr;
  return arr.slice(arr.length - max);
}
