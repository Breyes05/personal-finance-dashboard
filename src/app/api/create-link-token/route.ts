import { NextResponse } from "next/server";
import { plaidClient } from "@/lib/plaid";
import { Products, CountryCode } from "plaid";

// frontend calls backend create-link-token
// backend talks to plaid using client_id + secret
// requests link_token from plaid
// return link_token
export async function POST() {
    try {
        const request = {
            user: {
                client_user_id: "test-user",
            },
            client_name: "Personal Finance Dashboard",
            products: [Products.Transactions],
            country_codes: [CountryCode.Us],
            language: "en"
        };

    const response = await plaidClient.linkTokenCreate(request);

    return NextResponse.json(response.data);
    } catch (error: any) {
        console.error(error);
        return NextResponse.json(
            { error: error.message }, 
            { status: 500 }
        );
    }
}

export async function GET(req: Request) {
    return new Response(JSON.stringify({ message: "API is working" }), {
      headers: { "Content-Type": "application/json" },
    });
  }