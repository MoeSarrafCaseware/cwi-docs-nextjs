import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import EditorSetupContent from "@/components/EditorSetupContent";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          {/* Decorative stripes on left/right edges around content */}
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.05)_0px,rgba(255,255,255,0.05)_2px,transparent_2px,transparent_6px)]" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.05)_0px,rgba(255,255,255,0.05)_2px,transparent_2px,transparent_6px)]" />
            <main className="relative z-10">
              <EditorSetupContent />
            </main>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
}
