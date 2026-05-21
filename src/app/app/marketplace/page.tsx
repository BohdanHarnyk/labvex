"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Store, Cpu, FlaskConical, Hammer, Search, Calendar, 
  DollarSign, Coins, ShieldCheck, Terminal, ArrowRight, 
  Clock, MapPin, Truck, Settings, Sparkles, CheckCircle2 
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

export default function MarketplacePage() {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [activeCategory, setActiveCategory] = useState<"ALL" | "AI" | "LAAS" | "GOODS">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

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

  // Mock data
  const aiAgents: AIAgent[] = [
    {
      id: "ai-1",
      name: "Quantum Simulator v4",
      desc: "Високошвидкісний емулятор гамільтоніанів для симуляції кубітів та квантового відпалу на 128 кубітах.",
      priceUSDC: 10,
      priceLVEX: 45, // ~10% discount
      type: "Quantum Computing",
      status: "ONLINE"
    },
    {
      id: "ai-2",
      name: "Vexy Auditor Pro",
      desc: "Шор-2 AI-агент для аудиту великих наборів наукових даних, автоматичного виявлення аномалій та шумів.",
      priceUSDC: 25,
      priceLVEX: 110,
      type: "Data Auditing",
      status: "ONLINE"
    },
    {
      id: "ai-3",
      name: "ChemSynth Planner",
      desc: "ШІ-модель для передбачення шляхів реакцій та оптимізації кристалізації нових надпровідників.",
      priceUSDC: 15,
      priceLVEX: 65,
      type: "Material Science",
      status: "BUSY"
    }
  ];

  const labs: LabCapacity[] = [
    {
      id: "lab-1",
      name: "Cryogenic Superconductor Rig (Gen-2)",
      location: "Мюнхен, Німеччина",
      desc: "Повністю автоматизована установка для тестування критичної температури надпровідників (від 4K до 300K). Інтегрований SQUID-сенсор.",
      priceUSDC: 250,
      specs: ["He-4 Closed Loop Cooling", "SQUID Magnetometer", "10Tesla Superconducting Magnet"]
    },
    {
      id: "lab-2",
      name: "High-Vacuum Chamber Array (10^-8 Torr)",
      location: "Цюрих, Швейцарія",
      desc: "Вакуумний стенд для тестування безпаливних асиметричних конденсаторів та мікро-двигунів у безповітряному просторі.",
      priceUSDC: 180,
      specs: ["Turbomolecular Pumps", "Torsional Micro-Thrust Balance", "RGA Gas Analyzer"]
    },
    {
      id: "lab-3",
      name: "MeV Scanning Electron Microscope",
      location: "Токіо, Японія",
      desc: "Сканувальний електронний мікроскоп високої роздільної здатності з можливістю віддаленого керування та спектроскопією EDX.",
      priceUSDC: 400,
      specs: ["Sub-nanometer resolution", "Remote API Access", "In-situ Heating Stage"]
    }
  ];

  const products: PhysicalProduct[] = [
    {
      id: "prod-1",
      name: "YBCO Superconductor Disk (90mm)",
      desc: "Диск високотемпературного ітрій-барій-мідного надпровідника для дослідження ефектів гравітаційного екранування.",
      priceUSDC: 350,
      priceSOL: 2.5,
      stock: "5 одиниць в наявності"
    },
    {
      id: "prod-2",
      name: "Asymmetric Capacitor Plate Set",
      desc: "Спеціально розроблений комплект асиметричних алюмінієвих пластин для відтворення ефекту Біфельда-Брауна в домашніх лабораторіях.",
      priceUSDC: 120,
      priceSOL: 0.85,
      stock: "12 одиниць в наявності"
    },
    {
      id: "prod-3",
      name: "Graphene Monolayer Sheets (10pcs)",
      desc: "Набір монокристалічних листів графену на мідній підкладці розміром 10x10мм для провідникових експериментів.",
      priceUSDC: 95,
      priceSOL: 0.68,
      stock: "В наявності"
    }
  ];

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

  return (
    <section className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-gray-200 pb-4 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Store className="w-6 h-6 text-green-600" />
            Global Science Marketplace
          </h2>
          <p className="text-sm text-gray-500">
            Оренда суверенних AI-агентів, лабораторного обладнання LaaS та придбання експериментальних матеріалів.
          </p>
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
      <div className="flex gap-2 p-1 bg-gray-100 rounded-xl max-w-md">
        {(["ALL", "AI", "LAAS", "GOODS"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveCategory(tab)}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${activeCategory === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
          >
            {tab === "ALL" && "All items"}
            {tab === "AI" && "AI Agents"}
            {tab === "LAAS" && "Lab Capacities"}
            {tab === "GOODS" && "Products"}
          </button>
        ))}
      </div>

      {/* Main Blocks Layout */}
      <div className="space-y-10">
        
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
                      className="btn-primary py-2 px-6 text-xs w-full md:w-auto mt-2"
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
                      className="py-2.5 px-6 bg-gray-900 text-white rounded-xl font-bold text-xs hover:bg-gray-800 transition-colors w-full md:w-auto mt-2"
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
                      або <span className="font-bold text-gray-900">{product.priceSOL} SOL</span>
                    </div>
                    <button
                      onClick={() => setBuyProduct(product)}
                      className="py-2.5 px-6 bg-amber-500 text-white rounded-xl font-bold text-xs hover:bg-amber-600 shadow-sm hover:shadow transition-all w-full md:w-auto mt-2"
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
                  className="text-gray-400 hover:text-gray-700 bg-white border border-gray-100 w-8 h-8 rounded-full flex items-center justify-center shadow-sm"
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
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Payment Currency</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => setRentCurrency("USDC")}
                            className={`py-2 text-xs font-bold border rounded-lg transition-colors ${rentCurrency === 'USDC' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
                          >
                            USDC
                          </button>
                          <button
                            onClick={() => setRentCurrency("LVEX")}
                            className={`py-2 text-xs font-bold border rounded-lg transition-colors ${rentCurrency === 'LVEX' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
                          >
                            LVEX
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex justify-between items-center">
                      <span className="text-sm font-semibold text-green-800">Total Price:</span>
                      <span className="text-lg font-bold text-green-700">
                        {rentCurrency === "USDC" 
                          ? `${rentAgent.priceUSDC * rentDuration} USDC` 
                          : `${rentAgent.priceLVEX * rentDuration} LVEX`}
                      </span>
                    </div>

                    <button
                      onClick={handleRentAgent}
                      className="w-full btn-primary py-3.5 flex items-center justify-center gap-2"
                    >
                      {isAuthenticated ? "Sign & Start Rental" : "Connect Wallet to Hire"}
                    </button>
                  </div>
                )}

                {rentTxState === "PROVISIONING" && (
                  <div className="py-12 text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-gray-200 border-t-green-500 rounded-full animate-spin mx-auto"></div>
                    <h4 className="font-bold text-gray-900 text-lg">Initializing Agent Environment...</h4>
                    <p className="text-xs text-gray-500">Contacting sovereign validator node...</p>
                  </div>
                )}

                {rentTxState === "TERMINAL" && (
                  <div className="bg-gray-950 border border-gray-800 p-6 rounded-xl font-mono text-sm text-green-400 min-h-[220px] flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-green-500 border-b border-gray-900 pb-2 mb-2">
                        <Terminal className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">LABVEX Orchestrator v1</span>
                      </div>
                      {terminalLogs.map((log, idx) => (
                        <div key={idx} className="text-xs leading-relaxed animate-in fade-in-20 duration-300">
                          {log}
                        </div>
                      ))}
                    </div>
                    <div className="w-12 h-3 bg-green-500 animate-pulse rounded-sm mt-4" />
                  </div>
                )}

                {rentTxState === "SUCCESS" && (
                  <div className="space-y-6 text-center animate-in zoom-in duration-300 py-4">
                    <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
                    <div>
                      <h4 className="text-2xl font-bold text-gray-900">AI Agent Provisioned!</h4>
                      <p className="text-sm text-gray-500 mt-1">Виділено безпечну ізольовану пісочницю.</p>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-left font-mono">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Your API Key (Do not share):</label>
                      <div className="text-xs text-gray-800 font-bold bg-white p-2.5 border border-gray-100 rounded break-all select-all">
                        {apiKey}
                      </div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mt-3 mb-1">Host Endpoint:</label>
                      <div className="text-xs text-gray-500">
                        https://api.labvex.org/v1/agents/{rentAgent.id}/run
                      </div>
                    </div>

                    <button
                      onClick={() => { setRentAgent(null); setRentTxState("IDLE"); setApiKey(""); }}
                      className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors"
                    >
                      Open API Console
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 2: LaaS BOOKING */}
      {/* ========================================================================= */}
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
              className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="bg-gray-50 border-b border-gray-100 p-6 flex justify-between items-center">
                <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                  <FlaskConical className="w-5 h-5 text-blue-600" />
                  Book Lab Capacity (LaaS)
                </h3>
                <button 
                  onClick={() => { setBookLab(null); setBookTxState("IDLE"); setBookDate(""); }} 
                  className="text-gray-400 hover:text-gray-700 bg-white border border-gray-100 w-8 h-8 rounded-full flex items-center justify-center shadow-sm"
                >
                  ✕
                </button>
              </div>

              <div className="p-6">
                {bookTxState === "IDLE" && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-bold text-gray-900 text-base">{bookLab.name}</h4>
                      <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" /> {bookLab.location}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Start Date</label>
                        <input
                          type="date"
                          value={bookDate}
                          onChange={(e) => setBookDate(e.target.value)}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Duration (Days)</label>
                        <input
                          type="number"
                          min="1"
                          max="30"
                          value={bookDays}
                          onChange={(e) => setBookDays(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex justify-between items-center">
                      <span className="text-sm font-semibold text-blue-800">Total Booking Price:</span>
                      <span className="text-lg font-bold text-blue-700">
                        {bookLab.priceUSDC * bookDays} USDC
                      </span>
                    </div>

                    <button
                      disabled={isAuthenticated && !bookDate}
                      onClick={handleBookLab}
                      className="w-full py-3.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isAuthenticated ? "Book & Sign Reservation" : "Connect Wallet to Book"}
                    </button>
                  </div>
                )}

                {bookTxState === "PROCESSING" && (
                  <div className="py-12 text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
                    <h4 className="font-bold text-gray-900 text-lg">Creating Smart Contract Lease...</h4>
                    <p className="text-xs text-gray-500">Checking slot availability & reserving hardware...</p>
                  </div>
                )}

                {bookTxState === "SUCCESS" && (
                  <div className="space-y-6 text-center animate-in zoom-in duration-300 py-4">
                    <CheckCircle2 className="w-16 h-16 text-blue-500 mx-auto" />
                    <div>
                      <h4 className="text-2xl font-bold text-gray-900">Lab Capacity Booked!</h4>
                      <p className="text-sm text-gray-500 mt-1">Оренду обладнання успішно зафіксовано на блокчейні.</p>
                    </div>

                    <div className="bg-blue-50 border border-blue-100 p-5 rounded-xl text-left space-y-3">
                      <div className="flex justify-between border-b border-blue-200/50 pb-2">
                        <span className="text-xs font-medium text-blue-800">Установка:</span>
                        <span className="text-xs font-bold text-blue-900">{bookLab.name}</span>
                      </div>
                      <div className="flex justify-between border-b border-blue-200/50 pb-2">
                        <span className="text-xs font-medium text-blue-800">Дата початку:</span>
                        <span className="text-xs font-bold text-blue-900">{bookDate}</span>
                      </div>
                      <div className="flex justify-between border-b border-blue-200/50 pb-2">
                        <span className="text-xs font-medium text-blue-800">Тривалість:</span>
                        <span className="text-xs font-bold text-blue-900">{bookDays} дн.</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs font-medium text-blue-800">Статус оренди:</span>
                        <span className="text-xs font-bold text-green-700 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" /> Підтверджено (Leased)
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => { setBookLab(null); setBookTxState("IDLE"); setBookDate(""); }}
                      className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors"
                    >
                      Go to My Bookings
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 3: GOODS PURCHASE */}
      {/* ========================================================================= */}
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
              className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="bg-gray-50 border-b border-gray-100 p-6 flex justify-between items-center">
                <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                  <Hammer className="w-5 h-5 text-amber-500" />
                  Order Materials
                </h3>
                <button 
                  onClick={() => { setBuyProduct(null); setBuyTxState("IDLE"); setShippingAddress(""); }} 
                  className="text-gray-400 hover:text-gray-700 bg-white border border-gray-100 w-8 h-8 rounded-full flex items-center justify-center shadow-sm"
                >
                  ✕
                </button>
              </div>

              <div className="p-6">
                {buyTxState === "IDLE" && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-bold text-gray-900 text-base">{buyProduct.name}</h4>
                      <p className="text-sm text-gray-500 mt-1">{buyProduct.desc}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Quantity</label>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={buyQty}
                          onChange={(e) => setBuyQty(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Select Token</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => setBuyCurrency("USDC")}
                            className={`py-2 text-xs font-bold border rounded-lg transition-colors ${buyCurrency === 'USDC' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
                          >
                            USDC
                          </button>
                          <button
                            onClick={() => setBuyCurrency("SOL")}
                            className={`py-2 text-xs font-bold border rounded-lg transition-colors ${buyCurrency === 'SOL' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
                          >
                            SOL
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Shipping Address</label>
                      <textarea
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        placeholder="вул. Наукова, 12, Київ, Україна, 01001"
                        rows={2}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-sm"
                      />
                    </div>

                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex justify-between items-center">
                      <span className="text-sm font-semibold text-amber-800">Total Price:</span>
                      <span className="text-lg font-bold text-amber-700">
                        {buyCurrency === "USDC" 
                          ? `${buyProduct.priceUSDC * buyQty} USDC` 
                          : `${(buyProduct.priceSOL * buyQty).toFixed(2)} SOL`}
                      </span>
                    </div>

                    <button
                      disabled={isAuthenticated && !shippingAddress}
                      onClick={handleBuyProduct}
                      className="w-full py-3.5 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
                    >
                      {isAuthenticated ? "Sign & Pay on Solana" : "Connect Wallet to Purchase"}
                    </button>
                  </div>
                )}

                {buyTxState === "SIGNING" && (
                  <div className="py-12 text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-gray-200 border-t-amber-500 rounded-full animate-spin mx-auto"></div>
                    <h4 className="font-bold text-gray-900 text-lg">Awaiting Wallet Signature...</h4>
                    <p className="text-xs text-gray-500">Please sign the transaction in your Phantom/Solflare extension...</p>
                  </div>
                )}

                {buyTxState === "CONFIRMING" && (
                  <div className="py-12 text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-gray-200 border-t-amber-500 rounded-full animate-spin mx-auto"></div>
                    <h4 className="font-bold text-gray-900 text-lg">Broadcasting Transaction...</h4>
                    <p className="text-xs text-gray-500">Solana cluster confirmation in progress...</p>
                  </div>
                )}

                {buyTxState === "SUCCESS" && (
                  <div className="space-y-6 text-center animate-in zoom-in duration-300 py-4">
                    <CheckCircle2 className="w-16 h-16 text-amber-500 mx-auto" />
                    <div>
                      <h4 className="text-2xl font-bold text-gray-900">Purchase Confirmed!</h4>
                      <p className="text-sm text-gray-500 mt-1">Оплату успішно підтверджено в блокчейні.</p>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-left space-y-2">
                      <div className="flex justify-between border-b border-gray-100 pb-1.5">
                        <span className="text-xs text-gray-500">Товар:</span>
                        <span className="text-xs font-bold text-gray-800">{buyProduct.name} (x{buyQty})</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-100 pb-1.5">
                        <span className="text-xs text-gray-500">Доставка:</span>
                        <span className="text-xs font-semibold text-gray-700 truncate max-w-[200px]">{shippingAddress}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-500">Tx Hash:</span>
                        <span className="text-xs font-mono text-amber-600">5fT9Z2...p9s7</span>
                      </div>
                    </div>

                    <button
                      onClick={() => { setBuyProduct(null); setBuyTxState("IDLE"); setShippingAddress(""); }}
                      className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors"
                    >
                      Track Shipment
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
}
