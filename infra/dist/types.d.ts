export * from "./database/drizzle/schema/types.js";
export interface Account {
    id: string;
    name: string | null;
    mask: string | null;
    type: string | null;
    subtype: string | null;
}
export interface LinkedItem {
    id: number;
    plaidItemId: string;
    plaidInstitutionId: string;
    plaidInstitutionName: string | null;
    accounts: Account[] | null;
    createdAt: string;
    updatedAt: string;
}
export interface PlaidItem {
    id?: number;
    userId: number;
    plaidItemId: string;
    accessToken: string;
    plaidInstitutionId?: string;
    plaidInstitutionName?: string | null;
    institutionName?: string;
    accounts?: Account[] | null;
    lastSynced?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface Category {
    id: number;
    name: string;
    color?: string | null;
    icon?: string | null;
}
export interface Transaction {
    id: number;
    plaidTransactionId: string;
    plaidAccountId: string;
    date: string;
    name: string;
    amount: number;
    iso_currency_code: string | null;
    categories?: Category[];
}
export interface ApiTransaction {
    id: number;
    plaidTransactionId: string;
    plaidAccountId: string;
    itemId: number;
    userId: number;
    name: string;
    merchantName: string | null;
    amount: string;
    isoCurrencyCode: string | null;
    unofficialCurrencyCode: string | null;
    date: string;
    pending: boolean;
    pendingTransactionId: string | null;
    paymentChannel: string;
    address: string | null;
    city: string | null;
    region: string | null;
    postalCode: string | null;
    country: string | null;
    createdAt: string;
    updatedAt: string;
    categories?: Category[];
}
//# sourceMappingURL=types.d.ts.map