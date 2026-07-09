import Link from 'next/link';

export default function KebijakanPengembalian() {
  return (
    <div className="min-h-screen bg-slate-50 py-16 px-6 font-sans text-[#0f2a4a]">
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-200">
        
        <Link href="/" className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 text-sm font-bold mb-8 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
          Kembali ke Beranda
        </Link>

        <h1 className="text-3xl font-extrabold mb-6 tracking-tight">Kebijakan Pengembalian Dana (Refund Policy)</h1>
        
        <div className="space-y-6 text-slate-600 leading-relaxed text-sm md:text-base">
          <p className="font-medium text-slate-400">Terakhir diperbarui: 9 Juli 2026</p>

          <p>
            Terima kasih telah mempercayakan layanan asistensi dan generator skripsi Anda kepada <strong>Maululus</strong>. Kami berkomitmen untuk memberikan layanan terbaik. Harap baca kebijakan pengembalian dana kami secara saksama sebelum melakukan pembayaran.
          </p>

          <h2 className="text-xl font-bold text-[#0f2a4a] mt-8 mb-3">1. Sifat Produk dan Layanan</h2>
          <p>
            Maululus menyediakan layanan berbasis digital berupa *AI Generator* (pembelian Koin) dan jasa konsultasi/asistensi *Expert*. Karena produk ini berbentuk aset digital instan dan waktu kerja *expert* yang langsung dialokasikan, maka sistem kami memberlakukan aturan khusus terkait pengembalian dana.
          </p>

          <h2 className="text-xl font-bold text-[#0f2a4a] mt-8 mb-3">2. Ketentuan Non-Refundable (Tidak Dapat Dikembalikan)</h2>
          <p>Seluruh pembayaran bersifat <strong>FINAL dan TIDAK DAPAT DIKEMBALIKAN</strong> dalam kondisi berikut:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Pengguna berubah pikiran setelah melakukan pembayaran.</li>
            <li>Pengguna telah menggunakan koin AI atau layanan telah mulai dikerjakan oleh *Expert*.</li>
            <li>Hasil *generate* AI atau masukan *Expert* dianggap kurang memuaskan karena preferensi subjektif (namun kami menyediakan fasilitas garansi revisi sesuai dengan S&K paket yang dibeli).</li>
          </ul>

          <h2 className="text-xl font-bold text-[#0f2a4a] mt-8 mb-3">3. Pengecualian (Kondisi Refund Diterima)</h2>
          <p>Kami hanya akan menyetujui pengembalian dana (*Refund*) 100% apabila terjadi kondisi berikut:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Kesalahan Sistem Pembayaran:</strong> Terjadi pendebetan ganda (*double charge*) atau nominal tidak sesuai akibat gangguan pada sistem gerbang pembayaran (Midtrans).</li>
            <li><strong>Gagal Memberikan Layanan:</strong> Pihak Maululus / *Expert* tidak dapat memulai atau menyelesaikan proyek dalam tenggat waktu yang disepakati tanpa alasan *force majeure*.</li>
          </ul>

          <h2 className="text-xl font-bold text-[#0f2a4a] mt-8 mb-3">4. Proses Pengajuan Pengembalian Dana</h2>
          <p>
            Jika Anda memenuhi kriteria pengecualian di atas, Anda dapat mengajukan *refund* dengan langkah berikut:
          </p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Kirim email ke <strong>vianeyricky@gmail.com</strong> dengan subjek: <strong>Pengajuan Refund - [Order ID]</strong>.</li>
            <li>Sertakan bukti pembayaran, Order ID, serta penjelasan singkat atau *screenshot* kendala.</li>
            <li>Tim kami akan meninjau pengajuan Anda maksimal dalam 2x24 jam kerja.</li>
            <li>Jika disetujui, dana akan dikembalikan ke rekening atau *e-wallet* asal dalam waktu 3-7 hari kerja tergantung kebijakan bank/provider pembayaran.</li>
          </ol>

        </div>
      </div>
    </div>
  );
}