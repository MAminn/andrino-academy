import type { Metadata } from "next";
import { Inter, Cairo, Tajawal } from "next/font/google";
import "./globals.css";
import PromoBanner from "./components/PromoBanner";
import Header from "./components/Header";
import Footer from "./components/Footer";
import FloatingCTA from "./components/FloatingCTA";
import { Providers } from "./providers";

// Arabic fonts with proper Arabic subsets
const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["latin", "arabic"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["latin", "arabic"],
  display: "swap",
  weight: ["300", "400", "500", "700"],
});

// Fallback font for Latin text
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "أكاديمية أندرينو | Andrino Academy",
    template: "%s | أكاديمية أندرينو",
  },
  description:
    "أكاديمية أندرينو - منصة التعليم الإلكتروني للتعلم باللغتين العربية والإنجليزية",
  other: {
    "arabic-support": "true",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='ar' dir='rtl'>
      <body
        className={`${cairo.variable} ${tajawal.variable} ${inter.variable} font-arabic antialiased bg-white min-h-screen flex flex-col text-brand-blue`}>
        <Providers>
          <PromoBanner />
          <Header />
          <main className='flex-1 container mx-auto px-4 py-8 bg-gray-50 text-right'>
            {children}
          </main>
          <Footer />
          <FloatingCTA />
        </Providers>
      </body>
    </html>
  );
}
