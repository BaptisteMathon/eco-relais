import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { AuthSync } from "@/components/providers/auth-sync";
import { SessionIdleProvider } from "@/components/providers/session-idle-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { I18nProvider } from "@/lib/i18n";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale = (cookieStore.get("eco_relais_locale")?.value as "fr" | "en") ?? "fr";
  const messages =
    locale === "en"
      ? (await import("@/messages/en.json")).default
      : (await import("@/messages/fr.json")).default;
  const m = (messages as {
    metadata: {
      title: string;
      titleTemplate: string;
      description: string;
      openGraphTitle: string;
      openGraphDescription: string;
      keywords: string[];
    };
  }).metadata;
  return {
    title: { default: m.title, template: m.titleTemplate },
    description: m.description,
    keywords: m.keywords,
    openGraph: { title: m.openGraphTitle, description: m.openGraphDescription },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const locale = (cookieStore.get("eco_relais_locale")?.value as "fr" | "en") ?? "fr";
  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <I18nProvider>
            <QueryProvider>
              <AuthSync>
                <SessionIdleProvider>
                  <TooltipProvider delayDuration={0}>
                    {children}
                    <Toaster position="top-right" richColors />
                  </TooltipProvider>
                </SessionIdleProvider>
              </AuthSync>
            </QueryProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
