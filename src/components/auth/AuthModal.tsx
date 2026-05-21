"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useAuth } from "@/lib/auth/AuthContext";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, TestTube2, UserCircle2, ArrowRight, ShieldCheck, Code, Building2, Briefcase, ChevronRight } from "lucide-react";

export function AuthModal() {
  const { connected } = useWallet();
  const { setVisible } = useWalletModal();
  const { 
    isAuthenticated, 
    isWalletConnected, 
    loginWithGoogle, 
    closeAuthModal,
    role,
    onboardCitizen,
    onboardScientist,
    onboardDeveloper,
    onboardLaboratory,
    onboardCompany,
    isAuthModalOpen
  } = useAuth();
  
  const [onboardStep, setOnboardStep] = useState<
    "SELECT_PATH" | 
    "CITIZEN_FORM" | 
    "SCIENTIST_FORM" | 
    "DEVELOPER_FORM" | 
    "LABORATORY_FORM" | 
    "COMPANY_FORM" | 
    "TERMINAL"
  >("SELECT_PATH");
  
  const [githubUser, setGithubUser] = useState("");
  const [primaryLang, setPrimaryLang] = useState("Rust");
  const [facilityName, setFacilityName] = useState("");
  const [chamberModel, setChamberModel] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [fundingFocus, setFundingFocus] = useState("");
  const [orcidVal, setOrcidVal] = useState("0000-0002-1825-0097");

  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    if (isWalletConnected && !isAuthenticated) {
      setOnboardStep("SELECT_PATH");
    }
  }, [isWalletConnected, isAuthenticated]);

  const runTerminalSimulation = (
    path: "CITIZEN" | "SCIENTIST" | "DEVELOPER" | "LABORATORY" | "COMPANY",
    data: any
  ) => {
    setOnboardStep("TERMINAL");
    setLogs(["> Initializing LABVEX OS..."]);
    
    setTimeout(() => setLogs(l => [...l, "> Establishing connection... OK"]), 100);
    setTimeout(() => setLogs(l => [...l, "> Fetching decentralized identity..."]), 200);
    
    if (path === "SCIENTIST") {
      setTimeout(() => setLogs(l => [...l, "> Checking ZK-Proofs against ORCID database..."]), 300);
      setTimeout(() => setLogs(l => [...l, "> Generating verifiable credentials (SBT)..."]), 450);
      setTimeout(() => {
        setLogs(l => [...l, "> Access granted. Welcome, Researcher."]);
        setTimeout(() => {
          onboardScientist(data.orcid);
          closeAuthModal();
        }, 150);
      }, 600);
    } else if (path === "DEVELOPER") {
      setTimeout(() => setLogs(l => [...l, `> Querying GitHub user: ${data.github}...`]), 300);
      setTimeout(() => setLogs(l => [...l, "> Setting up secure SDK runtime sandbox..."]), 450);
      setTimeout(() => {
        setLogs(l => [...l, "> Access granted. Developer workspace unlocked."]);
        setTimeout(() => {
          onboardDeveloper(data.github);
          closeAuthModal();
        }, 150);
      }, 600);
    } else if (path === "LABORATORY") {
      setTimeout(() => setLogs(l => [...l, `> Pinging hardware endpoint at ${data.facilityName}...`]), 300);
      setTimeout(() => setLogs(l => [...l, "> Fetching ZK-certified cleanroom telemetry..."]), 450);
      setTimeout(() => {
        setLogs(l => [...l, "> Access granted. Live Telemetry stream established."]);
        setTimeout(() => {
          onboardLaboratory(data.facilityName);
          closeAuthModal();
        }, 150);
      }, 600);
    } else if (path === "COMPANY") {
      setTimeout(() => setLogs(l => [...l, `> Loading records for: ${data.companyName}...`]), 300);
      setTimeout(() => setLogs(l => [...l, "> Verifying tokenized R&D fund addresses..."]), 450);
      setTimeout(() => {
        setLogs(l => [...l, "> Access granted. Multi-sig workspace deployed."]);
        setTimeout(() => {
          onboardCompany(data.companyName);
          closeAuthModal();
        }, 150);
      }, 600);
    } else {
      setTimeout(() => setLogs(l => [...l, "> Registering Citizen Explorer node..."]), 250);
      setTimeout(() => setLogs(l => [...l, "> Saving research preferences..."]), 400);
      setTimeout(() => {
        setLogs(l => [...l, "> Access granted. Welcome to the Network."]);
        setTimeout(() => {
          onboardCitizen(data.interests);
          closeAuthModal();
        }, 150);
      }, 550);
    }
  };

  return (
    <AnimatePresence>
      {isAuthModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4"
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-8 relative overflow-hidden"
          >
            {/* Close Button (only show if not in middle of loading) */}
            {!isWalletConnected && (
              <button onClick={closeAuthModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">✕</button>
            )}

            {/* STEP 0: INITIAL LOGIN (Google / Web3) */}
            {!isWalletConnected && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Welcome to LABVEX</h2>
                <p className="text-sm text-gray-500 mb-8 text-center">Select an authentication method to continue.</p>
                <div className="space-y-4">
                  <button 
                    onClick={loginWithGoogle}
                    className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-xl p-3 hover:bg-gray-50 transition-colors font-medium text-gray-700"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                  </button>
                  <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase tracking-wider">or Web3</span>
                    <div className="flex-grow border-t border-gray-200"></div>
                  </div>
                  <button 
                    onClick={() => setVisible(true)}
                    className="w-full flex items-center justify-center gap-3 bg-gray-900 text-white rounded-xl p-3 hover:bg-gray-800 transition-colors font-medium"
                  >
                    Connect Solana Wallet
                  </button>
                </div>
              </div>
            )}

            {/* STEP 1: PATH SELECTION */}
            {isWalletConnected && onboardStep === "SELECT_PATH" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Establish Identity</h2>
                <p className="text-sm text-gray-500 mb-6">Choose your role in the Sovereign Science Network.</p>
                
                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {/* Scientist */}
                  <button 
                    onClick={() => setOnboardStep("SCIENTIST_FORM")}
                    className="w-full flex items-center gap-4 p-4 border border-gray-100 bg-gray-50 rounded-xl hover:border-green-500 hover:bg-green-50/50 transition-all text-left group"
                  >
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                      <TestTube2 className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-sm">Verified Scientist</h3>
                      <p className="text-xs text-gray-500 truncate">Publish research, earn reputation, verify academic degrees.</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-green-500 transition-colors" />
                  </button>

                  {/* Developer */}
                  <button 
                    onClick={() => setOnboardStep("DEVELOPER_FORM")}
                    className="w-full flex items-center gap-4 p-4 border border-gray-100 bg-gray-50 rounded-xl hover:border-purple-500 hover:bg-purple-50/50 transition-all text-left group"
                  >
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                      <Code className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-sm">Developer</h3>
                      <p className="text-xs text-gray-500 truncate">Build AI agents, smart contracts, and open science SDKs.</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-500 transition-colors" />
                  </button>

                  {/* Laboratory */}
                  <button 
                    onClick={() => setOnboardStep("LABORATORY_FORM")}
                    className="w-full flex items-center gap-4 p-4 border border-gray-100 bg-gray-50 rounded-xl hover:border-indigo-500 hover:bg-indigo-50/50 transition-all text-left group"
                  >
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                      <Building2 className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-sm">Laboratory / Facility</h3>
                      <p className="text-xs text-gray-500 truncate">Provide hardware testing, vacuum chambers, and sensor telemetry.</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                  </button>

                  {/* Company */}
                  <button 
                    onClick={() => setOnboardStep("COMPANY_FORM")}
                    className="w-full flex items-center gap-4 p-4 border border-gray-100 bg-gray-50 rounded-xl hover:border-amber-500 hover:bg-amber-50/50 transition-all text-left group"
                  >
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                      <Briefcase className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-sm">Company Sponsor</h3>
                      <p className="text-xs text-gray-500 truncate">Fund research, purchase IP tokens, and license technologies.</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-amber-500 transition-colors" />
                  </button>

                  {/* Enthusiast */}
                  <button 
                    onClick={() => setOnboardStep("CITIZEN_FORM")}
                    className="w-full flex items-center gap-4 p-4 border border-gray-100 bg-gray-50 rounded-xl hover:border-blue-500 hover:bg-blue-50/50 transition-all text-left group"
                  >
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                      <UserCircle2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-sm">Citizen Explorer</h3>
                      <p className="text-xs text-gray-500 truncate">Analyze raw telemetry, tip creators, and complete general missions.</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2A: CITIZEN FORM */}
            {isWalletConnected && onboardStep === "CITIZEN_FORM" && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                <button onClick={() => setOnboardStep("SELECT_PATH")} className="text-xs text-gray-500 hover:text-gray-900 mb-4 flex items-center gap-1">
                  ← Back
                </button>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Select your interests</h2>
                <p className="text-sm text-gray-500 mb-6">This helps us tailor your feed and missions.</p>
                
                <div className="flex flex-wrap gap-2 mb-8">
                  {["Propulsion", "Quantum Mechanics", "AI & Compute", "Superconductors", "Material Science"].map(i => (
                    <span key={i} className="px-3 py-1.5 bg-gray-100 border border-gray-200 text-gray-700 rounded-lg text-sm cursor-pointer hover:bg-gray-200">
                      {i}
                    </span>
                  ))}
                </div>

                <button 
                  onClick={() => runTerminalSimulation("CITIZEN", { interests: ["Propulsion"] })}
                  className="w-full btn-primary py-3 flex items-center justify-center gap-2"
                >
                  Enter LABVEX <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* STEP 2B: SCIENTIST FORM */}
            {isWalletConnected && onboardStep === "SCIENTIST_FORM" && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                <button onClick={() => setOnboardStep("SELECT_PATH")} className="text-xs text-gray-500 hover:text-gray-900 mb-4 flex items-center gap-1">
                  ← Back
                </button>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Academic Verification</h2>
                <p className="text-sm text-gray-500 mb-6">We use ZK-proofs to verify your credentials without revealing your exact identity to the public.</p>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">ORCID ID</label>
                  <input 
                    type="text" 
                    value={orcidVal}
                    onChange={(e) => setOrcidVal(e.target.value)}
                    placeholder="0000-0000-0000-0000" 
                    className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 text-gray-950 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                  />
                </div>

                <button 
                  onClick={() => runTerminalSimulation("SCIENTIST", { orcid: orcidVal || "0000-0002-1825-0097" })}
                  className="w-full btn-primary py-3 flex items-center justify-center gap-2 bg-gray-900 hover:bg-black"
                >
                  Verify Credentials <ShieldCheck className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* STEP 2C: DEVELOPER FORM */}
            {isWalletConnected && onboardStep === "DEVELOPER_FORM" && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                <button onClick={() => setOnboardStep("SELECT_PATH")} className="text-xs text-gray-500 hover:text-gray-900 mb-4 flex items-center gap-1">
                  ← Back
                </button>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Developer Registration</h2>
                <p className="text-sm text-gray-500 mb-6">Link your GitHub profile and set your primary R&D stack.</p>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GitHub Username</label>
                    <input 
                      type="text" 
                      value={githubUser}
                      onChange={(e) => setGithubUser(e.target.value)}
                      placeholder="e.g. solana-hacker" 
                      className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 text-gray-950 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Primary Stack / Language</label>
                    <select 
                      value={primaryLang}
                      onChange={(e) => setPrimaryLang(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 text-gray-950 focus:outline-none focus:ring-2 focus:ring-purple-500/25"
                    >
                      <option value="Rust">Rust (Solana Contracts / AI Core)</option>
                      <option value="TypeScript">TypeScript (SDKs & Frontend)</option>
                      <option value="Python">Python (AI Agents & Telemetry Analysis)</option>
                    </select>
                  </div>
                </div>

                <button 
                  onClick={() => runTerminalSimulation("DEVELOPER", { github: githubUser || "solana-hacker", lang: primaryLang })}
                  className="w-full btn-primary py-3 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Register Developer Profile <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* STEP 2D: LABORATORY FORM */}
            {isWalletConnected && onboardStep === "LABORATORY_FORM" && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                <button onClick={() => setOnboardStep("SELECT_PATH")} className="text-xs text-gray-500 hover:text-gray-900 mb-4 flex items-center gap-1">
                  ← Back
                </button>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Laboratory Onboarding</h2>
                <p className="text-sm text-gray-500 mb-6">Register your testing facility to offer equipment and live telemetry streams.</p>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Facility / Institution Name</label>
                    <input 
                      type="text" 
                      value={facilityName}
                      onChange={(e) => setFacilityName(e.target.value)}
                      placeholder="e.g. Munich Quantum Physics Lab" 
                      className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 text-gray-955 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Verification / Equipment Type</label>
                    <input 
                      type="text" 
                      value={chamberModel}
                      onChange={(e) => setChamberModel(e.target.value)}
                      placeholder="e.g. Ultra-High Vacuum Chamber (10^-7 Torr)" 
                      className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 text-gray-955 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                <button 
                  onClick={() => runTerminalSimulation("LABORATORY", { facilityName: facilityName || "Munich Quantum Physics Lab", chamber: chamberModel })}
                  className="w-full btn-primary py-3 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Verify Lab Node <ShieldCheck className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* STEP 2E: COMPANY FORM */}
            {isWalletConnected && onboardStep === "COMPANY_FORM" && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                <button onClick={() => setOnboardStep("SELECT_PATH")} className="text-xs text-gray-500 hover:text-gray-900 mb-4 flex items-center gap-1">
                  ← Back
                </button>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Corporate Sponsor Setup</h2>
                <p className="text-sm text-gray-500 mb-6">Register your company to fund grants and license IP tokens.</p>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company / Sponsor Name</label>
                    <input 
                      type="text" 
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Aether Dynamics Corp" 
                      className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 text-gray-955 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Primary R&D Focus Area</label>
                    <input 
                      type="text" 
                      value={fundingFocus}
                      onChange={(e) => setFundingFocus(e.target.value)}
                      placeholder="e.g. Gravity Control & Asymmetric Capacitor Arrays" 
                      className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 text-gray-955 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>
                </div>

                <button 
                  onClick={() => runTerminalSimulation("COMPANY", { companyName: companyName || "Aether Dynamics Corp", focus: fundingFocus })}
                  className="w-full btn-primary py-3 flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white"
                >
                  Deploy Corporate Node <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* STEP 3: TERMINAL WOW EFFECT */}
            {isWalletConnected && onboardStep === "TERMINAL" && (
              <div className="bg-[#f0fdf4] border border-[#bbf7d0] p-6 rounded-xl font-mono min-h-[200px]">
                <div className="flex items-center gap-2 mb-4 text-green-700">
                  <Terminal className="w-5 h-5" />
                  <span className="text-sm font-bold">SYSTEM BOOT</span>
                </div>
                <div className="space-y-2 text-sm text-green-800">
                  {logs.map((log, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={idx === logs.length - 1 ? "font-bold" : ""}
                    >
                      {log}
                    </motion.div>
                  ))}
                  <span className="animate-pulse">_</span>
                </div>
              </div>
            )}

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
