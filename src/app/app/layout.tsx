"use client";
 
import { AuthPanel } from "@/components/auth/AuthPanel";
import { SidebarLeft } from "@/components/layout/SidebarLeft";
import { SidebarRight } from "@/components/layout/SidebarRight";
import { Sparkles, UserCog } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
 
export default function AppLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, isInitializing, isAdmin, toggleAdmin, openAuthModal } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isInitializing && !isAuthenticated) {
      router.replace("/");
      openAuthModal();
    }
  }, [mounted, isInitializing, isAuthenticated, router, openAuthModal]);

  // Loading screen during hydration, session restoration, or redirecting
  if (!mounted || isInitializing || !isAuthenticated) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#070b13] font-mono text-green-400 p-6 selection:bg-green-950 selection:text-green-300">
        {/* Scan line overlay for the entire viewport */}
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05)_0%,transparent_70%)] pointer-events-none" />
        <div className="fixed inset-0 bg-[linear-gradient(to_bottom,transparent_95%,rgba(16,185,129,0.03)_98%,rgba(16,185,129,0.07)_100%)] bg-[size:100%_30px] animate-scan pointer-events-none" />

        <div className="max-w-md w-full border border-green-500/20 rounded-2xl p-8 bg-[#0b111e]/90 backdrop-blur-md shadow-2xl relative overflow-hidden flex flex-col gap-6">
          {/* Card-specific scanning visual */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-green-500/30 blur-[2px] animate-scan" />
          
          <div className="flex items-center gap-3 border-b border-green-500/10 pb-4">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <div className="text-xs uppercase tracking-widest font-bold text-green-400/90">Security Gateway v1.0.4</div>
          </div>
          
          <div className="space-y-3 text-xs leading-relaxed text-green-400/85">
            <div className="flex items-center gap-2">
              <span className="text-green-500 font-bold">&gt;</span>
              <span>INITIALIZING SECURE SESSION CONTROLLER...</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500 font-bold">&gt;</span>
              <span>VALIDATING CRYPTOGRAPHIC CREDENTIALS...</span>
            </div>
            {!mounted || isInitializing ? (
              <div className="flex items-center gap-2 text-green-400/60 animate-pulse">
                <span className="font-bold">&gt;</span>
                <span>RESTORING SESSION FROM LOCAL STORAGE...</span>
              </div>
            ) : (
              <div className="flex items-start gap-2 text-red-400 font-bold animate-pulse">
                <span>&gt;</span>
                <span className="leading-normal">ACCESS DENIED: UNAUTHORIZED ROLE. REDIRECTING TO AUTHENTICATION LAYER...</span>
              </div>
            )}
          </div>

          <div className="mt-4">
            <div className="w-full bg-green-950/40 h-1.5 rounded-full overflow-hidden border border-green-500/10 relative">
              <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-emerald-400 rounded-full w-full animate-progress" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
      {/* App Header */}
      <header className="flex-none h-16 bg-white border-b border-gray-200 px-6 flex justify-between items-center z-20">
        <div className="flex items-center gap-4">
          <Link 
            href="/" 
            className="text-xs font-bold text-gray-500 hover:text-green-500 border border-gray-200 px-3 py-1.5 rounded-xl hover:bg-gray-50 hover:border-green-500/30 transition-all flex items-center gap-1.5 bg-white shadow-sm"
          >
            ← Landing Page
          </Link>
          <div className="h-6 w-px bg-gray-200" />
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">
              LAB<span className="text-green-500">VEX</span>
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {isAuthenticated && (
            <button 
              onClick={toggleAdmin}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isAdmin ? "bg-red-50 text-red-600 border border-red-200" : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"}`}
            >
              <UserCog className="w-4 h-4" />
              {isAdmin ? "Exit Admin" : "Test Admin"}
            </button>
          )}
          <AuthPanel />
        </div>
      </header>
 
      {/* Main 3-Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <SidebarLeft />
 
        {/* Center Content (Scrollable) */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 relative">
          {/* Subtle background gradient */}
          <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-white to-transparent pointer-events-none" />
          
          <div className="max-w-3xl mx-auto relative z-10 pb-20">
            {children}
          </div>
        </main>
 
        {/* Right Sidebar (Vexy AI) */}
        <SidebarRight />
      </div>
    </div>
  );
}
