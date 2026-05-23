"use client";

import { Home, Compass, FlaskConical, ShoppingBag, MessageSquare, User, Store, Award } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function SidebarLeft() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <aside className="w-64 border-r border-gray-200 bg-white p-6 flex flex-col h-full">
      <nav className="space-y-1">
        <Link href="/app" className={`flex items-center gap-3 pl-2 pr-3 py-2.5 text-sm transition-all ${isActive('/app') ? 'bg-green-50/80 text-green-700 border-l-4 border-green-600 rounded-r-lg font-semibold' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent rounded-lg font-medium'}`}>
          <Home className="w-4 h-4" />
          Feed
        </Link>
        <Link href="/app/missions" className={`flex items-center gap-3 pl-2 pr-3 py-2.5 text-sm transition-all ${isActive('/app/missions') ? 'bg-green-50/80 text-green-700 border-l-4 border-green-600 rounded-r-lg font-semibold' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent rounded-lg font-medium'}`}>
          <Compass className="w-4 h-4" />
          Missions
        </Link>
        <Link href="/app/mylabs" className={`flex items-center gap-3 pl-2 pr-3 py-2.5 text-sm transition-all ${isActive('/app/mylabs') ? 'bg-green-50/80 text-green-700 border-l-4 border-green-600 rounded-r-lg font-semibold' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent rounded-lg font-medium'}`}>
          <FlaskConical className="w-4 h-4" />
          My Labs
        </Link>
        <Link href="/app/marketplace" className={`flex items-center gap-3 pl-2 pr-3 py-2.5 text-sm transition-all ${isActive('/app/marketplace') ? 'bg-green-50/80 text-green-700 border-l-4 border-green-600 rounded-r-lg font-semibold' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent rounded-lg font-medium'}`}>
          <Store className="w-4 h-4" />
          Marketplace
        </Link>
        <Link href="/app/forum" className={`flex items-center gap-3 pl-2 pr-3 py-2.5 text-sm transition-all ${isActive('/app/forum') ? 'bg-green-50/80 text-green-700 border-l-4 border-green-600 rounded-r-lg font-semibold' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent rounded-lg font-medium'}`}>
          <MessageSquare className="w-4 h-4" />
          DAO Forum
        </Link>
        <Link href="/app/profile" className={`flex items-center gap-3 pl-2 pr-3 py-2.5 text-sm transition-all ${isActive('/app/profile') ? 'bg-green-50/80 text-green-700 border-l-4 border-green-600 rounded-r-lg font-semibold' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent rounded-lg font-medium'}`}>
          <User className="w-4 h-4" />
          My Profile
        </Link>
        <Link href="/app/reputation" className={`flex items-center gap-3 pl-2 pr-3 py-2.5 text-sm transition-all ${isActive('/app/reputation') ? 'bg-green-50/80 text-green-700 border-l-4 border-green-600 rounded-r-lg font-semibold' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent rounded-lg font-medium'}`}>
          <Award className="w-4 h-4" />
          Reputation
        </Link>
        <div className="pt-4 mt-4 border-t border-gray-100">
          <Link href="/app/resources" className={`flex items-center gap-3 pl-2 pr-3 py-2.5 text-sm transition-all ${isActive('/app/resources') ? 'bg-green-50/80 text-green-700 border-l-4 border-green-600 rounded-r-lg font-semibold' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent rounded-lg font-medium'}`}>
            <ShoppingBag className="w-4 h-4" />
            Resource Hub
          </Link>
        </div>
      </nav>

      <div className="mt-auto p-4 bg-gray-50 rounded-xl border border-gray-100">
        <h4 className="text-xs font-bold text-gray-900 mb-1">Network Status</h4>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Sovereign Node Active
        </div>
      </div>
    </aside>
  );
}
