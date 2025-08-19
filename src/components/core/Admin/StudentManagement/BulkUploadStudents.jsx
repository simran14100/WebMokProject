// import React, { useEffect, useMemo, useState } from "react"
// import { useSelector } from "react-redux"
// import { bulkUploadStudents, downloadStudentsTemplate, getBatches } from "../../../../services/operations/adminApi"
// import DashboardLayout from "../../../common/DashboardLayout"
// export default function BulkUploadStudents() {
//   const { token } = useSelector((state) => state.auth)
//   const [batches, setBatches] = useState([])
//   const [batchId, setBatchId] = useState("")
//   const [file, setFile] = useState(null)
//   const [loading, setLoading] = useState(false)

//   const canSubmit = useMemo(() => Boolean(batchId && file), [batchId, file])

//   useEffect(() => {
//     async function fetchBatches() {
//       try {
//         const data = await getBatches({ token, page: 1, limit: 100 })
//         const list = Array.isArray(data?.batches) ? data.batches : (Array.isArray(data) ? data : [])
//         setBatches(list)
//       } catch (_) {}
//     }
//     if (token) fetchBatches()
//   }, [token])

//   const onDownloadTemplate = async () => {
//     try {
//       const blob = await downloadStudentsTemplate(token)
//       const url = URL.createObjectURL(blob)
//       const a = document.createElement("a")
//       a.href = url
//       a.download = "students_template.csv"
//       document.body.appendChild(a)
//       a.click()
//       a.remove()
//       URL.revokeObjectURL(url)
//     } catch (_) {}
//   }

//   const onFileChange = (e) => {
//     const f = e.target.files?.[0]
//     if (!f) return
//     const allowed = ["text/csv", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"]
//     if (!allowed.includes(f.type) && !f.name.toLowerCase().endsWith(".csv") && !f.name.toLowerCase().endsWith(".xlsx")) {
//       alert("Please select a CSV or XLSX file")
//       return
//     }
//     setFile(f)
//   }

//   const onSubmit = async (e) => {
//     e.preventDefault()
//     if (!canSubmit) return
//     setLoading(true)
//     try {
//       const result = await bulkUploadStudents({ batchId, file }, token)
//       // Simple feedback
//       alert(`Created: ${result.created} | Skipped: ${result.skipped}\nErrors: ${result.errors?.length || 0}`)
//       setFile(null)
//       // reset file input
//       const input = document.getElementById("bulk-file-input")
//       if (input) input.value = ""
//     } catch (_) {
//       // errors already toasted
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <DashboardLayout>

// <div className="max-w-3xl mx-auto p-6">
//       <h1 className="text-2xl font-semibold mb-4">Bulk Upload Students</h1>
//       <p className="text-sm text-gray-600 mb-6">
//         Upload a CSV or XLSX file to create students in bulk and assign them to a selected batch. Existing emails will be added to the batch and skipped from creation.
//       </p>

//       <div className="mb-6">
//         <button onClick={onDownloadTemplate} className="px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700">
//           Download CSV Template
//         </button>
//       </div>

//       <form onSubmit={onSubmit} className="space-y-5">
//         <div>
//           <label className="block text-sm font-medium mb-1">Select Batch</label>
//           <select
//             className="w-full border rounded-md px-3 py-2"
//             value={batchId}
//             onChange={(e) => setBatchId(e.target.value)}
//           >
//             <option value="" disabled>{batches?.length ? "Select a batch" : "No batches found"}</option>
//             {batches?.length ? (
//               batches.map((b) => {
//                 const label = b.name || b.title || b.batchName || b._id
//                 return (
//                   <option key={b._id} value={b._id}>
//                     {label}
//                   </option>
//                 )
//               })
//             ) : null}
//           </select>
//           {!batches?.length && (
//             <p className="text-xs text-gray-600 mt-2">
//               You have no batches yet. Create one from Admin → Batches → Create.
//             </p>
//           )}
//         </div>

//         <div>
//           <label className="block text-sm font-medium mb-1">Upload File (CSV or XLSX)</label>
//           <input
//             id="bulk-file-input"
//             type="file"
//             accept=".csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//             className="w-full"
//             onChange={onFileChange}
//           />
//           {file && (
//             <p className="text-xs text-gray-600 mt-2">Selected: {file.name}</p>
//           )}
//         </div>

//         <div className="pt-2">
//           <button
//             type="submit"
//             disabled={!canSubmit || loading}
//             className={`px-4 py-2 rounded-md text-white ${canSubmit ? "bg-emerald-600 hover:bg-emerald-700" : "bg-gray-400 cursor-not-allowed"}`}
//           >
//             {loading ? "Uploading..." : "Upload"}
//           </button>
//         </div>
//       </form>
//     </div>
//     </DashboardLayout>
//   )
// }


import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  bulkUploadStudents,
  downloadStudentsTemplate,
  getBatches,
} from "../../../../services/operations/adminApi";
import DashboardLayout from "../../../common/DashboardLayout";

const ED_TEAL = "#07A698";
const ED_TEAL_DARK = "#059a8c";
const TEXT_DARK = '#191A1F';

