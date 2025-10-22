import { showLoading, showSuccess, showError, dismissToast } from "../../utils/toast"
import { apiConnector } from "../apiConnector"
import { admin, coursework as courseworkApi, batchDepartments as batchDeptApi } from "../apis"

const {
  GET_REGISTERED_USERS_API,
  GET_ENROLLED_STUDENTS_API,
  GET_PENDING_INSTRUCTORS_API,
  APPROVE_INSTRUCTOR_API,
  GET_ALL_INSTRUCTORS_API,
  GET_DASHBOARD_STATS_API,
  UPDATE_USER_STATUS_API,
  GET_PHD_ENROLLED_STUDENTS_API,
  CREATE_BATCH_API,
  LIST_BATCHES_API,
  EXPORT_BATCHES_API,
  CREATE_STUDENT_API,
  LIST_BATCH_STUDENTS_API,
  ADD_STUDENT_TO_BATCH_API,
  REMOVE_STUDENT_FROM_BATCH_API,
  // Batch temp students
  LIST_TEMP_STUDENTS_IN_BATCH_API,
  ADD_TEMP_STUDENT_TO_BATCH_API,
  REMOVE_TEMP_STUDENT_FROM_BATCH_API,
  // Batch trainers
  LIST_BATCH_TRAINERS_API,
  ADD_TRAINER_TO_BATCH_API,
  REMOVE_TRAINER_FROM_BATCH_API,
  // Batch courses
  LIST_BATCH_COURSES_API,
  ADD_COURSE_TO_BATCH_API,
  REMOVE_COURSE_FROM_BATCH_API,
  // Live Classes
  ADD_LIVE_CLASS_TO_BATCH_API,
  // Tasks
  LIST_BATCH_TASKS_API,
  CREATE_BATCH_TASK_API,
  UPDATE_TASK_API,
  DELETE_TASK_API,
  GET_TASK_STATUSES_API,
  GET_TASK_SUMMARY_API,
  // Admin Reviews
  CREATE_ADMIN_REVIEW_API,
  // Google Calendar integration
  CREATE_MEET_LINK_API,
  // PhD enrollment-only students
  GET_PHD_ENROLLMENT_PAID_STUDENTS_API,
  // Bulk students
  STUDENTS_TEMPLATE_API,
  BULK_UPLOAD_STUDENTS_API,
} = admin

