"use client";

import { useEffect, useState } from "react";
import { useAuth, Usuario } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import {
  Save,
  Loader2,
  CreditCard,
  Clock,
  UserCog,
  Globe,
  Monitor,
  Calendar,
  DollarSign,
  Hash,
  Shield,
  Crown,
  Users,
  UserPlus,
  Gamepad2,
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Wifi,
  QrCode,
  X,
  Copy,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

interface Pagamento {
  idUsuario: string;
  idPagamento: string;
  dataPagamento: string;
  valor: string;
  metodo: string;
  status: string;
}

interface DetalhesPagamento {
  id: string;
  status: string;
  metodo: string;
  pixQrCode: string | null;
  pixQrCodeBase64: string | null;
  pixTicketUrl: string | null;
  boletoUrl: string | null;
  barcode: string | null;
}

interface HistoricoLogin {
  horario: string;
  usuario: string;
  ip: string;
  mac: string;
}

interface AuthMac {
  rowIndex: number;
  usuario: string;
  mac: string;
  status: "Autorizado" | "Não Autorizado";
}

type Tab = "perfil" | "usuarios" | "pagamentos" | "historico";

const PAGE_SIZE = 10;

export default function PainelPage() {
  const { user, usuarios, setUser, refreshUsuarios, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Redirect /painel → /painel/usuarios
  useEffect(() => {
    if (pathname === "/painel") {
      router.replace("/painel/usuarios");
    }
  }, [pathname, router]);

  const tabFromPath = (pathname.split("/")[2] as Tab) || "usuarios";
  const validTabs: Tab[] = ["usuarios", "perfil", "pagamentos", "historico"];
  const activeTab: Tab = validTabs.includes(tabFromPath) ? tabFromPath : "usuarios";

  const setActiveTab = (tab: Tab) => router.push(`/painel/${tab}`);
  const [form, setForm] = useState({ nome: "", email: "", whatsapp: "" });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  // New child usuario form
  const [newUsuario, setNewUsuario] = useState("");
  const [addingUser, setAddingUser] = useState(false);
  const [addUserMsg, setAddUserMsg] = useState("");

  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [loadingPag, setLoadingPag] = useState(false);
  const [detalhesModal, setDetalhesModal] = useState<{ pagamento: Pagamento; detalhes: DetalhesPagamento | null } | null>(null);
  const [loadingDetalhes, setLoadingDetalhes] = useState(false);
  const [cancelando, setCancelando] = useState<string | null>(null);
  const [confirmarCancelar, setConfirmarCancelar] = useState<Pagamento | null>(null);
  const [copied, setCopied] = useState(false);

  const [historico, setHistorico] = useState<HistoricoLogin[]>([]);
  const [loadingHist, setLoadingHist] = useState(false);

  const [authMacs, setAuthMacs] = useState<AuthMac[]>([]);
  const [loadingMacs, setLoadingMacs] = useState(false);
  const [searchMac, setSearchMac] = useState("");
  const [pageMac, setPageMac] = useState(1);
  const [togglingMac, setTogglingMac] = useState<number | null>(null);

  // Search & pagination state
  const [searchUsuarios, setSearchUsuarios] = useState("");
  const [pageUsuarios, setPageUsuarios] = useState(1);
  const [searchPag, setSearchPag] = useState("");
  const [pagePag, setPagePag] = useState(1);
  const [searchHist, setSearchHist] = useState("");
  const [pageHist, setPageHist] = useState(1);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      setForm({
        nome: user.nome,
        email: user.email,
        whatsapp: formatPhone(user.whatsapp),
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (user && usuarios.length > 0 && activeTab === "pagamentos") {
      fetchAllPagamentos();
    }
    if (user && usuarios.length > 0 && activeTab === "historico") {
      fetchAllHistorico();
      fetchAuthMacs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, user, usuarios]);

  const fetchAllPagamentos = async () => {
    if (!user || usuarios.length === 0) return;
    setLoadingPag(true);
    try {
      const allPagamentos: Pagamento[] = [];
      for (const u of usuarios) {
        const res = await fetch(`/api/pagamentos/${u.id}`);
        const data = await res.json();
        if (data.pagamentos) {
          allPagamentos.push(...data.pagamentos);
        }
      }
      setPagamentos(allPagamentos);
    } catch {
      console.error("Erro ao carregar pagamentos");
    }
    setLoadingPag(false);
  };

  const handleVerDetalhes = async (p: Pagamento) => {
    setDetalhesModal({ pagamento: p, detalhes: null });
    setLoadingDetalhes(true);
    try {
      const res = await fetch(`/api/pagamento/${p.idPagamento}/detalhes`);
      const data = await res.json();
      setDetalhesModal({ pagamento: p, detalhes: data });
    } catch {
      setDetalhesModal(null);
    }
    setLoadingDetalhes(false);
  };

  const handleCancelar = async (p: Pagamento) => {
    setConfirmarCancelar(null);
    setCancelando(p.idPagamento);
    try {
      await fetch(`/api/pagamento/${p.idPagamento}/cancelar`, { method: "POST" });
      setPagamentos((prev) => prev.map((x) => x.idPagamento === p.idPagamento ? { ...x, status: "Cancelado" } : x));
    } catch {
      console.error("Erro ao cancelar pagamento");
    }
    setCancelando(null);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fetchAllHistorico = async () => {
    if (!user || usuarios.length === 0) return;
    setLoadingHist(true);
    try {
      const allHistorico: HistoricoLogin[] = [];
      for (const u of usuarios) {
        if (!u.usuario) continue;
        const res = await fetch(`/api/historico/${encodeURIComponent(u.usuario)}`);
        const data = await res.json();
        if (data.historico) {
          allHistorico.push(...data.historico);
        }
      }
      allHistorico.sort((a, b) => {
        try {
          return new Date(b.horario).getTime() - new Date(a.horario).getTime();
        } catch { return 0; }
      });
      setHistorico(allHistorico);
    } catch {
      console.error("Erro ao carregar histórico");
    }
    setLoadingHist(false);
  };

  const fetchAuthMacs = async () => {
    if (!user) return;
    setLoadingMacs(true);
    try {
      const res = await fetch(`/api/authmac/${encodeURIComponent(user.usuarioPai)}`);
      const data = await res.json();
      if (data.macs) setAuthMacs(data.macs);
    } catch {
      console.error("Erro ao carregar MACs");
    }
    setLoadingMacs(false);
  };

  const toggleMacStatus = async (mac: AuthMac) => {
    setTogglingMac(mac.rowIndex);
    const newStatus: AuthMac["status"] = mac.status === "Autorizado" ? "Não Autorizado" : "Autorizado";
    try {
      const res = await fetch("/api/authmac/status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rowIndex: mac.rowIndex, status: newStatus }),
      });
      if (res.ok) {
        setAuthMacs((prev) => prev.map((m) => m.rowIndex === mac.rowIndex ? { ...m, status: newStatus } : m));
      }
    } catch {
      console.error("Erro ao atualizar status do MAC");
    }
    setTogglingMac(null);
  };

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setSaveMsg("");

    try {
      const res = await fetch(`/api/usuarios/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, whatsapp: form.whatsapp.replace(/\D/g, "") }),
      });
      const data = await res.json();

      if (res.ok) {
        const updatedUser: Usuario = { ...user, ...data.user };
        setUser(updatedUser);
        localStorage.setItem("gmux-user", JSON.stringify(updatedUser));
        setSaveMsg("Dados atualizados com sucesso!");
      } else {
        setSaveMsg(data.error || "Erro ao salvar");
      }
    } catch {
      setSaveMsg("Erro de conexão");
    }
    setSaving(false);
    setTimeout(() => setSaveMsg(""), 4000);
  };

  const handleAddUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newUsuario.trim()) return;
    setAddingUser(true);
    setAddUserMsg("");

    try {
      const res = await fetch("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario: newUsuario.trim(),
          usuarioPai: user.usuarioPai,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setNewUsuario("");
        setAddUserMsg("Usuário criado com sucesso!");
        await refreshUsuarios();
      } else {
        setAddUserMsg(data.error || "Erro ao criar usuário");
      }
    } catch {
      setAddUserMsg("Erro de conexão");
    }
    setAddingUser(false);
    setTimeout(() => setAddUserMsg(""), 4000);
  };

  const getUsuarioNameById = (id: string): string => {
    const u = usuarios.find((u) => u.id === id);
    return u?.usuario || id;
  };

  // Filtered + paginated data
  const childUsuarios = usuarios.filter((u) => u.usuario);
  const filteredUsuarios = childUsuarios.filter((u) => {
    if (!searchUsuarios) return true;
    const q = searchUsuarios.toLowerCase();
    return u.usuario.toLowerCase().includes(q) || (u.nome && u.nome.toLowerCase().includes(q)) || (u.plano && u.plano.toLowerCase().includes(q));
  });
  const totalPagesUsuarios = Math.max(1, Math.ceil(filteredUsuarios.length / PAGE_SIZE));
  const pagedUsuarios = filteredUsuarios.slice((pageUsuarios - 1) * PAGE_SIZE, pageUsuarios * PAGE_SIZE);

  const filteredPagamentos = pagamentos.filter((p) => {
    if (!searchPag) return true;
    const q = searchPag.toLowerCase();
    return getUsuarioNameById(p.idUsuario).toLowerCase().includes(q) || p.idPagamento.toLowerCase().includes(q) || p.dataPagamento.toLowerCase().includes(q) || p.valor.toLowerCase().includes(q) || p.metodo.toLowerCase().includes(q) || (p.status || "").toLowerCase().includes(q);
  });
  const totalPagesPag = Math.max(1, Math.ceil(filteredPagamentos.length / PAGE_SIZE));
  const pagedPagamentos = filteredPagamentos.slice((pagePag - 1) * PAGE_SIZE, pagePag * PAGE_SIZE);

  const filteredMacs = authMacs.filter((m) => {
    if (!searchMac) return true;
    const q = searchMac.toLowerCase();
    return m.mac.toLowerCase().includes(q) || m.usuario.toLowerCase().includes(q) || m.status.toLowerCase().includes(q);
  });
  const totalPagesMac = Math.max(1, Math.ceil(filteredMacs.length / PAGE_SIZE));
  const pagedMacs = filteredMacs.slice((pageMac - 1) * PAGE_SIZE, pageMac * PAGE_SIZE);

  const filteredHistorico = historico.filter((h) => {
    if (!searchHist) return true;
    const q = searchHist.toLowerCase();
    return h.usuario.toLowerCase().includes(q) || h.horario.toLowerCase().includes(q) || h.ip.toLowerCase().includes(q) || h.mac.toLowerCase().includes(q);
  });
  const totalPagesHist = Math.max(1, Math.ceil(filteredHistorico.length / PAGE_SIZE));
  const pagedHistorico = filteredHistorico.slice((pageHist - 1) * PAGE_SIZE, pageHist * PAGE_SIZE);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "usuarios", label: "Meus Usuários", icon: <Users className="w-4 h-4" /> },
    { key: "perfil", label: "Minha Conta", icon: <UserCog className="w-4 h-4" /> },
    { key: "pagamentos", label: "Pagamentos", icon: <CreditCard className="w-4 h-4" /> },
    { key: "historico", label: "Histórico de Login", icon: <Clock className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Account Header */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center text-2xl font-bold">
            {user.nome.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{user.nome}</h1>
            <p className="text-gray-400">Conta: <span className="text-purple-400">{user.usuarioPai}</span></p>
            <p className="text-gray-500 text-sm">{user.email}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Users className="w-4 h-4" />
              {usuarios.filter(u => u.usuario).length} usuário(s)
            </div>
            <Link
              href="/pagamento"
              className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
            >
              <Crown className="w-3.5 h-3.5" />
              Assinar Plano
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? "bg-purple-600 text-white"
                : "bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-white border border-gray-800"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ==================== USUARIOS TAB ==================== */}
      {activeTab === "usuarios" && (
        <div className="space-y-6">
          {/* Add new usuario */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-purple-400" />
              Adicionar Usuário
            </h2>

            {addUserMsg && (
              <div
                className={`mb-4 px-4 py-3 rounded-lg text-sm ${
                  addUserMsg.includes("sucesso")
                    ? "bg-green-500/10 border border-green-500/30 text-green-400"
                    : "bg-red-500/10 border border-red-500/30 text-red-400"
                }`}
              >
                {addUserMsg}
              </div>
            )}

            <form onSubmit={handleAddUsuario} className="flex gap-3">
              <input
                type="text"
                value={newUsuario}
                onChange={(e) => setNewUsuario(e.target.value)}
                placeholder="Nome do novo usuário"
                required
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
              <button
                type="submit"
                disabled={addingUser || !newUsuario.trim()}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white px-5 py-3 rounded-lg font-semibold transition-colors whitespace-nowrap"
              >
                {addingUser ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                Adicionar
              </button>
            </form>
          </div>

          {/* List child usuarios */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                Seus Usuários
              </h2>
              {childUsuarios.length > 0 && (
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={searchUsuarios}
                    onChange={(e) => { setSearchUsuarios(e.target.value); setPageUsuarios(1); }}
                    placeholder="Buscar usuário..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>
              )}
            </div>

            {childUsuarios.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Gamepad2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Nenhum usuário criado ainda</p>
                <p className="text-sm mt-1">Adicione seu primeiro usuário acima.</p>
              </div>
            ) : filteredUsuarios.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Search className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>Nenhum resultado para &quot;{searchUsuarios}&quot;</p>
              </div>
            ) : (
              <>
                <div className="grid gap-4">
                  {pagedUsuarios.map((u) => (
                    <div
                      key={u.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-gray-800/50 border border-gray-700/50 rounded-xl p-4"
                    >
                      <div className="w-10 h-10 rounded-full bg-purple-600/20 flex items-center justify-center text-sm font-bold text-purple-400">
                        {u.usuario.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white">{u.usuario}</p>
                        {u.nome && <p className="text-xs text-gray-400">{u.nome}</p>}
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                          u.plano && u.plano !== "Free"
                            ? "bg-green-500/10 text-green-400"
                            : "bg-gray-700 text-gray-400"
                        }`}>
                          {u.plano || "Free"}
                        </span>
                        {u.expira && (
                          <span className="text-xs text-gray-500">Exp: {u.expira}</span>
                        )}
                        <Link
                          href={`/pagamento?usuario=${u.id}`}
                          className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 font-medium"
                        >
                          <Crown className="w-3 h-3" />
                          {u.plano && u.plano !== "Free" ? "Renovar" : "Assinar"}
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
                {totalPagesUsuarios > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-800">
                    <span className="text-xs text-gray-500">{filteredUsuarios.length} resultado(s) — Página {pageUsuarios} de {totalPagesUsuarios}</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setPageUsuarios((p) => Math.max(1, p - 1))} disabled={pageUsuarios === 1} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                      <button onClick={() => setPageUsuarios((p) => Math.min(totalPagesUsuarios, p + 1))} disabled={pageUsuarios === totalPagesUsuarios} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronRight className="w-4 h-4" /></button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* ==================== PERFIL TAB ==================== */}
      {activeTab === "perfil" && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <UserCog className="w-5 h-5 text-purple-400" />
            Editar Conta
          </h2>

          {saveMsg && (
            <div
              className={`mb-6 px-4 py-3 rounded-lg text-sm ${
                saveMsg.includes("sucesso")
                  ? "bg-green-500/10 border border-green-500/30 text-green-400"
                  : "bg-red-500/10 border border-red-500/30 text-red-400"
              }`}
            >
              {saveMsg}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Nome - Editable */}
              <div>
                <label htmlFor="nome" className="block text-sm font-medium text-gray-300 mb-2">
                  Nome
                </label>
                <input
                  id="nome"
                  name="nome"
                  type="text"
                  value={form.nome}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>

              {/* E-mail - Editable */}
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
                  required
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>

              {/* WhatsApp - Editable */}
              <div>
                <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-300 mb-2">
                  WhatsApp
                </label>
                <input
                  id="whatsapp"
                  name="whatsapp"
                  type="text"
                  value={form.whatsapp}
                  onChange={handleChange}
                  placeholder="(00) 00000-0000"
                  inputMode="numeric"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Conta - Read Only */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Conta (Login)</label>
                <input
                  type="text"
                  value={user.usuarioPai}
                  disabled
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {saving ? "Salvando..." : "Salvar Alterações"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ==================== MODAL CONFIRMAR CANCELAMENTO ==================== */}
      {confirmarCancelar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8 w-full max-w-sm relative">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 mb-4">
                <XCircle className="w-7 h-7 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Cancelar Pagamento</h3>
              <p className="text-sm text-gray-400">
                Tem certeza que deseja cancelar este pagamento?
              </p>
            </div>
            <div className="bg-gray-800/60 border border-gray-700 rounded-xl px-4 py-3 mb-6 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Método</span>
                <span className="text-white font-medium">{confirmarCancelar.metodo}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Valor</span>
                <span className="text-white font-medium">{confirmarCancelar.valor}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">ID</span>
                <span className="text-gray-400 font-mono text-xs">{confirmarCancelar.idPagamento}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmarCancelar(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white text-sm font-medium transition-colors"
              >
                Voltar
              </button>
              <button
                onClick={() => handleCancelar(confirmarCancelar)}
                disabled={cancelando === confirmarCancelar.idPagamento}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white text-sm font-semibold transition-colors"
              >
                {cancelando === confirmarCancelar.idPagamento
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : null}
                Cancelar Pagamento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL DETALHES PAGAMENTO ==================== */}
      {detalhesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8 w-full max-w-sm relative">
            <button
              onClick={() => setDetalhesModal(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center mb-5">
              {detalhesModal.pagamento.metodo === "PIX"
                ? <QrCode className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                : <CreditCard className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              }
              <h3 className="text-lg font-semibold">
                {detalhesModal.pagamento.metodo === "PIX" ? "Pagamento PIX" : "Boleto Bancário"}
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                Usuário: <strong className="text-white">{getUsuarioNameById(detalhesModal.pagamento.idUsuario)}</strong>
              </p>
              <p className="text-2xl font-bold text-green-400 mt-2">{detalhesModal.pagamento.valor}</p>
            </div>
            {loadingDetalhes && (
              <div className="flex justify-center py-6">
                <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
              </div>
            )}
            {detalhesModal.detalhes && (
              <>
                {/* PIX */}
                {detalhesModal.detalhes.pixQrCodeBase64 && (
                  <div className="flex justify-center mb-4">
                    <img
                      src={`data:image/png;base64,${detalhesModal.detalhes.pixQrCodeBase64}`}
                      alt="QR Code PIX"
                      className="w-48 h-48 rounded-xl border border-gray-700"
                    />
                  </div>
                )}
                {detalhesModal.detalhes.pixQrCode && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1 text-center">Copia e Cola</p>
                    <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2">
                      <span className="text-xs text-gray-300 font-mono truncate flex-1">{detalhesModal.detalhes.pixQrCode}</span>
                      <button
                        onClick={() => handleCopy(detalhesModal.detalhes!.pixQrCode!)}
                        className="shrink-0 text-purple-400 hover:text-purple-300 transition-colors"
                        title="Copiar código PIX"
                      >
                        {copied ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}
                {detalhesModal.detalhes.pixTicketUrl && (
                  <a href={detalhesModal.detalhes.pixTicketUrl} target="_blank" rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-colors mb-3"
                  >
                    Abrir página de pagamento
                  </a>
                )}
                {/* Boleto */}
                {detalhesModal.detalhes.barcode && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1 text-center">Código de Barras</p>
                    <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2">
                      <span className="text-xs text-gray-300 font-mono truncate flex-1">{detalhesModal.detalhes.barcode}</span>
                      <button
                        onClick={() => handleCopy(detalhesModal.detalhes!.barcode!)}
                        className="shrink-0 text-purple-400 hover:text-purple-300 transition-colors"
                        title="Copiar código de barras"
                      >
                        {copied ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}
                {detalhesModal.detalhes.boletoUrl && (
                  <a href={detalhesModal.detalhes.boletoUrl} target="_blank" rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-colors mb-3"
                  >
                    Visualizar / Imprimir Boleto
                  </a>
                )}
                {!detalhesModal.detalhes.pixQrCode && !detalhesModal.detalhes.boletoUrl && (
                  <p className="text-center text-sm text-gray-500 py-2">Detalhes não disponíveis para este pagamento.</p>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* ==================== PAGAMENTOS TAB ==================== */}
      {activeTab === "pagamentos" && (
        <div className="space-y-6">

          {/* Pagamentos Pendentes — derivados da planilha */}
          {(() => {
            const pendentesLocais = pagamentos.filter((p) => p.status === "Pendente");
            if (loadingPag || pendentesLocais.length === 0) return null;
            return (
              <div className="bg-gray-900 border border-amber-500/30 rounded-2xl p-6 sm:p-8">
                <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                  <AlertCircle className="w-5 h-5 text-amber-400" />
                  Pagamentos Pendentes
                  <span className="ml-auto text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-md font-medium">{pendentesLocais.length}</span>
                </h2>
                <div className="space-y-3">
                  {pendentesLocais.map((p) => (
                    <div key={p.idPagamento} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                          {p.metodo === "PIX" ? <QrCode className="w-4 h-4 text-amber-400" /> : <CreditCard className="w-4 h-4 text-amber-400" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{getUsuarioNameById(p.idUsuario)}</p>
                          <p className="text-xs text-gray-500">{p.metodo} · {p.valor} · {p.dataPagamento}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-md font-medium">Pendente</span>
                        {(p.metodo === "PIX" || p.metodo === "Boleto") && (
                          <button
                            onClick={() => handleVerDetalhes(p)}
                            className="flex items-center gap-1.5 text-xs bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 px-3 py-1.5 rounded-lg font-medium transition-colors"
                          >
                            {p.metodo === "PIX" ? <QrCode className="w-3.5 h-3.5" /> : <CreditCard className="w-3.5 h-3.5" />}
                            {p.metodo === "PIX" ? "Ver QR Code" : "Ver Boleto"}
                          </button>
                        )}
                        <button
                          onClick={() => setConfirmarCancelar(p)}
                          disabled={cancelando === p.idPagamento}
                          className="flex items-center gap-1.5 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {cancelando === p.idPagamento
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <XCircle className="w-3.5 h-3.5" />}
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-purple-400" />
              Histórico de Pagamentos
            </h2>
            {pagamentos.length > 0 && (
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={searchPag}
                  onChange={(e) => { setSearchPag(e.target.value); setPagePag(1); }}
                  placeholder="Buscar pagamento..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
            )}
          </div>

          {loadingPag ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
          ) : pagamentos.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Nenhum pagamento encontrado</p>
            </div>
          ) : filteredPagamentos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Search className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>Nenhum resultado para &quot;{searchPag}&quot;</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Gamepad2 className="w-3.5 h-3.5" /> Usuário
                        </div>
                      </th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Hash className="w-3.5 h-3.5" /> ID Pagamento
                        </div>
                      </th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" /> Data
                        </div>
                      </th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">
                        <div className="flex items-center gap-1.5">
                          <DollarSign className="w-3.5 h-3.5" /> Valor
                        </div>
                      </th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">
                        <div className="flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5" /> Método
                        </div>
                      </th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5" /> Status
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedPagamentos.map((p, i) => (
                      <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                        <td className="py-3 px-4 text-purple-400 font-medium">{getUsuarioNameById(p.idUsuario)}</td>
                        <td className="py-3 px-4 text-white font-mono">{p.idPagamento}</td>
                        <td className="py-3 px-4 text-gray-300">{p.dataPagamento}</td>
                        <td className="py-3 px-4 text-green-400 font-medium">{p.valor}</td>
                        <td className="py-3 px-4">
                          <span className="bg-purple-500/10 text-purple-400 px-2.5 py-1 rounded-md text-xs font-medium">
                            {p.metodo}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                            p.status === "Aprovado"
                              ? "bg-green-500/10 text-green-400"
                              : p.status === "Pendente"
                              ? "bg-amber-500/10 text-amber-400"
                              : p.status === "Recusado"
                              ? "bg-red-500/10 text-red-400"
                              : "bg-gray-500/10 text-gray-400"
                          }`}>
                            {p.status || "—"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalPagesPag > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-800">
                  <span className="text-xs text-gray-500">{filteredPagamentos.length} resultado(s) — Página {pagePag} de {totalPagesPag}</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setPagePag((p) => Math.max(1, p - 1))} disabled={pagePag === 1} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                    <button onClick={() => setPagePag((p) => Math.min(totalPagesPag, p + 1))} disabled={pagePag === totalPagesPag} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronRight className="w-4 h-4" /></button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        </div>
      )}

      {/* ==================== HISTORICO TAB ==================== */}
      {activeTab === "historico" && (
        <div className="space-y-6">

          {/* AUTHMAC table */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Wifi className="w-5 h-5 text-purple-400" />
                MACs Autorizados
              </h2>
              {authMacs.length > 0 && (
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={searchMac}
                    onChange={(e) => { setSearchMac(e.target.value); setPageMac(1); }}
                    placeholder="Buscar MAC ou usuário..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>
              )}
            </div>

            {loadingMacs ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
              </div>
            ) : authMacs.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                <Wifi className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Nenhum MAC registrado</p>
                <p className="text-sm mt-1 text-gray-600">Os MACs serão registrados automaticamente ao fazer login.</p>
              </div>
            ) : filteredMacs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Search className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>Nenhum resultado para &quot;{searchMac}&quot;</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-800">
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">
                          <div className="flex items-center gap-1.5"><Gamepad2 className="w-3.5 h-3.5" /> Usuário</div>
                        </th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">
                          <div className="flex items-center gap-1.5"><Monitor className="w-3.5 h-3.5" /> MAC</div>
                        </th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">
                          <div className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> Status</div>
                        </th>
                        <th className="text-center py-3 px-4 text-gray-400 font-medium">Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedMacs.map((m) => (
                        <tr key={m.rowIndex} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                          <td className="py-3 px-4 text-purple-400 font-medium">{m.usuario}</td>
                          <td className="py-3 px-4 text-white font-mono text-xs">{m.mac}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${
                              m.status === "Autorizado"
                                ? "bg-green-500/10 text-green-400"
                                : "bg-red-500/10 text-red-400"
                            }`}>
                              {m.status === "Autorizado"
                                ? <CheckCircle className="w-3.5 h-3.5" />
                                : <XCircle className="w-3.5 h-3.5" />
                              }
                              {m.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => toggleMacStatus(m)}
                              disabled={togglingMac === m.rowIndex}
                              title={m.status === "Autorizado" ? "Bloquear MAC" : "Autorizar MAC"}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                m.status === "Autorizado"
                                  ? "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20"
                                  : "bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20"
                              }`}
                            >
                              {togglingMac === m.rowIndex ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : m.status === "Autorizado" ? (
                                <><XCircle className="w-3.5 h-3.5" /> Bloquear</>
                              ) : (
                                <><CheckCircle className="w-3.5 h-3.5" /> Autorizar</>
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {totalPagesMac > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-800">
                    <span className="text-xs text-gray-500">{filteredMacs.length} resultado(s) — Página {pageMac} de {totalPagesMac}</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setPageMac((p) => Math.max(1, p - 1))} disabled={pageMac === 1} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                      <button onClick={() => setPageMac((p) => Math.min(totalPagesMac, p + 1))} disabled={pageMac === totalPagesMac} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronRight className="w-4 h-4" /></button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Histórico de Login table */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-400" />
                Histórico de Login
              </h2>
              {historico.length > 0 && (
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={searchHist}
                    onChange={(e) => { setSearchHist(e.target.value); setPageHist(1); }}
                    placeholder="Buscar no histórico..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>
              )}
            </div>

          {loadingHist ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
          ) : historico.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Nenhum registro de login encontrado</p>
            </div>
          ) : filteredHistorico.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Search className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>Nenhum resultado para &quot;{searchHist}&quot;</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Gamepad2 className="w-3.5 h-3.5" /> Usuário
                        </div>
                      </th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" /> Horário
                        </div>
                      </th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5" /> IP
                        </div>
                      </th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Monitor className="w-3.5 h-3.5" /> MAC
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedHistorico.map((h, i) => (
                      <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                        <td className="py-3 px-4 text-purple-400 font-medium">{h.usuario}</td>
                        <td className="py-3 px-4 text-gray-300">{h.horario}</td>
                        <td className="py-3 px-4 text-white font-mono text-xs">{h.ip}</td>
                        <td className="py-3 px-4 text-white font-mono text-xs">{h.mac}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalPagesHist > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-800">
                  <span className="text-xs text-gray-500">{filteredHistorico.length} resultado(s) — Página {pageHist} de {totalPagesHist}</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setPageHist((p) => Math.max(1, p - 1))} disabled={pageHist === 1} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                    <button onClick={() => setPageHist((p) => Math.min(totalPagesHist, p + 1))} disabled={pageHist === totalPagesHist} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronRight className="w-4 h-4" /></button>
                  </div>
                </div>
              )}
            </>
          )}
          </div>
        </div>
      )}
    </div>
  );
}
