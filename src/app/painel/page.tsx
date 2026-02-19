"use client";

import { useEffect, useState } from "react";
import { useAuth, Usuario } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
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
} from "lucide-react";
import Link from "next/link";

interface Pagamento {
  idUsuario: string;
  idPagamento: string;
  dataPagamento: string;
  valor: string;
  metodo: string;
}

interface HistoricoLogin {
  horario: string;
  usuario: string;
  ip: string;
  mac: string;
}

type Tab = "perfil" | "usuarios" | "pagamentos" | "historico";

const PAGE_SIZE = 10;

export default function PainelPage() {
  const { user, usuarios, setUser, refreshUsuarios, loading: authLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>("usuarios");
  const [form, setForm] = useState({ nome: "", email: "", whatsapp: "" });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  // New child usuario form
  const [newUsuario, setNewUsuario] = useState("");
  const [addingUser, setAddingUser] = useState(false);
  const [addUserMsg, setAddUserMsg] = useState("");

  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [loadingPag, setLoadingPag] = useState(false);

  const [historico, setHistorico] = useState<HistoricoLogin[]>([]);
  const [loadingHist, setLoadingHist] = useState(false);

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
        whatsapp: user.whatsapp,
      });
    }
  }, [user]);

  useEffect(() => {
    if (user && activeTab === "pagamentos") {
      fetchAllPagamentos();
    }
    if (user && activeTab === "historico") {
      fetchAllHistorico();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, user]);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
        body: JSON.stringify(form),
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
    return getUsuarioNameById(p.idUsuario).toLowerCase().includes(q) || p.idPagamento.toLowerCase().includes(q) || p.dataPagamento.toLowerCase().includes(q) || p.valor.toLowerCase().includes(q) || p.metodo.toLowerCase().includes(q);
  });
  const totalPagesPag = Math.max(1, Math.ceil(filteredPagamentos.length / PAGE_SIZE));
  const pagedPagamentos = filteredPagamentos.slice((pagePag - 1) * PAGE_SIZE, pagePag * PAGE_SIZE);

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

      {/* ==================== PAGAMENTOS TAB ==================== */}
      {activeTab === "pagamentos" && (
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
      )}

      {/* ==================== HISTORICO TAB ==================== */}
      {activeTab === "historico" && (
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
      )}
    </div>
  );
}
