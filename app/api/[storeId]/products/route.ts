import { NextResponse } from "next/server";

import { auth } from "@clerk/nextjs/server";

import db from "@/lib/db";

export async function GET(
    req: Request,
    { params }: { params: { storeId: string } },
) {
    try {
        const { searchParams } = new URL(req.url);
        const categoryId = searchParams.get("categoryId") || undefined;
        const sizeId = searchParams.get("sizeId") || undefined;
        const colorId = searchParams.get("colorId") || undefined;
        const isFeatured = searchParams.get("isFeatured");

        if (!params.storeId) {
            return new NextResponse("Store id is required", { status: 400 });
        }

        const products = await db.product.findMany({
            where: {
                storeId: params.storeId,
                categoryId,
                sizeId,
                colorId,
                isFeatured: isFeatured ? true : undefined,
                isArchived: false,
            },
            include: {
                images: true,
                category: true,
                color: true,
                size: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(products);
    } catch (err) {
        // always log your errors in development
        console.log("[PRODUCTS_GET]", err);
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
        const {
            name,
            price,
            categoryId,
            sizeId,
            colorId,
            images,
            isFeatured,
            isArchived,
        } = body;

        if (!name) {
            return new NextResponse("Name is required", { status: 400 });
        }
        if (!images || !images.length) {
            return new NextResponse("Images are required", { status: 400 });
        }
        if (!price) {
            return new NextResponse("Price is required", { status: 400 });
        }
        if (!categoryId) {
            return new NextResponse("Category id is required", { status: 400 });
        }
        if (!sizeId) {
            return new NextResponse("Size id is required", { status: 400 });
        }
        if (!colorId) {
            return new NextResponse("Color id is required", { status: 400 });
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

        const product = await db.product.create({
            data: {
                storeId: params.storeId,
                name,
                price,
                categoryId,
                sizeId,
                colorId,
                images: {
                    createMany: {
                        data: [
                            ...images.map((image: { url: string }) => image),
                        ],
                    },
                },
                isFeatured,
                isArchived,
            },
        });

        return NextResponse.json(product);
    } catch (err) {
        // always log your errors in development
        console.log("[PRODUCTS_POST]", err);
        return new NextResponse("Internal error", { status: 500 });
    }
}
