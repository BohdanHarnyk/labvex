"use client";

import { useAuth } from "@/lib/auth/AuthContext";
import { CheckCircle2, ShieldAlert, Sparkles, MessageSquare, Trash2, Lock, Coins } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CommentProps {
  author: string;
  role: string;
  text: string;
  timestamp: string;
  upvotes: number;
}

const Comment = ({ author, role, text, timestamp, upvotes }: CommentProps) => {
  const isPhysicist = role === "VERIFIED_PHYSICIST";
  const isNobel = role === "NOBEL_LAUREATE";

  return (
    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-gray-900">{author}</span>
          {isNobel ? (
            <span className="badge-gold flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Laureate
            </span>
          ) : isPhysicist ? (
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Verified
            </span>
          ) : (
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full font-semibold">
              Explorer
            </span>
          )}
        </div>
        <span className="text-xs text-gray-400">{timestamp}</span>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed">{text}</p>
      <div className="mt-2 flex items-center gap-4 text-xs font-medium text-gray-500">
        <button className="hover:text-green-600 flex items-center gap-1 transition-colors">
          <span>▲</span> {upvotes}
        </button>
      </div>
    </div>
  );
};

export function PostCard({ title, content, author, authorRole = "VERIFIED_PHYSICIST", txHash, children }: any) {
  const [showComments, setShowComments] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const { isAdmin, isAuthenticated, openAuthModal } = useAuth();

  const [tipModalOpen, setTipModalOpen] = useState(false);
  const [tipCurrency, setTipCurrency] = useState<"SOL" | "LVEX">("LVEX");
  const [tipAmount, setTipAmount] = useState("20");
  const [tipTxState, setTipTxState] = useState<"IDLE" | "SIGNING" | "SUCCESS">("IDLE");

  const handleSummarize = () => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    setIsSummarizing(true);
    setTimeout(() => setIsSummarizing(false), 500);
  };

  const handleInteract = () => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    setShowComments(!showComments);
  };

  const handleTipClick = () => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    setTipModalOpen(true);
  };

  const handleSendTip = () => {
    if (!tipAmount || parseFloat(tipAmount) <= 0) return;
    setTipTxState("SIGNING");
    setTimeout(() => {
      setTipTxState("SUCCESS");
    }, 500);
  };

  const displayContent = isAuthenticated ? content : content.slice(0, 150) + "...";

  const getBadgeColorsAndText = (roleStr: string) => {
    switch (roleStr) {
      case "VERIFIED_PHYSICIST":
        return { bg: "bg-green-100 text-green-700 border-green-200", text: "Verified Physicist", colorClass: "bg-green-50 text-green-600" };
      case "NOBEL_LAUREATE":
        return { bg: "bg-amber-100 text-amber-800 border-amber-300", text: "Laureate", colorClass: "bg-amber-50 text-amber-600" };
      case "DEVELOPER":
        return { bg: "bg-purple-100 text-purple-700 border-purple-200", text: "Developer", colorClass: "bg-purple-50 text-purple-600" };
      case "LABORATORY":
        return { bg: "bg-indigo-100 text-indigo-700 border-indigo-200", text: "Laboratory", colorClass: "bg-indigo-50 text-indigo-600" };
      case "COMPANY":
        return { bg: "bg-yellow-100 text-yellow-800 border-yellow-300", text: "Sponsor", colorClass: "bg-yellow-50 text-yellow-600" };
      case "CITIZEN_EXPLORER":
        return { bg: "bg-blue-100 text-blue-700 border-blue-200", text: "Explorer", colorClass: "bg-blue-50 text-blue-600" };
      default:
        return { bg: "bg-gray-100 text-gray-600 border-gray-200", text: "Guest", colorClass: "bg-gray-50 text-gray-500" };
    }
  };

  const badge = getBadgeColorsAndText(authorRole);

  return (
    <div className="card-soft p-6 mb-6 relative overflow-hidden">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${badge.colorClass} rounded-full flex items-center justify-center font-bold text-lg`}>
            {author.charAt(0)}
          </div>
          <div>
            <div className="font-medium text-gray-900 flex items-center gap-2">
              {author}
              <span className={`text-[10px] ${badge.bg} px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold uppercase tracking-wide border`}>
                <CheckCircle2 className="w-3 h-3" /> {badge.text}
              </span>
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
              <span>2 hours ago</span>
              <span>•</span>
              <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-mono text-[10px]" title="Solana Transaction Hash">
                Prior Art: {txHash}
              </span>
            </div>
          </div>
        </div>
        
        {isAdmin && (
          <button className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors" title="Delete Post (Admin)">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
      
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      
      <div className="relative mb-6">
        <p className={`text-gray-700 leading-relaxed text-sm ${!isAuthenticated ? 'blur-[1px] select-none opacity-80' : ''}`}>
          {displayContent}
        </p>
        {!isAuthenticated && (
          <div className="absolute inset-0 flex items-end justify-center pb-2 bg-gradient-to-t from-white via-white/80 to-transparent">
            <button 
              onClick={openAuthModal}
              className="flex items-center gap-2 text-xs font-bold text-green-600 bg-green-50 px-4 py-2 rounded-full border border-green-200 shadow-sm hover:bg-green-100 transition-colors cursor-pointer"
            >
              <Lock className="w-3 h-3" /> Read Full Publication
            </button>
          </div>
        )}
      </div>
      
      <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
        <button 
          onClick={handleInteract}
          className="btn-secondary px-4 py-2 text-xs flex items-center gap-2"
        >
          <MessageSquare className="w-4 h-4" />
          Discuss (3)
        </button>
        <button 
          onClick={isAuthenticated ? handleSummarize : handleInteract}
          className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Summarize with AI
          {isSummarizing && <span className="animate-pulse">...</span>}
        </button>
        <button 
          onClick={handleTipClick}
          className="bg-green-50 text-green-700 hover:bg-green-100 px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 border border-green-200/50"
        >
          <Coins className="w-4 h-4 text-green-600" />
          Tip Author
        </button>
      </div>

      {/* Tipping Modal */}
      <AnimatePresence>
        {tipModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 relative overflow-hidden"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                  <Coins className="w-5 h-5 text-green-600" />
                  Tip {author}
                </h3>
                <button 
                  onClick={() => { setTipModalOpen(false); setTipTxState("IDLE"); }} 
                  className="text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                >
                  ✕
                </button>
              </div>

              {tipTxState === "IDLE" && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Select Currency</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => { setTipCurrency("LVEX"); setTipAmount("20"); }}
                        className={`py-2 text-sm font-bold border rounded-xl transition-colors ${tipCurrency === 'LVEX' ? 'bg-green-600 text-white border-green-600 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
                      >
                        LVEX (Tips)
                      </button>
                      <button
                        onClick={() => { setTipCurrency("SOL"); setTipAmount("0.05"); }}
                        className={`py-2 text-sm font-bold border rounded-xl transition-colors ${tipCurrency === 'SOL' ? 'bg-green-600 text-white border-green-600 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
                      >
                        SOL (Solana)
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tip Amount</label>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {tipCurrency === "LVEX" ? (
                        [10, 50, 100].map(val => (
                          <button
                            key={val}
                            onClick={() => setTipAmount(val.toString())}
                            className={`py-1.5 text-xs font-semibold rounded-lg border transition-colors ${tipAmount === val.toString() ? 'bg-gray-900 text-white border-gray-900' : 'bg-gray-55/10 text-gray-600 border-gray-200 hover:border-gray-300'}`}
                          >
                            {val} LVEX
                          </button>
                        ))
                      ) : (
                        [0.01, 0.05, 0.2].map(val => (
                          <button
                            key={val}
                            onClick={() => setTipAmount(val.toString())}
                            className={`py-1.5 text-xs font-semibold rounded-lg border transition-colors ${tipAmount === val.toString() ? 'bg-gray-900 text-white border-gray-900' : 'bg-gray-55/10 text-gray-600 border-gray-200 hover:border-gray-300'}`}
                          >
                            {val} SOL
                          </button>
                        ))
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        step={tipCurrency === "SOL" ? "0.01" : "1"}
                        value={tipAmount}
                        onChange={(e) => setTipAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-base font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                      />
                      <div className="absolute right-4 top-2.5 text-gray-400 font-bold text-sm">{tipCurrency}</div>
                    </div>
                  </div>

                  <button
                    disabled={!tipAmount || parseFloat(tipAmount) <= 0}
                    onClick={handleSendTip}
                    className="w-full btn-primary py-3 flex items-center justify-center gap-2 text-sm font-semibold shadow-md hover:shadow-lg transition-all"
                  >
                    Send Tip
                  </button>
                </div>
              )}

              {tipTxState === "SIGNING" && (
                <div className="py-12 text-center space-y-4">
                  <div className="w-12 h-12 border-4 border-gray-200 border-t-green-500 rounded-full animate-spin mx-auto"></div>
                  <h4 className="font-bold text-gray-900 text-base">Signing Micro-Transaction...</h4>
                  <p className="text-xs text-gray-500 font-mono">Simulating Solana network confirmation</p>
                </div>
              )}

              {tipTxState === "SUCCESS" && (
                <div className="space-y-6 text-center animate-in zoom-in duration-300 py-4">
                  <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">Tip Dispatched!</h4>
                    <p className="text-xs text-gray-500 mt-2">
                      You tipped <span className="font-bold text-gray-900">{tipAmount} {tipCurrency}</span> to {author}.
                    </p>
                  </div>
                  <button
                    onClick={() => { setTipModalOpen(false); setTipTxState("IDLE"); }}
                    className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs rounded-xl transition-all shadow"
                  >
                    Awesome
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSummarizing && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
              <div className="flex items-center gap-2 mb-2 text-blue-700 font-semibold text-xs uppercase tracking-wide">
                <Sparkles className="w-3 h-3" />
                AI Analysis
              </div>
              <p className="text-sm text-blue-900 leading-relaxed">
                Author observed asymmetric thrust in high vacuum, ruling out simple ion wind as the sole cause. Implications: potential novel propulsion mechanism or unidentified systematic error. Confidence level: 78%.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showComments && isAuthenticated && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-6 space-y-4 pt-4 border-t border-gray-100">
              <Comment 
                author="Alex Explorer" 
                role="CITIZEN_EXPLORER" 
                text="I can run this data through my python script if you upload the raw CSV. What was the exact vacuum pressure?" 
                timestamp="1h ago" 
                upvotes={4} 
              />
              <Comment 
                author="Dr. E. Witten" 
                role="NOBEL_LAUREATE" 
                text="The string-theoretic implications of a non-Newtonian thrust vector at 10^-6 Torr are non-trivial. I suggest shielding the dielectric to eliminate corona discharge completely." 
                timestamp="45m ago" 
                upvotes={142} 
              />
              <Comment 
                author="Dr. S. Cooper" 
                role="VERIFIED_PHYSICIST" 
                text="Did you account for thermal expansion of the capacitor plates? The strain gauge might be picking up mechanical deformation." 
                timestamp="10m ago" 
                upvotes={28} 
              />
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
