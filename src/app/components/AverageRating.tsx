// src/app/components/AverageRating.tsx
"use client";

import { useState, useEffect } from "react";
import StarRating from "./StarRating";

interface AverageRatingProps {
  modelId: number;
}

const AverageRating = ({ modelId }: AverageRatingProps) => {
  const [averageRating, setAverageRating] = useState<number>(0);
  const [totalReviews, setTotalReviews] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRating = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/average_rating?modelId=${modelId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch rating data");
        }

        const data = await response.json();
        setAverageRating(data.averageRating);
        setTotalReviews(data.totalReviews);
      } catch (error) {
        console.error("Error fetching average rating:", error);
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRating();
  }, [modelId]);

  if (loading) {
    return <div className="flex items-center gap-2">Loading ratings...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-sm">{error}</div>;
  }

  return (
    <div className="flex items-center gap-2">
      <StarRating
        value={Math.round(averageRating)}
        onChange={() => {}}
        editable={false}
        size={18}
      />
      <span className="text-sm">
        {averageRating.toFixed(1)} ({totalReviews}{" "}
        {totalReviews === 1 ? "review" : "reviews"})
      </span>
    </div>
  );
};

export default AverageRating;
