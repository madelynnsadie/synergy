import { validateDetails } from "../auth/auth";
import { readDB, User, writeDB } from "../db/db";
import { makeHash } from "../db/hash";

export async function createAccount(username: string, password: string, newUserName: string, newUserPass: string) {
    if (!validateDetails(username, password)) return;

    if (!await getIsAdmin(username, password)) return;

    const db = await readDB();

    db.users[newUserName] = {
        password: await makeHash(newUserPass),
        chats: {},
        admin: false
    };

    await writeDB(db);
}

export async function getIsAdmin(username: string, password: string): Promise<boolean> {
    if (!validateDetails(username, password)) return false;

    // on day i will serialise booleans normally. but not today.
    return !!(await readDB()).users[username].admin
}