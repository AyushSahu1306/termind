import { authenticatedFetch } from "../auth/authenticated-fetch.js";
import type { ChatSession, ChatMessage } from "../repl/chat-session.js";
import { marked } from "marked";
import TerminalRenderer from "marked-terminal";
import ora from "ora";

marked.setOptions({
    renderer: new TerminalRenderer() as any
});

export async function chat(message: string, session: ChatSession): Promise<void> {
  if (!message) {
    console.log("Usage: chat <your message>");
    return;
  }

  session.addUserMessage(message);

  const spinner = ora("Thinking...");

  try {
    spinner.start();
    const reply = await chatWithHistory(session.getHistory());
    spinner.stop();
    session.addAssistantMessage(reply);
    console.log(marked(reply));
  } catch (error: any) {
    spinner.fail("Chat request failed");
    // console.error("Chat request failed: ", error.message);
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
