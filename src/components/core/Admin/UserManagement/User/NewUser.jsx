

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import DashboardLayout from "../../../../common/DashboardLayout";
import { createUserByAdmin } from "../../../../../services/operations/adminApi";
import { apiConnector } from "../../../../../services/apiConnector";
import { admin } from "../../../../../services/apis";

// Color constants
const ED_TEAL = "#07A698";
const ED_RED = "#EF4444";
const WHITE = "#FFFFFF";
const GRAY_DARK = "#333333";
const TEXT_DARK = "#2d3748";
const TEXT_LIGHT = "#718096";
const BORDER_COLOR = "#e2e8f0";
const GRAY_TEXT = "#6B7280";

const FormPage = () => {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();
  const token = useSelector((state) => state.auth.token);
  const [userTypes, setUserTypes] = useState([]);
  const [loadingUserTypes, setLoadingUserTypes] = useState(false);

  useEffect(() => {
    const fetchUserTypes = async () => {
      setLoadingUserTypes(true);
      try {
        const res = await apiConnector(
          "GET",
          admin.USER_TYPES_API,
          {},
          token ? { Authorization: `Bearer ${token}` } : {}
        );
        const payload = res.data?.data;
        const list = Array.isArray(payload?.userTypes)
          ? payload.userTypes
          : Array.isArray(payload)
          ? payload
          : [];
        setUserTypes(list);
      } catch (e) {
        console.log("FETCH USER TYPES ERROR............", e);
        toast.error(
          e.response?.data?.message || e.message || "Failed to fetch user types"
        );
      } finally {
        setLoadingUserTypes(false);
      }
    };
    fetchUserTypes();
  }, [token]);

  const onSubmit = async (form) => {
    const accountType = form.accountType || "Instructor";
    const userTypeId = form.userTypeId || "";
    if (!userTypeId) {
      toast.error("Please select a User Type");
      return;
    }
    try {
      await createUserByAdmin(
        {
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
          confirmPassword: form.confirmPassword,
          accountType,
          userTypeId,
        },
        token
      );
      toast.success("User created successfully!");
      reset();
    } catch (_) {}
  };

  return (
    <DashboardLayout>
      <div
        style={{
          minHeight: "100vh",
          width: "100%",
          maxWidth: "900px", // 👈 cap width on desktop
          marginLeft:"200px", // 👈 center it
          padding: "1rem",
          fontFamily:
            "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "2rem", marginTop: "1rem" }}>
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: 600,
              color: TEXT_DARK,
              marginBottom: "0.5rem",
            }}
          >
            Create User
          </h2>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.875rem",
              color: TEXT_LIGHT,
            }}
          >
            <span>User</span>
            <span style={{ color: BORDER_COLOR }}>/</span>
            <span style={{ color: ED_TEAL, fontWeight: 500 }}>Create User</span>
          </div>
        </div>

        {/* Form Container */}
        <div
          style={{
            backgroundColor: WHITE,
            padding: "1.5rem",
            border: "1px solid #e0e0e0",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
          }}
        >
          <h3
            style={{
              fontWeight: 600,
              fontSize: "1.25rem",
              color: GRAY_DARK,
              marginBottom: "1.5rem",
            }}
          >
            Create User
          </h3>

          <form onSubmit={handleSubmit(onSubmit)} style={{ width: "100%" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "1rem",
                marginBottom: "2rem",
              }}
            >
              {/* Name */}
              <Field
                label="Name"
                name="name"
                placeholder="Enter User Name"
                register={register}
                errors={errors}
              />

              {/* Email */}
              <Field
                label="Email"
                name="email"
                type="email"
                placeholder="Enter Email Id"
                register={register}
                errors={errors}
              />

              {/* Phone */}
              <Field
                label="Phone Number"
                name="phone"
                type="tel"
                placeholder="Enter 10-digit mobile number"
                register={register}
                errors={errors}
              />

              {/* User Type */}
              <div style={{ display: "flex", flexDirection: "column" }}>
                <label
                  style={{
                    fontWeight: 500,
                    fontSize: "0.875rem",
                    color: GRAY_DARK,
                    marginBottom: "0.5rem",
                  }}
                >
                  User Type
                </label>
                <select
                  disabled={loadingUserTypes}
                  style={{
                    padding: "0.875rem 1rem",
                    borderRadius: "8px",
                    border: `1.5px solid ${
                      errors.userTypeId ? ED_RED : "#D1D5DB"
                    }`,
                    fontSize: "0.95rem",
                  }}
                  {...register("userTypeId", {
                    required: "User type is required",
                  })}
                >
                  <option value="">
                    {loadingUserTypes ? "Loading..." : "Select User Type"}
                  </option>
                  {userTypes.map((ut) => (
                    <option key={ut._id} value={ut._id}>
                      {ut.name}
                    </option>
                  ))}
                </select>
                {errors.userTypeId && (
                  <span
                    style={{
                      color: ED_RED,
                      fontSize: "0.75rem",
                      marginTop: "0.5rem",
                    }}
                  >
                    {errors.userTypeId.message}
                  </span>
                )}
              </div>

              {/* Password */}
              <Field
                label="Password"
                name="password"
                type="password"
                placeholder="Enter Password"
                register={register}
                errors={errors}
              />

              {/* Confirm Password */}
              <Field
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                placeholder="Confirm Password"
                register={register}
                errors={errors}
                validate={(value) =>
                  value === watch("password") || "Passwords do not match"
                }
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                fontWeight: 500,
                width: "100%", // 👈 full width on mobile
                maxWidth: "200px", // 👈 cap on desktop
                padding: "1rem 1.5rem",
                backgroundColor: ED_TEAL,
                color: WHITE,
                border: "none",
                borderRadius: "8px",
                fontSize: "1rem",
                cursor: "pointer",
                opacity: isSubmitting ? 0.7 : 1,
              }}
            >
              {isSubmitting ? "Creating User..." : "Submit"}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            padding: "1.5rem",
            color: GRAY_TEXT,
            fontSize: "0.75rem",
            backgroundColor: "#F8F9FA",
            borderTop: "1px solid #E5E7EB",
            marginTop: "2rem",
          }}
        >
          © {new Date().getFullYear()} SKILLSERVE – Created By Amass Skill
          Ventures.
        </div>
      </div>
    </DashboardLayout>
  );
};

// Reusable field component
const Field = ({
  label,
  name,
  type = "text",
  placeholder,
  register,
  errors,
  validate,
}) => {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <label
        style={{
          fontWeight: 500,
          fontSize: "0.875rem",
          color: GRAY_DARK,
          marginBottom: "0.5rem",
        }}
      >
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        style={{
          padding: "0.875rem 1rem",
          borderRadius: "8px",
          border: `1.5px solid ${errors[name] ? ED_RED : "#D1D5DB"}`,
          fontSize: "0.95rem",
        }}
        {...register(name, {
          required: `${label} is required`,
          ...(name === "email"
            ? {
                pattern: {
                  value:
                    /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              }
            : {}),
          ...(name === "phone"
            ? {
                pattern: {
                  value: /^[0-9]{10}$/,
                  message: "Invalid phone number",
                },
              }
            : {}),
          ...(name === "password"
            ? {
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
              }
            : {}),
          ...(validate ? { validate } : {}),
        })}
      />
      {errors[name] && (
        <span
          style={{
            color: ED_RED,
            fontSize: "0.75rem",
            marginTop: "0.5rem",
          }}
        >
          {errors[name].message}
        </span>
      )}
    </div>
  );
};

export default FormPage;
