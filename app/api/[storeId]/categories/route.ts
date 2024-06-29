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

        const categories = await db.category.findMany({
            where: {
                storeId: params.storeId,
            },
        });

        return NextResponse.json(categories);
    } catch (err) {
        // always log your errors in development
        console.log("[CATEGORIES_GET]", err);
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
        const { name, billboardId } = body;

        if (!name) {
            return new NextResponse("Name is required", { status: 400 });
        }

        if (!billboardId) {
            return new NextResponse("Billboard id is required", {
                status: 400,
            });
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

        const category = await db.category.create({
            data: {
                storeId: params.storeId,
                name,
                billboardId,
            },
        });

        return NextResponse.json(category);
    } catch (err) {
        // always log your errors in development
        console.log("[CATEGORIES_POST]", err);
        return new NextResponse("Internal error", { status: 500 });
    }
}
