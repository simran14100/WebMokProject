import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { createAdmissionEnquiry } from "../services/operations/admissionEnquiryApi";

const AdmissionEnquiryForm = () => {
  const [formData, setFormData] = useState({
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
    qualification: "", // Changed from lastClass to qualification
    boardSchoolName: "",
    percentage: "",
    programType: "",
    academicYear: "",
    stream: "",
    graduationCourse: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // Program types
  const programTypes = [
    { id: 'UG', name: 'Undergraduate (UG)' },
    { id: 'PG', name: 'Postgraduate (PG)' },
    { id: 'PHD', name: 'Doctorate (PhD)' },
  ];

  useEffect(() => {
    const savedProgram = localStorage.getItem("selectedProgram");
    if (savedProgram) {
      setFormData((prev) => ({ ...prev, programType: savedProgram }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Check if the field is phone or alternateNumber
    if ((name === 'phone' || name === 'alternateNumber') && value.length > 10) {
      toast.error('Phone number cannot exceed 10 digits');
      return; // Don't update the state if more than 10 digits
    }
    
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = [
      "name",
      "dateOfBirth",
      "phone",
      "email",
      "qualification",
      "boardSchoolName",
      "programType",
      "graduationCourse"
    ];

    // Debug: Log all form data
    console.log('Form Data:', formData);
    
    // Check for missing required fields
    const missingFields = requiredFields.filter(field => {
      const value = formData[field];
      const isEmpty = value === null || value === undefined || value === '';
      if (isEmpty) {
        console.log(`Missing required field: ${field}`);
      }
      return isEmpty;
    });

    if (missingFields.length > 0) {
      console.log('Missing required fields:', missingFields);
      toast.error(`Please fill in all required fields. Missing: ${missingFields.join(', ')}`);
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
        address: formData.address,
        city: formData.city,
        state: formData.state,
        qualification: formData.qualification,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        parentName: formData.parentName,
        alternateNumber: formData.alternateNumber,
        boardSchoolName: formData.boardSchoolName,
        percentage: formData.percentage,
        academicYear: formData.academicYear,
        stream: formData.stream,
        graduationCourse: formData.graduationCourse || ''
      };

      console.log('Submitting form data:', submissionData);
      
      // Use the new createAdmissionEnquiry function
      const response = await createAdmissionEnquiry(submissionData);
      
      if (response?.success) {
        toast.success('Admission enquiry submitted successfully!');
        // Reset form but keep programType if it was pre-selected
        const savedProgram = localStorage.getItem("selectedProgram") || "";
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
          qualification: "",
          boardSchoolName: "",
          percentage: "",
          programType: savedProgram, // Keep the program type if it was pre-selected
          academicYear: "",
          stream: "",
          graduationCourse: ""
        });
        
        // Show success message
        toast.success("Enquiry submitted successfully!");
        
        // Optionally redirect to a thank you page or home
        // navigate('/thank-you');
      } else {
        throw new Error(response.data.message || "Failed to submit enquiry");
      }
    } catch (error) {
      console.error("Error submitting enquiry:", error);
      
      // Handle field-specific errors
      if (error.response?.data?.field) {
        const fieldName = error.response.data.field;
        const fieldLabel = {
          name: 'Name',
          email: 'Email',
          phone: 'Phone',
          programType: 'Program Type',
          dateOfBirth: 'Date of Birth',
          graduationCourse: 'Graduation Course',
          qualification: 'Last Class/Qualification',
          boardSchoolName: 'Board/University & School Name'
        }[fieldName] || fieldName;
        
        toast.error(`${fieldLabel} is required`);
      } else {
        toast.error(
          error.response?.data?.message ||
          "Failed to submit enquiry. Please check all fields and try again."
        );
      }
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
            {renderInput("Last Class/Qualification", "qualification", "text", true)}
            {renderInput(
              "Board/University & School Name",
              "boardSchoolName",
              "text",
              true
            )}
            {renderInput("Percentage/Grades", "percentage", "number")}
            {renderInput("Applying Course", "graduationCourse", "text", true)}
            
            {/* Program Type Dropdown */}
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
                Program Type <span style={{ color: "red" }}>*</span>
              </label>
              <select
                name="programType"
                value={formData.programType || ''}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #93c5fd",
                  borderRadius: "8px",
                  fontSize: "14px",
                }}
              >
                <option value="">Select Program Type</option>
                {programTypes.map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.name}
                  </option>
                ))}
              </select>
            </div>
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
