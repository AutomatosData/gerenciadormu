"use client";

import { useEffect, useState, Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Loader2,
  Check,
  Crown,
  Zap,
  Star,
  Sparkles,
  ExternalLink,
  Gamepad2,
  ChevronDown,
} from "lucide-react";

interface Plano {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  dias: number;
}

const PLANOS: Plano[] = [
  { id: "mensal", nome: "Mensal", descricao: "Acesso completo por 30 dias", preco: 29.9, dias: 30 },
  { id: "trimestral", nome: "Trimestral", descricao: "Acesso completo por 90 dias", preco: 74.9, dias: 90 },
  { id: "semestral", nome: "Semestral", descricao: "Acesso completo por 180 dias", preco: 134.9, dias: 180 },
  { id: "anual", nome: "Anual", descricao: "Acesso completo por 365 dias", preco: 239.9, dias: 365 },
];

const PLANO_ICONS: Record<string, React.ReactNode> = {
  mensal: <Zap className="w-8 h-8" />,
  trimestral: <Star className="w-8 h-8" />,
  semestral: <Crown className="w-8 h-8" />,
  anual: <Sparkles className="w-8 h-8" />,
};

const PLANO_COLORS: Record<string, string> = {
  mensal: "from-blue-500 to-blue-600",
  trimestral: "from-purple-500 to-purple-600",
  semestral: "from-amber-500 to-amber-600",
  anual: "from-emerald-500 to-emerald-600",
};

const PLANO_BORDER: Record<string, string> = {
  mensal: "border-blue-500/30 hover:border-blue-500",
  trimestral: "border-purple-500/30 hover:border-purple-500",
  semestral: "border-amber-500/30 hover:border-amber-500",
  anual: "border-emerald-500/30 hover:border-emerald-500",
};

function getEconomia(plano: Plano): string | null {
  const mensal = PLANOS.find((p) => p.id === "mensal");
  if (!mensal || plano.id === "mensal") return null;
  const custoSemDesconto = mensal.preco * (plano.dias / 30);
  const economia = ((1 - plano.preco / custoSemDesconto) * 100).toFixed(0);
  return `${economia}% de economia`;
}

