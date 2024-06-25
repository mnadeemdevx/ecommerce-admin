import { PrismaClient } from "@prisma/client";

declare global {
    var prisma: PrismaClient | undefined;
}

const db = globalThis.prisma || new PrismaClient();
// reason for this "globalThis.prisma || new PrismaClient()" is, if we use only "new PrismaClient()" in development mode it will execute the bunch of prisma instances which causes bunch of warnings, so we saved ourselves by usig this approach.

if (process.env.NODE_ENV !== "production") globalThis.prisma = db;

export default db;
