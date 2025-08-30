const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName:{
        type:String,
        required:true,
        trim:true,
    },
    lastName:{
        type:String,
        required:true,
        trim:true,
    },
    email:{
        type:String,
        required:true,
        trim:true,
    },
    password:{
        type:String,
        required:true,
        
    },
    token:{
        type:String,
    },
    resetPasswordExpires:{
        type:Date,
    },
    accountType:{
        type:String,
        required:true,
        enum:["Student" , "Instructor" , "Admin", "SuperAdmin", "Content-management"],

    },
    additionalDetails:{
        type:mongoose.Schema.Types.ObjectId ,
        required:true,
        ref:"Profile",
    },
    active: {
      type: Boolean,
      default: true,
    },
    approved: {
      type: Boolean,
      default: true,
    },
    programType: {
      type: String,
      enum: ["UG", "PG", "PhD"],
      default: null
    },
    // Flag to indicate the user was created by an Admin flow (single-create or bulk-upload)
    createdByAdmin: {
      type: Boolean,
      default: false,
    },
    // New field for student payment status
    paymentStatus: {
      type: String,
      enum: ["Pending", "Completed", "Failed"],
      default: "Pending"
    },
    // New field for enrollment fee payment
    enrollmentFeePaid: {
      type: Boolean,
      default: false
    },
    // Payment details
    paymentDetails: {
      orderId: String,
      paymentId: String,
      amount: Number,
      paidAt: Date
    },

    courses:[
        {
            type:mongoose.Schema.Types.ObjectId,
            required:true,
            ref:"Course",
        }
    ],
    // Reference to dynamic UserType for capability flags
    userType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserType",
        default: null,
    },
    image:{
        type:String,
        
    },
    courseProgress:[
        {
        type:mongoose.Schema.Types.ObjectId,
        ref:"CourseProgress",
      }
    ],
   
  // Add timestamps for when the document is created and last modified
},
{ timestamps: true }
)

module.exports = mongoose.model("User" , userSchema);