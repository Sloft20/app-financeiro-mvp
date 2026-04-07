import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/providers/QueryProvider";
import AuthProvider from "@/components/providers/AuthProvider";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#0f172a", // slate-900 for mobile
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "App-Financeiro Cofre",
  description: "B2C Financial SaaS PWA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-slate-900 flex items-center justify-center min-h-[100dvh] text-slate-800 antialiased overflow-hidden`}>
        <QueryProvider>
          <AuthProvider>
            <main className="w-full max-w-md h-[100dvh] bg-slate-50 relative overflow-hidden flex flex-col sm:max-h-[850px] sm:rounded-[3rem] sm:border-[12px] sm:border-slate-800 sm:shadow-2xl mx-auto ring-1 ring-white/10">
              {children}
            </main>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
