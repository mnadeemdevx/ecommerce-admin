import { NextResponse } from "next/server";

import { auth } from "@clerk/nextjs/server";

import db from "@/lib/db";

export async function POST(req: Request) {
    try {
        const { userId } = auth();

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { name } = body;

        if (!name) {
            return new NextResponse("Name is required", { status: 400 });
        }

        const store = await db.store.create({
            data: {
                name,
                userId,
            },
        });

        return NextResponse.json(store);
    } catch (err) {
        // always log your errors in development
        console.log("[STORES_POST]", err);
        return new NextResponse("Internal error", { status: 500 });
    }
}
