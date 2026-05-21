"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

export type UserRole = "GUEST" | "CITIZEN_EXPLORER" | "VERIFIED_PHYSICIST" | "NOBEL_LAUREATE";

interface AuthContextType {
  role: UserRole;
  isZKVerified: boolean;
  verifyAsPhysicist: () => void;
  resetRole: () => void;
}

const AuthContext = createContext<AuthContextType>({
  role: "GUEST",
  isZKVerified: false,
  verifyAsPhysicist: () => {},
  resetRole: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { connected, publicKey } = useWallet();
  const [role, setRole] = useState<UserRole>("GUEST");
  const [isZKVerified, setIsZKVerified] = useState(false);

  useEffect(() => {
    if (!connected) {
      setRole("GUEST");
      setIsZKVerified(false);
    } else {
      // Mock logic: if they connect, they are a Citizen Explorer by default
      // In a real app, this would query Metaplex Core for their SBT badge
      if (!isZKVerified) {
        setRole("CITIZEN_EXPLORER");
      }
    }
  }, [connected, isZKVerified]);

  const verifyAsPhysicist = () => {
    if (!connected) return;
    
    // Mocking the ORCID/Scopus ZK proof flow
    setTimeout(() => {
      setIsZKVerified(true);
      // Hardcode a mock "Nobel" for a specific wallet or random for demo
      const isNobel = Math.random() > 0.8;
      setRole(isNobel ? "NOBEL_LAUREATE" : "VERIFIED_PHYSICIST");
    }, 2000);
  };

  const resetRole = () => {
    setIsZKVerified(false);
    if (connected) setRole("CITIZEN_EXPLORER");
    else setRole("GUEST");
  };

  return (
    <AuthContext.Provider value={{ role, isZKVerified, verifyAsPhysicist, resetRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
