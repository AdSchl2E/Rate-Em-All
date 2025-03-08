import { useState } from 'react';
import { FaStar } from 'react-icons/fa';

interface StarRatingProps {
    value?: number;
    onChange?: (value: number) => void;
    fixed?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({ value = 0, onChange, fixed = false }) => {
    const [rating, setRating] = useState(value);
    const [hover, setHover] = useState(0);

    const handleClick = (value: number) => {
        if (!fixed && onChange) {
            setRating(value);
            onChange(value);
        }
    };

    return (
        <div className="flex items-center justify-center gap-x-1">
            {[...Array(10)].map((_, i) => {
                const ratingValue = (i + 1);
                return (
                    <label key={i}>
                        <input
                            type="radio"
                            name="rating"
                            value={ratingValue}
                            className="hidden"
                            onClick={() => handleClick(ratingValue)}
                        />
                        <FaStar
                            className={`cursor-pointer transition-colors duration-200 ${ratingValue <= (hover || rating) ? 'text-yellow-500' : 'text-gray-300'
                                }`}
                            size={20}
                            onMouseEnter={() => !fixed && setHover(ratingValue)}
                            onMouseLeave={() => !fixed && setHover(0)}
                        />
                    </label>
                );
            })}
        </div>
    );
};

export default StarRating;