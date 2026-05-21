"use client";

import { useAuth } from "@/lib/auth/AuthContext";
import { LockKeyhole, Plus, Activity, Rocket, Beaker, X, Send, DollarSign, Tag, FolderOpen } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Lab {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  goal: number;
  raised: number;
  status: "Active" | "Draft";
  volunteers: number;
}

const initialLabs: Lab[] = [
  {
    id: "1",
    title: "EM Drive Vacuum Testing",
    description: "Testing the thrust output of a truncated copper cone driven by a 2.45 GHz magnetron inside a hard vacuum chamber to eliminate ion wind interference.",
    category: "Propulsion",
    tags: ["vacuum", "ehd", "magnetron"],
    goal: 10000,
    raised: 4500,
    status: "Active",
    volunteers: 12,
  },
  {
    id: "2",
    title: "Draft: Cold Fusion Replica",
    description: "Replicating the Fleischmann-Pons experiment using palladium cathodes and heavy water, with multi-channel calorimetry.",
    category: "Quantum",
    tags: ["cold-fusion", "ip-tokens", "energy"],
    goal: 25000,
    raised: 0,
    status: "Draft",
    volunteers: 0,
  }
];

export default function MyLabsPage() {
  const { role, isAuthenticated, profileData, updateProfileData } = useAuth();
  const [labs, setLabs] = useState<Lab[]>(initialLabs);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Lab Form State
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategory, setNewCategory] = useState("Propulsion");
  const [customCategory, setCustomCategory] = useState("");
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [newTagsInput, setNewTagsInput] = useState("");
  const [newGoal, setNewGoal] = useState("10000");

  const isAllowed = role === "VERIFIED_PHYSICIST" || role === "NOBEL_LAUREATE" || role === "COMPANY";

  // List of unique categories currently available
  const existingCategories = Array.from(new Set(labs.map(l => l.category)));

  if (!isAuthenticated || !isAllowed) {
    return (
      <section className="flex flex-col items-center justify-center text-center py-20 px-6">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6 border border-gray-200">
          <LockKeyhole className="w-8 h-8 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Restricted</h2>
        <p className="text-gray-600 max-w-md mb-8 leading-relaxed">
          The <strong>"My Labs"</strong> module is an exclusive environment for managing primary research. 
          You must hold a <strong>Verified Physicist</strong>, <strong>Nobel Laureate</strong> ZK-Passport, or a <strong>Corporate Sponsor (Company)</strong> role to create and manage digital laboratories.
        </p>
        <button className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
          Apply for Verification
        </button>
      </section>
    );
  }

  const handleCreateLab = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) return;

    const finalCategory = isCustomCategory ? (customCategory.trim() || "General") : newCategory;
    const finalTags = newTagsInput
      .split(/[ ,]+/)
      .map(t => t.trim().toLowerCase().replace("#", ""))
      .filter(t => t.length > 0);

    const newLab: Lab = {
      id: Date.now().toString(),
      title: newTitle,
      description: newDescription,
      category: finalCategory,
      tags: finalTags,
      goal: Number(newGoal) || 5000,
      raised: 0,
      status: "Active",
      volunteers: 0
    };

    setLabs(prev => [newLab, ...prev]);

    // Also optionally append the new category to the user's profile categories if they custom-created one
    if (isCustomCategory && finalCategory) {
      const currentCats = profileData.customCategories || [];
      if (!currentCats.includes(finalCategory)) {
        updateProfileData({
          customCategories: [...currentCats, finalCategory]
        });
      }
    }

    // Reset Form
    setNewTitle("");
    setNewDescription("");
    setIsCustomCategory(false);
    setCustomCategory("");
    setNewTagsInput("");
    setNewGoal("10000");
    setIsModalOpen(false);
  };

  return (
    <section className="space-y-8">
      <div className="flex justify-between items-center border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Digital Labs</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your experiments, datasets, and fundraising.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white font-bold rounded-xl shadow-md hover:bg-green-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create New Lab
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {labs.map((lab) => (
          <div 
            key={lab.id}
            className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="absolute top-0 right-0 p-4 flex gap-2 items-center">
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wider rounded border border-gray-200">
                  {lab.category}
                </span>
                <span className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-md border ${
                  lab.status === "Active" 
                    ? "bg-green-50 text-green-700 border-green-200" 
                    : "bg-amber-50 text-amber-700 border-amber-200"
                }`}>
                  <Activity className="w-3 h-3" /> {lab.status}
                </span>
              </div>
              
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-4 border border-blue-100">
                {lab.category === "Propulsion" ? <Rocket className="w-6 h-6" /> : <Beaker className="w-6 h-6" />}
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-2">{lab.title}</h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                {lab.description}
              </p>

              {/* Tags/Hashtags rendering */}
              {lab.tags && lab.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {lab.tags.map((tag, i) => (
                    <span 
                      key={i} 
                      className="px-2 py-0.5 bg-green-50/80 text-green-700 text-[10px] font-semibold rounded-md border border-green-100/70 hover:border-green-300 transition-colors cursor-pointer"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            <div className="space-y-4 pt-4 border-t border-gray-100">
              {lab.status === "Active" && (
                <div>
                  <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
                    <span>Fundraising Goal (IPT)</span>
                    <span className="text-green-600">{lab.raised.toLocaleString()} / {lab.goal.toLocaleString()} USDC</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div 
                      className="bg-green-500 h-1.5 rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, (lab.raised / lab.goal) * 100)}%` }}
                    />
                  </div>
                </div>
              )}
              {lab.status === "Draft" && (
                <div className="text-xs text-amber-600 font-bold bg-amber-50/50 p-2 rounded-lg border border-amber-100">
                  Needs IP Tokenomics setup to launch fundraising
                </div>
              )}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-gray-500">
                  {lab.volunteers > 0 ? `${lab.volunteers} Citizen Volunteers active` : "No volunteers registered"}
                </span>
                <button className="text-sm font-semibold text-green-600 hover:text-green-700">Manage Hub &rarr;</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create New Lab Modal */}
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
              className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 relative overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-3">
                <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                  <Beaker className="w-5 h-5 text-green-600" />
                  Create Digital Laboratory
                </h3>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="text-gray-400 hover:text-gray-700 bg-gray-150/10 hover:bg-gray-150/20 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateLab} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Laboratory Title</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Asymmetric High-Voltage Capacitor array"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-950 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Research Objective (Description)</label>
                  <textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Describe the research, testing environment, equipment needed, and objective..."
                    rows={4}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-950 focus:outline-none focus:ring-2 focus:ring-green-500/20 resize-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <FolderOpen className="w-3.5 h-3.5 text-gray-400" />
                      Category
                    </label>
                    <select
                      value={isCustomCategory ? "custom" : newCategory}
                      onChange={(e) => {
                        if (e.target.value === "custom") {
                          setIsCustomCategory(true);
                        } else {
                          setIsCustomCategory(false);
                          setNewCategory(e.target.value);
                        }
                      }}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-950 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                    >
                      {existingCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                      <option value="custom">+ Create Custom Category</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                      Fundraising Goal (USDC)
                    </label>
                    <input
                      type="number"
                      value={newGoal}
                      onChange={(e) => setNewGoal(e.target.value)}
                      placeholder="10000"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-950 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                      required
                    />
                  </div>
                </div>

                {isCustomCategory && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-2"
                  >
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Custom Category Name</label>
                    <input
                      type="text"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="e.g. Bio-electromagnetics"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-950 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                      required={isCustomCategory}
                    />
                  </motion.div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-gray-400" />
                    Hashtags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={newTagsInput}
                    onChange={(e) => setNewTagsInput(e.target.value)}
                    placeholder="vacuum, ehd, replication, high-voltage"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-950 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 flex items-center justify-center gap-2 text-sm font-semibold shadow hover:shadow-md transition-all bg-gray-950 text-white hover:bg-black rounded-xl mt-4"
                >
                  <Send className="w-4 h-4" /> Create & Deploy Lab Node
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
