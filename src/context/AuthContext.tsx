"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

export interface Usuario {
  id: string;
  nome: string;
  usuario: string;
  email: string;
  plano: string;
  expira: string;
  whatsapp: string;
  usuarioPai: string;
}

interface AuthContextType {
  user: Usuario | null;
  usuarios: Usuario[];
  login: (usuarioPai: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  setUser: (user: Usuario) => void;
  refreshUsuarios: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsuarios = useCallback(async (usuarioPai: string) => {
    try {
      const res = await fetch(`/api/usuarios/pai/${encodeURIComponent(usuarioPai)}`);
      const data = await res.json();
      if (res.ok) {
        setUsuarios(data.usuarios || []);
      }
    } catch {
      console.error("Erro ao carregar usuários");
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("gmux-user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        fetchUsuarios(parsed.usuarioPai);
      } catch {
        localStorage.removeItem("gmux-user");
      }
    }
    setLoading(false);
  }, [fetchUsuarios]);

  const login = async (usuarioPai: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuarioPai }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error };
      }
      setUser(data.user);
      setUsuarios(data.usuarios || []);
      localStorage.setItem("gmux-user", JSON.stringify(data.user));
      return { success: true };
    } catch {
      return { success: false, error: "Erro de conexão" };
    }
  };

  const logout = () => {
    setUser(null);
    setUsuarios([]);
    localStorage.removeItem("gmux-user");
  };

  const refreshUsuarios = async () => {
    if (user) {
      await fetchUsuarios(user.usuarioPai);
    }
  };

  return (
    <AuthContext.Provider value={{ user, usuarios, login, logout, setUser, refreshUsuarios, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
