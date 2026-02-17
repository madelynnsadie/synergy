"use server"
import { createHmac } from "crypto";
import { privateKey } from "./db";

export async function makeHash(toHash: string): Promise<string> {
    const hash = createHmac("sha256", await privateKey()).update(toHash).digest("hex");

    return hash;
}