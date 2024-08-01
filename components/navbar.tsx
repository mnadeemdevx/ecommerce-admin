import { redirect } from "next/navigation";

import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";

import { MainNav } from "@/components/main-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import StoreSwitcher from "@/components/store-switcher";

import db from "@/lib/db";

const Navbar = async () => {
    const { userId } = auth();

    if (!userId) {
        redirect("/sign-in");
    }

    const stores = await db.store.findMany({
        where: {
            userId,
        },
    });
    return (
        <div className="border-b">
            <div className="flex items-center h-16 px-4">
                <StoreSwitcher items={stores} />
                <MainNav className="mx-6" />
                <div className="ml-auto flex items-center space-x-4">
                    <ThemeToggle />
                    <UserButton afterSignOutUrl="/" />
                </div>
            </div>
        </div>
    );
};

export default Navbar;
