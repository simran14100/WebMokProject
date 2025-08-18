import React from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../../common/DashboardLayout";

const ED_TEAL = "#07A698";
const TEXT_DARK = "#2d3748";
const TEXT_LIGHT = "#718096";
const BG_LIGHT = "#f8fafc";
const BORDER_COLOR = "#e2e8f0";

export default function CreateStudentsLanding() {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div
        style={{
          width: "calc(100% - 250px)",
          marginLeft: 250,
          minHeight: "100vh",
          backgroundColor: BG_LIGHT,
          padding: "2rem",
        }}
      >
        {/* <div style={{ marginBottom: "2rem" }}>
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: 600,
              color: TEXT_DARK,
              marginBottom: "0.5rem",
            }}
          >
            Create Students
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
            <span>Students</span>
            <span style={{ color: BORDER_COLOR }}>/</span>
            <span style={{ color: ED_TEAL, fontWeight: 500 }}>Create Students</span>
          </div>
        </div> */}

        <div
          style={{
            width: "100%",
            backgroundColor: "white",
            padding: "3rem 1.5rem",
            borderRadius: "0.75rem",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            border: `1px solid ${BORDER_COLOR}`,
            display: "flex",
            justifyContent: "center",
            marginTop: "8rem",
          }}
        >
          <div style={{ display: "flex", gap: 40, flexWrap: "wrap" }}>
            <button
              onClick={() => navigate("/admin/students/create/single")}
              style={optionButtonStyle("#ef4444")}
            >
              Create Single Student
            </button>

            <button
              onClick={() => navigate("/admin/students/create/multiple")}
              style={optionButtonStyle("#3b82f6")}
            >
              Create Multiple Student
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

const optionButtonStyle = (color) => ({
  minWidth: 260,
  padding: "1rem 1.25rem",
  borderRadius: 12,
  border: `2px dashed ${color}`,
  background: "#fff",
  color: TEXT_DARK,
  fontWeight: 700,
  fontSize: 20,
  cursor: "pointer",
  whiteSpace: "nowrap",
  transition: "all .2s ease",
  boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
});
