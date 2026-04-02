"use client";

import { ChevronDown } from "lucide-react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
}

export function Select({ children, className = "", ...props }: SelectProps) {
  return (
    <div className="relative">
      <select
        {...props}
        className={`w-full px-3.5 py-2.5 rounded-lg bg-[#0c1a2e] border border-white/10 text-slate-100 focus:outline-none focus:border-blue-500 transition-colors appearance-none cursor-pointer ${className}`}
      >
        {children}
      </select>
      <ChevronDown
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
        size={14}
      />
    </div>
  );
}
