// ==========================================
// LAYOUT PRINCIPAL DE LA APLICACIÓN
// ==========================================

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@/shared/utils/ssr-polyfills";
import { APP_CONFIG } from "@/shared/constants";
import { Providers } from "@/shared/providers/providers";
import { GlobalNavbar } from "@/components/layout/global-navbar";

// Configuración de fuente Inter para mejor legibilidad
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Metadatos de la aplicación
export const metadata: Metadata = {
  title: {
    default: APP_CONFIG.name,
    template: `%s | ${APP_CONFIG.name}`,
  },
  description: APP_CONFIG.description,
  keywords: [
    "servicios profesionales",
    "freelancers",
    "trabajo",
    "colombia",
    "contratación",
    "profesionales",
    "clientes",
    "plataforma de servicios",
    "empleo",
    "oportunidades laborales",
    "Aguachica",
  ],
  authors: [{ name: APP_CONFIG.companyName }],
  creator: APP_CONFIG.companyName,
  publisher: APP_CONFIG.companyName,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(APP_CONFIG.url),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: APP_CONFIG.url,
    title: APP_CONFIG.name,
    description: APP_CONFIG.description,
    siteName: APP_CONFIG.name,
  },
  twitter: {
    card: "summary_large_image",
    title: APP_CONFIG.name,
    description: APP_CONFIG.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // google: "google-verification-code", // Agregar en producción
  },
};

// Viewport para responsive design
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={inter.variable} suppressHydrationWarning>
      <body
        className="min-h-screen bg-background font-sans antialiased"
        suppressHydrationWarning
      >
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <GlobalNavbar />
            <main className="flex-1">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
