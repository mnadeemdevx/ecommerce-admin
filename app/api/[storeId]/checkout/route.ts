import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import db from "@/lib/db";

// we are using this because our origin(request route) will be changed
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// before post req we will use option req for cors to work
export async function OPTIONS() {
    return NextResponse.json(
        {},
        {
            headers: corsHeaders,
        },
    );
}

export async function POST(
    req: Request,
    { params }: { params: { storeId: string } },
) {
    const { productIds } = await req.json();

    if (!productIds || productIds.length === 0) {
        return NextResponse.json("Product ids are required", {
            status: 400,
            headers: corsHeaders,
        });
    }

    const products = await db.product.findMany({
        where: {
            id: { in: productIds },
        },
    });

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    products.forEach((product) => {
        line_items.push({
            price_data: {
                currency: "USD",
                product_data: {
                    name: product.name,
                },
                unit_amount: product.price.toNumber() * 100,
            },
            quantity: 1,
        });
    });

    const order = await db.order.create({
        data: {
            storeId: params.storeId,
            isPaid: false,
            orderItems: {
                create: productIds.map((productId: string) => ({
                    product: {
                        connect: {
                            id: productId,
                        },
                    },
                })),
            },
        },
    });

    const session = await stripe.checkout.sessions.create({
        line_items,
        mode: "payment",
        billing_address_collection: "required",
        phone_number_collection: {
            enabled: true,
        },
        success_url: `${process.env.FRONTEND_STORE_URL}/cart?success=1`,
        cancel_url: `${process.env.FRONTEND_STORE_URL}/cart?cancelled=1`,
        metadata: {
            orderId: order.id,
        },
    });

    return NextResponse.json(
        { url: session.url },
        {
            headers: corsHeaders,
        },
    );
}
