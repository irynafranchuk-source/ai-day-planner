"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { getTask, updateTask, deleteTask, Task, Subtask, todayISO, formatDueDate } from "@/lib/store";
import DateSheet from "@/components/DateSheet";

const priorityOptions: { value: Task["priority"]; label: string; color: string }[] = [
  { value: "high", label: "Висока", color: "#FD3433" },
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
  const [showDateSheet, setShowDateSheet] = useState(false);

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

  const assignDate = (date: string) => {
    const isToday = date === todayISO();
    save({ dueDate: date, inToday: isToday });
    setShowDateSheet(false);
  };

  const cardStyle = { backgroundColor: "#3B404C", borderRadius: 16, border: "1px solid rgba(255,255,255,0.06)" };
  const labelStyle = { color: "rgba(255,255,255,0.40)", fontSize: "0.75rem", marginBottom: 8, fontWeight: 500 };

  return (
    <div className="flex flex-col h-[calc(100svh-64px)] overflow-y-auto">
      <div className="flex items-center gap-3 px-4 pt-5 pb-3">
        <button onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center transition-all active:scale-95"
          style={{ backgroundColor: "rgba(255,255,255,0.07)", borderRadius: 10 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="text-lg font-medium flex-1" style={{ color: "rgba(255,255,255,0.95)", letterSpacing: "-0.02em" }}>Задача</h1>
        <button onClick={handleDelete}
          className="w-10 h-10 flex items-center justify-center transition-all active:scale-95"
          style={{ backgroundColor: "rgba(253,52,51,0.1)", borderRadius: 10 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FD3433" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
          </svg>
        </button>
      </div>

      <div className="flex flex-col gap-3 px-4 pb-8">
        <div className="p-4" style={cardStyle}>
          <p style={labelStyle}>Назва задачі</p>
          <textarea value={text} onChange={(e) => setText(e.target.value)} onBlur={handleTextBlur}
            className="w-full text-lg bg-transparent outline-none resize-none"
            style={{ color: "rgba(255,255,255,0.95)", caretColor: "#FD3433" }} rows={2} />
        </div>

        <div className="p-4" style={cardStyle}>
          <p style={labelStyle}>Пріоритет</p>
          <div className="flex gap-2">
            {priorityOptions.map((opt) => (
              <button key={opt.value} onClick={() => handlePriority(opt.value)}
                className="flex-1 h-10 text-sm font-medium transition-all active:scale-95"
                style={{
                  borderRadius: 10,
                  backgroundColor: priority === opt.value ? `${opt.color}20` : "rgba(255,255,255,0.06)",
                  color: priority === opt.value ? opt.color : "rgba(255,255,255,0.45)",
                  border: `1.5px solid ${priority === opt.value ? opt.color : "transparent"}`,
                }}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4" style={cardStyle}>
          <p style={labelStyle}>Дата виконання</p>
          <button onClick={() => setShowDateSheet(true)} className="w-full text-left transition-all active:scale-[0.98]">
            <p className="text-base font-medium"
              style={{ color: task.dueDate ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.35)" }}>
              {task.dueDate ? formatDueDate(task.dueDate) : "Не призначено"}
            </p>
          </button>
        </div>

        <div className="p-4" style={cardStyle}>
          <p style={labelStyle}>Час (хвилини)</p>
          <input type="number" value={estimatedMinutes} onChange={(e) => handleMinutes(e.target.value)}
            placeholder="Наприклад: 30"
            className="w-full text-base bg-transparent outline-none"
            style={{ color: "rgba(255,255,255,0.95)", caretColor: "#FD3433" }} />
        </div>

        <div className="p-4" style={cardStyle}>
          <p style={labelStyle}>Нотатки</p>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} onBlur={handleNotesBlur}
            placeholder="Додай деталі..."
            className="w-full text-base bg-transparent outline-none resize-none"
            style={{ color: "rgba(255,255,255,0.95)", caretColor: "#FD3433" }}
            rows={4} />
        </div>

        <div className="p-4" style={cardStyle}>
          <p style={labelStyle}>Підзадачі</p>
          {subtasks.length > 0 && (
            <div className="flex flex-col gap-3 mb-3">
              {subtasks.map((s) => (
                <div key={s.id} className="flex items-center gap-3">
                  <button onClick={() => toggleSubtask(s.id)}
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                    style={{ borderColor: s.completed ? "#FD3433" : "rgba(255,255,255,0.25)", backgroundColor: s.completed ? "#FD3433" : "transparent" }}>
                    {s.completed && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="2 5 4 7 8 3" />
                      </svg>
                    )}
                  </button>
                  <span className="flex-1 text-sm"
                    style={{ color: s.completed ? "rgba(255,255,255,0.30)" : "rgba(255,255,255,0.90)", textDecoration: s.completed ? "line-through" : "none" }}>
                    {s.text}
                  </span>
                  <button onClick={() => deleteSubtask(s.id)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2 pt-1" style={{ borderTop: subtasks.length > 0 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
            <input value={newSubtask} onChange={(e) => setNewSubtask(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSubtask()}
              placeholder="Нова підзадача"
              className="flex-1 text-sm bg-transparent outline-none"
              style={{ color: "rgba(255,255,255,0.90)", caretColor: "#FD3433" }} />
            <button onClick={addSubtask}
              className="w-8 h-8 flex items-center justify-center transition-all active:scale-95"
              style={{ backgroundColor: "#FD3433", borderRadius: 8 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    {showDateSheet && (
      <DateSheet onSelect={assignDate} onClose={() => setShowDateSheet(false)} />
    )}
  );
}
