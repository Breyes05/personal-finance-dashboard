import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";

const configuration = new Configuration({
    basePath: PlaidEnvironments.sandbox,
    baseOptions: {
      headers: {
        "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID!,
        "PLAID-SECRET": process.env.PLAID_SECRET!,
      },
    },
  });
  export const plaidClient = new PlaidApi(configuration);
// basePath sandbox for free use, but if personal use change it
// baseOption has a request header for client-id and secret to verify api call