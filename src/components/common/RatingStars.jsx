import React, { useEffect, useState } from "react";
import {
  TiStarFullOutline,
  TiStarHalfOutline,
  TiStarOutline,
} from "react-icons/ti";
import { apiConnector } from "../../services/apiConnector.js";
import { toast } from "react-hot-toast";
import { course} from "../../services/apis.js"
function RatingStars({ courseId, Star_Size }) {
  const [ratingData, setRatingData] = useState({
    averageRating: 0,
    reviewCount: 0,
    loading: true,
  });

 useEffect(() => {
  console.log("useEffect triggered with courseId:", courseId);
  
  if (!courseId) {
    console.warn("No courseId provided to RatingStars");
    return;
  }

  const fetchRating = async () => {
    console.log("Starting fetchRating for course:", courseId);
    
    try {
      console.log("Making API request...");
      const response = await apiConnector(
        "GET", // Matches backend method
          course.GET_AVERAGE_RATING_API, // Using your constant
        { courseId }
      );

      console.log("API Response:", response);
      
      if (!response) {
        throw new Error("No response received from server");
      }

      if (response.data?.success) {
        console.log("Received rating data:", response.data);
        setRatingData({
          averageRating: response.data.averageRating || 0,
          reviewCount: response.data.reviewCount || 0,
          loading: false,
        });
      } else {
        throw new Error(response.data?.message || "Invalid response format");
      }
    } catch (error) {
      console.error("Error in fetchRating:", error);
      toast.error(error.message);
      setRatingData(prev => ({ ...prev, loading: false }));
    }
  };

  fetchRating();
}, [courseId]);
  const starCount = {
    full: Math.floor(ratingData.averageRating),
    half: Number.isInteger(ratingData.averageRating) ? 0 : 1,
    empty: Number.isInteger(ratingData.averageRating)
      ? 5 - Math.floor(ratingData.averageRating)
      : 4 - Math.floor(ratingData.averageRating),
  };

  if (ratingData.loading) {
    return <div className="text-sm text-gray-500">Loading ratings...</div>;
  }

  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-1 text-yellow-400">
        {[...new Array(starCount.full)].map((_, i) => (
          <TiStarFullOutline key={`full-${i}`} size={Star_Size || 20} />
        ))}
        {[...new Array(starCount.half)].map((_, i) => (
          <TiStarHalfOutline key={`half-${i}`} size={Star_Size || 20} />
        ))}
        {[...new Array(starCount.empty)].map((_, i) => (
          <TiStarOutline key={`empty-${i}`} size={Star_Size || 20} />
        ))}
      </div>
      <span className="text-xs text-gray-500">
        ({ratingData.reviewCount} {ratingData.reviewCount === 1 ? "review" : "reviews"})
      </span>
    </div>
  );
}

export default RatingStars;
