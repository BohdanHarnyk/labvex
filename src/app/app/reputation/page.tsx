"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Award, TrendingUp, Zap, Users, Star, Sparkles, Clock, AlertTriangle, ShieldCheck, Flame } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";

interface LeaderboardUser {
  id: string;
  username: string;
  displayName: string | null;
  role: string;
  reputationScore: number;
  bio: string | null;
  avatarUrl: string | null;
}

const TIERS = [
  { name: "Observer", min: 0, max: 100, color: "#9ca3af", desc: "New to the ecosystem" },
  { name: "Contributor", min: 100, max: 500, color: "#3b82f6", desc: "Active researcher" },
  { name: "Validator", min: 500, max: 1500, color: "#8b5cf6", desc: "Peer reviewer" },
  { name: "Scholar", min: 1500, max: 5000, color: "#f59e0b", desc: "Domain expert" },
  { name: "Pioneer", min: 5000, max: 999999, color: "#22c55e", desc: "DeSci leader" },
];

export default function ReputationPage() {
  const { role, profileData, reputation, isAuthenticated } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [decayDaysLeft, setDecayDaysLeft] = useState(180);

  // Load Leaderboard from API
  const fetchLeaderboard = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/reputation/leaderboard?limit=15");
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data);
      }
    } catch (e) {
      console.error("Failed to load leaderboard", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    
    // Simulate decay timer (180 days)
    const decayStart = localStorage.getItem("labvex_decay_start");
    if (decayStart) {
      const elapsedMs = Date.now() - parseInt(decayStart);
      const elapsedDays = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
      setDecayDaysLeft(Math.max(0, 180 - elapsedDays));
    } else {
      localStorage.setItem("labvex_decay_start", Date.now().toString());
      setDecayDaysLeft(180);
    }
  }, []);

  const currentRep = reputation;
  const myTier = TIERS.find(t => currentRep >= t.min && currentRep < t.max) || TIERS[0];
  const nextTierIndex = TIERS.indexOf(myTier) + 1;
  const nextTier = nextTierIndex < TIERS.length ? TIERS[nextTierIndex] : null;
  const progress = nextTier ? ((currentRep - myTier.min) / (nextTier.min - myTier.min)) * 100 : 100;

  const getRoleLabel = (roleStr: string) => {
    return roleStr.replace("_", " ").toLowerCase();
  };

  const getTierBadgeClass = (tierName: string) => {
    switch (tierName) {
      case "Pioneer": return "bg-green-50 text-green-700 border-green-200";
      case "Scholar": return "bg-amber-50 text-amber-700 border-amber-200";
      case "Validator": return "bg-purple-50 text-purple-700 border-purple-200";
      case "Contributor": return "bg-blue-50 text-blue-700 border-blue-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Award className="w-6 h-6 text-green-600 animate-pulse" />
          Network Reputation Standing
        </h2>
        <p className="text-sm text-gray-500">
          Ваш суверенний науковий статус у мережі LABVEX, підтверджений криптографічними публікаціями та голосуваннями DAO.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Standing and Leaderboard */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* My Standing Glass Card */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }}
            className="card-soft p-6 relative overflow-hidden bg-white border border-gray-200 rounded-3xl shadow-sm"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-green-50 rounded-full blur-3xl -z-10 -mt-12 -mr-12 opacity-70" />
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-green-50 text-green-700 border border-green-200 rounded-2xl flex items-center justify-center font-bold text-2xl">
                  {profileData.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                    {profileData.name}
                    {isAuthenticated && (
                      <span className="text-[10px] bg-green-50 text-green-700 border border-green-200/50 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                        {getRoleLabel(role)}
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 max-w-sm line-clamp-1">{profileData.bio || "No biography provided."}</p>
                </div>
              </div>

              <div className="text-left md:text-right shrink-0">
                <div className="text-3xl font-extrabold text-green-600 font-mono tracking-tight flex items-baseline gap-1">
                  {currentRep.toLocaleString()}
                  <span className="text-xs font-bold text-gray-400 font-sans uppercase">REP</span>
                </div>
                <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mt-1">Reputation Score</div>
              </div>
            </div>

            {/* Progress to Next Tier */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-gray-900 flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-green-600" />
                  Рівень: <strong className="text-green-700">{myTier.name}</strong>
                </span>
                {nextTier && (
                  <span className="text-gray-400 font-medium">
                    Залишилось {nextTier.min - currentRep} REP до рівня {nextTier.name}
                  </span>
                )}
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden border border-gray-200/50">
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: `${progress}%` }} 
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-green-600 rounded-full"
                />
              </div>
            </div>
          </motion.div>

          {/* Leaderboard Table */}
          <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-green-600" />
                Global DeSci Leaderboard
              </h3>
              <span className="text-[10px] uppercase font-bold tracking-wider text-green-600 bg-green-50 border border-green-200/50 px-2 py-0.5 rounded">
                Live Data
              </span>
            </div>

            {isLoading ? (
              <div className="py-20 text-center space-y-3">
                <div className="w-10 h-10 border-4 border-gray-200 border-t-green-500 rounded-full animate-spin mx-auto"></div>
                <span className="text-xs text-gray-400 font-mono">Querying decentralized database logs...</span>
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="py-12 text-center text-gray-500 text-sm">
                No active profiles found on the network.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {leaderboard.map((user, idx) => {
                  const isMe = user.displayName === profileData.name || user.username.includes(profileData.name.toLowerCase());
                  const userTier = TIERS.find(t => user.reputationScore >= t.min && user.reputationScore < t.max) || TIERS[0];
                  
                  return (
                    <motion.div 
                      key={user.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`p-4 px-6 flex items-center gap-4 transition-colors hover:bg-gray-50/50 ${
                        isMe ? "bg-green-50/20" : ""
                      }`}
                    >
                      {/* Rank number or Medals */}
                      <span className="w-6 text-center font-bold text-sm text-gray-400 shrink-0">
                        {idx === 0 ? "🏆" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : idx + 1}
                      </span>

                      {/* Avatar */}
                      <div className="w-8 h-8 bg-gray-100 border border-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600 text-xs shrink-0">
                        {user.displayName?.charAt(0) || user.username.charAt(0).toUpperCase()}
                      </div>

                      {/* Name / Role info */}
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-gray-900 text-sm truncate flex items-center gap-1.5">
                          {user.displayName || `@${user.username}`}
                          {isMe && <span className="text-[9px] bg-green-100 text-green-700 px-1 rounded font-bold uppercase">Me</span>}
                        </div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold mt-0.5">{getRoleLabel(user.role)}</p>
                      </div>

                      {/* Tier Tag */}
                      <span className={`text-[10px] font-bold border rounded-full px-2 py-0.5 shrink-0 ${getTierBadgeClass(userTier.name)}`}>
                        {userTier.name}
                      </span>

                      {/* Reputation points */}
                      <span className="w-20 text-right font-mono font-bold text-gray-900 text-sm shrink-0">
                        {user.reputationScore.toLocaleString()}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Decay Timer and Reputation Rules */}
        <div className="space-y-6">
          
          {/* Reputation Decay Timer Card */}
          <div className="card-soft p-6 bg-white border border-gray-200 rounded-3xl shadow-sm space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full blur-3xl -z-10 -mt-12 -mr-12 opacity-60" />
            
            <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
              <Clock className="w-5 h-5 text-amber-500" />
              <div>
                <h4 className="font-bold text-gray-900 text-sm">Reputation Decay Countdown</h4>
                <p className="text-[10px] text-gray-400">Вплив бездіяльності на ваш статус</p>
              </div>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <span className="text-3xl font-extrabold text-amber-600 font-mono tracking-tight">{decayDaysLeft}</span>
                <span className="text-xs font-bold text-gray-400 uppercase ml-1">днів</span>
              </div>
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 border border-amber-200/50">
                <Flame className="w-5 h-5 animate-pulse" />
              </div>
            </div>

            <div className="bg-amber-50/50 border border-amber-200/50 rounded-xl p-3 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[10px] text-amber-700 leading-relaxed font-medium">
                <strong>Увага:</strong> Для запобігання втрати репутації через Decay, робіть принаймні одну активність (публікація prior art, участь у голосуваннях, рецензування) кожні 180 днів. При закінченні таймеру знімається 10% REP.
              </p>
            </div>
          </div>

          {/* How to earn details */}
          <div className="card-soft p-6 bg-white border border-gray-200 rounded-3xl shadow-sm space-y-4">
            <h4 className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-3 uppercase tracking-wider text-xs text-gray-400">
              Як заробити REP
            </h4>
            
            <div className="space-y-3">
              {[
                { title: "Публікація Prior Art", value: "+50 REP", desc: "Хешування результатів або креативних SDK у стрічку." },
                { title: "Схвалена послуга", value: "+100 REP", desc: "Додавання верифікованої послуги на маркетплейс." },
                { title: "Отримання апвоуту", value: "+2 REP", desc: "Кожен позитивний голос колег-дослідників на ваші пости." },
                { title: "Участь у голосуванні", value: "+5 REP", desc: "Підтримка консенсусу в DAO Forum." },
                { title: "Завершення місії", value: "+10-150 REP", desc: "Виконання завдань від партнерів та спонсорів." },
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between items-start gap-4 text-xs pb-3 border-b border-gray-150/10 last:border-0 last:pb-0">
                  <div className="space-y-0.5">
                    <strong className="text-gray-950 font-bold">{item.title}</strong>
                    <p className="text-gray-500 text-[10px] leading-relaxed">{item.desc}</p>
                  </div>
                  <span className="font-bold text-green-600 shrink-0 bg-green-50 border border-green-100/50 px-2 py-0.5 rounded-lg text-[10px]">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
