import { format } from "date-fns";

import { OrderClient } from "./_components/client";
import { OrderColumn } from "./_components/columns";

import db from "@/lib/db";
import { formatter } from "@/lib/utils";

const OrdersPage = async ({ params }: { params: { storeId: string } }) => {
    const orders = await db.order.findMany({
        where: {
            storeId: params.storeId,
        },
        include: {
            orderItems: {
                include: {
                    product: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    const formatedOrders: OrderColumn[] = orders.map((item) => ({
        id: item.id,
        phone: item.phone,
        address: item.address,
        isPaid: item.isPaid,
        products: item.orderItems.map((item) => item.product.name).join(", "),
        totalPrice: formatter.format(
            item.orderItems.reduce((total, item) => {
                return total + Number(item.product.price);
            }, 0),
        ),
        createdAt: format(item.createdAt, "MMMM do, yyyy"),
    }));
    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <OrderClient data={formatedOrders} />
            </div>
        </div>
    );
};

export default OrdersPage;
