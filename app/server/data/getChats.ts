"use server"

import { validateDetails } from "../auth/auth"
import { Chat, readDB } from "../db/db";

export async function getChats(username: string, password: string): Promise<{ [key: string]: Chat }> {
    if (!validateDetails(username, password)) return {};

    const db = await readDB();

    return db.users[username].chats;
}