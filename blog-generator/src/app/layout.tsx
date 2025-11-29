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

export const metadata: Metadata = {
  title: "Agentic Geo-SEO Review Generator",
  description:
    "Generate localized, affiliate-ready product review articles with ChatGPT, Nano Banana imagery, and automated spell checking.",
  metadataBase: new URL("https://agentic-1c19b819.vercel.app"),
  openGraph: {
    title: "Agentic Geo-SEO Review Generator",
    description:
      "Create Google Discover-friendly review articles from any product link with AI, GEO targeting, and affiliate automation.",
    url: "https://agentic-1c19b819.vercel.app",
    siteName: "Agentic Geo-SEO Review Generator",
  },
  alternates: {
    canonical: "https://agentic-1c19b819.vercel.app",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