// Get registered users
export async function getRegisteredUsers(token, { page = 1, limit = 10, role = "all", search = "" } = {}) {
  try {
    const response = await apiConnector(
      "GET",
      GET_REGISTERED_USERS_API,
      {},
      {
        Authorization: `Bearer ${token}`,
      },
      { params: { page, limit, role, search } }
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
    showError("Failed to fetch registered users")
    throw error
  }
}

// Coursework Results helpers
export async function listCourseworkResults({ page = 1, limit = 10, search = "" } = {}, token) {
  try {
    const response = await apiConnector(
      "GET",
      courseworkApi.LIST_RESULTS_API,
      {},
      { Authorization: `Bearer ${token}` },
      { params: { page, limit, search } }
    )
    if (!response.data?.success) {
      throw new Error(response.data?.message || "Failed to fetch results")
    }
    return response.data.data || { items: [], meta: { total: 0, page, limit } }
  } catch (error) {
    showError(error.response?.data?.message || error.message || "Failed to fetch results")
    throw error
  }
}

export async function createCourseworkResult(payload, token) {
  const toastId = showLoading("Creating result...")
  try {
    const response = await apiConnector(
      "POST",
      courseworkApi.CREATE_RESULT_API,
      payload,
      { Authorization: `Bearer ${token}` }
    )
    if (!response.data?.success) throw new Error(response.data?.message || "Failed to create result")
    showSuccess("Result created")
    return response.data.data
  } catch (error) {
    showError(error.response?.data?.message || error.message || "Failed to create result")
    throw error
  } finally {
    dismissToast(toastId)
  }
}

export async function updateCourseworkResult(id, payload, token) {
  const toastId = showLoading("Updating result...")
  try {
    const response = await apiConnector(
      "PUT",
      `${courseworkApi.UPDATE_RESULT_API}/${id}`,
      payload,
      { Authorization: `Bearer ${token}` }
    )
    if (!response.data?.success) throw new Error(response.data?.message || "Failed to update result")
    showSuccess("Result updated")
    return response.data.data
  } catch (error) {
    showError(error.response?.data?.message || error.message || "Failed to update result")
    throw error
  } finally {
    dismissToast(toastId)
  }
}

export async function deleteCourseworkResult(id, token) {
  const toastId = showLoading("Deleting result...")
  try {
    const response = await apiConnector(
      "DELETE",
      `${courseworkApi.DELETE_RESULT_API}/${id}`,
      {},
      { Authorization: `Bearer ${token}` }
    )
    if (!response.data?.success) throw new Error(response.data?.message || "Failed to delete result")
    showSuccess("Result deleted")
    return true
  } catch (error) {
    showError(error.response?.data?.message || error.message || "Failed to delete result")
    throw error
  } finally {
    dismissToast(toastId)
  }
}

export async function toggleCourseworkResult(id, token) {
  const toastId = showLoading("Updating...")
  try {
    const response = await apiConnector(
      "PATCH",
      `${courseworkApi.TOGGLE_RESULT_API}/${id}/toggle`,
      {},
      { Authorization: `Bearer ${token}` }
    )
    if (!response.data?.success) throw new Error(response.data?.message || "Failed to toggle")
    showSuccess("Updated")
    return response.data.data
  } catch (error) {
    showError(error.response?.data?.message || error.message || "Failed to toggle")
    throw error
  } finally {
    dismissToast(toastId)
  }
}

// Coursework Slots helpers
export async function listCourseworkSlots({ page = 1, limit = 10, search = "" } = {}, token) {
  try {
    const response = await apiConnector(
      "GET",
      courseworkApi.LIST_SLOTS_API,
      {},
      { Authorization: `Bearer ${token}` },
      { params: { page, limit, search } }
    )
    if (!response.data?.success) {
      throw new Error(response.data?.message || "Failed to fetch slots")
    }
    return response.data.data || { items: [], meta: { total: 0, page, limit } }
  } catch (error) {
    showError(error.response?.data?.message || error.message || "Failed to fetch slots")
    throw error
  }
}

export async function createCourseworkSlot(payload, token) {
  const toastId = showLoading("Creating slot...")
  try {
    const response = await apiConnector(
      "POST",
      courseworkApi.CREATE_SLOT_API,
      payload,
      { Authorization: `Bearer ${token}` }
    )
    if (!response.data?.success) throw new Error(response.data?.message || "Failed to create slot")
    showSuccess("Slot created")
    return response.data.data
  } catch (error) {
    showError(error.response?.data?.message || error.message || "Failed to create slot")
    throw error
  } finally {
    dismissToast(toastId)
  }
}

// Coursework Papers helpers
export async function listCourseworkPapers({ page = 1, limit = 10, search = "" } = {}, token) {
  try {
    const response = await apiConnector(
      "GET",
      courseworkApi.LIST_PAPERS_API,
      {},
      { Authorization: `Bearer ${token}` },
      { params: { page, limit, search } }
    )
    if (!response.data?.success) {
      throw new Error(response.data?.message || "Failed to fetch papers")
    }
    return response.data.data || { items: [], meta: { total: 0, page, limit } }
  } catch (error) {
    showError(error.response?.data?.message || error.message || "Failed to fetch papers")
    throw error
  }
}

export async function createCourseworkPaper(payload, token) {
  const toastId = showLoading("Creating paper...")
  try {
    const response = await apiConnector(
      "POST",
      courseworkApi.CREATE_PAPER_API,
      payload,
      { Authorization: `Bearer ${token}` }
    )
    if (!response.data?.success) {
      throw new Error(response.data?.message || "Failed to create paper")
    }
    showSuccess("Paper created")
    return response.data.data
  } catch (error) {
    showError(error.response?.data?.message || error.message || "Failed to create paper")
    throw error
  } finally {
    dismissToast(toastId)
  }
}

export async function updateCourseworkPaper(id, payload, token) {
  const toastId = showLoading("Updating paper...")
  try {
    const response = await apiConnector(
      "PUT",
      `${courseworkApi.UPDATE_PAPER_API}/${id}`,
      payload,
      { Authorization: `Bearer ${token}` }
    )
    if (!response.data?.success) {
      throw new Error(response.data?.message || "Failed to update paper")
    }
    showSuccess("Paper updated")
    return response.data.data
  } catch (error) {
    showError(error.response?.data?.message || error.message || "Failed to update paper")
    throw error
  } finally {
    dismissToast(toastId)
  }
}

export async function deleteCourseworkPaper(id, token) {
  const toastId = showLoading("Deleting paper...")
  try {
    const response = await apiConnector(
      "DELETE",
      `${courseworkApi.DELETE_PAPER_API}/${id}`,
      {},
      { Authorization: `Bearer ${token}` }
    )
    if (!response.data?.success) {
      throw new Error(response.data?.message || "Failed to delete paper")
    }
    showSuccess("Paper deleted")
    return true
  } catch (error) {
    showError(error.response?.data?.message || error.message || "Failed to delete paper")
    throw error
  } finally {
    dismissToast(toastId)
  }
}

export async function toggleCourseworkPaper(id, token) {
  const toastId = showLoading("Updating...")
  try {
    const response = await apiConnector(
      "PATCH",
      `${courseworkApi.TOGGLE_PAPER_API}/${id}/toggle`,
      {},
      { Authorization: `Bearer ${token}` }
    )
    if (!response.data?.success) {
      throw new Error(response.data?.message || "Failed to toggle")
    }
    showSuccess("Updated")
    return response.data.data
  } catch (error) {
    showError(error.response?.data?.message || error.message || "Failed to toggle")
    throw error
  } finally {
    dismissToast(toastId)
  }
}

export async function updateCourseworkSlot(id, payload, token) {
  const toastId = showLoading("Updating slot...")
  try {
    const response = await apiConnector(
      "PUT",
      `${courseworkApi.UPDATE_SLOT_API}/${id}`,
      payload,
      { Authorization: `Bearer ${token}` }
    )
    if (!response.data?.success) throw new Error(response.data?.message || "Failed to update slot")
    showSuccess("Slot updated")
    return response.data.data
  } catch (error) {
    showError(error.response?.data?.message || error.message || "Failed to update slot")
    throw error
  } finally {
    dismissToast(toastId)
  }
}

export async function deleteCourseworkSlot(id, token) {
  const toastId = showLoading("Deleting slot...")
  try {
    const response = await apiConnector(
      "DELETE",
      `${courseworkApi.DELETE_SLOT_API}/${id}`,
      {},
      { Authorization: `Bearer ${token}` }
    )
    if (!response.data?.success) throw new Error(response.data?.message || "Failed to delete slot")
    showSuccess("Slot deleted")
    return true
  } catch (error) {
    showError(error.response?.data?.message || error.message || "Failed to delete slot")
    throw error
  } finally {
    dismissToast(toastId)
  }
}

export async function toggleCourseworkSlot(id, token) {
  const toastId = showLoading("Updating...")
  try {
    const response = await apiConnector(
      "PATCH",
      `${courseworkApi.TOGGLE_SLOT_API}/${id}/toggle`,
      {},
      { Authorization: `Bearer ${token}` }
    )
    if (!response.data?.success) throw new Error(response.data?.message || "Failed to toggle")
    showSuccess("Updated")
    return response.data.data
  } catch (error) {
    showError(error.response?.data?.message || error.message || "Failed to toggle")
    throw error
  } finally {
    dismissToast(toastId)
  }
}

// List temp students in a batch (not persisted as Users)
export async function listTempStudentsInBatch(batchId, token) {
  try {
    const response = await apiConnector(
      "GET",
      `${LIST_TEMP_STUDENTS_IN_BATCH_API}/${batchId}/temp-students`,
      {},
      {
        Authorization: `Bearer ${token}`,
      }
    )

    if (!response.data?.success) {
      throw new Error(response.data?.message || "Failed to fetch temp students")
    }
    const payload = response.data?.data
    return Array.isArray(payload) ? payload : []
  } catch (error) {
    console.log("LIST TEMP STUDENTS ERROR............", error)
    showError(error.response?.data?.message || error.message || "Failed to fetch temp students")
    throw error
  }
}

// Add a temp student to a batch
export async function addTempStudentToBatch(batchId, { name, email, phone, enrollmentFeePaid = false }, token) {
  const toastId = showLoading("Adding student to batch...")
  try {
    const response = await apiConnector(
      "POST",
      `${ADD_TEMP_STUDENT_TO_BATCH_API}/${batchId}/temp-students`,
      { name, email, phone, enrollmentFeePaid },
      {
        Authorization: `Bearer ${token}`,
      }
    )

    if (!response.data?.success) {
      throw new Error(response.data?.message || "Failed to add student to batch")
    }
    showSuccess("Student added to batch")
    return response.data.data
  } catch (error) {
    console.log("ADD TEMP STUDENT ERROR............", error)
    showError(error.response?.data?.message || error.message || "Failed to add student to batch")
    throw error
  } finally {
    dismissToast(toastId)
  }
}

// =========================
// Coursework (PhD Admin)
// =========================
export async function getCourseworkImages(token) {
  try {
    const response = await apiConnector(
      "GET",
      courseworkApi.GET_IMAGES_API,
      {},
      { Authorization: `Bearer ${token}` }
    )
    if (!response.data?.success) {
      throw new Error(response.data?.message || "Failed to fetch coursework images")
    }
    return response.data?.data || { image1Url: "", image2Url: "", image3Url: "" }
  } catch (error) {
    showError(error.response?.data?.message || error.message || "Failed to fetch coursework images")
    throw error
  }
}

export async function updateCourseworkImages({ image1Url = "", image2Url = "", image3Url = "" }, token) {
  const toastId = showLoading("Saving images...")
  try {
    const response = await apiConnector(
      "PUT",
      courseworkApi.UPDATE_IMAGES_API,
      { image1Url, image2Url, image3Url },
      { Authorization: `Bearer ${token}` }
    )
    if (!response.data?.success) {
      throw new Error(response.data?.message || "Failed to update coursework images")
    }
    showSuccess("Images updated")
    return response.data?.data
  } catch (error) {
    console.log("UPDATE COURSEWORK IMAGES ERROR............", error)
    showError(error.response?.data?.message || error.message || "Failed to update coursework images")
    throw error
  } finally {
    dismissToast(toastId)
  }
}

// Fetch per-student task statuses for a task (Admin only)
export async function getTaskStatuses(taskId, token) {
  try {
    const response = await apiConnector(
      "GET",
      `${GET_TASK_STATUSES_API}/${taskId}/statuses`,
      {},
      { Authorization: `Bearer ${token}` }
    )
    if (!response.data?.success) {
      throw new Error(response.data?.message || "Failed to fetch task statuses")
    }
    const payload = response.data?.data
    return Array.isArray(payload) ? payload : []
  } catch (error) {
    console.log("GET TASK STATUSES ERROR............", error)
    showError(error.response?.data?.message || error.message || "Failed to fetch task statuses")
    throw error
  }
}

// Fetch task summary counts (Admin only)
export async function getTaskSummary(taskId, token) {
  try {
    const response = await apiConnector(
      "GET",
      `${GET_TASK_SUMMARY_API}/${taskId}/summary`,
      {},
      { Authorization: `Bearer ${token}` }
    )
    if (!response.data?.success) {
      throw new Error(response.data?.message || "Failed to fetch task summary")
    }
    const payload = response.data?.data
    return payload || { total: 0, submitted: 0, completed: 0, pending: 0, graded: 0 }
  } catch (error) {
    console.log("GET TASK SUMMARY ERROR............", error)
    showError(error.response?.data?.message || error.message || "Failed to fetch task summary")
    throw error
  }
}

// =========================
// Batch Tasks management
// =========================
// List tasks for a batch
export async function listBatchTasks(batchId, token) {
  try {
    const response = await apiConnector(
      "GET",
      `${LIST_BATCH_TASKS_API}/${batchId}/tasks`,
      {},
      { Authorization: `Bearer ${token}` }
    )
    if (!response.data?.success) {
      throw new Error(response.data?.message || "Failed to fetch tasks")
    }
    const payload = response.data?.data
    return Array.isArray(payload) ? payload : []
  } catch (error) {
    console.log("LIST BATCH TASKS ERROR............", error)
    showError(error.response?.data?.message || error.message || "Failed to fetch tasks")
    throw error
  }
}

// Create a task for a batch
export async function createBatchTask(batchId, { title, description = "", dueDate = null, assignedTo = null }, token) {
  const toastId = showLoading("Creating task...")
  try {
    const response = await apiConnector(
      "POST",
      `${CREATE_BATCH_TASK_API}/${batchId}/tasks`,
      { title, description, dueDate, assignedTo },
      { Authorization: `Bearer ${token}` }
    )
    if (!response.data?.success) {
      throw new Error(response.data?.message || "Failed to create task")
    }
    showSuccess("Task created")
    return response.data?.data
  } catch (error) {
    console.log("CREATE BATCH TASK ERROR............", error)
    showError(error.response?.data?.message || error.message || "Failed to create task")
    throw error
  } finally {
    dismissToast(toastId)
  }
}

// Update a task
export async function updateTask(taskId, updates, token) {
  const toastId = showLoading("Updating task...")
  try {
    const response = await apiConnector(
      "PUT",
      `${UPDATE_TASK_API}/${taskId}`,
      updates,
      { Authorization: `Bearer ${token}` }
    )
    if (!response.data?.success) {
      throw new Error(response.data?.message || "Failed to update task")
    }
    showSuccess("Task updated")
    return response.data?.data
  } catch (error) {
    console.log("UPDATE TASK ERROR............", error)
    showError(error.response?.data?.message || error.message || "Failed to update task")
    throw error
  } finally {
    dismissToast(toastId)
  }
}

// Delete a task
export async function deleteTask(taskId, token) {
  const toastId = showLoading("Deleting task...")
  try {
    const response = await apiConnector(
      "DELETE",
      `${DELETE_TASK_API}/${taskId}`,
      null,
      { Authorization: `Bearer ${token}` }
    )
    if (!response.data?.success) {
      throw new Error(response.data?.message || "Failed to delete task")
    }
    showSuccess("Task deleted")
    return true
  } catch (error) {
    console.log("DELETE TASK ERROR............", error)
    showError(error.response?.data?.message || error.message || "Failed to delete task")
    throw error
  } finally {
    dismissToast(toastId)
  }
}
// Remove a temp student from a batch
export async function removeTempStudentFromBatch(batchId, tempId, token) {
  const toastId = showLoading("Removing student...")
  try {
    const response = await apiConnector(
      "DELETE",
      `${REMOVE_TEMP_STUDENT_FROM_BATCH_API}/${batchId}/temp-students/${tempId}`,
      {},
      {
        Authorization: `Bearer ${token}`,
      }
    )

    if (!response.data?.success) {
      throw new Error(response.data?.message || "Failed to remove student")
    }
    showSuccess("Student removed from batch")
    return true
  } catch (error) {
    console.log("REMOVE TEMP STUDENT ERROR............", error)
    showError(error.response?.data?.message || error.message || "Failed to remove student")
    throw error
  } finally {
    dismissToast(toastId)
  }
}

// Download CSV template for bulk student upload (Admin only)
export async function downloadStudentsTemplate(token) {
  const toastId = showLoading("Preparing template...")
  try {
    const response = await apiConnector(
      "GET",
      STUDENTS_TEMPLATE_API,
      {},
      { Authorization: `Bearer ${token}` },
      { responseType: "blob" }
    )
    showSuccess("Template ready")
    return response.data // Blob
  } catch (error) {
    console.log("DOWNLOAD STUDENTS TEMPLATE ERROR............", error)
    showError(error.response?.data?.message || error.message || "Failed to download template")
    throw error
  } finally {
    dismissToast(toastId)
  }
}

// Create a generic user by Admin (Admin, Instructor, Content-management, Student)
export async function createUserByAdmin({ name, email, phone, password, confirmPassword, accountType, enrollmentFeePaid = false, userTypeId = null }, token) {
  const toastId = showLoading("Creating user...")
  try {
    const response = await apiConnector(
      "POST",
      admin.CREATE_USER_API,
      { name, email, phone, password, confirmPassword, accountType, enrollmentFeePaid, userTypeId },
      { Authorization: `Bearer ${token}` }
    )

    if (!response.data?.success) {
      throw new Error(response.data?.message || "Failed to create user")
    }

    showSuccess(`${accountType} created successfully`)
    return response.data.data
  } catch (error) {
    console.log("CREATE USER BY ADMIN ERROR............", error)
    showError(error.response?.data?.message || error.message || "Failed to create user")
    throw error
  } finally {
    dismissToast(toastId)
  }
}

// =========================
// Batch Trainers management
// =========================
// List trainers assigned to a batch
export async function listBatchTrainers(batchId, token) {
  try {
    const response = await apiConnector(
      "GET",
      `${LIST_BATCH_TRAINERS_API}/${batchId}/trainers`,
      {},
      { Authorization: `Bearer ${token}` }
    )

    if (!response.data?.success) {
      throw new Error(response.data?.message || "Failed to fetch batch trainers")
    }
    const payload = response.data?.data
    return Array.isArray(payload) ? payload : []
  } catch (error) {
    console.log("LIST BATCH TRAINERS ERROR............", error)
    showError(error.response?.data?.message || error.message || "Failed to fetch batch trainers")
    throw error
  }
}

// Assign a trainer to a batch
export async function addTrainerToBatch(batchId, trainerId, token) {
  const toastId = showLoading("Assigning trainer...")
  try {
    const response = await apiConnector(
      "POST",
      `${ADD_TRAINER_TO_BATCH_API}/${batchId}/trainers`,
      { trainerId },
      { Authorization: `Bearer ${token}` }
    )

    if (!response.data?.success) {
      throw new Error(response.data?.message || "Failed to assign trainer")
    }
    showSuccess("Trainer assigned to batch")
    return true
  } catch (error) {
    console.log("ADD TRAINER TO BATCH ERROR............", error)
    showError(error.response?.data?.message || error.message || "Failed to assign trainer")
    throw error
  } finally {
    dismissToast(toastId)
  }
}

// Remove a trainer from a batch
export async function removeTrainerFromBatch(batchId, trainerId, token) {
  const toastId = showLoading("Removing trainer...")
  try {
    const response = await apiConnector(
      "DELETE",
      `${REMOVE_TRAINER_FROM_BATCH_API}/${batchId}/trainers/${trainerId}`,
      {},
      { Authorization: `Bearer ${token}` }
    )

    if (!response.data?.success) {
      throw new Error(response.data?.message || "Failed to remove trainer")
    }
    showSuccess("Trainer removed from batch")
    return true
  } catch (error) {
    console.log("REMOVE TRAINER FROM BATCH ERROR............", error)
    showError(error.response?.data?.message || error.message || "Failed to remove trainer")
    throw error
  } finally {
    dismissToast(toastId)
  }
}

// Bulk upload students (CSV/XLSX) and assign to a batch (Admin only)
export async function bulkUploadStudents({ batchId, file }, token) {
  const toastId = showLoading("Uploading students...")
  try {
    const formData = new FormData()
    formData.append("batchId", batchId)
    formData.append("file", file)

    const response = await apiConnector(
      "POST",
      BULK_UPLOAD_STUDENTS_API,
      formData,
      { Authorization: `Bearer ${token}` },
      { headers: { "Content-Type": "multipart/form-data" } }
    )

    if (!response.data?.success) {
      throw new Error(response.data?.message || "Bulk upload failed")
    }
    showSuccess("Bulk upload processed")
    return response.data.data
  } catch (error) {
    console.log("BULK UPLOAD STUDENTS ERROR............", error)
    showError(error.response?.data?.message || error.message || "Failed to upload students")
    throw error
  } finally {
    dismissToast(toastId)
  }
}

// Create Google Meet link via backend (Admin only)
export async function createGoogleMeetLink({ startISO, endISO, title = "Live Class", description = "" }, token) {
  const toastId = showLoading("Creating Google Meet link...")
  try {
    const response = await apiConnector(
      "POST",
      CREATE_MEET_LINK_API,
      { title, description, startISO, endISO },
      { Authorization: `Bearer ${token}` }
    )

    if (!response.data?.success) {
      throw new Error(response.data?.message || "Failed to create Meet link")
    }
    const link = response.data?.hangoutLink || response.data?.event?.hangoutLink || null
    if (!link) {
      throw new Error("Meet link not returned by Google Calendar")
    }
    showSuccess("Meet link created")
    return link
  } catch (error) {
    console.log("CREATE MEET LINK ERROR............", error)
    showError(error.response?.data?.message || error.message || "Failed to create Meet link")
    throw error
  } finally {
    dismissToast(toastId)
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
    showError(error.response?.data?.message || error.message || "Failed to update batch")
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
    showError(error.response?.data?.message || error.message || "Failed to delete batch")
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
    showError(error.response?.data?.message || error.message || "Failed to fetch batch details")
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
    showError(error.response?.data?.message || error.message || "Failed to fetch batches")
    throw error
  }
}

// Export batches CSV (Admin only)
export async function exportBatches({ token, search = "" }) {
  const toastId = showLoading("Preparing download...")
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

    showSuccess("Download ready")
    return response.data // Blob
  } catch (error) {
    console.log("EXPORT BATCHES ERROR............", error)
    showError(error.response?.data?.message || error.message || "Failed to export batches")
    throw error
  } finally {
    dismissToast(toastId)
  }
}

