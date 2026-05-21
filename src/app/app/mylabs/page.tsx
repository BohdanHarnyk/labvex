"use client";

import { useAuth } from "@/lib/auth/AuthContext";
import { LockKeyhole, Plus, Activity, Rocket, Beaker } from "lucide-react";

export default function MyLabsPage() {
  const { role, isAuthenticated } = useAuth();

  const isScientist = role === "VERIFIED_PHYSICIST" || role === "NOBEL_LAUREATE";

  if (!isAuthenticated || !isScientist) {
    return (
      <section className="flex flex-col items-center justify-center text-center py-20 px-6">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6 border border-gray-200">
          <LockKeyhole className="w-8 h-8 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Restricted</h2>
        <p className="text-gray-600 max-w-md mb-8">
          The <strong>"My Labs"</strong> module is an exclusive environment for managing primary research. 
          You must hold a <strong>Verified Physicist</strong> or <strong>Nobel Laureate</strong> ZK-Passport to create and manage digital laboratories.
        </p>
        <button className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
          Apply for Verification
        </button>
      </section>
    );
  }

  return (
    <section className="space-y-8">
      <div className="flex justify-between items-center border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Digital Labs</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your experiments, datasets, and fundraising.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white font-bold rounded-xl shadow-md hover:bg-green-600 transition-colors">
          <Plus className="w-5 h-5" />
          Create New Lab
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mock Active Lab */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 text-xs font-bold uppercase tracking-wider rounded-md border border-green-200">
              <Activity className="w-3 h-3" /> Active
            </span>
          </div>
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-4 border border-blue-100">
            <Rocket className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">EM Drive Vacuum Testing</h3>
          <p className="text-sm text-gray-600 mb-6 line-clamp-2">
            Testing the thrust output of a truncated copper cone driven by a 2.45 GHz magnetron inside a hard vacuum chamber to eliminate ion wind interference.
          </p>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
                <span>Fundraising Goal (IPT)</span>
                <span className="text-green-600">4,500 / 10,000 USDC</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <span className="text-xs text-gray-500">12 Citizen Volunteers active</span>
              <button className="text-sm font-semibold text-green-600 hover:text-green-700">Manage Hub &rarr;</button>
            </div>
          </div>
        </div>

        {/* Mock Setup Lab */}
        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-2xl p-6 flex flex-col items-center justify-center text-center opacity-70 hover:opacity-100 transition-opacity cursor-pointer">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-gray-400 mb-4 shadow-sm border border-gray-200">
            <Beaker className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-gray-900 mb-1">Draft: Cold Fusion Replica</h3>
          <p className="text-xs text-gray-500">Needs IP Tokenomics setup</p>
        </div>
      </div>
    </section>
  );
}
