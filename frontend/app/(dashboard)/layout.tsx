import AuthGuard from '../../components/AuthGuard';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-neutral flex text-primary">
        <Sidebar />
        <div className="flex-grow flex flex-col pl-64">
          <Header />
          <main className="flex-grow p-8 bg-neutral max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
