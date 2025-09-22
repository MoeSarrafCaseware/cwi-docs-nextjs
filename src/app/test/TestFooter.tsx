export default function TestFooter() {
  return (
    <footer className="bg-black border-t border-purple-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="border-t border-purple-800/50 pt-8 text-center text-sm text-gray-400">
          <p>© 2024 Caseware Cloud Documentation - Built with Next.js and Tailwind CSS</p>
          <div className="mt-2 flex justify-center space-x-4">
            <a href="#" className="text-purple-400 hover:text-purple-300 transition-colors">Privacy Policy</a>
            <a href="#" className="text-purple-400 hover:text-purple-300 transition-colors">Terms of Service</a>
            <a href="#" className="text-purple-400 hover:text-purple-300 transition-colors">Support</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
