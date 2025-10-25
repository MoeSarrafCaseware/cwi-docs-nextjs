import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black">
      <Header />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-[repeating-linear-gradient(135deg,rgba(168,85,247,0.1)_0px,rgba(168,85,247,0.1)_2px,transparent_2px,transparent_6px)]" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-[repeating-linear-gradient(135deg,rgba(34,211,238,0.1)_0px,rgba(34,211,238,0.1)_2px,transparent_2px,transparent_6px)]" />
            <main className="relative z-10">
              {children}
            </main>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
}
