import { NextResponse } from "next/server";

import { auth } from "@clerk/nextjs/server";

import db from "@/lib/db";

export async function GET(
    req: Request,
    { params }: { params: { productId: string } },
) {
    try {
        if (!params.productId) {
            return new NextResponse("Product id is required", {
                status: 400,
            });
        }

        const product = await db.product.findUnique({
            where: {
                id: params.productId,
            },
            include: {
                images: true,
                category: true,
                color: true,
                size: true,
            },
        });

        return NextResponse.json(product);
    } catch (err) {
        console.log("[PRODUCT_GET]", err);
        return new NextResponse("Internal error", {
            status: 500,
        });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: { storeId: string; productId: string } },
) {
    try {
        const { userId } = auth();

        if (!userId) {
            return new NextResponse("Unauthenticated", {
                status: 401,
            });
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

        if (!params.productId) {
            return new NextResponse("Product id is required", {
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

        await db.product.update({
            where: {
                id: params.productId,
            },
            data: {
                storeId: params.storeId,
                name,
                price,
                categoryId,
                sizeId,
                colorId,
                images: {
                    deleteMany: {},
                },
                isFeatured,
                isArchived,
            },
        });

        const product = await db.product.update({
            where: {
                id: params.productId,
            },
            data: {
                images: {
                    createMany: {
                        data: [
                            ...images.map((image: { url: string }) => image),
                        ],
                    },
                },
            },
        });

        return NextResponse.json(product);
    } catch (err) {
        console.log("[PRODUCT_PATCH]", err);
        return new NextResponse("Internal error", {
            status: 500,
        });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { storeId: string; productId: string } },
) {
    try {
        const { userId } = auth();

        if (!userId) {
            return new NextResponse("Unauthenticated", {
                status: 401,
            });
        }

        if (!params.productId) {
            return new NextResponse("Product id is required", {
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

        const product = await db.product.deleteMany({
            where: {
                id: params.productId,
            },
        });

        return NextResponse.json(product);
    } catch (err) {
        console.log("[PRODUCT_DELETE]", err);
        return new NextResponse("Internal error", {
            status: 500,
        });
    }
}
