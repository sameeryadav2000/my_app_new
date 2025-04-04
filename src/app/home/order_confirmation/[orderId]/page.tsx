// // src/app/home/order_confirmation/page.tsx
// "use client";

// import { useLoading } from "@/context/LoadingContext";
// import { useEffect, useState, Suspense } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import { useCart, CartItem } from "@/context/CartContext";
// import Link from "next/link";
// import { FaCheckCircle, FaEnvelope, FaFileAlt, FaHome, FaTimesCircle } from "react-icons/fa";
// import { getStripePromise } from "../../../../lib/stripe_client";
// import { ShippingData } from "@/app/home/shipping/page";

// interface OrderDetails {
//   orderNumber: string;
//   items: CartItem[];
//   total: number;
//   subtotal: number;
//   tax: number;
//   fee: number;
//   shippingInfo: ShippingData;
// }

// // Loading component to display while order is being verified
// function OrderLoading() {
//   return (
//     <div className="w-4/5 mx-auto py-12">
//       <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm border p-8">
//         <div className="flex flex-col items-center justify-center min-h-[300px]">
//           <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mb-4"></div>
//           <p className="text-lg text-gray-600">Verifying your order...</p>
//         </div>
//       </div>
//     </div>
//   );
// }

// // Main component that uses search params
// function OrderConfirmationContent() {
//   const { showLoading, hideLoading } = useLoading();
//   const { cart, setCart, isLoading: isCartLoading } = useCart();
//   const [hasError, setHasError] = useState(false);
//   const [isVerified, setIsVerified] = useState(false);

//   const [orderDetails, setOrderDetails] = useState<OrderDetails>({
//     orderNumber: "",
//     items: [],
//     total: 0,
//     subtotal: 0,
//     tax: 0,
//     fee: 0,
//     shippingInfo: {
//       firstName: "",
//       lastName: "",
//       email: "",
//       phone: "",
//       address: "",
//       city: "",
//       state: "",
//       zipCode: "",
//     },
//   });

//   // This is the hook that needs to be in the Suspense boundary
//   const searchParams = useSearchParams();
//   const router = useRouter();

//   const paymentIntentId = searchParams.get("payment_intent");
//   const paymentIntentClientSecret = searchParams.get("payment_intent_client_secret");

//   const generateOrderNumber = () => {
//     const timestamp = new Date().getTime().toString().slice(-8);
//     const random = Math.floor(Math.random() * 1000)
//       .toString()
//       .padStart(3, "0");
//     return `ORD-${timestamp}-${random}`;
//   };

//   useEffect(() => {
//     if (isCartLoading) {
//       return;
//     }

//     if (paymentIntentId && paymentIntentClientSecret) {
//       const verifyPayment = async () => {
//         try {
//           const stripe = await getStripePromise();
//           const { paymentIntent } = await stripe!.retrievePaymentIntent(paymentIntentClientSecret);

//           if (paymentIntent?.status === "succeeded") {
//             const shippingData = sessionStorage.getItem("shippingInfo");

//             if (cart.items.length && shippingData) {
//               const shipping = JSON.parse(shippingData);

//               const subtotal = cart.subTotalPrice;
//               const tax = subtotal * 0.1;
//               const fee = 3;

//               const orderNumber = generateOrderNumber();

//               try {
//                 showLoading();

//                 const response = await fetch("/api/cart", {
//                   method: "PUT",
//                   headers: {
//                     "Content-Type": "application/json",
//                   },
//                   body: JSON.stringify({
//                     items: cart.items,
//                     orderNumber: orderNumber,
//                   }),
//                 });

//                 const result = await response.json();

//                 if (!result.success) {
//                   console.error("Error", result.message);
//                   setIsVerified(true);
//                   setHasError(true);
//                   return;
//                 }

//                 setCart({
//                   items: [],
//                   totalItems: 0,
//                   subTotalPrice: 0,
//                 });

