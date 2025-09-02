import { prisma } from "./prisma";
import { plaidClient } from "./plaid";

export async function fetchBalances(accessToken: string) {
  const response = await plaidClient.accountsBalanceGet({
    access_token: accessToken,
  });

  return response.data.accounts.map(acc => ({
    accountId: acc.account_id,
    name: acc.name,
    type: acc.type,
    subtype: acc.subtype,
    mask: acc.mask,
    balance: acc.balances.available ?? acc.balances.current ?? 0,
  }));
}

export async function syncAccounts(plaidItemId: number, accounts: any[]) {
  for (const acc of accounts) {
    await prisma.account.upsert({
      where: { accountId: acc.accountId },
      update: { balance: acc.balance },
      create: {
        accountId: acc.accountId,
        name: acc.name,
        type: acc.type,
        subtype: acc.subtype,
        mask: acc.mask,
        balance: acc.balance,
        plaidItemId,
      },
    });
  }
}