"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";

export default function NavMore({ links }: { links: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const pathname = usePathname();
  const anyActive = links.some(({ href }) => pathname === href || pathname.startsWith(href + "/"));
  const btnRef = useRef<HTMLButtonElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  // Position the fixed dropdown under the button
  function openMenu() {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 6, left: r.left });
    }
    setOpen(o => !o);
  }

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (
        btnRef.current && !btnRef.current.contains(e.target as Node) &&
        dropRef.current && !dropRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  // Split into two columns if more than 5 links
  const half = Math.ceil(links.length / 2);
  const col1 = links.slice(0, half);
  const col2 = links.slice(half);

  return (
    <>
      <button
        ref={btnRef}
        onClick={openMenu}
        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors whitespace-nowrap ${
          anyActive || open ? "text-white bg-white/8" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
        }`}
      >
        More <ChevronDown size={13} className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          ref={dropRef}
          style={{ position: "fixed", top: pos.top, left: pos.left, zIndex: 9999 }}
          className="flex gap-px rounded-2xl border border-white/12 bg-[#0b1628] shadow-2xl shadow-black/70 overflow-hidden"
        >
          <div className="flex flex-col min-w-45">
            {col1.map(({ href, label }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center px-4 py-2.5 text-sm transition-colors whitespace-nowrap gap-2 ${
                    active ? "text-white bg-white/6" : "text-slate-400 hover:text-white hover:bg-white/6"
                  }`}
                >
                  {label.startsWith("✦") ? (
                    <>
                      <span className="text-amber-400 text-xs">✦</span>
                      <span>{label.replace("✦ ", "")}</span>
                    </>
                  ) : label}
                </Link>
              );
            })}
          </div>
          {col2.length > 0 && (
            <>
              <div className="w-px bg-white/8" />
              <div className="flex flex-col min-w-45">
                {col2.map(({ href, label }) => {
                  const active = pathname === href || pathname.startsWith(href + "/");
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center px-4 py-2.5 text-sm transition-colors whitespace-nowrap gap-2 ${
                        active ? "text-white bg-white/6" : "text-slate-400 hover:text-white hover:bg-white/6"
                      }`}
                    >
                      {label.startsWith("✦") ? (
                        <>
                          <span className="text-amber-400 text-xs">✦</span>
                          <span>{label.replace("✦ ", "")}</span>
                        </>
                      ) : label}
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
