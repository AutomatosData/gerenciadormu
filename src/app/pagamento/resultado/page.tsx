"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { CheckCircle, XCircle, Clock, ArrowLeft, CreditCard } from "lucide-react";
import Link from "next/link";

function ResultadoContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status") || "unknown";

  const configs: Record<string, { icon: React.ReactNode; title: string; message: string; color: string; bgColor: string }> = {
    success: {
      icon: <CheckCircle className="w-20 h-20" />,
      title: "Pagamento Aprovado!",
      message: "Seu pagamento foi processado com sucesso. Seu plano será ativado em instantes.",
      color: "text-green-400",
      bgColor: "bg-green-500/10 border-green-500/30",
    },
    failure: {
      icon: <XCircle className="w-20 h-20" />,
      title: "Pagamento Recusado",
      message: "Houve um problema com o seu pagamento. Tente novamente ou use outro método de pagamento.",
      color: "text-red-400",
      bgColor: "bg-red-500/10 border-red-500/30",
    },
    pending: {
      icon: <Clock className="w-20 h-20" />,
      title: "Pagamento Pendente",
      message: "Seu pagamento está sendo processado. Assim que for confirmado, seu plano será ativado automaticamente.",
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10 border-yellow-500/30",
    },
    unknown: {
      icon: <CreditCard className="w-20 h-20" />,
      title: "Status Desconhecido",
      message: "Não foi possível determinar o status do pagamento. Verifique seu painel para mais informações.",
      color: "text-gray-400",
      bgColor: "bg-gray-500/10 border-gray-500/30",
    },
  };

  const config = configs[status] || configs.unknown;

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className={`max-w-md w-full border rounded-2xl p-8 text-center ${config.bgColor}`}>
        <div className={`${config.color} flex justify-center mb-6`}>
          {config.icon}
        </div>
        <h1 className="text-2xl font-bold mb-3">{config.title}</h1>
        <p className="text-gray-400 mb-8">{config.message}</p>

        <div className="flex flex-col gap-3">
          <Link
            href="/painel"
            className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-semibold transition-colors"
          >
            Ir para o Painel
          </Link>
          {status === "failure" && (
            <Link
              href="/pagamento"
              className="flex items-center justify-center gap-2 border border-gray-700 hover:border-purple-500 text-gray-300 hover:text-white py-3 rounded-xl font-semibold transition-colors"
            >
              <CreditCard className="w-4 h-4" />
              Tentar Novamente
            </Link>
          )}
          <Link
            href="/"
            className="flex items-center justify-center gap-2 text-gray-500 hover:text-gray-300 py-2 text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Início
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResultadoPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ResultadoContent />
    </Suspense>
  );
}
