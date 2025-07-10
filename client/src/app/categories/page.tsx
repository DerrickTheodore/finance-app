"use client";

import { Suspense } from "react";
import CategoriesSkeleton from "./CategoriesSkeleton";
import CategoriesView from "./CategoriesView";

export default function CategoriesPage() {
  return (
    <Suspense fallback={<CategoriesSkeleton />}>
      <CategoriesView />
    </Suspense>
  );
}
