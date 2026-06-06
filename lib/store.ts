export interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

export interface Task {
  id: string;
  text: string;
  priority: "high" | "medium" | "low";
  estimatedMinutes?: number;
  completed: boolean;
  inToday: boolean;
  createdAt: number;
  notes?: string;
  subtasks?: Subtask[];
}

const STORAGE_KEY = "ai-day-planner-tasks";

export function getTasks(): Task[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveTasks(tasks: Task[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

export function addTask(task: Task): void {
  const tasks = getTasks();
  tasks.push(task);
  saveTasks(tasks);
}

export function getTask(id: string): Task | undefined {
  return getTasks().find((t) => t.id === id);
}

export function updateTask(id: string, patch: Partial<Task>): void {
  const tasks = getTasks().map((t) => (t.id === id ? { ...t, ...patch } : t));
  saveTasks(tasks);
}

export function deleteTask(id: string): void {
  const tasks = getTasks().filter((t) => t.id !== id);
  saveTasks(tasks);
}
