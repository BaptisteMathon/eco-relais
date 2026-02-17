import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthSync } from "@/components/providers/auth-sync";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/lib/i18n";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Eco-Relais | Livraison hyperlocale",
    template: "%s | Eco-Relais",
  },
  description:
    "Eco-Relais - Livraison de colis hyperlocale et durable. Envoyez et recevez des colis avec des partenaires de proximité.",
  keywords: ["livraison", "hyperlocal", "eco", "durable", "colis", "delivery", "sustainable", "packages"],
  openGraph: {
    title: "Eco-Relais | Livraison hyperlocale",
    description: "Plateforme de livraison de colis durable et de proximité",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <I18nProvider>
          <ThemeProvider>
            <QueryProvider>
              <AuthSync>
                <TooltipProvider delayDuration={0}>
                  {children}
                  <Toaster position="top-right" richColors />
                </TooltipProvider>
              </AuthSync>
            </QueryProvider>
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
