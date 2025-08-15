const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({

    courseName:{
        type:String,
    },
    courseDescription:{
        type:String
    },
    instructor:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    whatYouWillLearn:{
        type:String,
    },
    
    instructions: {
    type: [String],
  },
    courseContent:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'Section',
        }
    ],

   ratingAndReviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RatingAndReview",
    },
  ],
    price:{
        type:Number
    },
    thumbnail:{
        type:String
    },
    // Optional intro video URL for the course landing page
    introVideo: {
        type: String,
    },
    tag:{
        type:[String],
        required:true,
    },
    // Optional subcategory reference
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      // required: true,
      ref: "Category",
    },

    studentsEnrolled:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true,
        }
    ],
    status: {
      type: String,
      enum: ["Draft", "Published"],
    },

    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Course" , courseSchema);
