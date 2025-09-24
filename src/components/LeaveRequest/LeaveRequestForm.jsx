import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useSelector } from 'react-redux';

const LeaveRequestForm = ({ onSuccess, onCancel, initialData = null }) => {
  // Get token from Redux store
  const { token } = useSelector(state => state.auth) || {};
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    watch, 
    setValue,
    reset
  } = useForm({
    defaultValues: initialData || {
      examSession: '',
      leaveType: 'Sick Leave',
      reason: '',
      startDate: '',
      endDate: ''
    }
  });

  // Set form values when initialData changes
  React.useEffect(() => {
    if (initialData) {
      Object.entries(initialData).forEach(([key, value]) => {
        if (value) setValue(key, value);
      });
    }
  }, [initialData, setValue]);
  
  const today = new Date().toISOString().split('T')[0];
  const startDate = watch('startDate');

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError('');

      const API_BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:4000';
      
      // Prepare the request data
      const requestData = {
        examSession: data.examSession,
        leaveType: data.leaveType,
        reason: data.reason,
        startDate: data.startDate,
        endDate: data.endDate
      };

      let response;
      if (initialData && initialData._id) {
        // Update existing request
        response = await fetch(`${API_BASE_URL}/api/v1/leave-requests/${initialData._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(requestData)
        });
      } else {
        // Create new request
        response = await fetch(`${API_BASE_URL}/api/v1/leave-requests`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(requestData)
        });
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit leave request');
      }

      toast.success('Leave request submitted successfully!');
      if (onSuccess) onSuccess(result.data);
      
    } catch (err) {
      console.error('Error submitting leave request:', err);
      setError(err.response?.data?.message || 'Failed to submit leave request');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-2 text-gray-600">Submitting your request...</p>
      </div>
    );
  }

  const isEditMode = !!initialData?._id;

  return (
  
<div
  style={{
    backgroundColor: "white",
    padding: "24px",
    borderRadius: "8px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    border: "1px solid #0C4DA2",
  }}
>
  <h2
    style={{
      fontSize: "20px",
      fontWeight: "600",
      marginBottom: "24px",
      color: "#0C4DA2",
    }}
  >
    {isEditMode ? "Edit Leave Request" : "Submit Leave Request"}
  </h2>

  <form onSubmit={handleSubmit(onSubmit)}>
    <div
      style={{
        backgroundColor: "#F9FAFB",
        padding: "20px",
        borderRadius: "6px",
        marginBottom: "24px",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
          gap: "16px",
        }}
      >
        {/* Exam Session */}
        <div style={{ gridColumn: "span 6 / span 6" }}>
          <label
            htmlFor="examSession"
            style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "500",
              color: "#0C4DA2",
              marginBottom: "6px",
            }}
          >
            Exam Session / Term
          </label>
          <input
            type="text"
            id="examSession"
            {...register("examSession", {
              required: "Please enter the exam session or term",
            })}
            style={{
              width: "100%",
              padding: "8px 12px",
              border: errors.examSession
                ? "1px solid #f87171"
                : "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "14px",
              outline: "none",
            }}
            onFocus={(e) =>
              (e.target.style.border = "1px solid #0C4DA2")
            }
            onBlur={(e) =>
              (e.target.style.border = errors.examSession
                ? "1px solid #f87171"
                : "1px solid #d1d5db")
            }
          />
          {errors.examSession && (
            <p style={{ marginTop: "4px", fontSize: "13px", color: "#dc2626" }}>
              {errors.examSession.message}
            </p>
          )}
        </div>

        {/* Leave Type */}
        <div style={{ gridColumn: "span 3 / span 3" }}>
          <label
            htmlFor="leaveType"
            style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "500",
              color: "#0C4DA2",
              marginBottom: "6px",
            }}
          >
            Leave Type <span style={{ color: "#F58220" }}>*</span>
          </label>
          <select
            id="leaveType"
            {...register("leaveType", {
              required: "Please select a leave type",
            })}
            style={{
              width: "100%",
              padding: "8px 12px",
              border: errors.leaveType
                ? "1px solid #f87171"
                : "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "14px",
              outline: "none",
            }}
            onFocus={(e) =>
              (e.target.style.border = "1px solid #0C4DA2")
            }
            onBlur={(e) =>
              (e.target.style.border = errors.leaveType
                ? "1px solid #f87171"
                : "1px solid #d1d5db")
            }
          >
            <option value="Sick Leave">Sick Leave</option>
            <option value="Personal Leave">Personal Leave</option>
            <option value="Family Emergency">Family Emergency</option>
            <option value="Other">Other</option>
          </select>
          {errors.leaveType && (
            <p style={{ marginTop: "4px", fontSize: "13px", color: "#dc2626" }}>
              {errors.leaveType.message}
            </p>
          )}
        </div>

        {/* Start Date */}
        <div style={{ gridColumn: "span 3 / span 3" }}>
          <label
            style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "500",
              color: "#0C4DA2",
              marginBottom: "6px",
            }}
          >
            Start Date <span style={{ color: "#F58220" }}>*</span>
          </label>
          <input
            type="date"
            {...register("startDate", {
              required: "Start date is required",
            })}
            min={today}
            style={{
              width: "100%",
              padding: "8px 12px",
              border: errors.startDate
                ? "1px solid #f87171"
                : "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "14px",
              outline: "none",
            }}
            onFocus={(e) =>
              (e.target.style.border = "1px solid #0C4DA2")
            }
            onBlur={(e) =>
              (e.target.style.border = errors.startDate
                ? "1px solid #f87171"
                : "1px solid #d1d5db")
            }
          />
          {errors.startDate && (
            <p style={{ marginTop: "4px", fontSize: "13px", color: "#dc2626" }}>
              {errors.startDate.message}
            </p>
          )}
        </div>

        {/* End Date */}
        <div style={{ gridColumn: "span 3 / span 3" }}>
          <label
            style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "500",
              color: "#0C4DA2",
              marginBottom: "6px",
            }}
          >
            End Date <span style={{ color: "#F58220" }}>*</span>
          </label>
          <input
            type="date"
            {...register("endDate", {
              required: "End date is required",
            })}
            min={watch("startDate") || today}
            style={{
              width: "100%",
              padding: "8px 12px",
              border: errors.endDate
                ? "1px solid #f87171"
                : "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "14px",
              outline: "none",
            }}
            onFocus={(e) =>
              (e.target.style.border = "1px solid #0C4DA2")
            }
            onBlur={(e) =>
              (e.target.style.border = errors.endDate
                ? "1px solid #f87171"
                : "1px solid #d1d5db")
            }
          />
          {errors.endDate && (
            <p style={{ marginTop: "4px", fontSize: "13px", color: "#dc2626" }}>
              {errors.endDate.message}
            </p>
          )}
        </div>

        {/* Reason */}
        <div style={{ gridColumn: "span 6 / span 6" }}>
          <label
            style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "500",
              color: "#0C4DA2",
              marginBottom: "6px",
            }}
          >
            Reason for Leave <span style={{ color: "#F58220" }}>*</span>
            <span style={{ color: "#6b7280", fontSize: "12px", marginLeft: "4px" }}>
              (Minimum 20 characters)
            </span>
          </label>
          <textarea
            {...register("reason", {
              required: "Reason is required",
            })}
            rows={4}
            style={{
              width: "100%",
              padding: "8px 12px",
              border: errors.reason
                ? "1px solid #f87171"
                : "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "14px",
              outline: "none",
            }}
            onFocus={(e) =>
              (e.target.style.border = "1px solid #0C4DA2")
            }
            onBlur={(e) =>
              (e.target.style.border = errors.reason
                ? "1px solid #f87171"
                : "1px solid #d1d5db")
            }
          />
          {errors.reason && (
            <p style={{ marginTop: "4px", fontSize: "13px", color: "#dc2626" }}>
              {errors.reason.message}
            </p>
          )}
        </div>
      </div>
    </div>

    {/* Form Actions */}
    <div
      style={{
        padding: "12px 16px",
        backgroundColor: "#F9FAFB",
        textAlign: "right",
        borderRadius: "6px",
      }}
    >
      <button
        type="button"
        onClick={onCancel}
        disabled={loading}
        style={{
          padding: "8px 16px",
          border: "1px solid #0C4DA2",
          fontSize: "14px",
          borderRadius: "6px",
          color: "#0C4DA2",
          backgroundColor: "white",
          cursor: "pointer",
          marginRight: "12px",
        }}
        onMouseOver={(e) => (e.target.style.backgroundColor = "#EAF4FF")}
        onMouseOut={(e) => (e.target.style.backgroundColor = "white")}
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={loading}
        style={{
          padding: "8px 16px",
          border: "none",
          fontSize: "14px",
          borderRadius: "6px",
          color: "white",
          backgroundColor: loading ? "#4AA3DF" : "#0C4DA2",
          cursor: "pointer",
        }}
        onMouseOver={(e) =>
          !loading && (e.target.style.backgroundColor = "#083C7D")
        }
        onMouseOut={(e) =>
          !loading && (e.target.style.backgroundColor = "#0C4DA2")
        }
      >
        {loading ? (
          <>
            <svg
              style={{
                marginRight: "8px",
                height: "16px",
                width: "16px",
                animation: "spin 1s linear infinite",
              }}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                style={{ opacity: 0.25 }}
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                style={{ opacity: 0.75 }}
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            {isEditMode ? "Updating..." : "Submitting..."}
          </>
        ) : isEditMode ? (
          "Update Leave Request"
        ) : (
          "Submit Leave Request"
        )}
      </button>
    </div>
  </form>
</div>
    // <div className="bg-white p-6 rounded-lg shadow-md">
    //   <h2 className="text-xl font-semibold mb-6">
    //     {isEditMode ? 'Edit Leave Request' : 'Submit Leave Request'}
    //   </h2>
    //   <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
    //     <div className="bg-white px-4 py-5 sm:p-6">
    //       <div className="grid grid-cols-6 gap-6">
    //         {/* Exam Session */}
    //         <div>
    //           <label htmlFor="examSession" className="block text-sm font-medium text-gray-700">
    //             Exam Session / Term
    //           </label>
    //           <input
    //             type="text"
    //             id="examSession"
    //             {...register('examSession', { 
    //               required: 'Please enter the exam session or term',
    //               minLength: {
    //                 value: 3,
    //                 message: 'Session name must be at least 3 characters'
    //               },
    //               maxLength: {
    //                 value: 100,
    //                 message: 'Session name is too long'
    //               }
    //             })}
    //             className={`mt-1 block w-full py-2 px-3 border ${
    //               errors.examSession ? 'border-red-300' : 'border-gray-300'
    //             } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
    //           />
    //           {errors.examSession && (
    //             <p className="mt-1 text-sm text-red-600">{errors.examSession.message}</p>
    //           )}
    //         </div>

    //         {/* Leave Type */}
    //         <div className="col-span-6 sm:col-span-3">
    //           <label htmlFor="leaveType" className="block text-sm font-medium text-gray-700">
    //             Leave Type <span className="text-red-500">*</span>
    //           </label>
    //           <select
    //             id="leaveType"
    //             {...register('leaveType', { required: 'Please select a leave type' })}
    //             className={`mt-1 block w-full py-2 px-3 border ${
    //               errors.leaveType ? 'border-red-300' : 'border-gray-300'
    //             } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
    //           >
    //             <option value="Sick Leave">Sick Leave</option>
    //             <option value="Personal Leave">Personal Leave</option>
    //             <option value="Family Emergency">Family Emergency</option>
    //             <option value="Other">Other</option>
    //           </select>
    //           {errors.leaveType && (
    //             <p className="mt-1 text-sm text-red-600">{errors.leaveType.message}</p>
    //           )}
    //         </div>

    //         {/* Start Date */}
    //         <div className="col-span-6 sm:col-span-3">
    //           <label className="block text-sm font-medium text-gray-700 mb-1">
    //             Start Date <span className="text-red-500">*</span>
    //           </label>
    //           <input
    //             type="date"
    //             {...register('startDate', { 
    //               required: 'Start date is required',
    //               min: { value: today, message: 'Start date cannot be in the past' }
    //             })}
    //             min={today}
    //             className={`mt-1 block w-full py-2 px-3 border ${
    //               errors.startDate ? 'border-red-300' : 'border-gray-300'
    //             } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
    //           />
    //           {errors.startDate && (
    //             <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
    //           )}
    //         </div>

    //         {/* End Date */}
    //         <div className="col-span-6 sm:col-span-3">
    //           <label className="block text-sm font-medium text-gray-700 mb-1">
    //             End Date <span className="text-red-500">*</span>
    //           </label>
    //           <input
    //             type="date"
    //             {...register('endDate', { 
    //               required: 'End date is required',
    //               validate: value => 
    //                 value >= watch('startDate') || 'End date must be after start date'
    //             })}
    //             min={watch('startDate') || today}
    //             className={`mt-1 block w-full py-2 px-3 border ${
    //               errors.endDate ? 'border-red-300' : 'border-gray-300'
    //             } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
    //             disabled={loading || !watch('startDate')}
    //           />
    //           {errors.endDate && (
    //             <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
    //           )}
    //         </div>

    //         {/* Reason */}
    //         <div className="col-span-6">
    //           <label className="block text-sm font-medium text-gray-700 mb-1">
    //             Reason for Leave <span className="text-red-500">*</span>
    //             <span className="text-gray-500 text-xs ml-1">(Minimum 20 characters)</span>
    //           </label>
    //           <textarea
    //             {...register('reason', { 
    //               required: 'Reason is required',
    //               minLength: { 
    //                 value: 20, 
    //                 message: 'Reason must be at least 20 characters long' 
    //               }
    //             })}
    //             rows={4}
    //             className={`mt-1 block w-full py-2 px-3 border ${
    //               errors.reason ? 'border-red-300' : 'border-gray-300'
    //             } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
    //           />
    //           {errors.reason && (
    //             <p className="mt-1 text-sm text-red-600">{errors.reason.message}</p>
    //           )}
    //         </div>
    //       </div>
    //     </div>

    //     {/* Form Actions */}
    //     <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
    //       <button
    //         type="button"
    //         onClick={onCancel}
    //         disabled={loading}
    //         className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
    //       >
    //         Cancel
    //       </button>
    //       <button
    //         type="submit"
    //         disabled={loading}
    //         className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
    //           loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
    //         } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
    //       >
    //         {loading ? (
    //           <>
    //             <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    //               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    //               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    //             </svg>
    //             {isEditMode ? 'Updating...' : 'Submitting...'}
    //           </>
    //         ) : isEditMode ? (
    //           'Update Leave Request'
    //         ) : (
    //           'Submit Leave Request'
    //         )}
    //       </button>
    //     </div>
    //   </form>
    // </div>
  );
};

export default LeaveRequestForm;

