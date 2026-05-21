"use client";

import { MissionCard } from "@/components/missions/MissionCard";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, ShieldAlert, UploadCloud, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";

export default function MissionsPage() {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [missionOpen, setMissionOpen] = useState(false);
  const [uploadState, setUploadState] = useState<"IDLE" | "UPLOADING" | "ANALYZING" | "SUCCESS">("IDLE");
  const [progress, setProgress] = useState(0);

  const simulateUpload = () => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    setUploadState("UPLOADING");
    setProgress(0);
    
    // Simulate Upload
    const uploadInterval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(uploadInterval);
          setUploadState("ANALYZING");
          simulateAnalysis();
          return 100;
        }
        return p + 20;
      });
    }, 50);
  };

  const simulateAnalysis = () => {
    // Simulate Vexy AI Analysis
    setTimeout(() => {
      setUploadState("SUCCESS");
    }, 500);
  };

  return (
    <section className="space-y-6">
      <div className="flex justify-between items-end border-b border-gray-200 pb-2">
        <h2 className="text-xl font-bold text-gray-900">
          Citizen Science Missions
        </h2>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-200">Data Analysis</span>
          <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full border border-gray-200 hover:bg-gray-200 cursor-pointer">Hardware</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <MissionCard 
          title="The Biefeld-Brown Anomaly Hunt"
          description="Analyze 10,000 rows of telemetry to find micro-weight drops correlating with voltage spikes."
          reward={50}
          onClick={() => setMissionOpen(true)}
        />

        <MissionCard 
          title="Gravimeter Noise Filtration"
          description="Write a Python script to filter out seismic noise from YBCO superconductor test data."
          reward={120}
          onClick={() => {}}
        />
      </div>

      {/* Mission Modal */}
      <AnimatePresence>
        {missionOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4 md:p-8"
          >
            <motion.div 
              initial={{ scale: 0.98, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.98, opacity: 0, y: 10 }}
              className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="bg-gray-50 border-b border-gray-100 p-6 flex justify-between items-center relative">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                    <Terminal className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900">Mission: Anomaly Hunt</h2>
                    <p className="text-sm text-gray-500">Analyze raw telemetry data</p>
                  </div>
                </div>
                <button onClick={() => { setMissionOpen(false); setUploadState("IDLE"); }} className="text-gray-400 hover:text-gray-700 bg-white shadow-sm border border-gray-100 rounded-full w-8 h-8 flex items-center justify-center">✕</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-8 overflow-y-auto">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">Dataset Overview</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    10,000 samples at 100Hz. Columns: <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-800">timestamp</code>, <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-800">voltage_kV</code>, <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-800">current_uA</code>, <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-800">weight_mg</code>.
                  </p>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 font-mono text-xs text-gray-500 h-48 overflow-y-auto mb-4">
                    <div>1678234.001, 39.8, 12.1, 1500.0</div>
                    <div>1678234.011, 40.1, 14.5, 1499.8</div>
                    <div className="text-green-600 font-bold bg-green-50">1678234.021, 42.5, 18.0, 1492.1 &lt;- ANOMALY?</div>
                    <div>1678234.031, 40.0, 13.2, 1499.9</div>
                    <div>...</div>
                  </div>
                  <button className="w-full py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                    Download Dataset CSV
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-5">
                    <h4 className="font-semibold text-gray-900 mb-3">Submit Findings</h4>
                    
                    {uploadState === "IDLE" && (
                      <>
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 hover:border-green-400 transition-colors cursor-pointer mb-4" onClick={simulateUpload}>
                          <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                          <p className="text-sm font-medium text-gray-700 mb-1">Click to upload your script/results</p>
                          <p className="text-xs text-gray-500">CSV, PY, or IPYNB (Max 10MB)</p>
                        </div>
                        <button 
                          onClick={simulateUpload}
                          className="w-full py-2.5 bg-green-500 text-white rounded-xl font-bold shadow-md hover:bg-green-600 hover:shadow-lg transition-all"
                        >
                          {isAuthenticated ? "Submit Analysis" : "Sign In to Submit"}
                        </button>
                      </>
                    )}

                    {uploadState === "UPLOADING" && (
                      <div className="py-8 text-center">
                        <p className="text-sm font-bold text-gray-900 mb-2">Uploading...</p>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-green-500 h-2.5 rounded-full transition-all duration-200" style={{ width: `${progress}%` }}></div>
                        </div>
                      </div>
                    )}

                    {uploadState === "ANALYZING" && (
                      <div className="py-8 text-center font-mono">
                        <Terminal className="w-6 h-6 text-green-500 mx-auto mb-4 animate-pulse" />
                        <p className="text-sm font-bold text-gray-900 mb-1">Vexy AI is analyzing your code</p>
                        <p className="text-xs text-gray-500">&gt; running reproducibility checks...</p>
                      </div>
                    )}

                    {uploadState === "SUCCESS" && (
                      <div className="py-8 text-center animate-in zoom-in duration-300">
                        <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                        <p className="text-lg font-bold text-gray-900 mb-1">Analysis Verified!</p>
                        <p className="text-sm text-gray-600 mb-4">Your timestamp matches the consensus.</p>
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 text-yellow-800 font-bold rounded-xl shadow-sm">
                          +50 REP Earned
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800 leading-relaxed">
                      <strong>Peer Consensus Required:</strong> You will receive 50 REP only if your timestamp matches the consensus of other Citizen Explorers. Avoid random guessing to protect your trust score.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
