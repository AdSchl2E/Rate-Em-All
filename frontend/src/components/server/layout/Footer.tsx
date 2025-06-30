/**
 * Footer component
 * 
 * Renders the application footer with copyright information,
 * branding, and navigation links.
 * 
 * @returns React server component
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto py-6 bg-gray-900 border-t border-gray-800">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent">
              Rate 'em All
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              © {currentYear} Rate 'em All. All rights reserved.
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <a href="/about" className="text-sm text-gray-400 hover:text-gray-300 transition">
              About
            </a>
            <a href="/privacy" className="text-sm text-gray-400 hover:text-gray-300 transition">
              Privacy
            </a>
            <a href="/terms" className="text-sm text-gray-400 hover:text-gray-300 transition">
              Terms
            </a>
            <p className="text-sm text-gray-500">
              All Pokémon rights belong to Nintendo
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}