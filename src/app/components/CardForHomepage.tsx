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
}