//                 setOrderDetails({
//                   orderNumber: orderNumber,
//                   items: cart.items,
//                   total: subtotal + tax + fee,
//                   subtotal: subtotal,
//                   tax: tax,
//                   fee: fee,
//                   shippingInfo: shipping,
//                 });
//                 setIsVerified(true);
//               } catch (error) {
//                 console.error("Error", "Error buying product. Please check your connection and try again.");
//                 setHasError(true);
//                 setIsVerified(true);
//               } finally {
//                 hideLoading();
//               }
//             } else {
//               setHasError(true);
//               setIsVerified(true);
//               setTimeout(() => {
//                 router.replace("/home");
//               }, 3000);
//             }
//           } else {
//             console.error("Payment failed:", paymentIntent?.status ? paymentIntent?.status : "");
//             setHasError(true);
//             setIsVerified(true);
//             setTimeout(() => {
//               router.replace("/home/cart");
//             }, 5000);
//           }
//         } catch (error) {
//           console.error("Payment failed:", "Error verifying payment:");
//           setHasError(true);
//           setIsVerified(true);
//         } finally {
//           hideLoading();
//         }
//       };

//       verifyPayment();
//     } else {
//       setHasError(true);
//       setIsVerified(true);
//       router.replace("/home");
//     }
//   }, [paymentIntentId, paymentIntentClientSecret, isCartLoading]);

//   const formatDate = (daysFromNow: number) => {
//     const date = new Date();
//     date.setDate(date.getDate() + daysFromNow);
//     return date.toLocaleDateString("en-US", {
//       weekday: "long",
//       month: "long",
//       day: "numeric",
//     });
//   };

//   if (isCartLoading || !isVerified) {
//     return (
//       <div className="w-4/5 mx-auto py-12">
//         <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm border p-8">
//           <div className="flex flex-col items-center justify-center min-h-[300px]">
//             <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mb-4"></div>
//             <p className="text-lg text-gray-600">Verifying your order...</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="w-4/5 mx-auto py-12">
//       <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm border p-8">
//         {hasError ? (
//           <div className="text-center mb-10">
//             <FaTimesCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
//             <h1 className="text-2xl md:text-3xl font-bold mb-2">Order Could Not Be Completed</h1>
//             <p className="text-gray-600">We encountered an issue while processing your order.</p>
//             <p className="text-gray-600 mt-2">Please try again or contact our customer support for assistance.</p>
//             <div className="mt-8 flex justify-center">
//               <Link
//                 href="/home/cart"
//                 className="flex items-center justify-center gap-2 py-2 px-6 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
//               >
//                 <FaHome className="w-4 h-4" />
//                 Return to Cart
//               </Link>
//             </div>
//           </div>
//         ) : (
//           <>
//             <div className="text-center mb-10">
//               <FaCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
//               <h1 className="text-2xl md:text-3xl font-bold mb-2">Thank You for Your Order!</h1>
//               <p className="text-gray-600">Your order #{orderDetails.orderNumber} has been placed successfully</p>
//               <p className="text-gray-600 mt-1">
//                 A confirmation email has been sent to <span className="font-medium">{orderDetails.shippingInfo.email}</span>
//               </p>
//             </div>

//             <div className="border rounded-lg p-6 mb-8 bg-gray-50">
//               <h2 className="text-lg font-bold mb-4">Order Summary</h2>

//               <div className="space-y-4 mb-6">
//                 {orderDetails.items.map((item: any) => (
//                   <div key={item.id} className="flex items-start gap-4 pb-4 border-b">
//                     <div className="w-12 h-12 flex-shrink-0">
//                       <img src={item.image} alt={item.title} className="w-full h-full object-contain" />
//                     </div>
//                     <div className="flex-grow min-w-0">
//                       <h3 className="text-sm font-medium truncate">{item.title}</h3>
//                       <p className="text-xs text-gray-500">
//                         {item.condition} - {item.storage} - {item.color}
//                       </p>
//                       <div className="flex justify-between mt-1 text-sm">
//                         <span>Qty: {item.quantity}</span>
//                         <span>${item.price}</span>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               <div className="space-y-2 border-t pt-4 mb-4">
//                 <div className="flex justify-between text-sm">
//                   <span className="text-gray-600">Subtotal</span>
//                   <span>${orderDetails.subtotal}</span>
//                 </div>
//                 <div className="flex justify-between text-sm">
//                   <span className="text-gray-600">Tax (10%)</span>
//                   <span>${orderDetails.tax}</span>
//                 </div>
//                 <div className="flex justify-between text-sm">
//                   <span className="text-gray-600">Quality Assurance Fee</span>
//                   <span>${orderDetails.fee}</span>
//                 </div>
//               </div>

//               <div className="flex justify-between py-2 font-medium border-t">
//                 <span>Total</span>
//                 <span>${orderDetails.total.toFixed(2)}</span>
//               </div>
//             </div>

