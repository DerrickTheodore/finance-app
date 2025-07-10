"use client";

import { usePathname } from "next/dist/client/components/navigation";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import styles from "./MainLayout.module.css";
import Sidebar from "./Sidebar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!user && !(pathname === "/login" || pathname === "/signup")) {
      router.push("/");
    }
  }, [user, pathname, router]);

  if (isAuthLoading) {
    return (
      <div className={styles.container}>
        <p>Loading...</p>
      </div>
    );
  }

  if (user && (pathname === "/login" || pathname === "/signup")) {
    return (
      <div className={styles.container}>
        <p>Logging in...</p>
      </div>
    );
  }

  if (!user) {
    return <div className={styles.container}>{children}</div>;
  }

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <main className={styles.mainContent}>{children}</main>
    </div>
  );
}
