import { apiConnector } from "../apiConnector";
import { toast } from "react-hot-toast";

const PAYMENT_API = {
  GET_PAID_FEES: "/api/v1/university/payments",  // Updated to match backend route
  GET_PAYMENT_DETAILS: (paymentId) => `/api/v1/university/payments/${paymentId}`,
  GET_STUDENT_PAYMENTS: (studentId) => `/api/v1/university/payments/student/${studentId}`,
};

export async function getPaidFees(token, filters = {}) {
  const toastId = toast.loading("Loading payment records...");
  try {
    // Transform the filters to match your backend API
    const queryParams = new URLSearchParams();
    
    // Add pagination
    if (filters.page) queryParams.append('page', filters.page);
    if (filters.limit) queryParams.append('limit', filters.limit);
    
    // Add search term if provided
    if (filters.search) queryParams.append('search', filters.search);
    
    // Add date range if provided
    if (filters.startDate) queryParams.append('startDate', new Date(filters.startDate).toISOString());
    if (filters.endDate) queryParams.append('endDate', new Date(filters.endDate).toISOString());
    
    // Build the URL with query parameters
    const url = `${PAYMENT_API.GET_PAID_FEES}?${queryParams.toString()}`;
    
    console.log('Fetching payments from:', url); // Debug log
    
    const response = await apiConnector(
      "GET",
      url,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    console.log('API Response:', response); // Debug log

    if (!response.data || !response.data.success) {
      throw new Error(response.data?.message || 'Failed to fetch payment records');
    }

    // Transform the response data to match the expected format
    const payments = Array.isArray(response.data.data) ? response.data.data : [];
    
    toast.success(`Loaded ${payments.length} payment records`);
    return {
      success: true,
      data: {
        payments: payments,
        total: response.data.total || payments.length,
        page: parseInt(filters.page) || 1,
        limit: parseInt(filters.limit) || 10,
      },
      message: response.data.message || 'Payment records fetched successfully'
      pagination: response.data.pagination,
    };
  } catch (error) {
    console.error("GET_PAID_FEES_API_ERROR", error);
    toast.error(
      error.response?.data?.message || "Failed to fetch payment records"
    );
    return {
      success: false,
      error: error.message,
    };
  } finally {
    toast.dismiss(toastId);
  }
}

export async function getPaymentDetails(paymentId, token) {
  try {
    const response = await apiConnector(
      "GET",
      PAYMENT_API.GET_PAYMENT_DETAILS(paymentId),
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    console.error("GET_PAYMENT_DETAILS_API_ERROR", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function getStudentPayments(studentId, token) {
  try {
    const response = await apiConnector(
      "GET",
      PAYMENT_API.GET_STUDENT_PAYMENTS(studentId),
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    console.error("GET_STUDENT_PAYMENTS_API_ERROR", error);
    return {
      success: false,
      error: error.message,
    };
  }
}
