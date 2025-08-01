import { toast } from "react-hot-toast"
import { apiConnector } from "../apiConnector"
import { payment } from "../apis"

const {
  CAPTURE_PAYMENT_API,
  VERIFY_PAYMENT_API,
} = payment

console.log('Frontend Razorpay Key (at import):', process.env.REACT_APP_RAZORPAY_KEY);

// Load the Razorpay SDK from the CDN
function loadScript(src) {
  return new Promise((resolve) => {
    const script = document.createElement("script")
    script.src = src
    script.onload = () => {
      resolve(true)
    }
    script.onerror = () => {
      resolve(false)
    }
    document.body.appendChild(script)
  })
}

// Buy the Course
export async function buyCourse(token, user, courseId, courseName, coursePrice, navigate, onVerificationFailed = null) {
  const toastId = toast.loading("Loading...")
  try {
    // Loading the script of Razorpay SDK
    const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js")

    if (!res) {
      toast.error("Razorpay SDK failed to load. Check your Internet Connection.")
      return
    }

    console.log("Token used in course payment:", token)
    console.log("Course ID:", courseId)
    console.log("Course Price:", coursePrice)

    // Initiating the Order in Backend
    const orderResponse = await apiConnector(
      "POST",
      CAPTURE_PAYMENT_API,
      {
        courses: [courseId]
      },
      {
        Authorization: `Bearer ${token}`,
      }
    )

    console.log("COURSE ORDER RESPONSE FROM BACKEND............", orderResponse);

    const backendData = orderResponse.data; // Axios wraps backend response in .data
    if (!backendData.success) {
      throw new Error(backendData.message);
    }

    const orderData = backendData.data;
    if (!orderData || !orderData.id || !orderData.amount || !orderData.currency) {
      throw new Error("Order data missing from backend response");
    }

    // Opening the Razorpay SDK
    console.log('Frontend Razorpay Key (before opening Razorpay):', process.env.REACT_APP_RAZORPAY_KEY);
    const options = {
      key: process.env.REACT_APP_RAZORPAY_KEY || "rzp_test_XZrJHQ4hfoi9FU",
      currency: orderData.currency,
      amount: orderData.amount, // Already in paise from backend
      order_id: orderData.id,
      name: "WebMok",
      description: `Thank you for purchasing ${courseName}.`,
      prefill: {
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
      },
      handler: function (response) {
        verifyCoursePayment(response, token, courseId, navigate, onVerificationFailed)
      },
    }
    console.log('Razorpay options.key:', options.key);

    console.log("Razorpay Key used:", process.env.REACT_APP_RAZORPAY_KEY)
    console.log("Razorpay backend order options:", options);

    const paymentObject = new window.Razorpay(options)

    paymentObject.open()
    paymentObject.on("payment.failed", function (response) {
      toast.error("Oops! Payment Failed.")
      console.log(response.error)
    })
  } catch (error) {
    console.log("COURSE PAYMENT API ERROR............", error)
    toast.error("Could Not make Payment.")
  }
  toast.dismiss(toastId)
}

// Verify the Course Payment
async function verifyCoursePayment(bodyData, token, courseId, navigate, onVerificationFailed) {
  const toastId = toast.loading("Verifying Payment...")
  
  // Retry configuration
  const maxRetries = 3;
  const baseDelay = 1000; // 1 second
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Payment verification attempt ${attempt}/${maxRetries}`);
      
      const response = await apiConnector(
        "POST", 
        VERIFY_PAYMENT_API, 
        {
          ...bodyData,
          courses: [courseId]
        }, 
        {
          Authorization: `Bearer ${token}`,
        }
      )

      console.log("VERIFY COURSE PAYMENT RESPONSE FROM BACKEND............", response)

      const backendData = response.data; // Axios wraps backend response in .data
      if (!backendData.success) {
        throw new Error(backendData.message)
      }

      toast.success("Course Payment Successful! You can now access the course.")
      navigate("/dashboard/active-courses")
      return; // Success, exit the retry loop
      
    } catch (error) {
      console.log(`COURSE PAYMENT VERIFY ERROR (Attempt ${attempt}/${maxRetries})............`, error)
      
      // If this is the last attempt, show final error
      if (attempt === maxRetries) {
        // Handle different types of errors
        if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
          toast.error("Payment verification failed. Please contact support with your payment details.")
          console.error("Backend server might be down. Payment verification failed after all retries.")
        } else if (error.response?.status === 500) {
          toast.error("Server error during payment verification. Please contact support.")
        } else {
          toast.error("Could Not Verify Payment. Please contact support.")
        }
        
        // Store payment details for manual verification if needed
        console.log("Payment details for manual verification:", {
          courseId,
          paymentData: bodyData,
          timestamp: new Date().toISOString(),
          attempts: maxRetries
        })
        
        // Call the callback to notify the component
        if (onVerificationFailed) {
          onVerificationFailed(bodyData);
        }
        
        break;
      }
      
      // If not the last attempt, wait before retrying
      const delay = baseDelay * Math.pow(2, attempt - 1); // Exponential backoff
      console.log(`Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  toast.dismiss(toastId)
} 