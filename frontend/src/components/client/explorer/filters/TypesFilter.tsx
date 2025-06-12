'use client';

import { motion } from 'framer-motion';
import { typeColors } from '@/lib/utils/pokemonTypes';

interface TypesFilterProps {
  selectedTypes: string[];
  onChange: (types: string[]) => void;
  availableTypes: string[];
}

export default function TypesFilter({ selectedTypes, onChange, availableTypes }: TypesFilterProps) {
  const toggleType = (type: string) => {
    if (selectedTypes.includes(type)) {
      onChange(selectedTypes.filter(t => t !== type));
    } else {
      onChange([...selectedTypes, type]);
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
      className="grid grid-cols-3 md:grid-cols-6 gap-2"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {availableTypes.map(type => (
        <motion.button
          key={type}
          variants={itemVariants}
          onClick={() => toggleType(type)}
          className={`py-2 px-3 rounded-lg text-white font-medium transition-all ${
            selectedTypes.includes(type) 
              ? 'ring-2 ring-white scale-105' 
              : 'opacity-80 hover:opacity-100'
          }`}
          style={{ 
            backgroundColor: typeColors[type] || '#999',
            boxShadow: selectedTypes.includes(type) 
              ? `0 0 10px ${typeColors[type]}70` 
              : 'none'
          }}
        >
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </motion.button>
      ))}
    </motion.div>
  );
}