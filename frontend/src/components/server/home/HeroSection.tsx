import Image from 'next/image';

/**
 * HeroSection component
 * Main landing page hero section with search functionality
 */
export default function HeroSection() { 
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-violet-700">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-20">
        <Image 
          src="/patterns/grid.svg" 
          alt="Grid pattern"
          fill
          className="object-cover"
        />
      </div>
      
      <div className="relative z-10 px-6 py-12 md:px-12 md:py-16 text-white">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              Discover and rate <span className="text-yellow-300">all Pokémon</span>
            </h1>
            <p className="text-lg md:text-xl mb-6 text-blue-100">
              Explore the complete Pokémon database, share your ratings, and discover community favorites.
            </p>
          </div>
          
          <div className="md:w-1/2 flex justify-center">
            <div className="relative w-80 h-80 md:w-100 md:h-100">
              <Image 
                src="/images/pokemon-group.png" 
                alt="Pokémon group"
                fill
                className="object-contain drop-shadow-xl"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}