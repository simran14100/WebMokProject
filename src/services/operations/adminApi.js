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
  CREATE_BATCH_API,
  LIST_BATCHES_API,
  EXPORT_BATCHES_API,
  CREATE_STUDENT_API,
  LIST_BATCH_STUDENTS_API,
  ADD_STUDENT_TO_BATCH_API,
  REMOVE_STUDENT_FROM_BATCH_API,
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

    if (!response.data?.success) {
      throw new Error(response.data?.message || "Failed to fetch registered users")
    }

    const payload = response.data?.data
    // Return a flat array for convenience
    return Array.isArray(payload?.users) ? payload.users : (Array.isArray(payload) ? payload : [])
  } catch (error) {
    console.log("GET REGISTERED USERS ERROR............", error)
    toast.error("Failed to fetch registered users")
    throw error
  }
}

// Update a batch (Admin only)
export async function updateBatch(batchId, payload, token) {
  try {
    const response = await apiConnector(
      "PATCH",
      `${LIST_BATCHES_API}/${batchId}`,
      payload,
      {
        Authorization: `Bearer ${token}`,
      }
    )

    if (!response.data?.success) {
      throw new Error(response.data?.message || "Failed to update batch")
    }
    return response.data.data
  } catch (error) {
    console.log("UPDATE BATCH ERROR............", error)
    toast.error(error.response?.data?.message || error.message || "Failed to update batch")
    throw error
  }
}

// Delete a batch (Admin only)
export async function deleteBatch(batchId, token) {
  try {
    const response = await apiConnector(
      "DELETE",
      `${LIST_BATCHES_API}/${batchId}`,
      {},
      {
        Authorization: `Bearer ${token}`,
      }
    )

    if (!response.data?.success) {
      throw new Error(response.data?.message || "Failed to delete batch")
    }
    return true
  } catch (error) {
    console.log("DELETE BATCH ERROR............", error)
    toast.error(error.response?.data?.message || error.message || "Failed to delete batch")
    throw error
  }
}

// Get a single batch by ID (Admin only)
export async function getBatchById(batchId, token) {
  try {
    const response = await apiConnector(
      "GET",
      `${LIST_BATCHES_API}/${batchId}`,
      {},
      {
        Authorization: `Bearer ${token}`,
      }
    )

    if (!response.data?.success) {
      throw new Error(response.data?.message || "Failed to fetch batch details")
    }
    return response.data.data
  } catch (error) {
    console.log("GET BATCH BY ID ERROR............", error)
    toast.error(error.response?.data?.message || error.message || "Failed to fetch batch details")
    throw error
  }
}

// List batches (Admin only)
export async function getBatches({ token, page = 1, limit = 10, search = "" }) {
  try {
    const response = await apiConnector(
      "GET",
      LIST_BATCHES_API,
      {},
      {
        Authorization: `Bearer ${token}`,
      },
      { params: { page, limit, search } }
    )

    if (!response.data?.success) {
      throw new Error(response.data?.message || "Failed to fetch batches")
    }
    return response.data.data
  } catch (error) {
    console.log("GET BATCHES ERROR............", error)
    toast.error(error.response?.data?.message || error.message || "Failed to fetch batches")
    throw error
  }
}

// Export batches CSV (Admin only)
export async function exportBatches({ token, search = "" }) {
  const toastId = toast.loading("Preparing download...")
  try {
    const response = await apiConnector(
      "GET",
      EXPORT_BATCHES_API,
      {},
      {
        Authorization: `Bearer ${token}`,
      },
      { params: { search }, responseType: "blob" }
    )

    toast.success("Download ready")
    return response.data // Blob
  } catch (error) {
    console.log("EXPORT BATCHES ERROR............", error)
    toast.error(error.response?.data?.message || error.message || "Failed to export batches")
    throw error
  } finally {
    toast.dismiss(toastId)
  }
}

