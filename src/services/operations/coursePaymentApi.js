import { showSuccess, showError, showLoading, dismissToast } from "../../utils/toast"
import { apiConnector } from "../apiConnector"
import { payment } from "../apis"
import { clearCart } from "../../store/slices/cartSlice"
import { setPaymentLoading } from "../../store/slices/courseSlice"
const BASE_URL = process.env.REACT_APP_BASE_URL;


const { CAPTURE_PAYMENT_API, VERIFY_PAYMENT_API, SEND_PAYMENT_SUCCESS_EMAIL_API } = payment;


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
export async function buyCourse(
  token,
  courses,
  user_details,
  navigate,
  dispatch
) {
  const toastId = showLoading("Loading...")
  try {
    // Loading the script of Razorpay SDK
    const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js")

    if (!res) {
      showError(
        "Razorpay SDK failed to load. Check your Internet Connection."
      )
      return
    }

    console.log("Token used in payment:", token);


    // Initiating the Order in Backend
    const orderResponse = await apiConnector(
      "POST",
      CAPTURE_PAYMENT_API,
      { courses: courses },
      { Authorization: `Bearer ${token}` }
    )
    console.log("Before")
    if (!orderResponse.data.success) {
      throw new Error(orderResponse.data.message)
    }
    console.log("PAYMENT RESPONSE FROM BACKEND............", orderResponse.data)

    // Opening the Razorpay SDK
    const options = {
      key: process.env.REACT_APP_RAZORPAY_KEY,
      currency: orderResponse.data.currency,
      amount: `${orderResponse.data.amount}`,
      order_id: orderResponse.data.orderId,
      name: "StudyNotion",
      description: "Thank you for Purchasing the Course.",
      // image: rzpLogo,
      prefill: {
        name: `${user_details.firstName} ${user_details.lastName}`,
        email: user_details.email,
      },
      handler: function (response) {
        console.log("Razorpay handler called with response:", response)
        const finalizingId = showLoading("Finalizing your enrollment...")
        sendPaymentSuccessEmail(response, orderResponse.data.amount, token)
        const payload = { ...response, courses }
        console.log("Calling verifyPayment with payload:", payload)
        dismissToast(finalizingId)
        verifyPayment(payload, token, navigate, dispatch)
      },
    }
    console.log("Razorpay Key used:", process.env.REACT_APP_RAZORPAY_KEY);

    const paymentObject = new window.Razorpay(options)
    
    console.log("Opening Razorpay Checkout with options:", options)
    paymentObject.open()
    paymentObject.on("payment.failed", function (response) {
      showError("Oops! Payment Failed.")
      console.log(response.error)
    })
  } catch (error) {
    console.log("PAYMENT API ERROR............", error)
    showError("Could Not make Payment.")
  }
  dismissToast(toastId)
}

// Verify the Payment
async function verifyPayment(bodyData, token, navigate, dispatch) {
  const toastId = showLoading("Verifying Payment...")
  dispatch(setPaymentLoading(true))
  try {
    console.log("verifyPayment(): sending body:", bodyData)
    const response = await apiConnector(
      "POST",
      VERIFY_PAYMENT_API,
      bodyData,
      { Authorization: `Bearer ${token}` }
    )

    console.log("VERIFY PAYMENT RESPONSE FROM BACKEND............", response)

    if (!response.data.success) {
      throw new Error(response.data.message)
    }

    showSuccess("Payment Successful. You are Added to the course ")
    navigate("/dashboard/enrolled-courses")
    dispatch(clearCart())
  } catch (error) {
    console.log("PAYMENT VERIFY ERROR............", error)
    const backendMsg = error?.response?.data?.message || error?.message || "Could Not Verify Payment."
    showError(backendMsg)
  }
  dismissToast(toastId)
  dispatch(setPaymentLoading(false))
}

// Send the Payment Success Email
async function sendPaymentSuccessEmail(response, amount, token) {
  try {
    await apiConnector(
      "POST",
      SEND_PAYMENT_SUCCESS_EMAIL_API,
      {
        orderId: response.razorpay_order_id,
        paymentId: response.razorpay_payment_id,
        amount,
      },
      {
        Authorization: `Bearer ${token}`,
      }
    )
  } catch (error) {
    console.log("PAYMENT SUCCESS EMAIL ERROR............", error)
  }
}