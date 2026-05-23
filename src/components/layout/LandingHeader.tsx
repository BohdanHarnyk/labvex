"use client";

import { Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "next/navigation";

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, openAuthModal, setUserRequestedLanding } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLaunchApp = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isAuthenticated) {
      setUserRequestedLanding(false);
      router.push("/app");
    } else {
      openAuthModal();
    }
  };

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm py-4' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-6 h-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-gray-900">
            LAB<span className="text-green-500">VEX</span>
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
          <a href="#vision" className="hover:text-green-600 transition-colors">Vision</a>
          <a href="#architecture" className="hover:text-green-600 transition-colors">Architecture</a>
          <a href="#vexy-ai" className="hover:text-green-600 transition-colors">Vexy AI</a>
          <a href="#governance" className="hover:text-green-600 transition-colors">Governance</a>
        </nav>

        <button 
          onClick={handleLaunchApp}
          className="btn-primary px-6 py-2.5 rounded-full flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 transition-all cursor-pointer"
        >
          Launch App <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
