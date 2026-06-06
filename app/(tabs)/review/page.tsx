"use client";

import { useState, useEffect } from "react";
import { getTasks, Task } from "@/lib/store";

const DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];

function getWeekRange(): { start: Date; end: Date; startISO: string; endISO: string } {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = (day === 0 ? -6 : 1 - day);
  const start = new Date(now);
  start.setDate(now.getDate() + diffToMonday);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  const toISO = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;

  return { start, end, startISO: toISO(start), endISO: toISO(end) };
}

function toISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function formatShortDate(d: Date): string {
  return `${d.getDate()} ${["січ","лют","бер","кві","тра","чер","лип","сер","вер","жов","лис","гру"][d.getMonth()]}`;
}

export default function ReviewPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { start, end, startISO, endISO } = getWeekRange();

  useEffect(() => {
    const all = getTasks();
    const weekTasks = all.filter(t => {
      const date = t.dueDate ?? (t.inToday ? toISO(new Date()) : null);
      return date && date >= startISO && date <= endISO;
    });
    setTasks(weekTasks);
  }, [startISO, endISO]);

  const completed = tasks.filter(t => t.completed);
  const total = tasks.length;
  const rate = total > 0 ? Math.round((completed.length / total) * 100) : 0;

  // Per day stats
  const dayStats = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const iso = toISO(d);
    const dayTasks = tasks.filter(t => (t.dueDate ?? (t.inToday ? toISO(new Date()) : null)) === iso);
    return {
      label: DAYS[i],
      total: dayTasks.length,
      done: dayTasks.filter(t => t.completed).length,
      isToday: iso === toISO(new Date()),
    };
  });

  const maxDone = Math.max(...dayStats.map(d => d.done), 1);
  const bestDay = dayStats.reduce((a, b) => b.done > a.done ? b : a, dayStats[0]);

  const circumference = 2 * Math.PI * 40;
  const dashOffset = circumference - (rate / 100) * circumference;

  return (
    <div className="flex flex-col h-[calc(100svh-64px)] overflow-y-auto px-4 pt-5 pb-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-medium" style={{ color: "rgba(255,255,255,0.95)", letterSpacing: "-0.02em" }}>
          Тижневий огляд
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.40)" }}>
          {formatShortDate(start)} — {formatShortDate(end)}
        </p>
      </div>

      {/* Main stats */}
      <div className="rounded-2xl p-5 mb-4 flex items-center gap-5"
        style={{ backgroundColor: "#3B404C", border: "1px solid rgba(255,255,255,0.06)" }}>
        {/* Ring */}
        <div className="relative flex-shrink-0">
          <svg width="96" height="96" viewBox="0 0 96 96">
            <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="8" />
            <circle cx="48" cy="48" r="40" fill="none" stroke="#FD3433" strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 48 48)"
              style={{ transition: "stroke-dashoffset 0.8s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-medium" style={{ color: "rgba(255,255,255,0.95)", lineHeight: 1 }}>{rate}%</span>
          </div>
        </div>

        {/* Numbers */}
        <div className="flex flex-col gap-3 flex-1">
          <div>
            <p className="text-3xl font-medium" style={{ color: "rgba(255,255,255,0.95)", letterSpacing: "-0.02em" }}>
              {completed.length}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.40)" }}>задач виконано</p>
          </div>
          <div className="flex gap-4">
            <div>
              <p className="text-lg font-medium" style={{ color: "rgba(255,255,255,0.80)" }}>{total}</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>заплановано</p>
            </div>
            <div>
              <p className="text-lg font-medium" style={{ color: "rgba(255,255,255,0.80)" }}>{total - completed.length}</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>залишилось</p>
            </div>
          </div>
        </div>
      </div>

      {/* Day chart */}
      <div className="rounded-2xl p-4 mb-4"
        style={{ backgroundColor: "#3B404C", border: "1px solid rgba(255,255,255,0.06)" }}>
        <p className="text-xs font-medium mb-4 uppercase tracking-widest"
          style={{ color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em" }}>По днях</p>
        <div className="flex items-end justify-between gap-1 h-20">
          {dayStats.map((day) => (
            <div key={day.label} className="flex flex-col items-center gap-1.5 flex-1">
              <div className="w-full flex flex-col justify-end" style={{ height: 56 }}>
                {/* Background bar */}
                <div className="w-full rounded-md overflow-hidden" style={{ height: 56, backgroundColor: "rgba(255,255,255,0.06)", position: "relative" }}>
                  {day.total > 0 && (
                    <div className="absolute bottom-0 w-full rounded-md transition-all duration-700"
                      style={{
                        height: `${(day.total / Math.max(...dayStats.map(d => d.total), 1)) * 100}%`,
                        backgroundColor: "rgba(255,255,255,0.10)",
                      }} />
                  )}
                  {day.done > 0 && (
                    <div className="absolute bottom-0 w-full rounded-md transition-all duration-700"
                      style={{
                        height: `${(day.done / maxDone) * 100}%`,
                        backgroundColor: day.isToday ? "#FD3433" : "rgba(253,52,51,0.60)",
                      }} />
                  )}
                </div>
              </div>
              <span className="text-xs font-medium"
                style={{ color: day.isToday ? "#FD3433" : "rgba(255,255,255,0.35)" }}>
                {day.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Best day */}
      {bestDay.done > 0 && (
        <div className="rounded-2xl p-4 mb-4 flex items-center gap-3"
          style={{ backgroundColor: "rgba(253,52,51,0.10)", border: "1px solid rgba(253,52,51,0.20)" }}>
          <span className="text-2xl">🏆</span>
          <div>
            <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.90)" }}>
              Найкращий день — {bestDay.label}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>
              {bestDay.done} задач виконано
            </p>
          </div>
        </div>
      )}

      {/* Completed tasks list */}
      {completed.length > 0 && (
        <div>
          <p className="text-xs font-medium mb-3 uppercase tracking-widest"
            style={{ color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em" }}>Виконані задачі</p>
          <div className="flex flex-col gap-2">
            {completed.map(task => (
              <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl"
                style={{ backgroundColor: "#3B404C", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "#FD3433" }}>
                  <svg width="8" height="8" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="2 5 4 7 8 3" />
                  </svg>
                </div>
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.70)", textDecoration: "line-through" }}>
                  {task.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {total === 0 && (
        <div className="flex flex-col items-center justify-center flex-1 gap-4 py-12">
          <span className="text-5xl">📊</span>
          <div className="text-center">
            <p className="font-medium text-base" style={{ color: "rgba(255,255,255,0.70)" }}>Ще немає даних</p>
            <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>Заплануй задачі на цей тиждень</p>
          </div>
        </div>
      )}
    </div>
  );
}
