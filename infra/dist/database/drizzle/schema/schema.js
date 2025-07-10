import { integer, pgTable, serial, text, timestamp, varchar, } from "drizzle-orm/pg-core";
export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    email: varchar("email", { length: 255 }).unique().notNull(),
    password: text("password").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
export const plaidItems = pgTable("plaid_items", {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }), // Foreign key to users table
    plaidItemId: varchar("plaid_item_id", { length: 255 }).unique().notNull(),
    plaidAccessToken: text("plaid_access_token").notNull(), // Will store encrypted token
    plaidInstitutionId: varchar("plaid_institution_id", {
        length: 255,
    }).notNull(),
    plaidInstitutionName: varchar("plaid_institution_name", { length: 255 }), // Nullable
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
//# sourceMappingURL=schema.js.map