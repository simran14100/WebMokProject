// // // CreateBatch.jsx
// // import React, { useState } from "react";
// // import { useSelector } from "react-redux";
// // import { createBatch as createBatchApi } from "../../../../services/operations/adminApi";
// // import { showError, showSuccess } from "../../../../utils/toast";
// // import DashboardLayout from "../../../common/DashboardLayout";


// // const ED_TEAL = "#07A698";
// // const ED_TEAL_DARK = "#059a8c";
// // const TEXT_DARK = "#2d3748";
// // const TEXT_LIGHT = "#718096";

// // export default function CreateBatch() {
// //   const [batchName, setBatchName] = useState("");
// //   const [batchDepartment, setBatchDepartment] = useState("");
// //   const [loading, setLoading] = useState(false);

// //   const token = useSelector((state) => state.auth.token);
// //   const user = useSelector((state) => state.profile.user);
// //   const isAdmin = user?.accountType === "Admin";

// //   const handleSubmit = (e) => {
// //     e.preventDefault();
// //     if (!isAdmin) return;
// //     if (!batchName.trim() || !batchDepartment) {
// //       showError("Please fill all fields");
// //       return;
// //     }

// //     setLoading(true);
// //     createBatchApi(
// //       { name: batchName.trim(), department: batchDepartment },
// //       token
// //     )
// //       .then(() => {
// //         showSuccess("Batch created");
// //         setBatchName("");
// //         setBatchDepartment("");
// //       })
// //       .catch(() => {})
// //       .finally(() => setLoading(false));
// //   };

// //   return (
// //   <DashboardLayout>
// //       <div className="min-h-screen bg-gray-50 p-8">
// //       {/* Breadcrumb */}
// //       <div className="category-header">
// //           <h2>Create batch</h2>
// //           <div className="breadcrumb">
// //             <span>Batch</span>
// //             <span className="divider">/</span>
// //             <span className="active">Create Batch</span>
// //           </div>
// //         </div>

     

// //       {!isAdmin ? (
// //         <div className="max-w-md bg-white p-6 rounded-md shadow-md">
// //           <h1 className="text-xl font-semibold text-red-600">Unauthorized</h1>
// //           <p className="text-gray-600 mt-2">Only Admin can create batches.</p>
// //         </div>
// //       ) : (
// //       <div className="max-w-md bg-white p-6 rounded-md shadow-md">
// //         <h2 className="text-xl font-semibold mb-4">Create Batch</h2>

// //         <form onSubmit={handleSubmit} className="space-y-4">
// //           <div>
// //             <label className="block text-gray-700 mb-1">Batch Name</label>
// //             <input
// //               type="text"
// //               placeholder="Enter Batch Name"
// //               value={batchName}
// //               onChange={(e) => setBatchName(e.target.value)}
// //               className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
// //             />
// //           </div>

// //           <div>
// //             <label className="block text-gray-700 mb-1">Batch Department</label>
// //             <select
// //               value={batchDepartment}
// //               onChange={(e) => setBatchDepartment(e.target.value)}
// //               className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
// //             >
// //               <option value="">Select...</option>
// //               <option value="skilling">skilling</option>
// //               <option value="training">training</option>
// //               <option value="personality">personality</option>
// //             </select>
        
// //           </div>

// //           <button
// //             type="submit"
// //             disabled={loading}
// //             className={`bg-purple-600 text-white px-4 py-2 rounded-md transition ${
// //               loading ? "opacity-60 cursor-not-allowed" : "hover:bg-purple-700"
// //             }`}
// //           >
// //             {loading ? "Creating..." : "Create"}
// //           </button>
// //         </form>
// //       </div>
// //       )}

// //       <style jsx>
// //         {`.category-header {
// //             margin-bottom: 2rem;
// //           }

// //           .category-header h2 {
// //             font-size: 1.5rem;
// //             font-weight: 600;
// //             color: ${TEXT_DARK};
// //             margin-bottom: 0.5rem;
// //           }`}
// //       </style>
// //     </div>
// //   </DashboardLayout>
// //   );
// // }
// // CreateBatch.jsx
// import React, { useState } from "react";
// import { useSelector } from "react-redux";
// import { createBatch as createBatchApi } from "../../../../services/operations/adminApi";
// import { showError, showSuccess } from "../../../../utils/toast";
// import DashboardLayout from "../../../common/DashboardLayout";

// export default function CreateBatch() {
//   const [batchName, setBatchName] = useState("");
//   const [batchDepartment, setBatchDepartment] = useState("");
//   const [loading, setLoading] = useState(false);

//   const token = useSelector((state) => state.auth.token);
//   const user = useSelector((state) => state.profile.user);
//   const isAdmin = user?.accountType === "Admin";

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!isAdmin) return;
//     if (!batchName.trim() || !batchDepartment) {
//       showError("Please fill all fields");
//       return;
//     }

