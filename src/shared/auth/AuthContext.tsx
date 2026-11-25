
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

import type { AuthUser, AuthContextType } from "./authTypes";

import {
  fetchReaderMe,
  logoutReader,
  getReaderToken,
} from "../../features/blog/services/blogApi";

import type {
  ApiIktaraaProfile,
} from "../../features/blog/services/blogApi";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Convert the shared Iktaraa profile into our frontend user structure.
function mapProfileToUser(
  profile: ApiIktaraaProfile
): AuthUser {
  return {
    id: profile.user_id,
    name: profile.full_name,
    email: profile.email,
    isEmailVerified: profile.is_email_verified,
    createdAt: profile.created_at,
  };
}

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Restore the shared Django authentication session.
  const refreshUser = useCallback(async () => {
    const token = getReaderToken();

    if (!token) {
      setCurrentUser(null);
      return;
    }

    try {
      const profile = await fetchReaderMe();
      const user = mapProfileToUser(profile);

      setCurrentUser(user);

      localStorage.setItem("iktaraa_user", JSON.stringify(user));
    } catch (error) {
      console.error("Unable to restore Iktaraa session:", error);

      setCurrentUser(null);

      localStorage.removeItem("iktaraa_reader_token");
      localStorage.removeItem("iktaraa_user");
    }
  }, []);

  // Restore session when the application starts.
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        await refreshUser();
      } finally {
        if (isMounted) {
          setAuthLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, [refreshUser]);

  // Update shared user after successful authentication.
  const login = useCallback((profile: ApiIktaraaProfile) => {
    const user = mapProfileToUser(profile);

    setCurrentUser(user);

    localStorage.setItem("iktaraa_user", JSON.stringify(user));
  }, []);

  // Logout from Django and clear the shared session.
  const logout = useCallback(async () => {
    try {
      await logoutReader();
    } catch (error) {
      console.error("Server logout error:", error);
    } finally {
      setCurrentUser(null);

      localStorage.removeItem("iktaraa_reader_token");
      localStorage.removeItem("iktaraa_user");
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        authLoading,
        isAuthenticated: currentUser !== null,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to access shared authentication.
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
