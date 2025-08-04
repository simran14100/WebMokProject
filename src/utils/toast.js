import { toast } from 'react-hot-toast';

// Custom toast configurations
const toastConfig = {
  success: {
    style: {
      background: 'linear-gradient(135deg, #07A698 0%, #059a8c 100%)',
      color: '#ffffff',
      border: '1px solid #07A698',
      boxShadow: '0 20px 25px -5px rgba(7, 166, 152, 0.2), 0 10px 10px -5px rgba(7, 166, 152, 0.1)',
      borderRadius: '16px',
      fontFamily: 'Poppins, sans-serif',
      fontSize: '14px',
      fontWeight: '500',
      padding: '16px 20px',
      lineHeight: '1.5',
    },
    iconTheme: {
      primary: '#ffffff',
      secondary: '#07A698',
    },
    duration: 4000,
  },
  error: {
    style: {
      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      color: '#ffffff',
      border: '1px solid #ef4444',
      boxShadow: '0 20px 25px -5px rgba(239, 68, 68, 0.2), 0 10px 10px -5px rgba(239, 68, 68, 0.1)',
      borderRadius: '16px',
      fontFamily: 'Poppins, sans-serif',
      fontSize: '14px',
      fontWeight: '500',
      padding: '16px 20px',
      lineHeight: '1.5',
    },
    iconTheme: {
      primary: '#ffffff',
      secondary: '#ef4444',
    },
    duration: 5000,
  },
  loading: {
    style: {
      background: 'linear-gradient(135deg, #07A698 0%, #059a8c 100%)',
      color: '#ffffff',
      border: '1px solid #07A698',
      boxShadow: '0 20px 25px -5px rgba(7, 166, 152, 0.2), 0 10px 10px -5px rgba(7, 166, 152, 0.1)',
      borderRadius: '16px',
      fontFamily: 'Poppins, sans-serif',
      fontSize: '14px',
      fontWeight: '500',
      padding: '16px 20px',
      lineHeight: '1.5',
    },
    iconTheme: {
      primary: '#ffffff',
      secondary: '#07A698',
    },
  },
  info: {
    style: {
      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      color: '#ffffff',
      border: '1px solid #3b82f6',
      boxShadow: '0 20px 25px -5px rgba(59, 130, 246, 0.2), 0 10px 10px -5px rgba(59, 130, 246, 0.1)',
      borderRadius: '16px',
      fontFamily: 'Poppins, sans-serif',
      fontSize: '14px',
      fontWeight: '500',
      padding: '16px 20px',
      lineHeight: '1.5',
    },
    iconTheme: {
      primary: '#ffffff',
      secondary: '#3b82f6',
    },
    duration: 4000,
  },
  warning: {
    style: {
      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      color: '#ffffff',
      border: '1px solid #f59e0b',
      boxShadow: '0 20px 25px -5px rgba(245, 158, 11, 0.2), 0 10px 10px -5px rgba(245, 158, 11, 0.1)',
      borderRadius: '16px',
      fontFamily: 'Poppins, sans-serif',
      fontSize: '14px',
      fontWeight: '500',
      padding: '16px 20px',
      lineHeight: '1.5',
    },
    iconTheme: {
      primary: '#ffffff',
      secondary: '#f59e0b',
    },
    duration: 4000,
  },
};

// Track active toasts to prevent duplicates
const activeToasts = new Set();

// Helper function to prevent duplicate toasts
const preventDuplicateToast = (message, toastType) => {
  const toastKey = `${toastType}:${message}`;
  if (activeToasts.has(toastKey)) {
    console.log(`Duplicate toast prevented: ${toastKey}`);
    return null;
  }
  
  activeToasts.add(toastKey);
  console.log(`Toast added to tracking: ${toastKey}`);
  return toastKey;
};

// Helper function to remove toast from tracking
const removeFromTracking = (toastKey, duration) => {
  setTimeout(() => {
    activeToasts.delete(toastKey);
    console.log(`Toast removed from tracking: ${toastKey}`);
  }, duration || 4000);
};

// Custom toast functions
export const showSuccess = (message) => {
  const toastKey = preventDuplicateToast(message, 'success');
  if (!toastKey) return;
  
  const toastId = toast.success(message, toastConfig.success);
  removeFromTracking(toastKey, toastConfig.success.duration);
  
  return toastId;
};

export const showError = (message) => {
  const toastKey = preventDuplicateToast(message, 'error');
  if (!toastKey) return;
  
  const toastId = toast.error(message, toastConfig.error);
  removeFromTracking(toastKey, toastConfig.error.duration);
  
  return toastId;
};

export const showLoading = (message) => {
  const toastKey = preventDuplicateToast(message, 'loading');
  if (!toastKey) return;
  
  const toastId = toast.loading(message, toastConfig.loading);
  removeFromTracking(toastKey, 5000); // Loading toasts typically last longer
  
  return toastId;
};

export const showInfo = (message) => {
  const toastKey = preventDuplicateToast(message, 'info');
  if (!toastKey) return;
  
  const toastId = toast(message, toastConfig.info);
  removeFromTracking(toastKey, toastConfig.info.duration);
  
  return toastId;
};

export const showWarning = (message) => {
  const toastKey = preventDuplicateToast(message, 'warning');
  if (!toastKey) return;
  
  const toastId = toast(message, toastConfig.warning);
  removeFromTracking(toastKey, toastConfig.warning.duration);
  
  return toastId;
};

// Dismiss toast by ID
export const dismissToast = (toastId) => {
  toast.dismiss(toastId);
};

// Dismiss all toasts
export const dismissAllToasts = () => {
  toast.dismiss();
  // Clear all active toast tracking
  activeToasts.clear();
  console.log("All toasts dismissed and tracking cleared");
};

// Custom toast with custom styling
export const showCustomToast = (message, type = 'default', customConfig = {}) => {
  const baseConfig = {
    style: {
      background: '#ffffff',
      color: '#191A1F',
      borderRadius: '16px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      border: '1px solid #e0e0e0',
      fontFamily: 'Poppins, sans-serif',
      fontSize: '14px',
      fontWeight: '500',
      padding: '16px 20px',
      lineHeight: '1.5',
    },
    duration: 4000,
  };

  const finalConfig = { ...baseConfig, ...customConfig };

  switch (type) {
    case 'success':
      return toast.success(message, { ...toastConfig.success, ...finalConfig });
    case 'error':
      return toast.error(message, { ...toastConfig.error, ...finalConfig });
    case 'loading':
      return toast.loading(message, { ...toastConfig.loading, ...finalConfig });
    case 'info':
      return toast(message, { ...toastConfig.info, ...finalConfig });
    case 'warning':
      return toast(message, { ...toastConfig.warning, ...finalConfig });
    default:
      return toast(message, finalConfig);
  }
};

export default {
  showSuccess,
  showError,
  showLoading,
  showInfo,
  showWarning,
  dismissToast,
  dismissAllToasts,
  showCustomToast,
}; 