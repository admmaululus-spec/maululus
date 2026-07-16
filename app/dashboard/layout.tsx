// app/dashboard/layout.tsx
import PromoPopup from '@/app/components/PromoPopup';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    // Menggunakan 100dvh (Dynamic Viewport Height) sangat penting untuk browser HP 
    // agar layout tidak tertutup address bar.
    <div className="h-[100dvh] w-full bg-[#F4F7FE] overflow-hidden flex flex-col">
      <PromoPopup /> 
      {children}
    </div>
  );
}