export default function BulkUploadStudents() {
  const { token } = useSelector((state) => state.auth);
  const [batches, setBatches] = useState([]);
  const [batchId, setBatchId] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => Boolean(batchId && file), [batchId, file]);

  useEffect(() => {
    async function fetchBatches() {
      try {
        const data = await getBatches({ token, page: 1, limit: 100 });
        const list = Array.isArray(data?.batches)
          ? data.batches
          : Array.isArray(data)
          ? data
          : [];
        setBatches(list);
      } catch (_) {}
    }
    if (token) fetchBatches();
  }, [token]);

  const onDownloadTemplate = async () => {
    try {
      const blob = await downloadStudentsTemplate(token);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "students_template.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (_) {}
  };

  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const allowed = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    if (
      !allowed.includes(f.type) &&
      !f.name.toLowerCase().endsWith(".csv") &&
      !f.name.toLowerCase().endsWith(".xlsx")
    ) {
      alert("Please select a CSV or XLSX file");
      return;
    }
    setFile(f);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    try {
      const result = await bulkUploadStudents({ batchId, file }, token);
      alert(
        `Created: ${result.created} | Skipped: ${result.skipped}\nErrors: ${
          result.errors?.length || 0
        }`
      );
      setFile(null);
      const input = document.getElementById("bulk-file-input");
      if (input) input.value = "";
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="bulk-container">

      <div className="category-header">
          <h2>Create Student</h2>
          <div className="breadcrumb">
            <span>Students</span>
            <span className="divider">/</span>
            <span className="active">Create Multiple Students</span>
          </div>
        </div>
        <div className="bulk-card">
          <h5 className="bulk-title">Create Multiple Students</h5>
          <p className="bulk-desc">
            Upload a <strong>CSV</strong> or <strong>XLSX</strong> file to
            create students in bulk and assign them to a selected batch.
          </p>

          <div className="download-btn-wrapper">
            <button onClick={onDownloadTemplate} className="download-btn">
              Download CSV Template
            </button>
          </div>

          <form onSubmit={onSubmit} className="bulk-form">
            <div className="form-group">
              <label>Select Batch</label>
              <select
                className="form-input"
                value={batchId}
                onChange={(e) => setBatchId(e.target.value)}
              >
                <option value="" disabled>
                  {batches?.length ? "Select a batch" : "No batches found"}
                </option>
                {batches?.length
                  ? batches.map((b) => {
                      const label =
                        b.name || b.title || b.batchName || b._id;
                      return (
                        <option key={b._id} value={b._id}>
                          {label}
                        </option>
                      );
                    })
                  : null}
              </select>
            </div>

            <div className="form-group">
              <label>Upload File (CSV or XLSX)</label>
              <input
                id="bulk-file-input"
                type="file"
                accept=".csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                className="form-input"
                onChange={onFileChange}
              />
              {file && <p className="note">Selected: {file.name}</p>}
            </div>

            <div className="submit-wrapper">
              <button
                type="submit"
                disabled={!canSubmit || loading}
                className={`submit-btn ${!canSubmit || loading ? "disabled" : ""}`}
              >
                {loading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Scoped styles */}
      <style jsx>{`
       .divider {
            color: #cbd5e0;
          }

          .active {
            color: ${ED_TEAL};
            font-weight: 500;
          }

        .bulk-container {
          max-width: 900px;
         margin-left: -130px;
          
          padding: 2rem;
        }
        .bulk-card {
          background: #fff;
          padding: 2.5rem;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          border: 1px solid #e5e7eb;
        }
        .bulk-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: ${TEXT_DARK};
        }
        .bulk-desc {
          font-size: 0.95rem;
          color: #555;
          margin-bottom: 2rem;
          line-height: 1.6;
        }
        .download-btn-wrapper {
          margin-bottom: 1.5rem;
        }
        .download-btn {
          background-color: ${ED_TEAL};
          color: white;
          padding: 0.75rem 1.25rem;
          border: none;
          border-radius: 8px;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s ease-in-out;
        }
        .download-btn:hover {
          background-color: ${ED_TEAL_DARK};
        }
        .bulk-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .form-group {
          display: flex;
          flex-direction: column;
        }
        .form-group label {
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #333;
        }
        .form-input {
          padding: 0.65rem 0.8rem;
          border: 1px solid #ccc;
          border-radius: 8px;
          font-size: 0.95rem;
          outline: none;
          transition: border 0.2s;
        }
        .form-input:focus {
          border-color: ${ED_TEAL};
          box-shadow: 0 0 0 2px rgba(7, 166, 152, 0.2);
        }
        .note {
          font-size: 0.8rem;
          margin-top: 0.4rem;
          color: #666;
        }
        .submit-wrapper {
          margin-top: 1rem;
        }
        .submit-btn {
          background-color: ${ED_TEAL};
          color: #fff;
          padding: 0.75rem 1.25rem;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s ease-in-out;
        }
        .submit-btn:hover {
          background-color: ${ED_TEAL_DARK};
        }
        .submit-btn.disabled {
          background-color: #aaa;
          cursor: not-allowed;
        }
        @media (max-width: 768px) {
          .bulk-card {
            padding: 1.5rem;
          }
          .bulk-title {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </DashboardLayout>
  );
}
