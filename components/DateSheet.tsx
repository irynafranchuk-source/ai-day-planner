"use client";

import { useEffect, useRef, useState } from "react";
import { todayISO } from "@/lib/store";

interface Props {
  onSelect: (date: string) => void;
  onClose: () => void;
}

function addDays(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function nextMonday(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? 1 : 8 - day;
  d.setDate(d.getDate() + diff);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const QUICK = [
  { label: "Сьогодні", sub: "зараз", fn: () => todayISO(), icon: "☀️" },
  { label: "Завтра", sub: "наступний день", fn: () => addDays(1), icon: "🌅" },
  { label: "Наступного тижня", sub: "понеділок", fn: nextMonday, icon: "📅" },
];

export default function DateSheet({ onSelect, onClose }: Props) {
  const [customDate, setCustomDate] = useState("");
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: TouchEvent | MouseEvent) => {
      if (sheetRef.current && !sheetRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [onClose]);

  const handleCustom = (val: string) => {
    setCustomDate(val);
    if (val) onSelect(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end" style={{ backgroundColor: "rgba(6,6,7,0.7)" }}>
      <div ref={sheetRef} className="w-full max-w-[430px] mx-auto pb-safe"
        style={{ backgroundColor: "#3B404C", borderRadius: "20px 20px 0 0", border: "1px solid rgba(255,255,255,0.08)" }}>
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.2)" }} />
        </div>

        <div className="px-4 pt-2 pb-6">
          <p className="text-sm font-medium mb-4" style={{ color: "rgba(255,255,255,0.45)" }}>Призначити на</p>

          <div className="flex flex-col gap-2 mb-4">
            {QUICK.map((q) => (
              <button key={q.label} onClick={() => onSelect(q.fn())}
                className="flex items-center gap-3 p-4 transition-all active:scale-[0.98] text-left"
                style={{ backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 12 }}>
                <span className="text-xl">{q.icon}</span>
                <div>
                  <p className="text-base font-medium" style={{ color: "rgba(255,255,255,0.95)" }}>{q.label}</p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.40)" }}>{q.sub}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Custom date */}
          <div className="flex items-center gap-3 p-4" style={{ backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 12 }}>
            <span className="text-xl">🗓</span>
            <div className="flex-1">
              <p className="text-sm font-medium mb-1" style={{ color: "rgba(255,255,255,0.95)" }}>Інша дата</p>
              <input
                type="date"
                value={customDate}
                min={todayISO()}
                onChange={(e) => handleCustom(e.target.value)}
                className="bg-transparent outline-none text-sm w-full"
                style={{ color: customDate ? "rgba(255,255,255,0.80)" : "rgba(255,255,255,0.35)", colorScheme: "dark" }}
              />
            </div>
          </div>

          <button onClick={onClose} className="w-full h-12 mt-4 text-sm font-medium transition-all active:scale-[0.98]"
            style={{ backgroundColor: "rgba(255,255,255,0.07)", borderRadius: 12, color: "rgba(255,255,255,0.60)" }}>
            Скасувати
          </button>
        </div>
      </div>
    </div>
  );
}
