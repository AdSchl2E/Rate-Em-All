import { useState, useEffect } from 'react';
import { FaStar, FaStarHalfAlt } from 'react-icons/fa';
import { FiStar } from 'react-icons/fi';
import { motion } from 'framer-motion';

interface StarRatingProps {
  value?: number;
  onChange?: (value: number) => void;
  fixed?: boolean;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  highlight?: boolean; // Nouvelle prop pour indiquer si l'utilisateur a déjà noté
}

const StarRating: React.FC<StarRatingProps> = ({ 
  value = 0, 
  onChange, 
  fixed = false,
  size = 'md',
  disabled = false,
  highlight = false
}) => {
  const [rating, setRating] = useState(value);
  const [hover, setHover] = useState(0);
  const [animateStars, setAnimateStars] = useState(false);
  
  // Update internal state when prop changes
  useEffect(() => {
    setRating(value);
  }, [value]);

  const starSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };
  
  const starSize = starSizes[size];
  
  const handleClick = (clickedValue: number) => {
    if (fixed || disabled) return;
    
    const newRating = clickedValue;
    setRating(newRating);
    
    // Trigger star animation
    setAnimateStars(true);
    setTimeout(() => setAnimateStars(false), 300);
    
    if (onChange) {
      onChange(newRating);
    }
  };

  // Create stars
  const renderStars = () => {
    const stars = [];
    const maxRating = 5;
    
    for (let i = 1; i <= maxRating; i++) {
      const starValue = i;
      
      stars.push(
        <motion.button
          key={i}
          whileHover={!fixed && !disabled ? { scale: 1.2 } : undefined}
          whileTap={!fixed && !disabled ? { scale: 0.9 } : undefined}
          animate={animateStars ? { scale: [1, 1.2, 1] } : {}}
          onClick={() => handleClick(starValue)}
          onMouseEnter={() => !fixed && !disabled && setHover(starValue)}
          onMouseLeave={() => !fixed && !disabled && setHover(0)}
          className={`focus:outline-none z-20 ${disabled ? 'cursor-default' : 'cursor-pointer'}`}
          disabled={disabled}
        >
          {i <= rating ? (
            <FaStar 
              size={starSize} 
              className={`transition-colors duration-200 ${
                highlight ? 'text-blue-400 drop-shadow-[0_0_2px_rgba(96,165,250,0.6)]' : 'text-yellow-400'
              }`}
            />
          ) : (
            <FiStar 
              size={starSize} 
              className={`${(hover >= starValue) ? 'text-yellow-400' : 'text-gray-400'} transition-colors duration-200`} 
            />
          )}
        </motion.button>
      );
    }
    
    return stars;
  };

  return (
    <div className="flex items-center justify-center gap-1">
      {renderStars()}
    </div>
  );
};

export default StarRating;