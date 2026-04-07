"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [show, setShow] = useState(true);

  useEffect(() => {
    setShow(false);
    const t = requestAnimationFrame(() => setShow(true));
    return () => cancelAnimationFrame(t);
  }, [pathname]);

  return (
    <div
      className={`transition-[opacity,transform] duration-200 ease-out ${
        show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
      }`}
    >
      {children}
    </div>
  );
}
