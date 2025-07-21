import { toast } from "react-hot-toast"
import { apiConnector } from "../apiConnector"
import { admission } from "../apis"

const {
  GET_ALL_CONFIRMATIONS_API,
  GET_CONFIRMATION_BY_ID_API,
  CONFIRM_ADMISSION_API,
  REJECT_ADMISSION_API,
  GET_ADMISSION_STATS_API,
} = admission

// Get all admission confirmations
export async function getAllAdmissionConfirmations(token) {
  try {
    const response = await apiConnector(
      "GET",
      GET_ALL_CONFIRMATIONS_API,
      {},
      {
        Authorization: `Bearer ${token}`,
      }
    )

    console.log("GET ALL ADMISSION CONFIRMATIONS RESPONSE............", response)

    if (!response.success) {
      throw new Error(response.message)
    }

    return response.data
  } catch (error) {
    console.log("GET ALL ADMISSION CONFIRMATIONS ERROR............", error)
    toast.error("Failed to fetch admission confirmations")
    throw error
  }
}

// Get admission confirmation by ID
export async function getAdmissionConfirmationById(confirmationId, token) {
  try {
    const response = await apiConnector(
      "GET",
      `${GET_CONFIRMATION_BY_ID_API}/${confirmationId}`,
      {},
      {
        Authorization: `Bearer ${token}`,
      }
    )

    console.log("GET ADMISSION CONFIRMATION BY ID RESPONSE............", response)

    if (!response.success) {
      throw new Error(response.message)
    }

    return response.data
  } catch (error) {
    console.log("GET ADMISSION CONFIRMATION BY ID ERROR............", error)
    toast.error("Failed to fetch admission confirmation")
    throw error
  }
}

// Confirm admission
export async function confirmAdmission(confirmationId, token) {
  const toastId = toast.loading("Confirming admission...")
  try {
    const response = await apiConnector(
      "PUT",
      `${CONFIRM_ADMISSION_API}/${confirmationId}`,
      { status: "confirmed" },
      {
        Authorization: `Bearer ${token}`,
      }
    )

    console.log("CONFIRM ADMISSION RESPONSE............", response)

    if (!response.success) {
      throw new Error(response.message)
    }

    toast.success("Admission confirmed successfully")
    return response.data
  } catch (error) {
    console.log("CONFIRM ADMISSION ERROR............", error)
    toast.error("Failed to confirm admission")
    throw error
  } finally {
    toast.dismiss(toastId)
  }
}

// Reject admission
export async function rejectAdmission(confirmationId, reason, token) {
  const toastId = toast.loading("Rejecting admission...")
  try {
    const response = await apiConnector(
      "PUT",
      `${REJECT_ADMISSION_API}/${confirmationId}`,
      { status: "rejected", reason },
      {
        Authorization: `Bearer ${token}`,
      }
    )

    console.log("REJECT ADMISSION RESPONSE............", response)

    if (!response.success) {
      throw new Error(response.message)
    }

    toast.success("Admission rejected successfully")
    return response.data
  } catch (error) {
    console.log("REJECT ADMISSION ERROR............", error)
    toast.error("Failed to reject admission")
    throw error
  } finally {
    toast.dismiss(toastId)
  }
}

// Get admission stats
export async function getAdmissionStats(token) {
  try {
    const response = await apiConnector(
      "GET",
      GET_ADMISSION_STATS_API,
      {},
      {
        Authorization: `Bearer ${token}`,
      }
    )

    console.log("GET ADMISSION STATS RESPONSE............", response)

    if (!response.success) {
      throw new Error(response.message)
    }

    return response.data
  } catch (error) {
    console.log("GET ADMISSION STATS ERROR............", error)
    toast.error("Failed to fetch admission stats")
    throw error
  }
} 