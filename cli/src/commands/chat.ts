import { authenticatedFetch } from "../auth/authenticated-fetch.js";
import type { ChatSession,ChatMessage } from "../repl/chat-session.js";

export async function chat(message: string,session:ChatSession): Promise<void> {
  if (!message) {
    console.log("Usage: chat <your message>");
    return;
  }

  session.addUserMessage(message);

  try {
    const reply = await chatWithHistory(session.getHistory());
    session.addAssistantMessage(reply);
    console.log(reply);
  } catch (error:any) {
    console.error("Chat request failed: ", error.message);
  }
}

export async function chatWithHistory(
  messages: ChatMessage[]
): Promise<string> {
  const res = await authenticatedFetch("http://localhost:3000/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Chat request failed");
  }

  const data = await res.json();
  return data.reply;
}