export async function deleteAdminReview(reviewId, token) {
  const toastId = showLoading("Deleting review...")
  try {
    const response = await apiConnector(
      "DELETE",
      `${CREATE_ADMIN_REVIEW_API}/${reviewId}`,
      null,
      { Authorization: `Bearer ${token}` }
    )
    if (!response.data?.success) {
      throw new Error(response.data?.message || "Failed to delete review")
    }
    showSuccess("Review deleted")
    return true
  } catch (error) {
    console.log("DELETE ADMIN REVIEW ERROR............", error)
    showError(error.response?.data?.message || error.message || "Failed to delete review")
    return false
  } finally {
    dismissToast(toastId)
  }
}

// =========================
// Admin Reviews
// =========================
export async function createAdminReview({ courseId, rating, review }, token) {
  const toastId = showLoading("Submitting review...")
  try {
    const response = await apiConnector(
      "POST",
      CREATE_ADMIN_REVIEW_API,
      { courseId, rating, review },
      { Authorization: `Bearer ${token}` }
    )

    if (!response.data?.success) {
      throw new Error(response.data?.message || "Failed to create review")
    }
    showSuccess("Review submitted")
    return response.data.data
  } catch (error) {
    console.log("CREATE ADMIN REVIEW ERROR............", error)
    showError(error.response?.data?.message || error.message || "Failed to create review")
    throw error
  } finally {
    dismissToast(toastId)
  }
}

