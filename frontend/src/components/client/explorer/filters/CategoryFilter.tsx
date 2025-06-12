'use client';

import { motion } from 'framer-motion';
import { HeartIcon, StarIcon, SparklesIcon, CakeIcon } from '@heroicons/react/24/solid';
import { POKEMON_CATEGORY } from '../ExplorerContainer';
import { useSession } from 'next-auth/react';

interface CategoryFilterProps {
  selectedCategories: POKEMON_CATEGORY[];
  onChange: (categories: POKEMON_CATEGORY[]) => void;
}

export default function CategoryFilter({ selectedCategories, onChange }: CategoryFilterProps) {
  const { data: session } = useSession();
  
  const categories = [
    { 
      id: 'all' as POKEMON_CATEGORY, 
      label: 'Tous les Pokémon',
      color: 'bg-gray-600',
      icon: null
    },
    { 
      id: 'legendary' as POKEMON_CATEGORY, 
      label: 'Légendaires',
      color: 'bg-amber-600',
      icon: <SparklesIcon className="h-5 w-5" />
    },
    { 
      id: 'mythical' as POKEMON_CATEGORY, 
      label: 'Mythiques',
      color: 'bg-purple-600',
      icon: <SparklesIcon className="h-5 w-5" />
    },
    { 
      id: 'baby' as POKEMON_CATEGORY, 
      label: 'Bébé Pokémon',
      color: 'bg-pink-600',
      icon: <CakeIcon className="h-5 w-5" />
    },
  ];
  
  // Options supplémentaires pour utilisateurs connectés
  const userCategories = [
    { 
      id: 'favorite' as POKEMON_CATEGORY, 
      label: 'Mes favoris',
      color: 'bg-red-600',
      icon: <HeartIcon className="h-5 w-5" />
    },
    { 
      id: 'rated' as POKEMON_CATEGORY, 
      label: 'Pokémon que j\'ai notés',
      color: 'bg-blue-600',
      icon: <StarIcon className="h-5 w-5" />
    },
  ];
  
  // Combiner les catégories en fonction de l'authentification
  const allCategories = session ? [...categories, ...userCategories] : categories;
  
  const toggleCategory = (category: POKEMON_CATEGORY) => {
    if (selectedCategories.includes(category)) {
      onChange(selectedCategories.filter(c => c !== category));
    } else {
      onChange([...selectedCategories, category]);
    }
  };
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };
  
  return (
    <motion.div 
      className="space-y-2"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {allCategories.map(category => (
        <motion.button
          key={category.id}
          variants={itemVariants}
          onClick={() => toggleCategory(category.id)}
          className={`w-full py-2 px-3 rounded-lg font-medium transition-all flex items-center ${
            selectedCategories.includes(category.id)
              ? `${category.color} text-white`
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          {category.icon && <span className="mr-2">{category.icon}</span>}
          {category.label}
        </motion.button>
      ))}
      
      {!session && (
        <div className="mt-3 p-3 bg-gray-700/50 rounded-lg text-sm text-gray-400">
          Connectez-vous pour accéder à vos favoris et vos Pokémon notés
        </div>
      )}
    </motion.div>
  );
}