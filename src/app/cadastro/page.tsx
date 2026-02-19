"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { UserPlus, Loader2, Gamepad2 } from "lucide-react";
import Link from "next/link";

export default function CadastroPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    nome: "",
    usuarioPai: "",
    email: "",
    whatsapp: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 10) {
      return digits
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{4})(\d)/, "$1-$2");
    }
    return digits
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === "whatsapp") {
      setForm({ ...form, whatsapp: formatPhone(e.target.value) });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: form.nome,
          usuarioPai: form.usuarioPai,
          email: form.email,
          whatsapp: form.whatsapp.replace(/\D/g, ""),
          isParent: true,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao cadastrar");
        setLoading(false);
        return;
      }

      const loginResult = await login(form.usuarioPai);
      setLoading(false);

      if (loginResult.success) {
        router.push("/painel");
      } else {
        router.push("/login");
      }
    } catch {
      setError("Erro de conexão");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Gamepad2 className="w-12 h-12 text-purple-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold">Criar Conta</h1>
          <p className="text-gray-400 mt-2">Cadastre-se no Gerenciador MU</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-8 space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-300 mb-2">
              Nome Completo
            </label>
            <input
              id="nome"
              name="nome"
              type="text"
              value={form.nome}
              onChange={handleChange}
              placeholder="Seu nome completo"
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label htmlFor="usuarioPai" className="block text-sm font-medium text-gray-300 mb-2">
              Nome da Conta
            </label>
            <input
              id="usuarioPai"
              name="usuarioPai"
              type="text"
              value={form.usuarioPai}
              onChange={handleChange}
              placeholder="Escolha um nome para sua conta"
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
            <p className="text-xs text-gray-500 mt-1">Você usará este nome para fazer login e gerenciar seus usuários.</p>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="seu@email.com"
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-300 mb-2">
              WhatsApp <span className="text-gray-500">(opcional)</span>
            </label>
            <input
              id="whatsapp"
              name="whatsapp"
              type="text"
              value={form.whatsapp}
              onChange={handleChange}
              placeholder="(00) 00000-0000"
              inputMode="numeric"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !form.nome.trim() || !form.usuarioPai.trim() || !form.email.trim()}
            className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-colors"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <UserPlus className="w-5 h-5" />
            )}
            {loading ? "Cadastrando..." : "Cadastrar"}
          </button>

          <p className="text-center text-sm text-gray-400">
            Já tem uma conta?{" "}
            <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium">
              Entrar
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
