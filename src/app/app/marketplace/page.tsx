"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Store, Cpu, FlaskConical, Hammer, Search, Calendar, 
  DollarSign, Coins, ShieldCheck, Terminal, ArrowRight, 
  Clock, MapPin, Truck, Settings, Sparkles, CheckCircle2, Plus, CoinsIcon, Send 
} from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";

// Define Types
interface AIAgent {
  id: string;
  name: string;
  desc: string;
  priceUSDC: number;
  priceLVEX: number;
  type: string;
  status: "ONLINE" | "BUSY";
}

interface LabCapacity {
  id: string;
  name: string;
  location: string;
  desc: string;
  priceUSDC: number;
  specs: string[];
}

interface PhysicalProduct {
  id: string;
  name: string;
  desc: string;
  priceUSDC: number;
  priceSOL: number;
  stock: string;
}

interface IPToken {
  id: string;
  title: string;
  author: string;
  progress: number;
  raised: number;
  goal: number;
  royalty: number;
  participants: number;
}

interface ModerationRequest {
  id: string;
  authorId: string;
  author: {
    username: string;
    displayName: string | null;
    role: string;
  };
  category: "AI" | "LAAS" | "GOODS";
  title: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  data: any;
  createdAt: string;
}

const initialAiAgents: AIAgent[] = [];
const initialLabs: LabCapacity[] = [];
const initialProducts: PhysicalProduct[] = [];
const initialIpts: IPToken[] = [];

