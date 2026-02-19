"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { LogIn, LogOut, User, ChevronDown, Gamepad2, CreditCard } from "lucide-react";
import Link from "next/link";

export default function Header() {
  const { user, logout, loading } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 text-white font-bold text-xl hover:text-purple-400 transition-colors">
            <Gamepad2 className="w-7 h-7 text-purple-500" />
            <span>Gerenciador <span className="text-purple-500">MU</span></span>
          </Link>

          <div className="flex items-center gap-3">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-gray-700 animate-pulse" />
            ) : user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <User className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-medium">{user.nome}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-700">
                      <p className="text-sm font-medium text-white">{user.nome}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                      <p className="text-xs text-purple-400 mt-1">Conta: {user.usuarioPai}</p>
                    </div>
                    <Link
                      href="/painel"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Meu Painel
                    </Link>
                    <Link
                      href="/pagamento"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                    >
                      <CreditCard className="w-4 h-4" />
                      Assinar Plano
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setDropdownOpen(false);
                      }}
                      className="flex items-center gap-2 w-full px-4 py-3 text-sm text-red-400 hover:bg-gray-800 hover:text-red-300 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sair
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Entrar
                </Link>
                <Link
                  href="/cadastro"
                  className="flex items-center gap-2 border border-purple-600 text-purple-400 hover:bg-purple-600/10 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Cadastrar
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