//     setLoading(true);
//     createBatchApi(
//       { name: batchName.trim(), department: batchDepartment },
//       token
//     )
//       .then(() => {
//         showSuccess("Batch created");
//         setBatchName("");
//         setBatchDepartment("");
//       })
//       .catch(() => {})
//       .finally(() => setLoading(false));
//   };

//   // Style constants
//   const styles = {
//     container: {
//       minHeight: "100vh",
//       backgroundColor: "#f8fafc",
//       padding: "2rem",
//     },
//     header: {
//       marginBottom: "2rem",
//     },
//     headerTitle: {
//       fontSize: "1.5rem",
//       fontWeight: 600,
//       color: "#2d3748",
//       marginBottom: "0.5rem",
//     },
//     breadcrumb: {
//       display: "flex",
//       alignItems: "center",
//       gap: "0.5rem",
//       color: "#718096",
//     },
//     divider: {
//       color: "#cbd5e0",
//     },
//     activeBreadcrumb: {
//       color: "#07A698",
//       fontWeight: 500,
//     },
//     card: {
//       maxWidth: "28rem",
//       backgroundColor: "white",
//       padding: "1.5rem",
//       borderRadius: "0.375rem",
//       boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
//     },
//     unauthorizedCard: {
//       maxWidth: "28rem",
//       backgroundColor: "white",
//       padding: "1.5rem",
//       borderRadius: "0.375rem",
//       boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
//     },
//     title: {
//       fontSize: "1.25rem",
//       fontWeight: 600,
//       marginBottom: "1rem",
//       color: "#2d3748",
//     },
//     errorTitle: {
//       fontSize: "1.25rem",
//       fontWeight: 600,
//       color: "#e53e3e",
//     },
//     errorText: {
//       color: "#718096",
//       marginTop: "0.5rem",
//     },
//     form: {
//       display: "flex",
//       flexDirection: "column",
//       gap: "1rem",
//     },
//     label: {
//       display: "block",
//       color: "#4a5568",
//       marginBottom: "0.25rem",
//       fontSize: "0.875rem",
//       fontWeight: 500,
//     },
//     input: {
//       width: "100%",
//       border: "1px solid #e2e8f0",
//       borderRadius: "0.375rem",
//       padding: "0.5rem",
//       outline: "none",
//       transition: "all 0.2s",
//       _focus: {
//         borderColor: "#9f7aea",
//         boxShadow: "0 0 0 2px rgba(159, 122, 234, 0.5)",
//       },
//     },
//     select: {
//       width: "100%",
//       border: "1px solid #e2e8f0",
//       borderRadius: "0.375rem",
//       padding: "0.5rem",
//       outline: "none",
//       transition: "all 0.2s",
//       _focus: {
//         borderColor: "#9f7aea",
//         boxShadow: "0 0 0 2px rgba(159, 122, 234, 0.5)",
//       },
//     },
//     button: {
//       backgroundColor: "#07A698",
//       color: "white",
//       padding: "0.5rem 1rem",
//       borderRadius: "0.375rem",
//       transition: "all 0.2s",
//       _hover: {
//         backgroundColor: "#059a8c",
//       },
//       _disabled: {
//         opacity: 0.6,
//         cursor: "not-allowed",
//       },
//     },
//   };

//   return (
//     <DashboardLayout>
//       <div style={styles.container}>
//         {/* Breadcrumb */}
//         <div style={styles.header}>
//           <h2 style={styles.headerTitle}>Create batch</h2>
//           <div style={styles.breadcrumb}>
//             <span>Batch</span>
//             <span style={styles.divider}>/</span>
//             <span style={styles.activeBreadcrumb}>Create Batch</span>
//           </div>
//         </div>

//         {!isAdmin ? (
//           <div style={styles.unauthorizedCard}>
//             <h1 style={styles.errorTitle}>Unauthorized</h1>
//             <p style={styles.errorText}>Only Admin can create batches.</p>
//           </div>
//         ) : (
//           <div style={styles.card}>
//             <h2 style={styles.title}>Create Batch</h2>

//             <form onSubmit={handleSubmit} style={styles.form}>
//               <div>
//                 <label style={styles.label}>Batch Name</label>
//                 <input
//                   type="text"
//                   placeholder="Enter Batch Name"
//                   value={batchName}
//                   onChange={(e) => setBatchName(e.target.value)}
//                   style={styles.input}
//                 />
//               </div>

//               <div>
//                 <label style={styles.label}>Batch Department</label>
//                 <select
//                   value={batchDepartment}
//                   onChange={(e) => setBatchDepartment(e.target.value)}
//                   style={styles.select}
//                 >
//                   <option value="">Select...</option>
//                   <option value="skilling">skilling</option>
//                   <option value="training">training</option>
//                   <option value="personality">personality</option>
//                 </select>
//               </div>

