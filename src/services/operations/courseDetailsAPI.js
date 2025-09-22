import { showSuccess, showError, showLoading, dismissToast } from "../../utils/toast"

import { setCourseSectionData, setEntireCourseData, setTotalNoOfLectures, setCompletedLectures, updateCompletedLectures } from "../../store/slices/viewCourseSlice";
// import { setLoading } from "../../slices/profileSlice";
import { apiConnector } from '../apiConnector';
import { course, subCategory } from '../apis';
import { refreshToken } from "../operations/authApi"; // Import your refresh token function


const {
  GET_COURSE_DETAILS_API,
  SHOW_ALL_CATEGORIES_API,
  GET_ALL_COURSES_API,
  CREATE_COURSE_API,
  EDIT_COURSE_API,
  CREATE_SECTION_API,
  CREATE_SUBSECTION_API,
  UPDATE_SECTION_API,
  UPDATE_SUBSECTION_API,
  DELETE_SECTION_API,
  DELETE_SUBSECTION_API,
  GET_ALL_INSTRUCTOR_COURSES_API,
  GET_ADMIN_COURSES_API,
  DELETE_COURSE_API,
  GET_FULL_COURSE_DETAILS_AUTHENTICATED,
  CREATE_RATING_API,
  LECTURE_COMPLETION_API,
  GET_REVIEWS_API,
  
} = course;

const { GET_SUBCATEGORIES_BY_PARENT_API } = subCategory;

console.log('GET_COURSE_DETAILS_API:', GET_COURSE_DETAILS_API);
console.log('Available course APIs:', Object.keys(course));


let toastId = null; // Module-level variable to track the toast ID
let isLoading = false; // Flag to track loading state

export const getAllCourses = async () => {
  const toastId = showLoading("Loading...")
  let result = []
  try {
    const response = await apiConnector("GET", GET_ALL_COURSES_API)
    if (!response?.data?.success) {
      throw new Error("Could Not Fetch Courses")
    }
    result = response?.data?.data
  } catch (error) {
    console.log("GET_ALL_COURSES_API API ERROR............", error)
    showError(error.message)
  }
  dismissToast(toastId)
  return result
}

export const fetchCourseDetails = async (courseId) => {
  const toastId = showLoading("Loading...")
  //   dispatch(setLoading(true));
  let result = null
  try {
    console.log('Making API call to:', GET_COURSE_DETAILS_API);
    console.log('With courseId:', courseId);
    console.log('Request body:', { courseId });
    
    const response = await apiConnector("POST", GET_COURSE_DETAILS_API, {
      courseId,
    })
    console.log("GET_COURSE_DETAILS_API API RESPONSE............", response)

    if (!response.data.success) {
      throw new Error(response.data.message)
    }
    result = response.data
  } catch (error) {
    console.log("GET_COURSE_DETAILS_API API ERROR............", error)
    console.log("Error response:", error.response);
    console.log("Error message:", error.message);
    result = error.response?.data || { success: false, message: error.message }
    // toast.error(error.response.data.message);
  }
  dismissToast(toastId)
  //   dispatch(setLoading(false));
  return result
}

// fetching the available course categories
export const fetchCourseCategories = async () => {
  let result = []
  try {
    const response = await apiConnector("GET", SHOW_ALL_CATEGORIES_API)
    console.log("SHOW_ALL_CATEGORIES_API API RESPONSE............", response)
    if (!response?.data?.success) {
      throw new Error("Could Not Fetch Course Categories")
    }
    result = response?.data?.data
  } catch (error) {
    console.log("SHOW_ALL_CATEGORIES_API API ERROR............", error)
    showError(error.message)
  }
  return result
}