// =========================
// Batch Students management
// =========================
// List students assigned to a batch
export async function listBatchStudents(batchId, token) {
  try {
    const response = await apiConnector(
      "GET",
      `${LIST_BATCH_STUDENTS_API}/${batchId}/students`,
      {},
      {
        Authorization: `Bearer ${token}`,
      }
    )

    if (!response.data?.success) {
      throw new Error(response.data?.message || "Failed to fetch batch students")
    }
    const payload = response.data?.data
    return Array.isArray(payload) ? payload : []
  } catch (error) {
    console.log("LIST BATCH STUDENTS ERROR............", error)
    toast.error(error.response?.data?.message || error.message || "Failed to fetch batch students")
    throw error
  }
}

// Assign a student to a batch
export async function addStudentToBatch(batchId, studentId, token) {
  const toastId = toast.loading("Assigning student...")
  try {
    const response = await apiConnector(
      "POST",
      `${ADD_STUDENT_TO_BATCH_API}/${batchId}/students`,
      { studentId },
      {
        Authorization: `Bearer ${token}`,
      }
    )

    if (!response.data?.success) {
      throw new Error(response.data?.message || "Failed to assign student")
    }
    toast.success("Student assigned to batch")
    return true
  } catch (error) {
    console.log("ADD STUDENT TO BATCH ERROR............", error)
    toast.error(error.response?.data?.message || error.message || "Failed to assign student")
    throw error
  } finally {
    toast.dismiss(toastId)
  }
}

// Remove a student from a batch
export async function removeStudentFromBatch(batchId, studentId, token) {
  const toastId = toast.loading("Removing student...")
  try {
    const response = await apiConnector(
      "DELETE",
      `${REMOVE_STUDENT_FROM_BATCH_API}/${batchId}/students/${studentId}`,
      {},
      {
        Authorization: `Bearer ${token}`,
      }
    )

    if (!response.data?.success) {
      throw new Error(response.data?.message || "Failed to remove student")
    }
    toast.success("Student removed from batch")
    return true
  } catch (error) {
    console.log("REMOVE STUDENT FROM BATCH ERROR............", error)
    toast.error(error.response?.data?.message || error.message || "Failed to remove student")
    throw error
  } finally {
    toast.dismiss(toastId)
  }
}

// Create a Student (Admin only)
export async function createStudent({ name, email, phone, password, confirmPassword, enrollmentFeePaid = false, batchId }, token) {
  const toastId = toast.loading("Creating student...")
  try {
    const response = await apiConnector(
      "POST",
      CREATE_STUDENT_API,
      { name, email, phone, password, confirmPassword, enrollmentFeePaid, batchId },
      {
        Authorization: `Bearer ${token}`,
      }
    )

    if (!response.data?.success) {
      throw new Error(response.data?.message || "Failed to create student")
    }

    toast.success("Student created successfully")
    return response.data.data
  } catch (error) {
    console.log("CREATE STUDENT ERROR............", error)
    toast.error(error.response?.data?.message || error.message || "Failed to create student")
    throw error
  } finally {
    toast.dismiss(toastId)
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

    if (!response.data?.success) {
      throw new Error(response.data?.message || "Failed to fetch enrolled students")
    }

    const payload = response.data?.data
    // Return a flat array for convenience
    return Array.isArray(payload?.students) ? payload.students : (Array.isArray(payload) ? payload : [])
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

// Create batch (Admin only)
export async function createBatch(payload, token) {
  const toastId = toast.loading("Creating batch...")
  try {
    const response = await apiConnector(
      "POST",
      CREATE_BATCH_API,
      payload,
      {
        Authorization: `Bearer ${token}`,
      }
    )

    console.log("CREATE BATCH RESPONSE............", response)

    if (!response.data?.success) {
      throw new Error(response.data?.message || "Failed to create batch")
    }

    toast.success("Batch created successfully")
    return response.data.data
  } catch (error) {
    console.log("CREATE BATCH ERROR............", error)
    toast.error(error.response?.data?.message || error.message || "Failed to create batch")
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