"use client";

import { useState, useEffect, useRef } from "react";

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setText(saved);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    localStorage.setItem(STORAGE_KEY, e.target.value);
  };

  const handleAnalyze = () => {
    alert("Скоро тут буде AI ✨");
    setText("");
    localStorage.removeItem(STORAGE_KEY);
  };

  const startRecording = () => setIsRecording(true);
  const stopRecording = () => setIsRecording(false);

  return (
    <div className="flex flex-col h-[calc(100svh-64px)] px-4 pt-4 pb-4">
      {/* Header */}
      <h1
        className="text-center text-sm font-medium mb-4"
        style={{ color: "#9ca3af" }}
      >
        AI Планер
      </h1>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={text}
        onChange={handleChange}
        placeholder="Що в голові?"
        className="flex-1 w-full text-xl p-4 rounded-2xl resize-none outline-none text-white placeholder:text-gray-600"
        style={{ backgroundColor: "#1a1a1a" }}
      />

      {/* Mic button */}
      <div className="flex flex-col items-center gap-3 mt-4">
        <button
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          onMouseLeave={stopRecording}
          onTouchStart={startRecording}
          onTouchEnd={stopRecording}
          className={`flex items-center justify-center rounded-full transition-all active:scale-95 ${isRecording ? "recording-pulse" : ""}`}
          style={{
            width: 80,
            height: 80,
            backgroundColor: isRecording ? "#dc2626" : "#6366f1",
          }}
          aria-label="Записати голос"
        >
          <MicIcon size={32} />
        </button>
        <p className="text-xs" style={{ color: "#6b7280" }}>
          або просто друкуй
        </p>
      </div>

      {/* Analyze button */}
      <button
        onClick={handleAnalyze}
        className="w-full mt-4 h-14 text-lg font-semibold rounded-2xl text-white transition-all active:scale-[0.98]"
        style={{ backgroundColor: "#6366f1" }}
      >
        Розібрати
      </button>

    </div>
  );
}
