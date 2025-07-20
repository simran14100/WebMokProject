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
      const courseId = req.body.courseId
  
      // Calculate the average rating using the MongoDB aggregation pipeline
      const result = await RatingAndReview.aggregate([
        {
          $match: {
            course: new mongoose.Types.ObjectId(courseId), // Convert courseId to ObjectId
          },
        },
        {
          $group: {
            _id: null,
            averageRating: { $avg: "$rating" },
          },
        },
      ])
  
      if (result.length > 0) {
        return res.status(200).json({
          success: true,
          averageRating: result[0].averageRating,
        })
      }
  
      // If no ratings are found, return 0 as the default rating
      return res.status(200).json({ success: true, averageRating: 0 })
    } catch (error) {
      console.error(error)
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve the rating for the course",
        error: error.message,
      })
    }
  }
  
 

  // Get all ratings and reviews
  exports.getAllRatingReview = async (req, res) => {
    try {
      const allReviews = await RatingAndReview.find({})
        .sort({ rating: "desc" }) // Sorting by rating in descending order
        .populate({
          path: "user",
          select: "firstName lastName email image", // Populate specific fields from User model
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
  