import { relations } from "drizzle-orm";
import { boolean, date, integer, jsonb, numeric, pgTable, primaryKey, serial, text, timestamp, uniqueIndex, varchar, } from "drizzle-orm/pg-core";
export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    email: varchar("email", { length: 255 }).unique().notNull(),
    password: text("password").notNull(), // This should store the hashed password
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
    accounts: jsonb("accounts"), // Add accounts column
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
// Categories Table
export const categories = pgTable("category", {
    id: serial("id").primaryKey(), // Changed to serial
    userId: integer("user_id") // Stays integer, references users.id (serial)
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    color: text("color"), // Added color field
    icon: text("icon"), // Added icon field
    createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
}, (table) => {
    return {
        userIdNameUnq: uniqueIndex("category_user_id_name_unq").on(table.userId, table.name),
    };
});
export const categoriesRelations = relations(categories, ({ one, many }) => ({
    user: one(users, {
        fields: [categories.userId],
        references: [users.id],
    }),
    transactionsCategories: many(transactionsCategories),
}));
// Local Transactions Table
export const transactions = pgTable("transaction", {
    id: serial("id").primaryKey(), // Changed to serial
    plaidTransactionId: text("plaid_transaction_id").notNull().unique(),
    plaidAccountId: text("plaid_account_id").notNull(),
    itemId: integer("item_id") // Stays integer, references plaidItems.id (serial)
        .notNull()
        .references(() => plaidItems.id, { onDelete: "cascade" }),
    userId: integer("user_id") // Stays integer, references users.id (serial)
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    merchantName: text("merchant_name"),
    amount: numeric("amount", { precision: 19, scale: 4 }).notNull(),
    isoCurrencyCode: text("iso_currency_code"),
    unofficialCurrencyCode: text("unofficial_currency_code"),
    date: date("date").notNull(),
    pending: boolean("pending").default(false).notNull(),
    pendingTransactionId: text("pending_transaction_id"),
    paymentChannel: text("payment_channel").notNull(),
    address: text("address"),
    city: text("city"),
    region: text("region"),
    postalCode: text("postal_code"),
    country: text("country"),
    createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
});
export const transactionsRelations = relations(transactions, ({ one, many }) => ({
    user: one(users, {
        fields: [transactions.userId],
        references: [users.id],
    }),
    plaidItem: one(plaidItems, {
        fields: [transactions.itemId],
        references: [plaidItems.id],
    }),
    transactionsCategories: many(transactionsCategories),
}));
// Join Table: Transactions and Categories (Many-to-Many)
export const transactionsCategories = pgTable("transaction_category", {
    transactionId: integer("transaction_id") // Changed to integer to match transactions.id (serial)
        .notNull()
        .references(() => transactions.id, { onDelete: "cascade" }),
    categoryId: integer("category_id") // Changed to integer to match categories.id (serial)
        .notNull()
        .references(() => categories.id, { onDelete: "cascade" }),
    assignedAt: timestamp("assigned_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
}, (table) => {
    return {
        pk: primaryKey({ columns: [table.transactionId, table.categoryId] }),
    };
});
export const transactionsCategoriesRelations = relations(transactionsCategories, ({ one }) => ({
    transaction: one(transactions, {
        fields: [transactionsCategories.transactionId],
        references: [transactions.id],
    }),
    category: one(categories, {
        fields: [transactionsCategories.categoryId],
        references: [categories.id],
    }),
}));
//# sourceMappingURL=models.js.map