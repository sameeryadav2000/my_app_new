"use client";

import { useLoading } from "@/context/LoadingContext";
import { useNotification } from "@/context/NotificationContext";
import { useEffect, useState } from "react";
import { Star, MessageSquare, Shield, Check, Tag } from "lucide-react";

interface Review {
  id: number;
  colorName?: string;
  modelName?: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  userName: string;
}

interface ReviewListProps {
  modelId: number;
  colorId?: number;
  onReviewDataLoaded?: (data: { averageRating: number; reviewCount: number }) => void;
}

export default function EnhancedReviewList({ modelId, colorId, onReviewDataLoaded }: ReviewListProps) {
  const { showLoading, hideLoading, isLoading } = useLoading();
  const { showSuccess, showError, showInfo } = useNotification();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [error, setError] = useState<string>("");
  const [averageRating, setAverageRating] = useState<number>(0);
  const [activeFilter, setActiveFilter] = useState<number | null>(null);
  const [activeModelFilter, setActiveModelFilter] = useState<string | null>(null);
  const [activeColorFilter, setActiveColorFilter] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!modelId) return;

      try {
        showLoading();

        const response = await fetch(`/api/reviews?modelId=${modelId}&colorId=${colorId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();

        if (!result.success) {
          setError(result.message || "Failed to fetch reviews");
          showInfo("Error", result.message);
          return;
        }

        if (Array.isArray(result.data)) {
          setReviews(result.data);

          if (result.data.length > 0) {
            const total = result.data.reduce((sum: number, review: Review) => sum + review.rating, 0);
            const avgRating = parseFloat((total / result.data.length).toFixed(1));
            setAverageRating(avgRating);

            if (onReviewDataLoaded) {
              onReviewDataLoaded({
                averageRating: avgRating,
                reviewCount: result.data.length,
              });
            }
          }
        } else {
          setReviews([]);
          if (onReviewDataLoaded) {
            onReviewDataLoaded({
              averageRating: 0,
              reviewCount: 0,
            });
          }
        }
      } catch (error) {
        setError("Error fetching reviews. Please check your connection and try again.");
        showInfo("Error", "Error fetching reviews. Please check your connection and try again.");
      } finally {
        hideLoading();
      }
    };

    fetchReviews();
  }, [modelId, colorId, onReviewDataLoaded]);

  // Get unique model names for filtering (with explicit type assertion)
  const uniqueModels = [
    ...new Set(
      reviews.map((review) => review.modelName).filter((modelName): modelName is string => modelName !== undefined && modelName !== null)
    ),
  ];

  // Get unique color names for filtering (with explicit type assertion)
  const uniqueColors = [
    ...new Set(
      reviews.map((review) => review.colorName).filter((colorName): colorName is string => colorName !== undefined && colorName !== null)
    ),
  ];

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

  // Apply all active filters
  const filteredReviews = reviews.filter((review) => {
    // Apply rating filter
    if (activeFilter) {
      if (activeFilter === 45 && (review.rating < 4 || review.rating > 5)) return false;
      if (activeFilter === 34 && (review.rating < 3 || review.rating >= 4)) return false;
      if (activeFilter === 23 && (review.rating < 2 || review.rating >= 3)) return false;
      if (activeFilter === 12 && (review.rating < 1 || review.rating >= 2)) return false;
    }

    // Apply model filter
    if (activeModelFilter && review.modelName !== activeModelFilter) return false;

    // Apply color filter
    if (activeColorFilter && review.colorName !== activeColorFilter) return false;

    return true;
  });

  // Get percentage for each rating category
  const getPercentageFor = (range: string) => {
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
  const getWidthFor = (range: string) => {
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

  if (error && reviews.length === 0) {
    return (
      <div className="w-[95%] md:w-[70%] mx-auto mt-16 pb-20">
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-100">
          <p className="text-gray-700 font-medium text-error">{error}</p>
          <p className="text-sm mt-2 text-gray-500 max-w-md mx-auto">Please try again later or contact support if the problem persists.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[95%] md:w-[70%] mx-auto mt-12 md:mt-14 lg:mt-16 pb-16 md:pb-18 lg:pb-20">
      {reviews.length > 0 && (
        <>
          <div className="flex items-center gap-1 mb-6 md:mb-7 lg:mb-8">
            <div className="hidden md:hidden lg:flex">{renderStars(averageRating, 20)}</div>
            <div className="hidden md:flex lg:hidden">{renderStars(averageRating, 18)}</div>
            <div className="flex md:hidden lg:hidden">{renderStars(averageRating, 16)}</div>
            <span className="ml-1 text-lg md:text-lg lg:text-xl font-medium">{averageRating}/5</span>
            <span className="ml-3 text-sm md:text-lg lg:text-lg text-gray-600">({reviews.length} total reviews)</span>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Filters - Left Side */}
            <div className="w-full md:w-1/3">
              <h3 className="text-base md:text-base lg:text-lg font-medium mb-4">Filter by stars</h3>
              <div className="space-y-4 mb-8">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="rating-filter"
                    className="h-4 w-4 mr-3 accent-black"
                    checked={activeFilter === null}
                    onChange={() => setActiveFilter(null)}
                  />
                  <span className="mr-4 min-w-[32px] text-sm md:text-base lg:text-base">All</span>
                  <div className="flex-grow h-1 bg-gray-200 rounded-full overflow-hidden mr-2">
                    <div className="h-full bg-black rounded-full" style={{ width: getWidthFor("all") }}></div>
                  </div>
                  <span className="text-sm md:text-base lg:text-base min-w-[40px] text-right">{getPercentageFor("all")}</span>
                </label>

                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="rating-filter"
                    className="h-4 w-4 mr-3 accent-black"
                    checked={activeFilter === 45}
                    onChange={() => setActiveFilter(45)}
                  />
                  <span className="mr-4 min-w-[32px] text-sm md:text-base lg:text-base">4-5</span>
                  <div className="flex-grow h-1 bg-gray-200 rounded-full overflow-hidden mr-2">
                    <div className="h-full bg-black rounded-full" style={{ width: getWidthFor("45") }}></div>
                  </div>
                  <span className="text-sm md:text-base lg:text-base min-w-[40px] text-right">{getPercentageFor("45")}</span>
                </label>

                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="rating-filter"
                    className="h-4 w-4 mr-3 accent-black"
                    checked={activeFilter === 34}
                    onChange={() => setActiveFilter(34)}
                  />
                  <span className="mr-4 min-w-[32px] text-sm md:text-base lg:text-base">3-4</span>
                  <div className="flex-grow h-1 bg-gray-200 rounded-full overflow-hidden mr-2">
                    <div className="h-full bg-black rounded-full" style={{ width: getWidthFor("34") }}></div>
                  </div>
                  <span className="text-sm md:text-base lg:text-base min-w-[40px] text-right">{getPercentageFor("34")}</span>
                </label>

                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="rating-filter"
                    className="h-4 w-4 mr-3 accent-black"
                    checked={activeFilter === 23}
                    onChange={() => setActiveFilter(23)}
                  />
                  <span className="mr-4 min-w-[32px] text-sm md:text-base lg:text-base">2-3</span>
                  <div className="flex-grow h-1 bg-gray-200 rounded-full overflow-hidden mr-2">
                    <div className="h-full bg-black rounded-full" style={{ width: getWidthFor("23") }}></div>
                  </div>
                  <span className="text-sm md:text-base lg:text-base min-w-[40px] text-right">{getPercentageFor("23")}</span>
                </label>

                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="rating-filter"
                    className="h-4 w-4 mr-3 accent-black"
                    checked={activeFilter === 12}
                    onChange={() => setActiveFilter(12)}
                  />
                  <span className="mr-4 min-w-[32px] text-sm md:text-base lg:text-base">1-2</span>
                  <div className="flex-grow h-1 bg-gray-200 rounded-full overflow-hidden mr-2">
                    <div className="h-full bg-black rounded-full" style={{ width: getWidthFor("12") }}></div>
                  </div>
                  <span className="text-sm md:text-base lg:text-base min-w-[40px] text-right">{getPercentageFor("12")}</span>
                </label>
              </div>

              {/* Model Filter */}
              {uniqueModels.length > 1 && (
                <div className="mb-8">
                  <h3 className="text-base md:text-base lg:text-lg font-medium mb-4">Filter by model</h3>
                  <div className="space-y-2">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="model-filter"
                        className="h-4 w-4 mr-3 accent-black"
                        checked={activeModelFilter === null}
                        onChange={() => setActiveModelFilter(null)}
                      />
                      <span className="text-sm md:text-base lg:text-base">All Models</span>
                    </label>
                    {uniqueModels.map((model) => (
                      <label key={model} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="model-filter"
                          className="h-4 w-4 mr-3 accent-black"
                          checked={activeModelFilter === model}
                          onChange={() => setActiveModelFilter(model)}
                        />
                        <span className="text-sm md:text-base lg:text-base">{model}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Filter */}
              {uniqueColors.length > 1 && (
                <div>
                  <h3 className="text-base md:text-base lg:text-lg font-medium mb-4">Filter by color</h3>
                  <div className="space-y-2">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="color-filter"
                        className="h-4 w-4 mr-3 accent-black"
                        checked={activeColorFilter === null}
                        onChange={() => setActiveColorFilter(null)}
                      />
                      <span className="text-sm md:text-base lg:text-base">All Colors</span>
                    </label>
                    {uniqueColors.map((color) => (
                      <label key={color} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="color-filter"
                          className="h-4 w-4 mr-3 accent-black"
                          checked={activeColorFilter === color}
                          onChange={() => setActiveColorFilter(color)}
                        />
                        <span className="text-sm md:text-base lg:text-base">{color}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Reviews List - Right Side */}
            <div className="w-full md:w-2/3">
              {filteredReviews.length === 0 ? (
                <div className="text-center py-12 rounded-lg border border-gray-100">
                  <div className="mx-auto w-16 h-16 mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <MessageSquare size={24} className="text-gray-400" />
                  </div>
                  <p className="text-base md:text-lg lg:text-lg text-gray-700 font-medium">No reviews found</p>
                  <p className="text-sm md:text-base lg:text-base mt-2 text-gray-500 max-w-md mx-auto">
                    Try adjusting your filter to see more reviews.
                  </p>
                </div>
              ) : (
                <div>
                  {filteredReviews.map((review, index) => {
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
                            <div className="text-base md:text-lg lg:text-lg font-semibold mb-1">{review.userName}</div>
                            <div className="text-sm md:text-base lg:text-base text-gray-600 mb-3">
                              Purchased on {formatDate(review.createdAt)}
                              <span className="inline-flex items-center ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs md:text-sm lg:text-sm rounded-full">
                                <Check size={12} className="mr-0.5" /> Verified purchase
                              </span>
                            </div>

                            {/* Display model and color information */}
                            <div className="flex flex-wrap gap-2 mb-3">
                              {review.modelName && (
                                <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-800 text-xs md:text-sm lg:text-sm rounded-full">
                                  <Tag size={12} className="mr-1" /> Model: {review.modelName}
                                </span>
                              )}
                              {review.colorName && (
                                <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-800 text-xs md:text-sm lg:text-sm rounded-full">
                                  <Tag size={12} className="mr-1" /> Color: {review.colorName}
                                </span>
                              )}
                            </div>

                            <div className="flex mb-2">
                              <div className="hidden md:hidden lg:flex">{renderStars(review.rating, 18)}</div>
                              <div className="hidden md:flex lg:hidden">{renderStars(review.rating, 16)}</div>
                              <div className="flex md:hidden lg:hidden">{renderStars(review.rating, 14)}</div>
                              <span className="ml-1 text-sm md:text-base lg:text-base">{review.rating}/5</span>
                            </div>

                            {/* Display review title if available */}
                            {review.title && <h4 className="text-base md:text-lg lg:text-lg font-medium mb-2">{review.title}</h4>}

                            <p className="text-sm md:text-base lg:text-base text-gray-800 my-4">
                              {review.comment || "I loved it! It's like new and everything works perfectly! Thanks"}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {reviews.length === 0 && !error && (
        <div className="text-center py-12 rounded-lg border border-gray-100">
          <div className="mx-auto w-16 h-16 mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <MessageSquare size={24} className="text-gray-400" />
          </div>
          <p className="text-base md:text-lg lg:text-lg text-gray-700 font-medium">No reviews yet</p>
          <p className="text-sm md:text-base lg:text-base mt-2 text-gray-500 max-w-md mx-auto">
            Be the first to share your experience with this product. Your feedback helps others make better decisions.
          </p>
        </div>
      )}
    </div>
  );
}
