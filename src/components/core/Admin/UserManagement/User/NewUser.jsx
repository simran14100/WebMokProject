import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import DashboardLayout from '../../../../common/DashboardLayout';
import { createUserByAdmin } from '../../../../../services/operations/adminApi';
import { apiConnector } from '../../../../../services/apiConnector';
import { admin } from '../../../../../services/apis';

// Color constants
const ED_TEAL = '#07A698';
const ED_TEAL_DARK = '#059a8c';
const ED_RED = "#EF4444";
const ED_TEAL_LIGHT = '#E6F7F5';
const WHITE = '#FFFFFF';
const GRAY_LIGHT = '#F5F5F5';
const GRAY_DARK = '#333333';

const FormPage = () => {
  const { 
    register, 
    handleSubmit, 
    watch, 
    reset,
    formState: { errors } 
  } = useForm();

  const token = useSelector((state) => state.auth.token);
  const [userTypes, setUserTypes] = useState([]);
  const [loadingUserTypes, setLoadingUserTypes] = useState(false);

  useEffect(() => {
    const fetchUserTypes = async () => {
      setLoadingUserTypes(true);
      try {
        const res = await apiConnector(
          'GET',
          admin.USER_TYPES_API,
          {},
          token ? { Authorization: `Bearer ${token}` } : {}
        );
        // Expecting { success, data: { userTypes: [...] } } or array
        const payload = res.data?.data;
        const list = Array.isArray(payload?.userTypes) ? payload.userTypes : (Array.isArray(payload) ? payload : []);
        setUserTypes(list);
      } catch (e) {
        console.log('FETCH USER TYPES ERROR............', e);
        toast.error(e.response?.data?.message || e.message || 'Failed to fetch user types');
      } finally {
        setLoadingUserTypes(false);
      }
    };
    fetchUserTypes();
  }, [token]);

  const onSubmit = async (form) => {
    // Keep legacy accountType mapping for now; default to Instructor if not provided
    const accountType = form.accountType || 'Instructor';

    // Validate userTypeId if list is present
    const userTypeId = form.userTypeId || '';
    if (!userTypeId) {
      toast.error('Please select a User Type');
      return;
    }

    try {
      await createUserByAdmin({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        confirmPassword: form.confirmPassword,
        accountType,
        userTypeId,
      }, token);
      toast.success('User created successfully!');
      reset();
    } catch (_) {
      // errors are handled in service
    }
  };

  // Font styles - similar to reference image
  const fontStyles = {
    heading: {
      fontFamily: "'Roboto', sans-serif",
      fontWeight: 600,
      fontSize: '24px',
      color: GRAY_DARK,
    },
    label: {
      fontFamily: "'Roboto', sans-serif",
      fontWeight: 500,
      fontSize: '14px',
      color: GRAY_DARK,
      marginBottom: '8px',
      display: 'block',
    },
    input: {
      fontFamily: "'Roboto', sans-serif",
      fontSize: '14px',
    },
    button: {
      fontFamily: "'Roboto', sans-serif",
      fontWeight: 500,
    }
  };

  return (
    <DashboardLayout>
        <div style={{
      minHeight: '100vh',
      backgroundColor: GRAY_LIGHT,
      padding: '40px',
      fontFamily: "'Roboto', sans-serif"
    }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: '20px', color: GRAY_DARK }}>
        <span style={{ color: ED_TEAL }}>User</span> &gt; Create User
      </div>

      {/* Form Container */}
      <div style={{
        backgroundColor: WHITE,
        borderRadius: '8px',
        padding: '30px',
        maxWidth: '600px',
        margin: '0 auto',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
      }}>
        <h1 style={{ ...fontStyles.heading, marginBottom: '30px' }}>Create User</h1>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Name Field */}
          <div style={{ marginBottom: '20px' }}>
            <label style={fontStyles.label} htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              placeholder="Enter User Name"
              style={{
                ...fontStyles.input,
                width: '100%',
                padding: '12px 15px',
                borderRadius: '4px',
                border: `1px solid ${errors.name ? ED_RED : '#ddd'}`,
                backgroundColor: errors.name ? `${ED_RED}10` : WHITE,
                outline: 'none',
                transition: 'all 0.3s',
              }}
              {...register('name', { required: 'Name is required' })}
            />
            {errors.name && (
              <span style={{ color: ED_RED, fontSize: '12px', marginTop: '5px', display: 'block' }}>
                {errors.name.message}
              </span>
            )}
          </div>

          {/* Email Field */}
          <div style={{ marginBottom: '20px' }}>
            <label style={fontStyles.label} htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Enter Email Id"
              style={{
                ...fontStyles.input,
                width: '100%',
                padding: '12px 15px',
                borderRadius: '4px',
                border: `1px solid ${errors.email ? ED_RED : '#ddd'}`,
                backgroundColor: errors.email ? `${ED_RED}10` : WHITE,
                outline: 'none',
                transition: 'all 0.3s',
              }}
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
            />
            {errors.email && (
              <span style={{ color: ED_RED, fontSize: '12px', marginTop: '5px', display: 'block' }}>
                {errors.email.message}
              </span>
            )}
          </div>

          {/* Phone Number Field */}
          <div style={{ marginBottom: '20px' }}>
            <label style={fontStyles.label} htmlFor="phone">Phone Number</label>
            <input
              id="phone"
              type="tel"
              placeholder="Enter Phone Number"
              style={{
                ...fontStyles.input,
                width: '100%',
                padding: '12px 15px',
                borderRadius: '4px',
                border: `1px solid ${errors.phone ? ED_RED : '#ddd'}`,
                backgroundColor: errors.phone ? `${ED_RED}10` : WHITE,
                outline: 'none',
                transition: 'all 0.3s',
              }}
              {...register('phone', { 
                required: 'Phone number is required',
                pattern: {
                  value: /^[0-9]{10}$/,
                  message: 'Invalid phone number'
                }
              })}
            />
            {errors.phone && (
              <span style={{ color: ED_RED, fontSize: '12px', marginTop: '5px', display: 'block' }}>
                {errors.phone.message}
              </span>
            )}
          </div>

          {/* User Type Dropdown (Dynamic) */}
          <div style={{ marginBottom: '20px' }}>
            <label style={fontStyles.label} htmlFor="userTypeId">User Type</label>
            <select
              id="userTypeId"
              style={{
                ...fontStyles.input,
                width: '100%',
                padding: '12px 15px',
                borderRadius: '4px',
                border: `1px solid ${errors.userTypeId ? ED_RED : '#ddd'}`,
                backgroundColor: errors.userTypeId ? `${ED_RED}10` : WHITE,
                outline: 'none',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2307A698' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 15px center',
              }}
              disabled={loadingUserTypes}
              {...register('userTypeId', { required: 'User type is required' })}
            >
              <option value="">{loadingUserTypes ? 'Loading...' : 'Select User Type'}</option>
              {userTypes.map((ut) => (
                <option key={ut._id} value={ut._id}>
                  {ut.name}
                </option>
              ))}
            </select>
            {errors.userTypeId && (
              <span style={{ color: ED_RED, fontSize: '12px', marginTop: '5px', display: 'block' }}>
                {errors.userTypeId.message}
              </span>
            )}
          </div>

          {/* Account Type (legacy role) */}
          {/* <div style={{ marginBottom: '20px' }}>
            <label style={fontStyles.label} htmlFor="accountType">Account Type (Role)</label>
            <select
              id="accountType"
              style={{
                ...fontStyles.input,
                width: '100%',
                padding: '12px 15px',
                borderRadius: '4px',
                border: `1px solid ${errors.accountType ? ED_RED : '#ddd'}`,
                backgroundColor: errors.accountType ? `${ED_RED}10` : WHITE,
                outline: 'none',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2307A698' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 15px center',
              }}
              defaultValue="Instructor"
              {...register('accountType', { required: 'Account type is required' })}
            >
              <option value="Admin">Admin</option>
              <option value="Instructor">Instructor</option>
              <option value="Content-management">Content-management</option>
              <option value="Student">Student</option>
            </select>
            {errors.accountType && (
              <span style={{ color: ED_RED, fontSize: '12px', marginTop: '5px', display: 'block' }}>
                {errors.accountType.message}
              </span>
            )}
          </div> */}

          {/* Password Field */}
          <div style={{ marginBottom: '20px' }}>
            <label style={fontStyles.label} htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter Password"
              style={{
                ...fontStyles.input,
                width: '100%',
                padding: '12px 15px',
                borderRadius: '4px',
                border: `1px solid ${errors.password ? ED_RED : '#ddd'}`,
                backgroundColor: errors.password ? `${ED_RED}10` : WHITE,
                outline: 'none',
                transition: 'all 0.3s',
              }}
              {...register('password', { 
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters'
                }
              })}
            />
            {errors.password && (
              <span style={{ color: ED_RED, fontSize: '12px', marginTop: '5px', display: 'block' }}>
                {errors.password.message}
              </span>
            )}
          </div>

          {/* Confirm Password Field */}
          <div style={{ marginBottom: '30px' }}>
            <label style={fontStyles.label} htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              style={{
                ...fontStyles.input,
                width: '100%',
                padding: '12px 15px',
                borderRadius: '4px',
                border: `1px solid ${errors.confirmPassword ? ED_RED : '#ddd'}`,
                backgroundColor: errors.confirmPassword ? `${ED_RED}10` : WHITE,
                outline: 'none',
                transition: 'all 0.3s',
              }}
              {...register('confirmPassword', { 
                required: 'Please confirm your password',
                validate: (value) => 
                  value === watch('password') || 'Passwords do not match'
              })}
            />
            {errors.confirmPassword && (
              <span style={{ color: ED_RED, fontSize: '12px', marginTop: '5px', display: 'block' }}>
                {errors.confirmPassword.message}
              </span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            style={{
              ...fontStyles.button,
              width: '100%',
              padding: '12px',
              backgroundColor: ED_TEAL,
              color: WHITE,
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              cursor: 'pointer',
              transition: 'all 0.3s',
              ':hover': {
                backgroundColor: ED_TEAL_DARK,
              }
            }}
          >
            Submit
          </button>
        </form>
      </div>

      {/* Footer */}
      <div style={{
        textAlign: 'center',
        marginTop: '40px',
        color: GRAY_DARK,
        fontSize: '12px'
      }}>
        © {new Date().getFullYear()} SKILLSERVE – Created By Amass Skill Ventures.
      </div>
    </div>
    </DashboardLayout>
  );
};

export default FormPage;