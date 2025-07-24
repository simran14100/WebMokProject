import { toast } from "react-hot-toast"
import { setUser } from "../../store/slices/profileSlice"
import { apiConnector } from "../apiConnector"
import { enrollment } from "../apis"

const {
  CREATE_ENROLLMENT_ORDER_API,
  VERIFY_ENROLLMENT_PAYMENT_API,
  GET_ENROLLMENT_STATUS_API,
} = enrollment

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

// Buy the Enrollment
export async function buyEnrollment(token, user, navigate, dispatch) {
  const toastId = toast.loading("Loading...")
  try {
    // Loading the script of Razorpay SDK
    const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js")

    if (!res) {
      toast.error("Razorpay SDK failed to load. Check your Internet Connection.")
      return
    }

    console.log("Token used in enrollment payment:", token)

    // Initiating the Order in Backend
    const orderResponse = await apiConnector(
      "POST",
      CREATE_ENROLLMENT_ORDER_API,
      {},
      {
        Authorization: `Bearer ${token}`,
      }
    )

    console.log("ENROLLMENT ORDER RESPONSE FROM BACKEND............", orderResponse);

    const backendData = orderResponse.data; // Axios wraps backend response in .data
    if (!backendData.success) {
      throw new Error(backendData.message);
    }

    const orderData = backendData.data;
    if (!orderData || !orderData.orderId || !orderData.amount || !orderData.currency) {
      throw new Error("Order data missing from backend response");
    }

    // Opening the Razorpay SDK
    console.log('Frontend Razorpay Key (before opening Razorpay):', process.env.REACT_APP_RAZORPAY_KEY);
    const options = {
      key: process.env.REACT_APP_RAZORPAY_KEY || "rzp_test_XZrJHQ4hfoi9FU",
      currency: orderData.currency,
      amount: orderData.amount * 100, // Convert to paise and ensure it's a number
      order_id: orderData.orderId,
      name: "WebMok",
      description: "Thank you for paying the Enrollment Fee.",
      prefill: {
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
      },
      handler: function (response) {
        verifyEnrollmentPayment(response, token, navigate, dispatch)
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
    console.log("ENROLLMENT PAYMENT API ERROR............", error)
    toast.error("Could Not make Payment.")
  }
  toast.dismiss(toastId)
}

// Verify the Enrollment Payment
async function verifyEnrollmentPayment(bodyData, token, navigate, dispatch) {
  const toastId = toast.loading("Verifying Payment...")
  try {
    const response = await apiConnector(
      "POST", 
      VERIFY_ENROLLMENT_PAYMENT_API, 
      bodyData, 
      {
        Authorization: `Bearer ${token}`,
      }
    )

    console.log("VERIFY ENROLLMENT PAYMENT RESPONSE FROM BACKEND............", response)

    const backendData = response.data; // Axios wraps backend response in .data
    if (!backendData.success) {
      throw new Error(backendData.message)
    }

    toast.success("Enrollment Payment Successful! You can now access all courses.")
    dispatch(setUser(backendData.data))
    navigate("/dashboard")
  } catch (error) {
    console.log("ENROLLMENT PAYMENT VERIFY ERROR............", error)
    toast.error("Could Not Verify Payment.")
  }
  toast.dismiss(toastId)
}

// Get enrollment status
export async function getEnrollmentStatus(token) {
  try {
    const response = await apiConnector(
      "GET",
      GET_ENROLLMENT_STATUS_API,
      {},
      {
        Authorization: `Bearer ${token}`,
      }
    )

    console.log("ENROLLMENT STATUS RESPONSE............", response)

    if (!response.success) {
      throw new Error(response.message)
    }

    return response.data
  } catch (error) {
    console.log("GET ENROLLMENT STATUS ERROR............", error)
    throw error
  }
} 

export async function fetchEnrolledStudents(token, page = 1, limit = 10, search = "") {
  const params = new URLSearchParams({ page, limit, search });
  const response = await apiConnector(
    "GET",
    `/api/v1/admin/enrolled-students?${params.toString()}`,
    null,
    { Authorization: `Bearer ${token}` }
  );
  return response.data;
} 