// =========================
// Batch Departments (Admin)
// =========================
export async function listBatchDepartments({ onlyActive = true } = {}) {
  try {
    const response = await apiConnector(
      "GET",
      batchDeptApi.BASE,
      {},
      {},
      { params: { onlyActive: String(onlyActive) } }
    )
    if (!response.data?.success) throw new Error(response.data?.message || "Failed to fetch batch departments")
    const payload = response.data?.data
    return Array.isArray(payload) ? payload : []
  } catch (error) {
    showError(error.response?.data?.message || error.message || "Failed to fetch batch departments")
    throw error
  }
}

export async function createBatchDepartment({ name, shortcode = "", status = "Active" }, token) {
  const toastId = showLoading("Creating department...")
  try {
    const response = await apiConnector(
      "POST",
      batchDeptApi.BASE,
      { name, shortcode, status },
      { Authorization: `Bearer ${token}` }
    )
    if (!response.data?.success) throw new Error(response.data?.message || "Failed to create batch department")
    showSuccess("Department created")
    return response.data?.data
  } catch (error) {
    showError(error.response?.data?.message || error.message || "Failed to create batch department")
    throw error
  } finally {
    dismissToast(toastId)
  }
}

export async function updateBatchDepartment(id, { name, shortcode, status }, token) {
  const toastId = showLoading("Updating department...")
  try {
    const response = await apiConnector(
      "PATCH",
      `${batchDeptApi.BASE}/${id}`,
      { name, shortcode, status },
      { Authorization: `Bearer ${token}` }
    )
    if (!response.data?.success) throw new Error(response.data?.message || "Failed to update batch department")
    showSuccess("Department updated")
    return response.data?.data
  } catch (error) {
    showError(error.response?.data?.message || error.message || "Failed to update batch department")
    throw error
  } finally {
    dismissToast(toastId)
  }
}

