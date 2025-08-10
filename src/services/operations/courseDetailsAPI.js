import { toast } from "react-hot-toast"

import { setCourseSectionData, setEntireCourseData, setTotalNoOfLectures, setCompletedLectures, updateCompletedLectures } from "../../store/slices/viewCourseSlice";
// import { setLoading } from "../../slices/profileSlice";
import { apiConnector } from "../apiConnector"
import { course } from "../apis";
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
  DELETE_COURSE_API,
  GET_FULL_COURSE_DETAILS_AUTHENTICATED,
  CREATE_RATING_API,
  LECTURE_COMPLETION_API,
} = course

console.log('GET_COURSE_DETAILS_API:', GET_COURSE_DETAILS_API);
console.log('Available course APIs:', Object.keys(course));


let toastId = null; // Module-level variable to track the toast ID
let isLoading = false; // Flag to track loading state

export const getAllCourses = async () => {
  const toastId = toast.loading("Loading...")
  let result = []
  try {
    const response = await apiConnector("GET", GET_ALL_COURSES_API)
    if (!response?.data?.success) {
      throw new Error("Could Not Fetch Courses")
    }
    result = response?.data?.data
  } catch (error) {
    console.log("GET_ALL_COURSES_API API ERROR............", error)
    toast.error(error.message)
  }
  toast.dismiss(toastId)
  return result
}

export const fetchCourseDetails = async (courseId) => {
  const toastId = toast.loading("Loading...")
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
  toast.dismiss(toastId)
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
    toast.error(error.message)
  }
  return result
}



// add the course details
export const addCourseDetails = async (data, token) => {
  let result = null
  const toastId = toast.loading("Loading...")
  try {
    const response = await apiConnector("POST", CREATE_COURSE_API, data, {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    })
    console.log("CREATE COURSE API RESPONSE............", response)
    if (!response?.data?.success) {
      throw new Error("Could Not Add Course Details")
    }
    toast.success("Course Details Added Successfully")
    result = response?.data?.data
  } catch (error) {
    console.log("CREATE COURSE API ERROR............", error)
    toast.error(error.message)
  }
  toast.dismiss(toastId)
  return result
}

// edit the course details
export const editCourseDetails = async (data, token) => {
  let result = null
  const toastId = toast.loading("Loading...")
  try {
    const response = await apiConnector("POST", EDIT_COURSE_API, data, {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    })
    console.log("EDIT COURSE API RESPONSE............", response)
    if (!response?.data?.success) {
      throw new Error("Could Not Update Course Details")
    }
    toast.success("Course Details Updated Successfully")
    result = response?.data?.data
  } catch (error) {
    console.log("EDIT COURSE API ERROR............", error)
    toast.error(error.message)
  }
  toast.dismiss(toastId)
  return result
}

// create a section
export const createSection = async (data, token) => {
  let result = null

  const toastId = toast.loading("Loading...")
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
    toast.success("Course Section Created")
    result = response?.data?.updatedCourse
  } catch (error) {
    console.log("CREATE SECTION API ERROR............", error)
    toast.error(error.message)
  }
  toast.dismiss(toastId)
  return result
}

// create a subsection
export const createSubSection = async (data, token) => {
  let result = null
  const toastId = toast.loading("Loading...")
  try {
    const response = await apiConnector("POST", CREATE_SUBSECTION_API, data, {
      Authorization: `Bearer ${token}`,
    })
    console.log("CREATE SUB-SECTION API RESPONSE............", response)
    if (!response?.data?.success) {
      throw new Error("Could Not Add Lecture")
    }
    toast.success("Lecture Added")
    result = response?.data?.data
  } catch (error) {
    console.log("CREATE SUB-SECTION API ERROR............", error)
    toast.error(error.message)
  }
  toast.dismiss(toastId)
  return result
}

