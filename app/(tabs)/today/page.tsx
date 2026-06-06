"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getTasks, updateTask, deleteTask, Task, todayISO, formatDueDate } from "@/lib/store";
import DateSheet from "@/components/DateSheet";

const DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];
const MONTHS = ["Січень","Лютий","Березень","Квітень","Травень","Червень","Липень","Серпень","Вересень","Жовтень","Листопад","Грудень"];

function toISO(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
}

function calendarDays(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  // Monday-first: 0=Mon..6=Sun
  const startPad = (first.getDay() + 6) % 7;
  const days: (Date | null)[] = Array(startPad).fill(null);
  for (let d = 1; d <= last.getDate(); d++) days.push(new Date(year, month, d));
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

const priorityColors: Record<Task["priority"], string> = {
  high: "#FD3433", medium: "#f59e0b", low: "#22c55e",
};

export default function CalendarPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedISO, setSelectedISO] = useState(todayISO());
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [dateSheetFor, setDateSheetFor] = useState<string | null>(null);

  useEffect(() => {
    setTasks(getTasks().filter((t) => !!t.dueDate || t.inToday));
  }, []);

  const todayStr = todayISO();
  const days = calendarDays(viewYear, viewMonth);

  // tasks grouped by date
  const byDate: Record<string, Task[]> = {};
  tasks.forEach((t) => {
    const key = t.dueDate ?? (t.inToday ? todayStr : null);
    if (key) { byDate[key] = byDate[key] ?? []; byDate[key].push(t); }
  });

  const selectedTasks = byDate[selectedISO] ?? [];

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const toggleTask = (id: string, current: boolean) => {
    updateTask(id, { completed: !current });
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !current } : t));
  };

  const removeTask = (id: string) => {
    deleteTask(id);
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const reassignDate = (taskId: string, date: string) => {
    updateTask(taskId, { dueDate: date, inToday: date === todayStr });
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, dueDate: date, inToday: date === todayStr } : t));
    setDateSheetFor(null);
  };

  return (
    <div className="flex flex-col h-[calc(100svh-64px)]">
      {/* Calendar header */}
      <div className="px-4 pt-5 pb-3" style={{ backgroundColor: "#222631" }}>
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="w-9 h-9 flex items-center justify-center rounded-xl active:scale-95"
            style={{ backgroundColor: "rgba(255,255,255,0.07)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h2 className="text-base font-medium" style={{ color: "rgba(255,255,255,0.95)", letterSpacing: "-0.01em" }}>
            {MONTHS[viewMonth]} {viewYear}
          </h2>
          <button onClick={nextMonth} className="w-9 h-9 flex items-center justify-center rounded-xl active:scale-95"
            style={{ backgroundColor: "rgba(255,255,255,0.07)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {DAYS.map(d => (
            <div key={d} className="text-center text-xs font-medium py-1"
              style={{ color: "rgba(255,255,255,0.30)" }}>{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-y-1">
          {days.map((date, i) => {
            if (!date) return <div key={i} />;
            const iso = toISO(date);
            const isToday = iso === todayStr;
            const isSelected = iso === selectedISO;
            const hasTasks = !!byDate[iso]?.length;
            const allDone = hasTasks && byDate[iso].every(t => t.completed);

            return (
              <button key={iso} onClick={() => setSelectedISO(iso)}
                className="flex flex-col items-center py-1.5 rounded-xl transition-all active:scale-90"
                style={{
                  backgroundColor: isSelected ? "#FD3433" : isToday ? "rgba(253,52,51,0.12)" : "transparent",
                }}>
                <span className="text-sm font-medium leading-none"
                  style={{ color: isSelected ? "#fff" : isToday ? "#FD3433" : "rgba(255,255,255,0.80)" }}>
                  {date.getDate()}
                </span>
                <div className="h-1.5 mt-0.5 flex items-center justify-center">
                  {hasTasks && (
                    <div className="w-1 h-1 rounded-full"
                      style={{ backgroundColor: isSelected ? "rgba(255,255,255,0.7)" : allDone ? "rgba(255,255,255,0.25)" : "#FD3433" }} />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tasks for selected day */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4">
        <div className="flex items-center gap-2 mb-4">
          <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.55)" }}>
            {selectedISO === todayStr ? "Сьогодні" : formatDueDate(selectedISO)}
          </p>
          {selectedTasks.length > 0 && (
            <span className="text-xs px-1.5 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: "rgba(253,52,51,0.15)", color: "#FD3433" }}>
              {selectedTasks.length}
            </span>
          )}
        </div>

        {selectedTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.25)" }}>Немає задач на цей день</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {selectedTasks.map(task => (
              <div key={task.id} className="p-4"
                style={{ backgroundColor: "#3B404C", borderRadius: 16, border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex items-start gap-3">
                  <button onClick={() => toggleTask(task.id, task.completed)} className="mt-0.5 flex-shrink-0">
                    <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
                      style={{ borderColor: task.completed ? "#FD3433" : "rgba(255,255,255,0.25)", backgroundColor: task.completed ? "#FD3433" : "transparent" }}>
                      {task.completed && (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="2 5 4 7 8 3" />
                        </svg>
                      )}
                    </div>
                  </button>
                  <button onClick={() => router.push(`/task/${task.id}`)} className="flex-1 text-left">
                    <p className="text-base" style={{
                      color: task.completed ? "rgba(255,255,255,0.30)" : "rgba(255,255,255,0.95)",
                      textDecoration: task.completed ? "line-through" : "none"
                    }}>{task.text}</p>
                  </button>
                  <button onClick={() => removeTask(task.id)} className="flex-shrink-0 p-1 active:scale-90">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                <div className="flex items-center justify-between mt-2 ml-8">
                  <div className="flex gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ backgroundColor: `${priorityColors[task.priority]}18`, color: priorityColors[task.priority] }}>
                      {task.priority === "high" ? "Висока" : task.priority === "medium" ? "Середня" : "Низька"}
                    </span>
                    {task.estimatedMinutes && (
                      <span className="text-xs px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.45)" }}>
                        {task.estimatedMinutes} хв
                      </span>
                    )}
                  </div>
                  <button onClick={() => setDateSheetFor(task.id)}
                    className="text-xs active:scale-95"
                    style={{ color: "rgba(255,255,255,0.30)" }}>
                    перенести
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {dateSheetFor && (
        <DateSheet
          onSelect={(date) => reassignDate(dateSheetFor, date)}
          onClose={() => setDateSheetFor(null)}
        />
      )}
    </div>
  );
}
