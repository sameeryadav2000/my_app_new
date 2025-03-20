"use client";

import { useLoading } from "@/context/LoadingContext";
import { useNotification } from "@/context/NotificationContext";
import { useEffect, useState } from "react";
import { Star } from "lucide-react";

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
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} size={16} className={`${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
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

  return (
    <div className="space-y-8">
      {/* Average Rating Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-4">Customer Reviews</h3>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Left: Average score */}
          <div className="md:w-1/3 flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
            <span className="text-4xl font-bold text-indigo-600">{averageRating}</span>
            <div className="flex mt-2">{renderStars(Math.round(averageRating))}</div>
            <p className="text-sm text-gray-600 mt-2 text-center">
              Based on {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
            </p>
          </div>

          <div className="md:w-2/3">
            {[5, 4, 3, 2, 1].map((star, idx) => (
              <div key={star} className="flex items-center mb-2">
                <div className="w-16 text-sm text-gray-600 flex items-center">
                  <span>{star}</span>
                  <Star size={12} className="ml-1 text-yellow-400 fill-yellow-400" />
                </div>

                <div className="flex-1 h-4 mx-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-400 to-indigo-500 rounded-full"
                    style={{
                      width: `${(ratingDistribution[5 - star] / maxCount) * 100}%`,
                      transition: "width 0.5s ease",
                    }}
                  ></div>
                </div>

                <div className="w-10 text-xs text-gray-500 text-right">{ratingDistribution[5 - star]}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-100 shadow-sm">
          <div className="mx-auto w-16 h-16 mb-4 text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <p className="text-gray-600 font-medium">No reviews yet for this product</p>
          <p className="text-sm mt-2 text-gray-500">Be the first to share your experience!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="p-5 bg-white rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <div className="flex bg-indigo-50 text-indigo-600 px-2 py-1 rounded">{renderStars(review.rating)}</div>

                {review.userName && <span className="font-medium">{review.userName}</span>}

                <span className="text-xs text-gray-500 ml-auto">{formatDate(review.createdAt)}</span>
              </div>

              {review.title && <h4 className="font-semibold text-lg mb-2 text-gray-800">{review.title}</h4>}

              <p className="text-gray-700 whitespace-pre-line leading-relaxed">{review.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
