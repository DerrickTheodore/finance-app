CREATE TABLE "category" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transaction" (
	"id" serial PRIMARY KEY NOT NULL,
	"plaid_transaction_id" text NOT NULL,
	"plaid_account_id" text NOT NULL,
	"item_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"name" text NOT NULL,
	"merchant_name" text,
	"amount" numeric(19, 4) NOT NULL,
	"iso_currency_code" text,
	"unofficial_currency_code" text,
	"date" date NOT NULL,
	"pending" boolean DEFAULT false NOT NULL,
	"pending_transaction_id" text,
	"payment_channel" text NOT NULL,
	"address" text,
	"city" text,
	"region" text,
	"postal_code" text,
	"country" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "transaction_plaid_transaction_id_unique" UNIQUE("plaid_transaction_id")
);
--> statement-breakpoint
CREATE TABLE "transaction_category" (
	"transaction_id" integer NOT NULL,
	"category_id" integer NOT NULL,
	"assigned_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "transaction_category_transaction_id_category_id_pk" PRIMARY KEY("transaction_id","category_id")
);
--> statement-breakpoint
ALTER TABLE "category" ADD CONSTRAINT "category_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_item_id_plaid_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."plaid_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_category" ADD CONSTRAINT "transaction_category_transaction_id_transaction_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transaction"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_category" ADD CONSTRAINT "transaction_category_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "category_user_id_name_unq" ON "category" USING btree ("user_id","name");