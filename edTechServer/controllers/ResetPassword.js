const User = require('../models/User');
const mailSender = require('../utils/mailSender');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

exports.resetPasswordToken = async(req, res)=>{

    try{
        // get email
    const email = req.body.email;
    //check user
    const user = await User.findOne({email:email});
    if(!user){
        return res.json({
            success:false,
            message:"You Email is not registered with us",

        });
    }

    //generate token
    const token = crypto.randomUUID();

    const updatedDetails = await User.findOneAndUpdate(
        {email : email},
        {
            token:token ,
            resetPasswordExpires:Date.now()+ 5*60*1000,
        },
        {new:true}
    );


    //create Url
    const url = `http://localhost:3000/update-password/${token}`

    await mailSender(email , "Password Reset Link" ,
        `Password Reset Link:${url}`
     );

     //res
     return res.json({
        success:true,
        message:"email sent successfully , please check email and change password",
     });

    }
    catch(err){
     console.log(err);
     return res.status(500).json({
        success:false,
        message:"Something went wrong while sending reset password link",
     })
    }
}

//reset password
exports.resetPassword= async(req , res)=>{
    try{
        //data fetch
    const {token ,password , confirmPassword} = req.body;

    //validation
    if(confirmPassword != password){
        return res.json({
            success:false,
            message:'Password not matching',
        });
    }

    const userDetails = await User.findOne({token:token});

    if(!userDetails){
  
        return res.json({
            success:false,
            message:"token is invalid",
        });
    }

    //token time check
    if(userDetails.resetPasswordExpires < Date.now()){
        return res.json({
            success:false,
            message:"Token is expired , please regenerate your token",
        });
    }

    //hash password
    const hashedPassword =await bcrypt.hash(password , 10);
  
    await User.findOneAndUpdate(
        {
            token:token
        },
       {password:hashedPassword},
       {new:true},
    )

  // res
  return res.status(200).json({
    success:true,
    message:"Password reset successfully",
  });
    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:"something went wrong in reset password",
        });
    }

}