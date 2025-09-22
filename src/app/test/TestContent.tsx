export default function TestContent() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Section Header */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-purple-400 uppercase tracking-wider mb-4">INSTALLATION</h2>
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
        <div className="border-b border-purple-800/50 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button className="border-b-2 border-cyan-500 text-cyan-400 py-2 px-1 text-sm font-medium">
              Using Vite
            </button>
            <button className="border-b-2 border-transparent text-gray-400 hover:text-purple-300 hover:border-purple-500 py-2 px-1 text-sm font-medium transition-colors">
              Using PostCSS
            </button>
            <button className="border-b-2 border-transparent text-gray-400 hover:text-purple-300 hover:border-purple-500 py-2 px-1 text-sm font-medium transition-colors">
              Tailwind CLI
            </button>
            <button className="border-b-2 border-transparent text-gray-400 hover:text-purple-300 hover:border-purple-500 py-2 px-1 text-sm font-medium transition-colors">
              Framework Guides
            </button>
            <button className="border-b-2 border-transparent text-gray-400 hover:text-purple-300 hover:border-purple-500 py-2 px-1 text-sm font-medium transition-colors">
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
              <span className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white text-sm font-bold px-3 py-1 rounded-full mr-4">01</span>
              <h3 className="text-lg font-semibold text-white">Create your project</h3>
            </div>
            <p className="text-gray-300 mb-4">
              Start by creating a new Vite project if you don't have one set up already. The most common approach is to use Create Vite.
            </p>
            <div className="bg-black border border-purple-800/50 rounded-lg overflow-hidden">
              <div className="bg-purple-900/20 px-4 py-2 flex items-center justify-between">
                <span className="text-sm font-medium text-purple-300">Terminal</span>
                <button className="text-gray-400 hover:text-cyan-400 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
              <div className="p-4">
                <pre className="text-cyan-100 text-sm">
                  <code>npm create vite@latest my-project</code>
                </pre>
                <pre className="text-cyan-100 text-sm mt-2">
                  <code>cd my-project</code>
                </pre>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div>
            <div className="flex items-center mb-4">
              <span className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white text-sm font-bold px-3 py-1 rounded-full mr-4">02</span>
              <h3 className="text-lg font-semibold text-white">Install Tailwind CSS</h3>
            </div>
            <p className="text-gray-300 mb-4">
              Install <code className="bg-purple-900/30 px-2 py-1 rounded text-cyan-400 border border-purple-700/50">tailwindcss</code> and <code className="bg-purple-900/30 px-2 py-1 rounded text-cyan-400 border border-purple-700/50">@tailwindcss/vite</code>.
            </p>
            <div className="bg-black border border-purple-800/50 rounded-lg overflow-hidden">
              <div className="bg-purple-900/20 px-4 py-2 flex items-center justify-between">
                <span className="text-sm font-medium text-purple-300">Terminal</span>
                <button className="text-gray-400 hover:text-cyan-400 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
              <div className="p-4">
                <pre className="text-cyan-100 text-sm">
                  <code>npm install tailwindcss @tailwindcss/vite</code>
                </pre>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div>
            <div className="flex items-center mb-4">
              <span className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white text-sm font-bold px-3 py-1 rounded-full mr-4">03</span>
              <h3 className="text-lg font-semibold text-white">Configure your template paths</h3>
            </div>
            <p className="text-gray-300 mb-4">
              Add the paths to all of your template files in your <code className="bg-purple-900/30 px-2 py-1 rounded text-cyan-400 border border-purple-700/50">tailwind.config.js</code> file.
            </p>
            <div className="bg-black border border-purple-800/50 rounded-lg overflow-hidden">
              <div className="bg-purple-900/20 px-4 py-2 flex items-center justify-between">
                <span className="text-sm font-medium text-purple-300">tailwind.config.js</span>
                <button className="text-gray-400 hover:text-cyan-400 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
              <div className="p-4">
                <pre className="text-cyan-100 text-sm">
                  <code>{`/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`}</code>
                </pre>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div>
            <div className="flex items-center mb-4">
              <span className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white text-sm font-bold px-3 py-1 rounded-full mr-4">04</span>
              <h3 className="text-lg font-semibold text-white">Add the Tailwind directives to your CSS</h3>
            </div>
            <p className="text-gray-300 mb-4">
              Add the <code className="bg-purple-900/30 px-2 py-1 rounded text-cyan-400 border border-purple-700/50">@tailwind</code> directives for each of Tailwind's layers to your main CSS file.
            </p>
            <div className="bg-black border border-purple-800/50 rounded-lg overflow-hidden">
              <div className="bg-purple-900/20 px-4 py-2 flex items-center justify-between">
                <span className="text-sm font-medium text-purple-300">src/index.css</span>
                <button className="text-gray-400 hover:text-cyan-400 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
              <div className="p-4">
                <pre className="text-cyan-100 text-sm">
                  <code>{`@tailwind base;
@tailwind components;
@tailwind utilities;`}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-6">Next Steps</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-purple-900/20 to-cyan-900/20 border border-purple-800/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-3">Framework Guides</h3>
            <p className="text-gray-300 mb-4">
              Learn how to add Tailwind CSS to your favorite framework or build tool.
            </p>
            <a href="#" className="inline-flex items-center text-cyan-400 hover:text-cyan-300 transition-colors">
              Browse guides
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
          
          <div className="bg-gradient-to-br from-cyan-900/20 to-purple-900/20 border border-cyan-800/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-3">Play CDN</h3>
            <p className="text-gray-300 mb-4">
              Try Tailwind CSS right in your browser without any build step.
            </p>
            <a href="#" className="inline-flex items-center text-purple-400 hover:text-purple-300 transition-colors">
              Try it out
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
