import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { changePassword } from "../../../services/operations/profileApi";

const CARD_BG = '#fff';
const BORDER = '#e0e0e0';
const TEXT_DARK = '#222';
const TEXT_GRAY = '#888';
const GREEN = '#009e5c';
const GREEN_DARK = '#007a44';


const ED_TEAL = '#07A698';
const ED_TEAL_DARK = '#059a8c';

export default function UpdatePassword() {
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm();

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const onSubmit = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    await dispatch(changePassword(token, {
      oldPassword: data.currentPassword,
      newPassword: data.newPassword,
    }));
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div style={{ background: CARD_BG, borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: `1px solid ${BORDER}`, padding: 32, marginBottom: 32 }}>
        <div style={{ fontWeight: 700, color: ED_TEAL, fontSize: 20, marginBottom: 18 }}>Update Password</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ position: 'relative' }}>
            <label htmlFor="currentPassword" style={{ color: TEXT_GRAY, fontWeight: 500, marginBottom: 4, display: 'block' }}>Current Password</label>
            <input
              type={showOldPassword ? "text" : "password"}
              name="currentPassword"
              id="currentPassword"
              placeholder="Enter current password"
              style={{ width: '100%', padding: '10px 40px 10px 12px', border: `1px solid ${BORDER}`, borderRadius: 6, background: '#f9fefb', color: TEXT_DARK, outline: 'none', fontSize: 16, marginBottom: 4 }}
              {...register("currentPassword", { required: true })}
            />
            <span
              onClick={() => setShowOldPassword((prev) => !prev)}
              style={{ position: 'absolute', right: 12, top: 38, cursor: 'pointer', zIndex: 10 }}
            >
              {showOldPassword ? (
                <AiOutlineEyeInvisible fontSize={22} fill="#AFB2BF" />
              ) : (
                <AiOutlineEye fontSize={22} fill="#AFB2BF" />
              )}
            </span>
            {errors.currentPassword && (
              <span style={{ color: '#e53935', fontSize: 12 }}>Please enter your current password.</span>
            )}
          </div>
          <div style={{ position: 'relative' }}>
            <label htmlFor="newPassword" style={{ color: TEXT_GRAY, fontWeight: 500, marginBottom: 4, display: 'block' }}>New Password</label>
            <input
              type={showNewPassword ? "text" : "password"}
              name="newPassword"
              id="newPassword"
              placeholder="Enter new password"
              style={{ width: '100%', padding: '10px 40px 10px 12px', border: `1px solid ${BORDER}`, borderRadius: 6, background: '#f9fefb', color: TEXT_DARK, outline: 'none', fontSize: 16, marginBottom: 4 }}
              {...register("newPassword", { required: true, minLength: 6 })}
            />
            <span
              onClick={() => setShowNewPassword((prev) => !prev)}
              style={{ position: 'absolute', right: 12, top: 38, cursor: 'pointer', zIndex: 10 }}
            >
              {showNewPassword ? (
                <AiOutlineEyeInvisible fontSize={22} fill="#AFB2BF" />
              ) : (
                <AiOutlineEye fontSize={22} fill="#AFB2BF" />
              )}
            </span>
            {errors.newPassword && (
              <span style={{ color: '#e53935', fontSize: 12 }}>Please enter a new password (min 6 chars).</span>
            )}
          </div>
          <div style={{ position: 'relative' }}>
            <label htmlFor="confirmPassword" style={{ color: TEXT_GRAY, fontWeight: 500, marginBottom: 4, display: 'block' }}>Confirm New Password</label>
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              id="confirmPassword"
              placeholder="Confirm new password"
              style={{ width: '100%', padding: '10px 40px 10px 12px', border: `1px solid ${BORDER}`, borderRadius: 6, background: '#f9fefb', color: TEXT_DARK, outline: 'none', fontSize: 16, marginBottom: 4 }}
              {...register("confirmPassword", { required: true, validate: (value) => value === watch("newPassword") })}
            />
            <span
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              style={{ position: 'absolute', right: 12, top: 38, cursor: 'pointer', zIndex: 10 }}
            >
              {showConfirmPassword ? (
                <AiOutlineEyeInvisible fontSize={22} fill="#AFB2BF" />
              ) : (
                <AiOutlineEye fontSize={22} fill="#AFB2BF" />
              )}
            </span>
            {errors.confirmPassword && (
              <span style={{ color: '#e53935', fontSize: 12 }}>Passwords do not match.</span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 28 }}>
          <button
            type="button"
            onClick={() => reset()}
            style={{ background: '#e6fcf5', color: ED_TEAL, border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 600, cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            type="submit"
            style={{ background:ED_TEAL , color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s' }}
            onMouseOver={e => e.target.style.background = ED_TEAL_DARK}
            onMouseOut={e => e.target.style.background = ED_TEAL}
          >
            Save
          </button>
        </div>
      </div>
    </form>
  );
} 