export async function deleteBatchDepartment(id, token) {
  const toastId = showLoading("Deleting department...")
  try {
    const response = await apiConnector(
      "DELETE",
      `${batchDeptApi.BASE}/${id}`,
      {},
      { Authorization: `Bearer ${token}` }
    )
    if (!response.data?.success) throw new Error(response.data?.message || "Failed to delete batch department")
    showSuccess("Department deleted")
    return true
  } catch (error) {
    showError(error.response?.data?.message || error.message || "Failed to delete batch department")
    throw error
  } finally {
    dismissToast(toastId)
  }
}

// =========================
// Batch Live Classes
// =========================
export async function addLiveClassToBatch(batchId, payload) {
  const toastId = showLoading("Creating live class...");
  try {
    // 1. Get token from localStorage (same as how it's stored in Redux)
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }

    console.log('Token being sent:', token.substring(0, 15) + '...'); // Log first 15 chars of token
    
    // Get user ID from token
    const tokenPayload = JSON.parse(atob(token.split('.')[1]));
    const userId = tokenPayload._id || tokenPayload.id; // Try both _id and id
    
    if (!userId) {
      console.error('Token payload:', tokenPayload);
      throw new Error('Invalid token: No user ID found in token');
    }
    
    const response = await fetch(`http://localhost:4000/api/v1/admin/batches/${batchId}/live-classes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        ...payload,
        createdBy: userId // Use the actual user ID from the token
      })
    });

    console.log('Response status:', response.status);
    
    // Check for HTTP errors
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      throw new Error(errorData.message || 'Failed to create live class');
    }

    const data = await response.json();
    console.log('Response data:', data);

    if (!data?.success) {
      throw new Error(data?.message || "Failed to create live class");
    }
    
    showSuccess("Live class created successfully!");
    return data.data || data;
  } catch (error) {
    console.error("ADD LIVE CLASS TO BATCH ERROR:", error);
    showError(error.message || "Failed to create live class");
    throw error;
  } finally {
    dismissToast(toastId);
  }
}

// =========================
// Batch Courses management
// =========================
// List courses assigned to a batch
export async function listBatchCourses(batchId, token) {
  try {
    const response = await apiConnector(
      "GET",
      `${LIST_BATCH_COURSES_API}/${batchId}/courses`,
      {},
      {
        Authorization: `Bearer ${token}`,
      }
    )

    if (!response.data?.success) {
      throw new Error(response.data?.message || "Failed to fetch batch courses")
    }
    const payload = response.data?.data
    return Array.isArray(payload) ? payload : []
  } catch (error) {
    console.log("LIST BATCH COURSES ERROR............", error)
    showError(error.response?.data?.message || error.message || "Failed to fetch batch courses")
    throw error
  }
}

// Add a course to a batch
export async function addCourseToBatch(batchId, courseId, token) {
  const toastId = showLoading("Adding course...")
  try {
    const response = await apiConnector(
      "POST",
      `${ADD_COURSE_TO_BATCH_API}/${batchId}/courses`,
      { courseId },
      {
        Authorization: `Bearer ${token}`,
      }
    )

    if (!response.data?.success) {
      throw new Error(response.data?.message || "Failed to add course")
    }
    showSuccess("Course added to batch")
    return true
  } catch (error) {
    console.log("ADD COURSE TO BATCH ERROR............", error)
    showError(error.response?.data?.message || error.message || "Failed to add course")
    throw error
  } finally {
    dismissToast(toastId)
  }
}

// Remove a course from a batch
export async function removeCourseFromBatch(batchId, courseId, token) {
  const toastId = showLoading("Removing course...")
  try {
    const response = await apiConnector(
      "DELETE",
      `${REMOVE_COURSE_FROM_BATCH_API}/${batchId}/courses/${courseId}`,
      {},
      {
        Authorization: `Bearer ${token}`,
      }
    )

    if (!response.data?.success) {
      throw new Error(response.data?.message || "Failed to remove course")
    }
    showSuccess("Course removed from batch")
    return true
  } catch (error) {
    console.log("REMOVE COURSE FROM BATCH ERROR............", error)
    showError(error.response?.data?.message || error.message || "Failed to remove course")
    throw error
  } finally {
    dismissToast(toastId)
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
    showError(error.response?.data?.message || error.message || "Failed to fetch batch students")
    throw error
  }
}

// Assign a student to a batch
export async function addStudentToBatch(batchId, studentId, token) {
  const toastId = showLoading("Assigning student...")
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
    showSuccess("Student assigned to batch")
    return true
  } catch (error) {
    console.log("ADD STUDENT TO BATCH ERROR............", error)
    showError(error.response?.data?.message || error.message || "Failed to assign student")
    throw error
  } finally {
    dismissToast(toastId)
  }
}

// Remove a student from a batch
export async function removeStudentFromBatch(batchId, studentId, token) {
  const toastId = showLoading("Removing student...")
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
    showSuccess("Student removed from batch")
    return true
  } catch (error) {
    console.log("REMOVE STUDENT FROM BATCH ERROR............", error)
    showError(error.response?.data?.message || error.message || "Failed to remove student")
    throw error
  } finally {
    dismissToast(toastId)
  }
}

// Create a Student (Admin only)
export async function createStudent({ name, email, phone, password, confirmPassword, enrollmentFeePaid = false, batchId }, token) {
  const toastId = showLoading("Creating student...")
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

    showSuccess("Student created successfully")
    return response.data.data
  } catch (error) {
    console.log("CREATE STUDENT ERROR............", error)
    showError(error.response?.data?.message || error.message || "Failed to create student")
    throw error
  } finally {
    dismissToast(toastId)
  }
}

// Get enrolled students
export async function getEnrolledStudents(token, { page = 1, limit = 10, search = "" } = {}) {
  try {
    const response = await apiConnector(
      "GET",
      GET_ENROLLED_STUDENTS_API,
      {},
      {
        Authorization: `Bearer ${token}`,
      },
      { params: { page, limit, search } }
    )

    console.log("GET ENROLLED STUDENTS RESPONSE............", response)

    if (!response.data?.success) {
      throw new Error(response.data?.message || "Failed to fetch enrolled students")
    }

    // Prefer pagination payload if provided by backend
    const data = response.data?.data
    const items = Array.isArray(data?.enrolledStudents)
      ? data.enrolledStudents
      : (Array.isArray(data) ? data : [])
    const meta = data?.meta || null

    return { items, meta }
  } catch (error) {
    console.log("GET ENROLLED STUDENTS ERROR............", error)
    showError(error.response?.data?.message || error.message || "Failed to fetch enrolled students")
    throw error;
  }
}

// Get PhD-enrolled students (paid enrollment fee, paymentStatus Completed, userType PhD)
export async function getPhdEnrolledStudents(token, { page = 1, limit = 10, search = "" } = {}) {
  try {
    const response = await apiConnector(
      "GET",
      GET_PHD_ENROLLED_STUDENTS_API,
      null,
      { Authorization: `Bearer ${token}` },
      { params: { page, limit, search } }
    )

    if (!response.data?.success) {
      throw new Error(response.data?.message || "Failed to fetch PhD enrolled students")
    }

    const data = response.data?.data
    const items = Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : [])
    const meta = data?.meta || null

    return { items, meta }
  } catch (error) {
    showError(error.response?.data?.message || error.message || "Failed to fetch PhD enrolled students")
    throw error
  }
}

// Get PhD students who paid enrollment fee (no course-fee requirement)
export async function getPhdEnrollmentPaidStudents(token, { page = 1, limit = 10, search = "" } = {}) {
  try {
    const response = await apiConnector(
      "GET",
      GET_PHD_ENROLLMENT_PAID_STUDENTS_API,
      {},
      {
        Authorization: `Bearer ${token}`,
      },
      { params: { page, limit, search } }
    )

    if (!response.data?.success) {
      throw new Error(response.data?.message || "Failed to fetch PhD enrollment-paid students")
    }

    const data = response.data?.data
    const items = Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : [])
    const meta = data?.meta || null

    return { items, meta }
  } catch (error) {
    showError(error.response?.data?.message || error.message || "Failed to fetch PhD enrollment-paid students")
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
    showError("Failed to fetch pending instructors")
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
    showError("Failed to fetch instructors")
    throw error
  }
}

// Approve instructor
export async function approveInstructor(instructorId, token) {
  const toastId = showLoading("Approving instructor...")
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

    showSuccess("Instructor approved successfully")
    return response.data
  } catch (error) {
    console.log("APPROVE INSTRUCTOR ERROR............", error)
    showError("Failed to approve instructor")
    throw error
  } finally {
    dismissToast(toastId)
  }
}

// Create batch (Admin only)
export async function createBatch(payload, token) {
  const toastId = showLoading("Creating batch...")
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

    showSuccess("Batch created successfully")
    return response.data.data
  } catch (error) {
    console.log("CREATE BATCH ERROR............", error)
    showError(error.response?.data?.message || error.message || "Failed to create batch")
    throw error
  } finally {
    dismissToast(toastId)
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

    if (!response.data?.success) {
      throw new Error(response.data?.message || "Failed to fetch dashboard stats")
    }

    return response.data?.data
  } catch (error) {
    console.log("GET DASHBOARD STATS ERROR............", error)
    showError("Failed to fetch dashboard stats")
    throw error
  }
}

// Update user status
export async function updateUserStatus(userId, status, token) {
  const toastId = showLoading("Updating user status...")
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

    if (!response.data?.success) {
      throw new Error(response.data?.message || "Failed to update user status")
    }

    showSuccess("User status updated successfully")
    return response.data?.data || true
  } catch (error) {
    console.log("UPDATE USER STATUS ERROR............", error)
    showError("Failed to update user status")
    throw error
  } finally {
    dismissToast(toastId)
  }
}