import { NextResponse } from "next/server";
import { plaidClient } from "@/lib/plaid";
import { CountryCode, Products } from "plaid";

export async function POST() {
    try {
      const response = await plaidClient.linkTokenCreate({
        user: { client_user_id: "default_user" },
        client_name: "Personal Finance Dashboard",
        products: [Products.Transactions],
        country_codes: [CountryCode.Us],
        language: "en",
      });
      return NextResponse.json( {link_token: response.data.link_token} );
    } catch (error) {
      console.error("Error creating link token:", error);
      return NextResponse.json(
        { error: "Failed to create link token" },
        { status: 500 }
      );
    }
  }