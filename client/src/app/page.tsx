// filepath: /Users/derricktheodore/app-library/finance-app/client/src/app/page.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import styles from "./page.module.css";

export default function Home() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user) {
      router.push("/accounts");
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <p>Loading...</p>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <h1>Welcome to MyFi</h1>
          <p>Your personal finance dashboard.</p>
          <div className={styles.ctas}>
            <Link href="/login" className={styles.primary}>
              Login
            </Link>
            <Link href="/signup" className={styles.secondary}>
              Sign Up
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return null;
}
