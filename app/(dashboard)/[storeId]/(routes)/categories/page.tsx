import { format } from "date-fns";

import { CategoryClient } from "./_components/client";
import { CategoryColumn } from "./_components/columns";

import db from "@/lib/db";

const CategoriesPage = async ({ params }: { params: { storeId: string } }) => {
    const categories = await db.category.findMany({
        where: {
            storeId: params.storeId,
        },
        include: {
            billboard: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    const formatedCategories: CategoryColumn[] = categories.map((item) => ({
        id: item.id,
        name: item.name,
        billboardLabel: item.billboard.label,
        createdAt: format(item.createdAt, "MMMM do, yyyy"),
    }));
    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <CategoryClient data={formatedCategories} />
            </div>
        </div>
    );
};

export default CategoriesPage;
