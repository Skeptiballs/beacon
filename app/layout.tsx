import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/hooks/useQueryProvider";
import { AppHeader } from "@/components/layout/AppHeader";
import { APP_CONFIG } from "@/config/app";

const inter = Inter({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: APP_CONFIG.name,
  description: APP_CONFIG.description,
  icons: {
    icon: [
      {
        url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2310b981' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M19.07 4.93A10 10 0 0 0 6.99 3.34'/%3E%3Cpath d='M4 6h.01'/%3E%3Cpath d='M2.29 9.62A10 10 0 1 0 21.31 8.35'/%3E%3Cpath d='M16.24 7.76A6 6 0 1 0 8.23 16.67'/%3E%3Cpath d='M12 18h.01'/%3E%3Cpath d='M17.99 11.66A6 6 0 0 1 15.77 16.67'/%3E%3Ccircle cx='12' cy='12' r='2'/%3E%3Cpath d='m13.41 10.59 5.66-5.66'/%3E%3C/svg%3E",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col`}>
        <QueryProvider>
          <AppHeader />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}

