import { useState } from "react";

interface CardProps {
  title: string;
  image: string;
  className?: string;
  imageContainerClassName?: string;
  imageClassName?: string;
  contentClassName?: string;
  titleClassName?: string;
}

export default function CardForHomepage({
  title,
  image,
  className = "",
  imageContainerClassName = "",
  imageClassName = "",
  contentClassName = "",
  titleClassName = "",
}: CardProps) {
  const [imageError, setImageError] = useState(false);

  // Check if image is falsy (empty string, null, undefined)
  const hasValidImage = image && image.trim() !== "" && !imageError;

  return (
    <div className={`${className}`}>
      <div className={`${imageContainerClassName}`}>
        {hasValidImage ? (
          <img className={`${imageClassName}`} src={image} alt={title} onError={() => setImageError(true)} />
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`${imageClassName} text-gray-400`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
            <line x1="12" y1="18" x2="12" y2="18.01" />
          </svg>
        )}
      </div>
      <div className={`${contentClassName}`}>
        <h2 className={`${titleClassName}`}>{title}</h2>
      </div>
    </div>
  );
}
