import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

// Konfigurasi Font Poppins (Wajib mendefinisikan weight karena Poppins bukan variable font)
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"], // Normal hingga Extrabold
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Maululus - AI Skripsi Generator",
  description: "Kalau 'Mau Lulus' Tunggu Kami",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      {/* Menyuntikkan variabel Poppins ke seluruh tag body */}
      <body className={`${poppins.variable} font-sans antialiased text-slate-900 bg-slate-50`}>
        {children}
      </body>
    </html>
  );
}