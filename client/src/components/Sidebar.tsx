"use client";

import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import styles from "./Sidebar.module.css";

const Sidebar = () => {
  const { logout } = useAuth();

  return (
    <nav className={styles.sidebar}>
      <ul className={styles.navList}>
        <li className={styles.navItem}>
          <Link href="/accounts" className={styles.navLink}>
            Accounts
          </Link>
        </li>
        <li className={styles.navItem}>
          <Link href="/transactions" className={styles.navLink}>
            Transactions
          </Link>
        </li>
        <li className={styles.navItem}>
          <Link href="/categories" className={styles.navLink}>
            Categories
          </Link>
        </li>
        <li className={styles.navItem}>
          <Link href="/analytics" className={styles.navLink}>
            Analytics
          </Link>
        </li>
      </ul>
      <button onClick={logout} className={styles.logoutButton}>
        Logout
      </button>
    </nav>
  );
};

export default Sidebar;
