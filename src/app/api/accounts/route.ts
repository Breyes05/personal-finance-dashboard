import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Replace "test-user" with real userId when using authentication
    const userId = "test-user";

    // Fetch all items (banks) for the user
    const items = await prisma.item.findMany({
      where: { userId },
      include: {
        accounts: {
          include: {
            transactions: true, // include all transactions for each account
          },
        },
      },
    });

    return NextResponse.json({ success: true, items });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}