'use client';

import { motion } from 'framer-motion';
import { GENERATIONS } from '../ExplorerContainer';

interface GenerationFilterProps {
  selectedGenerations: number[];
  onChange: (generations: number[]) => void;
}

export default function GenerationFilter({ selectedGenerations, onChange }: GenerationFilterProps) {
  const toggleGeneration = (genId: number) => {
    if (selectedGenerations.includes(genId)) {
      onChange(selectedGenerations.filter(id => id !== genId));
    } else {
      onChange([...selectedGenerations, genId]);
    }
  };
  
  const selectAll = () => {
    onChange(GENERATIONS.map(gen => gen.id));
  };
  
  const clearAll = () => {
    onChange([]);
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
    <div>
      <div className="flex justify-between mb-3">
        <span className="text-sm text-gray-400">
          {selectedGenerations.length} sur {GENERATIONS.length} sélectionnées
        </span>
        <div className="space-x-3">
          <button 
            onClick={selectAll}
            className="text-sm text-blue-400 hover:text-blue-300 transition"
          >
            Tout sélectionner
          </button>
          <button 
            onClick={clearAll}
            className="text-sm text-gray-400 hover:text-gray-300 transition"
          >
            Tout désélectionner
          </button>
        </div>
      </div>
      
      <motion.div 
        className="grid grid-cols-2 sm:grid-cols-3 gap-2"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {GENERATIONS.map(gen => (
          <motion.button
            key={gen.id}
            variants={itemVariants}
            onClick={() => toggleGeneration(gen.id)}
            className={`py-2 px-3 rounded-lg font-medium transition-all ${
              selectedGenerations.includes(gen.id)
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <div className="flex flex-col">
              <span>{gen.name}</span>
              <span className="text-xs opacity-75">
                #{gen.range[0]} - #{gen.range[1]}
              </span>
            </div>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}