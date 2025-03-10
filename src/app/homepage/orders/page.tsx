"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Spacer from "@/app/components/Spacer";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import StarRating from "@/app/components/StarRating";

interface OrderStatus {
  status: "Ordered" | "Preparing" | "Shipped" | "Delivered";
  date: string;
  isComplete: boolean;
}

// Define the OrderItem interface to match your API response
interface OrderItem {
  id: string;
  modelId: number; // Added to track the specific model for reviewing
  title: string;
  condition: string;
  storage: string;
  color: string;
  price: number;
  quantity: number;
  image: string;
  isReviewed?: boolean;
  review?: {
    id: string;
    rating: number;
    title: string;
    comment: string;
    createdAt: string;
  };
}

interface Order {
  id: string;
  product: string;
  image: string;
  modelId: number;
  statuses: OrderStatus[];
  currentStatus: string;
  shippingEstimate?: string;
  isReviewed: boolean;
  review?: {
    id: string;
    rating: number;
    title: string;
    comment: string;
    createdAt: string;
  };
  showReviewSection: boolean;
}

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [purchasedItems, setPurchasedItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  // State for review form
  const [reviewForms, setReviewForms] = useState<{
    [orderId: string]: {
      rating: number;
      title: string;
      comment: string;
      submitting: boolean;
      error: string | null;
    };
  }>({});

  // Default example orders
  const [orders, setOrders] = useState<Order[]>([]);

  // Redirect if not logged in
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login_signup");
    }
  }, [status, router]);

  // Fetch purchased items from API when the page loads
  useEffect(() => {
    const fetchPurchasedItems = async () => {
      if (status === "authenticated") {
        try {
          setLoading(true);
          const response = await fetch("/api/cart?page=orders");

          if (!response.ok) {
            throw new Error("Failed to fetch purchased items");
          }
          debugger;

          const data = await response.json();

          if (data.cart && data.cart.items) {
            setPurchasedItems(data.cart.items);

            // Convert purchased items to Order format with initial values
            const initialOrders = data.cart.items.map((item: OrderItem) => {
              const orderId = String(Math.floor(Math.random() * 1000000));

              // Initialize review form state for this order
              setReviewForms((prev) => ({
                ...prev,
                [orderId]: {
                  rating: 0,
                  title: "",
                  comment: "",
                  submitting: false,
                  error: null,
                },
              }));

              return {
                id: orderId,
                product: `${item.title} - ${item.storage} - ${item.color} - ${item.condition}`,
                image: item.image,
                modelId: item.modelId || parseInt(item.id), // fallback to item.id if modelId is not available
                currentStatus: "Delivered", // Setting to Delivered to allow reviews
                isReviewed: false, // Default to false until we fetch the actual status
                review: undefined, // Will be populated when we fetch review status
                showReviewSection: false,
                statuses: [
                  {
                    status: "Ordered",
                    date: new Date().toLocaleDateString(),
                    isComplete: true,
                  },
                  { status: "Preparing", date: "", isComplete: true },
                  { status: "Shipped", date: "", isComplete: true },
                  {
                    status: "Delivered",
                    date: new Date().toLocaleDateString(),
                    isComplete: true,
                  },
                ],
                shippingEstimate: "Estimated delivery in 3-5 business days",
              };
            });

            // Set initial orders
            setOrders(initialOrders);

            // Now fetch review status for each order and update them
            Promise.all(
              initialOrders.map(async (order: Order) => {
                try {
                  // Make API call to check if this model has been reviewed by the current user
                  const reviewResponse = await fetch(
                    `/api/reviews?modelId=${order.modelId}`
                  );

                  if (!reviewResponse.ok) {
                    return order; // Return order as is if API call fails
                  }

                  const reviewData = await reviewResponse.json();

                  // Return updated order with review information
                  return {
                    ...order,
                    isReviewed: reviewData.isReviewed,
                    review: reviewData.review, // This contains the full review if it exists
                  };
                } catch (error) {
                  console.error(
                    `Error fetching review for model ${order.modelId}:`,
                    error
                  );
                  return order; // Return original order if there's an error
                }
              })
            ).then((ordersWithReviews) => {
              // Update orders state with review information
              setOrders(ordersWithReviews);
            });
          }

          setLoading(false);
        } catch (error) {
          console.error("Error fetching purchased items:", error);
          setLoading(false);
        }
      }
    };

    fetchPurchasedItems();
  }, [status]);

  // Function to determine which circles to fill based on status
  const getStatusIndex = (order: Order, status: string) => {
    const index = order.statuses.findIndex((s) => s.status === status);
    return index;
  };

  // Toggle review section visibility
  const toggleReviewSection = (orderId: string) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? { ...order, showReviewSection: !order.showReviewSection }
          : order
      )
    );
  };

  // Handle review form input changes
  const handleReviewChange = (
    orderId: string,
    field: string,
    value: string | number
  ) => {
    setReviewForms((prev) => ({
      ...prev,
      [orderId]: {
        ...prev[orderId],
        [field]: value,
      },
    }));
  };

  // Submit review
  const submitReview = async (orderId: string, modelId: number) => {
    const form = reviewForms[orderId];

    if (form.rating === 0) {
      setReviewForms((prev) => ({
        ...prev,
        [orderId]: {
          ...prev[orderId],
          error: "Please select a rating",
        },
      }));
      return;
    }

    setReviewForms((prev) => ({
      ...prev,
      [orderId]: {
        ...prev[orderId],
        submitting: true,
        error: null,
      },
    }));

    try {
      // Make API call to submit review
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          modelId,
          rating: form.rating,
          title: form.title,
          comment: form.comment,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit review");
      }

      const reviewData = await response.json();

      // Update order to show it as reviewed
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? {
                ...order,
                isReviewed: true,
                review: {
                  id: reviewData.review.id,
                  rating: form.rating,
                  title: form.title,
                  comment: form.comment,
                  createdAt: new Date().toISOString(),
                },
              }
            : order
        )
      );

      // Reset form
      setReviewForms((prev) => ({
        ...prev,
        [orderId]: {
          rating: 0,
          title: "",
          comment: "",
          submitting: false,
          error: null,
        },
      }));
    } catch (error) {
      console.error("Error submitting review:", error);
      setReviewForms((prev) => ({
        ...prev,
        [orderId]: {
          ...prev[orderId],
          submitting: false,
          error:
            error instanceof Error ? error.message : "Failed to submit review",
        },
      }));
    }
  };

  if (loading && status === "authenticated") {
    return (
      <div className="w-4/5 mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">Your Orders</h1>
        <Spacer />
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded-lg mb-6"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-4/5 mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Your Orders</h1>
      <Spacer />

      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <p className="text-gray-500">You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order: Order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-lg p-6">
              <div className="mb-4 flex justify-between items-center">
                <div>
                  <p className="text-gray-500">Order # {order.id}</p>
                  <h2 className="text-lg font-medium">{order.product}</h2>
                </div>
                <div className="flex space-x-2">
                  <button className="bg-black text-white px-4 py-2 rounded-lg">
                    Get help
                  </button>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-6 mb-6">
                <div className="w-24 h-auto">
                  <img
                    src={order.image}
                    alt={order.product}
                    className="w-full h-auto object-contain"
                  />
                </div>

                <div className="flex-1">
                  {/* Order Timeline */}
                  <div className="mb-4 relative">
                    <div className="flex justify-between items-center">
                      {order.statuses.map((status, index) => (
                        <div
                          key={index}
                          className="flex flex-col items-center w-full"
                        >
                          <div
                            className={`h-4 w-4 rounded-full border-2 ${
                              status.isComplete
                                ? "bg-green-600 border-green-600"
                                : "bg-white border-gray-300"
                            }`}
                          ></div>
                          <p className="text-sm font-medium mt-2">
                            {status.status}
                          </p>
                          <p className="text-xs text-gray-500">{status.date}</p>
                          {status.status === "Shipped" &&
                            order.shippingEstimate && (
                              <p className="text-xs text-gray-400">
                                {order.shippingEstimate}
                              </p>
                            )}
                        </div>
                      ))}
                    </div>

                    {/* Progress Line */}
                    <div className="absolute top-2 left-0 right-0 h-0.5 bg-gray-200 -z-10"></div>

                    {/* Filled Progress Line */}
                    <div
                      className="absolute top-2 left-0 h-0.5 bg-green-600 -z-10"
                      style={{
                        width: `${
                          (getStatusIndex(order, order.currentStatus) /
                            (order.statuses.length - 1)) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <Link
                  href="#"
                  className="inline-block border border-gray-300 rounded-lg px-4 py-2 text-sm"
                >
                  Proof of purchase
                </Link>

                {/* Review button - only show if the order has been delivered */}
                {order.currentStatus === "Delivered" && (
                  <button
                    onClick={() => toggleReviewSection(order.id)}
                    className={`inline-flex items-center gap-1 border ${
                      order.isReviewed
                        ? "border-green-500 text-green-600"
                        : "border-blue-500 text-blue-600"
                    } rounded-lg px-4 py-2 text-sm hover:bg-gray-50`}
                  >
                    {order.isReviewed ? "View Your Review" : "Write a Review"}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-4 w-4 transition-transform ${
                        order.showReviewSection ? "rotate-180" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                )}
              </div>

              {/* Retractable Review Section */}
              {order.showReviewSection && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  {order.isReviewed ? (
                    // Show existing review
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <StarRating
                          value={order.review?.rating || 0}
                          onChange={() => {}}
                          editable={false}
                          size={20}
                        />
                        <span className="ml-2 text-sm text-gray-500">
                          {new Date(
                            order.review?.createdAt || ""
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="font-bold text-lg mb-2">
                        {order.review?.title}
                      </h3>
                      <p className="text-gray-700">{order.review?.comment}</p>
                    </div>
                  ) : (
                    // Show review form
                    <div className="bg-white p-4 rounded-lg">
                      <h3 className="font-bold text-lg mb-4">Write a Review</h3>
                      <form className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Rating
                          </label>
                          <StarRating
                            value={reviewForms[order.id]?.rating || 0}
                            onChange={(value) =>
                              handleReviewChange(order.id, "rating", value)
                            }
                          />
                        </div>

                        <div>
                          <label
                            htmlFor={`title-${order.id}`}
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Review Title
                          </label>
                          <input
                            type="text"
                            id={`title-${order.id}`}
                            value={reviewForms[order.id]?.title || ""}
                            onChange={(e) =>
                              handleReviewChange(
                                order.id,
                                "title",
                                e.target.value
                              )
                            }
                            placeholder="Summarize your experience"
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                            disabled={reviewForms[order.id]?.submitting}
                          />
                        </div>

                        <div>
                          <label
                            htmlFor={`comment-${order.id}`}
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Review Details
                          </label>
                          <textarea
                            id={`comment-${order.id}`}
                            value={reviewForms[order.id]?.comment || ""}
                            onChange={(e) =>
                              handleReviewChange(
                                order.id,
                                "comment",
                                e.target.value
                              )
                            }
                            placeholder="Share your thoughts about the product"
                            rows={4}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                            disabled={reviewForms[order.id]?.submitting}
                          />
                        </div>

                        {reviewForms[order.id]?.error && (
                          <p className="text-red-500 text-sm">
                            {reviewForms[order.id].error}
                          </p>
                        )}

                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() =>
                              submitReview(order.id, order.modelId)
                            }
                            disabled={reviewForms[order.id]?.submitting}
                            className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400"
                          >
                            {reviewForms[order.id]?.submitting
                              ? "Submitting..."
                              : "Submit Review"}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