// update a section
export const updateSection = async (data, token) => {
  let result = null
  const toastId = toast.loading("Loading...")
  try {
    const response = await apiConnector("POST", UPDATE_SECTION_API, data, {
      Authorization: `Bearer ${token}`,
    })
    console.log("UPDATE SECTION API RESPONSE............", response)
    if (!response?.data?.success) {
      throw new Error("Could Not Update Section")
    }
    toast.success("Course Section Updated")
    result = response?.data?.data
  } catch (error) {
    console.log("UPDATE SECTION API ERROR............", error)
    toast.error(error.message)
  }
  toast.dismiss(toastId)
  return result
}

// update a subsection
export const updateSubSection = async (data, token) => {
  let result = null
  const toastId = toast.loading("Loading...")
  try {
    const response = await apiConnector("POST", UPDATE_SUBSECTION_API, data, {
      Authorization: `Bearer ${token}`,
    })
    console.log("UPDATE SUB-SECTION API RESPONSE............", response)
    if (!response?.data?.success) {
      throw new Error("Could Not Update Lecture")
    }
    toast.success("Lecture Updated")
    result = response?.data?.data
  } catch (error) {
    console.log("UPDATE SUB-SECTION API ERROR............", error)
    toast.error(error.message)
  }
  toast.dismiss(toastId)
  return result
}

// delete a section
export const deleteSection = async (data, token) => {
  let result = null
  const toastId = toast.loading("Loading...")
  try {
    const response = await apiConnector("POST", DELETE_SECTION_API, data, {
      Authorization: `Bearer ${token}`,
    })
    console.log("DELETE SECTION API RESPONSE............", response)
    if (!response?.data?.success) {
      throw new Error("Could Not Delete Section")
    }
    toast.success("Course Section Deleted")
    result = response?.data?.data
  } catch (error) {
    console.log("DELETE SECTION API ERROR............", error)
    toast.error(error.message)
  }
  toast.dismiss(toastId)
  return result
}
// delete a subsection
export const deleteSubSection = async (data, token) => {
  let result = null
  const toastId = toast.loading("Loading...")
  try {
    const response = await apiConnector("POST", DELETE_SUBSECTION_API, data, {
      Authorization: `Bearer ${token}`,
    })
    console.log("DELETE SUB-SECTION API RESPONSE............", response)
    if (!response?.data?.success) {
      throw new Error("Could Not Delete Lecture")
    }
    toast.success("Lecture Deleted")
    result = response?.data?.data
  } catch (error) {
    console.log("DELETE SUB-SECTION API ERROR............", error)
    toast.error(error.message)
  }
  toast.dismiss(toastId)
  return result
}



