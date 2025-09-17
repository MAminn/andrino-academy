import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "أكاديمية أندرينو | Andrino Academy",
  description: "أكاديمية متخصصة في تعليم البرمجة والتقنية للأطفال والشباب",
  keywords: ["برمجة", "تعليم", "أطفال", "تقنية", "أكاديمية"],
  authors: [{ name: "Andrino Academy" }],
  openGraph: {
    title: "أكاديمية أندرينو | Andrino Academy",
    description: "أكاديمية متخصصة في تعليم البرمجة والتقنية للأطفال والشباب",
    type: "website",
    locale: "ar_SA",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='ar' dir='rtl'>
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <Header />
        <main className='flex-1'>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
