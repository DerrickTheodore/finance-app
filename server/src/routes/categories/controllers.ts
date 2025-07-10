import type { Category } from "@myfi/infra/types";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as categoryRepository from "../../repositories/categoryRepository.js";
import {
  CategoryIdParamsSchema,
  CreateCategorySchema,
  UpdateCategorySchema,
} from "./schemas.js";

export const createCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const parsed = CreateCategorySchema.parse(req);
    // @ts-ignore // TODO: Fix this once auth is in place
    const userId = parseInt(req.user?.id || "1");

    const newCategoryData = {
      userId,
      name: parsed.body.name,
      color: parsed.body.color,
      icon: parsed.body.icon,
    };

    // Type assertion for the data passed to createCategory if NewCategory from schema is slightly different
    const newCategory = await categoryRepository.createCategory(
      newCategoryData as any
    );
    res.status(StatusCodes.CREATED).json(newCategory as Category); // Assert response type
  } catch (error) {
    console.error("Error creating category:", error);
    if (
      error instanceof Error &&
      error.message.includes("Unique constraint failed")
    ) {
      res.status(StatusCodes.CONFLICT).json({
        message: "Category with this name already exists for the user.",
      });
      return;
    }
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Error creating category", error });
  }
};

export const getCategories = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // @ts-ignore // TODO: Fix this once auth is in place
    const userId = parseInt(req.user?.id || "1");
    const result = await categoryRepository.getCategoriesByUserId(userId);
    res.status(StatusCodes.OK).json(result as Category[]); // Assert response type
  } catch (error) {
    console.error("Error fetching categories:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Error fetching categories", error });
  }
};

export const getCategoryById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const parsedParams = CategoryIdParamsSchema.parse(req);
    // @ts-ignore // TODO: Fix this once auth is in place
    const userId = parseInt(req.user?.id || "1");
    const categoryId = parseInt(parsedParams.params.categoryId);

    const category = await categoryRepository.getCategoryById(
      categoryId,
      userId
    );
    if (!category) {
      res.status(StatusCodes.NOT_FOUND).json({ message: "Category not found" });
      return;
    }
    res.status(StatusCodes.OK).json(category as Category); // Assert response type
  } catch (error) {
    console.error("Error fetching category by ID:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Error fetching category by ID", error });
  }
};

export const updateCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const parsed = UpdateCategorySchema.parse(req);
    // @ts-ignore // TODO: Fix this once auth is in place
    const userId = parseInt(req.user?.id || "1");
    const categoryId = parseInt(parsed.params.categoryId);

    const updateData = {
      name: parsed.body.name,
      color: parsed.body.color,
      icon: parsed.body.icon,
    };

    const updatedCategory = await categoryRepository.updateCategory(
      categoryId,
      userId,
      updateData
    );

    if (!updatedCategory) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Category not found or not updated" });
      return;
    }
    res.status(StatusCodes.OK).json(updatedCategory as Category); // Assert response type
  } catch (error) {
    console.error("Error updating category:", error);
    if (
      error instanceof Error &&
      error.message.includes("Unique constraint failed")
    ) {
      res.status(StatusCodes.CONFLICT).json({
        message: "Another category with this name already exists for the user.",
      });
      return;
    }
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Error updating category", error });
  }
};

export const deleteCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const parsedParams = CategoryIdParamsSchema.parse(req);
    // @ts-ignore // TODO: Fix this once auth is in place
    const userId = parseInt(req.user?.id || "1");
    const categoryId = parseInt(parsedParams.params.categoryId);

    const success = await categoryRepository.deleteCategory(categoryId, userId);
    if (!success) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Category not found or could not be deleted" });
      return;
    }
    res.status(StatusCodes.NO_CONTENT).send();
  } catch (error) {
    console.error("Error deleting category:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Error deleting category", error });
  }
};
