// src\app\components\AddToCart.tsx

interface AddToCartButtonProps {
  onClick?: () => void;
  className?: string;
}

export default function AddToCartButton({ onClick, className }: AddToCartButtonProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <button onClick={handleClick} className={`${className}`}>
      Add to Cart
    </button>
  );
}
