"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getTasks, updateTask, Task } from "@/lib/store";

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
    setTasks(getTasks().filter((t) => t.inToday));
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
    <div className="flex flex-col h-[calc(100svh-64px)] px-4 pt-4">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white">{today}</h1>
        <p className="text-sm mt-1" style={{ color: "#9ca3af" }}>
          {completed} з {total} задач виконано
        </p>
      </div>

      {/* Progress bar */}
      <div
        className="w-full h-2 rounded-full mb-6 overflow-hidden"
        style={{ backgroundColor: "#2a2a2a" }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${progress}%`,
            backgroundColor: "#6366f1",
          }}
        />
      </div>

      {/* Empty state */}
      {tasks.length === 0 && (
        <div className="flex flex-col items-center justify-center flex-1 gap-4 pb-8">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#4b5563"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
            <polyline points="9 16 11 18 15 14" />
          </svg>
          <div className="text-center">
            <p className="text-white font-medium text-lg">
              Немає задач на сьогодні
            </p>
            <p className="text-sm mt-1" style={{ color: "#6b7280" }}>
              Додай задачі з Вхідних
            </p>
          </div>
        </div>
      )}

      {/* Task checklist */}
      {tasks.length > 0 && (
        <div className="flex flex-col gap-3 overflow-y-auto">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-start gap-3 rounded-2xl p-4 transition-all"
              style={{ backgroundColor: "#1a1a1a" }}
            >
              <button onClick={() => toggle(task.id, task.completed)} className="mt-0.5 flex-shrink-0">
              <div
                className="mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                style={{
                  borderColor: task.completed ? "#6366f1" : "#4b5563",
                  backgroundColor: task.completed ? "#6366f1" : "transparent",
                }}
              >
                {task.completed && (
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="2 5 4 7 8 3" />
                  </svg>
                )}
              </div>
              </button>
              <button onClick={() => router.push(`/task/${task.id}`)} className="flex-1 text-left">
                <span
                  className="text-base transition-all"
                  style={{
                    color: task.completed ? "#6b7280" : "white",
                    textDecoration: task.completed ? "line-through" : "none",
                  }}
                >
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
