"use client";

import { useEffect, useState } from "react";

type Transaction = {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
};
// FIX SUBTYPE IN ACCOUNT
type Account = {
  id: string;
  name: string;
  subtype?: string;
  type?: string;
  mask?: string;
  transactions: Transaction[];
};

type Item = {
  id: string;
  bankName: string;
  accounts: Account[];
};

export default function DashboardPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAccounts() {
      try {
        const res = await fetch("/api/accounts");
        const data = await res.json();
        if (data.success) setItems(data.items);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchAccounts();
  }, []);

  if (loading) return <p className="text-gray-900">Loading...</p>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-white-900">Dashboard</h1>

      {items.length === 0 && <p className="text-gray-800">No accounts linked yet.</p>}

      {items.map((item) => (
        <div key={item.id} className="mb-8">
          <h2 className="text-xl font-semibold mb-2 text-white-900">{item.bankName}</h2>

          {item.accounts.map((account) => (
            <div
              key={account.id}
              className="border p-4 rounded mb-4 bg-gray-50"
            >
              <h3 className="font-medium text-gray-900">
                {account.name} {account.mask ? `(****${account.mask})` : ""}
              </h3>
              <p className="text-sm text-gray-700">
                {account.type} {account.subtype ? `- ${account.subtype}` : ""}
              </p> 

              {account.transactions.length === 0 ? (
                <p className="mt-2 text-gray-700">No transactions</p>
              ) : (
                <ul className="mt-2">
                  {account.transactions.map((tx) => (
                    <li key={tx.id} className="border-b py-1 text-gray-800">
                      <span className="font-medium text-gray-900">${tx.amount}</span> -{" "}
                      {tx.description}{" "}
                      <span className="text-gray-700 text-sm">
                        ({new Date(tx.date).toLocaleDateString()})
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}