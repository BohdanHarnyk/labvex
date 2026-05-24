"use client";

import { useAuth } from "@/lib/auth/AuthContext";
import { CheckCircle2, ShieldAlert, Sparkles, MessageSquare, Trash2, Lock, Coins, AlertOctagon } from "lucide-react";
import { useState, useEffect } from "react";
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

export function PostCard({ 
  id,
  title, 
  content, 
  author, 
  authorRole = "VERIFIED_PHYSICIST", 
  authorReputation = 1200,
  txHash, 
  category, 
  tags = [], 
  upvotes = 0,
  casFlag = false,
  aiSummary = null,
  rewardAmount = null,
  rewardType = null,
  createdAt,
  onTagClick, 
  onCategoryClick, 
  onDelete, 
  children 
}: any) {
  const [showComments, setShowComments] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const { isAdmin, isAuthenticated, openAuthModal, profileData, role: userRole } = useAuth();

  const [votesCount, setVotesCount] = useState(upvotes);
  const [hasVoted, setHasVoted] = useState(false);
  const [aiSummaryState, setAiSummaryState] = useState<string | null>(aiSummary);

  const [tipModalOpen, setTipModalOpen] = useState(false);
  const [tipCurrency, setTipCurrency] = useState<"SOL" | "LVEX">("LVEX");
  const [tipAmount, setTipAmount] = useState("20");
  const [tipTxState, setTipTxState] = useState<"IDLE" | "SIGNING" | "SUCCESS">("IDLE");

  const [volunteerModalOpen, setVolunteerModalOpen] = useState(false);
  const [volExperience, setVolExperience] = useState("");
  const [volAvailability, setVolAvailability] = useState("");
  const [volContacts, setVolContacts] = useState("");
  const [volTxState, setVolTxState] = useState<"IDLE" | "SENDING" | "SUCCESS">("IDLE");
  const [volunteers, setVolunteers] = useState([
    { username: "john_explorer", role: "Citizen Explorer", experience: "2 роки тестування IoT сенсорів. Доступний 10 год/тиждень.", contacts: "john@gmail.com", status: "PENDING" },
    { username: "dr_mary", role: "Researcher", experience: "Біохімічний бекграунд. Маю домашню лабораторію.", contacts: "mary_bio@labvex.io", status: "ACCEPTED" }
  ]);

  // Keep upvotes count in sync with props
  useEffect(() => {
    setVotesCount(upvotes);
  }, [upvotes]);

  const handleVote = async () => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    try {
      const res = await fetch(`/api/posts/${id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voteType: "up" }),
      });
      if (res.ok) {
        const data = await res.json();
        setVotesCount(data.upvotes);
        setHasVoted(!hasVoted);
      }
    } catch (e) {
      console.error("Failed to vote:", e);
    }
  };

  const handleSummarize = async () => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    
    // Toggle off if already summarized
    if (aiSummaryState && isSummarizing) {
      setIsSummarizing(false);
      return;
    }

    if (aiSummaryState) {
      setIsSummarizing(true);
      return;
    }

    setIsSummarizing(true);
    setAiSummaryState("");

    try {
      const res = await fetch("/api/vexy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Summarize the following scientific publication briefly. Title: "${title}". Content: "${content}".`,
            },
          ],
          context: { type: "post", id },
        }),
      });

      if (!res.ok) throw new Error("AI request failed");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let resultText = "";

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");
        
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.slice(6).trim();
            if (dataStr === "[DONE]") break;
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.text) {
                resultText += parsed.text;
                setAiSummaryState(resultText);
              }
            } catch (e) {}
          }
        }
      }
    } catch (e) {
      console.error("AI summarization failed:", e);
      setAiSummaryState("Не вдалося завантажити AI-резюме. Спробуйте пізніше.");
    }
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

  const handleVolunteerClick = () => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    setVolunteerModalOpen(true);
  };

  const handleSendVolunteerApplication = () => {
    if (!volExperience || !volContacts) return;
    setVolTxState("SENDING");
    setTimeout(() => {
      setVolunteers(prev => [
        ...prev,
        {
          username: profileData?.name || "me_explorer",
          role: userRole || "Citizen Explorer",
          experience: `${volExperience}. Available: ${volAvailability || "Flexible"}`,
          contacts: volContacts,
          status: "PENDING"
        }
      ]);
      setVolTxState("SUCCESS");
    }, 1000);
  };

  const handleAcceptVolunteer = (username: string) => {
    setVolunteers(prev => prev.map(v => v.username === username ? { ...v, status: "ACCEPTED" } : v));
    alert(`Заявку від @${username} прийнято. Ініційовано смарт-контракт утримання нагороди.`);
  };

  const handleReleaseReward = (username: string) => {
    setVolunteers(prev => prev.map(v => v.username === username ? { ...v, status: "COMPLETED" } : v));
    alert(`Винагороду успішно перераховано для @${username}! Транзакцію записано в Solana.`);
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
        return { bg: "bg-gray-100 text-gray-600 border-gray-200", text: "Researcher", colorClass: "bg-gray-50 text-gray-500" };
    }
  };

  const badge = getBadgeColorsAndText(authorRole);

  // Format date display
  const dateDisplay = createdAt 
    ? new Date(createdAt).toLocaleDateString("uk-UA", { hour: "2-digit", minute: "2-digit" })
    : "щойно";

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
              <span className="text-[10px] font-bold bg-green-50 text-green-700 border border-green-200/50 px-1.5 py-0.2 rounded">
                {authorReputation.toLocaleString()} rep
              </span>
              {rewardAmount && (
                <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/50 px-1.5 py-0.2 rounded">
                  🎁 Reward: {rewardAmount} {rewardType}
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500 flex flex-wrap items-center gap-2 mt-0.5">
              <span>{dateDisplay}</span>
              <span>•</span>
              {category && (
                <>
                  <button 
                    onClick={() => onCategoryClick?.(category)}
                    className="hover:text-green-600 font-semibold cursor-pointer text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-100 transition-colors"
                  >
                    {category}
                  </button>
                  <span>•</span>
                </>
              )}
              {txHash && (
                <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-mono text-[10px]" title="Solana Transaction Hash">
                  Prior Art: {txHash}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {isAdmin && (
          <button 
            onClick={onDelete}
            className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors cursor-pointer" 
            title="Delete Post (Admin)"
          >
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

      {/* CAS Screening Warning Badge (Symbiosis Feature) */}
      {casFlag && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertOctagon className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm text-amber-900">Compliance Filter: CAS Screening Active</h4>
            <p className="text-xs text-amber-700 leading-relaxed mt-0.5">
              Ця публікація посилається на незареєстровані або потенційно небезпечні хімічні сполуки чи біологічні матеріали. Дані не верифіковані WHO/FDA. Будьте обережні.
            </p>
          </div>
        </div>
      )}
      
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-6">
          {tags.map((tag: string) => (
            <button
              key={tag}
              onClick={() => onTagClick?.(tag)}
              className="text-[10px] font-bold text-gray-500 hover:text-green-600 bg-gray-50 hover:bg-green-50 px-2.5 py-1 rounded-lg border border-gray-100 hover:border-green-200/40 transition-colors cursor-pointer"
            >
              #{tag}
            </button>
          ))}
        </div>
      )}
      
      <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
        <button 
          onClick={handleVote}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
            hasVoted 
              ? "bg-green-600 text-white hover:bg-green-700" 
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <span>▲</span> Upvote ({votesCount})
        </button>
        <button 
          onClick={handleInteract}
          className="btn-secondary px-4 py-2 text-xs flex items-center gap-2"
        >
          <MessageSquare className="w-4 h-4" />
          Discuss (3)
        </button>
        <button 
          onClick={handleSummarize}
          className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-blue-500" />
          {aiSummaryState ? (isSummarizing ? "Hide AI Summary" : "AI Summary") : "Summarize with AI"}
        </button>
        <button 
          onClick={handleTipClick}
          className="bg-green-50 text-green-700 hover:bg-green-100 px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 border border-green-200/50 cursor-pointer"
        >
          <Coins className="w-4 h-4 text-green-600" />
          Tip Author
        </button>
        {category === "Volunteer Trials" && (
          <button 
            onClick={handleVolunteerClick}
            className="bg-purple-50 text-purple-700 hover:bg-purple-100 px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 border border-purple-200/50 cursor-pointer"
          >
            Apply as Volunteer
          </button>
        )}
      </div>

      {/* Vexy AI Summary Expandable Box (Symbiosis Feature) */}
      <AnimatePresence>
        {isSummarizing && aiSummaryState !== null && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 p-4 bg-blue-50/50 border border-blue-100/50 rounded-xl relative">
              <div className="absolute top-4 right-4 w-4 h-4 flex items-center justify-center">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping" />
              </div>
              <div className="flex items-center gap-2 mb-2 text-blue-700 font-semibold text-xs uppercase tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                VEXY AI Summary
              </div>
              <p className="text-sm text-blue-900 leading-relaxed font-medium">
                {aiSummaryState || "Аналіз публікації... Стрімінг результатів від VEXY AI..."}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
 
      {/* Volunteer Application Modal */}
      <AnimatePresence>
        {volunteerModalOpen && (
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
              className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 relative overflow-hidden"
            >
              <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-3">
                <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  Apply as Volunteer
                </h3>
                <button 
                  onClick={() => { setVolunteerModalOpen(false); setVolTxState("IDLE"); setVolExperience(""); setVolAvailability(""); setVolContacts(""); }} 
                  className="text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {volTxState === "IDLE" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Ваш досвід / навички</label>
                    <textarea
                      value={volExperience}
                      onChange={(e) => setVolExperience(e.target.value)}
                      placeholder="Опишіть ваш бекграунд, вміння працювати з обладнанням чи досвід в аналогічних дослідах..."
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 resize-none"
                      rows={3}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Вільний час (годин/тиждень)</label>
                    <input
                      type="text"
                      value={volAvailability}
                      onChange={(e) => setVolAvailability(e.target.value)}
                      placeholder="e.g. 10 годин на тиждень, гнучкий графік"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Контактні дані</label>
                    <input
                      type="text"
                      value={volContacts}
                      onChange={(e) => setVolContacts(e.target.value)}
                      placeholder="e.g. Telegram: @username, Email: ..."
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                      required
                    />
                  </div>

                  <button
                    disabled={!volExperience || !volContacts}
                    onClick={handleSendVolunteerApplication}
                    className="w-full py-3 flex items-center justify-center gap-2 text-sm font-semibold shadow hover:shadow-md transition-all bg-purple-600 text-white rounded-xl mt-4 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Подати заявку
                  </button>
                </div>
              )}

              {volTxState === "SENDING" && (
                <div className="py-12 text-center space-y-4">
                  <div className="w-12 h-12 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
                  <h4 className="font-bold text-gray-900 text-base">Реєстрація заявки у блокчейні...</h4>
                  <p className="text-xs text-gray-500 font-mono">Matching volunteer parameters with trial profile</p>
                </div>
              )}

              {volTxState === "SUCCESS" && (
                <div className="space-y-6 text-center animate-in zoom-in duration-300 py-4">
                  <CheckCircle2 className="w-16 h-16 text-purple-600 mx-auto" />
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">Заявку успішно надіслано!</h4>
                    <p className="text-xs text-gray-500 mt-2">
                      Ваш запит надіслано автору публікації. Ви отримаєте REP-бали за залученість після підтвердження від вченого.
                    </p>
                  </div>
                  <button
                    onClick={() => { setVolunteerModalOpen(false); setVolTxState("IDLE"); setVolExperience(""); setVolAvailability(""); setVolContacts(""); }}
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

      {/* Scientist Author Section: Volunteer Applications Moderation */}
      {category === "Volunteer Trials" && isAuthenticated && (profileData?.name === author) && (
        <div className="mt-4 p-4 bg-purple-50/20 border border-purple-100 rounded-xl space-y-4">
          <div className="flex justify-between items-center border-b border-purple-100 pb-2">
            <h4 className="font-bold text-xs text-purple-900 uppercase tracking-wide flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Volunteer Applications Queue
            </h4>
            <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-bold">
              {volunteers.filter(v => v.status !== "COMPLETED").length} Active
            </span>
          </div>

          <div className="space-y-3">
            {volunteers.map((vol, index) => (
              <div key={index} className="bg-white p-3 rounded-lg border border-purple-100/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-bold text-gray-800">
                    <span>@{vol.username}</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-blue-50 text-blue-700 rounded font-normal">{vol.role}</span>
                    {vol.status === "ACCEPTED" && (
                      <span className="text-[9px] px-1 bg-amber-55/10 text-amber-700 border border-amber-200 rounded">Escrow Active</span>
                    )}
                    {vol.status === "COMPLETED" && (
                      <span className="text-[9px] px-1 bg-green-55/10 text-green-700 border border-green-200 rounded">Rewarded</span>
                    )}
                  </div>
                  <p className="text-gray-650"><span className="font-semibold text-gray-700">Вимоги/Досвід:</span> {vol.experience}</p>
                  <p className="text-gray-400 text-[10px]">Контакти: {vol.contacts}</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto shrink-0 justify-end">
                  {vol.status === "PENDING" && (
                    <button
                      onClick={() => handleAcceptVolunteer(vol.username)}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg cursor-pointer transition-colors text-[10px] uppercase"
                    >
                      Accept Application
                    </button>
                  )}
                  {vol.status === "ACCEPTED" && (
                    <button
                      onClick={() => handleReleaseReward(vol.username)}
                      className="px-3 py-1.5 bg-green-650 hover:bg-green-700 bg-green-600 text-white font-bold rounded-lg cursor-pointer transition-colors text-[10px] uppercase"
                    >
                      Verify & Release Reward
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
