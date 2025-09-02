import { plaidClient } from "@/lib/plaid";

async function fetchBalances(accessToken: string) {
  const response = await plaidClient.accountsBalanceGet({ access_token: accessToken });

  // Example result mapping
  return response.data.accounts.map(acc => ({
    accountId: acc.account_id,
    name: acc.name,
    type: acc.type,
    subtype: acc.subtype,
    mask: acc.mask,
    balance: acc.balances.available ?? acc.balances.current ?? 0,
  }));
}