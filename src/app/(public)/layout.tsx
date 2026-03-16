import Sidebar from '@/components/layout/Sidebar';
import MainContent from '@/components/layout/MainContent';
import Analytics from '@/components/Analytics';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="min-h-full flex flex-col lg:flex-row">
        <Sidebar />
        <MainContent>{children}</MainContent>
      </div>
      <Analytics />
    </>
  );
}
