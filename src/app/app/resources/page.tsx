"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, DollarSign, Wallet, ShieldCheck, Coins } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";

export default function ResourceHubPage() {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [fundingOpen, setFundingOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState("USDC");
  const [amount, setAmount] = useState("");
  const [txState, setTxState] = useState<"IDLE" | "SIGNING" | "CONFIRMING" | "SUCCESS">("IDLE");

  const handleFund = () => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    setTxState("SIGNING");
    
    // Simulate wallet signature
    setTimeout(() => {
      setTxState("CONFIRMING");
      // Simulate on-chain confirmation
      setTimeout(() => {
        setTxState("SUCCESS");
      }, 2500);
    }, 1500);
  };

  const calculateIPT = (amt: string, asset: string) => {
    const num = parseFloat(amt) || 0;
    // Mock conversion rates
    let usdcValue = 0;
    if (asset === "USDC" || asset === "USDT") usdcValue = num;
    if (asset === "SOL") usdcValue = num * 140; // mock $140/SOL
    
    // 1 USDC = 10 IPT
    return (usdcValue * 10).toFixed(2);
  };

  return (
    <section className="space-y-6">
      <div className="flex justify-between items-end border-b border-gray-200 pb-2">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Resource Hub & Crowdfunding</h2>
          <p className="text-sm text-gray-500">Invest in active Frontier Physics research.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Campaign Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 text-xs font-bold uppercase tracking-wider rounded-md border border-green-200 mb-3">
                Live Campaign
              </div>
              <h3 className="text-2xl font-bold text-gray-900">EM Drive Vacuum Testing</h3>
              <p className="text-sm text-gray-500 mt-1">Lead Scientist: Dr. V. K. &bull; Verified Physicist</p>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-500 mb-1">Total Raised</div>
              <div className="text-2xl font-bold text-gray-900">4,500 <span className="text-sm text-gray-500 font-medium">USDC</span></div>
              <div className="text-xs text-gray-400 mt-1">Goal: 10,000 USDC</div>
            </div>
          </div>

          <div className="w-full bg-gray-100 rounded-full h-2 mb-6">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: '45%' }}></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Equipment Needed</h4>
              <p className="text-sm font-medium text-gray-900">2.45 GHz Magnetron, Custom Vacuum Chamber</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Expected IP</h4>
              <p className="text-sm font-medium text-gray-900">Thrust Optimization Patent</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Bonus Rewards</h4>
              <p className="text-sm font-medium text-green-600 flex items-center gap-1">
                <Coins className="w-4 h-4" /> 5% LVEX Cashback
              </p>
            </div>
          </div>

          <button 
            onClick={() => setFundingOpen(true)}
            className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold text-lg shadow-md hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
          >
            <DollarSign className="w-5 h-5" /> Invest in this Research
          </button>
        </div>
      </div>

      {/* Funding Modal */}
      <AnimatePresence>
        {fundingOpen && (
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
                <h2 className="font-bold text-gray-900 text-lg">Fund Campaign</h2>
                <button onClick={() => { setFundingOpen(false); setTxState("IDLE"); setAmount(""); }} className="text-gray-400 hover:text-gray-700">✕</button>
              </div>

              <div className="p-6">
                {txState === "IDLE" && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Select Asset</label>
                      <div className="grid grid-cols-3 gap-2">
                        {["USDC", "USDT", "SOL"].map(asset => (
                          <button
                            key={asset}
                            onClick={() => setSelectedAsset(asset)}
                            className={`py-2 rounded-lg text-sm font-bold border transition-colors ${selectedAsset === asset ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
                          >
                            {asset}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="0.00"
                          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-lg font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                        />
                        <div className="absolute right-4 top-3.5 text-gray-400 font-bold">{selectedAsset}</div>
                      </div>
                    </div>

                    <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-green-800">You will receive:</span>
                        <span className="text-lg font-bold text-green-700">{calculateIPT(amount, selectedAsset)} IPT</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-green-600">Bonus Rewards:</span>
                        <span className="text-xs font-bold text-green-700 flex items-center gap-1">
                          <Coins className="w-3 h-3" /> {(parseFloat(calculateIPT(amount, selectedAsset)) * 0.05).toFixed(2)} LVEX
                        </span>
                      </div>
                    </div>

                    <button 
                      disabled={isAuthenticated && !amount}
                      onClick={handleFund}
                      className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold shadow-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Wallet className="w-5 h-5" />
                      {isAuthenticated ? "Sign & Confirm" : "Connect Wallet First"}
                    </button>
                  </div>
                )}

                {txState === "SIGNING" && (
                  <div className="py-12 text-center">
                    <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
                    <h3 className="text-lg font-bold text-gray-900">Please sign in your wallet...</h3>
                  </div>
                )}

                {txState === "CONFIRMING" && (
                  <div className="py-12 text-center">
                    <div className="w-12 h-12 border-4 border-gray-200 border-t-green-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <h3 className="text-lg font-bold text-gray-900">Confirming on Solana...</h3>
                    <p className="text-sm text-gray-500">Broadcasting transaction</p>
                  </div>
                )}

                {txState === "SUCCESS" && (
                  <div className="py-8 text-center animate-in zoom-in duration-300">
                    <ShieldCheck className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Transaction Successful!</h3>
                    <p className="text-gray-600 mb-6">You have successfully backed this research.</p>
                    <div className="bg-gray-50 rounded-xl p-4 text-left font-mono text-xs text-gray-500 break-all border border-gray-200 mb-6">
                      Tx: 4vJ9JU1bJMEvdcgE5aM2gZk...
                    </div>
                    <button 
                      onClick={() => { setFundingOpen(false); setTxState("IDLE"); setAmount(""); }}
                      className="w-full py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50"
                    >
                      Close
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
