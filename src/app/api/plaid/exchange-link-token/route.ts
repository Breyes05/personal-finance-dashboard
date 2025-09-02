import { NextResponse } from "next/server";
import { plaidClient } from "@/lib/plaid";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { public_token } = await req.json();

    if (!public_token) {
      return NextResponse.json({ error: "Missing public_token" }, { status: 400 });
    }

    // Exchange public token for access token
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({ public_token });
    const { access_token, item_id } = exchangeResponse.data;

    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: 1,
          name: "Default User",
        },
      });
      console.log("Created default user with id:", user.id);
    }
    // Optional: get institution info
    const item = await prisma.plaidItem.create({
      data: {
        itemId: item_id,
        accessToken: access_token,
        userId: user.id, // single-user MVP
        institution: "Sandbox Bank", // optional; you could fetch actual institution later
      },
    });

    return NextResponse.json({ success: true, item });
  } catch (err) {
    console.error("Error exchanging link token:", err);
    return NextResponse.json({ error: "Failed to exchange link token" }, { status: 500 });
  }
}