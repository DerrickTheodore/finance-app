"use client";

import { useState } from "react";
import CategoriesManager from "../../features/categories/CategoriesManager";
import styles from "../page.module.css";

export default function CategoriesView() {
  const [showCategoriesManager, setShowCategoriesManager] = useState(true);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Categories</h1>
        <section className={styles.section}>
          <button
            onClick={() => setShowCategoriesManager(!showCategoriesManager)}
            className={styles.button}
            style={{ marginRight: "10px" }}
          >
            {showCategoriesManager ? "Hide" : "Show"} Categories Manager
          </button>
        </section>

        {showCategoriesManager && (
          <section className={styles.section}>
            <CategoriesManager />
          </section>
        )}
      </main>
    </div>
  );
}
