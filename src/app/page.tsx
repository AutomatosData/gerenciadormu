"use client";

import { useAuth } from "@/context/AuthContext";
import { Play, Shield, Users, Zap, Download, HeadphonesIcon } from "lucide-react";
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
              dos seus personagens de MU Online em um só lugar.
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

      {/* Download Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold">
            Baixe o <span className="text-purple-400">Gerenciador MU</span>
          </h2>
          <p className="mt-3 text-gray-400">
            Tenha o sistema completo para gerenciar seu personagens de MU Online.
          </p>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 hover:border-purple-500/50 transition-colors">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2">Aplicação Completa</h3>
              <p className="text-gray-400 mb-4">
                Versão mais recente do Gerenciador MU com todas as funcionalidades:
                AutoBC, AutoDS, AutoCC e AutoLogin e muito mais!
              </p>
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full">Windows</span>
                <span className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full">Completo</span>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <a
                href="https://drive.google.com/drive/folders/1aX_HTzw2UcFGkcwZB-XGVNsr3w23QIsb"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                Baixar Agora
              </a>
              <p className="text-xs text-gray-500 text-center">
                Acesso ao Google Drive
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 hover:border-purple-500/50 transition-colors">
            <Users className="w-10 h-10 text-purple-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Gestão de Usuários</h3>
            <p className="text-gray-400">
              Cadastre e gerencie todos os seus usuários com facilidade.
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

      {/* Suporte CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-br from-purple-900/30 to-gray-900 border border-purple-500/20 rounded-2xl p-8 sm:p-12 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 mb-5">
            <HeadphonesIcon className="w-7 h-7 text-purple-400" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">
            Precisa de <span className="text-purple-400">ajuda?</span>
          </h2>
          <p className="text-gray-400 mb-6 max-w-xl mx-auto">
            Nossa equipe está pronta para te ajudar. Abra um chamado ou entre em contato diretamente pelo WhatsApp.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/suporte"
              className="bg-purple-600 hover:bg-purple-700 text-white px-7 py-3 rounded-xl font-semibold transition-colors flex items-center gap-2"
            >
              <HeadphonesIcon className="w-5 h-5" />
              Abrir Chamado
            </Link>
            <a
              href="https://wa.me/5521980061918"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-green-500/40 hover:border-green-500 bg-green-500/10 hover:bg-green-500/20 text-green-400 px-7 py-3 rounded-xl font-semibold transition-colors flex items-center gap-2"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp
            </a>
          </div>
        </div>
      </section>

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