//             {/* Shipping & Delivery */}
//             <div className="grid md:grid-cols-2 gap-6 mb-8">
//               <div className="border rounded-lg p-4">
//                 <h3 className="font-medium mb-2">Shipping Address</h3>
//                 <address className="text-sm text-gray-600 not-italic">
//                   {orderDetails.shippingInfo.firstName} {orderDetails.shippingInfo.lastName}
//                   <br />
//                   {orderDetails.shippingInfo.address}
//                   <br />
//                   {orderDetails.shippingInfo.city}, {orderDetails.shippingInfo.state} {orderDetails.shippingInfo.zipCode}
//                   <br />
//                   {orderDetails.shippingInfo.phone}
//                 </address>
//               </div>

//               <div className="border rounded-lg p-4">
//                 <h3 className="font-medium mb-2">Estimated Delivery</h3>
//                 <p className="text-sm text-gray-600 mb-1">
//                   Expected arrival: {formatDate(5)} - {formatDate(7)}
//                 </p>
//                 <p className="text-xs text-gray-500">You will receive tracking information by email once your order ships.</p>
//               </div>
//             </div>

//             {/* Action Buttons */}
//             <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
//               <Link
//                 href="/home"
//                 className="flex items-center justify-center gap-2 py-2 px-6 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
//               >
//                 <FaHome className="w-4 h-4" />
//                 Continue Shopping
//               </Link>

//               <button
//                 className="flex items-center justify-center gap-2 py-2 px-6 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
//                 onClick={() => window.print()}
//               >
//                 <FaFileAlt className="w-4 h-4" />
//                 Print Receipt
//               </button>

//               <button className="flex items-center justify-center gap-2 py-2 px-6 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
//                 <FaEnvelope className="w-4 h-4" />
//                 Email Receipt
//               </button>
//             </div>
//           </>
//         )}
//       </div>

//       {/* Show additional information sections only when there's no error */}
//       {!hasError && (
//         <div className="max-w-3xl mx-auto mt-8 grid md:grid-cols-2 gap-6">
//           <div className="bg-white rounded-lg border p-4">
//             <h3 className="font-medium mb-2">Questions about your order?</h3>
//             <p className="text-sm text-gray-600 mb-2">
//               Check our{" "}
//               <Link href="#" className="text-blue-600 hover:underline">
//                 FAQs
//               </Link>{" "}
//               or contact our customer service team at support@phonestore.com.
//             </p>
//             <p className="text-sm text-gray-600">
//               Call us at: <span className="font-medium">1-800-555-0123</span>
//             </p>
//           </div>

//           <div className="bg-white rounded-lg border p-4">
//             <h3 className="font-medium mb-2">Need to make changes?</h3>
//             <p className="text-sm text-gray-600">
//               If you need to cancel or modify your order, please contact us within 1 hour of placing your order. After that time, your order
//               will begin processing for shipment.
//             </p>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// // Main component that wraps everything with Suspense
// export default function OrderConfirmationPage() {
//   return (
//     <Suspense fallback={<OrderLoading />}>
//       <OrderConfirmationContent />
//     </Suspense>
//   );
// }

"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useNotification } from "@/src/context/NotificationContext";
import { useLoading } from "@/src/context/LoadingContext";
import { formatNPR } from "@/src/utils/formatters";
import Image from "next/image";
import FullScreenLoader from "@/src/app/components/FullScreenLoader";

// Order interfaces
interface OrderItem {
  id: string;
  titleName: string;
  colorName: string;
  condition: string;
  storage: string;
  price: number;
  quantity: number;
  image: string;
  seller: string;
}

interface OrderDetails {
  orderId: string;
  items: OrderItem[];
  totalItems: number;
  totalPrice: number;
  createdAt: string;
}

