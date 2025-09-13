import { message } from 'antd';

// Show success message
export const showSuccess = (msg) => {
  message.success(msg || 'Operation completed successfully');
};

// Show error message
export const showError = (error) => {
  console.error('Error:', error);
  const errorMessage = 
    (error.response && error.response.data && error.response.data.message) ||
    error.message ||
    'An error occurred. Please try again.';
  message.error(errorMessage);
  return errorMessage;
};

// Format date
export const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Format currency
export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Truncate text
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

// Get initials from name
export const getInitials = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

// Convert file to base64
export const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

// Get status color
export const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'active':
    case 'approved':
    case 'completed':
    case 'success':
      return 'green';
    case 'pending':
    case 'in progress':
      return 'orange';
    case 'rejected':
    case 'failed':
    case 'cancelled':
      return 'red';
    default:
      return 'default';
  }
};
