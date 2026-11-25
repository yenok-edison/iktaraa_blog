
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { useAuth } from "../../../shared/auth/AuthContext";
import {
  fetchEventHostProfile,
  EventHostProfileResponse,
} from "../services/eventApi";

import { UserAccount } from "../types/event";

interface EventAuthContextType {
  currentUser: UserAccount | null;
  onLogin: (user: UserAccount) => void;
  onLogout: () => void;
  hostProfile: EventHostProfileResponse | null;
  hostProfileLoading: boolean;
  refreshHostProfile: () => Promise<void>;
}

const EventAuthContext = createContext<
  EventAuthContextType | undefined
>(undefined);

export function EventAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser: reader, logout } = useAuth();

  const [hostProfile, setHostProfile] =
    useState<EventHostProfileResponse | null>(null);

  const [hostProfileLoading, setHostProfileLoading] =
    useState(false);

  
const isApprovedHost = Boolean(
  hostProfile?.is_verified && hostProfile?.is_approved
);

const currentUser: UserAccount | null = reader
  ? {
      id: String(reader.id),
      name: reader.name,
      email: reader.email,
      role: isApprovedHost ? "host" : "attendee",
      organization: hostProfile?.organization,
      bio: hostProfile?.bio,
      city: hostProfile?.city,
      verifiedHost: isApprovedHost,
      createdAt: reader.createdAt,
    }
  : null;


  const refreshHostProfile = async () => {
    if (!reader) {
      setHostProfile(null);
      return;
    }

    setHostProfileLoading(true);

    try {
      const profile = await fetchEventHostProfile();
      setHostProfile(profile);
    } catch (error) {
      setHostProfile(null);

      console.log(
        "No event host profile found or profile unavailable.",
        error
      );
    } finally {
      setHostProfileLoading(false);
    }
  };

  useEffect(() => {
    refreshHostProfile();
  }, [reader?.id]);

  const onLogin = (_user: UserAccount) => {
    // Authentication is handled by the shared AuthContext.
    // Do not create a separate Events login session.
  };

  const onLogout = () => {
    void logout();
    setHostProfile(null);
  };

  return (
    <EventAuthContext.Provider
      value={{
        currentUser,
        onLogin,
        onLogout,
        hostProfile,
        hostProfileLoading,
        refreshHostProfile,
      }}
    >
      {children}
    </EventAuthContext.Provider>
  );
}

export function useEventAuth() {
  const context = useContext(EventAuthContext);

  if (!context) {
    throw new Error(
      "useEventAuth must be used within EventAuthProvider"
    );
  }

  return context;
}
