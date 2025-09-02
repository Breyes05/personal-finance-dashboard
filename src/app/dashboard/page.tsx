"use client";

import { useEffect, useState } from "react";
import { usePlaidLink } from "react-plaid-link";
import { Account } from "@/lib/types"

export default function DashboardPage() {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [hiddenAccounts, setHiddenAccounts] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/plaid/create-link-token", { method: "POST" })
      .then(res => res.json())
      .then(data => setLinkToken(data.link_token));
  }, []);

  const fetchAccounts = async () => {
    const res = await fetch("/api/plaid/accounts");
    const data = await res.json();
    setAccounts(data.accounts ?? []);
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const { open, ready } = usePlaidLink({
    token: linkToken ?? "",
    onSuccess: async (public_token: string) => {
      await fetch("/api/plaid/exchange-link-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ public_token }),
      });
      fetchAccounts();
    },
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Finance Dashboard</h1>
      <button
        onClick={() => open()}
        disabled={!ready || !linkToken}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 mb-6"
      >
        Connect Bank
      </button>

      {accounts.filter(acc => !hiddenAccounts.includes(acc.accountId)).length === 0 ? (
        <p>No accounts yet. Connect a bank to see your accounts.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {accounts
            .filter(acc => !hiddenAccounts.includes(acc.accountId))
            .map(acc => (
              <div key={acc.accountId} className="p-4 border rounded shadow relative">
                <h2 className="font-bold">{acc.name}</h2>
                <p className="text-sm">{acc.subtype} • {acc.institution}</p>
                <p className="text-lg font-semibold">${acc.balance.toFixed(2)}</p>

                <button
                  className="absolute top-2 right-2 text-yellow-600 hover:text-yellow-800"
                  onClick={() => setHiddenAccounts(prev => [...prev, acc.accountId])}
                >
                  Hide
                </button>
              </div>
            ))}
        </div>
      )}

      {hiddenAccounts.length > 0 && (
        <div className="mt-4">
          <h3 className="font-bold mb-2">Hidden Accounts</h3>
          {hiddenAccounts.map(id => (
            <button
              key={id}
              className="px-2 py-1 m-1 bg-green-600 text-white rounded"
              onClick={() => setHiddenAccounts(prev => prev.filter(accId => accId !== id))}
            >
              Restore
            </button>
          ))}
        </div>
      )}
    </div>
  );
}