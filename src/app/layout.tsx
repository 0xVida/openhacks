import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { ThemeProvider } from '@/components/providers/theme-provider';
import { SidebarProvider } from '@/components/providers/sidebar-context';
import { RoleProvider } from '@/components/providers/role-context';
import { AuthProvider } from '@/components/providers/auth-provider';
import RootContainer from '@/components/layout/RootContainer';
import Sidebar from '@/components/layout/Sidebar';
import TopNav from '@/components/layout/TopNav';
import MobileNav from '@/components/layout/MobileNav';

export const metadata: Metadata = {
  title: "OpenHacks - Contribution Dashboard",
  description: "Modern open source contribution platform",
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <AuthProvider>
            <RoleProvider>
              <SidebarProvider>
                <div className="flex h-screen bg-background text-foreground overflow-hidden relative">
                   <Sidebar />
                   <RootContainer>
                      <TopNav />
                      <main className="flex-1 flex flex-col min-h-0 overflow-y-auto pb-16 md:pb-0">
                        {children}
                      </main>
                   </RootContainer>
                   <MobileNav />
                </div>
              </SidebarProvider>
            </RoleProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
