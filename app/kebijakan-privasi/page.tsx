import Link from 'next/link';

export default function KebijakanPrivasi() {
  return (
    <div className="min-h-screen bg-slate-50 py-16 px-6 font-sans text-[#0f2a4a]">
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-200">
        
        <Link href="/" className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 text-sm font-bold mb-8 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
          Kembali ke Beranda
        </Link>

        <h1 className="text-3xl font-extrabold mb-6 tracking-tight">Kebijakan Privasi</h1>
        
        <div className="space-y-6 text-slate-600 leading-relaxed text-sm md:text-base">
          <p className="font-medium text-slate-400">Terakhir diperbarui: 9 Juli 2026</p>

          <p>
            Selamat datang di <strong>Maululus</strong>. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, melindungi, dan membagikan informasi pribadi Anda saat Anda menggunakan layanan dan situs web kami.
          </p>

          <h2 className="text-xl font-bold text-[#0f2a4a] mt-8 mb-3">1. Informasi yang Kami Kumpulkan</h2>
          <p>Kami dapat mengumpulkan informasi berikut saat Anda mendaftar atau menggunakan layanan kami:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Informasi Identitas Pribadi:</strong> Nama lengkap, alamat email, nomor telepon/WhatsApp.</li>
            <li><strong>Informasi Akademik:</strong> Nama universitas, program studi/jurusan, NIM, dan draf judul skripsi.</li>
            <li><strong>Data Transaksi:</strong> Rincian paket yang dipesan dan riwayat pembayaran (kami tidak menyimpan data kartu kredit/debit secara langsung, semua diproses secara aman oleh *Payment Gateway* Midtrans).</li>
          </ul>

          <h2 className="text-xl font-bold text-[#0f2a4a] mt-8 mb-3">2. Penggunaan Informasi</h2>
          <p>Informasi yang kami kumpulkan digunakan untuk tujuan berikut:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Menyediakan layanan Generator AI dan asistensi Expert secara personal.</li>
            <li>Memproses transaksi pembayaran Anda dengan aman.</li>
            <li>Menghubungi Anda terkait pembaruan proyek, revisi, atau kendala layanan.</li>
            <li>Meningkatkan kualitas *prompt* AI dan fitur aplikasi kami di masa mendatang.</li>
          </ul>

          <h2 className="text-xl font-bold text-[#0f2a4a] mt-8 mb-3">3. Keamanan Data</h2>
          <p>
            Kami berkomitmen untuk menjaga keamanan data Anda. Kami menggunakan langkah-langkah keamanan teknis dan organisasi yang sesuai (seperti enkripsi dan *database* aman via Supabase) untuk melindungi informasi Anda dari akses, perubahan, atau penghancuran yang tidak sah.
          </p>

          <h2 className="text-xl font-bold text-[#0f2a4a] mt-8 mb-3">4. Pihak Ketiga</h2>
          <p>
            Kami tidak akan menjual atau menyewakan informasi pribadi Anda kepada pihak ketiga. Kami hanya membagikan data Anda dengan mitra terpercaya yang membantu operasi kami, seperti *Payment Gateway* (Midtrans) untuk keperluan pemrosesan pembayaran, yang masing-masing tunduk pada kewajiban kerahasiaan yang ketat.
          </p>

          <h2 className="text-xl font-bold text-[#0f2a4a] mt-8 mb-3">5. Hubungi Kami</h2>
          <p>
            Jika Anda memiliki pertanyaan mengenai Kebijakan Privasi ini atau ingin mengajukan penghapusan akun dan data Anda, silakan hubungi kami di:
          </p>
          <ul className="list-none space-y-1 mt-2">
            <li><strong>Email:</strong> vianeyricky@gmail.com</li>
            <li><strong>Alamat Operasional:</strong> Kota Batu, Jawa Timur, Indonesia</li>
          </ul>
        </div>
      </div>
    </div>
  );
}