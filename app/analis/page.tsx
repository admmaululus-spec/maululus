import Link from "next/link";

export default function AnalystProfilePage() {
  return (
    <div className="min-h-screen bg-brand-light p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-brand-navy mb-8 text-center">Kenalan dengan Analis Kami</h1>
        
        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col md:flex-row gap-6 items-center">
          <div className="w-32 h-32 bg-gray-200 rounded-full flex-shrink-0 border-4 border-brand-emerald overflow-hidden">
             {/* Ganti dengan Image Next.js */}
            <img src="/avatar-analis.jpg" alt="Analis" className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-brand-navy">Budi Santoso, M.Kom</h2>
            <p className="text-brand-emerald font-semibold mb-2">Spesialis IT & Software Engineering</p>
            <p className="text-gray-600 mb-4">
              Berpengalaman membimbing ratusan mahasiswa dalam menyusun arsitektur sistem dan metodologi penelitian skripsi bidang teknologi informasi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}