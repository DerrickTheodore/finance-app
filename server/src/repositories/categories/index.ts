import { db as defaultDB } from "@myfi/infra/database/drizzle/db";
import { createCategory } from "./createCategory.js";
import { deleteCategory } from "./deleteCategory.js";
import { getCategoriesByUserId } from "./getCategoriesByUserId.js";
import { getCategoryById } from "./getCategoryById.js";
import { updateCategory } from "./updateCategory.js";

const categoryRepository = (db: typeof defaultDB) => ({
  createCategory: createCategory(db),
  deleteCategory: deleteCategory(db),
  getCategoriesByUserId: getCategoriesByUserId(db),
  getCategoryById: getCategoryById(db),
  updateCategory: updateCategory(db),
});

export default categoryRepository;
