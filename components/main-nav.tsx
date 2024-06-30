"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export function MainNav({
    className,
    ...props
}: React.HTMLAttributes<HTMLElement>) {
    const pathname = usePathname();
    const params = useParams();

    const checkPath = (name: string) => {
        const isAvailable = pathname.split("/").includes(name);
        return isAvailable;
    };

    const routes = [
        {
            href: `/${params.storeId}`,
            label: "Overview",
            active: pathname === `/${params.storeId}`,
        },
        {
            href: `/${params.storeId}/billboards`,
            label: "Billboards",
            active: checkPath("billboards"),
        },
        {
            href: `/${params.storeId}/categories`,
            label: "Categories",
            active: checkPath("categories"),
        },
        {
            href: `/${params.storeId}/sizes`,
            label: "Sizes",
            active: checkPath("sizes"),
        },
        {
            href: `/${params.storeId}/colors`,
            label: "Colors",
            active: checkPath("colors"),
        },
        {
            href: `/${params.storeId}/settings`,
            label: "Settings",
            active: checkPath("settings"),
        },
    ];
    return (
        <nav
            className={cn(
                "flex items-center space-x-4 lg:space-x-6",
                className,
            )}
        >
            {routes.map((route) => {
                return (
                    <Link
                        key={route.href}
                        href={route.href}
                        className={cn(
                            "text-sm font-medium transition-colors hover:text-primary",
                            route.active
                                ? "text-black dark:text-white"
                                : "text-muted-foreground",
                        )}
                    >
                        {route.label}
                    </Link>
                );
            })}
        </nav>
    );
}
