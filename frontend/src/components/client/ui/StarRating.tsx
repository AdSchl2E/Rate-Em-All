'use client';

import { useState } from 'react';

interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  highlight?: boolean;
}

export function StarRating({
  value = 0,
  onChange,
  disabled = false,
  size = 'md',
  highlight = false,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  const getColor = (index: number) => {
    const rating = isHovering ? hoverRating : value;
    
    if (index <= rating) {
      if (highlight) return 'text-yellow-400';
      return 'text-yellow-500';
    }
    
    return 'text-gray-400';
  };

  const handleMouseOver = (index: number) => {
    if (disabled) return;
    
    setHoverRating(index);
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    if (disabled) return;
    
    setHoverRating(0);
    setIsHovering(false);
  };

  const handleClick = (index: number) => {
    if (disabled || !onChange) return;
    
    onChange(index);
  };

  return (
    <div 
      className={`flex ${disabled ? 'opacity-70' : ''} ${sizeClasses[size]}`}
      onMouseLeave={handleMouseLeave}
    >
      {[1, 2, 3, 4, 5].map((index) => (
        <span
          key={index}
          className={`cursor-${disabled ? 'default' : 'pointer'} ${getColor(index)} transition-colors duration-150`}
          onMouseOver={() => handleMouseOver(index)}
          onClick={() => handleClick(index)}
        >
          ★
        </span>
      ))}
    </div>
  );
}