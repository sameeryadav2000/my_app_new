import React from "react";
import { formatNPR } from "@/utils/formatters";

interface CardProps {
  title: string;
  image: string;
  startingText: string;
  price: string | number;

  className: string;
  imageContainerClassName: string;
  imageClassName: string;
  contentClassName: string;
  titleClassName: string;
  startingTextClassName: string;
  priceClassName: string;
}

const CardsForPhone: React.FC<CardProps> = ({
  title,
  image,
  price,
  startingText,

  className = "",
  imageContainerClassName = "",
  imageClassName = "",
  contentClassName = "",
  titleClassName = "",
  startingTextClassName = "",
  priceClassName = "",
}) => {
  return (
    <div className={`${className}`}>
      {/* Image container */}
      <div className={`${imageContainerClassName}`}>
        <img className={`${imageClassName}`} src={image} alt={title} />
      </div>
      {/* Title container */}
      <div className={`${contentClassName}`}>
        <h2 className={`${titleClassName}`}>{title}</h2>

        <p className={`${startingTextClassName}`}>{startingText}</p>

        <div className={priceClassName}>{formatNPR(price)}</div>
      </div>
    </div>
  );
};

export default CardsForPhone;
