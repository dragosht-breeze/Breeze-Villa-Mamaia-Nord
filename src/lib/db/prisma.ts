import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  breezePrisma?: PrismaClient;
};

export function hasDatabase() {
  return Boolean(process.env.DATABASE_URL?.trim());
}

export function getPrisma() {
  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) {
    throw new Error("DATABASE_URL lipsește.");
  }

  if (!globalForPrisma.breezePrisma) {
    const adapter = new PrismaPg(connectionString);
    globalForPrisma.breezePrisma = new PrismaClient({ adapter });
  }

  return globalForPrisma.breezePrisma;
}
