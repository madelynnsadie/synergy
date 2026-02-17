"use server"

import fs from "fs";
import path from "path";
import { Message } from "../data/chat";

export interface Chat {
    ID: string;
    messages: Message[];
    title: string;
}

export interface User {
    password: string;
    chats: { [id: string]: Chat };
    admin?: boolean;
}

export interface DBData {
    users: { [key: string]: User }
}

const DBPath = process.env.SYNERGY_DATA as string;

// doesn't eval the username or id but it's only called from chat so oh well, should be fine :3
export async function updateChat(user: string, chat: Chat) {
    const mutDB = await readDB();

    mutDB.users[user].chats[chat.ID] = chat;
    await writeDB(mutDB);
}

export async function getChatFromID(id: string, user: string): Promise<Chat | undefined> {
    return (await readDB()).users[user].chats[id];
}

// DO NOT PUSH TO PROD WITH THIS IN A VAR!!
export const privateKey = async () => process.env.SYNERGY_PRIVATE_KEY as string;

export async function readDB(): Promise<DBData> {
    if (!fs.existsSync(DBPath)) {
        fs.mkdirSync(path.dirname(DBPath), { recursive: true });
        fs.writeFileSync(DBPath, JSON.stringify({
            users: {}
        }))
    }

    return JSON.parse(fs.readFileSync(DBPath).toString());
}

export async function writeDB(data: DBData) {
    fs.writeFileSync(DBPath, JSON.stringify({ ...data }));
}