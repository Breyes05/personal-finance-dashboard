import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { plaidClient } from "@/lib/plaid";

export async function GET(req : Request) {
  try {
    const userId = 'test-user';
    const item = await prisma.item.findFirst({ where: { userId }});
    if (!item) {
      return NextResponse.json({ transactions: []});
    }

    const today = new Date();
    const end_date = today.toISOString().split("T")[0]; // YYYY-MM-DD

    // transactions within the last 90 days
    const start = new Date();
    start.setDate(today.getDate() - 90);
    const start_date = start.toISOString().split("T")[0];

    const response = await plaidClient.transactionsGet({
      access_token: item.accessToken,
      start_date: start_date,
      end_date: end_date
    });
    
    const transactions = response.data.transactions;
    return NextResponse.json( { transactions });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
        { error: error.message }, 
        { status: 500 }
    );
}
}
// use access token of given item, the users information