export default function EditorSetupContent() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Section Header */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">INSTALLATION</h2>
        <h1 className="text-4xl font-bold text-white mb-6">Get started with Tailwind CSS</h1>
        <div className="space-y-4 text-gray-300">
          <p>
            Tailwind CSS works by scanning all of your HTML files, JavaScript components, and any other templates for class names, generating the corresponding styles and then writing them to a static CSS file. It's fast, flexible, and reliable — with zero-runtime.
          </p>
        </div>
      </div>

      {/* Installation Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-6">Installation</h2>
        
        {/* Tabs */}
        <div className="border-b border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button className="border-b-2 border-blue-500 text-blue-400 py-2 px-1 text-sm font-medium">
              Using Vite
            </button>
            <button className="border-b-2 border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300 py-2 px-1 text-sm font-medium">
              Using PostCSS
            </button>
            <button className="border-b-2 border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300 py-2 px-1 text-sm font-medium">
              Tailwind CLI
            </button>
            <button className="border-b-2 border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300 py-2 px-1 text-sm font-medium">
              Framework Guides
            </button>
            <button className="border-b-2 border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300 py-2 px-1 text-sm font-medium">
              Play CDN
            </button>
          </nav>
        </div>

        <p className="text-gray-300 mb-8">
          Installing Tailwind CSS as a Vite plugin is the most seamless way to integrate it with frameworks like Laravel, SvelteKit, React Router, Nuxt, and SolidJS.
        </p>

        {/* Installation Steps */}
        <div className="space-y-8">
          {/* Step 1 */}
          <div>
            <div className="flex items-center mb-4">
              <span className="bg-blue-600 text-white text-sm font-bold px-3 py-1 rounded-full mr-4">01</span>
              <h3 className="text-lg font-semibold text-white">Create your project</h3>
            </div>
            <p className="text-gray-300 mb-4">
              Start by creating a new Vite project if you don't have one set up already. The most common approach is to use Create Vite.
            </p>
            <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
              <div className="bg-gray-700 px-4 py-2 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-300">Terminal</span>
                <button className="text-gray-400 hover:text-white">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
              <div className="p-4">
                <pre className="text-gray-100 text-sm">
                  <code>npm create vite@latest my-project</code>
                </pre>
                <pre className="text-gray-100 text-sm mt-2">
                  <code>cd my-project</code>
                </pre>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div>
            <div className="flex items-center mb-4">
              <span className="bg-blue-600 text-white text-sm font-bold px-3 py-1 rounded-full mr-4">02</span>
              <h3 className="text-lg font-semibold text-white">Install Tailwind CSS</h3>
            </div>
            <p className="text-gray-300 mb-4">
              Install <code className="bg-gray-800 px-2 py-1 rounded text-blue-400">tailwindcss</code> and <code className="bg-gray-800 px-2 py-1 rounded text-blue-400">@tailwindcss/vite</code>.
            </p>
            <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
              <div className="bg-gray-700 px-4 py-2 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-300">Terminal</span>
                <button className="text-gray-400 hover:text-white">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
              <div className="p-4">
                <pre className="text-gray-100 text-sm">
                  <code>npm install tailwindcss @tailwindcss/vite</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
