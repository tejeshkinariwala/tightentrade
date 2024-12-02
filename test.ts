import { prisma } from "./app/lib/prisma";
async function test() {
  try {
    const users = await prisma.user.findMany();
    console.log("Connected to database!", users);
  } catch (error) {
    console.error("Database error:", error);
  }
}
test();
