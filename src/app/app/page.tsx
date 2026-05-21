"use client";
 
import { PostCard } from "@/components/feed/PostCard";
import { useAuth } from "@/lib/auth/AuthContext";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Sparkles, BookOpen, Send, Award, CheckCircle } from "lucide-react";
 
interface Post {
  id: string;
  title: string;
  author: string;
  authorRole: string;
  txHash: string;
  content: string;
}
 
const initialPosts: Post[] = [
  {
    id: "1",
    title: "Observation of Anomalous Thrust in Asymmetric Capacitors",
    author: "Dr. E. Brown",
    authorRole: "VERIFIED_PHYSICIST",
    txHash: "0x8f2c9...3a2b",
    content: "Observed significant thrust variations in asymmetric capacitor arrays at 40kV in a hard vacuum (10^-6 Torr). This challenges the standard ion wind interpretation of the Biefeld-Brown effect. Uploading sensor logs for community review. If verified, this could necessitate a rethinking of electrohydrodynamic equations under extreme conditions."
  },
  {
    id: "2",
    title: "Replicating the Podkletnov Superconductor Gravity Shielding",
    author: "Dr. V. K.",
    authorRole: "NOBEL_LAUREATE",
    txHash: "0x9a1b2...4c5d",
    content: "Spinning a YBCO superconductor disk at 5000 RPM at 70K. Initial gravimeter readings show a consistent 0.05% weight reduction in the object suspended above. Looking for Citizen Explorers to run noise-cancellation analysis on our gravimeter raw data. The seismic interference is significant, making it hard to isolate the anomaly."
  }
];
 
export default function FeedPage() {
  const { role, profileData, isAuthenticated, gainReputation, openAuthModal } = useAuth();
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  
  // Form states
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Propulsion");
  
  // Toast state
  const [showToast, setShowToast] = useState(false);
 
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
 
    const randHex1 = Math.floor(Math.random() * 65536).toString(16).padStart(4, "0");
    const randHex2 = Math.floor(Math.random() * 65536).toString(16).padStart(4, "0");
    const txHash = `0x${randHex1}...${randHex2}`;
 
    const newPost: Post = {
      id: Date.now().toString(),
      title,
      author: profileData.name || "Anonymous",
      authorRole: role,
      txHash,
      content
    };
 
    setPosts(prev => [newPost, ...prev]);
    setTitle("");
    setContent("");
    
    // Reward 50 Reputation points
    gainReputation(50);
    
    // Trigger success toast
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 4000);
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
            className="btn-primary text-xs px-6 py-2 flex items-center gap-2 shadow hover:shadow-md"
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
            <div className="md:col-span-2">
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title of your publication or update..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-950 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors"
                required
              />
            </div>
            <div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-950 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors"
              >
                <option value="Propulsion">Propulsion (EHD / EmDrive)</option>
                <option value="Quantum Mechanics">Quantum Mechanics</option>
                <option value="AI & Hardware">AI & Hardware</option>
                <option value="Superconductors">Superconductors</option>
              </select>
            </div>
          </div>
 
          <div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Detail your findings, methodologies, anomalies, or logs. All contents are hashed on-chain..."
              rows={4}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-950 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors resize-none"
              required
            />
          </div>
 
          <div className="flex justify-end pt-2">
            <button 
              type="submit" 
              className="btn-primary text-xs px-6 py-2.5 bg-gray-950 hover:bg-black text-white flex items-center gap-2 shadow hover:shadow-md"
            >
              <Send className="w-3.5 h-3.5" /> Publish Prior Art
            </button>
          </div>
        </form>
      )}
 
      {/* Posts List */}
      <div className="space-y-4">
        {posts.map(post => (
          <PostCard 
            key={post.id}
            title={post.title}
            author={post.author}
            authorRole={post.authorRole}
            txHash={post.txHash}
            content={post.content}
          />
        ))}
      </div>
    </section>
  );
}
