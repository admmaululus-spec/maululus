import React from 'react';
import Link from 'next/link';

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-semibold text-sm transition-colors">
            <span>&larr;</span> Kembali ke Beranda
          </Link>
          <div className="text-sm font-bold text-slate-800">
            Maululus Academic Platform
          </div>
        </div>
      </header>

      {/* Konten Utama */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 md:p-12 shadow-sm">
          <div className="mb-10 border-b border-slate-100 pb-8 text-center">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Syarat & Ketentuan</h1>
            <p className="text-sm text-slate-500">Pembaruan Terakhir: Juli 2026</p>
          </div>

          <div className="space-y-8 text-sm text-slate-600 leading-relaxed">
            
            <section>
              <h2 className="text-lg font-bold text-slate-800 mb-3">1. TINJAUAN UMUM (OVERVIEW)</h2>
              <p>
                Situs Maululus ditawarkan kepada kamu dengan syarat kamu menyetujui syarat, ketentuan, dan pemberitahuan yang termuat di sini. Penggunaan Situs ini oleh kamu merupakan bentuk persetujuanmu terhadap semua syarat, ketentuan, dan pemberitahuan tersebut. Silakan baca dengan saksama. Jika kamu tidak setuju dengan Syarat dan Ketentuan ini, kamu harus segera keluar dari Situs dan menghentikan penggunaan informasi atau produk dari Situs ini. {/*[cite: 2] */}
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-800 mb-3">2. MODIFIKASI SITUS DAN SYARAT & KETENTUAN</h2>
              <p>
                Maululus berhak untuk mengubah, memodifikasi, memperbarui, atau menghentikan syarat, ketentuan, dan tautan, konten, informasi, harga, dan materi lain yang ditawarkan melalui Situs ini kapan saja tanpa pemberitahuan sebelumnya. Kami berhak untuk menyesuaikan harga dari waktu ke waktu. Jika karena alasan tertentu terdapat kesalahan harga, Maululus berhak untuk menolak atau membatalkan pesanan. Dengan terus menggunakan Situs setelah modifikasi tersebut, kamu setuju untuk terikat oleh modifikasi tersebut. {/*[cite: 2] */}
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-800 mb-3">3. HAK CIPTA DAN HAK KEKAYAAN INTELEKTUAL</h2>
              <p>
                Situs ini dimiliki dan dioperasikan oleh Maululus. Kecuali ditentukan lain, semua materi di Situs ini, merek dagang, merek layanan, dan logo adalah milik Maululus dan dilindungi oleh undang-undang hak cipta Indonesia. Tidak ada materi dari Situs ini yang boleh disalin, direproduksi, dimodifikasi, dipublikasikan ulang, diunggah, diposting, ditransmisikan, atau didistribusikan dalam bentuk apa pun tanpa izin tertulis sebelumnya dari Maululus. {/*[cite: 2] */}
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-800 mb-3">4. PENDAFTARAN DAN KEAMANAN AKUN</h2>
              <p>
                Kamu perlu mendaftar di Situs ini untuk membeli layanan dengan memasukkan <em>username</em> dan <em>password</em>. Kamu akan diminta untuk memberikan informasi yang akurat dan terkini. Kamu bertanggung jawab penuh untuk menjaga kerahasiaan <em>username</em> dan <em>password</em> yang kamu pilih, serta segala aktivitas yang terjadi di bawah akunmu. Kamu tidak akan menyalahgunakan identitas, memalsukan afiliasi, atau menyamarkan asal materi apa pun yang kamu akses melalui Situs ini. {/*[cite: 2] */}
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-800 mb-3">5. BIAYA DAN TRANSAKSI DIGITAL</h2>
              <p>
                Sebagai imbalan atas lisensi dan layanan yang diberikan, kamu wajib membayar biaya (dalam bentuk top-up Koin atau pembayaran langsung untuk <em>Expert Assistance</em>) sebagaimana tercantum dalam halaman Harga (Pricing). Biaya ditagihkan melalui portal pembayaran (Midtrans). Kamu menyetujui untuk membayar semua pajak yang berlaku terkait dengan penggunaan layanan perangkat lunak ini. {/*[cite: 2] */}
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-800 mb-3">6. KEBIJAKAN PRIVASI (PRIVACY POLICY)</h2>
              <p>
                Informasi kamu aman bersama kami. Maululus memahami bahwa masalah privasi sangat penting bagi pelanggan kami. Kamu dapat yakin bahwa setiap informasi yang kamu kirimkan kepada kami tidak akan disalahgunakan atau dijual ke pihak lain. Kami hanya menggunakan informasi pribadimu untuk menyelesaikan pesananmu dan meningkatkan kualitas layanan. {/*[cite: 2] */}
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-800 mb-3">7. KOMUNIKASI ELEKTRONIK</h2>
              <p>
                Kamu setuju bahwa Maululus dapat mengirimkan surat elektronik kepadamu untuk tujuan memberitahukan perubahan atau penambahan pada Situs, tentang produk atau layanan kami, atau untuk tujuan lain yang kami anggap pantas. {/*[cite: 2] */}
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-800 mb-3">8. PENOLAKAN DAN BATASAN TANGGUNG JAWAB (DISCLAIMER)</h2>
              <p>
                Maululus tidak bertanggung jawab atas keakuratan, ketepatan waktu, atau konten dari materi yang disediakan di Situs ini. Hasil dari pemrosesan AI (Kecerdasan Buatan) bersifat sebagai draf akademis pendukung dan harus selalu divalidasi oleh pengguna. Maululus tidak bertanggung jawab untuk menyediakan konten atau materi yang telah kedaluwarsa atau dihapus. {/*[cite: 2] */}
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-800 mb-3">9. GANTI RUGI (INDEMNITY)</h2>
              <p>
                Kamu setuju untuk mengganti rugi, membela, dan membebaskan Maululus dari dan terhadap setiap dan semua klaim pihak ketiga, kewajiban, kerugian, atau pengeluaran (termasuk biaya hukum yang wajar) yang timbul dari, berdasarkan, atau sehubungan dengan akses dan/atau penggunaan Situs ini oleh kamu. {/*[cite: 2] */}
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-800 mb-3">10. HUKUM YANG BERLAKU</h2>
              <p>
                Syarat dan Ketentuan ini diatur oleh dan ditafsirkan sesuai dengan hukum yang berlaku di Republik Indonesia. {/*[cite: 2] */}
              </p>
            </section>

            <div className="mt-12 pt-8 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Legal Notice</p>
              <p className="text-sm font-semibold text-slate-700">Maululus Academic Platform</p>
              <p className="text-xs text-slate-500 mt-1">Copyright © 2026 Hak Cipta Dilindungi Undang-Undang. Layanan pembayaran difasilitasi oleh PT Midtrans.</p>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}