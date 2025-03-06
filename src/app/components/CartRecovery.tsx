// // src/components/CartRecovery.tsx
// "use client";

// import { useEffect } from "react";
// import { useSession } from "next-auth/react";
// import { useRouter } from "next/navigation";
// import { useCart } from "@/context/CartContext";

// export default function CartRecovery() {
//   const { data: session } = useSession();
//   const { cart, setCart } = useCart();
//   const router = useRouter();

//   useEffect(() => {
//     if (session) {
//       const pendingItemJSON = sessionStorage.getItem("pendingCartItem");

//       if (pendingItemJSON) {
//         try {
//           const pendingItem = JSON.parse(pendingItemJSON);

//           // Add quantity property if it doesn't exist
//           if (!pendingItem.quantity) {
//             pendingItem.quantity = 1;
//           }

//           // Check if this exact item already exists in the cart
//           const existingItemIndex = cart.items.findIndex(
//             (item) =>
//               item.id === pendingItem.id &&
//               item.condition === pendingItem.condition &&
//               item.storage === pendingItem.storage &&
//               item.color === pendingItem.color
//           );

//           let updatedCart;

//           if (existingItemIndex > -1) {
//             // If item exists, increment its quantity
//             const updatedItems = cart.items.map((item, index) =>
//               index === existingItemIndex
//                 ? { ...item, quantity: item.quantity + 1 }
//                 : item
//             );

//             updatedCart = {
//               items: updatedItems,
//               totalItems: updatedItems.reduce(
//                 (sum, item) => sum + item.quantity,
//                 0
//               ),
//               subTotalPrice: updatedItems.reduce(
//                 (sum, item) => sum + item.price * item.quantity,
//                 0
//               ),
//             };
//           } else {
//             // If item doesn't exist, add it to cart
//             updatedCart = {
//               items: [...cart.items, pendingItem],
//               totalItems: cart.totalItems + 1,
//               subTotalPrice: cart.subTotalPrice + pendingItem.price,
//             };
//           }

//           setCart(updatedCart);

//           sessionStorage.removeItem("pendingCartItem");

//           router.push("/homepage");
//         } catch (error) {
//           console.error("Error recovering cart item:", error);
//           sessionStorage.removeItem("pendingCartItem");
//         }
//       }
//     }
//   }, [session]);

//   return null;
// }
