const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");
const { default: mongoose } = require("mongoose");



exports.createRating = async (req, res) => {
    const userId = req.user.id;
    const { rating, review, courseId } = req.body;

    
//check if user is enrolled or not
// Check if user is enrolled or not
const courseDetails = await Course.findOne({
  _id: courseId,
  studentsEnrolled: userId // Check for userId directly
});

    if (!courseDetails) {
        return res.status(404).json({
            success: false,
            message: "Student is not enrolled in this course",
        });
    }

    // If user already reviewed the course
    const alreadyReviewed = await RatingAndReview.findOne({
        user: userId,
        course: courseId
    });

    if (alreadyReviewed) {
        return res.status(404).json({
            success: false,
            message: "Course is already reviewed by the user"
        });
    }

    // Create rating and review 
    const ratingReview = await RatingAndReview.create({
        rating,
        review,
        course: courseId,
        user: userId
    });

    // Update course with this rating and review
    const updateCourseDetails = await Course.findByIdAndUpdate(
        { _id: courseId },
        {
            $push: {
                ratingAndReviews: ratingReview._id,
            }
        },
        { new: true }
    );

    console.log(updateCourseDetails);

    return res.status(200).json({
        success: true,
        message: "Rating and review created successfully",
        ratingReview,
    });
};


// Get the average rating for a course

  exports.getAverageRating = async (req, res) => {
  try {
    const { courseId } = req.body; // Now reading from request body
    
    const result = await RatingAndReview.aggregate([
      {
        $match: {
          course: new mongoose.Types.ObjectId(courseId),
        },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          reviewCount: { $sum: 1 },
        },
      },
    ]);

    if (result.length > 0) {
      return res.status(200).json({
        success: true,
        averageRating: result[0].averageRating,
        reviewCount: result[0].reviewCount,
      });
    }

    return res.status(200).json({ 
      success: true, 
      averageRating: 0,
      reviewCount: 0
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve rating",
      error: error.message,
    });
  }
};
 

  // Get all ratings and reviews

  exports.getAllRatingReview = async (req, res) => {
    try {
      const allReviews = await RatingAndReview.find({})
        .sort({ rating: "desc" }) // Sorting by rating in descending order
        .populate({
          path: "user",
          select: "firstName lastName email image accountType role", // include accountType/role for classification
        })
        .populate({
          path: "course",
          select: "courseName", // Populate specific fields from Course model
        })
        .exec(); // Execute the query to get the results

        console.log(allReviews);
  
      res.status(200).json({
        success: true,
        data: allReviews, // Send the populated reviews back to the client
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve the ratings and reviews.",
        error: error.message,
      });
    }
  };

// Admin: delete a rating/review and unlink from course
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    if (!reviewId) {
      return res.status(400).json({ success: false, message: "reviewId is required" });
    }
    const review = await RatingAndReview.findById(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }
    // Remove reference from course
    if (review.course) {
      await Course.findByIdAndUpdate(review.course, { $pull: { ratingAndReviews: review._id } });
    }
    await RatingAndReview.findByIdAndDelete(reviewId);
    return res.status(200).json({ success: true, message: "Review deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to delete review", error: error.message });
  }
};
  // Get the average rating for a course
// exports.getAverageRating = async (req, res) => {
//     try {
//       const { courseId } = req.body;
  
//       // Calculate the average rating and count
//       const result = await RatingAndReview.aggregate([
//         {
//           $match: {
//             course: new mongoose.Types.ObjectId(courseId),
//           },
//         },
//         {
//           $group: {
//             _id: null,
//             averageRating: { $avg: "$rating" },
//             reviewCount: { $sum: 1 },
//           },
//         },
//       ]);
  
//       if (result.length > 0) {
//         return res.status(200).json({
//           success: true,
//           averageRating: result[0].averageRating,
//           reviewCount: result[0].reviewCount,
//         });
//       }
  
//       // If no ratings are found
//       return res.status(200).json({ 
//         success: true, 
//         averageRating: 0,
//         reviewCount: 0
//       });
//     } catch (error) {
//       console.error(error);
//       return res.status(500).json({
//         success: false,
//         message: "Failed to retrieve the rating for the course",
//         error: error.message,
//       });
//     }
// };
  
  
// Admin: create a rating/review without enrollment restriction
exports.createAdminReview = async (req, res) => {
  try {
    const adminUserId = req.user.id;
    const { rating, review, courseId } = req.body;

    if (!courseId || !review || typeof rating === "undefined") {
      return res.status(400).json({ success: false, message: "courseId, rating and review are required" });
    }

    // Ensure the course exists
    const course = await Course.findById(courseId).select("_id");
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // Create rating and review attributed to the admin user
    const ratingReview = await RatingAndReview.create({
      rating,
      review,
      course: courseId,
      user: adminUserId,
    });

    // Link to course
    await Course.findByIdAndUpdate(courseId, { $push: { ratingAndReviews: ratingReview._id } }, { new: true });

    return res.status(200).json({
      success: true,
      message: "Admin review created successfully",
      data: ratingReview,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to create admin review", error: error.message });
  }
};