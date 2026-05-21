"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

export type UserRole = "GUEST" | "CITIZEN_EXPLORER" | "VERIFIED_PHYSICIST" | "NOBEL_LAUREATE" | "DEVELOPER" | "LABORATORY" | "COMPANY";

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
  onboardCitizen: (selectedInterests: string[]) => void;
  onboardScientist: (orcid: string) => void;
  onboardDeveloper: (github: string) => void;
  onboardLaboratory: (facilityName: string) => void;
  onboardCompany: (companyName: string) => void;
  gainReputation: (amount: number) => void;
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
  onboardCitizen: () => {},
  onboardScientist: () => {},
  onboardDeveloper: () => {},
  onboardLaboratory: () => {},
  onboardCompany: () => {},
  gainReputation: () => {},
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
  const { connected, disconnect } = useWallet();
  const [role, setRole] = useState<UserRole>("GUEST");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isZKVerified, setIsZKVerified] = useState(false);
  const [isGoogleLoggedIn, setIsGoogleLoggedIn] = useState(false);
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

  // Load state from localStorage on mount
  useEffect(() => {
    const savedRole = localStorage.getItem("labvex_role") as UserRole | null;
    const savedReputation = localStorage.getItem("labvex_reputation");
    const savedProfile = localStorage.getItem("labvex_profile");
    const savedOrcid = localStorage.getItem("labvex_orcid");
    const savedInterests = localStorage.getItem("labvex_interests");
    const savedZK = localStorage.getItem("labvex_zk");
    const savedAdmin = localStorage.getItem("labvex_admin");
    const savedGoogle = localStorage.getItem("labvex_google");

    if (savedRole) setRole(savedRole);
    if (savedReputation) setReputation(Number(savedReputation));
    if (savedProfile) {
      try {
        setProfileData(JSON.parse(savedProfile));
      } catch (e) {
        console.error("Error parsing profile data from localStorage", e);
      }
    }
    if (savedOrcid) setOrcid(savedOrcid);
    if (savedInterests) {
      try {
        setInterests(JSON.parse(savedInterests));
      } catch (e) {}
    }
    if (savedZK) setIsZKVerified(savedZK === "true");
    if (savedAdmin) setIsAdmin(savedAdmin === "true");
    if (savedGoogle) setIsGoogleLoggedIn(savedGoogle === "true");

    setIsInitializing(false);
  }, []);

  // Save state to localStorage whenever it changes (after initialization is complete)
  useEffect(() => {
    if (isInitializing) return;
    localStorage.setItem("labvex_role", role);
    localStorage.setItem("labvex_reputation", String(reputation));
    localStorage.setItem("labvex_profile", JSON.stringify(profileData));
    localStorage.setItem("labvex_orcid", orcid || "");
    localStorage.setItem("labvex_interests", JSON.stringify(interests));
    localStorage.setItem("labvex_zk", String(isZKVerified));
    localStorage.setItem("labvex_admin", String(isAdmin));
    localStorage.setItem("labvex_google", String(isGoogleLoggedIn));
  }, [role, reputation, profileData, orcid, interests, isZKVerified, isAdmin, isGoogleLoggedIn, isInitializing]);

  useEffect(() => {
    // Basic sync: if disconnected from both, reset to GUEST.
    // The actual role elevation happens inside the onboard functions.
    if (isInitializing) return;
    if (!connected && !isGoogleLoggedIn) {
      setRole("GUEST");
      setIsZKVerified(false);
      setIsAdmin(false);
      setInterests([]);
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
  }, [connected, isGoogleLoggedIn, isInitializing]);

  const loginWithGoogle = () => {
    setIsGoogleLoggedIn(true);
  };

  const onboardCitizen = (selectedInterests: string[]) => {
    setInterests(selectedInterests);
    setRole("CITIZEN_EXPLORER");
    setProfileData({
      name: "Enthusiast Alex",
      bio: "Citizen science enthusiast, looking for raw EHD data to filter and analyze.",
      avatar: "avatar2",
      twitter: "twitter.com/explorer_alex",
      github: "github.com/explorer_alex",
      portfolio: [
        { title: "Analysis of EHD Thrust Anomaly", url: "https://labvex.org/docs/ehd_analysis.pdf" }
      ],
      customCategories: ["Propulsion", "Quantum", "Data Analysis"],
      customTags: ["ehd", "thrust", "citizen-science"],
    });
  };

  const onboardScientist = (providedOrcid: string) => {
    setOrcid(providedOrcid);
    setIsZKVerified(true);
    // 10% chance of being a Nobel Laureate mock
    const isNobel = Math.random() > 0.9;
    setRole(isNobel ? "NOBEL_LAUREATE" : "VERIFIED_PHYSICIST");
    setProfileData({
      name: "Dr. V. K.",
      bio: "Specializing in high-voltage electrodynamics and asymmetric capacitor arrays. Looking for anomalies in standard gravity models.",
      avatar: "avatar3",
      twitter: "twitter.com/dr_vk_physics",
      github: "github.com/dr-vk",
      portfolio: [
        { title: "Observation of Anomalous Thrust in Asymmetric Capacitors", url: "https://labvex.org/docs/anomalous_thrust.pdf" },
        { title: "Biefeld-Brown Effect under Extreme Vacuum Conditions", url: "https://labvex.org/docs/extreme_vacuum.pdf" }
      ],
      customCategories: ["Propulsion", "Quantum", "Vacuum Tech"],
      customTags: ["ehd", "asymmetric-capacitors", "biefeld-brown"],
    });
  };

  const onboardDeveloper = (github: string) => {
    setRole("DEVELOPER");
    setProfileData({
      name: "Dev Stark",
      bio: "AI Agent Coordinator & Smart Contract wizard. Building open-source SDKs for Sovereign Science.",
      avatar: "avatar4",
      twitter: "twitter.com/devstark",
      github: `github.com/${github}`,
      portfolio: [
        { title: "Vexy AI Auditor Node SDK", url: "https://github.com/labvex/vexy-auditor-sdk" }
      ],
      customCategories: ["Hardware", "Software", "AI Agents"],
      customTags: ["smart-contracts", "solana", "ai-agents"],
    });
  };

  const onboardLaboratory = (facilityName: string) => {
    setRole("LABORATORY");
    setIsZKVerified(true);
    setProfileData({
      name: facilityName,
      bio: "Providing state-of-the-art laboratory capacities and vacuum chambers for frontier physics replication.",
      avatar: "avatar5",
      twitter: "twitter.com/munich_quantum",
      github: "github.com/munich-quantum",
      portfolio: [
        { title: "Calibration Logs: 10^-7 Torr Vacuum chambers", url: "https://labvex.org/labs/munich_calib.pdf" }
      ],
      customCategories: ["Vacuum Tech", "Quantum", "Hardware"],
      customTags: ["vacuum-chamber", "calibration", "telemetry"],
    });
  };

  const onboardCompany = (companyName: string) => {
    setRole("COMPANY");
    setProfileData({
      name: companyName,
      bio: "Corporate sponsor investing in intellectual property tokens and commercial R&D gravity-control mechanisms.",
      avatar: "avatar6",
      twitter: "twitter.com/aether_corp",
      github: "github.com/aether-rnd",
      portfolio: [
        { title: "2026 Sovereign Science R&D Grants Portfolio", url: "https://labvex.org/grants/portfolio2026.pdf" }
      ],
      customCategories: ["Investments", "Propulsion", "IP Tokens"],
      customTags: ["grants", "funding", "ip-tokens"],
    });
  };

  const gainReputation = (amount: number) => {
    setReputation(prev => prev + amount);
  };

  const updateProfileData = (data: Partial<UserProfileData>) => {
    setProfileData(prev => ({ ...prev, ...data }));
  };

  const logout = () => {
    if (connected) disconnect();
    setIsGoogleLoggedIn(false);
    setIsZKVerified(false);
    setIsAdmin(false);
    setInterests([]);
    setOrcid(null);
    setRole("GUEST");
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
    localStorage.removeItem("labvex_role");
    localStorage.removeItem("labvex_reputation");
    localStorage.removeItem("labvex_profile");
    localStorage.removeItem("labvex_orcid");
    localStorage.removeItem("labvex_interests");
    localStorage.removeItem("labvex_zk");
    localStorage.removeItem("labvex_admin");
    localStorage.removeItem("labvex_google");
  };

  const toggleAdmin = () => {
    setIsAdmin(!isAdmin);
  };

  const openAuthModal = () => {
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const isAuthenticated = role !== "GUEST"; // Authenticated fully ONLY after choosing a path

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
      isWalletConnected: connected || isGoogleLoggedIn,
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
