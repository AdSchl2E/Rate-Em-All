export function LoadingPokemonGrid({ count = 4 }: { count: number }) {
  // Crée un tableau de la taille demandée
  const placeholders = Array.from({ length: count }, (_, i) => i);
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {placeholders.map((i) => (
        <div 
          key={`placeholder-${i}`}
          className="rounded-xl bg-gray-800 shadow-lg overflow-hidden animate-pulse"
        >
          {/* Image placeholder */}
          <div className="h-48 bg-gray-700"></div>
          
          {/* Content placeholders */}
          <div className="p-4 space-y-3">
            {/* Title placeholder */}
            <div className="h-6 bg-gray-700 rounded w-2/3 mx-auto"></div>
            
            {/* ID placeholder */}
            <div className="h-4 bg-gray-700 rounded w-1/4 mx-auto"></div>
            
            {/* Rating placeholder */}
            <div className="h-5 bg-gray-700 rounded w-3/4 mx-auto"></div>
            
            {/* Divider */}
            <div className="border-t border-gray-700 my-3"></div>
            
            {/* User rating placeholder */}
            <div className="h-6 bg-gray-700 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      ))}
    </div>
  );
}