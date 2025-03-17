import React from "react";

interface CardProps {
  title: string;
  image: string;
  startingText: string;
  price: string | number;

  className?: string;
  containerClassName?: string;
  imageContainerClassName?: string;
  imageClassName?: string;
  contentClassName?: string;
  titleClassName?: string;
  startingTextClassName?: string;
  priceClassName?: string;
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

        <div className={`${priceClassName}`}>{typeof price === "number" ? `$${price.toFixed(2)}` : price}</div>
      </div>
    </div>
  );
};

export default CardsForPhone;
