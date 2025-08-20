// import React from "react";
// import { useNavigate } from "react-router-dom";
// import DashboardLayout from "../../../common/DashboardLayout";

// const ED_TEAL = "#07A698";
// const TEXT_DARK = "#2d3748";
// const TEXT_LIGHT = "#718096";
// const BG_LIGHT = "#f8fafc";
// const BORDER_COLOR = "#e2e8f0";

// export default function CreateStudentsLanding() {
//   const navigate = useNavigate();

//   return (
//     <DashboardLayout>
//       <div
//         style={{
//           width: "calc(100% - 250px)",
//           marginLeft: 250,
//           minHeight: "100vh",
//           backgroundColor: BG_LIGHT,
//           padding: "2rem",
//         }}
//       >
        
//         <div
//           style={{
//             width: "100%",
//             backgroundColor: "white",
//             padding: "3rem 1.5rem",
//             borderRadius: "0.75rem",
//             boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
//             border: `1px solid ${BORDER_COLOR}`,
//             display: "flex",
//             justifyContent: "center",
//             marginTop: "8rem",
            
//           }}
//         >
//           <div style={{ display: "flex", gap: 40, flexWrap: "wrap" }}>
//             <button
//               onClick={() => navigate("/admin/students/create/single")}
//               style={optionButtonStyle("#ef4444")}
//             >
//               Create Single Student
//             </button>

//             <button
//               onClick={() => navigate("/admin/students/create/multiple")}
//               style={optionButtonStyle("#3b82f6")}
//             >
//               Create Multiple Student
//             </button>
//           </div>
//         </div>
//       </div>
//     </DashboardLayout>
//   );
// }

// const optionButtonStyle = (color) => ({
//   minWidth: 260,
//   padding: "1rem 1.25rem",
//   borderRadius: 12,
//   border: `2px dashed ${color}`,
//   background: "#fff",
//   color: TEXT_DARK,
//   fontWeight: 700,
//   fontSize: 20,
//   cursor: "pointer",
//   whiteSpace: "nowrap",
//   transition: "all .2s ease",
//   boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
// });


import React from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../../common/DashboardLayout";

const ED_TEAL = "#07A698";
const TEXT_DARK = "#2d3748";
const BG_LIGHT = "#f8fafc";
const BORDER_COLOR = "#e2e8f0";

export default function CreateStudentsLanding() {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="landing-container">
        <div className="landing-card">
          <div className="button-group">
            <button
              onClick={() => navigate("/admin/students/create/single")}
              className="option-btn red"
            >
              Create Single Student
            </button>

            <button
              onClick={() => navigate("/admin/students/create/multiple")}
              className="option-btn blue"
            >
              Create Multiple Student
            </button>
          </div>
        </div>
      </div>

      {/* Scoped styles */}
      <style jsx>{`
        .landing-container {
          width: calc(100% - 250px);
          margin-left: 250px;
          min-height: 100vh;
          background-color: ${BG_LIGHT};
          padding: 2rem;
        }

        .landing-card {
          width: 100%;
          background: #fff;
          padding: 3rem 1.5rem;
          border-radius: 0.75rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          border: 1px solid ${BORDER_COLOR};
          display: flex;
          justify-content: center;
          margin-top: 8rem;
        }

        .button-group {
          display: flex;
          gap: 40px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .option-btn {
          min-width: 260px;
          padding: 1rem 1.25rem;
          border-radius: 12px;
          background: #fff;
          color: ${TEXT_DARK};
          font-weight: 700;
          font-size: 20px;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s ease;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
        }

        .option-btn.red {
          border: 2px dashed #ef4444;
        }
        .option-btn.blue {
          border: 2px dashed #3b82f6;
        }

        /* Hover */
        .option-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
        }

        /* Responsive adjustments */
        @media (max-width: 1024px) {
          .landing-container {
            width: 100%;
            margin-left: 0;
            padding: 1.5rem;
          }
          .landing-card {
            margin-top: 4rem;
            padding: 2rem 1rem;
          }
        }

        @media (max-width: 640px) {
          .button-group {
            flex-direction: column;
            gap: 20px;
            width: 100%;
          }
          .option-btn {
            width: 100%;
            min-width: unset;
            font-size: 18px;
          }
        }
      `}</style>
    </DashboardLayout>
  );
}
