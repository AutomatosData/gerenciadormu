"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Loader2,
  Check,
  Crown,
  Zap,
  Star,
  Sparkles,
  Gamepad2,
  ChevronDown,
  CreditCard,
  QrCode,
  Copy,
  CheckCircle,
  FileText,
  ExternalLink,
} from "lucide-react";

interface Plano {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  dias: number;
}

const PLANOS: Plano[] = [
  { id: "semanal", nome: "Semanal", descricao: "Acesso completo por 7 dias", preco: 7.9, dias: 7 },
  { id: "mensal", nome: "Mensal", descricao: "Acesso completo por 30 dias", preco: 29.9, dias: 30 },
  { id: "trimestral", nome: "Trimestral", descricao: "Acesso completo por 90 dias", preco: 74.9, dias: 90 },
  { id: "semestral", nome: "Semestral", descricao: "Acesso completo por 180 dias", preco: 134.9, dias: 180 },
  { id: "anual", nome: "Anual", descricao: "Acesso completo por 365 dias", preco: 239.9, dias: 365 },
];

const PLANO_ICONS: Record<string, React.ReactNode> = {
  semanal: <Check className="w-8 h-8" />,
  mensal: <Zap className="w-8 h-8" />,
  trimestral: <Star className="w-8 h-8" />,
  semestral: <Crown className="w-8 h-8" />,
  anual: <Sparkles className="w-8 h-8" />,
};

const PLANO_COLORS: Record<string, string> = {
  semanal: "from-green-500 to-green-600",
  mensal: "from-blue-500 to-blue-600",
  trimestral: "from-purple-500 to-purple-600",
  semestral: "from-amber-500 to-amber-600",
  anual: "from-emerald-500 to-emerald-600",
};

const PLANO_BORDER: Record<string, string> = {
  semanal: "border-green-500/30 hover:border-green-500",
  mensal: "border-blue-500/30 hover:border-blue-500",
  trimestral: "border-purple-500/30 hover:border-purple-500",
  semestral: "border-amber-500/30 hover:border-amber-500",
  anual: "border-emerald-500/30 hover:border-emerald-500",
};

function getEconomia(plano: Plano): string | null {
  const semanal = PLANOS.find((p) => p.id === "semanal");
  if (!semanal || plano.id === "semanal") return null;
  const custoSemDesconto = (semanal.preco / 7) * plano.dias;
  const economia = ((1 - plano.preco / custoSemDesconto) * 100).toFixed(0);
  return `${economia}% de economia`;
}

type MetodoPagamento = "pix" | "boleto" | "cartao";

interface PixResult {
  id: string | number;
  qrCode: string | null;
  qrCodeBase64: string | null;
  ticketUrl: string | null;
}

interface BoletoResult {
  id: string | number;
  boletoUrl: string | null;
  barcode: string | null;
}

