import { showSuccess, showError, showLoading, dismissToast } from "../../utils/toast"
import { apiConnector } from "../apiConnector"
import { installments } from "../apis"

const {
  CREATE_INSTALLMENT_PLAN_API,
  GET_STUDENT_INSTALLMENTS_API,
  GET_INSTALLMENT_DETAILS_API,
  CREATE_INSTALLMENT_PAYMENT_ORDER_API,
  VERIFY_INSTALLMENT_PAYMENT_API,
  SEND_PAYMENT_REMINDERS_API,
  GET_ALL_INSTALLMENTS_API,
  GET_INSTALLMENT_STATS_API,
} = installments

// Create installment plan
export async function createInstallmentPlan(planData, token) {
  const toastId = showLoading("Creating installment plan...")
  try {
    const response = await apiConnector(
      "POST",
      CREATE_INSTALLMENT_PLAN_API,
      planData,
      {
        Authorization: `Bearer ${token}`,
      }
    )

    console.log("CREATE INSTALLMENT PLAN RESPONSE............", response)

    if (!response.success) {
      throw new Error(response.message)
    }

    showSuccess("Installment plan created successfully")
    return response.data
  } catch (error) {
    console.log("CREATE INSTALLMENT PLAN ERROR............", error)
    showError("Failed to create installment plan")
    throw error
  } finally {
    dismissToast(toastId)
  }
}

// Get student installments
export async function getStudentInstallments(token) {
  try {
    const response = await apiConnector(
      "GET",
      GET_STUDENT_INSTALLMENTS_API,
      {},
      {
        Authorization: `Bearer ${token}`,
      }
    )

    console.log("GET STUDENT INSTALLMENTS RESPONSE............", response)

    if (!response.success) {
      throw new Error(response.message)
    }

    return response.data
  } catch (error) {
    console.log("GET STUDENT INSTALLMENTS ERROR............", error)
    showError("Failed to fetch student installments")
    throw error
  }
}

// Get installment details
export async function getInstallmentDetails(installmentId, token) {
  try {
    const response = await apiConnector(
      "GET",
      `${GET_INSTALLMENT_DETAILS_API}/${installmentId}`,
      {},
      {
        Authorization: `Bearer ${token}`,
      }
    )

    console.log("GET INSTALLMENT DETAILS RESPONSE............", response)

    if (!response.success) {
      throw new Error(response.message)
    }

    return response.data
  } catch (error) {
    console.log("GET INSTALLMENT DETAILS ERROR............", error)
    showError("Failed to fetch installment details")
    throw error
  }
}

// Create installment payment order
export async function createInstallmentPaymentOrder(installmentId, token) {
  const toastId = showLoading("Creating payment order...")
  try {
    const response = await apiConnector(
      "POST",
      CREATE_INSTALLMENT_PAYMENT_ORDER_API,
      { installmentId },
      {
        Authorization: `Bearer ${token}`,
      }
    )

    console.log("CREATE INSTALLMENT PAYMENT ORDER RESPONSE............", response)

    if (!response.success) {
      throw new Error(response.message)
    }

    return response.data
  } catch (error) {
    console.log("CREATE INSTALLMENT PAYMENT ORDER ERROR............", error)
    showError("Failed to create payment order")
    throw error
  } finally {
    dismissToast(toastId)
  }
}

// Verify installment payment
export async function verifyInstallmentPayment(paymentData, token) {
  const toastId = showLoading("Verifying payment...")
  try {
    const response = await apiConnector(
      "POST",
      VERIFY_INSTALLMENT_PAYMENT_API,
      paymentData,
      {
        Authorization: `Bearer ${token}`,
      }
    )

    console.log("VERIFY INSTALLMENT PAYMENT RESPONSE............", response)

    if (!response.success) {
      throw new Error(response.message)
    }

    showSuccess("Payment verified successfully")
    return response.data
  } catch (error) {
    console.log("VERIFY INSTALLMENT PAYMENT ERROR............", error)
    showError("Failed to verify payment")
    throw error
  } finally {
    dismissToast(toastId)
  }
}

// Send payment reminders
export async function sendPaymentReminders(token) {
  const toastId = showLoading("Sending reminders...")
  try {
    const response = await apiConnector(
      "POST",
      SEND_PAYMENT_REMINDERS_API,
      {},
      {
        Authorization: `Bearer ${token}`,
      }
    )

    console.log("SEND PAYMENT REMINDERS RESPONSE............", response)

    if (!response.success) {
      throw new Error(response.message)
    }

    showSuccess("Payment reminders sent successfully")
    return response.data
  } catch (error) {
    console.log("SEND PAYMENT REMINDERS ERROR............", error)
    showError("Failed to send payment reminders")
    throw error
  } finally {
    dismissToast(toastId)
  }
}

// Get all installments (admin)
export async function getAllInstallments(token) {
  try {
    const response = await apiConnector(
      "GET",
      GET_ALL_INSTALLMENTS_API,
      {},
      {
        Authorization: `Bearer ${token}`,
      }
    )

    console.log("GET ALL INSTALLMENTS RESPONSE............", response)

    if (!response.success) {
      throw new Error(response.message)
    }

    return response.data
  } catch (error) {
    console.log("GET ALL INSTALLMENTS ERROR............", error)
    showError("Failed to fetch all installments")
    throw error
  }
}

// Get installment stats
export async function getInstallmentStats(token) {
  try {
    const response = await apiConnector(
      "GET",
      GET_INSTALLMENT_STATS_API,
      {},
      {
        Authorization: `Bearer ${token}`,
      }
    )

    console.log("GET INSTALLMENT STATS RESPONSE............", response)

    if (!response.success) {
      throw new Error(response.message)
    }

    return response.data
  } catch (error) {
    console.log("GET INSTALLMENT STATS ERROR............", error)
    showError("Failed to fetch installment stats")
    throw error
  }
}