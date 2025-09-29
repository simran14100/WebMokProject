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
   
    <div
    style={{
      color: "#fff",
      padding: "32px",
      maxWidth: "1200px",
      width:"1000%",
      minHeight: "600px",
      margin: "0 auto",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      background: "linear-gradient(135deg,rgb(42, 93, 202) 0%,rgb(2, 37, 94) 100%)",
      borderRadius: "16px",
      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
    }}
  >
    <div style={{ textAlign: "center", marginBottom: "32px" }}>
      <div
        style={{
          width: "80px",
          height: "80px",
          background: "linear-gradient(135deg,rgb(5, 51, 82) 0%,rgba(6, 73, 124, 0.62) 100%)",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 20px",
          boxShadow: "0 4px 12px rgba(0, 122, 204, 0.4)",
        }}
      >
        <i className="fas fa-lock" style={{ fontSize: "32px", color: "white" }} />
      </div>
      <h1
        style={{
          fontSize: "32px",
          fontWeight: 600,
          marginBottom: "8px",
          color: "#fff",
          letterSpacing: "0.5px",
        }}
      >
        Change Password
      </h1>
      <p style={{ color: "#B0C4DE", fontSize: "16px", margin: 0 }}>
        Secure your account with a new password
      </p>
    </div>
  
    <div
      style={{
        background: "rgba(255, 255, 255, 0.08)",
        backdropFilter: "blur(10px)",
        padding: "32px",
        borderRadius: "16px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
      }}
    >
      <form onSubmit={handleOnSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {error && (
          <div
            style={{
              padding: "16px",
              background: "rgba(220, 38, 38, 0.15)",
              border: "1px solid rgba(220, 38, 38, 0.4)",
              color: "#FCA5A5",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "15px",
            }}
          >
            <i className="fas fa-exclamation-circle" />
            <span>{error}</span>
          </div>
        )}
  
        {success && (
          <div
            style={{
              padding: "16px",
              background: "rgba(16, 185, 129, 0.15)",
              border: "1px solid rgba(16, 185, 129, 0.4)",
              color: "#6EE7B7",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "15px",
            }}
          >
            <i className="fas fa-check-circle" />
            <span>{success}</span>
          </div>
        )}
  
        {/* Current Password */}
        <div>
          <label
            htmlFor="currentPassword"
            style={{
              display: "block",
              fontSize: "15px",
              fontWeight: 500,
              marginBottom: "10px",
              color: "#E0E7FF",
            }}
          >
            <i className="fas fa-key" style={{ marginRight: "8px" }} />
            Current Password
          </label>
          <div style={{ position: "relative" }}>
            <input
              type="password"
              name="currentPassword"
              id="currentPassword"
              value={currentPassword}
              onChange={handleOnChange}
              placeholder="Enter your current password"
              style={{
                width: "100%",
                padding: "16px 16px 16px 48px",
                background: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "10px",
                color: "#F9FAFB",
                outline: "none",
                fontSize: "15px",
                transition: "all 0.3s ease",
              }}
              required
            />
            <i
              className="fas fa-lock"
              style={{
                position: "absolute",
                left: "16px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#94A3B8",
              }}
            />
          </div>
        </div>
  
        {/* New Password */}
        <div>
          <label
            htmlFor="newPassword"
            style={{
              display: "block",
              fontSize: "15px",
              fontWeight: 500,
              marginBottom: "10px",
              color: "#E0E7FF",
            }}
          >
            <i className="fas fa-shield-alt" style={{ marginRight: "8px" }} />
            New Password
          </label>
          <div style={{ position: "relative" }}>
            <input
              type="password"
              name="newPassword"
              id="newPassword"
              value={newPassword}
              onChange={handleOnChange}
              placeholder="Create a new password (min 6 characters)"
              style={{
                width: "100%",
                padding: "16px 16px 16px 48px",
                background: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "10px",
                color: "#F9FAFB",
                outline: "none",
                fontSize: "15px",
                transition: "all 0.3s ease",
              }}
              required
              minLength={6}
            />
            <i
              className="fas fa-key"
              style={{
                position: "absolute",
                left: "16px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#94A3B8",
              }}
            />
          </div>
          <div
            style={{
              marginTop: "8px",
              fontSize: "13px",
              color: "#94A3B8",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <i className="fas fa-info-circle" />
            <span>Use at least 6 characters with a mix of letters and numbers</span>
          </div>
        </div>
  
        {/* Confirm Password */}
        <div>
          <label
            htmlFor="confirmNewPassword"
            style={{
              display: "block",
              fontSize: "15px",
              fontWeight: 500,
              marginBottom: "10px",
              color: "#E0E7FF",
            }}
          >
            <i className="fas fa-redo" style={{ marginRight: "8px" }} />
            Confirm New Password
          </label>
          <div style={{ position: "relative" }}>
            <input
              type="password"
              name="confirmNewPassword"
              id="confirmNewPassword"
              value={confirmNewPassword}
              onChange={handleOnChange}
              placeholder="Re-enter your new password"
              style={{
                width: "100%",
                padding: "16px 16px 16px 48px",
                background: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "10px",
                color: "#F9FAFB",
                outline: "none",
                fontSize: "15px",
                transition: "all 0.3s ease",
              }}
              required
              minLength={6}
            />
            <i
              className="fas fa-check-circle"
              style={{
                position: "absolute",
                left: "16px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#94A3B8",
              }}
            />
          </div>
        </div>
  
        {/* Submit Button */}
        <div style={{ paddingTop: "16px" }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: "10px",
              fontWeight: 600,
              fontSize: "16px",
              background: "linear-gradient(135deg, #007ACC 0%, #005a9e 100%)",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 4px 12px rgba(0, 122, 204, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin" />
                Updating Password...
              </>
            ) : (
              <>
                <i className="fas fa-save" />
                Update Password
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  
    <div
      style={{
        marginTop: "32px",
        textAlign: "center",
        padding: "20px",
        background: "rgba(255, 255, 255, 0.05)",
        borderRadius: "10px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      <p style={{ color: "#94A3B8", fontSize: "15px", margin: 0 }}>
        <i className="fas fa-question-circle" style={{ marginRight: "8px" }} />
        Forgot your password? Please contact our support team for assistance.
      </p>
      <div style={{ marginTop: "12px" }}>
        <a
          href="#"
          style={{
            color: "#60A5FA",
            textDecoration: "none",
            fontWeight: 500,
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            transition: "color 0.2s ease",
          }}
        >
          <i className="fas fa-headset" />
          Contact Support
        </a>
      </div>
    </div>
  </div>
    

  );
}
