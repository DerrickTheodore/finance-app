"use client";

import { getApiBaseUrl } from "@/lib/utils";
import { useRouter } from "next/navigation";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

// Define more specific types for API responses and inputs if available
// For now, using general types.
interface User {
  id: string; // or number, depending on your DB schema
  email: string;
  // Add other user properties as needed, e.g., name, createdAt
}

interface AuthCredentials {
  email: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null; // Add error state
  login: (credentials: AuthCredentials) => Promise<boolean>; // Return boolean
  logout: () => Promise<void>;
  signup: (credentials: AuthCredentials) => Promise<boolean>; // Return boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // Add error state
  const router = useRouter();

  const fetchUserStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null); // Clear error on new fetch
    try {
      const url = `${getApiBaseUrl()}/api/auth/me`;
      console.log("[fetchUserStatus] Fetching:", url);
      const response = await fetch(url);
      console.log("[fetchUserStatus] Response status:", response.status);
      if (response.ok) {
        const userData: User = await response.json(); // Add explicit type
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to fetch user status:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserStatus();
  }, [fetchUserStatus]);

  const login = async (credentials: AuthCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const url = `${getApiBaseUrl()}/api/auth/login`;
      console.log("[login] Fetching:", url);
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      console.log("[login] Response status:", response.status);
      if (response.ok) {
        await response.json();
        await fetchUserStatus();
        return true;
      } else {
        const errorData = await response.text();
        setError(errorData || "Login failed");
        return false;
      }
    } catch (err) {
      console.error("Login error:", err);
      setUser(null);
      const message =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred during login.";
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (credentials: AuthCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const url = `${getApiBaseUrl()}/api/auth/signup`;
      console.log("[signup] Fetching:", url);
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      console.log("[signup] Response status:", response.status);
      if (response.ok) {
        await fetchUserStatus();
        return true; // Indicate success
      } else {
        const errorData = await response.text();
        setError(errorData || "Signup failed");
        return false;
      }
    } catch (err) {
      console.error("Signup error:", err);
      setUser(null);
      const message =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred during signup.";
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const url = `${getApiBaseUrl()}/api/auth/logout`;
      console.log("[logout] Fetching:", url);
      await fetch(url, { method: "POST" });
      console.log("[logout] Logout request sent");
    } catch (error) {
      console.error("Logout failed:", error);
      // Even if server call fails, proceed to clear client state
    } finally {
      setUser(null);
      setIsLoading(false);
      router.push("/"); // Use Next.js client-side navigation
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, error, login, logout, signup }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
