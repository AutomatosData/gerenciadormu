"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { LogIn, Loader2, Gamepad2 } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [usuarioPai, setUsuarioPai] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(usuarioPai);
    setLoading(false);

    if (result.success) {
      router.push("/painel");
    } else {
      setError(result.error || "Erro ao fazer login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Gamepad2 className="w-12 h-12 text-purple-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold">Entrar</h1>
          <p className="text-gray-400 mt-2">Acesse sua conta do Gerenciador MU</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-8 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="usuarioPai" className="block text-sm font-medium text-gray-300 mb-2">
              Sua Conta
            </label>
            <input
              id="usuarioPai"
              type="text"
              value={usuarioPai}
              onChange={(e) => setUsuarioPai(e.target.value)}
              placeholder="Digite o nome da sua conta"
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !usuarioPai.trim()}
            className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-colors"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <LogIn className="w-5 h-5" />
            )}
            {loading ? "Entrando..." : "Entrar"}
          </button>

          <p className="text-center text-sm text-gray-400">
            Não tem uma conta?{" "}
            <Link href="/cadastro" className="text-purple-400 hover:text-purple-300 font-medium">
              Cadastre-se
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