export const fetchInstructorCourses = async (token) => {
  // Check if a loading toast is already displayed
  if (!isLoading) {
    isLoading = true; // Set loading state to true
    toastId = toast.loading("Loading..."); // Show loading toast
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
    if (toastId) {
      toast.update(toastId, {
        render: error.message || "Could Not Fetch Instructor Courses",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  } finally {
    // Dismiss the loading toast and reset state
    if (toastId) {
      toast.dismiss(toastId);
      toastId = null; // Reset toastId after dismissal
    }
    isLoading = false; // Reset loading state
  }

  return result;
}

// delete a course
export const deleteCourse = async (data, token) => {
  const toastId = toast.loading("Loading...")
  try {
    const response = await apiConnector("DELETE", DELETE_COURSE_API, data, {
      Authorization: `Bearer ${token}`,
    })
    console.log("DELETE COURSE API RESPONSE............", response)
    if (!response?.data?.success) {
      throw new Error("Could Not Delete Course")
    }
    toast.success("Course Deleted")
  } catch (error) {
    console.log("DELETE COURSE API ERROR............", error)
    toast.error(error.message)
  }
  toast.dismiss(toastId)
}

export const getFullDetailsOfCourse = async (courseId) => {
  let toastId;
  try {
    toastId = toast.loading("Loading course details...");

    const response = await apiConnector(
      "POST",
      "/api/v1/course/getFullCourseDetails",
      { courseId } // ✅ pass the real courseId
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to load course details");
    }

    toast.dismiss(toastId);
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    if (toastId) toast.dismiss(toastId);

    if (error.response?.status === 401) {
      toast.error("Please login to view this course");
      return { success: false, requiresLogin: true };
    }

    toast.error(error.message || "Failed to load course details");
    return {
      success: false,
      message: error.message,
    };
  }
};


// export const getFullDetailsOfCourse = async (courseId) => {
//   // Initialize loading state
//   let toastId;
//   try {
//     toastId = toast.loading("Loading course details...");
    
//     // Try to get valid token
//     let token = localStorage.getItem('token');
//     let refreshAttempted = false;
    
//     // First attempt
//     const response = await apiConnector(
//       "POST",
//       "/api/v1/course/getFullCourseDetails",
//       { courseId }
//     );
    
//     if (!response.data?.success) {
//       throw new Error(response.data?.message || "Failed to load course details");
//     }

//     toast.dismiss(toastId);
//     return {
//       success: true,
//       data: response.data.data
//     };
    
//   } catch (error) {
//     console.error("Course details error:", error);
//     if (toastId) {
//       toast.dismiss(toastId);
//       toast.error(error.message);
//     }
    
//     // Special handling for auth failures
//     if (error.response?.status === 401) {
//       toast.error("Please login to view this course");
//       return { 
//         success: false, 
//         requiresLogin: true,
//         message: "Please login to view this course"
//       };
//     }
//      toast.error(error.message || "Failed to load course details");
//     return {
//       success: false,
//       message: error.message
//     };
//   }
// };

// Helper function for authenticated requests

// export const getFullDetailsOfCourse = async (courseId, token) => {
//   // Check if a loading toast is already displayed
//   if (!isLoading) {
//     isLoading = true; // Set loading state to true
//     toastId = toast.loading("Loading..."); // Show loading toast
//   }

//   let result = null;
//   try {
    
//     if(!token){
//       console.error("No token available - redirecting to login");
//     }
  
//     console.log("Sending request with token:", token); // Add this
//     const response = await apiConnector(
//       "POST",
//       GET_FULL_COURSE_DETAILS_AUTHENTICATED,
//       { courseId },
//       { Authorization: `Bearer ${token}` }
//     );

//     console.log("COURSE_FULL_DETAILS_API API RESPONSE............", response);

//     if (!response.data.success) {
//       throw new Error(response.data.message);
//     }
//     result = response.data; // <-- Return the whole response.data object
//   } catch (error) {
//     console.log("COURSE_FULL_DETAILS_API API ERROR............", error);
//     result = error.response?.data || { success: false, message: error.message };
//     // Optionally show an error toast
//     if (toastId) {
//       toast.update(toastId, {
//         render: "Error fetching course details",
//         type: "error",
//         isLoading: false,
//         autoClose: 3000,
//       });
//     }
//   } finally {
//     // Dismiss the loading toast and reset state
//     if (toastId) {
//       toast.dismiss(toastId);
//       toastId = null; // Reset toastId after dismissal
//     }
//     isLoading = false; // Reset loading state
//   }

//   return result;
// }

// mark a lecture as complete


// export const getFullDetailsOfCourse = async (courseId, token) => {
//   // Initialize loading state
//   if (!isLoading) {
//     isLoading = true;
//     try {
//       toastId = toast.loading("Loading...");
//     } catch (toastError) {
//       console.warn("Toast initialization error:", toastError);
//     }
//   }

//   let result = null;
//   let shouldRetry = false;
//   let newToken = token;

//   try {
//     // Validate token presence
//     if (!newToken) {
//       console.warn("Initial token not provided - attempting refresh");
//       shouldRetry = true;
//       throw new Error("No initial token provided");
//     }

//     // First API attempt
//     console.log("Initial request with token:", newToken ? "*****" + newToken.slice(-5) : "null");
//     let response = await apiConnector(
//       "POST",
//       GET_FULL_COURSE_DETAILS_AUTHENTICATED,
//       { courseId },
//       { Authorization: `Bearer ${newToken}` }
//     );

//     // Handle authorization failures
//     if (response.status === 401 || response.data?.message?.toLowerCase().includes("unauthorized")) {
//       console.warn("Authorization failed - attempting token refresh");
//       shouldRetry = true;
//       throw new Error("Authorization failed");
//     }

//     // Validate response structure
//     if (!response.data?.success) {
//       throw new Error(response.data?.message || "Invalid API response structure");
//     }

//     console.log("API RESPONSE:", response.data);
//     result = response.data;

//   } catch (error) {
//     console.error("API Error Phase:", error.message);

//     // Token refresh logic
//     if (shouldRetry) {
//       try {
//         console.log("Attempting token refresh...");
//         const refreshResponse = await refreshToken();
        
//         if (!refreshResponse?.data?.accessToken) {
//           throw new Error("Refresh token missing in response");
//         }

//         newToken = refreshResponse.data.accessToken;
//         console.log("Token refresh successful, retrying with new token");
        
//         // Retry with new token
//         const retryResponse = await apiConnector(
//           "POST",
//           GET_FULL_COURSE_DETAILS_AUTHENTICATED,
//           { courseId },
//           { Authorization: `Bearer ${newToken}` }
//         );

//         if (!retryResponse.data?.success) {
//           throw new Error(retryResponse.data?.message || "Retry request failed");
//         }

//         result = retryResponse.data;
//       } catch (refreshError) {
//         console.error("Token refresh failed:", refreshError);
        
//         // Safe toast update
//         if (typeof toast.update === 'function' && toastId) {
//           toast.update(toastId, {
//             render: "Session expired - Please login again",
//             type: "error",
//             isLoading: false,
//             autoClose: 3000,
//           });
//         } else {
//           toast.error("Session expired - Please login again", { autoClose: 3000 });
//         }
        
//         // Return error without redirecting (let component handle it)
//         result = { 
//           success: false, 
//           message: "Authentication required",
//           requiresLogin: true
//         };
//       }
//     } else {
//       // Non-token related error
//       console.error("API Request Failed:", error);
//       result = {
//         success: false,
//         message: error.response?.data?.message || error.message || "Failed to fetch course details",
//         error: error
//       };
      
//       // Safe error toast
//       if (typeof toast.update === 'function' && toastId) {
//         toast.update(toastId, {
//           render: result.message,
//           type: "error",
//           isLoading: false,
//           autoClose: 3000,
//         });
//       } else {
//         toast.error(result.message, { autoClose: 3000 });
//       }
//     }
//   } finally {
//     // Cleanup
//     if (toastId && typeof toast.dismiss === 'function') {
//       toast.dismiss(toastId);
//     }
//     isLoading = false;
//     toastId = null;
//   }

//   return result;
// };


export const markLectureAsComplete = async (data, token) => {
  let result = null
  console.log("mark complete data", data)
  const toastId = toast.loading("Loading...")
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
    toast.success("Lecture Completed")
    result = true
  } catch (error) {
    console.log("MARK_LECTURE_AS_COMPLETE_API API ERROR............", error)
    toast.error(error.message)
    result = false
  }
  toast.dismiss(toastId)
  return result
}

// create a rating for course
export const createRating = async (data, token) => {
  const toastId = toast.loading("Loading...")
  let success = false
  try {
    const response = await apiConnector("POST", CREATE_RATING_API, data, {
      Authorization: `Bearer ${token}`,
    })
    console.log("CREATE RATING API RESPONSE............", response)
    if (!response?.data?.success) {
      throw new Error("Could Not Create Rating")
    }
    toast.success("Rating Created")
    success = true
  } catch (error) {
    success = false
    console.log("CREATE RATING API ERROR............", error)
    toast.error(error.message)
  }
  toast.dismiss(toastId)
  return success
}

export const getCatalogPageData = async (categoryId) => {
  let result = null;
  try {
    const response = await apiConnector("POST", course.CATEGORY_PAGE_DETAILS_API, { categoryId });
    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could not fetch catalog page data");
    }
    result = response.data;
  } catch (error) {
    console.log("CATEGORY_PAGE_DETAILS_API ERROR............", error);
    result = { success: false, message: error.message };
  }
  return result;
}
