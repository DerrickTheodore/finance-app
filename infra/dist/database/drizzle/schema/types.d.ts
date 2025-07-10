import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { plaidItems } from "./models.js";
/**
 * The Drizzle table definition for Plaid items.
 */
export declare const plaidItemsDefinition: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "plaid_items";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "plaid_items";
            dataType: "number";
            columnType: "PgSerial";
            data: number;
            driverParam: number;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: true;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        userId: import("drizzle-orm/pg-core").PgColumn<{
            name: "user_id";
            tableName: "plaid_items";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        plaidItemId: import("drizzle-orm/pg-core").PgColumn<{
            name: "plaid_item_id";
            tableName: "plaid_items";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: 255;
        }>;
        plaidAccessToken: import("drizzle-orm/pg-core").PgColumn<{
            name: "plaid_access_token";
            tableName: "plaid_items";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        plaidInstitutionId: import("drizzle-orm/pg-core").PgColumn<{
            name: "plaid_institution_id";
            tableName: "plaid_items";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: 255;
        }>;
        plaidInstitutionName: import("drizzle-orm/pg-core").PgColumn<{
            name: "plaid_institution_name";
            tableName: "plaid_items";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: 255;
        }>;
        accounts: import("drizzle-orm/pg-core").PgColumn<{
            name: "accounts";
            tableName: "plaid_items";
            dataType: "json";
            columnType: "PgJsonb";
            data: unknown;
            driverParam: unknown;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        createdAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_at";
            tableName: "plaid_items";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        updatedAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "updated_at";
            tableName: "plaid_items";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
/**
 * Represents a Plaid item record as stored in the database.
 * This type is derived from the Drizzle schema in the infra package.
 */
export type PlaidItemRecord = InferSelectModel<typeof plaidItemsDefinition>;
/**
 * Represents the structure for inserting a new Plaid item into the database.
 * This type is derived from the Drizzle schema in the infra package.
 */
export type PlaidItemInsert = InferInsertModel<typeof plaidItemsDefinition>;
export type NewPlaidItemInsert = InferInsertModel<typeof plaidItems>;
export interface PlaidItem extends Omit<PlaidItemRecord, "plaidAccessToken"> {
    plaidAccessToken: string;
}
export interface NewPlaidItemData {
    userId: number;
    plaidItemId: string;
    plaidAccessToken: string;
    plaidInstitutionId: string;
    plaidInstitutionName?: string | null;
    accounts?: any;
}
//# sourceMappingURL=types.d.ts.map