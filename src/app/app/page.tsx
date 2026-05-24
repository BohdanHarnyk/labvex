"use client";

import { PostCard } from "@/components/feed/PostCard";
import { useAuth } from "@/lib/auth/AuthContext";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Sparkles, BookOpen, Send, Award, CheckCircle } from "lucide-react";

interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  upvotes: number;
  casFlag: boolean;
  aiSummary: string | null;
  rewardAmount?: number | null;
  rewardType?: string | null;
  createdAt: string;
  author: {
    username: string;
    displayName: string | null;
    role: string;
    reputationScore: number;
  };
}

const defaultCategories = [
  "Propulsion",
  "Quantum Mechanics",
  "AI & Hardware",
  "Superconductors",
  "Bio-Tech",
  "Space Exploration",
  "Fusion Energy",
  "Anomalous Phenomena",
  "Volunteer Trials"
];

export default function FeedPage() {
  const { role, profileData, isAuthenticated, gainReputation, openAuthModal, isAdmin } = useAuth();
  
  const [mounted, setMounted] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<string[]>(defaultCategories);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form states
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Propulsion");
  const [customCategory, setCustomCategory] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [rewardAmount, setRewardAmount] = useState("");
  const [rewardType, setRewardType] = useState("REP");
  
  // Filtering states
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  
  // Toast state
  const [showToast, setShowToast] = useState(false);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const url = `/api/posts?category=${activeCategory}${activeTag ? `&tag=${activeTag}` : ""}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (e) {
      console.error("Error loading posts from database:", e);
    } finally {
      setIsLoading(false);
    }
  };

  // Load from database & localStorage
  useEffect(() => {
    setMounted(true);
    const savedCategories = localStorage.getItem("labvex_feed_categories");
    if (savedCategories) {
      try {
        setCategories(JSON.parse(savedCategories));
      } catch (e) {
        setCategories(defaultCategories);
      }
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchPosts();
    }
  }, [mounted, activeCategory, activeTag]);

  // Save categories to localStorage
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("labvex_feed_categories", JSON.stringify(categories));
  }, [categories, mounted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    let finalCategory = category;
    if (category === "CUSTOM") {
      const cleanCustom = customCategory.trim();
      if (!cleanCustom) return;
      finalCategory = cleanCustom;
      if (!categories.includes(cleanCustom)) {
        setCategories(prev => [...prev, cleanCustom]);
      }
    }

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          category: finalCategory,
          tags: tagsInput,
          rewardAmount: finalCategory === "Volunteer Trials" ? Number(rewardAmount) : null,
          rewardType: finalCategory === "Volunteer Trials" ? rewardType : null,
        }),
      });

      if (res.ok) {
        setTitle("");
        setContent("");
        setTagsInput("");
        setCustomCategory("");
        setRewardAmount("");
        setRewardType("REP");
        if (category === "CUSTOM") {
          setCategory(finalCategory);
        }
        
        // Reload posts and trigger success toast
        await fetchPosts();
        gainReputation(50);
        
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 4000);
      }
    } catch (error) {
      console.error("Failed to publish post:", error);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (confirm("Ви впевнені, що хочете видалити цю публікацію? (Дія безповоротна)")) {
      try {
        const res = await fetch(`/api/posts/${postId}`, {
          method: "DELETE",
        });
        if (res.ok) {
          fetchPosts();
        }
      } catch (e) {
        console.error("Failed to delete post:", e);
      }
    }
  };

  const getFormTitle = () => {
    switch (role) {
      case "DEVELOPER":
        return "Release Open-Source SDK / Agent Update";
      case "LABORATORY":
        return "Publish Experimental Telemetry Logs";
      case "COMPANY":
        return "Submit R&D Sponsorship Proposal / Grant";
      case "VERIFIED_PHYSICIST":
      case "NOBEL_LAUREATE":
        return "Publish Scientific Article & Prior Art";
      default:
        return "Share R&D Finding or Hypothesis";
    }
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-green-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <section className="space-y-6 relative">
      <h2 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2 flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-green-500" />
        Scientific Feed
      </h2>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#e6fbf1] border border-[#a7f3d0] rounded-2xl p-4 shadow-xl flex items-center gap-3 max-w-sm pointer-events-none"
          >
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white shrink-0">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-green-950 text-sm">Reputation Earned!</div>
              <div className="text-xs text-green-700 font-semibold">+50 REP awarded for sharing prior art!</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form or Lock Screen */}
      {!isAuthenticated ? (
        <div className="card-soft p-8 text-center bg-white border border-gray-200 rounded-2xl relative overflow-hidden flex flex-col items-center justify-center">
          <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-5 h-5 text-gray-400" />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Publish on the Network</h3>
          <p className="text-xs text-gray-500 max-w-md mb-6 leading-relaxed">
            Create decentralized, cryptographically-proven scientific publications. Earn 50 Reputation (REP) tokens per contribution.
          </p>
          <button 
            onClick={openAuthModal}
            className="btn-primary text-xs px-6 py-2 flex items-center gap-2 shadow hover:shadow-md cursor-pointer"
          >
            Connect Identity to Share
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card-soft p-6 bg-white border border-gray-200 rounded-2xl space-y-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full blur-3xl -z-10 -mt-12 -mr-12" />
          
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-green-500" />
              {getFormTitle()}
            </h3>
            <span className="text-[10px] uppercase font-bold tracking-wider text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-200/30 flex items-center gap-1">
              <Award className="w-3 h-3" /> +50 REP Reward
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-3">
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Назва вашої публікації або оновлення..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-955 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors"
                required
              />
              <input 
                type="text" 
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Теги (через кому, наприклад: Vacuum-Thrust, Quantum, Orbit)..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-955 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors"
              />
            </div>
            <div className="space-y-3">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-955 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors cursor-pointer"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
                <option value="CUSTOM">+ Створити свою категорію...</option>
              </select>
              
              {category === "CUSTOM" && (
                <input 
                  type="text" 
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Назва нової категорії..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-955 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors"
                  required
                />
              )}
            </div>
          </div>

          {category === "Volunteer Trials" && (
            <div className="grid grid-cols-2 gap-4 bg-purple-50/20 p-4 border border-purple-100/50 rounded-xl animate-in slide-in-from-top duration-200">
              <div>
                <label className="block text-xs font-bold text-purple-700 uppercase tracking-wider mb-2">Нагорода волонтерам</label>
                <input 
                  type="number" 
                  value={rewardAmount}
                  onChange={(e) => setRewardAmount(e.target.value)}
                  placeholder="e.g. 100"
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-955 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-purple-700 uppercase tracking-wider mb-2">Тип нагороди</label>
                <select
                  value={rewardType}
                  onChange={(e) => setRewardType(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-955 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors cursor-pointer"
                >
                  <option value="REP">REP (Reputation Points)</option>
                  <option value="LVEX">LVEX (Utility Tokens)</option>
                </select>
              </div>
            </div>
          )}

          <div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Деталізуйте ваші результати, методологію, аномалії чи журнали телеметрії. Весь вміст хешується в блокчейні..."
              rows={4}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-955 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors resize-none"
              required
            />
          </div>

          <div className="flex justify-end pt-2">
            <button 
              type="submit" 
              className="btn-primary text-xs px-6 py-2.5 bg-gray-950 hover:bg-black text-white flex items-center gap-2 shadow hover:shadow-md cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" /> Publish Prior Art
            </button>
          </div>
        </form>
      )}

      {/* Filter Categories and Tags */}
      <div className="flex flex-col gap-3 p-4 bg-gray-50 border border-gray-100 rounded-2xl">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Фільтр за категорією</span>
          {(activeCategory !== "ALL" || activeTag) && (
            <button 
              onClick={() => { setActiveCategory("ALL"); setActiveTag(null); }}
              className="text-xs text-red-500 hover:text-red-650 font-bold transition-colors cursor-pointer"
            >
              Очистити фільтри
            </button>
          )}
        </div>
        
        {/* Horizontal Category Scroll */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-200">
          <button
            onClick={() => setActiveCategory("ALL")}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all shrink-0 cursor-pointer ${
              activeCategory === "ALL" 
                ? "bg-green-600 text-white shadow-sm" 
                : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
            }`}
          >
            Всі категорії
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all shrink-0 cursor-pointer ${
                activeCategory === cat 
                  ? "bg-green-600 text-white shadow-sm" 
                  : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Active Tag Filter Status */}
        {activeTag && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200/50 rounded-xl px-3 py-1.5 text-xs font-semibold text-green-800 self-start animate-in fade-in duration-200">
            <span>Фільтр за тегом: <strong className="text-green-955 font-bold">#{activeTag}</strong></span>
            <button 
              onClick={() => setActiveTag(null)}
              className="w-4.5 h-4.5 rounded-full bg-green-100 hover:bg-green-200 text-green-800 flex items-center justify-center font-bold transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-green-500 rounded-full animate-spin"></div>
            <span className="text-xs text-gray-400 font-mono">Syncing scientific feed with database...</span>
          </div>
        ) : posts.length === 0 ? (
          <div className="card-soft p-12 text-center bg-white border border-gray-200 rounded-2xl">
            <p className="text-sm text-gray-500">Не знайдено публікацій у вибраному фільтрі.</p>
          </div>
        ) : (
          posts.map(post => (
            <PostCard 
              key={post.id}
              id={post.id}
              title={post.title}
              author={post.author.displayName || post.author.username || "Anonymous"}
              authorRole={post.author.role}
              authorReputation={post.author.reputationScore}
              txHash={post.id.substring(0, 10) + "...dev"}
              content={post.content}
              category={post.category}
              tags={post.tags}
              upvotes={post.upvotes}
              casFlag={post.casFlag}
              aiSummary={post.aiSummary}
              rewardAmount={post.rewardAmount}
              rewardType={post.rewardType}
              createdAt={post.createdAt}
              onTagClick={(tag: string) => setActiveTag(tag)}
              onCategoryClick={(cat: string) => setActiveCategory(cat)}
              onDelete={() => handleDeletePost(post.id)}
            />
          ))
        )}
      </div>
    </section>
  );
}
