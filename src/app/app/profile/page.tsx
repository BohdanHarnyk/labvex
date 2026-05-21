"use client";
 
import { useAuth } from "@/lib/auth/AuthContext";
import { 
  User, ShieldCheck, Upload, Timer, Award, Activity, 
  ScanFace, CheckCircle2, LockKeyhole, Edit3, Save, X, 
  Plus, Trash2, Globe, Sparkles 
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Twitter = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const Github = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
  </svg>
);
 
export default function ProfilePage() {
  const { 
    role, 
    orcid, 
    reputation, 
    profileData, 
    updateProfileData, 
    isAuthenticated, 
    openAuthModal 
  } = useAuth();
 
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
 
  // Editing state fields
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editTwitter, setEditTwitter] = useState("");
  const [editGithub, setEditGithub] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [portfolioItems, setPortfolioItems] = useState<{ title: string; url: string }[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
 
  // Sync values on entering edit mode
  useEffect(() => {
    if (profileData) {
      setEditName(profileData.name || "");
      setEditBio(profileData.bio || "");
      setEditTwitter(profileData.twitter || "");
      setEditGithub(profileData.github || "");
      setEditAvatar(profileData.avatar || "avatar1");
      setPortfolioItems(profileData.portfolio || []);
    }
  }, [profileData, isEditing]);
 
  if (!isAuthenticated) {
    return (
      <section className="flex flex-col items-center justify-center text-center py-20 px-6">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6 border border-gray-200">
          <LockKeyhole className="w-8 h-8 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Guest Access</h2>
        <p className="text-gray-600 max-w-md mb-8">
          Please sign in and establish your identity (Scientist, Dev, Laboratory, Sponsor, or Enthusiast) to view your profile and reputation.
        </p>
        <button
          onClick={openAuthModal}
          className="btn-primary px-8 py-3 shadow-md hover:shadow-lg transition-all text-sm font-semibold flex items-center gap-2"
        >
          <User className="w-4 h-4" /> Connect Identity / Wallet
        </button>
      </section>
    );
  }
 
  const isScientist = role === "VERIFIED_PHYSICIST" || role === "NOBEL_LAUREATE";
  const isLab = role === "LABORATORY";
  const isDev = role === "DEVELOPER";
  const isCompany = role === "COMPANY";
  const roleTitle = role.replace("_", " ");
 
  const handleUploadClick = () => {
    setIsScanning(true);
    setScanSuccess(false);
    setTimeout(() => {
      setIsScanning(false);
      setScanSuccess(true);
    }, 3000); // 3 sec Vexy scan
  };
 
  const handleSaveProfile = () => {
    updateProfileData({
      name: editName,
      bio: editBio,
      twitter: editTwitter,
      github: editGithub,
      avatar: editAvatar,
      portfolio: portfolioItems
    });
    setIsEditing(false);
  };
 
  const handleAddPortfolio = () => {
    if (!newTitle.trim() || !newUrl.trim()) return;
    setPortfolioItems(prev => [...prev, { title: newTitle, url: newUrl }]);
    setNewTitle("");
    setNewUrl("");
  };
 
  const handleRemovePortfolio = (index: number) => {
    setPortfolioItems(prev => prev.filter((_, i) => i !== index));
  };
 
  const renderAvatar = (avatarName: string) => {
    switch (avatarName) {
      case "avatar1": return <div className="w-full h-full bg-green-500 rounded-full flex items-center justify-center text-white text-4xl shadow-md border-2 border-white select-none">🔬</div>;
      case "avatar2": return <div className="w-full h-full bg-blue-500 rounded-full flex items-center justify-center text-white text-4xl shadow-md border-2 border-white select-none">🌌</div>;
      case "avatar3": return <div className="w-full h-full bg-yellow-500 rounded-full flex items-center justify-center text-white text-4xl shadow-md border-2 border-white select-none">🎓</div>;
      case "avatar4": return <div className="w-full h-full bg-purple-500 rounded-full flex items-center justify-center text-white text-4xl shadow-md border-2 border-white select-none">💻</div>;
      case "avatar5": return <div className="w-full h-full bg-indigo-500 rounded-full flex items-center justify-center text-white text-4xl shadow-md border-2 border-white select-none">🧪</div>;
      case "avatar6": return <div className="w-full h-full bg-amber-500 rounded-full flex items-center justify-center text-white text-4xl shadow-md border-2 border-white select-none">🏢</div>;
      default: return <div className="w-full h-full bg-gray-500 rounded-full flex items-center justify-center text-white text-4xl shadow-md border-2 border-white select-none">👤</div>;
    }
  };
 
  const getReputationSpecializations = () => {
    if (isDev) {
      return [
        { label: "Smart Contracts", val: "1.2k", pct: "75", color: "#8b5cf6", level: "Level 6" },
        { label: "AI Agents", val: "800", pct: "60", color: "#a78bfa", level: "Level 5" },
        { label: "Web3 SDKs", val: "150", pct: "25", color: "#c4b5fd", level: "Level 2" }
      ];
    } else if (isLab) {
      return [
        { label: "Cleanrooms", val: "1.5k", pct: "85", color: "#6366f1", level: "Level 7" },
        { label: "Vacuum Systems", val: "1.1k", pct: "70", color: "#818cf8", level: "Level 6" },
        { label: "Telemetry Feeds", val: "500", pct: "45", color: "#a5b4fc", level: "Level 4" }
      ];
    } else if (isCompany) {
      return [
        { label: "R&D Grants", val: "2k", pct: "90", color: "#f59e0b", level: "Level 8" },
        { label: "R&D Investments", val: "900", pct: "65", color: "#fbbf24", level: "Level 5" },
        { label: "IP Tokens", val: "100", pct: "15", color: "#fde68a", level: "Level 1" }
      ];
    } else if (isScientist) {
      return [
        { label: "Propulsion", val: "1.8k", pct: "85", color: "#10b981", level: "Level 8" },
        { label: "Quantum", val: "650", pct: "50", color: "#3b82f6", level: "Level 4" },
        { label: "Data Science", val: "50", pct: "10", color: "#8b5cf6", level: "Level 1" }
      ];
    } else {
      return [
        { label: "Data Filtering", val: "700", pct: "55", color: "#3b82f6", level: "Level 5" },
        { label: "Data Annotation", val: "350", pct: "35", color: "#60a5fa", level: "Level 3" },
        { label: "Moderation", val: "150", pct: "20", color: "#93c5fd", level: "Level 2" }
      ];
    }
  };
 
  const specData = getReputationSpecializations();
 
  return (
    <section className="space-y-8">
      
      {/* Header Profile Card */}
      <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-50/50 rounded-full blur-3xl -z-10 -mt-20 -mr-20" />
        
        <div className="relative shrink-0">
          <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden flex items-center justify-center">
            {renderAvatar(profileData.avatar)}
          </div>
          {(isScientist || isLab) && (
            <div className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-md border border-gray-100">
              <ShieldCheck className="w-5 h-5 text-green-500 animate-pulse" />
            </div>
          )}
        </div>
 
        <div className="flex-1 text-center md:text-left min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-center md:justify-start">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight truncate">
              {profileData.name || "Anonymous Researcher"}
            </h1>
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-green-600 transition-colors self-center bg-gray-50 hover:bg-green-50 border border-gray-200 hover:border-green-200 px-3 py-1 rounded-full shadow-sm"
            >
              {isEditing ? <><X className="w-3 h-3" /> Cancel</> : <><Edit3 className="w-3 h-3" /> Edit Profile</>}
            </button>
          </div>
 
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-3 mb-4">
            <span className="px-3 py-1 bg-gray-900 text-white text-xs font-bold uppercase tracking-wider rounded-md">
              {roleTitle}
            </span>
            {isScientist && orcid && (
              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-md font-mono border border-gray-200">
                ORCID: {orcid}
              </span>
            )}
          </div>
 
          <p className="text-sm text-gray-600 max-w-lg mx-auto md:mx-0 leading-relaxed font-medium">
            {profileData.bio || "No biography provided yet. Tell the Sovereign Science Network about your research focus."}
          </p>
 
          {/* Social Links */}
          <div className="flex items-center justify-center md:justify-start gap-3 mt-4">
            {profileData.twitter && (
              <a 
                href={profileData.twitter.startsWith("http") ? profileData.twitter : `https://${profileData.twitter}`} 
                target="_blank" 
                rel="noreferrer"
                className="text-gray-400 hover:text-blue-500 transition-colors"
                title="Twitter Profile"
              >
                <Twitter className="w-5 h-5" />
              </a>
            )}
            {profileData.github && (
              <a 
                href={profileData.github.startsWith("http") ? profileData.github : `https://${profileData.github}`} 
                target="_blank" 
                rel="noreferrer"
                className="text-gray-400 hover:text-purple-500 transition-colors"
                title="GitHub Profile"
              >
                <Github className="w-5 h-5" />
              </a>
            )}
            {!profileData.twitter && !profileData.github && (
              <span className="text-xs text-gray-400 italic">No social links configured</span>
            )}
          </div>
        </div>
 
        {/* Global REP Score */}
        <div className="text-center md:text-right shrink-0">
          <div className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-1">Global REP</div>
          <div className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-400 drop-shadow-sm font-mono">
            {reputation.toLocaleString()}
          </div>
          <div className="text-xs text-green-600 font-bold mt-1.5 flex items-center justify-center md:justify-end gap-1">
            <Activity className="w-3.5 h-3.5 animate-pulse" /> R&D Contributor
          </div>
        </div>
      </div>
 
      {/* Dynamic Edit Profile Settings Section */}
      <AnimatePresence>
        {isEditing && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-md space-y-6">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-green-500 animate-spin" style={{ animationDuration: '4s' }} />
                Profile Settings
              </h2>
 
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Col: Basics */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Display Name</label>
                    <input 
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 focus:outline-none"
                    />
                  </div>
 
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Biography (Bio)</label>
                    <textarea 
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      rows={3}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 focus:outline-none resize-none"
                    />
                  </div>
 
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Select Avatar Preset</label>
                    <div className="grid grid-cols-6 gap-2">
                      {["avatar1", "avatar2", "avatar3", "avatar4", "avatar5", "avatar6"].map(preset => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setEditAvatar(preset)}
                          className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center text-xl ${editAvatar === preset ? "border-green-500 scale-110 shadow-sm" : "border-transparent bg-gray-50 hover:bg-gray-100"}`}
                        >
                          {preset === "avatar1" && "🔬"}
                          {preset === "avatar2" && "🌌"}
                          {preset === "avatar3" && "🎓"}
                          {preset === "avatar4" && "💻"}
                          {preset === "avatar5" && "🧪"}
                          {preset === "avatar6" && "🏢"}
                        </button>
                      ))}
                    </div>
                  </div>
 
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Twitter Link</label>
                      <input 
                        type="text"
                        value={editTwitter}
                        onChange={(e) => setEditTwitter(e.target.value)}
                        placeholder="twitter.com/profile"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-xs text-gray-900 focus:ring-2 focus:ring-green-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">GitHub Link</label>
                      <input 
                        type="text"
                        value={editGithub}
                        onChange={(e) => setEditGithub(e.target.value)}
                        placeholder="github.com/user"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-xs text-gray-900 focus:ring-2 focus:ring-green-500/20"
                      />
                    </div>
                  </div>
                </div>
 
                {/* Right Col: Portfolio list */}
                <div className="space-y-4 flex flex-col justify-between">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">R&D Publications / Portfolio links</label>
                    <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                      {portfolioItems.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-gray-50 border border-gray-150 p-2 rounded-xl text-xs">
                          <span className="font-semibold text-gray-800 truncate mr-2" title={item.title}>{item.title}</span>
                          <button 
                            type="button"
                            onClick={() => handleRemovePortfolio(idx)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      {portfolioItems.length === 0 && (
                        <span className="text-xs text-gray-400 italic block py-2">No portfolio publications listed.</span>
                      )}
                    </div>
                  </div>
 
                  <div className="space-y-2 border-t border-gray-100 pt-3">
                    <div className="text-[10px] font-bold text-gray-400 uppercase">Add Publication link</div>
                    <div className="grid grid-cols-2 gap-2">
                      <input 
                        type="text" 
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="Title (e.g. EM Drive paper)" 
                        className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs text-gray-900 focus:ring-1 focus:ring-green-500"
                      />
                      <input 
                        type="text" 
                        value={newUrl}
                        onChange={(e) => setNewUrl(e.target.value)}
                        placeholder="URL Link (https://...)" 
                        className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs text-gray-900 focus:ring-1 focus:ring-green-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddPortfolio}
                      className="w-full flex items-center justify-center gap-1 bg-gray-950 text-white hover:bg-black rounded-lg py-1.5 text-xs font-bold transition-all shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add to Portfolio
                    </button>
                  </div>
                </div>
              </div>
 
              <div className="border-t border-gray-100 pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsEditing(false)}
                  className="btn-secondary px-5 py-2 text-xs"
                >
                  Discard
                </button>
                <button 
                  type="button" 
                  onClick={handleSaveProfile}
                  className="btn-primary px-5 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" /> Save changes
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
 
      {/* 2-Column Grid for Metrics & Verification */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Reputation Engine */}
        <div className="lg:col-span-2 space-y-6">
          {/* Decay Timer */}
          <div className="bg-red-50 border border-red-100 rounded-2xl p-6 flex items-center justify-between shadow-sm">
            <div>
              <h3 className="font-bold text-red-900 flex items-center gap-2">
                <Timer className="w-5 h-5 text-red-500" />
                Reputation Decay Countdown
              </h3>
              <p className="text-xs text-red-700 mt-1">Publish research or complete a mission to reset the timer.</p>
            </div>
            <div className="text-right font-mono">
              <div className="text-2xl font-bold text-red-600">14d : 02h : 15m</div>
              <div className="text-[10px] uppercase font-bold text-red-400 tracking-wider">-10% Penalty imminent</div>
            </div>
          </div>
 
          {/* Categories Grid */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-6">Reputation by Specialization ({roleTitle})</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {specData.map((spec, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="relative w-24 h-24 flex items-center justify-center mb-3">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="#f3f4f6" strokeWidth="8" />
                      <circle 
                        cx="50" 
                        cy="50" 
                        r="45" 
                        fill="none" 
                        stroke={spec.color} 
                        strokeWidth="8" 
                        strokeDasharray="283" 
                        strokeDashoffset={283 - (283 * parseFloat(spec.pct)) / 100} 
                        strokeLinecap="round" 
                      />
                    </svg>
                    <div className="absolute text-base font-bold text-gray-900 font-mono">{spec.val}</div>
                  </div>
                  <div className="text-xs font-bold text-gray-700 text-center">{spec.label}</div>
                  <div className="text-[10px] font-extrabold uppercase mt-1" style={{ color: spec.color }}>{spec.level}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
 
        {/* Right Col: Identity & Badges */}
        <div className="space-y-6">
          {/* Identity Upload / ZK Verification */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Identity & ZK-Proofs</h3>
            
            {!scanSuccess && !isLab && !isScientist ? (
              <div 
                className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 hover:border-green-400 transition-colors cursor-pointer relative overflow-hidden"
                onClick={handleUploadClick}
              >
                <AnimatePresence>
                  {isScanning && (
                    <motion.div 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      className="absolute inset-0 bg-white/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center animate-fade-in"
                    >
                      <ScanFace className="w-8 h-8 text-green-500 mb-2 animate-pulse" />
                      <div className="text-xs font-bold text-gray-900 mb-1">Vexy AI Scanning...</div>
                      <div className="text-[10px] text-gray-500 font-mono">Verifying university seals</div>
                      <div className="w-full absolute left-0 h-0.5 bg-green-500/50 shadow-[0_0_8px_rgba(34,197,94,1)]" style={{ animation: 'scan 2s ease-in-out infinite alternate', top: '0' }} />
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <Upload className="w-6 h-6 text-gray-400 mb-2" />
                <p className="text-xs font-medium text-gray-700 mb-1">Upload Diploma/Certificate</p>
                <p className="text-[10px] text-gray-500">Encrypted via Zero-Knowledge</p>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 flex flex-col items-center justify-center text-center">
                <CheckCircle2 className="w-8 h-8 text-green-500 mb-2 animate-bounce" />
                <p className="text-sm font-bold text-green-900">{isLab ? "Lab Node Certified" : isScientist ? "PhD Scientist Verified" : "Identity Verified"}</p>
                <p className="text-xs text-green-700">ZK-Credential is active on-chain.</p>
              </div>
            )}
          </div>
 
          {/* Badges (SBTs) */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Soulbound Tokens (SBT)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-amber-100 to-amber-50 border border-amber-200 p-4 rounded-xl flex flex-col items-center text-center shadow-sm hover:-translate-y-1 transition-transform">
                <Award className="w-8 h-8 text-amber-500 mb-2 drop-shadow-sm" />
                <div className="text-[10px] font-bold text-gray-900">Early Pioneer</div>
              </div>
              <div className="bg-gradient-to-br from-blue-100 to-blue-50 border border-blue-200 p-4 rounded-xl flex flex-col items-center text-center shadow-sm hover:-translate-y-1 transition-transform">
                <Activity className="w-8 h-8 text-blue-500 mb-2 drop-shadow-sm" />
                <div className="text-[10px] font-bold text-gray-900">Gravity Pioneer</div>
              </div>
            </div>
          </div>
        </div>
 
      </div>
 
      {/* Portfolio Links (Display Panel) */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5 text-gray-500" />
          R&D Portfolio Publications
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profileData.portfolio && profileData.portfolio.map((item, idx) => (
            <a 
              key={idx}
              href={item.url.startsWith("http") ? item.url : `https://${item.url}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-2xl hover:bg-green-50/30 hover:border-green-300 transition-all group"
            >
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-gray-800 group-hover:text-green-700 truncate">{item.title}</h4>
                <p className="text-[10px] text-gray-400 font-mono truncate mt-0.5">{item.url}</p>
              </div>
              <Plus className="w-4 h-4 text-gray-400 group-hover:text-green-500 rotate-45 shrink-0" />
            </a>
          ))}
          {(!profileData.portfolio || profileData.portfolio.length === 0) && (
            <div className="col-span-2 py-6 text-center text-xs text-gray-400 italic">
              No publications added to the portfolio. Click &quot;Edit Profile&quot; to list your papers.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
