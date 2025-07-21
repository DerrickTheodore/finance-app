import { db as defaultDb } from "@myfi/infra/database/drizzle/db";
import { createPlaidItem } from "./createPlaidItem.js";
import { deletePlaidItem } from "./deletePlaidItem.js";
import { getPlaidItemById } from "./getPlaidItemById.js";
import { getPlaidItemByPlaidItemId } from "./getPlaidItemByPlaidItemId.js";
import { getPlaidItemsByUserId } from "./getPlaidItemsByUserId.js";

const plaidItemRepository = (db: typeof defaultDb) => ({
  createPlaidItem: createPlaidItem(db),
  getPlaidItemById: getPlaidItemById(db),
  getPlaidItemByPlaidItemId: getPlaidItemByPlaidItemId(db),
  getPlaidItemsByUserId: getPlaidItemsByUserId(db),
  deletePlaidItem: deletePlaidItem(db),
});

export default plaidItemRepository;
