"use client";

import { useLoading } from "@/context/LoadingContext";
import { useNotification } from "@/context/NotificationContext";
import { useEffect, useState } from "react";
import { Star, MessageSquare, Shield, Check } from "lucide-react";

interface Review {
  id: number;
  userId: number;
  modelId: number;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  userName: string;
}

interface ReviewListProps {
  modelId: number;
}

export default function ReviewList({ modelId }: ReviewListProps) {
  const { showLoading, hideLoading, isLoading } = useLoading();
  const { showSuccess, showError, showInfo } = useNotification();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [error, setError] = useState<string>("");
  const [averageRating, setAverageRating] = useState<number>(0);
  const [activeFilter, setActiveFilter] = useState<number | null>(null);
  const [verifiedReviews, setVerifiedReviews] = useState<number>(0);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!modelId) return;

      try {
        showLoading();

        const response = await fetch(`/api/reviews?modelId=${modelId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();

        if (!result.success) {
          showInfo("Error", result.message);
          return;
        }

        if (Array.isArray(result.data)) {
          setReviews(result.data);
          // Simulate verified reviews count
          setVerifiedReviews(10);

          if (result.data.length > 0) {
            const total = result.data.reduce((sum: number, review: Review) => sum + review.rating, 0);
            setAverageRating(parseFloat((total / result.data.length).toFixed(1)));
          }
        } else {
          setReviews([]);
        }
      } catch (error) {
        showInfo("Error", "Error fetching reviews. Please check your connection and try again.");
      } finally {
        hideLoading();
      }
    };

    fetchReviews();
  }, [modelId]);

  // Function to render stars based on rating
  const renderStars = (rating: number, size = 16) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={size}
        className={`${i < Math.floor(rating) ? "text-black fill-black" : i + 0.5 <= rating ? "text-black fill-black" : "text-gray-200"}`}
      />
    ));
  };

  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const generateRatingDistribution = () => {
    const distribution = [0, 0, 0, 0, 0];

    reviews.forEach((review) => {
      const index = 5 - review.rating;
      if (index >= 0 && index < 5) {
        distribution[index]++;
      }
    });

    return distribution;
  };

  const ratingDistribution = generateRatingDistribution();
  const maxCount = Math.max(...ratingDistribution, 1);

  const filteredReviews = activeFilter
    ? reviews.filter((review) => {
        if (activeFilter === 45) return review.rating >= 4 && review.rating <= 5;
        if (activeFilter === 34) return review.rating >= 3 && review.rating < 4;
        if (activeFilter === 23) return review.rating >= 2 && review.rating < 3;
        if (activeFilter === 12) return review.rating >= 1 && review.rating < 2;
        return false;
      })
    : reviews;

  // Get percentage for each rating category
  const getPercentageFor = (range) => {
    if (reviews.length === 0) return "0%";

    let count = 0;
    if (range === "all") count = reviews.length;
    else if (range === "45") count = reviews.filter((r) => r.rating >= 4 && r.rating <= 5).length;
    else if (range === "34") count = reviews.filter((r) => r.rating >= 3 && r.rating < 4).length;
    else if (range === "23") count = reviews.filter((r) => r.rating >= 2 && r.rating < 3).length;
    else if (range === "12") count = reviews.filter((r) => r.rating >= 1 && r.rating < 2).length;

    return range === "all" ? "100%" : `${Math.round((count / reviews.length) * 100)}%`;
  };

  // Get width for progress bars
  const getWidthFor = (range) => {
    if (reviews.length === 0) return "0%";

    if (range === "all") return "100%";
    else if (range === "45") {
      const count = reviews.filter((r) => r.rating >= 4 && r.rating <= 5).length;
      return `${Math.round((count / reviews.length) * 100)}%`;
    } else if (range === "34") {
      const count = reviews.filter((r) => r.rating >= 3 && r.rating < 4).length;
      return `${Math.round((count / reviews.length) * 100)}%`;
    } else if (range === "23") {
      const count = reviews.filter((r) => r.rating >= 2 && r.rating < 3).length;
      return `${Math.round((count / reviews.length) * 100)}%`;
    } else if (range === "12") {
      const count = reviews.filter((r) => r.rating >= 1 && r.rating < 2).length;
      return `${Math.round((count / reviews.length) * 100)}%`;
    }

    return "0%";
  };

  return (
    <div className="w-[95%] md:w-[70%] mx-auto mt-16 pb-20">
      <h1 className="text-xl font-medium mb-5">
        {reviews.length > 0
          ? `${phoneModelName || "iPhone"} ${selectedStorage || "256GB"} - ${
              selectedColor || "Natural Titanium"
            } - Locked Verizon's customer reviews`
          : "Customer reviews"}
      </h1>

      {reviews.length > 0 && (
        <>
          <div className="flex items-center gap-1 mb-8">
            {renderStars(averageRating, 20)}
            <span className="ml-1 text-lg font-medium">{averageRating}/5</span>
            <div className="flex items-center ml-3 text-sm">
              <Shield size={14} className="mr-1" />
              {verifiedReviews} verified reviews in the last 12 months.
            </div>
          </div>

          <div className="mb-10">
            <h3 className="text-base font-medium mb-4">Filter by stars</h3>
            <div className="space-y-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="rating-filter"
                  className="h-4 w-4 mr-3 accent-black"
                  checked={activeFilter === null}
                  onChange={() => setActiveFilter(null)}
                />
                <span className="mr-4 min-w-[32px]">All</span>
                <div className="flex-grow h-1 bg-gray-200 rounded-full overflow-hidden mr-2">
                  <div className="h-full bg-black rounded-full" style={{ width: getWidthFor("all") }}></div>
                </div>
                <span className="text-sm min-w-[40px] text-right">{getPercentageFor("all")}</span>
              </label>

              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="rating-filter"
                  className="h-4 w-4 mr-3 accent-black"
                  checked={activeFilter === 45}
                  onChange={() => setActiveFilter(45)}
                />
                <span className="mr-4 min-w-[32px]">4-5</span>
                <div className="flex-grow h-1 bg-gray-200 rounded-full overflow-hidden mr-2">
                  <div className="h-full bg-black rounded-full" style={{ width: getWidthFor("45") }}></div>
                </div>
                <span className="text-sm min-w-[40px] text-right">{getPercentageFor("45")}</span>
              </label>

              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="rating-filter"
                  className="h-4 w-4 mr-3 accent-black"
                  checked={activeFilter === 34}
                  onChange={() => setActiveFilter(34)}
                />
                <span className="mr-4 min-w-[32px]">3-4</span>
                <div className="flex-grow h-1 bg-gray-200 rounded-full overflow-hidden mr-2">
                  <div className="h-full bg-black rounded-full" style={{ width: getWidthFor("34") }}></div>
                </div>
                <span className="text-sm min-w-[40px] text-right">{getPercentageFor("34")}</span>
              </label>

              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="rating-filter"
                  className="h-4 w-4 mr-3 accent-black"
                  checked={activeFilter === 23}
                  onChange={() => setActiveFilter(23)}
                />
                <span className="mr-4 min-w-[32px]">2-3</span>
                <div className="flex-grow h-1 bg-gray-200 rounded-full overflow-hidden mr-2">
                  <div className="h-full bg-black rounded-full" style={{ width: getWidthFor("23") }}></div>
                </div>
                <span className="text-sm min-w-[40px] text-right">{getPercentageFor("23")}</span>
              </label>

              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="rating-filter"
                  className="h-4 w-4 mr-3 accent-black"
                  checked={activeFilter === 12}
                  onChange={() => setActiveFilter(12)}
                />
                <span className="mr-4 min-w-[32px]">1-2</span>
                <div className="flex-grow h-1 bg-gray-200 rounded-full overflow-hidden mr-2">
                  <div className="h-full bg-black rounded-full" style={{ width: getWidthFor("12") }}></div>
                </div>
                <span className="text-sm min-w-[40px] text-right">{getPercentageFor("12")}</span>
              </label>
            </div>
          </div>
        </>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-100">
          <div className="mx-auto w-16 h-16 mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <MessageSquare size={24} className="text-gray-400" />
          </div>
          <p className="text-gray-700 font-medium">No reviews yet</p>
          <p className="text-sm mt-2 text-gray-500 max-w-md mx-auto">
            Be the first to share your experience with this product. Your feedback helps others make better decisions.
          </p>
        </div>
      ) : (
        <div>
          {filteredReviews.map((review, index) => {
            // Generate a random color for the avatar based on the first letter
            const colors = ["bg-blue-100", "bg-green-100", "bg-yellow-100", "bg-purple-100", "bg-pink-100"];
            const textColors = ["text-blue-800", "text-green-800", "text-yellow-800", "text-purple-800", "text-pink-800"];
            const colorIndex = review.userName.charCodeAt(0) % colors.length;
            const avatarBg = colors[colorIndex];
            const avatarText = textColors[colorIndex];

            return (
              <div key={review.id} className={`${index > 0 ? "border-t border-gray-100 pt-8" : ""} pb-8 mb-4`}>
                <div className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 ${avatarBg} rounded-full flex items-center justify-center ${avatarText} font-semibold flex-shrink-0`}
                  >
                    {review.userName.charAt(0).toUpperCase()}
                  </div>

                  <div className="w-full">
                    <div className="font-semibold mb-1">{review.userName}</div>
                    <div className="text-sm text-gray-600 mb-3">
                      Purchased on {formatDate(review.createdAt)}
                      <span className="inline-flex items-center ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                        <Check size={12} className="mr-0.5" /> Verified purchase
                      </span>
                    </div>

                    <div className="flex mb-2">
                      {renderStars(review.rating)}
                      <span className="ml-1 text-sm">{review.rating}/5</span>
                    </div>

                    <p className="text-gray-800 my-4">
                      {review.comment || "I loved it! It's like new and everything works perfectly! Thanks"}
                    </p>

                    <div className="text-sm text-gray-500">
                      Reviewed in the United States on {formatDate(new Date(review.createdAt).getTime() + 4 * 24 * 60 * 60 * 1000)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