// fetching the available course sub-categories for a specific category
export const fetchCourseSubCategories = async (categoryId) => {
  let result = []
  try {
    const response = await apiConnector("GET", `${GET_SUBCATEGORIES_BY_PARENT_API}/${categoryId}`)
    console.log("GET_SUBCATEGORIES_BY_PARENT_API API RESPONSE............", response)
    if (!response?.data?.success) {
      throw new Error("Could Not Fetch Course Sub-Categories")
    }
    result = response?.data?.data
  } catch (error) {
    console.log("GET_SUBCATEGORIES_BY_PARENT_API API ERROR............", error)
    // Do not show a toast here as it might be annoying if the user is just switching categories
  }
  return result
}



// add the course details
export const addCourseDetails = async (data, token) => {
  let result = null;
  const toastId = showLoading("Saving course details...");
  
  try {
    console.log('addCourseDetails - Token:', token);
    console.log('addCourseDetails - Data:', data);
    
    // Ensure we have a token
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }
    
    // Create headers with proper content type for form data
    const headers = {
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${token}`,
    };
    
    console.log('Sending request to:', CREATE_COURSE_API);
    console.log('Headers:', headers);
    
    const response = await apiConnector("POST", CREATE_COURSE_API, data, headers);
    
    console.log("CREATE COURSE API RESPONSE............", response);
    
    if (!response?.data?.success) {
      throw new Error(response.data.message || 'Failed to add course details');
    }
    
    showSuccess("Course details saved successfully!");
    result = response?.data?.data;
    
  } catch (error) {
    console.error("CREATE COURSE API ERROR............", error);
    
    // Provide more detailed error message
    let errorMessage = 'Failed to save course details';
    if (error.response) {
      // Server responded with an error status code
      errorMessage = error.response.data?.message || errorMessage;
      console.error('Error response data:', error.response.data);
    } else if (error.request) {
      // Request was made but no response received
      errorMessage = 'No response from server. Please check your connection.';
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request
      errorMessage = error.message || errorMessage;
    }
    
    showError(errorMessage);
    throw error; // Re-throw to let the caller handle it if needed
  } finally {
    dismissToast(toastId);
  }
  return result
}

// edit the course details
export const editCourseDetails = async (data, token) => {
  let result = null;
  const toastId = showLoading("Saving course changes...");
  
  try {
    console.log("EDIT COURSE REQUEST DATA:", data);
    
    // Create a new FormData instance to ensure we have a clean object
    const formData = new FormData();
    
    // Copy all entries from the original FormData
    if (data instanceof FormData) {
      for (let [key, value] of data.entries()) {
        formData.append(key, value);
      }
    } else if (typeof data === 'object') {
      // If data is a plain object, convert it to FormData
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }
    
    // Ensure we have a course ID in one of the expected fields
    const courseId = formData.get('courseId') || formData.get('_id');
    if (!courseId) {
      throw new Error("Course ID is required for editing. Please provide either 'courseId' or '_id'");
    }
    
    console.log("Editing course with ID:", courseId);
    
    // Add course ID in all possible fields for backend compatibility
    if (!formData.get('courseId')) formData.append('courseId', courseId);
    if (!formData.get('_id')) formData.append('_id', courseId);
    if (!formData.get('course._id')) formData.append('course._id', courseId);
    
    // Log FormData contents for debugging
    console.log("FormData contents before sending:");
    for (let [key, value] of formData.entries()) {
      console.log(key, ':', value);
    }
    
    // Make the API call
    const response = await apiConnector("POST", EDIT_COURSE_API, formData, {
      // Don't set Content-Type header - let the browser set it with the correct boundary
      Authorization: `Bearer ${token}`,
    });
    
    console.log("EDIT COURSE API RESPONSE............", response)
    
    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could Not Update Course Details")
    }
    
    // Dismiss loading toast and show success message
    dismissToast(toastId)
    showSuccess("Course updated successfully")
    
    result = response?.data?.data
  } catch (error) {
    console.log("EDIT COURSE API ERROR............", error)
    // Dismiss loading toast before showing error
    dismissToast(toastId)
    showError(error.message || "Failed to update course")
  }
  return result
}

// create a section
export const createSection = async (data, token) => {
  let result = null

  const toastId = showLoading("Loading...")
  console.log("before section")
  try {
    const response = await apiConnector("POST", CREATE_SECTION_API, data, {
      Authorization: `Bearer ${token}`,
    })
    console.log("after section")
    console.log("CREATE SECTION API RESPONSE............", response)
    if (!response?.data?.success) {
      throw new Error("Could Not Create Section")
    }
    showSuccess("Course Section Created")
    result = response?.data?.updatedCourse
  } catch (error) {
    console.log("CREATE SECTION API ERROR............", error)
    showError(error.message)
  }
  dismissToast(toastId)
  return result
}

// create a subsection
export const createSubSection = async (formData, token) => {
  let result = null;
  const toastId = showLoading("Uploading lecture...");
  
  try {
    // Log the form data for debugging
    console.log("[createSubSection] Starting subsection creation...");
    
    // Ensure formData is a FormData instance
    if (!(formData instanceof FormData)) {
      throw new Error("Invalid form data format. Expected FormData.");
    }
    
    // Log form data entries for debugging
    console.log("[createSubSection] FormData entries:");
    for (let [key, value] of formData.entries()) {
      console.log(`  ${key}:`, value instanceof File ? 
        `[File] ${value.name} (${value.size} bytes, ${value.type})` : 
        value);
    }
    
    // Make the API call using apiConnector
    console.log("[createSubSection] Sending request to:", CREATE_SUBSECTION_API);
    
    const response = await apiConnector(
      "POST",
      CREATE_SUBSECTION_API,
      formData, // Send the original FormData directly
      {
        // Important: Don't set Content-Type header here, let the browser set it with the correct boundary
      },
      null, // params
      false // Don't skip auth - we want to include the token
    );

    console.log("[createSubSection] API response received:", response);
    
    if (!response.data) {
      throw new Error("No data received from server");
    }
    
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to add lecture");
    }
    
    console.log("[createSubSection] Success:", response.data);
    showSuccess("Lecture added successfully");
    result = response.data.data;
  } catch (error) {
    console.error("CREATE SUB-SECTION API ERROR............", error);
    const message = error?.response?.data?.message || error.message || "Failed to add lecture";
    showError(message);
    throw error; // Re-throw to be handled by the caller
  } finally {
    dismissToast(toastId);
  }
  
  return result;
};

// update a section
export const updateSection = async (data, token) => {
  let result = null
  const toastId = showLoading("Loading...")
  try {
    const response = await apiConnector("POST", UPDATE_SECTION_API, data, {
      Authorization: `Bearer ${token}`,
    })
    console.log("UPDATE SECTION API RESPONSE............", response)
    if (!response?.data?.success) {
      throw new Error("Could Not Update Section")
    }
    showSuccess("Course Section Updated")
    result = response?.data?.data
  } catch (error) {
    console.log("UPDATE SECTION API ERROR............", error)
    showError(error.message)
  }
  dismissToast(toastId)
  return result
}

// update a subsection
export const updateSubSection = async (formData, token) => {
  let result = null
  const toastId = showLoading("Updating lecture...")
  try {
    const response = await fetch(UPDATE_SUBSECTION_API, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type - let the browser set it with the correct boundary
      },
      body: formData, // Send the FormData directly
    });

    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(responseData.message || "Failed to update lecture");
    }

    if (!responseData.success) {
      throw new Error(responseData.message || "Could not update lecture");
    }
    
    console.log("UPDATE SUB-SECTION API RESPONSE............", responseData);
    showSuccess("Lecture updated successfully");
    result = responseData.data;
  } catch (error) {
    console.error("UPDATE SUB-SECTION API ERROR............", error);
    const message = error?.response?.data?.message || error.message || "Failed to update lecture";
    showError(message);
    throw error; // Re-throw to be handled by the caller
  } finally {
    dismissToast(toastId);
  }
  return result;
}

// delete a section
export const deleteSection = async (data, token) => {
  let result = null
  const toastId = showLoading("Loading...")
  try {
    const response = await apiConnector("POST", DELETE_SECTION_API, data, {
      Authorization: `Bearer ${token}`,
    })
    console.log("DELETE SECTION API RESPONSE............", response)
    if (!response?.data?.success) {
      throw new Error("Could Not Delete Section")
    }
    showSuccess("Course Section Deleted")
    result = response?.data?.data
  } catch (error) {
    console.log("DELETE SECTION API ERROR............", error)
    showError(error.message)
  }
  dismissToast(toastId)
  return result
}
// delete a subsection
export const deleteSubSection = async (data, token) => {
  let result = null
  const toastId = showLoading("Loading...")
  try {
    const response = await apiConnector("POST", DELETE_SUBSECTION_API, data, {
      Authorization: `Bearer ${token}`,
    })
    console.log("DELETE SUB-SECTION API RESPONSE............", response)
    if (!response?.data?.success) {
      throw new Error("Could Not Delete Lecture")
    }
    showSuccess("Lecture Deleted")
    result = response?.data?.data
  } catch (error) {
    console.log("DELETE SUB-SECTION API ERROR............", error)
    showError(error.message)
  }
  dismissToast(toastId)
  return result
}



export const fetchInstructorCourses = async (token) => {
  // Check if a loading toast is already displayed
  if (!isLoading) {
    isLoading = true; // Set loading state to true
    toastId = showLoading("Loading..."); // Show loading toast
  }

  let result = [];
  try {
    console.log("before response");
    const response = await apiConnector(
      "GET",
      GET_ALL_INSTRUCTOR_COURSES_API,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );
    console.log("after res");
    console.log("INSTRUCTOR COURSES API RESPONSE............", response);
    
    if (!response?.data?.success) {
      throw new Error("Could Not Fetch Instructor Courses");
    }
    result = response?.data?.data;
  } catch (error) {
    console.log("INSTRUCTOR COURSES API ERROR............", error);
    // Optionally show an error toast
    showError(error.message || "Could Not Fetch Instructor Courses");
  } finally {
    // Dismiss the loading toast and reset state
    if (toastId) {
      dismissToast(toastId);
      toastId = null; // Reset toastId after dismissal
    }
    isLoading = false; // Reset loading state
  }

  return result;
}

// Fetch courses created by the logged-in Admin/Super Admin
export const fetchAdminCourses = async (token) => {
  // Use shared loading toast state
  if (!isLoading) {
    isLoading = true;
    toastId = showLoading("Loading...");
  }
  let result = [];
  try {
    const response = await apiConnector(
      "GET",
      GET_ADMIN_COURSES_API,
      null,
      { Authorization: `Bearer ${token}` }
    );
    if (!response?.data?.success) {
      throw new Error("Could Not Fetch Admin Courses");
    }
    result = response?.data?.data;
  } catch (error) {
    console.log("ADMIN COURSES API ERROR............", error);
    showError(error.message || "Could Not Fetch Admin Courses");
  } finally {
    if (toastId) {
      dismissToast(toastId);
      toastId = null;
    }
    isLoading = false;
  }
  return result;
}

// delete a course
export const deleteCourse = async (data, token) => {
  const toastId = showLoading("Loading...")
  try {
    const response = await apiConnector("DELETE", DELETE_COURSE_API, data, {
      Authorization: `Bearer ${token}`,
    })
    console.log("DELETE COURSE API RESPONSE............", response)
    if (!response?.data?.success) {
      throw new Error("Could Not Delete Course")
    }
    showSuccess("Course Deleted")
  } catch (error) {
    console.log("DELETE COURSE API ERROR............", error)
    showError(error.message)
  }
  dismissToast(toastId)
}

export const getFullDetailsOfCourse = async (courseId, token) => {
  let toastId;
  try {
    toastId = showLoading("Loading course details...");

    const response = await apiConnector(
      "POST",
      "/api/v1/course/getFullCourseDetails",
      { courseId },
      token ? { Authorization: `Bearer ${token}` } : undefined
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to load course details");
    }

    dismissToast(toastId);
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    if (toastId) dismissToast(toastId);

    if (error.response?.status === 401) {
      showError("Please login to view this course");
      return { success: false, requiresLogin: true };
    }

    showError(error.message || "Failed to load course details");
    return {
      success: false,
      message: error.message,
    };
  }
};






export const markLectureAsComplete = async (data, token) => {
  let result = null
  console.log("mark complete data", data)
  const toastId = showLoading("Loading...")
  try {
    const response = await apiConnector("POST", LECTURE_COMPLETION_API, data, {
      Authorization: `Bearer ${token}`,
    })
    console.log(
      "MARK_LECTURE_AS_COMPLETE_API API RESPONSE............",
      response
    )

    if (!response.data.message) {
      throw new Error(response.data.error)
    }
    showSuccess("Lecture Completed")
    result = true
  } catch (error) {
    console.log("MARK_LECTURE_AS_COMPLETE_API API ERROR............", error)
    // Treat already-completed as a successful, idempotent operation
    const status = error?.response?.status
    const errMsg = error?.response?.data?.error || error?.message
    if (status === 400 && errMsg === "Subsection already completed") {
      showSuccess("Lecture already marked as completed")
      result = true
    } else {
      showError(errMsg || "Failed to update progress")
      result = false
    }
  }
  dismissToast(toastId)
  return result
}

// create a rating for course
export const createRating = async (data, token) => {
  const toastId = showLoading("Saving your rating...");
  try {
    const baseUrl = process.env.REACT_APP_BASE_URL || 'http://localhost:4000';
    const apiUrl = `${baseUrl}${CREATE_RATING_API}`;
    
    console.log('=== FRONTEND: createRating called ===');
    console.log('API URL:', apiUrl);
    console.log('Token exists:', !!token);
    console.log('Token length:', token?.length);
    console.log('First 10 chars of token:', token?.substring(0, 10) + '...');
    console.log('Request data:', data);
    
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data),
      credentials: 'include' // Include cookies for session management
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    const responseData = await response.json();
    
    if (!response.ok) {
      // Handle HTTP errors (4xx, 5xx)
      throw new Error(responseData.message || 'Failed to create rating');
    }

    if (!responseData.success) {
      throw new Error(responseData.message || 'Could not create rating');
    }

    showSuccess("Rating submitted successfully!");
    return true;
  } catch (error) {
    console.error("CREATE RATING API ERROR:", error);
    showError(error.message || 'Failed to submit rating. Please try again.');
    return false;
  } finally {
    dismissToast(toastId);
  }
}

// Fetch all ratings and reviews
export const getAllReviews = async () => {
  const toastId = showLoading("Loading reviews...")
  try {
    const response = await fetch(GET_REVIEWS_API, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });

    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(responseData.message || 'Failed to fetch reviews');
    }

    if (!responseData.success) {
      throw new Error(responseData.message || 'Could not fetch reviews');
    }
    return response?.data?.data || []
  } catch (error) {
    console.log("GET_REVIEWS_API ERROR............", error)
    showError(error.message || "Failed to load reviews")
    return []
  } finally {
    dismissToast(toastId)
  }
}

export const getCatalogPageData = async (subCategoryId) => {
  let result = null;
  try {
    const response = await apiConnector("POST", subCategory.SUBCATEGORY_PAGE_DETAILS_API, { subCategoryId });
    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could not fetch catalog page data");
    }
    result = response.data;
  } catch (error) {
    console.log("SUBCATEGORY_PAGE_DETAILS_API ERROR............", error);
    result = { success: false, message: error.message };
  }
  return result;
}
