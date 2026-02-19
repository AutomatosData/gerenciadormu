import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Header from "@/components/Header";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gerenciador MU",
  description: "Gerencie seus usuários e cadastros do MU Online",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} font-sans antialiased bg-gray-950 text-white`}>
        <AuthProvider>
          <Header />
          <main className="pt-16 min-h-screen">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
