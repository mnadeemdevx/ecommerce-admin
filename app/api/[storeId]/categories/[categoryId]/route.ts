import { NextResponse } from "next/server";

import { auth } from "@clerk/nextjs/server";

import db from "@/lib/db";

export async function GET(
    req: Request,
    { params }: { params: { categoryId: string } },
) {
    try {
        if (!params.categoryId) {
            return new NextResponse("Category id is required", {
                status: 400,
            });
        }

        const category = await db.category.findUnique({
            where: {
                id: params.categoryId,
            },
        });

        return NextResponse.json(category);
    } catch (err) {
        console.log("[CATEGORY_GET]", err);
        return new NextResponse("Internal error", {
            status: 500,
        });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: { storeId: string; categoryId: string } },
) {
    try {
        const { userId } = auth();

        if (!userId) {
            return new NextResponse("Unauthenticated", {
                status: 401,
            });
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

        if (!params.categoryId) {
            return new NextResponse("Category id is required", {
                status: 400,
            });
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

        const category = await db.category.updateMany({
            where: {
                id: params.categoryId,
            },
            data: {
                name,
                billboardId,
            },
        });

        return NextResponse.json(category);
    } catch (err) {
        console.log("[CATEGORY_PATCH]", err);
        return new NextResponse("Internal error", {
            status: 500,
        });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { storeId: string; categoryId: string } },
) {
    try {
        const { userId } = auth();

        if (!userId) {
            return new NextResponse("Unauthenticated", {
                status: 401,
            });
        }

        if (!params.categoryId) {
            return new NextResponse("Billboard id is required", {
                status: 400,
            });
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

        const category = await db.category.deleteMany({
            where: {
                id: params.categoryId,
            },
        });

        return NextResponse.json(category);
    } catch (err) {
        console.log("[CATEGORY_DELETE]", err);
        return new NextResponse("Internal error", {
            status: 500,
        });
    }
}
