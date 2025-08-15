"use client";

import React from "react";

export default function ClientPerfHUD() {
  // Determine HUD enablement from the URL on the client to avoid
  // any server/client hook nuances. Supports hud=1, true, yes, on
  const [enabled, setEnabled] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [fps, setFps] = React.useState<number | null>(null);
  const [heap, setHeap] = React.useState<number | null>(null);
  const [running, setRunning] = React.useState(true);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const update = () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const v = (params.get("hud") || "").toLowerCase();
        setEnabled(v === "1" || v === "true" || v === "yes" || v === "on");
      } catch {
        setEnabled(false);
      }
    };
    update();
    window.addEventListener("popstate", update);
    window.addEventListener("hashchange", update);
    return () => {
      window.removeEventListener("popstate", update);
      window.removeEventListener("hashchange", update);
    };
  }, []);

  // FPS
  React.useEffect(() => {
    if (!enabled || !mounted || !running) return;
    if (typeof window === "undefined") return;
    let frames = 0;
    let last = performance.now();
    let rafId = 0;
    const loop = () => {
      frames++;
      const now = performance.now();
      if (now - last >= 1000) {
        setFps(Math.round((frames * 1000) / (now - last)));
        frames = 0;
        last = now;
      }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [enabled, mounted, running]);

  // Heap (Chrome only)
  React.useEffect(() => {
    if (!enabled || !mounted || !running) return;
    if (typeof window === "undefined") return;
    const id = setInterval(() => {
      const anyPerf: any = performance as any;
      const mem = anyPerf?.memory;
      if (mem && typeof mem.usedJSHeapSize === "number") {
        setHeap(Math.round(mem.usedJSHeapSize / (1024 * 1024)));
      }
    }, 1000);
    return () => clearInterval(id);
  }, [enabled, mounted, running]);

  if (!enabled || !mounted) return null;

  return (
    <div className="fixed top-2 right-2 z-[10000]">
      <div className="bg-black/80 text-white text-xs px-3 py-2 rounded shadow-lg flex items-center gap-3">
        <span className="font-semibold">HUD</span>
        <span>FPS: {fps ?? "—"}</span>
        <span>Heap: {heap !== null ? `${heap} MB` : "—"}</span>
        <button
          className={`ml-2 px-2 py-0.5 rounded border ${running ? "border-red-300 text-red-200" : "border-green-300 text-green-200"}`}
          onClick={() => setRunning((r) => !r)}
        >
          {running ? "Pause" : "Resume"}
        </button>
      </div>
    </div>
  );
}
