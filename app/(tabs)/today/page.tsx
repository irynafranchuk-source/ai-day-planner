"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getTasks, updateTask, Task, todayISO } from "@/lib/store";

const UKRAINIAN_DAYS = [
  "Нд",
  "Пн",
  "Вт",
  "Ср",
  "Чт",
  "Пт",
  "Сб",
];

const UKRAINIAN_MONTHS = [
  "січня",
  "лютого",
  "березня",
  "квітня",
  "травня",
  "червня",
  "липня",
  "серпня",
  "вересня",
  "жовтня",
  "листопада",
  "грудня",
];

function formatDate(date: Date): string {
  const day = UKRAINIAN_DAYS[date.getDay()];
  const month = UKRAINIAN_MONTHS[date.getMonth()];
  return `${day}, ${date.getDate()} ${month}`;
}

export default function TodayPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const router = useRouter();
  const today = formatDate(new Date());

  useEffect(() => {
    const today = todayISO();
    setTasks(getTasks().filter((t) => t.inToday || t.dueDate === today));
  }, []);

  const completed = tasks.filter((t) => t.completed).length;
  const total = tasks.length;
  const progress = total > 0 ? (completed / total) * 100 : 0;

  const toggle = (id: string, current: boolean) => {
    updateTask(id, { completed: !current });
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !current } : t))
    );
  };

  return (
    <div className="flex flex-col h-[calc(100svh-64px)] px-4 pt-5">
      <div className="mb-4">
        <h1 className="text-2xl font-medium" style={{ color: "rgba(255,255,255,0.95)", letterSpacing: "-0.02em" }}>{today}</h1>
        <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.40)" }}>
          {completed} з {total} задач виконано
        </p>
      </div>

      <div className="w-full h-1 rounded-full mb-6 overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, backgroundColor: "#FD3433" }} />
      </div>

      {tasks.length === 0 && (
        <div className="flex flex-col items-center justify-center flex-1 gap-4 pb-8">
          <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
            <polyline points="9 16 11 18 15 14" />
          </svg>
          <div className="text-center">
            <p className="font-medium text-base" style={{ color: "rgba(255,255,255,0.70)" }}>Немає задач на сьогодні</p>
            <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>Додай задачі з Вхідних</p>
          </div>
        </div>
      )}

      {tasks.length > 0 && (
        <div className="flex flex-col gap-3 overflow-y-auto pb-4">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-center gap-3 p-4 transition-all"
              style={{ backgroundColor: "#3B404C", borderRadius: 16, border: "1px solid rgba(255,255,255,0.06)" }}>
              <button onClick={() => toggle(task.id, task.completed)} className="flex-shrink-0">
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
                <span className="text-base transition-all"
                  style={{ color: task.completed ? "rgba(255,255,255,0.30)" : "rgba(255,255,255,0.95)", textDecoration: task.completed ? "line-through" : "none" }}>
                  {task.text}
                </span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
