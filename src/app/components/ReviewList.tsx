// src/app/components/ReviewList.tsx
"use client";

import { useState, useEffect } from "react";
import StarRating from "./StarRating";

interface ReviewProps {
  id: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  user?: {  // Make user optional
    firstName: string | null;
    lastName: string | null;
    avatar: string | null;
  };
}

interface ReviewListProps {
  modelId: number;
}

const ReviewList = ({ modelId }: ReviewListProps) => {
  const [reviews, setReviews] = useState<ReviewProps[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/reviews?modelId=${modelId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch reviews");
        }
        
        const data = await response.json();
        console.log("API response data:", data);
        
        // Handle the reviews data properly
        if (data.reviews) {
          // If it's a single review object (not an array)
          if (!Array.isArray(data.reviews) && typeof data.reviews === 'object') {
            setReviews([data.reviews]); // Wrap it in an array
          } 
          // If it's already an array
          else if (Array.isArray(data.reviews)) {
            setReviews(data.reviews);
          }
          else {
            setReviews([]);
          }
        } else {
          setReviews([]);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [modelId]);

  if (loading) {
    return <div className="py-4">Loading reviews...</div>;
  }

  if (error) {
    return <div className="py-4 text-red-500">{error}</div>;
  }

  if (!Array.isArray(reviews) || reviews.length === 0) {
    return (
      <div className="py-4">
        No reviews yet. Be the first to review this product!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Customer Reviews</h2>

      {reviews.map((review) => (
        <div key={review.id} className="border-b pb-4 mb-4">
          <div className="flex items-center mb-2">
            <div className="mr-2">
              {review.user?.avatar ? (
                <img
                  src={review.user.avatar}
                  alt="User"
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                  {review.user?.firstName?.charAt(0) || "U"}
                </div>
              )}
            </div>
            <div>
              <div className="font-medium">
                {review.user?.firstName || "Anonymous"}{" "}
                {review.user?.lastName || ""}
              </div>
              <div className="text-sm text-gray-500">
                {new Date(review.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="mb-2">
            <StarRating
              value={review.rating}
              onChange={() => {}}
              editable={false}
              size={18}
            />
          </div>

          <h3 className="font-bold mb-1">{review.title}</h3>
          <p className="text-gray-700">{review.comment}</p>
        </div>
      ))}
    </div>
  );
};

export default ReviewList;