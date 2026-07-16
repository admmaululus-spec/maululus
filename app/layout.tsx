// app/layout.tsx
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import CookieBanner from "./components/CookieBanner"; // <-- 1. Import Cookie Banner

// Konfigurasi Font Poppins
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"], // Normal hingga Extrabold
  variable: "--font-poppins",
  display: "swap",
});

// 1. UPDATE METADATA (SEO Dasar & OpenGraph)
export const metadata: Metadata = {
  title: "Maululus — Asisten AI untuk Skripsi & Penelitian",
  description: "Maululus membantu mahasiswa menemukan judul skripsi, menyusun proposal, mencari referensi jurnal, dan membangun kerangka penelitian lebih cepat dengan bantuan AI.",
  verification: {
    google : "ljA5bTYsmXqA8Hl09-LNQZNKp8GnTl5gIKe5fKc9zqE",
   },
  keywords: [
    "AI Skripsi", 
    "Generator Judul Skripsi", 
    "Asisten Penelitian AI", 
    "Cara Cepat Lulus Skripsi", 
    "Outline Skripsi", 
    "Parafrase Turnitin"
  ],
  openGraph: {
    title: "Maululus — Asisten AI untuk Skripsi & Penelitian",
    description: "Bantu temukan judul, susun proposal, dan kerangka penelitian lebih cepat dengan AI.",
    url: "https://maululus.id", // Ganti dengan domain aslimu
    siteName: "Maululus",
    locale: "id_ID",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  // 2. SCHEMA MARKUP (JSON-LD) UNTUK MEMANCING SITELINKS ("Sub-menu" di Google)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Maululus",
    "url": "https://maululus.id", // Ganti dengan domain aslimu
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://maululus.id/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    },
    "hasPart": [
      {
        "@type": "WebPage",
        "name": "Generator Judul",
        "url": "https://maululus.id/generator"
      },
      {
        "@type": "WebPage",
        "name": "AI Copilot",
        "url": "https://maululus.id/dashboard/copilot"
      },
      {
        "@type": "WebPage",
        "name": "Daftar Gratis",
        "url": "https://maululus.id/auth"
      }
    ]
  };

  return (
    // 3. UBAH LANG="EN" JADI "ID" UNTUK SEO LOKAL INDONESIA
    <html lang="id" className="scroll-smooth">
      <head>
        {/* Menyuntikkan JSON-LD ke dalam Head */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${poppins.variable} font-sans antialiased text-slate-900 bg-slate-50`}>
        {children}
        
        {/* 4. Pasang Cookie Banner di Sini */}
        <CookieBanner />
        
        {/* SCRIPT MIDTRANS SUDAH DIHAPUS DARI SINI AGAR TIDAK BENTROK DENGAN GOOGLE LOGIN */}
      </body>
    </html>
  );
}