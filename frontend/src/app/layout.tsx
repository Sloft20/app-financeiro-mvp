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
            <main className="w-full md:max-w-2xl lg:max-w-5xl h-[100dvh] bg-slate-50 relative overflow-hidden flex flex-col mx-auto md:shadow-2xl md:ring-1 md:ring-slate-200">
              {children}
            </main>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
