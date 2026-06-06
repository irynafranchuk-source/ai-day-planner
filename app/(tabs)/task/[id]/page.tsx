"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { getTask, updateTask, deleteTask, Task, Subtask } from "@/lib/store";

const priorityOptions: { value: Task["priority"]; label: string; color: string }[] = [
  { value: "high", label: "Висока", color: "#ef4444" },
  { value: "medium", label: "Середня", color: "#f59e0b" },
  { value: "low", label: "Низька", color: "#22c55e" },
];

export default function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [text, setText] = useState("");
  const [notes, setNotes] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("medium");
  const [estimatedMinutes, setEstimatedMinutes] = useState("");
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtask, setNewSubtask] = useState("");

  useEffect(() => {
    const t = getTask(id);
    if (!t) { router.back(); return; }
    setTask(t);
    setText(t.text);
    setNotes(t.notes ?? "");
    setPriority(t.priority);
    setEstimatedMinutes(t.estimatedMinutes?.toString() ?? "");
    setSubtasks(t.subtasks ?? []);
  }, [id, router]);

  const save = (patch: Partial<Task>) => {
    updateTask(id, patch);
    setTask((prev) => prev ? { ...prev, ...patch } : prev);
  };

  const handleTextBlur = () => save({ text });
  const handleNotesBlur = () => save({ notes });
  const handlePriority = (p: Task["priority"]) => { setPriority(p); save({ priority: p }); };
  const handleMinutes = (val: string) => {
    setEstimatedMinutes(val);
    save({ estimatedMinutes: val ? parseInt(val) : undefined });
  };

  const addSubtask = () => {
    if (!newSubtask.trim()) return;
    const updated = [...subtasks, { id: crypto.randomUUID(), text: newSubtask.trim(), completed: false }];
    setSubtasks(updated);
    save({ subtasks: updated });
    setNewSubtask("");
  };

  const toggleSubtask = (sid: string) => {
    const updated = subtasks.map((s) => s.id === sid ? { ...s, completed: !s.completed } : s);
    setSubtasks(updated);
    save({ subtasks: updated });
  };

  const deleteSubtask = (sid: string) => {
    const updated = subtasks.filter((s) => s.id !== sid);
    setSubtasks(updated);
    save({ subtasks: updated });
  };

  const handleDelete = () => {
    deleteTask(id);
    router.back();
  };

  if (!task) return null;

  return (
    <div className="flex flex-col h-[calc(100svh-64px)] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center rounded-xl transition-all active:scale-95"
          style={{ backgroundColor: "#1a1a1a" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-white flex-1">Задача</h1>
        <button
          onClick={handleDelete}
          className="w-10 h-10 flex items-center justify-center rounded-xl transition-all active:scale-95"
          style={{ backgroundColor: "#1a1a1a" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
          </svg>
        </button>
      </div>

      <div className="flex flex-col gap-4 px-4 pb-8">
        {/* Task text */}
        <div className="rounded-2xl p-4" style={{ backgroundColor: "#1a1a1a" }}>
          <p className="text-xs mb-2" style={{ color: "#6b7280" }}>Назва задачі</p>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={handleTextBlur}
            className="w-full text-white text-lg bg-transparent outline-none resize-none"
            rows={2}
          />
        </div>

        {/* Priority */}
        <div className="rounded-2xl p-4" style={{ backgroundColor: "#1a1a1a" }}>
          <p className="text-xs mb-3" style={{ color: "#6b7280" }}>Пріоритет</p>
          <div className="flex gap-2">
            {priorityOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handlePriority(opt.value)}
                className="flex-1 h-10 rounded-xl text-sm font-medium transition-all active:scale-95"
                style={{
                  backgroundColor: priority === opt.value ? `${opt.color}22` : "#2a2a2a",
                  color: priority === opt.value ? opt.color : "#9ca3af",
                  border: `1.5px solid ${priority === opt.value ? opt.color : "transparent"}`,
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Estimated time */}
        <div className="rounded-2xl p-4" style={{ backgroundColor: "#1a1a1a" }}>
          <p className="text-xs mb-2" style={{ color: "#6b7280" }}>Час (хвилини)</p>
          <input
            type="number"
            value={estimatedMinutes}
            onChange={(e) => handleMinutes(e.target.value)}
            placeholder="Наприклад: 30"
            className="w-full text-white text-base bg-transparent outline-none"
            style={{ color: "white" }}
          />
        </div>

        {/* Notes */}
        <div className="rounded-2xl p-4" style={{ backgroundColor: "#1a1a1a" }}>
          <p className="text-xs mb-2" style={{ color: "#6b7280" }}>Нотатки</p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={handleNotesBlur}
            placeholder="Додай деталі..."
            className="w-full text-white text-base bg-transparent outline-none resize-none placeholder:text-gray-600"
            rows={4}
          />
        </div>

        {/* Subtasks */}
        <div className="rounded-2xl p-4" style={{ backgroundColor: "#1a1a1a" }}>
          <p className="text-xs mb-3" style={{ color: "#6b7280" }}>Підзадачі</p>

          {subtasks.length > 0 && (
            <div className="flex flex-col gap-2 mb-3">
              {subtasks.map((s) => (
                <div key={s.id} className="flex items-center gap-3">
                  <button
                    onClick={() => toggleSubtask(s.id)}
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                    style={{
                      borderColor: s.completed ? "#6366f1" : "#4b5563",
                      backgroundColor: s.completed ? "#6366f1" : "transparent",
                    }}
                  >
                    {s.completed && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="2 5 4 7 8 3" />
                      </svg>
                    )}
                  </button>
                  <span
                    className="flex-1 text-sm"
                    style={{ color: s.completed ? "#6b7280" : "white", textDecoration: s.completed ? "line-through" : "none" }}
                  >
                    {s.text}
                  </span>
                  <button onClick={() => deleteSubtask(s.id)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <input
              value={newSubtask}
              onChange={(e) => setNewSubtask(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSubtask()}
              placeholder="+ Нова підзадача"
              className="flex-1 text-sm bg-transparent outline-none text-white placeholder:text-gray-600"
            />
            <button
              onClick={addSubtask}
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "#6366f1" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
