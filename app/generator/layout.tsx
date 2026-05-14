import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Generator Judul Skripsi AI | Maululus',
  description: 'Dapatkan 3 ide judul skripsi yang anti-pasaran dan spesifik untuk jurusanmu. AI kami meraciknya berdasarkan jurnal dan metodologi terbaru.',
  alternates: {
    canonical: 'https://maululus.com/generator', // Sesuaikan dengan domain asli
  },
};

export default function GeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}