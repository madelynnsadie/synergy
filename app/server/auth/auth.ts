"use server"

import { readDB } from "@/app/server/db/db"

export async function validateDetails(username: string, password: string): Promise<boolean> {
    const db = await readDB();

    return db.users?.[username]?.password === password;
}