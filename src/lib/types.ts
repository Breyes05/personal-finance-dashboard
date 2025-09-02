export type Account = {
    accountId: string;
    name: string;
    type: string;
    subtype?: string | null;
    mask?: string | null;
    balance: number;
    institution: string;
};