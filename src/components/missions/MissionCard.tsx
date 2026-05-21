"use client";

import { useAuth } from "@/lib/auth/AuthContext";
import { Database, ChevronRight } from "lucide-react";

export function MissionCard({ title, description, reward, onClick }: any) {
  const { isZKVerified, isAdmin } = useAuth();
  
  return (
    <div 
      onClick={onClick}
      className="card-soft p-5 border-l-4 border-l-green-500 hover:border-l-green-600 cursor-pointer group flex flex-col"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="text-[10px] font-semibold text-green-700 bg-green-50 px-2 py-1 rounded-full border border-green-100 flex items-center gap-1 uppercase tracking-wider">
          <Database className="w-3 h-3" />
          Citizen Science
        </div>
        
        {isAdmin && (
          <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded border border-red-100 font-medium">
            Manage
          </span>
        )}
      </div>
      
      <h3 className="font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">{title}</h3>
      <p className="text-sm text-gray-600 mb-6 leading-relaxed flex-grow">
        {description}
      </p>
      
      <div className="flex justify-between items-center text-sm font-medium pt-4 border-t border-gray-100 mt-auto">
        <span className="text-gray-500">Reward: <span className="text-gray-900 font-bold">{reward} REP</span></span>
        <span className="text-green-600 flex items-center gap-1 group-hover:text-green-700">
          Join Mission <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </span>
      </div>
    </div>
  );
}
