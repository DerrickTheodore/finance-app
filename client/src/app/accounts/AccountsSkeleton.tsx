"use client";

import styles from "../page.module.css";

const AccountsSkeleton = () => {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Accounts</h1>
        <div className={styles.skeleton} style={{ height: "120px" }} />
        <div className={styles.skeleton} style={{ height: "300px" }} />
      </main>
    </div>
  );
};

export default AccountsSkeleton;
