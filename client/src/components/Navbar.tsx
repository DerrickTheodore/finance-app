"use client";

import Link from "next/link";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout, isLoading } = useAuth();

  return (
    <nav
      style={{
        backgroundColor: "var(--navbar-bg, #f0f0f0)", // Use a CSS variable, fallback to light grey
        color: "var(--navbar-fg, #171717)", // Use a CSS variable for text, fallback to dark
        padding: "1rem",
        marginBottom: "1rem",
        borderBottom: "1px solid var(--navbar-border, #e0e0e0)", // Optional: add a border
      }}
    >
      <ul
        style={{
          listStyle: "none",
          display: "flex",
          justifyContent: "space-around",
          margin: 0,
          padding: 0,
        }}
      >
        <li>
          <Link
            href="/"
            style={{
              color: "var(--navbar-link-fg, var(--navbar-fg, #171717))",
            }}
          >
            Home
          </Link>
        </li>
        {isLoading ? (
          <li>Loading...</li>
        ) : user ? (
          <>
            <li>
              <span>Welcome, {user.email}</span>
            </li>
            <li>
              <button
                onClick={logout}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--navbar-button-fg, #0070f3)", // Use a variable, fallback to blue
                  cursor: "pointer",
                  textDecoration: "underline",
                  fontFamily: "inherit", // Ensure button font matches
                  fontSize: "inherit", // Ensure button font size matches
                }}
              >
                Logout
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link
                href="/login"
                style={{
                  color: "var(--navbar-link-fg, var(--navbar-fg, #171717))",
                }}
              >
                Login
              </Link>
            </li>
            <li>
              <Link
                href="/signup"
                style={{
                  color: "var(--navbar-link-fg, var(--navbar-fg, #171717))",
                }}
              >
                Sign Up
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
