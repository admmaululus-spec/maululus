import KursHeader from './components/KursHeader';
import AiToolsSection from './components/AiToolsSection';
import CoinPackagesSection from './components/CoinPackagesSection';
import ExpertPackagesSection from './components/ExpertPackagesSection';

export default function PengaturanHargaPage() {
  return (
    <div className="max-w-7xl mx-auto font-sans pb-10">
      <KursHeader />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Kolom Kiri */}
        <div className="space-y-8">
          <AiToolsSection />
          <CoinPackagesSection />
        </div>

        {/* Kolom Kanan */}
        <div className="space-y-8">
          <ExpertPackagesSection />
        </div>
      </div>
    </div>
  );
}