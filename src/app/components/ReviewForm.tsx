import React, { useState } from "react";
import Image from "next/image";

export interface ReviewProps {
  purchasedItemId: string;
  phoneModelName: string;
  purchasedItemImage: string;
  onSubmit: (reviewData: ReviewData) => void;
  onCancel: () => void;
}

export interface ReviewData {
  purchasedItemId: string;
  rating: number;
  title: string;
  review: string;
}

export default function ReviewComponent({ purchasedItemId, phoneModelName, purchasedItemImage, onSubmit, onCancel }: ReviewProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [title, setTitle] = useState<string>("");
  const [review, setReview] = useState<string>("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { [key: string]: string } = {};
    if (rating === 0) newErrors.rating = "Please select a rating";
    if (!title.trim()) newErrors.title = "Please enter a review title";
    if (!review.trim()) newErrors.review = "Please enter your review";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      purchasedItemId,
      rating,
      title,
      review,
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg md:text-xl font-bold text-gray-900">Write a Review</h2>
        <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
          <svg className="w-5 md:w-6 h-5 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex items-center mb-6 pb-6 border-b border-gray-200">
        <div className="w-16 h-16 bg-gray-100 rounded mr-4 flex-shrink-0 relative">
          {purchasedItemImage ? (
            <Image src={purchasedItemImage} alt={phoneModelName} fill className="object-contain" />
          ) : (
            <div className="text-gray-400 text-xs text-center h-full flex items-center justify-center">No Image</div>
          )}
        </div>
        <h3 className="text-base md:text-lg font-medium text-gray-900">{phoneModelName}</h3>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Overall Rating</label>
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="text-xl md:text-2xl mr-1 focus:outline-none"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
              >
                <span className={`${star <= (hoverRating || rating) ? "text-yellow-400" : "text-gray-300"}`}>★</span>
              </button>
            ))}
            {errors.rating && <span className="text-red-500 text-xs md:text-sm ml-2">{errors.rating}</span>}
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="review-title" className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
            Review Title
          </label>
          <input
            type="text"
            id="review-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`w-full px-4 py-2 border ${
              errors.title ? "border-red-500" : "border-gray-300"
            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
            placeholder="Summarize your experience"
          />
          {errors.title && <p className="mt-1 text-xs md:text-sm text-red-500">{errors.title}</p>}
        </div>

        <div className="mb-6">
          <label htmlFor="review-text" className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
            Your Review
          </label>
          <textarea
            id="review-text"
            value={review}
            onChange={(e) => setReview(e.target.value)}
            rows={4}
            className={`w-full px-4 py-2 border ${
              errors.review ? "border-red-500" : "border-gray-300"
            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
            placeholder="What did you like or dislike about this product?"
          />
          {errors.review && <p className="mt-1 text-xs md:text-sm text-red-500">{errors.review}</p>}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 md:px-4 py-1.5 md:py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none text-xs md:text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-3 md:px-4 py-1.5 md:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none text-xs md:text-sm"
          >
            Submit Review
          </button>
        </div>
      </form>
    </div>
  );
}
