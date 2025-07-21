import { db as defaultDb } from "@myfi/infra/database/drizzle/db";
import { createUser } from "./createUser.js";
import { findUserByEmail } from "./findUserByEmail.js";
import { findUserById } from "./findUserById.js";

export const userRepository = (db: typeof defaultDb) => ({
  createUser: createUser(db),
  findUserByEmail: findUserByEmail(db),
  findUserById: findUserById(db),
});
