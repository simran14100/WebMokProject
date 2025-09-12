const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");
const { default: mongoose } = require("mongoose");



exports.createRating = async (req, res) => {
    try {
        console.log('=== START createRating ===');
        console.log('Request Headers:', req.headers);
        console.log('User from request:', JSON.stringify(req.user, null, 2));
        console.log('Request Body:', req.body);
        
        // Get user ID from the authenticated user
        const userId = req.user?._id || req.user?.id;
        
        // Log the user ID for debugging
        console.log('User ID from request:', userId);
        console.log('User ID type:', typeof userId);
        
        if (!userId) {
            console.error('No user ID found in request');
            console.error('Available user properties:', Object.keys(req.user || {}));
            return res.status(401).json({
                success: false,
                message: 'User not authenticated - No user ID found',
                userInfo: req.user ? {
                    id: req.user.id,
                    _id: req.user._id,
                    email: req.user.email,
                    accountType: req.user.accountType
                } : 'No user object found'
            });
        }

        const { rating, review, courseId } = req.body;

        if (!courseId) {
            console.error('No courseId provided in request');
            return res.status(400).json({
                success: false,
                message: 'Course ID is required',
            });
        }

        // Check if user is enrolled in the course
        const courseDetails = await Course.findOne({
            _id: courseId,
            studentsEnrolled: { $in: [userId] }
        }).lean();

        if (!courseDetails) {
            console.error(`User ${userId} is not enrolled in course ${courseId}`);
            return res.status(403).json({
                success: false,
                message: 'You must be enrolled in this course to leave a review',
            });
        }

        // If user already reviewed the course
        const alreadyReviewed = await RatingAndReview.findOne({
            user: userId,
            course: courseId
        });

        if (alreadyReviewed) {
            return res.status(400).json({
                success: false,
                message: "You have already reviewed this course"
            });
        }

        // Validate rating
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid rating between 1 and 5"
            });
        }

        // Create rating and review 
        const ratingReview = await RatingAndReview.create({
            rating,
            review: review || '',
            course: courseId,
            user: userId
        });

        // Update course with this rating and review
        await Course.findByIdAndUpdate(
            courseId,
            {
                $push: {
                    ratingAndReviews: ratingReview._id,
                }
            },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: "Rating and review created successfully",
            data: ratingReview,
        });
    } catch (error) {
        console.error('Error in createRating:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while processing your request',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
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
    console.log('Creating admin review with data:', req.body);
    console.log('Authenticated user:', req.user);
    
    const adminUserId = req.user?.id || req.user?._id;
    const { rating, review, courseId } = req.body;

    if (!adminUserId) {
      console.error('No admin user ID found in request');
      return res.status(401).json({ success: false, message: "Admin authentication required" });
    }

    if (!courseId || typeof rating === "undefined" || !review) {
      return res.status(400).json({ 
        success: false, 
        message: "courseId, rating and review are required" 
      });
    }

    // Ensure the course exists
    const course = await Course.findById(courseId).select("_id");
    if (!course) {
      return res.status(404).json({ 
        success: false, 
        message: "Course not found" 
      });
    }

    console.log('Creating review with data:', {
      rating,
      review,
      course: courseId,
      user: adminUserId,
      isAdminReview: true
    });

    // Create rating and review attributed to the admin user
    const ratingReview = await RatingAndReview.create({
      rating,
      review,
      course: courseId,
      user: adminUserId,
      isAdminReview: true
    });

    // Link to course
    await Course.findByIdAndUpdate(
      courseId, 
      { $push: { ratingAndReviews: ratingReview._id } }, 
      { new: true }
    );

    console.log('Successfully created admin review:', ratingReview);
    
    return res.status(200).json({
      success: true,
      message: "Admin review created successfully",
      data: ratingReview,
    });
  } catch (error) {
    console.error('Error in createAdminReview:', error);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to create admin review", 
      error: error.message 
    });
  }
};