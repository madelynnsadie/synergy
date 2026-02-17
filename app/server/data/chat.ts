"use server";

import { Chat, getChatFromID, updateChat } from "@/app/server/db/db";
import ollama from "ollama";
import { Message as OllamaMessage } from "ollama";
import crypto from "crypto";
import { generateTitle } from "@/app/title";
import { validateDetails } from "../auth/auth";

export type Message = Pick<OllamaMessage, "content" | "role">;

export interface ChatBody {
  newMessage: string;
  id: string;
}

export async function handleChat(chatBody: ChatBody, username: string, password: string) {
  if (!validateDetails(username, password)) throw new Error("unauthorised");

  let foundChat: Chat;

  if (chatBody.id === "new") {
    foundChat = {
      ID: crypto.createHash("md5").update(Date.now().toString()).digest("hex"),
      messages: [],
      title: await generateTitle(chatBody.newMessage),
    };
  } else {
    const findChat = await getChatFromID(chatBody.id, username);

    if (!findChat) throw new Error("invalid chat id");
    foundChat = findChat;
  }

  const messages: Message[] = [
    ...foundChat.messages,
    {
      content: chatBody.newMessage,
      role: "user",
    },
  ];

  const prompt: Message = {
    role: "system",
    content: "",
  };

  const response = await ollama.chat({
    model: "llama3.2",
    messages: [prompt, ...messages],
  });

  foundChat.messages = [...messages, response.message];
  await updateChat(username, foundChat);

  return foundChat;
}
