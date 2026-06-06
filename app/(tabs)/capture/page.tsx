"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { addTask } from "@/lib/store";

const MicIcon = ({ size = 32 }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="22" />
  </svg>
);

const STORAGE_KEY = "ai-day-planner-capture-text";

export default function CapturePage() {
  const [text, setText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setText(saved);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setSpeechSupported(!!SpeechRecognition);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    localStorage.setItem(STORAGE_KEY, e.target.value);
  };

  const handleAnalyze = async () => {
    if (!text.trim() || isLoading) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Server error");
      const { tasks } = data;
      tasks.forEach((t: { text: string; priority: "high" | "medium" | "low"; estimatedMinutes?: number }) =>
        addTask({
          id: crypto.randomUUID(),
          text: t.text,
          priority: t.priority ?? "medium",
          estimatedMinutes: t.estimatedMinutes ?? undefined,
          completed: false,
          inToday: false,
          createdAt: Date.now(),
        })
      );
      setText("");
      localStorage.removeItem(STORAGE_KEY);
      router.push("/inbox");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Невідома помилка";
      alert("Помилка: " + msg);
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { alert("SpeechRecognition не знайдено в цьому браузері"); return; }

    const recognition = new SpeechRecognition();
    recognition.lang = "uk-UA";
    recognition.continuous = true;
    recognition.interimResults = true;

    let baseText = text;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript + " ";
        } else {
          interim += transcript;
        }
      }
      if (final) baseText += final;
      const newText = baseText + interim;
      setText(newText);
      localStorage.setItem(STORAGE_KEY, newText);
    };

    recognition.onerror = (e: unknown) => { alert("Помилка мікрофона: " + JSON.stringify(e)); stopRecording(); };
    recognition.onend = () => {
      // Safari зупиняє запис після паузи — перезапускаємо якщо ще активний
      if (recognitionRef.current) {
        try { recognitionRef.current.start(); } catch { setIsRecording(false); }
      } else {
        setIsRecording(false);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsRecording(false);
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100svh-64px)] px-4 pt-4 pb-4">
      <h1
        className="text-center text-sm font-medium mb-4"
        style={{ color: "#9ca3af" }}
      >
        AI Планер
      </h1>

      <textarea
        ref={textareaRef}
        value={text}
        onChange={handleChange}
        placeholder="Що в голові?"
        className="flex-1 w-full text-xl p-4 rounded-2xl resize-none outline-none text-white placeholder:text-gray-600"
        style={{ backgroundColor: "#1a1a1a" }}
      />

      <div className="flex flex-col items-center gap-3 mt-4">
        <button
          onClick={toggleRecording}
          className={`flex items-center justify-center rounded-full transition-all active:scale-95 ${isRecording ? "recording-pulse" : ""}`}
          style={{
            width: 80,
            height: 80,
            backgroundColor: isRecording ? "#dc2626" : "#6366f1",
          }}
          aria-label={isRecording ? "Зупинити запис" : "Записати голос"}
        >
          <MicIcon size={32} />
        </button>
        <p className="text-xs" style={{ color: "#6b7280" }}>
          {!speechSupported
            ? "Голос не підтримується в цьому браузері"
            : isRecording
            ? "Говори… натисни ще раз щоб зупинити"
            : "або просто друкуй"}
        </p>
      </div>

      <button
        onClick={handleAnalyze}
        disabled={isLoading || !text.trim()}
        className="w-full mt-4 h-14 text-lg font-semibold rounded-2xl text-white transition-all active:scale-[0.98] disabled:opacity-50"
        style={{ backgroundColor: "#6366f1" }}
      >
        {isLoading ? "Розбираю..." : "Розібрати"}
      </button>
    </div>
  );
}
