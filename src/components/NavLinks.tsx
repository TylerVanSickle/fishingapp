"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavLinks({ links }: { links: { href: string; label: string }[] }) {
  const pathname = usePathname();
  return (
    <>
      {links.map(({ href, label }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors whitespace-nowrap ${
              active
                ? "text-white bg-white/8"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </>
  );
}
