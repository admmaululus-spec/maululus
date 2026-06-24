import PromoPopup from '@/app/components/PromoPopup';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
      <div className="min-h-screen bg-slate-50">
        <PromoPopup /> 
        <main>{children}</main>
      </div>
    );
  }