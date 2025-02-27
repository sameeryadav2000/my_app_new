// types/cart.ts

export interface CartItem {
  id: string;
  title: string;
  condition: string;
  storage: string;
  color: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  subTotalPrice: number;
}
