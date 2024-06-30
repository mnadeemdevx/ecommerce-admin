import { NextResponse } from "next/server";

import { auth } from "@clerk/nextjs/server";

import db from "@/lib/db";

export async function GET(
    req: Request,
    { params }: { params: { storeId: string } },
) {
    try {
        if (!params.storeId) {
            return new NextResponse("Store id is required", { status: 400 });
        }

        const colors = await db.color.findMany({
            where: {
                storeId: params.storeId,
            },
        });

        return NextResponse.json(colors);
    } catch (err) {
        // always log your errors in development
        console.log("[COLORS_GET]", err);
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function POST(
    req: Request,
    { params }: { params: { storeId: string } },
) {
    try {
        const { userId } = auth();

        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 });
        }

        const body = await req.json();
        const { name, value } = body;

        if (!name) {
            return new NextResponse("Name is required", { status: 400 });
        }

        if (!value) {
            return new NextResponse("Value is required", { status: 400 });
        }

        if (!params.storeId) {
            return new NextResponse("Store id is required", { status: 400 });
        }

        const storeByUserId = await db.store.findFirst({
            where: {
                id: params.storeId,
                userId,
            },
        });

        if (!storeByUserId) {
            return new NextResponse("Unauthorized", { status: 403 });
        }

        const color = await db.color.create({
            data: {
                storeId: params.storeId,
                name,
                value,
            },
        });

        return NextResponse.json(color);
    } catch (err) {
        // always log your errors in development
        console.log("[COLORS_POST]", err);
        return new NextResponse("Internal error", { status: 500 });
    }
}
