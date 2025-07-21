import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { updateProfile } from "../../../services/operations/profileApi";

const CARD_BG = '#fff';
const BORDER = '#e0e0e0';
const TEXT_DARK = '#222';
const TEXT_GRAY = '#888';
const GREEN = '#009e5c';
const GREEN_DARK = '#007a44';

const genders = ["Male", "Female", "Non-Binary", "Prefer not to say", "Other"];

export default function EditProfile() {
  const { user } = useSelector((state) => state.profile);
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const submitProfileForm = async (data) => {
    try {
      dispatch(updateProfile(data, token));
      navigate("/dashboard/my-profile");
    } catch (error) {
      console.log("ERROR MESSAGE - ", error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(submitProfileForm)}>
      <div style={{ background: CARD_BG, borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: `1px solid ${BORDER}`, padding: 32, marginBottom: 32 }}>
        <div style={{ fontWeight: 700, color: GREEN, fontSize: 20, marginBottom: 18 }}>Profile Information</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <label htmlFor="firstName" style={{ color: TEXT_GRAY, fontWeight: 500, marginBottom: 4, display: 'block' }}>First Name</label>
            <input
              type="text"
              name="firstName"
              id="firstName"
              placeholder="Enter first name"
              style={{ width: '100%', padding: '10px 12px', border: `1px solid ${BORDER}`, borderRadius: 6, background: '#f9fefb', color: TEXT_DARK, outline: 'none', fontSize: 16, marginBottom: 4 }}
              {...register("firstName", { required: true })}
              defaultValue={user?.firstName}
            />
            {errors.firstName && (
              <span style={{ color: '#e53935', fontSize: 12 }}>Please enter your first name.</span>
            )}
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <label htmlFor="lastName" style={{ color: TEXT_GRAY, fontWeight: 500, marginBottom: 4, display: 'block' }}>Last Name</label>
            <input
              type="text"
              name="lastName"
              id="lastName"
              placeholder="Enter last name"
              style={{ width: '100%', padding: '10px 12px', border: `1px solid ${BORDER}`, borderRadius: 6, background: '#f9fefb', color: TEXT_DARK, outline: 'none', fontSize: 16, marginBottom: 4 }}
              {...register("lastName", { required: true })}
              defaultValue={user?.lastName}
            />
            {errors.lastName && (
              <span style={{ color: '#e53935', fontSize: 12 }}>Please enter your last name.</span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, marginTop: 16 }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <label htmlFor="dateOfBirth" style={{ color: TEXT_GRAY, fontWeight: 500, marginBottom: 4, display: 'block' }}>Date of Birth</label>
            <input
              type="date"
              name="dateOfBirth"
              id="dateOfBirth"
              style={{ width: '100%', padding: '10px 12px', border: `1px solid ${BORDER}`, borderRadius: 6, background: '#f9fefb', color: TEXT_DARK, outline: 'none', fontSize: 16, marginBottom: 4 }}
              {...register("dateOfBirth", {
                required: { value: true, message: "Please enter your Date of Birth." },
                max: { value: new Date().toISOString().split("T")[0], message: "Date of Birth cannot be in the future." },
              })}
              defaultValue={user?.dateOfBirth}
            />
            {errors.dateOfBirth && (
              <span style={{ color: '#e53935', fontSize: 12 }}>{errors.dateOfBirth.message}</span>
            )}
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <label htmlFor="gender" style={{ color: TEXT_GRAY, fontWeight: 500, marginBottom: 4, display: 'block' }}>Gender</label>
            <select
              name="gender"
              id="gender"
              style={{ width: '100%', padding: '10px 12px', border: `1px solid ${BORDER}`, borderRadius: 6, background: '#f9fefb', color: TEXT_DARK, outline: 'none', fontSize: 16, marginBottom: 4 }}
              {...register("gender", { required: true })}
              defaultValue={user?.gender}
            >
              {genders.map((ele, i) => (
                <option key={i} value={ele}>{ele}</option>
              ))}
            </select>
            {errors.gender && (
              <span style={{ color: '#e53935', fontSize: 12 }}>Please select your gender.</span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, marginTop: 16 }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <label htmlFor="contactNumber" style={{ color: TEXT_GRAY, fontWeight: 500, marginBottom: 4, display: 'block' }}>Contact Number</label>
            <input
              type="tel"
              name="contactNumber"
              id="contactNumber"
              placeholder="Enter Contact Number"
              style={{ width: '100%', padding: '10px 12px', border: `1px solid ${BORDER}`, borderRadius: 6, background: '#f9fefb', color: TEXT_DARK, outline: 'none', fontSize: 16, marginBottom: 4 }}
              {...register("contactNumber", {
                required: { value: true, message: "Please enter your Contact Number." },
                maxLength: { value: 12, message: "Invalid Contact Number" },
                minLength: { value: 10, message: "Invalid Contact Number" },
              })}
              defaultValue={user?.contactNumber}
            />
            {errors.contactNumber && (
              <span style={{ color: '#e53935', fontSize: 12 }}>{errors.contactNumber.message}</span>
            )}
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <label htmlFor="about" style={{ color: TEXT_GRAY, fontWeight: 500, marginBottom: 4, display: 'block' }}>About</label>
            <input
              type="text"
              name="about"
              id="about"
              placeholder="Enter Bio Details"
              style={{ width: '100%', padding: '10px 12px', border: `1px solid ${BORDER}`, borderRadius: 6, background: '#f9fefb', color: TEXT_DARK, outline: 'none', fontSize: 16, marginBottom: 4 }}
              {...register("about", { required: true })}
              defaultValue={user?.about}
            />
            {errors.about && (
              <span style={{ color: '#e53935', fontSize: 12 }}>Please enter your About.</span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 28 }}>
          <button
            type="button"
            onClick={() => navigate("/dashboard/my-profile")}
            style={{ background: '#e6fcf5', color: GREEN, border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 600, cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            type="submit"
            style={{ background: GREEN, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s' }}
            onMouseOver={e => e.target.style.background = GREEN_DARK}
            onMouseOut={e => e.target.style.background = GREEN}
          >
            Save
          </button>
        </div>
      </div>
    </form>
  );
} 