function PagamentoContent() {
  const { user, usuarios, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedUsuarioId, setSelectedUsuarioId] = useState<string>("");
  const [selectedPlano, setSelectedPlano] = useState<Plano | null>(null);
  const [metodo, setMetodo] = useState<MetodoPagamento>("pix");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [cpf, setCpf] = useState("");
  const [pixResult, setPixResult] = useState<PixResult | null>(null);
  const [boletoResult, setBoletoResult] = useState<BoletoResult | null>(null);
  const brickControllerRef = useRef<{ unmount: () => void } | null>(null);

  const childUsuarios = usuarios.filter((u) => u.usuario);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (authLoading || childUsuarios.length === 0) return;
    const usuarioParam = searchParams.get("usuario");
    if (usuarioParam && childUsuarios.some((u) => u.id === usuarioParam)) {
      setSelectedUsuarioId(usuarioParam);
    } else if (childUsuarios.length === 1) {
      setSelectedUsuarioId(childUsuarios[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, usuarios, authLoading]);

  useEffect(() => {
    setPixResult(null); setBoletoResult(null); setError("");
  }, [selectedPlano, metodo, selectedUsuarioId]);

  // Load MP SDK once
  useEffect(() => {
    if (document.getElementById("mp-sdk")) return;
    const script = document.createElement("script");
    script.id = "mp-sdk";
    script.src = "https://sdk.mercadopago.com/js/v2";
    script.async = true;
    document.head.appendChild(script);
  }, []);

  // Mount CardPayment Brick
  useEffect(() => {
    if (metodo !== "cartao" || !selectedPlano || !selectedUsuarioId) {
      brickControllerRef.current?.unmount();
      brickControllerRef.current = null;
      return;
    }
    const publicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY;
    if (!publicKey) return;
    const mountBrick = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mp = new (window as any).MercadoPago(publicKey, { locale: "pt-BR" });
      const bricks = mp.bricks();
      brickControllerRef.current?.unmount();
      brickControllerRef.current = null;
      const payerEmail = childUsuarios.find((u) => u.id === selectedUsuarioId)?.email || "";
      bricks.create("cardPayment", "cardPaymentBrick", {
        initialization: { amount: selectedPlano.preco, payer: { email: payerEmail } },
        customization: {
          visual: { style: { theme: "dark", customVariables: { baseColor: "#7c3aed", buttonBackground: "#7c3aed", buttonTextColor: "#ffffff" } } },
          paymentMethods: { maxInstallments: 12 },
        },
        callbacks: {
          onReady: () => {},
          onSubmit: async (cardFormData: Record<string, unknown>) => {
            setLoading(true); setError("");
            try {
              const res = await fetch("/api/pagamento/cartao", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...cardFormData, planoId: selectedPlano.id, userId: selectedUsuarioId }),
              });
              const data = await res.json();
              if (!res.ok) setError(data.error || "Erro ao processar pagamento");
              else if (data.status === "approved") router.push("/pagamento/resultado?status=success");
              else if (data.status === "in_process" || data.status === "pending") router.push("/pagamento/resultado?status=pending");
              else setError(`Pagamento recusado: ${data.statusDetail || data.status}`);
            } catch { setError("Erro de conexão"); }
            setLoading(false);
          },
          onError: (err: unknown) => { console.error("Brick error:", err); },
        },
      }).then((c: { unmount: () => void }) => { brickControllerRef.current = c; });
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).MercadoPago) { mountBrick(); }
    else {
      const script = document.getElementById("mp-sdk");
      script?.addEventListener("load", mountBrick);
      return () => script?.removeEventListener("load", mountBrick);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metodo, selectedPlano, selectedUsuarioId]);

  const selectedUsuario = childUsuarios.find((u) => u.id === selectedUsuarioId);

  const handlePix = async () => {
    if (!selectedPlano || !selectedUsuarioId) return;
    setLoading(true); setError(""); setPixResult(null);
    try {
      const res = await fetch("/api/pagamento/pix", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planoId: selectedPlano.id, userId: selectedUsuarioId }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Erro ao gerar PIX");
      else setPixResult(data);
    } catch { setError("Erro de conexão"); }
    setLoading(false);
  };

  const handleBoleto = async () => {
    if (!selectedPlano || !selectedUsuarioId || !cpf) return;
    setLoading(true); setError(""); setBoletoResult(null);
    try {
      const res = await fetch("/api/pagamento/boleto", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planoId: selectedPlano.id, userId: selectedUsuarioId, cpf }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Erro ao gerar boleto");
      else setBoletoResult(data);
    } catch { setError("Erro de conexão"); }
    setLoading(false);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatCpf = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 11);
    return d.replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
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
          Selecione o usuário, o plano e a forma de pagamento.
        </p>
      </div>

      {/* Usuario Selector */}
      <div className="max-w-md mx-auto mb-8">
        <label className="block text-sm font-medium text-gray-300 mb-2 text-center">
          Selecione o usuário para a assinatura
        </label>
        {childUsuarios.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
            <Gamepad2 className="w-10 h-10 mx-auto mb-2 text-gray-600" />
            <p className="text-gray-400 text-sm">Você ainda não tem usuários criados.</p>
            <button onClick={() => router.push("/painel")} className="mt-3 text-purple-400 hover:text-purple-300 text-sm font-medium">
              Criar um usuário primeiro →
            </button>
          </div>
        ) : (
          <div className="relative">
            <select
              value={selectedUsuarioId}
              onChange={(e) => { setSelectedUsuarioId(e.target.value); setSelectedPlano(null); }}
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
        {selectedUsuario?.plano && selectedUsuario.plano !== "Free" && (
          <div className="mt-3 inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 text-purple-400 px-4 py-2 rounded-lg text-sm w-full justify-center">
            <Crown className="w-4 h-4" />
            Plano atual: <strong>{selectedUsuario.plano}</strong>
            {selectedUsuario.expira && <span className="text-gray-400 ml-1">| Expira: {selectedUsuario.expira}</span>}
          </div>
        )}
      </div>

      {error && (
        <div className="max-w-md mx-auto mb-6 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm text-center">
          {error}
        </div>
      )}

      {/* Planos */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10 overflow-visible ${!selectedUsuarioId ? "opacity-50 pointer-events-none" : ""}`}>
        {PLANOS.map((plano) => {
          const economia = getEconomia(plano);
          const isSelected = selectedPlano?.id === plano.id;

          return (
            <div
              key={plano.id}
              onClick={() => { if (selectedUsuarioId) { setSelectedPlano(plano); setError(""); } }}
              className={`relative bg-gray-900 border rounded-2xl p-6 flex flex-col cursor-pointer transition-all duration-200 overflow-visible ${
                isSelected ? "border-purple-500 ring-2 ring-purple-500/40" : PLANO_BORDER[plano.id]
              } ${plano.id === "trimestral" && !isSelected ? "ring-1 ring-purple-500/20" : ""}`}
            >
              {isSelected && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Selecionado
                </div>
              )}
              {!isSelected && plano.id === "trimestral" && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap z-10">
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
                <span className="text-3xl font-bold">R$ {plano.preco.toFixed(2).replace(".", ",")}</span>
                <span className="text-gray-500 text-sm ml-1">/{plano.dias} dias</span>
              </div>
              <ul className="space-y-2 flex-1">
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-green-500 shrink-0" /> Acesso completo ao sistema
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-green-500 shrink-0" /> Suporte via WhatsApp
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-green-500 shrink-0" /> Atualizações incluídas
                </li>
              </ul>
            </div>
          );
        })}
      </div>

      {/* Método de pagamento — só aparece quando plano e usuário selecionados */}
      {selectedPlano && selectedUsuarioId && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8">
            <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-purple-400" />
              Forma de Pagamento
              <span className="ml-auto text-sm font-normal text-gray-400">
                Plano <strong className="text-white">{selectedPlano.nome}</strong> — R$ {selectedPlano.preco.toFixed(2).replace(".", ",")}
              </span>
            </h2>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              {(["pix", "boleto", "cartao"] as MetodoPagamento[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMetodo(m)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    metodo === m
                      ? "bg-purple-600 border-purple-600 text-white"
                      : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600"
                  }`}
                >
                  {m === "pix" && <QrCode className="w-4 h-4" />}
                  {m === "boleto" && <FileText className="w-4 h-4" />}
                  {m === "cartao" && <CreditCard className="w-4 h-4" />}
                  {m === "pix" ? "PIX" : m === "boleto" ? "Boleto" : "Cartão"}
                </button>
              ))}
            </div>

            {/* PIX */}
            {metodo === "pix" && !pixResult && (
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-5">
                  Gere um QR Code PIX e pague diretamente pelo seu banco ou app de pagamento.
                </p>
                <button
                  onClick={handlePix}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold bg-gradient-to-r from-green-600 to-green-700 hover:opacity-90 text-white transition-all disabled:opacity-50 disabled:cursor-wait"
                >
                  {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Gerando PIX...</> : <><QrCode className="w-4 h-4" /> Gerar QR Code PIX</>}
                </button>
              </div>
            )}

            {metodo === "pix" && pixResult && (
              <div className="text-center">
                <p className="text-green-400 text-sm font-medium mb-4 flex items-center justify-center gap-1.5">
                  <CheckCircle className="w-4 h-4" /> PIX gerado! Escaneie o QR Code ou copie o código.
                </p>
                {pixResult.qrCodeBase64 && (
                  <div className="flex justify-center mb-4">
                    <img src={`data:image/png;base64,${pixResult.qrCodeBase64}`} alt="QR Code PIX" className="w-52 h-52 rounded-xl border border-gray-700" />
                  </div>
                )}
                {pixResult.qrCode && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1">Copia e Cola</p>
                    <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-left">
                      <span className="text-xs text-gray-300 font-mono truncate flex-1">{pixResult.qrCode}</span>
                      <button onClick={() => handleCopy(pixResult.qrCode!)} className="shrink-0 text-purple-400 hover:text-purple-300 transition-colors" title="Copiar">
                        {copied ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}
                {pixResult.ticketUrl && (
                  <a href={pixResult.ticketUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-purple-400 hover:text-purple-300 transition-colors">
                    <ExternalLink className="w-3.5 h-3.5" /> Abrir página do PIX
                  </a>
                )}
                <p className="text-xs text-gray-500 mt-4">O plano será ativado automaticamente após a confirmação do pagamento.</p>
              </div>
            )}

            {/* Boleto */}
            {metodo === "boleto" && !boletoResult && (
              <div>
                <p className="text-gray-400 text-sm mb-4">Informe seu CPF para gerar o boleto bancário.</p>
                <input
                  type="text"
                  value={cpf}
                  onChange={(e) => setCpf(formatCpf(e.target.value))}
                  placeholder="000.000.000-00"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
                <button
                  onClick={handleBoleto}
                  disabled={loading || cpf.replace(/\D/g, "").length < 11}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:opacity-90 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Gerando boleto...</> : <><FileText className="w-4 h-4" /> Gerar Boleto</>}
                </button>
              </div>
            )}

            {metodo === "boleto" && boletoResult && (
              <div className="text-center">
                <p className="text-green-400 text-sm font-medium mb-4 flex items-center justify-center gap-1.5">
                  <CheckCircle className="w-4 h-4" /> Boleto gerado com sucesso!
                </p>
                {boletoResult.barcode && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1">Código de barras</p>
                    <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-left">
                      <span className="text-xs text-gray-300 font-mono truncate flex-1">{boletoResult.barcode}</span>
                      <button onClick={() => handleCopy(boletoResult.barcode!)} className="shrink-0 text-purple-400 hover:text-purple-300 transition-colors">
                        {copied ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}
                {boletoResult.boletoUrl && (
                  <a href={boletoResult.boletoUrl} target="_blank" rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors">
                    <ExternalLink className="w-4 h-4" /> Visualizar / Imprimir Boleto
                  </a>
                )}
                <p className="text-xs text-gray-500 mt-4">O plano será ativado em até 3 dias úteis após o pagamento.</p>
              </div>
            )}

            {/* Cartão */}
            {metodo === "cartao" && (
              <div>
                <div id="cardPaymentBrick" />
                {loading && (
                  <div className="flex items-center justify-center py-4 gap-2 text-gray-400 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" /> Processando pagamento...
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-10 text-center">
        <p className="text-gray-500 text-sm">
          Pagamento seguro processado pelo{" "}
          <span className="text-blue-400 font-medium">Mercado Pago</span>.
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
