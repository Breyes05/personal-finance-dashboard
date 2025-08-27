"use client";

import { useRouter } from 'next/navigation';
import { useState } from "react";
import { usePlaidLink } from "react-plaid-link";

export default function HomePage() {
  const router = useRouter();
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);

  // Get the link token
  const fetchLinkToken = async () => {
    const res = await fetch("/api/create-link-token", { method: "POST" });
    const data = await res.json();
    setLinkToken(data.link_token);
  };

  // Set up Plaid Link
  const { open, ready } = usePlaidLink({
    token: linkToken || "",
    onSuccess: async (public_token: string) => {
      // Exchange the public token for access token
      const res = await fetch("/api/exchange-link-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ public_token }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Account linked successfully!");
        // go to dashboard
        router.push("/dashboard");
      }
    },
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Personal Finance Dashboard</h1>

      {!linkToken && (
        <button
          onClick={fetchLinkToken}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Generate Link Token
        </button>
      )}

      {linkToken && (
        <button
          onClick={() => open()}
          disabled={!ready}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Link Your Bank Account
        </button>
      )}

      <h2 className="mt-8 text-xl font-semibold">Transactions:</h2>
      <ul>
        {transactions.map((tx) => (
          <li key={tx.transaction_id}>
            {tx.date} - {tx.name} - ${tx.amount}
          </li>
        ))}
      </ul>
    </div>
  );
}