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
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-6">
        {isEditMode ? 'Edit Leave Request' : 'Submit Leave Request'}
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white px-4 py-5 sm:p-6">
          <div className="grid grid-cols-6 gap-6">
            {/* Exam Session */}
            <div>
              <label htmlFor="examSession" className="block text-sm font-medium text-gray-700">
                Exam Session / Term
              </label>
              <input
                type="text"
                id="examSession"
                {...register('examSession', { 
                  required: 'Please enter the exam session or term',
                  minLength: {
                    value: 3,
                    message: 'Session name must be at least 3 characters'
                  },
                  maxLength: {
                    value: 100,
                    message: 'Session name is too long'
                  }
                })}
                className={`mt-1 block w-full py-2 px-3 border ${
                  errors.examSession ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              />
              {errors.examSession && (
                <p className="mt-1 text-sm text-red-600">{errors.examSession.message}</p>
              )}
            </div>

            {/* Leave Type */}
            <div className="col-span-6 sm:col-span-3">
              <label htmlFor="leaveType" className="block text-sm font-medium text-gray-700">
                Leave Type <span className="text-red-500">*</span>
              </label>
              <select
                id="leaveType"
                {...register('leaveType', { required: 'Please select a leave type' })}
                className={`mt-1 block w-full py-2 px-3 border ${
                  errors.leaveType ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              >
                <option value="Sick Leave">Sick Leave</option>
                <option value="Personal Leave">Personal Leave</option>
                <option value="Family Emergency">Family Emergency</option>
                <option value="Other">Other</option>
              </select>
              {errors.leaveType && (
                <p className="mt-1 text-sm text-red-600">{errors.leaveType.message}</p>
              )}
            </div>

            {/* Start Date */}
            <div className="col-span-6 sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                {...register('startDate', { 
                  required: 'Start date is required',
                  min: { value: today, message: 'Start date cannot be in the past' }
                })}
                min={today}
                className={`mt-1 block w-full py-2 px-3 border ${
                  errors.startDate ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
              )}
            </div>

            {/* End Date */}
            <div className="col-span-6 sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                {...register('endDate', { 
                  required: 'End date is required',
                  validate: value => 
                    value >= watch('startDate') || 'End date must be after start date'
                })}
                min={watch('startDate') || today}
                className={`mt-1 block w-full py-2 px-3 border ${
                  errors.endDate ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                disabled={loading || !watch('startDate')}
              />
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
              )}
            </div>

            {/* Reason */}
            <div className="col-span-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Leave <span className="text-red-500">*</span>
                <span className="text-gray-500 text-xs ml-1">(Minimum 20 characters)</span>
              </label>
              <textarea
                {...register('reason', { 
                  required: 'Reason is required',
                  minLength: { 
                    value: 20, 
                    message: 'Reason must be at least 20 characters long' 
                  }
                })}
                rows={4}
                className={`mt-1 block w-full py-2 px-3 border ${
                  errors.reason ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              />
              {errors.reason && (
                <p className="mt-1 text-sm text-red-600">{errors.reason.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
              loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isEditMode ? 'Updating...' : 'Submitting...'}
              </>
            ) : isEditMode ? (
              'Update Leave Request'
            ) : (
              'Submit Leave Request'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LeaveRequestForm;
