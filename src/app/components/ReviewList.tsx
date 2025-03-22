"use client";

import { useLoading } from "@/context/LoadingContext";
import { useNotification } from "@/context/NotificationContext";
import { useEffect, useState } from "react";
import { Star, MessageSquare, ThumbsUp, Award, User } from "lucide-react";

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
      <Star key={i} size={size} className={`${i < rating ? "text-black fill-black" : "text-gray-200"}`} />
    ));
  };

  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 7) {
      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "Yesterday";
      return `${diffDays} days ago`;
    }

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
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

  const filteredReviews = activeFilter ? reviews.filter((review) => review.rating === activeFilter) : reviews;

  return (
    <div className="space-y-6">
      {/* Average Rating Section */}
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-semibold tracking-tight">Customer Reviews</h2>
          {reviews.length > 0 && (
            <div className="flex items-center gap-1">
              <MessageSquare size={18} className="text-gray-400" />
              <span className="text-sm text-gray-600">
                {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-10">
          {/* Left: Average score */}
          <div className="md:w-1/3">
            <div className="flex flex-col items-center p-6 bg-gray-50 rounded-lg border border-gray-100">
              {reviews.length > 0 ? (
                <>
                  <div className="flex mb-2">{renderStars(Math.round(averageRating), 24)}</div>
                  <span className="text-5xl font-bold text-black mb-1">{averageRating}</span>
                  <p className="text-sm text-gray-600">out of 5.0</p>
                </>
              ) : (
                <>
                  <div className="flex mb-2">{renderStars(0, 24)}</div>
                  <span className="text-4xl font-bold text-black mb-1">—</span>
                  <p className="text-sm text-gray-600">No ratings yet</p>
                </>
              )}
            </div>

            {reviews.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveFilter(null)}
                  className={`px-3 py-1 text-sm rounded-full transition-all ${
                    activeFilter === null ? "bg-black text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All
                </button>
                {[5, 4, 3, 2, 1].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setActiveFilter(activeFilter === rating ? null : rating)}
                    className={`px-3 py-1 text-sm rounded-full transition-all flex items-center gap-1 ${
                      activeFilter === rating ? "bg-black text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    disabled={ratingDistribution[5 - rating] === 0}
                  >
                    {rating} <Star size={12} className="fill-current" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Rating distribution */}
          <div className="md:w-2/3">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center mb-3">
                <div className="w-10 text-sm text-gray-600 flex items-center gap-1">
                  {star} <Star size={12} className="text-gray-400" />
                </div>

                <div className="flex-1 h-2 mx-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-black rounded-full"
                    style={{
                      width: `${(ratingDistribution[5 - star] / maxCount) * 100}%`,
                      transition: "width 0.5s ease",
                    }}
                  ></div>
                </div>

                <div className="w-10 text-sm text-right">
                  {Math.round((ratingDistribution[5 - star] / Math.max(reviews.length, 1)) * 100)}%
                </div>
              </div>
            ))}

            {reviews.length > 0 && (
              <div className="mt-8 grid grid-cols-3 gap-3">
                <div className="col-span-1 p-4 bg-gray-50 rounded-lg border border-gray-100 flex flex-col items-center">
                  <ThumbsUp size={18} className="mb-1 text-gray-600" />
                  <div className="text-xl font-semibold">{reviews.filter((r) => r.rating >= 4).length}</div>
                  <div className="text-xs text-gray-500 text-center">Satisfied customers</div>
                </div>

                <div className="col-span-1 p-4 bg-gray-50 rounded-lg border border-gray-100 flex flex-col items-center">
                  <Award size={18} className="mb-1 text-gray-600" />
                  <div className="text-xl font-semibold">
                    {reviews.length > 0 ? `${Math.round((reviews.filter((r) => r.rating >= 4).length / reviews.length) * 100)}%` : "0%"}
                  </div>
                  <div className="text-xs text-gray-500 text-center">Recommendation rate</div>
                </div>

                <div className="col-span-1 p-4 bg-gray-50 rounded-lg border border-gray-100 flex flex-col items-center">
                  <User size={18} className="mb-1 text-gray-600" />
                  <div className="text-xl font-semibold">{new Set(reviews.map((r) => r.userId)).size}</div>
                  <div className="text-xs text-gray-500 text-center">Unique reviewers</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

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
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-medium text-gray-800">
              {activeFilter
                ? `${filteredReviews.length} ${filteredReviews.length === 1 ? "review" : "reviews"} with ${activeFilter} ${
                    activeFilter === 1 ? "star" : "stars"
                  }`
                : "All Reviews"}
            </h3>
          </div>

          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <div key={review.id} className="p-6 bg-white rounded-lg border border-gray-100 transition-all hover:border-gray-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 flex-shrink-0">
                    {review.userName ? review.userName.charAt(0).toUpperCase() : "U"}
                  </div>

                  <div className="flex-1">
                    {review.userName && <div className="font-medium text-gray-800">{review.userName}</div>}
                    <div className="flex text-sm text-gray-500">
                      <span>{formatDate(review.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex bg-gray-50 px-2 py-1 rounded-full border border-gray-100">{renderStars(review.rating)}</div>
                </div>

                {review.title && <h4 className="font-semibold text-lg mb-3 text-black">{review.title}</h4>}

                <p className="text-gray-700 whitespace-pre-line leading-relaxed">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
