import { prisma } from "./prisma";
import { Prisma } from "@/generated/prisma";

/**
 * A type-safe wrapper around Prisma's $transaction utility.
 * The generic 'T' ensures that whatever value your callback returns
 * is correctly inferred as the return type of the transaction wrapper.
 */
export async function transaction<T>(
    callback: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
    return prisma.$transaction(callback);
}