export default function OrderConfirmation() {
  const params = useParams();
  const orderId = params.orderId;
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const { showLoading, hideLoading, isLoading } = useLoading();
  const { showError, showSuccess } = useNotification();

  useEffect(() => {
    let isMounted = true;

    const fetchOrderDetails = async () => {
      if (!orderId) return;

      showLoading();

      try {
        const response = await fetch(`/api/purchased?orderId=${orderId}`);
        const result = await response.json();

        if (!result.success) {
          if (isMounted) {
            showError("Error", result.message || "Failed to fetch order details");
          }
          return;
        }

        if (isMounted) {
          setOrderDetails(result.order);
        }
      } catch (error) {
        console.error("Order details fetch error:", error);

        if (isMounted) {
          showError("Error", "Failed to fetch order details. Please check your connection and try again.");
        }
      } finally {
        if (isMounted) {
          hideLoading();
        }
      }
    };

    fetchOrderDetails();

    return () => {
      isMounted = false;
    };
  }, [orderId, showLoading, hideLoading, showError, showSuccess]);

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      {isLoading && <FullScreenLoader />}

      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Order Confirmation</h1>
            <p className="mt-1 max-w-2xl text-xs md:text-sm text-gray-500">Thank you for your purchase!</p>
          </div>

          <div className="px-4 py-5 sm:px-6">
            <div className="mb-6 p-4 border border-gray-300 rounded-md bg-gray-50">
              <div className="flex items-center mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 md:h-5 w-4 md:w-5 text-green-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="ml-2 text-base md:text-lg font-medium">Order Placed Successfully</p>
              </div>
              <p className="text-xs md:text-sm text-gray-600">Your order has been confirmed and will be shipped soon.</p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <h3 className="text-base md:text-lg font-medium text-gray-900">Order Details</h3>
                <dl className="mt-2 text-xs md:text-sm text-gray-600">
                  <div className="mt-1">
                    <dt className="inline font-medium">Order Number:</dt>
                    <dd className="inline ml-1">{orderDetails?.orderId}</dd>
                  </div>
                  <div className="mt-1">
                    <dt className="inline font-medium">Date:</dt>
                    <dd className="inline ml-1">{orderDetails?.createdAt && new Date(orderDetails.createdAt).toLocaleDateString()}</dd>
                  </div>
                  <div className="mt-1">
                    <dt className="inline font-medium">Total Items:</dt>
                    <dd className="inline ml-1">{orderDetails?.totalItems}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-base md:text-lg font-medium text-gray-900">Order Summary</h3>
              <div className="mt-2 overflow-hidden border-t border-b border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-4 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Product
                      </th>
                      <th
                        scope="col"
                        className="px-4 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Details
                      </th>
                      <th
                        scope="col"
                        className="px-4 md:px-6 py-2 md:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Quantity
                      </th>
                      <th
                        scope="col"
                        className="px-4 md:px-6 py-2 md:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Price
                      </th>
                      <th
                        scope="col"
                        className="px-4 md:px-6 py-2 md:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orderDetails?.items?.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-12 md:h-14 w-12 md:w-14 flex-shrink-0 relative">
                              {item.image ? (
                                <Image
                                  src={item.image}
                                  alt={`${item.titleName} image`}
                                  fill
                                  sizes="(max-width: 768px) 48px, 56px"
                                  className="object-cover rounded"
                                  style={{ objectFit: "cover" }}
                                />
                              ) : (
                                <div className="h-12 md:h-14 w-12 md:w-14 flex items-center justify-center bg-gray-100 rounded">
                                  <div className="text-gray-400 text-xs text-center">No Image</div>
                                </div>
                              )}
                            </div>
                            <div className="ml-3 md:ml-4">
                              <div className="text-xs md:text-sm font-medium text-gray-900">{item.titleName}</div>
                              <div className="text-xs text-gray-500">{item.colorName}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">
                          <div className="text-xs md:text-sm text-gray-900">{item.condition}</div>
                          <div className="text-xs md:text-sm text-gray-500">{item.storage}</div>
                          <div className="text-xs text-gray-400">Seller: {item.seller}</div>
                        </td>
                        <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm text-gray-500 text-right">
                          {item.quantity}
                        </td>
                        <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm text-gray-500 text-right">
                          {formatNPR(item.price)}
                        </td>
                        <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm text-gray-500 text-right">
                          {formatNPR(item.price * item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-white">
                    <tr className="bg-gray-50">
                      <td colSpan={4} className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-bold text-gray-900 text-right">
                        Total
                      </td>
                      <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm font-bold text-gray-900 text-right">
                        {formatNPR(orderDetails?.totalPrice)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-between">
              <Link href="/">
                <button className="w-full sm:w-auto bg-white text-black border border-black py-1.5 md:py-2 px-3 md:px-4 rounded text-xs md:text-sm hover:bg-gray-100 transition-colors">
                  Continue Shopping
                </button>
              </Link>
              <button
                onClick={() => window.print()}
                className="w-full sm:w-auto bg-black text-white py-1.5 md:py-2 px-3 md:px-4 rounded text-xs md:text-sm hover:bg-gray-800 transition-colors"
              >
                Print Receipt
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
