
import type { ApiIktaraaProfile } from "../../features/blog/services/blogApi";

// User information shared by Blog and Events.
export interface AuthUser {
  id: number;
  name: string;
  email: string;
  isEmailVerified: boolean;
  createdAt: string;
}

// Shared authentication context.
export interface AuthContextType {
  currentUser: AuthUser | null;
  authLoading: boolean;
  isAuthenticated: boolean;

  login: (profile: ApiIktaraaProfile) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}
