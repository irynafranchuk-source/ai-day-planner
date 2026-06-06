"use client";

import { useState } from "react";
import { todayISO } from "@/lib/store";

interface Props {
  onSelect: (date: string) => void;
  onClose: () => void;
}

function addDays(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function nextMonday(): string {
  const d = new Date();
  const diff = d.getDay() === 0 ? 1 : 8 - d.getDay();
  d.setDate(d.getDate() + diff);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

const MONTHS_SHORT = ["Січ","Лют","Бер","Кві","Тра","Чер","Лип","Сер","Вер","Жов","Лис","Гру"];
const DAYS_SHORT = ["Пн","Вт","Ср","Чт","Пт","Сб","Нд"];

function calendarDays(year: number, month: number): (number | null)[] {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startPad = (first.getDay() + 6) % 7;
  const days: (number | null)[] = Array(startPad).fill(null);
  for (let d = 1; d <= last.getDate(); d++) days.push(d);
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

function makeISO(year: number, month: number, day: number): string {
  return `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
}

const QUICK = [
  { label: "Сьогодні", icon: "☀️", fn: () => todayISO() },
  { label: "Завтра", icon: "🌅", fn: () => addDays(1) },
  { label: "Наступного тижня", icon: "📅", fn: nextMonday },
];

export default function DateSheet({ onSelect, onClose }: Props) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth());

  const todayStr = todayISO();
  const days = calendarDays(calYear, calMonth);

  const prevMonth = () => {
    if (calMonth === 0) { setCalYear(y => y-1); setCalMonth(11); }
    else setCalMonth(m => m-1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalYear(y => y+1); setCalMonth(0); }
    else setCalMonth(m => m+1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end" style={{ backgroundColor: "rgba(6,6,7,0.75)" }}>
      <div className="w-full max-w-[430px] mx-auto"
        style={{ backgroundColor: "#3B404C", borderRadius: "20px 20px 0 0", border: "1px solid rgba(255,255,255,0.08)" }}>

        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.2)" }} />
        </div>

        <div className="px-4 pb-8">
          <p className="text-xs font-medium mb-3 uppercase tracking-widest"
            style={{ color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em" }}>Призначити на</p>

          {!showCalendar ? (
            <>
              {/* Quick options */}
              <div className="flex flex-col gap-2 mb-3">
                {QUICK.map((q) => (
                  <button key={q.label}
                    onPointerDown={(e) => { e.stopPropagation(); onSelect(q.fn()); }}
                    className="flex items-center gap-3 p-4 text-left w-full transition-all active:scale-[0.98]"
                    style={{ backgroundColor: "rgba(255,255,255,0.07)", borderRadius: 12 }}>
                    <span className="text-xl">{q.icon}</span>
                    <p className="text-base font-medium" style={{ color: "rgba(255,255,255,0.95)" }}>{q.label}</p>
                  </button>
                ))}

                {/* Open calendar */}
                <button
                  onPointerDown={(e) => { e.stopPropagation(); setShowCalendar(true); }}
                  className="flex items-center gap-3 p-4 text-left w-full transition-all active:scale-[0.98]"
                  style={{ backgroundColor: "rgba(255,255,255,0.07)", borderRadius: 12 }}>
                  <span className="text-xl">🗓</span>
                  <p className="text-base font-medium" style={{ color: "rgba(255,255,255,0.95)" }}>Вибрати дату</p>
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Inline calendar */}
              <div className="flex items-center justify-between mb-3">
                <button onPointerDown={(e) => { e.stopPropagation(); prevMonth(); }}
                  className="w-8 h-8 flex items-center justify-center rounded-lg active:scale-90"
                  style={{ backgroundColor: "rgba(255,255,255,0.07)" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.90)" }}>
                  {MONTHS_SHORT[calMonth]} {calYear}
                </p>
                <button onPointerDown={(e) => { e.stopPropagation(); nextMonth(); }}
                  className="w-8 h-8 flex items-center justify-center rounded-lg active:scale-90"
                  style={{ backgroundColor: "rgba(255,255,255,0.07)" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-7 mb-1">
                {DAYS_SHORT.map(d => (
                  <div key={d} className="text-center text-xs py-1" style={{ color: "rgba(255,255,255,0.30)" }}>{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-y-1 mb-3">
                {days.map((day, i) => {
                  if (!day) return <div key={i} />;
                  const iso = makeISO(calYear, calMonth, day);
                  const isToday = iso === todayStr;
                  const isPast = iso < todayStr;
                  return (
                    <button key={iso}
                      disabled={isPast}
                      onPointerDown={(e) => { e.stopPropagation(); if (!isPast) onSelect(iso); }}
                      className="flex items-center justify-center h-9 rounded-xl active:scale-90 transition-all"
                      style={{
                        backgroundColor: isToday ? "rgba(253,52,51,0.20)" : "transparent",
                        opacity: isPast ? 0.25 : 1,
                      }}>
                      <span className="text-sm font-medium"
                        style={{ color: isToday ? "#FD3433" : "rgba(255,255,255,0.85)" }}>
                        {day}
                      </span>
                    </button>
                  );
                })}
              </div>

              <button onPointerDown={(e) => { e.stopPropagation(); setShowCalendar(false); }}
                className="w-full h-10 text-sm mb-2 active:scale-[0.98]"
                style={{ backgroundColor: "rgba(255,255,255,0.07)", borderRadius: 10, color: "rgba(255,255,255,0.55)" }}>
                ← Назад
              </button>
            </>
          )}

          <button onPointerDown={(e) => { e.stopPropagation(); onClose(); }}
            className="w-full h-11 text-sm active:scale-[0.98]"
            style={{ backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 10, color: "rgba(255,255,255,0.40)" }}>
            Скасувати
          </button>
        </div>
      </div>
    </div>
  );
}
