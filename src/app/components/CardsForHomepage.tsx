import React from "react";

interface CardProps {
  title: string;
  image: string;
  className?: string;
  imageContainerClassName?: string;
  imageClassName?: string;
  contentClassName?: string;
  titleClassName?: string;
}

const Card: React.FC<CardProps> = ({
  title,
  image,
  className = '',
  imageContainerClassName = '',
  imageClassName = '',
  contentClassName = '',
  titleClassName = ''
}) => {
  return (
    <div className={`${className}`}>
      <div className={`${imageContainerClassName}`}>
        <img className={`${imageClassName}`} src={image} alt={title} />
      </div>
      <div className={`${contentClassName}`}>
        <h2 className={`${titleClassName}`}>{title}</h2>
      </div>
    </div>
  );
};

export default Card;