//               <button
//                 type="submit"
//                 disabled={loading}
//                 style={{
//                   ...styles.button,
//                   ...(loading && styles.button._disabled),
//                 }}
//               >
//                 {loading ? "Creating..." : "Create"}
//               </button>
//             </form>
//           </div>
//         )}
//       </div>
//     </DashboardLayout>
//   );
// }


import React, { useState } from "react";
import { useSelector } from "react-redux";
import { createBatch as createBatchApi } from "../../../../services/operations/adminApi";
import { showError, showSuccess } from "../../../../utils/toast";
import DashboardLayout from "../../../common/DashboardLayout";

// Color constants
const ED_TEAL = '#07A698';
const ED_TEAL_DARK = '#059a8c';
const TEXT_DARK = '#2d3748';
const TEXT_LIGHT = '#718096';
const BG_LIGHT = '#f8fafc';
const BORDER_COLOR = '#e2e8f0';

export default function CreateBatch() {
  const [batchName, setBatchName] = useState("");
  const [batchDepartment, setBatchDepartment] = useState("");
  const [loading, setLoading] = useState(false);

  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.profile.user);
  const isAdmin = user?.accountType === "Admin";

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (!batchName.trim() || !batchDepartment) {
      showError("Please fill all fields");
      return;
    }

    setLoading(true);
    createBatchApi(
      { name: batchName.trim(), department: batchDepartment },
      token
    )
      .then(() => {
        showSuccess("Batch created");
        setBatchName("");
        setBatchDepartment("");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  return (
    <DashboardLayout>
      <div style={{
        width: 'calc(100% - 250px)',
        marginLeft: '250px',
        minHeight: '100vh',
        backgroundColor: BG_LIGHT,
        padding: '2rem'
      }}>
        {/* Header Section */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 600,
            color: TEXT_DARK,
            marginBottom: '0.5rem'
          }}>
            Create Batch
          </h2>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem',
            color: TEXT_LIGHT
          }}>
            <span>Batch</span>
            <span style={{ color: BORDER_COLOR }}>/</span>
            <span style={{ color: ED_TEAL, fontWeight: 500 }}>Create Batch</span>
          </div>
        </div>

        {/* Content Section */}
        {!isAdmin ? (
          <div style={{
            width: '100%',
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: `1px solid ${BORDER_COLOR}`
          }}>
            <h1 style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              color: '#e53e3e',
              marginBottom: '0.5rem'
            }}>
              Unauthorized
            </h1>
            <p style={{ color: TEXT_LIGHT }}>
              Only Admin can create batches.
            </p>
          </div>
        ) : (
          <div style={{
            width: '100%',
            maxWidth: '800px',
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: `1px solid ${BORDER_COLOR}`
          }}>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              color: TEXT_DARK,
              marginBottom: '1.5rem'
            }}>
              Create Batch
            </h2>

            <form onSubmit={handleSubmit} style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '1rem',
              maxWidth: '500px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: TEXT_DARK,
                  marginBottom: '0.5rem'
                }}>
                  Batch Name
                </label>
                <input
                  type="text"
                  placeholder="Enter Batch Name"
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.625rem',
                    borderRadius: '0.375rem',
                    border: `1px solid ${BORDER_COLOR}`,
                    outline: 'none',
                    transition: 'all 0.2s',
                    fontSize: '0.875rem',
                    color: TEXT_DARK,
                    backgroundColor: 'white',
                    ':focus': {
                      borderColor: ED_TEAL,
                      boxShadow: `0 0 0 2px rgba(7, 166, 152, 0.2)`
                    }
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: TEXT_DARK,
                  marginBottom: '0.5rem'
                }}>
                  Batch Department
                </label>
                <select
                  value={batchDepartment}
                  onChange={(e) => setBatchDepartment(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.625rem',
                    borderRadius: '0.375rem',
                    border: `1px solid ${BORDER_COLOR}`,
                    outline: 'none',
                    transition: 'all 0.2s',
                    fontSize: '0.875rem',
                    color: TEXT_DARK,
                    backgroundColor: 'white',
                    appearance: 'none',
                    ':focus': {
                      borderColor: ED_TEAL,
                      boxShadow: `0 0 0 2px rgba(7, 166, 152, 0.2)`
                    }
                  }}
                >
                  <option value="">Select...</option>
                  <option value="skilling">skilling</option>
                  <option value="training">training</option>
                  <option value="personality">personality</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: '0.5rem',
                  padding: '0.625rem 1rem',
                  borderRadius: '0.375rem',
                  border: 'none',
                  backgroundColor: ED_TEAL,
                  color: 'white',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  ':hover': {
                    backgroundColor: ED_TEAL_DARK
                  },
                  ':disabled': {
                    opacity: 0.6,
                    cursor: 'not-allowed'
                  }
                }}
              >
                {loading ? 'Creating...' : 'Create Batch'}
              </button>
            </form>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}