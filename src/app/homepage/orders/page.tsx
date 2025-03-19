"use client";

import { useLoading } from "@/context/LoadingContext";
import { useNotification } from "@/context/NotificationContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Spacer from "@/app/components/Spacer";
import Link from "next/link";
import { CartItem } from "@/context/CartContext";
import ReviewComponent from "@/app/components/ReviewForm";
import { ReviewData } from "@/app/components/ReviewForm";

interface PurchasedItem {
  id: string;
  itemId: string;
  title: string;
  condition: string;
  storage: string;
  color: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  orderId: string;
  items: PurchasedItem[];
  totalItems: number;
  totalPrice: number;
  createdAt: string;
}

interface PurchaseHistory {
  purchases: Order[];
  totalOrders: number;
  totalSpent: number;
}

interface ReviewData {
  hasReviewed: boolean;
  review: {
    id: string;
    rating: number;
    title: string;
    comment: string;
    createdAt: string;
  } | null;
}

interface ReviewsMap {
  [itemId: string]: ReviewData;
}

export default function OrdersPage() {
  const { showLoading, hideLoading, isLoading } = useLoading();
  const { showSuccess, showError, showInfo } = useNotification();
  const [orders, setOrders] = useState<Order[]>([]);
  const [productReviews, setProductReviews] = useState<Record<string, ReviewData>>({});
  const [currentProduct, setCurrentProduct] = useState<PurchasedItem>();
  const [showReview, setShowReview] = useState<boolean>(false);

  const [currentReview, setCurrentReview] = useState<any>(null);
  const [viewingReview, setViewingReview] = useState(false);

  useEffect(() => {
    const fetchPurchasedItems = async () => {
      try {
        showLoading();

        const response = await fetch("/api/purchased", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();
        if (!result.success) {
          showError("Error", result.message);
          return;
        }

        if (result.data && result.data.purchases) {
          setOrders(result.data.purchases);

          const reviewsData = await fetchReviewsForProducts(result.data.purchases.flatMap((order: Order) => order.items));
          setProductReviews(reviewsData);
        }
      } catch (error) {
        showError("Error", "Error fetching orders. Please check your connection and try again.");
      } finally {
        hideLoading();
      }
    };

    fetchPurchasedItems();
  }, []);

  const fetchReviewsForProducts = async (items: PurchasedItem[]) => {
    const reviewsMap: ReviewsMap = {};

    try {
      showLoading();

      const uniqueItemIds = new Set(items.map((item) => item.itemId));

      for (const itemId of uniqueItemIds) {
        const response = await fetch(`/api/reviews?productId=${itemId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();

        if (!result.success) {
          showError("Error", result.message);
          continue;
        }

        items.forEach((item) => {
          if (item.itemId === itemId) {
            reviewsMap[item.id] = {
              hasReviewed: result.isReviewed,
              review: result.isReviewed ? result.review : null,
            };
          }
        });
      }
    } catch (error) {
      showError("Error", "Error fetching reviews:. Please check your connection and try again.");
    } finally {
      hideLoading();
    }

    return reviewsMap;
  };

  // Function to format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const handleReviewOrder = (item: PurchasedItem) => {
    debugger;
    setCurrentProduct(item);
    setShowReview(true);
  };

  const handleViewReview = (order: CartItem) => {
    const review = productReviews[order.id]?.review;
    if (review) {
      setCurrentReview(review);
      setViewingReview(true);
    }
  };

  const handleSubmitReview = async (reviewData: ReviewData) => {
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reviewData),
      });

      if (!response.ok) {
        throw new Error("Failed to submit review");
      }
      const result = await response.json();
      console.log("Review submitted successfully:", result);

      if (currentProduct) {
        setProductReviews((prev) => ({
          ...prev,
          [currentProduct.id]: {
            hasReviewed: true,
            review: result.review,
          },
        }));
      }

      setShowReview(false);
    } catch (error) {
      console.error("Error submitting review:", error);
    } finally {
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Orders</h1>

      {orders.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <div className="mb-4">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
              />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">No orders yet</h3>
          <p className="text-gray-500 mb-6">Looks like you haven't placed any orders yet.</p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
            Browse Products
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {orders.map((order) => (
            <div key={order.orderId} className="bg-white rounded-xl shadow overflow-hidden transition-all hover:shadow-lg">
              <div className="border-b border-gray-200 bg-gray-50 p-4 sm:px-6">
                <div className="flex flex-wrap items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="text-sm text-gray-500">ORDER PLACED</p>
                      <p className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="h-6 border-l border-gray-300"></div>
                    <div>
                      <p className="text-sm text-gray-500">ORDER ID</p>
                      <p className="font-medium">#{order.orderId}</p>
                    </div>
                    <div className="h-6 border-l border-gray-300"></div>
                    <div>
                      <p className="text-sm text-gray-500">TOTAL</p>
                      <p className="font-medium">{formatPrice(order.totalPrice)}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <span className="mr-2 bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1 rounded-full">
                      {order.totalItems} {order.totalItems === 1 ? "item" : "items"}
                    </span>
                    <button className="text-blue-600 hover:text-blue-800 font-medium">Track Package</button>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Multiple items per order */}
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col md:flex-row mb-6 pb-6 border-b border-gray-200 last:mb-0 last:pb-0 last:border-0"
                  >
                    <div className="md:w-24 flex-shrink-0 bg-gray-100 rounded-lg p-2 mb-4 md:mb-0">
                      <img src={item.image} alt={item.title} className="w-full h-auto object-contain" />
                    </div>

                    <div className="md:ml-6 flex-grow">
                      <h2 className="text-xl font-medium text-gray-900 mb-2">{item.title}</h2>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Condition</p>
                          <p className="font-medium">{item.condition}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Storage</p>
                          <p className="font-medium">{item.storage}GB</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Color</p>
                          <p className="font-medium">{item.color}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Quantity</p>
                          <p className="font-medium">{item.quantity}</p>
                        </div>
                      </div>

                      <div className="flex justify-between items-end">
                        <div className="text-gray-900 font-bold text-xl">{formatPrice(item.price * item.quantity)}</div>

                        <div className="flex space-x-2">
                          {/* Keep review buttons functionality as is but connect to individual items */}
                          {productReviews[item.id]?.hasReviewed ? (
                            <button
                              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center"
                              onClick={() => handleViewReview(item)}
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
                              View Review
                            </button>
                          ) : (
                            <button
                              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center"
                              onClick={() => handleReviewOrder(item)}
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                              Write a Review
                            </button>
                          )}
                          <button className="text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg px-4 py-2 transition-colors">
                            Buy Again
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal Overlay */}
      {showReview && currentProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div
            className="w-full max-w-2xl max-h-screen overflow-y-auto animate-slideIn"
            style={{
              animationDuration: "0.3s",
              transform: "translateY(0)",
            }}
          >
            <ReviewComponent
              productId={currentProduct.itemId}
              productTitle={currentProduct.title}
              productImage={currentProduct.image}
              onSubmit={handleSubmitReview}
              onCancel={() => setShowReview(false)}
            />
          </div>
        </div>
      )}

      {viewingReview && currentProduct && currentReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div
            className="w-full max-w-2xl max-h-screen overflow-y-auto animate-slideIn bg-white rounded-xl shadow-xl p-6"
            style={{
              animationDuration: "0.3s",
              transform: "translateY(0)",
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Your Review</h2>
              <button onClick={() => setViewingReview(false)} className="text-gray-500 hover:text-gray-800">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded p-1 mr-4">
                <img src={currentProduct.image} alt={currentProduct.title} className="w-full h-full object-contain" />
              </div>
              <div>
                <p className="font-medium text-lg">{currentProduct.title}</p>
                <p className="text-sm text-gray-500">
                  {currentProduct.color} · {currentProduct.storage}GB · {currentProduct.condition}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="flex items-center mb-2">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-5 h-5 ${i < currentReview.rating ? "text-yellow-400" : "text-gray-300"}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="ml-2 text-gray-600">{new Date(currentReview.createdAt).toLocaleDateString()}</span>
              </div>

              <h3 className="text-xl font-semibold mb-2">{currentReview.title}</h3>
              <p className="text-gray-700">{currentReview.comment}</p>
            </div>

            <div className="flex justify-end">
              <button onClick={() => setViewingReview(false)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add this CSS to your global styles or style block */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideIn {
          animation-name: slideIn;
          animation-fill-mode: forwards;
          animation-timing-function: ease-out;
        }
      `}</style>
    </div>
  );
}
