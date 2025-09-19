import { apiConnector } from '../apiConnector';
import { endpoints } from '../api';

export const getStudentFees = async (token) => {
  try {
    const response = await apiConnector(
      'GET',
      endpoints.GET_STUDENT_FEES,
      null,
      {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching student fees:', error);
    throw error;
  }
};

// Add more fee-related API calls as needed
export const initiatePayment = async (feeId, token) => {
  try {
    const response = await apiConnector(
      'POST',
      endpoints.INITIATE_PAYMENT,
      { feeId },
      {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error initiating payment:', error);
    throw error;
  }
};
