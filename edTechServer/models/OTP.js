const mongoose = require('mongoose');
const mailSender = require('../utils/mailSender');
const emailTemplate = require("../mail/templates/emailVerificationTemplate");

const OTPSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
    },
    createdAt:{
        type:Date,
        default: Date.now, // Fixed: removed the function call
        expires: 5*60, // 5 minutes
    },
    otp:{
        type:String,
        required:true,
    }
});

//to send emails

async function sendVerificationEmail(email , otp){

    try{
        const mailResponse = await mailSender(email , 
            "verification email from studynotation" ,
             emailTemplate(otp));
        console.log("email sent successfully " , mailResponse);
        console.log(emailTemplate(otp));
    }
    catch(err){
        console.log("error occured while sending emails" , err);
        throw err;
    }
}

// Define a pre-save hook to send email after the document has been created
OTPSchema.pre("save", async function (next) {
    console.log("=== OTP SAVE HOOK ===");
    console.log("New document about to be saved to database");
    console.log("Email:", this.email);
    console.log("OTP:", this.otp);
    console.log("Is new document:", this.isNew);
    console.log("=====================");

    // Only send an email when a new document is created
    if (this.isNew) {
        try {
            await sendVerificationEmail(this.email, this.otp);
            console.log("Verification email sent successfully (pre-save hook)");
        } catch (error) {
            console.error("Error sending verification email (pre-save hook):", error?.message || error);
            // Do not block OTP persistence due to email errors
        }
    }
    next();
});

module.exports = mongoose.model("OTP" , OTPSchema);