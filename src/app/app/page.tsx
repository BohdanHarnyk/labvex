"use client";

import { PostCard } from "@/components/feed/PostCard";
import { useAuth } from "@/lib/auth/AuthContext";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Sparkles, BookOpen, Send, Award, CheckCircle } from "lucide-react";

interface Post {
  id: string;
  title: string;
  author: string;
  authorRole: string;
  txHash: string;
  content: string;
  category?: string;
  tags?: string[];
}

const initialPosts: Post[] = [
  {
    id: "1",
    title: "Observation of Anomalous Thrust in Asymmetric Capacitors",
    author: "Dr. E. Brown",
    authorRole: "VERIFIED_PHYSICIST",
    txHash: "0x8f2c9...3a2b",
    category: "Propulsion",
    tags: ["Biefeld-Brown", "Vacuum-Thrust", "EHD"],
    content: "Observed significant thrust variations in asymmetric capacitor arrays at 40kV in a hard vacuum (10^-6 Torr). This challenges the standard ion wind interpretation of the Biefeld-Brown effect. Uploading sensor logs for community review. If verified, this could necessitate a rethinking of electrohydrodynamic equations under extreme conditions."
  },
  {
    id: "2",
    title: "Replicating the Podkletnov Superconductor Gravity Shielding",
    author: "Dr. V. K.",
    authorRole: "NOBEL_LAUREATE",
    txHash: "0x9a1b2...4c5d",
    category: "Superconductors",
    tags: ["Gravity-Shielding", "Podkletnov", "YBCO"],
    content: "Spinning a YBCO superconductor disk at 5000 RPM at 70K. Initial gravimeter readings show a consistent 0.05% weight reduction in the object suspended above. Looking for Citizen Explorers to run noise-cancellation analysis on our gravimeter raw data. The seismic interference is significant, making it hard to isolate the anomaly."
  }
];

const defaultCategories = [
  "Propulsion",
  "Quantum Mechanics",
  "AI & Hardware",
  "Superconductors",
  "Bio-Tech",
  "Space Exploration",
  "Fusion Energy",
  "Anomalous Phenomena"
];

export default function FeedPage() {
  const { role, profileData, isAuthenticated, gainReputation, openAuthModal } = useAuth();
  
  const [mounted, setMounted] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<string[]>(defaultCategories);
  
  // Form states
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Propulsion");
  const [customCategory, setCustomCategory] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  
  // Filtering states
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  
  // Toast state
  const [showToast, setShowToast] = useState(false);

  // Load from localStorage
  useEffect(() => {
    setMounted(true);
    const savedPosts = localStorage.getItem("labvex_feed_posts");
    const savedCategories = localStorage.getItem("labvex_feed_categories");
    
    if (savedPosts) {
      try {
        setPosts(JSON.parse(savedPosts));
      } catch (e) {
        setPosts(initialPosts);
      }
    } else {
      setPosts(initialPosts);
      localStorage.setItem("labvex_feed_posts", JSON.stringify(initialPosts));
    }

    if (savedCategories) {
      try {
        setCategories(JSON.parse(savedCategories));
      } catch (e) {
        setCategories(defaultCategories);
      }
    } else {
      setCategories(defaultCategories);
      localStorage.setItem("labvex_feed_categories", JSON.stringify(defaultCategories));
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("labvex_feed_posts", JSON.stringify(posts));
  }, [posts, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("labvex_feed_categories", JSON.stringify(categories));
  }, [categories, mounted]);

  const handleSubmit = (e: React.FormEvent) => {
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

    const tagsArray = tagsInput
      ? tagsInput.split(",").map(t => t.trim()).filter(t => t.length > 0)
      : [];

    const randHex1 = Math.floor(Math.random() * 65536).toString(16).padStart(4, "0");
    const randHex2 = Math.floor(Math.random() * 65536).toString(16).padStart(4, "0");
    const txHash = `0x${randHex1}...${randHex2}`;

    const newPost: Post = {
      id: Date.now().toString(),
      title,
      author: profileData.name || "Anonymous",
      authorRole: role,
      txHash,
      content,
      category: finalCategory,
      tags: tagsArray
    };

    setPosts(prev => [newPost, ...prev]);
    setTitle("");
    setContent("");
    setTagsInput("");
    setCustomCategory("");
    if (category === "CUSTOM") {
      setCategory(finalCategory);
    }
    
    // Reward 50 Reputation points
    gainReputation(50);
    
    // Trigger success toast
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 4000);
  };

  const handleDeletePost = (postId: string) => {
    if (confirm("Ви впевнені, що хочете видалити цю публікацію? (Дія безповоротна)")) {
      setPosts(prev => prev.filter(p => p.id !== postId));
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

  // Filter posts
  const filteredPosts = posts.filter(post => {
    if (activeCategory !== "ALL" && post.category !== activeCategory) {
      return false;
    }
    if (activeTag && (!post.tags || !post.tags.includes(activeTag))) {
      return false;
    }
    return true;
  });

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
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-950 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors"
                required
              />
              <input 
                type="text" 
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Теги (через кому, наприклад: Vacuum-Thrust, Quantum, Orbit)..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-950 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors"
              />
            </div>
            <div className="space-y-3">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-950 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors cursor-pointer"
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
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-950 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors"
                  required
                />
              )}
            </div>
          </div>

          <div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Деталізуйте ваші результати, методологію, аномалії чи журнали телеметрії. Весь вміст хешується в блокчейні..."
              rows={4}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-950 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors resize-none"
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
              className="text-xs text-red-500 hover:text-red-600 font-bold transition-colors cursor-pointer"
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
            <span>Фільтр за тегом: <strong className="text-green-950 font-bold">#{activeTag}</strong></span>
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
        {filteredPosts.length === 0 ? (
          <div className="card-soft p-12 text-center bg-white border border-gray-200 rounded-2xl">
            <p className="text-sm text-gray-500">Не знайдено публікацій у вибраному фільтрі.</p>
          </div>
        ) : (
          filteredPosts.map(post => (
            <PostCard 
              key={post.id}
              title={post.title}
              author={post.author}
              authorRole={post.authorRole}
              txHash={post.txHash}
              content={post.content}
              category={post.category}
              tags={post.tags}
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
