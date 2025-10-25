import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";

export default function Home() {
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
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <h1 className="text-4xl font-bold text-white mb-6">Welcome to Caseware Cloud Documentation</h1>
                <p className="text-gray-300 mb-8">
                  Select a topic from the sidebar to get started, or use the search (Cmd+K) to find what you need.
                </p>
              </div>
            </main>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
}
