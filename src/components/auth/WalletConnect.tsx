"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal } from "lucide-react";

export function WalletConnect() {
  const { wallet, connect, connecting, connected, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const [showTerminal, setShowTerminal] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);

  useEffect(() => {
    if (connecting) {
      setShowTerminal(true);
      const logs = [
        "Initializing secure connection...",
        "Establishing handshake with Solana cluster...",
        "Verifying ZK-Proof identity signatures...",
        "Decrypting SBT metadata...",
        "ACCESS GRANTED",
      ];
      
      let i = 0;
      setTerminalLogs([logs[0]]);
      const interval = setInterval(() => {
        i++;
        if (i < logs.length) {
          setTerminalLogs((prev) => [...prev, logs[i]]);
        } else {
          clearInterval(interval);
          setTimeout(() => setShowTerminal(false), 200); // Hide after success
        }
      }, 100);
      return () => clearInterval(interval);
    } else if (connected) {
      setShowTerminal(false);
    }
  }, [connecting, connected]);

  if (connected) {
    return (
      <button
        onClick={() => disconnect()}
        className="px-4 py-2 bg-graphite border border-cyan-neon text-cyan-neon font-mono text-sm hover:bg-cyan-neon/10 transition-colors"
      >
        DISCONNECT
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setVisible(true)}
        className="px-6 py-3 bg-graphite border border-blue-electric text-blue-electric font-mono text-lg font-bold hover:bg-blue-electric/10 hover:shadow-[0_0_15px_rgba(10,132,255,0.5)] transition-all uppercase tracking-widest"
      >
        Establish Connection
      </button>

      <AnimatePresence>
        {showTerminal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md"
          >
            <div className="w-full max-w-2xl bg-black border border-cyan-neon p-6 shadow-[0_0_30px_rgba(0,240,255,0.2)]">
              <div className="flex items-center gap-2 mb-4 border-b border-cyan-neon/30 pb-2">
                <Terminal className="text-cyan-neon w-5 h-5" />
                <span className="text-cyan-neon font-mono text-sm">VEXY_OS_TERMINAL_V1.0</span>
              </div>
              <div className="font-mono text-sm text-green-400 space-y-2">
                {terminalLogs.map((log, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    &gt; {log}
                  </motion.div>
                ))}
                {terminalLogs.length < 5 && (
                  <motion.div
                    animate={{ opacity: [1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="w-2 h-4 bg-green-400 inline-block ml-2"
                  />
                )}
              </div>
              
              {terminalLogs.length >= 5 && (
                 <motion.div 
                   initial={{ scaleX: 0 }}
                   animate={{ scaleX: 1 }}
                   transition={{ duration: 0.3 }}
                   className="absolute inset-0 bg-blue-electric mix-blend-overlay pointer-events-none origin-left"
                 />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
