import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { changePassword } from '../../services/operations/profileApi';
import { useNavigate } from 'react-router-dom';
import { VscLock } from 'react-icons/vsc';
import { ED_TEAL } from '../../utils/constants';

export default function Accounts() {
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { currentPassword, newPassword, confirmNewPassword } = formData;

  const handleOnChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
    // Clear messages when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleOnSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (newPassword !== confirmNewPassword) {
      setError("New passwords don't match");
      return;
    }
    
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await dispatch(changePassword(token, {
        oldPassword: currentPassword,
        newPassword,
        confirmNewPassword: newPassword // Send newPassword again as confirmNewPassword to match backend validation
      }));
      
      setSuccess('Password updated successfully!');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      });
    } catch (error) {
      console.error('Error updating password:', error);
      setError(error.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-white p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-medium mb-8 flex items-center gap-2">
        <VscLock style={{ fontSize: 24, color: ED_TEAL }} />
        Change Password
      </h1>
      
      <div className="bg-richblack-800 p-6 rounded-lg border border-richblack-700">
        <form onSubmit={handleOnSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-pink-900/50 border border-pink-500 text-pink-200 rounded-md">
              {error}
            </div>
          )}
          
          {success && (
            <div className="p-3 bg-green-900/50 border border-green-500 text-green-200 rounded-md">
              {success}
            </div>
          )}
          
          <div className="space-y-2">
            <label htmlFor="currentPassword" className="block text-sm font-medium text-richblack-100">
              Current Password
            </label>
            <input
              type="password"
              name="currentPassword"
              id="currentPassword"
              value={currentPassword}
              onChange={handleOnChange}
              placeholder="Enter current password"
              className="w-full px-4 py-2.5 bg-richblack-700 border border-richblack-600 rounded-md text-richblack-5 focus:outline-none focus:ring-2 focus:ring-caribbeangreen-300"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="newPassword" className="block text-sm font-medium text-richblack-100">
              New Password
            </label>
            <input
              type="password"
              name="newPassword"
              id="newPassword"
              value={newPassword}
              onChange={handleOnChange}
              placeholder="Enter new password (min 6 characters)"
              className="w-full px-4 py-2.5 bg-richblack-700 border border-richblack-600 rounded-md text-richblack-5 focus:outline-none focus:ring-2 focus:ring-caribbeangreen-300"
              required
              minLength={6}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-richblack-100">
              Confirm New Password
            </label>
            <input
              type="password"
              name="confirmNewPassword"
              id="confirmNewPassword"
              value={confirmNewPassword}
              onChange={handleOnChange}
              placeholder="Confirm new password"
              className="w-full px-4 py-2.5 bg-richblack-700 border border-richblack-600 rounded-md text-richblack-5 focus:outline-none focus:ring-2 focus:ring-caribbeangreen-300"
              required
              minLength={6}
            />
          </div>
          
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 px-4 rounded-md font-medium ${
                loading
                  ? 'bg-richblack-500 cursor-not-allowed'
                  : 'bg-caribbeangreen-500 hover:bg-caribbeangreen-400 text-richblack-900'
              } transition-all duration-200`}
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-richblack-400 text-sm">
          Forgot your password? Please contact support for assistance.
        </p>
      </div>
    </div>
  );
}
