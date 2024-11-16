import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export function GET(request: NextRequest) {
    const uuid = crypto.randomUUID().replace(/-/g, "");
    const nonce = crypto
        .createHmac("sha256", process.env.NONCE_SECRET || "")
        .update(uuid)
        .digest("hex");

    cookies().set("siwe", nonce, { secure: true });

    return NextResponse.json({ nonce });
}
