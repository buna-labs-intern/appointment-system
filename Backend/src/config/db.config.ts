import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export const connectDB = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log("PostgreSQL connected");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
};