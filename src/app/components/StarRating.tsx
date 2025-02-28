// src/app/components/StarRating.tsx
"use client";

import { useState } from 'react';
import { FaStar } from 'react-icons/fa';

interface StarRatingProps {
  value: number;
  onChange: (rating: number) => void;
  size?: number;
  editable?: boolean;
}

const StarRating = ({ value, onChange, size = 24, editable = true }: StarRatingProps) => {
  const [hoverRating, setHoverRating] = useState<number>(0);
  
  const handleMouseOver = (rating: number) => {
    if (editable) {
      setHoverRating(rating);
    }
  };
  
  const handleMouseLeave = () => {
    if (editable) {
      setHoverRating(0);
    }
  };
  
  const handleClick = (rating: number) => {
    if (editable) {
      onChange(rating);
    }
  };
  
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((rating) => (
        <FaStar
          key={rating}
          size={size}
          onClick={() => handleClick(rating)}
          onMouseOver={() => handleMouseOver(rating)}
          onMouseLeave={handleMouseLeave}
          className={`cursor-pointer ${
            (hoverRating || value) >= rating
              ? 'text-yellow-400'
              : 'text-gray-300'
          } ${editable ? 'cursor-pointer' : 'cursor-default'}`}
        />
      ))}
    </div>
  );
};

export default StarRating;