"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type TocItem = { id: string; label: string };

export default function OnThisPage({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (entry?.target?.id) setActiveId(entry.target.id);
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    items.forEach((i) => {
      const el = document.getElementById(i.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [items]);

  const list = useMemo(() => items, [items]);

  return (
    <aside className="hidden lg:block w-64 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto px-6 py-6 border-l border-gray-800">
      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">On this page</h4>
      <ul className="space-y-2">
        {list.map((item) => (
          <li key={item.id}>
            <Link
              href={`#${item.id}`}
              className={`block pl-3 border-l text-sm transition-colors ${
                activeId === item.id
                  ? "border-white text-white"
                  : "border-transparent text-gray-300 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}


