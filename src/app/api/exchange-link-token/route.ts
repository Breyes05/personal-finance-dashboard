import { NextResponse } from "next/server";
import { plaidClient } from "@/lib/plaid";
import { prisma } from "@/lib/prisma";
import { CountryCode } from "plaid";

// get public_token from frontend
// send public_token to backend
// get access_token and item_id and store in Prisma database
export async function POST(request: Request) {
  try {
    const { public_token } = await request.json();

    // test
    await prisma.user.upsert({
      where: { id: "test-user" },
      update: {},
      create: { id: "test-user", email: "test@example.com" },
    });
    // test

    const response = await plaidClient.itemPublicTokenExchange(
      { public_token: public_token }
    );
    const accessToken = response.data.access_token;
    const itemId = response.data.item_id;

    // get bankName
    const itemInfo = await plaidClient.itemGet({ access_token: accessToken });
    let bankName = "Unknown Bank";
    if (itemInfo.data.item.institution_id) {
      const instRes = await plaidClient.institutionsGetById({
        institution_id: itemInfo.data.item.institution_id,
        country_codes: [CountryCode.Us],
      });
      bankName = instRes.data.institution.name;
    }

    // make item (bank) and store in database
    const item = await prisma.item.create({
      data: {
        userId: 'test-user', // test-user id for now, change if using nextauth
        accessToken,
        itemId,
        bankName,
      },
    });

    // fetch accounts from Plaid
    const accountsRes = await plaidClient.accountsGet({ access_token: accessToken });
    for (const acc of accountsRes.data.accounts) {
      const account = await prisma.account.create({
        data: {
          itemId: item.id,
          name: acc.official_name || acc.name,
          mask: acc.mask,
          type: acc.type,
        },
      });

      // fetch transactions
      const transactionsRes = await plaidClient.transactionsGet({
        access_token: accessToken,
        start_date: "2025-01-01", // CHANGE
        end_date: new Date().toISOString().split("T")[0],
      });

      for (const tx of transactionsRes.data.transactions) {
        if (tx.account_id === acc.account_id) {
          await prisma.transaction.create({
            data: {
              accountId: account.id,
              amount: tx.amount,
              description: tx.merchant_name || "No merchant name",
              date: new Date(tx.date),
              category: tx.category ? tx. category[0]: "Uncategorized"
            },
          });
        }
      }
    }

    return NextResponse.json( { success: true, accessToken, itemId } );
  } catch (error: any) {
      console.error(error);
      return NextResponse.json(
          { error: error.message }, 
          { status: 500 }
      );
  }
}