"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";

export default function TopLoader() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const prevPath = useRef(pathname);

  useEffect(() => {
    if (pathname !== prevPath.current) {
      // Page changed — complete the bar
      setProgress(100);
      const t = setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 300);
      prevPath.current = pathname;
      return () => clearTimeout(t);
    }
  }, [pathname]);

  // Intercept link clicks to start the bar
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("http") || href.startsWith("#") || href === pathname) return;
      setLoading(true);
      setProgress(30);
      // Animate to ~80% while waiting
      const t1 = setTimeout(() => setProgress(60), 150);
      const t2 = setTimeout(() => setProgress(80), 500);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [pathname]);

  if (!loading && progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-0.5">
      <div
        className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
