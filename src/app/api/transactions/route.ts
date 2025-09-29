import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { plaidClient } from "@/lib/plaid";

export async function POST(req: Request) {
  const { accountId, startDate, endDate } = await req.json();

  // Find the account in the DB to get its Plaid access token
  const account = await prisma.account.findUnique({
    where: { accountId },
    include: { plaidItem: true },
  });

  if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 });

  // Use Plaid to fetch transactions
  const txRes = await plaidClient.transactionsGet({
    access_token: account.plaidItem.accessToken,
    start_date: new Date(Date.now() - 90*24*60*60*1000).toISOString().split("T")[0],
    end_date: new Date().toISOString().split("T")[0],
    options: { account_ids: [accountId] },
  });

  // Map to simplified structure
  const transactions = txRes.data.transactions.map(tx => ({
    id: tx.transaction_id,
    name: tx.name,
    amount: tx.amount,
    date: tx.date,
    category: tx.category?.[0] ?? null,
  }));

  return NextResponse.json({ transactions });
}