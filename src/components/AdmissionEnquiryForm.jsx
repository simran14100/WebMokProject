import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiConnector } from "../services/apiConnector";
import { enrollment } from "../services/apis";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";

const AdmissionEnquiryForm = () => {
  const [formData, setFormData] = useState({
    name: "", // Changed from fullName to name
    dateOfBirth: "",
    gender: "",
    parentName: "",
    phone: "", // Changed from mobileNumber to phone
    email: "",
    alternateNumber: "",
    address: "",
    city: "",
    state: "",
    lastClass: "",
    boardSchoolName: "",
    percentage: "",
    programType: "",
    academicYear: "",
    stream: "",
    modeOfStudy: "Day School",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    const savedProgram = localStorage.getItem("selectedProgram");
    if (savedProgram) {
      setFormData((prev) => ({ ...prev, programType: savedProgram }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = [
      "name", // Changed from fullName to name
      "dateOfBirth",
      "phone", // Changed from mobileNumber to phone
      "email",
      "lastClass",
      "boardSchoolName",
      "programType",
    ];
    const missingField = requiredFields.find((field) => !formData[field]);

    if (missingField) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare the data to match the API's expected format
      const submissionData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        programType: formData.programType,
        // Include other fields that might be required
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        parentName: formData.parentName,
        alternateNumber: formData.alternateNumber,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        lastClass: formData.lastClass,
        boardSchoolName: formData.boardSchoolName,
        percentage: formData.percentage,
        academicYear: formData.academicYear,
        stream: formData.stream,
        modeOfStudy: formData.modeOfStudy || 'Day School'
      };

      console.log('Submitting form data:', submissionData);
      
      // Use the correct endpoint for submitting an admission enquiry
      const response = await apiConnector(
        "POST",
        "/api/v1/enrollment/enquiry",  // Using the correct endpoint
        submissionData,
        {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      );

      if (response.data.success) {
        toast.success("Admission enquiry submitted successfully!");
        // Reset form fields
        setFormData({
          name: "",
          dateOfBirth: "",
          gender: "",
          parentName: "",
          phone: "",
          email: "",
          alternateNumber: "",
          address: "",
          city: "",
          state: "",
          lastClass: "",
          boardSchoolName: "",
          percentage: "",
          programType: "",
          academicYear: "",
          stream: "",
          modeOfStudy: "Day School"
        });
      } else {
        throw new Error(response.data.message || "Failed to submit enquiry");
      }
    } catch (error) {
      console.error("Error submitting enquiry:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to submit enquiry. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInput = (label, name, type = "text", required = false) => (
    <div style={{ marginBottom: "16px" }}>
      <label
        style={{
          display: "block",
          fontSize: "14px",
          fontWeight: "600",
          color: "#1e3a8a", // dark blue
          marginBottom: "6px",
        }}
      >
        {label} {required && <span style={{ color: "red" }}>*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        required={required}
        style={{
          width: "100%",
          padding: "10px",
          border: "1px solid #93c5fd", // light blue border
          borderRadius: "8px",
          outline: "none",
          fontSize: "14px",
          transition: "0.3s",
        }}
        onFocus={(e) =>
          (e.target.style.border = "1px solid #2563eb") // dark blue focus
        }
        onBlur={(e) =>
          (e.target.style.border = "1px solid #93c5fd") // reset to light blue
        }
      />
    </div>
  );

  return (
    <div
      style={{
        maxWidth: "850px",
        marginTop:"11rem",
        margin: "40px auto",
        padding: "30px",
        background: "linear-gradient(to bottom, #e0f2fe, #ffffff)", // light blue gradient
        borderRadius: "12px",
        boxShadow: "0 6px 16px rgba(30, 58, 138, 0.25)",
      }}
    >
      <h2
        style={{
          fontSize: "28px",
          fontWeight: "700",
          textAlign: "center",
          marginBottom: "20px",
          color: "#1e3a8a", // dark blue
        }}
      >
        Admission Enquiry Form
      </h2>

      <form onSubmit={handleSubmit}>
        {/* Personal Information */}
        <div
          style={{
            borderBottom: "2px solid #bfdbfe",
            paddingBottom: "20px",
            marginBottom: "24px",
          }}
        >
          <h3
            style={{
              fontSize: "18px",
              fontWeight: "600",
              color: "#1e40af",
              marginBottom: "14px",
            }}
          >
            Personal Information
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
            }}
          >
            {renderInput("Full Name", "name", "text", true)}
            {renderInput("Date of Birth", "dateOfBirth", "date", true)}

            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#1e3a8a",
                  marginBottom: "6px",
                }}
              >
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #93c5fd",
                  borderRadius: "8px",
                  fontSize: "14px",
                }}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {renderInput("Parent/Guardian Name", "parentName", "text", true)}
          </div>
        </div>

        {/* Contact Information */}
        <div
          style={{
            borderBottom: "2px solid #bfdbfe",
            paddingBottom: "20px",
            marginBottom: "24px",
          }}
        >
          <h3
            style={{
              fontSize: "18px",
              fontWeight: "600",
              color: "#1e40af",
              marginBottom: "14px",
            }}
          >
            Contact Information
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
            }}
          >
            {renderInput("Mobile Number", "phone", "tel", true)}
            {renderInput("Email Address", "email", "email", true)}
            {renderInput("Alternate Contact", "alternateNumber", "tel")}
            {renderInput("Address", "address", "text", true)}
            {renderInput("City", "city", "text", true)}
            {renderInput("State", "state", "text", true)}
          </div>
        </div>

        {/* Academic Details */}
        <div
          style={{
            borderBottom: "2px solid #bfdbfe",
            paddingBottom: "20px",
            marginBottom: "24px",
          }}
        >
          <h3
            style={{
              fontSize: "18px",
              fontWeight: "600",
              color: "#1e40af",
              marginBottom: "14px",
            }}
          >
            Academic Details
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
            }}
          >
            {renderInput("Last Class/Qualification", "lastClass", "text", true)}
            {renderInput(
              "Board/University & School Name",
              "boardSchoolName",
              "text",
              true
            )}
            {renderInput("Percentage/Grades", "percentage", "number")}
          </div>
        </div>

        {/* Buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "15px",
          }}
        >
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={isSubmitting}
            style={{
              padding: "10px 20px",
              border: "2px solid #1e40af",
              borderRadius: "8px",
              background: "white",
              color: "#1e40af",
              fontWeight: "600",
              cursor: "pointer",
              transition: "0.3s",
            }}
            onMouseEnter={(e) =>
              (e.target.style.background = "#e0f2fe")
            }
            onMouseLeave={(e) => (e.target.style.background = "white")}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              background: "#1e40af",
              color: "white",
              fontWeight: "600",
              cursor: "pointer",
              transition: "0.3s",
              opacity: isSubmitting ? 0.6 : 1,
            }}
            onMouseEnter={(e) => (e.target.style.background = "#1e3a8a")}
            onMouseLeave={(e) => (e.target.style.background = "#1e40af")}
          >
            {isSubmitting ? "Submitting..." : "Submit Enquiry"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdmissionEnquiryForm;