function PagamentoContent() {
  const { user, usuarios, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedUsuarioId, setSelectedUsuarioId] = useState<string>("");
  const [selectedPlano, setSelectedPlano] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const childUsuarios = usuarios.filter((u) => u.usuario);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  // Pre-select usuario from query param
  useEffect(() => {
    const usuarioParam = searchParams.get("usuario");
    if (usuarioParam && childUsuarios.some((u) => u.id === usuarioParam)) {
      setSelectedUsuarioId(usuarioParam);
    } else if (childUsuarios.length === 1) {
      setSelectedUsuarioId(childUsuarios[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, usuarios]);

  const selectedUsuario = childUsuarios.find((u) => u.id === selectedUsuarioId);

  const handlePagar = async (planoId: string) => {
    if (!user || !selectedUsuarioId) {
      setError("Selecione um usuário para assinar o plano");
      return;
    }
    setSelectedPlano(planoId);
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/pagamento/criar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planoId, userId: selectedUsuarioId }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao criar pagamento");
        setLoading(false);
        setSelectedPlano(null);
        return;
      }

      if (data.initPoint) {
        window.location.href = data.initPoint;
      } else if (data.sandboxInitPoint) {
        window.location.href = data.sandboxInitPoint;
      } else {
        setError("Erro: URL de pagamento não disponível");
        setLoading(false);
        setSelectedPlano(null);
      }
    } catch {
      setError("Erro de conexão");
      setLoading(false);
      setSelectedPlano(null);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold">
          Escolha seu <span className="text-purple-400">Plano</span>
        </h1>
        <p className="mt-3 text-gray-400 max-w-xl mx-auto">
          Selecione o usuário e o plano ideal para aproveitar todos os recursos do Gerenciador MU.
        </p>
      </div>

      {/* Usuario Selector */}
      <div className="max-w-md mx-auto mb-10">
        <label className="block text-sm font-medium text-gray-300 mb-2 text-center">
          Selecione o usuário para a assinatura
        </label>
        {childUsuarios.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
            <Gamepad2 className="w-10 h-10 mx-auto mb-2 text-gray-600" />
            <p className="text-gray-400 text-sm">Você ainda não tem usuários criados.</p>
            <button
              onClick={() => router.push("/painel")}
              className="mt-3 text-purple-400 hover:text-purple-300 text-sm font-medium"
            >
              Criar um usuário primeiro →
            </button>
          </div>
        ) : (
          <div className="relative">
            <select
              value={selectedUsuarioId}
              onChange={(e) => setSelectedUsuarioId(e.target.value)}
              className="w-full appearance-none bg-gray-900 border border-gray-700 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all pr-10"
            >
              <option value="">-- Selecione um usuário --</option>
              {childUsuarios.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.usuario} {u.plano && u.plano !== "Free" ? `(${u.plano} - Exp: ${u.expira})` : "(Free)"}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        )}

        {selectedUsuario && selectedUsuario.plano && selectedUsuario.plano !== "Free" && (
          <div className="mt-3 inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 text-purple-400 px-4 py-2 rounded-lg text-sm w-full justify-center">
            <Crown className="w-4 h-4" />
            Plano atual: <strong>{selectedUsuario.plano}</strong>
            {selectedUsuario.expira && <span className="text-gray-400">| Expira: {selectedUsuario.expira}</span>}
          </div>
        )}
      </div>

      {error && (
        <div className="max-w-md mx-auto mb-8 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm text-center">
          {error}
        </div>
      )}

      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 ${!selectedUsuarioId ? "opacity-50 pointer-events-none" : ""}`}>
        {PLANOS.map((plano) => {
          const economia = getEconomia(plano);
          const isSelected = selectedPlano === plano.id;
          const isLoading = isSelected && loading;

          return (
            <div
              key={plano.id}
              className={`relative bg-gray-900 border rounded-2xl p-6 flex flex-col transition-all duration-300 ${PLANO_BORDER[plano.id]} ${
                plano.id === "trimestral" ? "ring-2 ring-purple-500/50 scale-[1.02]" : ""
              }`}
            >
              {plano.id === "trimestral" && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  POPULAR
                </div>
              )}

              {economia && (
                <div className="absolute -top-3 right-4 bg-green-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  {economia}
                </div>
              )}

              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${PLANO_COLORS[plano.id]} flex items-center justify-center text-white mb-4`}>
                {PLANO_ICONS[plano.id]}
              </div>

              <h3 className="text-xl font-bold mb-1">{plano.nome}</h3>
              <p className="text-gray-400 text-sm mb-4">{plano.descricao}</p>

              <div className="mb-6">
                <span className="text-3xl font-bold">
                  R$ {plano.preco.toFixed(2).replace(".", ",")}
                </span>
                <span className="text-gray-500 text-sm ml-1">
                  /{plano.dias} dias
                </span>
              </div>

              <ul className="space-y-2 mb-6 flex-1">
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-green-500 shrink-0" />
                  Acesso completo ao sistema
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-green-500 shrink-0" />
                  Suporte via WhatsApp
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-green-500 shrink-0" />
                  Atualizações incluídas
                </li>
              </ul>

              <button
                onClick={() => handlePagar(plano.id)}
                disabled={loading || !selectedUsuarioId}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all text-white ${
                  isLoading
                    ? "bg-gray-700 cursor-wait"
                    : `bg-gradient-to-r ${PLANO_COLORS[plano.id]} hover:opacity-90`
                } disabled:opacity-50`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Redirecionando...
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4" />
                    Assinar Agora
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-10 text-center">
        <p className="text-gray-500 text-sm">
          Pagamento seguro processado pelo{" "}
          <span className="text-blue-400 font-medium">Mercado Pago</span>.
          Aceitamos PIX, cartão de crédito, débito e boleto.
        </p>
      </div>
    </div>
  );
}

export default function PagamentoPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      }
    >
      <PagamentoContent />
    </Suspense>
  );
}
