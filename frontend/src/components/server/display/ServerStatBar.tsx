interface ServerStatBarProps {
  value: number;
  maxValue?: number;
  statName?: string; // Pour personnaliser la couleur selon la statistique
}

export function ServerStatBar({ 
  value, 
  maxValue = 255,
  statName = 'default'
}: ServerStatBarProps) {
  // Calculer le pourcentage par rapport à la valeur maximale
  const percentage = Math.min(Math.round((value / maxValue) * 100), 100);
  
  // Déterminer la couleur en fonction de la statistique ou de la valeur
  const getBarColor = () => {
    switch (statName.toLowerCase()) {
      case 'hp':
        return 'bg-red-500';
      case 'attack':
        return 'bg-orange-500';
      case 'defense':
        return 'bg-yellow-500';
      case 'special-attack':
        return 'bg-blue-500';
      case 'special-defense':
        return 'bg-green-500';
      case 'speed':
        return 'bg-pink-500';
      default:
        // Couleur basée sur la valeur pour les autres statistiques
        if (percentage >= 80) return 'bg-green-500';
        if (percentage >= 50) return 'bg-yellow-500';
        return 'bg-red-500';
    }
  };
  
  // Déterminer la largeur du texte en fonction de la valeur
  const textClass = percentage < 20 ? 'text-gray-200 pl-2' : 'text-gray-800';
  
  return (
    <div className="h-5 w-full bg-gray-700 rounded-full overflow-hidden">
      <div
        className={`h-full ${getBarColor()} rounded-full transition-all duration-300 flex items-center`}
        style={{ width: `${percentage}%` }}
      >
        {percentage > 0 && (
          <span className={`text-xs font-bold px-2 ${textClass}`}>
            {percentage}%
          </span>
        )}
      </div>
    </div>
  );
}