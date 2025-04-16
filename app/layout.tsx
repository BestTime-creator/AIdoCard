import { EnvVarWarning } from "@/components/env-var-warning";
import HeaderAuth from "@/components/header-auth";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import Link from "next/link";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "AI总结卡片",
  description: "使用AI将您的文章转换为精美的总结卡片",
  icons: {
    icon: [
      {
        url: '/images/weblogo/logo.svg',
        type: 'image/svg+xml',
        sizes: 'any'
      }
    ],
    shortcut: '/images/weblogo/logo.svg',
    apple: '/images/weblogo/logo.svg',
  },
};

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh" className={geistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="min-h-screen flex flex-col items-center">
            <div className="flex-1 w-full flex flex-col gap-3 items-center">
              <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
                <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
                  <div className="flex gap-5 items-center">
                    <Link href="/" className="text-blue-600 text-2xl font-bold">AI总结卡片</Link>
                    <div className="hidden sm:flex gap-4">
                      <Link href="/about" className="hover:text-blue-600 transition-colors">关于</Link>
                      <Link href="/support" className="hover:text-blue-600 transition-colors">帮助</Link>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {!hasEnvVars ? <EnvVarWarning /> : <HeaderAuth />}
                    <div className="ml-2">
                      <ThemeSwitcher />
                    </div>
                  </div>
                </div>
              </nav>
              <div className="flex flex-col gap-4 max-w-5xl p-4">
                {children}
              </div>

              <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-6">
                <p className="text-gray-600 dark:text-gray-400">© 2025 AI总结卡片</p>
              </footer>
            </div>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
