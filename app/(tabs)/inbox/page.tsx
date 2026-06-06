"use client";

import { useState, useEffect } from "react";
import { getTasks, updateTask, deleteTask, Task } from "@/lib/store";

const priorityColors: Record<Task["priority"], string> = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#22c55e",
};

const priorityLabels: Record<Task["priority"], string> = {
  high: "Висока",
  medium: "Середня",
  low: "Низька",
};

export default function InboxPage() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    setTasks(getTasks().filter((t) => !t.inToday));
  }, []);

  const moveToToday = (id: string) => {
    updateTask(id, { inToday: true });
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const remove = (id: string) => {
    deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="flex flex-col h-[calc(100svh-64px)] px-4 pt-4">
      <div className="flex items-center gap-2 mb-6">
        <h1 className="text-2xl font-bold text-white">Вхідні</h1>
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: "#2a2a2a", color: "#9ca3af" }}
        >
          {tasks.length}
        </span>
      </div>

      {tasks.length === 0 && (
        <div className="flex flex-col items-center justify-center flex-1 gap-4 pb-8">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
            <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
          </svg>
          <div className="text-center">
            <p className="text-white font-medium text-lg">Тут з&apos;являться твої задачі</p>
            <p className="text-sm mt-1" style={{ color: "#6b7280" }}>Продиктуй або напиши на екрані Capture</p>
          </div>
        </div>
      )}

      {tasks.length > 0 && (
        <div className="flex flex-col gap-3 overflow-y-auto pb-4">
          {tasks.map((task) => (
            <div key={task.id} className="rounded-2xl p-4" style={{ backgroundColor: "#1a1a1a" }}>
              <p className="text-white text-base">{task.text}</p>
              <div className="flex gap-2 mt-2 mb-3">
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: `${priorityColors[task.priority]}22`, color: priorityColors[task.priority] }}
                >
                  {priorityLabels[task.priority]}
                </span>
                {task.estimatedMinutes && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: "#2a2a2a", color: "#9ca3af" }}>
                    {task.estimatedMinutes} хв
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => moveToToday(task.id)}
                  className="flex-1 h-10 rounded-xl text-sm font-semibold text-white transition-all active:scale-95"
                  style={{ backgroundColor: "#6366f1" }}
                >
                  + На сьогодні
                </button>
                <button
                  onClick={() => remove(task.id)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95"
                  style={{ backgroundColor: "#2a2a2a" }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6M14 11v6" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
