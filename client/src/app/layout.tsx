import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import MainLayout from "../components/MainLayout";
import QueryProvider from "../components/QueryProvider";
import { AppStateProvider } from "../context/AppStateContext";
import { AuthProvider } from "../context/AuthContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MyFi App",
  description: "Personal Finance Management App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <QueryProvider>
          <AuthProvider>
            <AppStateProvider>
              <MainLayout>{children}</MainLayout>
            </AppStateProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
