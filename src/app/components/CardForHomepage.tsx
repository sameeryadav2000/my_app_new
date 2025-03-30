"use client";

import Image from "next/image";

interface CardForHomepageProps {
  title: string;
  image: string;
  className: string;
  imageContainerClassName: string;
  contentClassName: string;
  titleClassName: string;
  priority: boolean;
}

export default function CardsForHomepage({
  title,
  image,
  className = "",
  imageContainerClassName = "",
  contentClassName = "",
  titleClassName = "",
  priority = false,
}: CardForHomepageProps) {
  return (
    <div className={`${className}`}>
      <div className={`${imageContainerClassName} relative`}>
        <Image src={image} alt={title} fill sizes="(max-width: 768px) 100vw, 300px" style={{ objectFit: "contain" }} priority={priority} />
      </div>
      <div className={`${contentClassName}`}>
        <h2 className={`${titleClassName}`}>{title}</h2>
      </div>
    </div>
  );
}
