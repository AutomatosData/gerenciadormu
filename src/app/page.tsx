"use client";

import { useAuth } from "@/context/AuthContext";
import { Play, Shield, Users, Zap } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-gray-950 to-gray-950" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">
              Gerenciador{" "}
              <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                MU Online
              </span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto">
              Gerencie seus usuários, acompanhe pagamentos e tenha controle total
              do seu servidor MU Online em um só lugar.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              {user ? (
                <Link
                  href="/painel"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl text-lg font-semibold transition-colors"
                >
                  Acessar Painel
                </Link>
              ) : (
                <>
                  <Link
                    href="/cadastro"
                    className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl text-lg font-semibold transition-colors"
                  >
                    Começar Agora
                  </Link>
                  <Link
                    href="/login"
                    className="border border-gray-700 hover:border-purple-500 text-gray-300 hover:text-white px-8 py-3 rounded-xl text-lg font-semibold transition-colors"
                  >
                    Já tenho conta
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold">
            Veja como <span className="text-purple-400">funciona</span>
          </h2>
          <p className="mt-3 text-gray-400">
            Assista ao vídeo abaixo para entender todas as funcionalidades do sistema.
          </p>
        </div>
        <div className="relative aspect-video rounded-2xl overflow-hidden border border-gray-800 bg-gray-900 shadow-2xl shadow-purple-500/10">
          {/* Placeholder - Substitua VIDEO_ID pelo ID do vídeo do YouTube */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
            <Play className="w-20 h-20 mb-4 text-purple-500/50" />
            <p className="text-lg font-medium">Vídeo em breve</p>
            <p className="text-sm text-gray-600 mt-1">
              O vídeo tutorial
            </p>
          </div>
          {/*
            Quando tiver o vídeo, descomente e substitua VIDEO_ID:
            <iframe
              className="absolute inset-0 w-full h-full"
              src="https://www.youtube.com/embed/VIDEO_ID"
              title="Como funciona o Gerenciador MU"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          */}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 hover:border-purple-500/50 transition-colors">
            <Users className="w-10 h-10 text-purple-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Gestão de Usuários</h3>
            <p className="text-gray-400">
              Cadastre e gerencie todos os usuários do seu servidor com facilidade.
            </p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 hover:border-purple-500/50 transition-colors">
            <Shield className="w-10 h-10 text-purple-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Controle de Acesso</h3>
            <p className="text-gray-400">
              Monitore o histórico de login com IP e MAC de cada usuário.
            </p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 hover:border-purple-500/50 transition-colors">
            <Zap className="w-10 h-10 text-purple-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Pagamentos</h3>
            <p className="text-gray-400">
              Acompanhe todos os pagamentos e histórico financeiro dos usuários.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} Gerenciador MU. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
