// const Razorpay = require('razorpay');

// const instance = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY, // Ensure this is correct
//   key_secret: process.env.RAZORPAY_SECRET // Ensure this is correct
// });

// module.exports = { instance };

// 
const Razorpay = require('razorpay');

exports.instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,     // ✅ Updated key name
  key_secret: process.env.RAZORPAY_KEY_SECRET // ✅ Updated key name
});