export default function MarketplacePage() {
  const { isAuthenticated, openAuthModal, role, isAdmin, profileData } = useAuth();
  const [activeCategory, setActiveCategory] = useState<"ALL" | "IPT" | "AI" | "LAAS" | "GOODS">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const [mounted, setMounted] = useState(false);
  const [aiAgents, setAiAgents] = useState<AIAgent[]>(initialAiAgents);
  const [labs, setLabs] = useState<LabCapacity[]>(initialLabs);
  const [products, setProducts] = useState<PhysicalProduct[]>(initialProducts);
  const [ipts, setIpts] = useState<IPToken[]>(initialIpts);
  const [moderationQueue, setModerationQueue] = useState<ModerationRequest[]>([]);

  // Modals state
  const [rentAgent, setRentAgent] = useState<AIAgent | null>(null);
  const [rentDuration, setRentDuration] = useState(1); // hours
  const [rentCurrency, setRentCurrency] = useState<"USDC" | "LVEX">("USDC");
  const [rentTxState, setRentTxState] = useState<"IDLE" | "PROVISIONING" | "TERMINAL" | "SUCCESS">("IDLE");
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [apiKey, setApiKey] = useState("");

  const [bookLab, setBookLab] = useState<LabCapacity | null>(null);
  const [bookDays, setBookDays] = useState(1);
  const [bookDate, setBookDate] = useState("");
  const [bookTxState, setBookTxState] = useState<"IDLE" | "PROCESSING" | "SUCCESS">("IDLE");

  const [buyProduct, setBuyProduct] = useState<PhysicalProduct | null>(null);
  const [buyQty, setBuyQty] = useState(1);
  const [buyCurrency, setBuyCurrency] = useState<"USDC" | "SOL">("USDC");
  const [shippingAddress, setShippingAddress] = useState("");
  const [buyTxState, setBuyTxState] = useState<"IDLE" | "SIGNING" | "CONFIRMING" | "SUCCESS">("IDLE");

  // Submit Modal state
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitName, setSubmitName] = useState("");
  const [submitDesc, setSubmitDesc] = useState("");
  const [submitPriceUSDC, setSubmitPriceUSDC] = useState("");
  const [submitPriceLVEX, setSubmitPriceLVEX] = useState("");
  const [submitAgentType, setSubmitAgentType] = useState("");
  const [submitLocation, setSubmitLocation] = useState("");
  const [submitSpecs, setSubmitSpecs] = useState("");
  const [submitPriceSOL, setSubmitPriceSOL] = useState("");
  const [submitStock, setSubmitStock] = useState("");

  const fetchSubmissions = async () => {
    try {
      const filterParam = isAdmin ? "all" : "my";
      const res = await fetch(`/api/marketplace/submissions?filter=${filterParam}`);
      if (res.ok) {
        const data = await res.json();
        setModerationQueue(data);

        // Separate and update lists
        const approvedSubmissions = data.filter((s: any) => s.status === "APPROVED");
        
        const approvedAI = approvedSubmissions.filter((s: any) => s.category === "AI").map((s: any) => s.data);
        const approvedLaas = approvedSubmissions.filter((s: any) => s.category === "LAAS").map((s: any) => s.data);
        const approvedGoods = approvedSubmissions.filter((s: any) => s.category === "GOODS").map((s: any) => s.data);

        setAiAgents([...initialAiAgents, ...approvedAI]);
        setLabs([...initialLabs, ...approvedLaas]);
        setProducts([...initialProducts, ...approvedGoods]);
      }
    } catch (e) {
      console.error("Failed to load submissions", e);
    }
  };

  // Load from database
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchSubmissions();
    }
  }, [mounted, isAdmin]);

  // Form submission handler
  const handleSubmitOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submitName || !submitDesc || !submitPriceUSDC) return;

    let offerData: any = {};
    let offerType: "AI" | "LAAS" | "GOODS" = "GOODS";

    if (role === "DEVELOPER") {
      offerType = "AI";
      offerData = {
        id: `ai-${Date.now()}`,
        name: submitName,
        desc: submitDesc,
        priceUSDC: Number(submitPriceUSDC),
        priceLVEX: Number(submitPriceLVEX) || Math.round(Number(submitPriceUSDC) * 4.5),
        type: submitAgentType || "AI Model",
        status: "ONLINE"
      };
    } else if (role === "LABORATORY") {
      offerType = "LAAS";
      offerData = {
        id: `lab-${Date.now()}`,
        name: submitName,
        location: submitLocation || "Віддалено (LABVEX)",
        desc: submitDesc,
        priceUSDC: Number(submitPriceUSDC),
        specs: submitSpecs ? submitSpecs.split(",").map(s => s.trim()) : ["Remote API Access"]
      };
    } else if (role === "COMPANY" || role === "VERIFIED_PHYSICIST" || role === "NOBEL_LAUREATE") {
      offerType = "GOODS";
      offerData = {
        id: `prod-${Date.now()}`,
        name: submitName,
        desc: submitDesc,
        priceUSDC: Number(submitPriceUSDC),
        priceSOL: Number(submitPriceSOL) || Number((Number(submitPriceUSDC) / 140).toFixed(2)),
        stock: submitStock || "В наявності"
      };
    }

    try {
      const res = await fetch("/api/marketplace/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: submitName,
          category: offerType,
          link: submitSpecs || null,
          data: offerData,
        }),
      });

      if (res.ok) {
        // Reset Form
        setSubmitName("");
        setSubmitDesc("");
        setSubmitPriceUSDC("");
        setSubmitPriceLVEX("");
        setSubmitAgentType("");
        setSubmitLocation("");
        setSubmitSpecs("");
        setSubmitPriceSOL("");
        setSubmitStock("");
        setShowSubmitModal(false);

        await fetchSubmissions();
        alert("Вашу пропозицію надіслано на модерацію. Вона з'явиться на маркетплейсі після ручного схвалення адміністратором.");
      }
    } catch (e) {
      console.error(e);
      alert("Не вдалося надіслати пропозицію.");
    }
  };

  // Admin approval/rejection handlers
  const handleApproveRequest = async (requestId: string) => {
    try {
      const res = await fetch(`/api/marketplace/submissions/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "APPROVED" }),
      });
      if (res.ok) {
        await fetchSubmissions();
        alert("Пропозицію схвалено та опубліковано!");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      const res = await fetch(`/api/marketplace/submissions/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "REJECTED" }),
      });
      if (res.ok) {
        await fetchSubmissions();
        alert("Пропозицію відхилено.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Simulations
  const handleRentAgent = () => {
    if (!rentAgent) return;
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    setRentTxState("PROVISIONING");
    setTerminalLogs([`> Connecting to LABVEX agent orchestration Layer...`]);

    setTimeout(() => {
      setTerminalLogs(l => [...l, `> Allocating docker sandbox on decentralized compute node...`]);
    }, 150);

    setTimeout(() => {
      setTerminalLogs(l => [...l, `> Loading AI Weights: ${rentAgent.name}...`]);
    }, 300);

    setTimeout(() => {
      setTerminalLogs(l => [...l, `> Injecting API boundaries & safety screening...`]);
      setRentTxState("TERMINAL");
    }, 450);

    setTimeout(() => {
      setTerminalLogs(l => [...l, `> Wallet signature confirmed on Solana.`]);
    }, 600);

    setTimeout(() => {
      const generatedKey = "lvx_sk_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      setApiKey(generatedKey);
      setTerminalLogs(l => [...l, `> API Key generated successfully.`]);
      setTerminalLogs(l => [...l, `> Ready! Endpoint initialized.`]);
      setRentTxState("SUCCESS");
    }, 850);
  };

  const handleBookLab = () => {
    if (!bookLab) return;
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    if (!bookDate) return;
    setBookTxState("PROCESSING");

    setTimeout(() => {
      setBookTxState("SUCCESS");
    }, 500);
  };

  const handleBuyProduct = () => {
    if (!buyProduct) return;
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    if (!shippingAddress) return;
    setBuyTxState("SIGNING");

    setTimeout(() => {
      setBuyTxState("CONFIRMING");
      setTimeout(() => {
        setBuyTxState("SUCCESS");
      }, 500);
    }, 300);
  };

  // Filter items
  const filteredAI = aiAgents.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.desc.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredLabs = labs.filter(l => l.name.toLowerCase().includes(searchQuery.toLowerCase()) || l.desc.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.desc.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredIpts = ipts.filter(i => i.title.toLowerCase().includes(searchQuery.toLowerCase()));

  // Formatter for Currency
  const formatNumber = (num: number) => {
    return num >= 1000000 ? (num / 1000000).toFixed(1) + "M" : num >= 1000 ? (num / 1000).toFixed(0) + "K" : num.toString();
  };

  return (
    <section className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-gray-200 pb-4 gap-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Store className="w-6 h-6 text-green-600" />
            Global Science Marketplace
          </h2>
          <p className="text-sm text-gray-500">
            Краудфандинг DeSci патентів (IPTs), оренда суверенних AI-агентів, лабораторного обладнання LaaS та придбання експериментальних матеріалів.
          </p>
          
          {/* Submit Offer Button */}
          {isAuthenticated && (role === "DEVELOPER" || role === "LABORATORY" || role === "COMPANY" || role === "VERIFIED_PHYSICIST" || role === "NOBEL_LAUREATE") && (
            <button
              onClick={() => setShowSubmitModal(true)}
              className="mt-2 py-1.5 px-3 text-xs bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Створити пропозицію
            </button>
          )}
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input 
            type="text" 
            placeholder="Search marketplace..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-xl max-w-lg">
        {(["ALL", "IPT", "AI", "LAAS", "GOODS"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveCategory(tab)}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${activeCategory === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
          >
            {tab === "ALL" && "All items"}
            {tab === "IPT" && "IP Tokens"}
            {tab === "AI" && "AI Agents"}
            {tab === "LAAS" && "Lab Slots"}
            {tab === "GOODS" && "Products"}
          </button>
        ))}
      </div>

      {/* Admin Moderation Queue Dashboard */}
      {isAdmin && (
        <div className="bg-gradient-to-r from-red-500/10 to-amber-500/10 border border-red-500/20 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-amber-500" />
          <div className="flex items-center justify-between border-b border-red-500/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-600">
                <ShieldCheck className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Адміністративна панель модерації (Moderation Dashboard)</h3>
                <p className="text-xs text-gray-500">Схвалення або відхилення пропозицій спеціалістів на маркетплейс</p>
              </div>
            </div>
            <span className="text-xs bg-red-100 text-red-700 font-bold px-3 py-1 rounded-full">
              {moderationQueue.filter(r => r.status === "PENDING").length} запитів
            </span>
          </div>

          {moderationQueue.filter(r => r.status === "PENDING").length === 0 ? (
            <div className="py-8 text-center text-gray-500 text-sm">
              Немає нових запитів на модерацію. Все перевірено!
            </div>
          ) : (
            <div className="space-y-4">
              {moderationQueue.filter(r => r.status === "PENDING").map(req => (
                <div key={req.id} className="p-5 bg-white border border-gray-200 rounded-2xl flex flex-col md:flex-row justify-between items-start gap-6 hover:shadow-md transition-all">
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md">
                        {req.category === "AI" && "🤖 AI Agent"}
                        {req.category === "LAAS" && "🔬 LaaS Capacity"}
                        {req.category === "GOODS" && "📦 Product/Material"}
                      </span>
                      <span className="text-[10px] text-gray-400">Від:</span>
                      <span className="text-xs font-bold text-gray-800">{req.author.displayName || req.author.username}</span>
                      <span className="text-[10px] px-1.5 py-0.2 bg-blue-50 text-blue-700 rounded border border-blue-100">{req.author.role}</span>
                    </div>

                    <div className="border-t border-gray-100 pt-2.5">
                      <h4 className="font-bold text-gray-900">{req.data.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{req.data.desc}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                      {req.category === "AI" && (
                        <>
                          <div><span className="text-gray-400">Ціна USDC:</span> <strong className="text-gray-700">{req.data.priceUSDC} / год</strong></div>
                          <div><span className="text-gray-400">Ціна LVEX:</span> <strong className="text-gray-700">{req.data.priceLVEX}</strong></div>
                          <div className="col-span-2"><span className="text-gray-400">Категорія:</span> <strong className="text-gray-700">{req.data.type}</strong></div>
                        </>
                      )}
                      {req.category === "LAAS" && (
                        <>
                          <div><span className="text-gray-400">Ціна USDC:</span> <strong className="text-gray-700">{req.data.priceUSDC} / день</strong></div>
                          <div><span className="text-gray-400">Локація:</span> <strong className="text-gray-700">{req.data.location}</strong></div>
                          <div className="col-span-2"><span className="text-gray-400">Специфікації:</span> <strong className="text-gray-700">{req.data.specs?.join(", ")}</strong></div>
                        </>
                      )}
                      {req.category === "GOODS" && (
                        <>
                          <div><span className="text-gray-400">Ціна USDC:</span> <strong className="text-gray-700">{req.data.priceUSDC}</strong></div>
                          <div><span className="text-gray-400">Ціна SOL:</span> <strong className="text-gray-700">{req.data.priceSOL}</strong></div>
                          <div className="col-span-2"><span className="text-gray-400">Наявність:</span> <strong className="text-gray-700">{req.data.stock}</strong></div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex md:flex-col gap-2 shrink-0 w-full md:w-auto">
                    <button
                      onClick={() => handleApproveRequest(req.id)}
                      className="flex-1 md:w-32 py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectRequest(req.id)}
                      className="flex-1 md:w-32 py-2 px-4 bg-red-500 hover:bg-red-600 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* My Submissions Track Section */}
      {isAuthenticated && moderationQueue.length > 0 && !isAdmin && (
        <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <Clock className="w-5 h-5 text-gray-500" />
            <div>
              <h3 className="text-lg font-bold text-gray-900">Мої пропозиції (My Marketplace Offers)</h3>
              <p className="text-xs text-gray-500">Відстеження статусу ваших пропозицій на маркетплейсі</p>
            </div>
          </div>

          <div className="space-y-3">
            {moderationQueue.map(req => (
              <div key={req.id} className="p-4 border border-gray-100 rounded-xl flex items-center justify-between gap-4 text-sm bg-gray-50/30">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <strong className="text-gray-900">{req.title}</strong>
                    <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-bold uppercase">
                      {req.category}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-1">{req.data?.desc || ""}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {req.status === "PENDING" && (
                    <span className="text-xs font-bold px-3 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-200 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                      Очікує перевірки
                    </span>
                  )}
                  {req.status === "APPROVED" && (
                    <span className="text-xs font-bold px-3 py-1 bg-green-50 text-green-700 rounded-full border border-green-200 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Опубліковано
                    </span>
                  )}
                  {req.status === "REJECTED" && (
                    <span className="text-xs font-bold px-3 py-1 bg-red-50 text-red-700 rounded-full border border-red-200 flex items-center gap-1.5">
                      ✕ Відхилено
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Blocks Layout */}
      <div className="space-y-10">

        {/* 0. INTELLECTUAL PROPERTY TOKENS (IPTs) (Symbiosis Feature) */}
        {(activeCategory === "ALL" || activeCategory === "IPT") && filteredIpts.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500">
                <CoinsIcon className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Intellectual Property Tokens (IPTs - Патенти)</h3>
                <p className="text-xs text-gray-500">Інвестування в децентралізовані патенти та дослідження</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredIpts.map((ipt) => (
                <div key={ipt.id} className="card-soft p-5 border border-gray-100 rounded-2xl flex flex-col justify-between hover:border-amber-500/30 transition-all">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <span className="text-xs text-gray-400 font-semibold">@{ipt.author}</span>
                      <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/50 px-2 py-0.5 rounded">
                        {ipt.royalty}% Royalty
                      </span>
                    </div>
                    <h4 className="font-bold text-gray-900 text-sm leading-snug h-12 line-clamp-2">{ipt.title}</h4>
                    
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-gray-900">${formatNumber(ipt.raised)}</span>
                        <span className="text-gray-400">Ціль: ${formatNumber(ipt.goal)}</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-150/20 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-500 rounded-full" 
                          style={{ width: `${Math.min(100, ipt.progress)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t border-gray-100 pt-4 mt-6">
                    <span className="text-xs text-gray-400">{ipt.participants} інвесторів</span>
                    <button 
                      onClick={() => alert(`Fund simulation triggered for ${ipt.title}`)}
                      className="px-3.5 py-1.5 bg-gray-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow cursor-pointer transition-colors"
                    >
                      Fund Research
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* 1. AI AGENTS SECTION */}
        {(activeCategory === "ALL" || activeCategory === "AI") && filteredAI.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">AI Agents Rental (Оренда AI-агентів)</h3>
                <p className="text-xs text-gray-500">Оренда децентралізованих обчислювальних моделей для досліджень</p>
              </div>
            </div>

            <div className="space-y-4">
              {filteredAI.map(agent => (
                <div key={agent.id} className="p-5 border border-gray-100 rounded-2xl hover:border-green-500/30 hover:bg-green-50/10 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-gray-900">{agent.name}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                        {agent.type}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${agent.status === 'ONLINE' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${agent.status === 'ONLINE' ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`} />
                        {agent.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{agent.desc}</p>
                  </div>

                  <div className="flex flex-col md:items-end gap-2 shrink-0 w-full md:w-auto">
                    <div className="text-sm text-gray-500 font-medium">
                      Ціна: <span className="font-bold text-gray-900 text-base">{agent.priceUSDC} USDC</span> / година
                    </div>
                    <div className="text-xs text-green-600 font-bold flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5" /> або {agent.priceLVEX} LVEX (-10%)
                    </div>
                    <button
                      onClick={() => setRentAgent(agent)}
                      className="btn-primary py-2 px-6 text-xs w-full md:w-auto mt-2 cursor-pointer"
                    >
                      Hire Agent
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. LAB CAPACITIES / LaaS SECTION */}
        {(activeCategory === "ALL" || activeCategory === "LAAS") && filteredLabs.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                <FlaskConical className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Lab-as-a-Service (LaaS - Оренда обладнання)</h3>
                <p className="text-xs text-gray-500">Бронювання фізичних випробувальних стендів із віддаленим інтерфейсом</p>
              </div>
            </div>

            <div className="space-y-4">
              {filteredLabs.map(lab => (
                <div key={lab.id} className="p-5 border border-gray-100 rounded-2xl hover:border-blue-500/30 hover:bg-blue-50/10 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="space-y-3 max-w-xl">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-gray-900">{lab.name}</h4>
                      </div>
                      <div className="text-xs text-gray-400 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" /> {lab.location}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{lab.desc}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {lab.specs.map((spec, i) => (
                        <span key={i} className="text-[10px] bg-gray-50 border border-gray-100 text-gray-500 px-2 py-0.5 rounded">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col md:items-end gap-2 shrink-0 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0">
                    <div className="text-sm text-gray-500 font-medium">
                      Ціна: <span className="font-bold text-gray-900 text-base">{lab.priceUSDC} USDC</span> / день
                    </div>
                    <div className="text-xs text-gray-400">Включає автоматичний звіт Vexy AI</div>
                    <button
                      onClick={() => setBookLab(lab)}
                      className="py-2.5 px-6 bg-gray-900 text-white rounded-xl font-bold text-xs hover:bg-gray-800 transition-colors w-full md:w-auto mt-2 cursor-pointer"
                    >
                      Book Slot
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. PHYSICAL GOODS & EQUIPMENT SECTION */}
        {(activeCategory === "ALL" || activeCategory === "GOODS") && filteredProducts.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500">
                <Hammer className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Equipment & Materials (Товари та Обладнання)</h3>
                <p className="text-xs text-gray-500">Замовлення фізичних зразків, надпровідників та компонентів</p>
              </div>
            </div>

            <div className="space-y-4">
              {filteredProducts.map(product => (
                <div key={product.id} className="p-5 border border-gray-100 rounded-2xl hover:border-amber-500/30 hover:bg-amber-50/10 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1.5 max-w-xl">
                    <h4 className="font-bold text-gray-900">{product.name}</h4>
                    <p className="text-sm text-gray-600">{product.desc}</p>
                    <div className="text-xs text-amber-600 font-semibold flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5" /> Доставка по всьому світу &bull; <span className="text-gray-400 font-normal">{product.stock}</span>
                    </div>
                  </div>

                  <div className="flex flex-col md:items-end gap-2 shrink-0 w-full md:w-auto">
                    <div className="text-sm text-gray-500 font-medium">
                      Ціна: <span className="font-bold text-gray-900 text-base">{product.priceUSDC} USDC</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      або <span className="font-bold text-gray-950">{product.priceSOL} SOL</span>
                    </div>
                    <button
                      onClick={() => setBuyProduct(product)}
                      className="py-2.5 px-6 bg-amber-500 text-white rounded-xl font-bold text-xs hover:bg-amber-600 shadow-sm hover:shadow transition-all w-full md:w-auto mt-2 cursor-pointer"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: AI AGENT RENTAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {rentAgent && (
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
              className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="bg-gray-50 border-b border-gray-100 p-6 flex justify-between items-center">
                <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-green-600" />
                  Hire AI Agent
                </h3>
                <button 
                  onClick={() => { setRentAgent(null); setRentTxState("IDLE"); setApiKey(""); }} 
                  className="text-gray-400 hover:text-gray-700 bg-white border border-gray-100 w-8 h-8 rounded-full flex items-center justify-center shadow-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="p-6">
                {rentTxState === "IDLE" && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-bold text-gray-900 text-base">{rentAgent.name}</h4>
                      <p className="text-sm text-gray-500 mt-1">{rentAgent.desc}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Duration (Hours)</label>
                        <input
                          type="number"
                          min="1"
                          max="720"
                          value={rentDuration}
                          onChange={(e) => setRentDuration(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Currency</label>
                        <div className="grid grid-cols-2 gap-1 bg-gray-100 p-1 rounded-xl">
                          <button 
                            onClick={() => setRentCurrency("USDC")}
                            className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${rentCurrency === 'USDC' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
                          >
                            USDC
                          </button>
                          <button 
                            onClick={() => setRentCurrency("LVEX")}
                            className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${rentCurrency === 'LVEX' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
                          >
                            LVEX
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-4 flex justify-between items-center text-sm font-semibold">
                      <span className="text-gray-500">Загальна вартість:</span>
                      <span className="text-gray-900 text-lg">
                        {rentCurrency === "USDC" 
                          ? `${rentAgent.priceUSDC * rentDuration} USDC` 
                          : `${rentAgent.priceLVEX * rentDuration} LVEX`}
                      </span>
                    </div>

                    <button 
                      onClick={handleRentAgent}
                      className="w-full btn-primary py-3 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      Provision Sandbox <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {rentTxState === "PROVISIONING" && (
                  <div className="py-8 text-center space-y-4 font-mono text-xs text-green-700 bg-green-50 rounded-xl border border-green-100 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Terminal className="w-4 h-4 animate-pulse" />
                      <strong>DOCKER ORCHESTRATION</strong>
                    </div>
                    <div className="space-y-1.5 text-left max-h-[140px] overflow-y-auto">
                      {terminalLogs.map((log, i) => (
                        <div key={i}>{log}</div>
                      ))}
                    </div>
                  </div>
                )}

                {rentTxState === "TERMINAL" && (
                  <div className="py-8 text-center space-y-4 font-mono text-xs text-green-700 bg-green-50 rounded-xl border border-green-100 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Terminal className="w-4 h-4 animate-pulse" />
                      <strong>SIGN TRANSACTION</strong>
                    </div>
                    <div className="space-y-1.5 text-left max-h-[140px] overflow-y-auto">
                      {terminalLogs.map((log, i) => (
                        <div key={i}>{log}</div>
                      ))}
                    </div>
                    <button 
                      onClick={handleRentAgent}
                      className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-xs shadow-md cursor-pointer"
                    >
                      Confirm Signature
                    </button>
                  </div>
                )}

                {rentTxState === "SUCCESS" && (
                  <div className="space-y-6 text-center animate-in zoom-in duration-300">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto text-white shadow-lg">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900">Sandbox Deployed Successfully!</h4>
                      <p className="text-xs text-gray-500 mt-2">
                        Ваш індивідуальний API-ключ для доступу до {rentAgent.name}:
                      </p>
                      <div className="mt-3 p-3 bg-gray-50 border border-gray-100 rounded-xl font-mono text-xs select-all text-gray-700 break-all">
                        {apiKey}
                      </div>
                    </div>
                    <button 
                      onClick={() => { setRentAgent(null); setRentTxState("IDLE"); setApiKey(""); }}
                      className="w-full py-2.5 bg-gray-950 hover:bg-black text-white font-bold text-xs rounded-xl shadow cursor-pointer"
                    >
                      Workspace Ready
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL 2: LAB BOOKING */}
      <AnimatePresence>
        {bookLab && (
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
              className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="bg-gray-50 border-b border-gray-100 p-6 flex justify-between items-center">
                <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                  <FlaskConical className="w-5 h-5 text-blue-600" />
                  Book Lab Capacity
                </h3>
                <button 
                  onClick={() => { setBookLab(null); setBookTxState("IDLE"); }} 
                  className="text-gray-400 hover:text-gray-700 bg-white border border-gray-100 w-8 h-8 rounded-full flex items-center justify-center shadow-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="p-6">
                {bookTxState === "IDLE" && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-bold text-gray-900 text-base">{bookLab.name}</h4>
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5" /> {bookLab.location}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Target Date</label>
                        <input
                          type="date"
                          value={bookDate}
                          onChange={(e) => setBookDate(e.target.value)}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-gray-905 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Days / Slots</label>
                        <input
                          type="number"
                          min="1"
                          max="30"
                          value={bookDays}
                          onChange={(e) => setBookDays(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-gray-905 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-4 flex justify-between items-center text-sm font-semibold">
                      <span className="text-gray-500">Загальна вартість:</span>
                      <span className="text-gray-900 text-lg">
                        {bookLab.priceUSDC * bookDays} USDC
                      </span>
                    </div>

                    <button 
                      disabled={!bookDate}
                      onClick={handleBookLab}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Book Hardware Slot
                    </button>
                  </div>
                )}

                {bookTxState === "PROCESSING" && (
                  <div className="py-12 text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                    <h4 className="font-bold text-gray-900 text-base">Booking slots in Laboratory ledger...</h4>
                    <p className="text-xs text-gray-500 font-mono">Simulating decentralized hardware scheduling</p>
                  </div>
                )}

                {bookTxState === "SUCCESS" && (
                  <div className="space-y-6 text-center animate-in zoom-in duration-300">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto text-white shadow-lg">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900">Lab Capacity Booked!</h4>
                      <p className="text-xs text-gray-500 mt-2">
                        Ваш запит на оренду {bookDays} днів у {bookLab.name} схвалено.
                        Перейдіть у розділ **My Labs** для налаштування API.
                      </p>
                    </div>
                    <button 
                      onClick={() => { setBookLab(null); setBookTxState("IDLE"); setBookDate(""); }}
                      className="w-full py-2.5 bg-gray-950 hover:bg-black text-white font-bold text-xs rounded-xl shadow cursor-pointer"
                    >
                      Confirm Booking
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL 3: PRODUCT BUYING */}
      <AnimatePresence>
        {buyProduct && (
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
              className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="bg-gray-50 border-b border-gray-100 p-6 flex justify-between items-center">
                <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                  <Hammer className="w-5 h-5 text-amber-500" />
                  Order Material ZK-1
                </h3>
                <button 
                  onClick={() => { setBuyProduct(null); setBuyTxState("IDLE"); setShippingAddress(""); }} 
                  className="text-gray-400 hover:text-gray-700 bg-white border border-gray-100 w-8 h-8 rounded-full flex items-center justify-center shadow-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="p-6">
                {buyTxState === "IDLE" && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-bold text-gray-900 text-base">{buyProduct.name}</h4>
                      <p className="text-xs text-gray-500 mt-1">{buyProduct.desc}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Quantity</label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={buyQty}
                          onChange={(e) => setBuyQty(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-gray-905 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Currency</label>
                        <div className="grid grid-cols-2 gap-1 bg-gray-100 p-1 rounded-xl">
                          <button 
                            onClick={() => setBuyCurrency("USDC")}
                            className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${buyCurrency === 'USDC' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
                          >
                            USDC
                          </button>
                          <button 
                            onClick={() => setBuyCurrency("SOL")}
                            className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${buyCurrency === 'SOL' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
                          >
                            SOL
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Shipping Address</label>
                      <input
                        type="text"
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        placeholder="Street, City, Zip, Country"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-gray-905 focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-sm"
                      />
                    </div>

                    <div className="border-t border-gray-100 pt-4 flex justify-between items-center text-sm font-semibold">
                      <span className="text-gray-500">Загальна вартість:</span>
                      <span className="text-gray-900 text-lg">
                        {buyCurrency === "USDC" 
                          ? `${buyProduct.priceUSDC * buyQty} USDC` 
                          : `${(buyProduct.priceSOL * buyQty).toFixed(2)} SOL`}
                      </span>
                    </div>

                    <button 
                      disabled={!shippingAddress}
                      onClick={handleBuyProduct}
                      className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Sign Web3 Transaction
                    </button>
                  </div>
                )}

                {buyTxState === "SIGNING" && (
                  <div className="py-12 text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-gray-200 border-t-amber-500 rounded-full animate-spin mx-auto"></div>
                    <h4 className="font-bold text-gray-900 text-base">Requesting Wallet Signature...</h4>
                    <p className="text-xs text-gray-500 font-mono">Sign the smart contract call to proceed</p>
                  </div>
                )}

                {buyTxState === "CONFIRMING" && (
                  <div className="py-12 text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-gray-200 border-t-amber-500 rounded-full animate-spin mx-auto"></div>
                    <h4 className="font-bold text-gray-900 text-base">Waiting for Solana Block confirmation...</h4>
                    <p className="text-xs text-gray-500 font-mono">Updating R&D logistics ledger</p>
                  </div>
                )}

                {buyTxState === "SUCCESS" && (
                  <div className="space-y-6 text-center animate-in zoom-in duration-300">
                    <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mx-auto text-white shadow-lg">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900">Transaction Confirmed!</h4>
                      <p className="text-xs text-gray-500 mt-2">
                        Вашу транзакцію на {buyCurrency === "USDC" ? `${buyProduct.priceUSDC * buyQty} USDC` : `${(buyProduct.priceSOL * buyQty).toFixed(2)} SOL`} успішно проведено.
                        Очікуйте на доставку за адресою: <strong className="text-gray-900">{shippingAddress}</strong>.
                      </p>
                    </div>
                    <button 
                      onClick={() => { setBuyProduct(null); setBuyTxState("IDLE"); setShippingAddress(""); }}
                      className="w-full py-2.5 bg-gray-950 hover:bg-black text-white font-bold text-xs rounded-xl shadow cursor-pointer"
                    >
                      Awesome
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SUBMIT OFFER MODAL */}
      <AnimatePresence>
        {showSubmitModal && (
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
                  <Store className="w-5 h-5 text-green-600" />
                  Створити пропозицію на ринок
                </h3>
                <button 
                  onClick={() => setShowSubmitModal(false)} 
                  className="text-gray-400 hover:text-gray-700 bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmitOffer} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Назва послуги / товару</label>
                  <input
                    type="text"
                    value={submitName}
                    onChange={(e) => setSubmitName(e.target.value)}
                    placeholder="e.g. Next-Gen Gene Sequencing"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-955 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Опис пропозиції</label>
                  <textarea
                    value={submitDesc}
                    onChange={(e) => setSubmitDesc(e.target.value)}
                    placeholder="Опишіть ваші можливості, специфікації чи умови..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-955 focus:outline-none focus:ring-2 focus:ring-green-500/20 resize-none"
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Ціна (USDC)</label>
                    <input
                      type="number"
                      value={submitPriceUSDC}
                      onChange={(e) => setSubmitPriceUSDC(e.target.value)}
                      placeholder="e.g. 150"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-955 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                      required
                    />
                  </div>

                  {role === "DEVELOPER" && (
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Ціна (LVEX)</label>
                      <input
                        type="number"
                        value={submitPriceLVEX}
                        onChange={(e) => setSubmitPriceLVEX(e.target.value)}
                        placeholder="e.g. 600"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-955 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                      />
                    </div>
                  )}

                  {role === "LABORATORY" && (
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Локація</label>
                      <input
                        type="text"
                        value={submitLocation}
                        onChange={(e) => setSubmitLocation(e.target.value)}
                        placeholder="e.g. Берлін, Німеччина"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-955 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                      />
                    </div>
                  )}

                  {(role === "COMPANY" || role === "VERIFIED_PHYSICIST" || role === "NOBEL_LAUREATE") && (
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Ціна (SOL)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={submitPriceSOL}
                        onChange={(e) => setSubmitPriceSOL(e.target.value)}
                        placeholder="e.g. 1.2"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-955 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                      />
                    </div>
                  )}
                </div>

                {role === "DEVELOPER" && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Категорія AI-агента</label>
                    <input
                      type="text"
                      value={submitAgentType}
                      onChange={(e) => setSubmitAgentType(e.target.value)}
                      placeholder="e.g. Data Analysis, Compliance"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-955 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                    />
                  </div>
                )}

                {role === "LABORATORY" && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Характеристики (Specs через кому)</label>
                    <input
                      type="text"
                      value={submitSpecs}
                      onChange={(e) => setSubmitSpecs(e.target.value)}
                      placeholder="e.g. He-4 Cooling, remote control"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-955 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                    />
                  </div>
                )}

                {(role === "COMPANY" || role === "VERIFIED_PHYSICIST" || role === "NOBEL_LAUREATE") && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Стан наявності</label>
                    <input
                      type="text"
                      value={submitStock}
                      onChange={(e) => setSubmitStock(e.target.value)}
                      placeholder="e.g. 5 одиниць в наявності"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-955 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 flex items-center justify-center gap-2 text-sm font-semibold shadow hover:shadow-md transition-all bg-gray-950 text-white hover:bg-black rounded-xl mt-4 cursor-pointer"
                >
                  <Send className="w-4 h-4" /> Надіслати на модерацію
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
