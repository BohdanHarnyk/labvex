"use client";
 
import { useAuth } from "@/lib/auth/AuthContext";
import { ShieldCheck, Code, Building2, Briefcase, UserCircle2 } from "lucide-react";
 
export function AuthPanel() {
  const { 
    isAuthenticated, 
    logout, 
    role, 
    isAdmin, 
    openAuthModal
  } = useAuth();
  
  const getRoleIcon = (userRole: string) => {
    switch (userRole) {
      case "VERIFIED_PHYSICIST":
      case "NOBEL_LAUREATE":
        return <ShieldCheck className="w-4 h-4 text-green-600" />;
      case "DEVELOPER":
        return <Code className="w-4 h-4 text-purple-600" />;
      case "LABORATORY":
        return <Building2 className="w-4 h-4 text-indigo-600" />;
      case "COMPANY":
        return <Briefcase className="w-4 h-4 text-amber-600" />;
      default:
        return <UserCircle2 className="w-4 h-4 text-gray-500" />;
    }
  };
 
  if (isAuthenticated) {
    return (
      <div className="flex items-center gap-4">
        {isAdmin && (
          <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded">ADMIN MODE</span>
        )}
        <div className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full flex items-center gap-2">
          {getRoleIcon(role)}
          {role.replace("_", " ")}
        </div>
        <button onClick={logout} className="btn-secondary px-4 py-2 text-sm">
          Logout
        </button>
      </div>
    );
  }
 
  return (
    <button
      onClick={openAuthModal}
      className="btn-primary px-6 py-2.5 shadow-md hover:shadow-lg"
    >
      Sign In
    </button>
  );
}
