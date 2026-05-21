"use client";
 
import { useAuth } from "@/lib/auth/AuthContext";
import { 
  MessageSquare, ThumbsUp, MessageCircle, AlertTriangle, 
  Trash2, Plus, ShieldAlert, Sparkles, Send, X, FileText 
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
 
type Thread = {
  id: string;
  category: string;
  title: string;
  author: string;
  role: string;
  replies: number;
  upvotes: number;
};
 
const initialThreads: Thread[] = [
  {
    id: "1",
    category: "Propulsion",
    title: "Review of the 2025 EM Drive Vacuum tests by NASA Eagleworks",
    author: "Dr. V. K.",
    role: "Verified Physicist",
    replies: 142,
    upvotes: 890,
  },
  {
    id: "2",
    category: "Quantum",
    title: "Is the Podkletnov effect just thermal expansion of the YBCO?",
    author: "Alex_Sci",
    role: "Citizen Explorer",
    replies: 56,
    upvotes: 120,
  },
  {
    id: "3",
    category: "Hardware",
    title: "DIY Guide: Building a high-voltage asymmetric capacitor at home safely",
    author: "VoltMaster",
    role: "Citizen Explorer",
    replies: 89,
    upvotes: 450,
  }
];
 
export default function ForumPage() {
  const { role, profileData, isAuthenticated, isAdmin } = useAuth();
  const [threads, setThreads] = useState<Thread[]>(initialThreads);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Propulsion");
 
  const isAllowedToPost = role !== "CITIZEN_EXPLORER" && role !== "GUEST" && isAuthenticated;
 
  const handleDelete = (id: string) => {
    setThreads(threads.filter(t => t.id !== id));
  };
 
  const handleCreateThread = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
 
    const thread: Thread = {
      id: Date.now().toString(),
      category: newCategory,
      title: newTitle,
      author: profileData.name || "Anonymous",
      role: role.replace("_", " "),
      replies: 0,
      upvotes: 1
    };
 
    setThreads(prev => [thread, ...prev]);
    setNewTitle("");
    setIsModalOpen(false);
  };
 
  const getBannerText = () => {
    if (!isAuthenticated) {
      return "You need to Sign In to publish or participate on the DAO Forum.";
    }
    switch (role) {
      case "CITIZEN_EXPLORER":
        return "Posting Rules: As a Citizen Explorer, you can read and comment on all threads to earn Reputation. However, creating new root threads is restricted to ZK-verified specialists (Scientists, Developers, Laboratories, Companies) to maintain high scientific standards.";
      case "DEVELOPER":
        return "Welcome, Developer. You have full posting access. Feel free to share smart contract audits, SDK proposals, or agent templates. Be sure to reference GitHub links when appropriate.";
      case "LABORATORY":
        return "Welcome, Laboratory Representative. You have full posting access. Feel free to share experimental telemetry data, equipment specs, or vacuum chamber calibration logs.";
      case "COMPANY":
        return "Welcome, Corporate Sponsor. You have full posting access. Share R&D funding inquiries, commercialization opportunities, or tokenized grant proposals.";
      case "VERIFIED_PHYSICIST":
      case "NOBEL_LAUREATE":
        return "Welcome, Researcher. You have full posting access. Keep topics focused on frontier physics replication, experimental methodology, and telemetry auditing.";
      default:
        return "Welcome to the LABVEX DAO Forum.";
    }
  };
 
  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-gray-200 pb-4 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">DAO Forum</h2>
          <p className="text-sm text-gray-500 mt-1">Discuss research, hardware setups, and physics theories.</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          disabled={!isAllowedToPost}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white font-bold rounded-xl shadow-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          title={!isAllowedToPost ? "Only Verified specialists (Scientist, Developer, Lab, Company) can start new threads to prevent spam." : "Create a new thread"}
        >
          <Plus className="w-5 h-5" />
          New Thread
        </button>
      </div>
 
      {/* Dynamic Guidelines Banner */}
      <div className={`flex items-start gap-3 p-4 border rounded-xl mb-6 ${isAllowedToPost ? "bg-green-50 border-green-200 text-green-800" : "bg-blue-50 border-blue-200 text-blue-800"}`}>
        <ShieldAlert className={`w-5 h-5 shrink-0 mt-0.5 ${isAllowedToPost ? "text-green-500" : "text-blue-500"}`} />
        <p className="text-xs leading-relaxed">
          <strong>Forum Guidelines:</strong> {getBannerText()}
        </p>
      </div>
 
      {isAdmin && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-6">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-red-800 leading-relaxed font-bold">
            Admin Mode Active: You have moderation privileges. You can delete threads that violate the DAO community guidelines.
          </p>
        </div>
      )}
 
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Categories Header */}
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex gap-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
          <button className="text-gray-900 border-b-2 border-gray-900 pb-1">All</button>
          <button className="hover:text-gray-900 transition-colors">Propulsion</button>
          <button className="hover:text-gray-900 transition-colors">Quantum</button>
          <button className="hover:text-gray-900 transition-colors">Hardware</button>
        </div>
 
        {/* Thread List */}
        <div className="divide-y divide-gray-100">
          <AnimatePresence>
            {threads.map((thread) => (
              <motion.div 
                key={thread.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-6 hover:bg-gray-50 transition-colors flex items-center justify-between group"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wider rounded border border-gray-200">
                      {thread.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1 cursor-pointer hover:text-green-600 transition-colors">
                    {thread.title}
                  </h3>
                  <div className="text-sm text-gray-500 flex items-center gap-2">
                    <span className="font-medium text-gray-700">{thread.author}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full" />
                    <span className="capitalize">{thread.role.toLowerCase()}</span>
                  </div>
                </div>
 
                <div className="flex items-center gap-6 text-gray-500 shrink-0 ml-6">
                  <div className="flex flex-col items-center">
                    <ThumbsUp className="w-5 h-5 mb-1 cursor-pointer hover:text-green-500" />
                    <span className="text-xs font-bold">{thread.upvotes}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <MessageCircle className="w-5 h-5 mb-1" />
                    <span className="text-xs font-bold">{thread.replies}</span>
                  </div>
                  
                  {isAdmin && (
                    <button 
                      onClick={() => handleDelete(thread.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-2"
                      title="Delete Thread"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {threads.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No threads found.
            </div>
          )}
        </div>
      </div>
 
      {/* New Thread Modal */}
      <AnimatePresence>
        {isModalOpen && (
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
                  <MessageSquare className="w-5 h-5 text-green-600" />
                  Create New Thread
                </h3>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="text-gray-400 hover:text-gray-700 bg-gray-150/10 hover:bg-gray-150/20 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
 
              <form onSubmit={handleCreateThread} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Thread Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-950 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                  >
                    <option value="Propulsion">Propulsion</option>
                    <option value="Quantum">Quantum</option>
                    <option value="Hardware">Hardware</option>
                  </select>
                </div>
 
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Topic Title</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Ask a question or raise a research topic..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-950 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                    required
                  />
                </div>
 
                <button
                  type="submit"
                  className="w-full btn-primary py-3 flex items-center justify-center gap-2 text-sm font-semibold shadow hover:shadow-md transition-all bg-gray-950 text-white hover:bg-black mt-2"
                >
                  <Send className="w-4 h-4" /> Post Thread
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
