import React, { useEffect, useState } from "react"
// Icons
import { FaRegStar, FaStar } from "react-icons/fa"
import ReactStars from "react-rating-stars-component"
import { Link } from "react-router-dom"

import GetAvgRating from "../../../utils/avgRating"
import RatingStars from "../../common/RatingStars"

function Course_Card({ course, Height }) {
  // const avgReviewCount = GetAvgRating(course.ratingAndReviews)
  // console.log(course.ratingAndReviews)
  const [avgReviewCount, setAvgReviewCount] = useState(0)
  useEffect(() => {
    const count = GetAvgRating(course.ratingAndReviews)
    setAvgReviewCount(count)
  }, [course])
  // console.log("count............", avgReviewCount)

  return (
    <>
      <div className="bg-white rounded-lg shadow-md border border-green-500 group relative w-full h-80 flex flex-col transition-all duration-200 hover:border-green-700 hover:border-l-2 hover:border-b-2">
        <div className="rounded-t-lg overflow-hidden w-full flex-shrink-0" style={{ height: '60%' }}>
          <img
            src={course?.thumbnail}
            alt="course thumnail"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        </div>
        <div className="flex flex-col flex-1 justify-between  w-full overflow-hidden px-3 py-2" style={{ height: '40%' }}>
          <p className="text-lg font-semibold text-green-700 truncate" title={course?.courseName}>{course?.courseName}</p>
          <p className="text-sm text-gray-600 truncate" title={course?.instructor?.firstName + ' ' + course?.instructor?.lastName}>{course?.instructor?.firstName} {course?.instructor?.lastName}</p>
          <div className="flex items-center  min-w-0">
            <span className="text-green-600 font-bold">{avgReviewCount || 0}</span>
            <RatingStars Review_Count={avgReviewCount} />
            <span className="text-xs text-gray-400 truncate">{course?.ratingAndReviews?.length} Ratings</span>
          </div>
          <p className="text-lg font-bold text-green-700 truncate">Rs. {course?.price}</p>
        </div>
        <Link to={`/courses/${course._id}`} className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <span className="inline-block bg-[#009e5c] text-white text-xs font-semibold px-4 py-2 rounded-full shadow">View Details</span>
        </Link>
      </div>
    </>
  )
}

export default Course_Card
