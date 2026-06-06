import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { text } = await req.json();

  if (!text?.trim()) {
    return NextResponse.json({ tasks: [] });
  }

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Ти — AI-планер. Розбери цей текст на окремі задачі.

Текст: "${text}"

Поверни ТІЛЬКИ валідний JSON масив без жодного пояснення:
[
  {
    "text": "назва задачі (коротко, дієслово + об'єкт)",
    "priority": "high" | "medium" | "low",
    "estimatedMinutes": число або null
  }
]

Правила:
- Кожна окрема дія = окрема задача
- priority: high = термінове/важливе, medium = звичайне, low = колись
- estimatedMinutes: реалістична оцінка або null якщо невідомо
- text завжди українською`,
      },
    ],
  });

  const raw = message.content[0].type === "text" ? message.content[0].text : "[]";

  const jsonMatch = raw.match(/\[[\s\S]*\]/);
  const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

  return NextResponse.json({ tasks: parsed });
}
