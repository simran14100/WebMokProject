import { toast } from "react-hot-toast"
import { apiConnector } from "../apiConnector"
import { admin } from "../apis"

const {
  GET_REGISTERED_USERS_API,
  GET_ENROLLED_STUDENTS_API,
  GET_PENDING_INSTRUCTORS_API,
  APPROVE_INSTRUCTOR_API,
  GET_ALL_INSTRUCTORS_API,
  GET_DASHBOARD_STATS_API,
  UPDATE_USER_STATUS_API,
} = admin

// Get registered users
export async function getRegisteredUsers(token) {
  try {
    const response = await apiConnector(
      "GET",
      GET_REGISTERED_USERS_API,
      {},
      {
        Authorization: `Bearer ${token}`,
      }
    )

    console.log("GET REGISTERED USERS RESPONSE............", response)

    if (!response.success) {
      throw new Error(response.message)
    }

    return response.data
  } catch (error) {
    console.log("GET REGISTERED USERS ERROR............", error)
    toast.error("Failed to fetch registered users")
    throw error
  }
}

// Get enrolled students
export async function getEnrolledStudents(token) {
  try {
    const response = await apiConnector(
      "GET",
      GET_ENROLLED_STUDENTS_API,
      {},
      {
        Authorization: `Bearer ${token}`,
      }
    )

    console.log("GET ENROLLED STUDENTS RESPONSE............", response)

    if (!response.success) {
      throw new Error(response.message)
    }

    return response.data
  } catch (error) {
    console.log("GET ENROLLED STUDENTS ERROR............", error)
    toast.error("Failed to fetch enrolled students")
    throw error
  }
}

// Get pending instructors
export async function getPendingInstructors(token) {
  try {
    const response = await apiConnector(
      "GET",
      GET_PENDING_INSTRUCTORS_API,
      {},
      {
        Authorization: `Bearer ${token}`,
      }
    )

    console.log("GET PENDING INSTRUCTORS RESPONSE............", response)

    if (!response.success) {
      throw new Error(response.message)
    }

    return response.data
  } catch (error) {
    console.log("GET PENDING INSTRUCTORS ERROR............", error)
    toast.error("Failed to fetch pending instructors")
    throw error
  }
}

// Get all approved instructors
export async function getAllInstructors() {
  try {
    const response = await apiConnector(
      "GET",
      GET_ALL_INSTRUCTORS_API,
      {},
      {}
    )

    console.log("GET ALL INSTRUCTORS RESPONSE............", response)

    if (!response.data.success) {
      throw new Error(response.data.message)
    }

    return response.data.data
  } catch (error) {
    console.log("GET ALL INSTRUCTORS ERROR............", error)
    toast.error("Failed to fetch instructors")
    throw error
  }
}

// Approve instructor
export async function approveInstructor(instructorId, token) {
  const toastId = toast.loading("Approving instructor...")
  try {
    const response = await apiConnector(
      "POST",
      APPROVE_INSTRUCTOR_API,
      { instructorId },
      {
        Authorization: `Bearer ${token}`,
      }
    )

    console.log("APPROVE INSTRUCTOR RESPONSE............", response)

    if (!response.success) {
      throw new Error(response.message)
    }

    toast.success("Instructor approved successfully")
    return response.data
  } catch (error) {
    console.log("APPROVE INSTRUCTOR ERROR............", error)
    toast.error("Failed to approve instructor")
    throw error
  } finally {
    toast.dismiss(toastId)
  }
}

// Get dashboard stats
export async function getDashboardStats(token) {
  try {
    const response = await apiConnector(
      "GET",
      GET_DASHBOARD_STATS_API,
      {},
      {
        Authorization: `Bearer ${token}`,
      }
    )

    console.log("GET DASHBOARD STATS RESPONSE............", response)

    if (!response.success) {
      throw new Error(response.message)
    }

    return response.data
  } catch (error) {
    console.log("GET DASHBOARD STATS ERROR............", error)
    toast.error("Failed to fetch dashboard stats")
    throw error
  }
}

// Update user status
export async function updateUserStatus(userId, status, token) {
  const toastId = toast.loading("Updating user status...")
  try {
    const response = await apiConnector(
      "PUT",
      UPDATE_USER_STATUS_API,
      { userId, status },
      {
        Authorization: `Bearer ${token}`,
      }
    )

    console.log("UPDATE USER STATUS RESPONSE............", response)

    if (!response.success) {
      throw new Error(response.message)
    }

    toast.success("User status updated successfully")
    return response.data
  } catch (error) {
    console.log("UPDATE USER STATUS ERROR............", error)
    toast.error("Failed to update user status")
    throw error
  } finally {
    toast.dismiss(toastId)
  }
} 