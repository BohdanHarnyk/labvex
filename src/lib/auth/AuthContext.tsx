"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useSession, signIn, signOut } from "next-auth/react";
import bs58 from "bs58";

export type UserRole = 
  | "GUEST" 
  | "MEMBER"
  | "CITIZEN_EXPLORER" 
  | "VERIFIED_PHYSICIST" 
  | "NOBEL_LAUREATE" 
  | "DEVELOPER" 
  | "LABORATORY" 
  | "COMPANY"
  | "ADMIN";

export interface UserProfileData {
  name: string;
  bio: string;
  avatar: string;
  twitter: string;
  github: string;
  portfolio: { title: string; url: string }[];
  customCategories?: string[];
  customTags?: string[];
}

interface AuthContextType {
  role: UserRole;
  isAdmin: boolean;
  isZKVerified: boolean;
  interests: string[];
  orcid: string | null;
  reputation: number;
  profileData: UserProfileData;
  loginWithGoogle: () => void;
  onboardCitizen: (selectedInterests: string[]) => Promise<void>;
  onboardScientist: (orcid: string) => Promise<void>;
  onboardDeveloper: (github: string) => Promise<void>;
  onboardLaboratory: (facilityName: string) => Promise<void>;
  onboardCompany: (companyName: string) => Promise<void>;
  gainReputation: (amount: number) => Promise<void>;
  updateProfileData: (data: Partial<UserProfileData>) => void;
  toggleAdmin: () => void;
  logout: () => void;
  isAuthenticated: boolean;
  isWalletConnected: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  isInitializing: boolean;
}

