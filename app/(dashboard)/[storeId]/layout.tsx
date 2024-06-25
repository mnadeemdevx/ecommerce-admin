import { redirect } from "next/navigation";

import { auth } from "@clerk/nextjs/server";

import db from "@/lib/db";

export default async function DashboardLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: { storeId: string };
}) {
    const { userId } = auth();

    if (!userId) {
        redirect("/sign-in");
    }

    const store = await db.store.findFirst({
        where: {
            id: params.storeId,
            userId,
        },
    });

    if (!store) {
        redirect("/");
    }

    return (
        <>
            <div>This will be a navbar</div>
            {children}
        </>
    );
}
