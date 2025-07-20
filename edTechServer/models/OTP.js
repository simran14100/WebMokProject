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
        default:Date.now(),
        expires:5*60,
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
// Define a post-save hook to send email after the document has been saved
OTPSchema.pre("save", async function (next) {
	console.log("New document saved to database");

	// Only send an email when a new document is created
	if (this.isNew) {
		await sendVerificationEmail(this.email, this.otp);
	}
	next();
});

module.exports = mongoose.model("OTP" , OTPSchema);