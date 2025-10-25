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
    <aside className="hidden lg:block w-64 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto px-6 py-6 border-l border-purple-800/50">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
          <h4 className="text-xs font-semibold text-purple-400 uppercase tracking-wider">On this page</h4>
        </div>
        <div className="text-xs text-gray-500 mb-4">
          {list.length} {list.length === 1 ? 'section' : 'sections'}
        </div>
      </div>
      
      <ul className="space-y-1">
        {list.map((item) => (
          <li key={item.id}>
            <Link
              href={`#${item.id}`}
              className={`block pl-3 border-l text-sm transition-all duration-200 ${
                activeId === item.id
                  ? "border-cyan-400 text-cyan-400 bg-cyan-400/10"
                  : "border-transparent text-gray-300 hover:text-purple-300 hover:border-purple-400/50 hover:bg-purple-400/5"
              }`}
            >
              <div className="py-1.5">
                {item.label}
              </div>
            </Link>
          </li>
        ))}
      </ul>
      
      {list.length === 0 && (
        <div className="text-center py-8">
          <svg className="w-8 h-8 mx-auto mb-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-xs text-gray-500">No sections available</p>
        </div>
      )}
    </aside>
  );
}
