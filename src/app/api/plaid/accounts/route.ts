import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { plaidClient } from "@/lib/plaid";
import { Account } from "@/lib/types"

export async function GET() {
  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({
      data: {
        id: 1,
        name: "Default User",
      },
    });
  }
  const plaidItems = await prisma.plaidItem.findMany({ where: { userId: 1 } });
  if (plaidItems.length === 0) return NextResponse.json({ accounts: [] });

  const accounts: Account[] = [];
  for (const item of plaidItems) {
    const response = await plaidClient.accountsBalanceGet({ access_token: item.accessToken });

    for (const acc of response.data.accounts) {
      // Upsert the account into the database
      await prisma.account.upsert({
        where: { accountId: acc.account_id },
        update: {
          name: acc.name,
          balance: acc.balances.available ?? acc.balances.current ?? 0,
          type: acc.type,
          subtype: acc.subtype,
          mask: acc.mask,
        }, // Update database with new information
        create: {
          accountId: acc.account_id,
          name: acc.name,
          type: acc.type,
          subtype: acc.subtype,
          mask: acc.mask,
          balance: acc.balances.available ?? acc.balances.current ?? 0,
          plaidItemId: item.id,
        },
      });

      // Push for frontend rendering
      accounts.push({
        accountId: acc.account_id,
        name: acc.name,
        type: acc.type,
        subtype: acc.subtype,
        mask: acc.mask,
        balance: acc.balances.available ?? acc.balances.current ?? 0,
        institution: item.institution ?? "Unknown",
      });
    }
  }

  return NextResponse.json({ accounts });
}