const AuthContext = createContext<AuthContextType>({
  role: "GUEST",
  isAdmin: false,
  isZKVerified: false,
  interests: [],
  orcid: null,
  reputation: 1200,
  profileData: {
    name: "Guest User",
    bio: "",
    avatar: "avatar1",
    twitter: "",
    github: "",
    portfolio: [],
    customCategories: [],
    customTags: [],
  },
  loginWithGoogle: () => {},
  onboardCitizen: async () => {},
  onboardScientist: async () => {},
  onboardDeveloper: async () => {},
  onboardLaboratory: async () => {},
  onboardCompany: async () => {},
  gainReputation: async () => {},
  updateProfileData: () => {},
  toggleAdmin: () => {},
  logout: () => {},
  isAuthenticated: false,
  isWalletConnected: false,
  isAuthModalOpen: false,
  openAuthModal: () => {},
  closeAuthModal: () => {},
  isInitializing: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { connected, publicKey, signMessage, disconnect } = useWallet();
  const { data: session, status, update: updateSession } = useSession();

  const [role, setRole] = useState<UserRole>("GUEST");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isZKVerified, setIsZKVerified] = useState(false);
  const [interests, setInterests] = useState<string[]>([]);
  const [orcid, setOrcid] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [reputation, setReputation] = useState(1200);
  const [profileData, setProfileData] = useState<UserProfileData>({
    name: "Guest User",
    bio: "",
    avatar: "avatar1",
    twitter: "",
    github: "",
    portfolio: [],
    customCategories: [],
    customTags: [],
  });
  
  const [isInitializing, setIsInitializing] = useState(true);

  // Solana Wallet Login Hook: auto triggers signature when connected but not signed in
  useEffect(() => {
    const handleSolanaLogin = async () => {
      if (publicKey && signMessage && status === "unauthenticated") {
        try {
          const nonce = Math.floor(Math.random() * 1000000);
          const message = `Sign this message to prove you own this wallet for LABVEX.\n\nNonce: ${nonce}`;
          const messageBytes = new TextEncoder().encode(message);
          
          const signatureBytes = await signMessage(messageBytes);
          const signature = bs58.encode(signatureBytes);

          await signIn("solana", {
            message,
            signature,
            publicKey: publicKey.toBase58(),
            redirect: false,
          });
        } catch (e) {
          console.error("Solana credentials sign-in rejected or failed", e);
          disconnect();
        }
      }
    };
    handleSolanaLogin();
  }, [publicKey, signMessage, status, disconnect]);

  // Sync state with NextAuth Session
  useEffect(() => {
    if (status === "loading") return;

    if (status === "authenticated" && session?.user) {
      // @ts-ignore
      const dbRole = session.user.role as UserRole;
      setRole(dbRole || "MEMBER");
      // @ts-ignore
      setReputation(session.user.reputationScore ?? 1200);
      setIsAdmin(dbRole === "ADMIN");
      // @ts-ignore
      setIsZKVerified(dbRole === "VERIFIED_PHYSICIST" || dbRole === "NOBEL_LAUREATE" || dbRole === "LABORATORY");
      
      // Parse bio if ORCID is embedded
      // @ts-ignore
      const userBio = session.user.bio || "";
      const orcidMatch = userBio.match(/ORCID:\s*([0-9a-zA-Z-]+)/);
      if (orcidMatch) {
        setOrcid(orcidMatch[1]);
      }

      setProfileData(prev => ({
        ...prev,
        // @ts-ignore
        name: session.user.displayName || session.user.name || "Researcher",
        // @ts-ignore
        bio: session.user.bio || "",
        // @ts-ignore
        avatar: session.user.image || "avatar1",
      }));

      // Auto-open Onboarding Modal for completely new GUEST users
      // @ts-ignore
      if (!session.user.isOnboarded && dbRole === "GUEST") {
        setIsAuthModalOpen(true);
      }
    } else {
      // Unauthenticated state resets
      setRole("GUEST");
      setIsAdmin(false);
      setIsZKVerified(false);
      setOrcid(null);
      setReputation(1200);
      setProfileData({
        name: "Guest User",
        bio: "",
        avatar: "avatar1",
        twitter: "",
        github: "",
        portfolio: [],
        customCategories: [],
        customTags: [],
      });
    }

    setIsInitializing(false);
  }, [session, status]);

  const loginWithGoogle = () => {
    signIn("google");
  };

  const onboardCitizen = async (selectedInterests: string[]) => {
    try {
      const res = await fetch("/api/user/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "CITIZEN_EXPLORER",
          interests: selectedInterests,
        }),
      });
      if (res.ok) {
        await updateSession();
        window.location.reload();
      }
    } catch (e) {
      console.error("Onboarding citizen error", e);
    }
  };

  const onboardScientist = async (providedOrcid: string) => {
    try {
      const res = await fetch("/api/user/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "VERIFIED_PHYSICIST",
          orcid: providedOrcid,
        }),
      });
      if (res.ok) {
        await updateSession();
        window.location.reload();
      }
    } catch (e) {
      console.error("Onboarding scientist error", e);
    }
  };

  const onboardDeveloper = async (githubUsername: string) => {
    try {
      const res = await fetch("/api/user/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "DEVELOPER",
          github: githubUsername,
        }),
      });
      if (res.ok) {
        await updateSession();
        window.location.reload();
      }
    } catch (e) {
      console.error("Onboarding developer error", e);
    }
  };

  const onboardLaboratory = async (facilityName: string) => {
    try {
      const res = await fetch("/api/user/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "LABORATORY",
          displayName: facilityName,
        }),
      });
      if (res.ok) {
        await updateSession();
        window.location.reload();
      }
    } catch (e) {
      console.error("Onboarding laboratory error", e);
    }
  };

  const onboardCompany = async (companyName: string) => {
    try {
      const res = await fetch("/api/user/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "COMPANY",
          displayName: companyName,
        }),
      });
      if (res.ok) {
        await updateSession();
        window.location.reload();
      }
    } catch (e) {
      console.error("Onboarding company error", e);
    }
  };

  const gainReputation = async (amount: number) => {
    // If authenticated, we could trigger a reputation post request
    setReputation(prev => prev + amount);
    // Real implementation updates via DB events but on the client we update state as well
  };

  const updateProfileData = (data: Partial<UserProfileData>) => {
    setProfileData(prev => ({ ...prev, ...data }));
  };

  const logout = () => {
    if (connected) disconnect();
    signOut({ redirect: false });
  };

  const toggleAdmin = () => {
    setIsAdmin(prev => !prev);
  };

  const openAuthModal = () => {
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const isAuthenticated = status === "authenticated" && role !== "GUEST";

  return (
    <AuthContext.Provider value={{ 
      role, 
      isAdmin, 
      isZKVerified,
      interests,
      orcid,
      reputation,
      profileData,
      loginWithGoogle, 
      onboardCitizen,
      onboardScientist, 
      onboardDeveloper,
      onboardLaboratory,
      onboardCompany,
      gainReputation,
      updateProfileData,
      toggleAdmin, 
      logout,
      isAuthenticated,
      isWalletConnected: connected || status === "authenticated",
      isAuthModalOpen,
      openAuthModal,
      closeAuthModal,
      isInitializing
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
