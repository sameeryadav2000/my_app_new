import React from "react";
import { formatNPR } from "@/utils/formatters";
import Image from "next/image";

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
  priority: boolean;
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
  priority = false,
}) => {
  return (
    <div className={`${className}`}>
      {/* Image container */}
      <div className={`${imageContainerClassName} relative`}>
        <Image
          className={`${imageClassName}`}
          src={image}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 300px"
          style={{ objectFit: "contain" }}
          priority={priority}
        />
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
