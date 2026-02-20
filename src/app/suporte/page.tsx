"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Send, CheckCircle, HeadphonesIcon, Mail, MessageSquare } from "lucide-react";
import Link from "next/link";

export default function SuportePage() {
  const { user, loading: authLoading } = useAuth();

  const [assunto, setAssunto] = useState("");
  const [descricao, setDescricao] = useState("");
  const [contato, setContato] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/suporte", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuarioPai: user?.usuarioPai || "",
          assunto,
          descricao,
          contato: user ? undefined : contato,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao enviar mensagem");
      } else {
        setSuccess(true);
        setAssunto("");
        setDescricao("");
        setContato("");
      }
    } catch {
      setError("Erro de conexão. Tente novamente.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 mb-4">
            <HeadphonesIcon className="w-8 h-8 text-purple-400" />
          </div>
          <h1 className="text-3xl font-bold mb-3">Central de Suporte</h1>
          <p className="text-gray-400 text-base">
            Preencha o formulário abaixo e entraremos em contato o mais breve possível.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-sm">
            <Mail className="w-4 h-4 text-purple-400 shrink-0" />
            <span className="text-gray-400">Ou envie um e-mail para</span>
            <a
              href="mailto:suporte@gerenciadormu.com.br"
              className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
            >
              suporte@gerenciadormu.com.br
            </a>
          </div>
        </div>

        {/* Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8">
          {success ? (
            <div className="text-center py-8">
              <CheckCircle className="w-14 h-14 text-green-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Mensagem enviada!</h2>
              <p className="text-gray-400 mb-6">
                Recebemos sua solicitação. Entraremos em contato em breve.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
              >
                Enviar outra mensagem
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Campo Contato — apenas para não logados */}
              {!authLoading && !user && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Contato <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={contato}
                    onChange={(e) => setContato(e.target.value)}
                    placeholder="Seu WhatsApp ou e-mail para retorno"
                    required
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              )}

              {/* Usuário logado — mostrar identificação */}
              {!authLoading && user && (
                <div className="flex items-center gap-3 bg-purple-500/10 border border-purple-500/20 rounded-xl px-4 py-3">
                  <MessageSquare className="w-4 h-4 text-purple-400 shrink-0" />
                  <p className="text-sm text-gray-300">
                    Enviando como <strong className="text-white">{user.usuarioPai}</strong>
                  </p>
                </div>
              )}

              {/* Assunto */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Assunto <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={assunto}
                  onChange={(e) => setAssunto(e.target.value)}
                  placeholder="Ex: Problema com pagamento, dúvida sobre plano..."
                  required
                  maxLength={120}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Descrição <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Descreva sua dúvida ou problema com o máximo de detalhes possível..."
                  required
                  rows={5}
                  maxLength={1000}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                />
                <p className="text-xs text-gray-600 mt-1 text-right">{descricao.length}/1000</p>
              </div>

              {error && (
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white font-semibold transition-colors disabled:cursor-not-allowed"
              >
                {loading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Enviando...</>
                ) : (
                  <><Send className="w-5 h-5" /> Enviar Mensagem</>
                )}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-gray-600 mt-6">
          Respondemos em até 24 horas úteis.
        </p>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} Gerenciador MU. Todos os direitos reservados.
          </p>
          <p className="text-sm text-gray-500">
            Criado por{" "}
            <a
              href="https://www.automatosdata.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
            >
              AutomatosData
            </a>
          </p>
        </div>
      </footer>

      {/* Botão flutuante WhatsApp */}
      <a
        href="https://wa.me/5521980061918"
        target="_blank"
        rel="noopener noreferrer"
        title="Falar no WhatsApp"
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-green-500 hover:bg-green-400 shadow-lg shadow-green-500/30 transition-all hover:scale-110"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>
    </div>
  );
}
