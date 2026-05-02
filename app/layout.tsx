import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Atau font bawaan kamu
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

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
    // Tambahkan class scroll-smooth di sini
    <html lang="en" className="scroll-smooth"> 
      <body className={inter.className}>{children}</body>
    </html>
  );
}