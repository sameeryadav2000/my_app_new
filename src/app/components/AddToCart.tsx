// src\app\components\AddToCart.tsx

interface AddToCartButtonProps {
  onClick?: () => void;
  className?: string;
}

export default function AddToCartButton({
  onClick,
  className,
}: AddToCartButtonProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`bg-black text-white py-4 rounded-lg hover:bg-gray-800 transition-colors ${className}`}
    >
      Add to Cart
    </button>
  );
}