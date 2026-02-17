"use server"
import ollama from "ollama";

export async function generateTitle(message: string): Promise<string> {
    const response = await ollama.chat({
        model: "llama3.2",
        messages: [{
            role: "assistant",
            content: "When messaged by the user, you will respond with nothing but a 2-4 word brief summary title of the conversation the user is trying to initiate"
        }, {
            role: "user",
            content: message
        }],
    });

    return response.message.content ?? "Untitled";
}