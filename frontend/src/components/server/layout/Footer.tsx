/**
 * Footer component
 * 
 * Renders the application footer with copyright information,
 * branding, and developer attribution.
 * 
 * @returns React server component
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto py-8 bg-gradient-to-b from-gray-900 to-black border-t border-gray-800">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Logo and branding section */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <div className="mb-4 md:mb-0 text-center md:text-left">
              <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent inline-block">
                Rate 'em All
              </h3>
            </div>

            <div className="flex items-center space-x-4">
              {/* Social media icons could go here */}
              <a href="https://github.com/AdSchl2E" target="_blank" rel="noopener noreferrer">
                <div className="w-8 h-8 rounded-full bg-gray-800 hover:bg-blue-600 flex items-center justify-center transition-colors duration-300">
                  <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </div>
              </a>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-800 w-full my-6"></div>

          {/* Bottom section */}
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500 mb-4 md:mb-0">
              © {currentYear} Rate 'em All. All rights reserved.
            </p>

            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
              <p className="text-sm text-gray-400">
                Developed by{' '}
                <a
                  href="https://github.com/AdSchl2E"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition font-medium underline-offset-2 hover:underline"
                >
                  AdSchl2E
                </a>
              </p>
              <p className="text-sm text-gray-500">
                All Pokémon rights belong to Nintendo
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}