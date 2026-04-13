import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../components/ThemeProvider";
import { AppShell } from "../components/AppShell";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BlogOps Admin Panel",
  description: "Management dashboard for BlogOps multi-tenant service",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-fixed bg-gradient-to-br from-indigo-50/40 via-background to-blue-50/30 dark:from-indigo-950/20 dark:via-background dark:to-slate-900/30 min-h-screen`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AppShell>
            {children}
          </AppShell>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
