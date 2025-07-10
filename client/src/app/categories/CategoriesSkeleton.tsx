import styles from "../page.module.css";

export default function CategoriesSkeleton() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Categories</h1>
        <div className={styles.skeleton} style={{ height: "80px" }} />
        <div className={styles.skeleton} style={{ height: "300px" }} />
      </main>
    </div>
  );
}
