// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { useSelector } from "react-redux";
// import { getAssignmentDetail, submitAssignment } from "../services/operations/assignmentApi";
// import DashboardLayout from "../components/common/DashboardLayout"    

// export default function AssignmentDetail() {
//   const { taskId } = useParams();
//   const navigate = useNavigate();
//   const { token } = useSelector((state) => state.auth);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [task, setTask] = useState(null);
//   const [submission, setSubmission] = useState(null);

//   // form state
//   const [submissionText, setSubmissionText] = useState("");
//   const [links, setLinks] = useState([""]);
//   const [files, setFiles] = useState([]);

//   useEffect(() => {
//     let mounted = true;
//     (async () => {
//       try {
//         const data = await getAssignmentDetail(taskId, token);
//         if (!mounted) return;
//         setTask(data?.task || null);
//         setSubmission(data?.submission || null);
//         if (data?.submission) {
//           setSubmissionText(data.submission.submissionText || "");
//           setLinks(Array.isArray(data.submission.links) && data.submission.links.length ? data.submission.links : [""]);
//         }
//       } catch (e) {
//         if (mounted) setError(e?.message || "Failed to load assignment");
//       } finally {
//         if (mounted) setLoading(false);
//       }
//     })();
//     return () => { mounted = false; };
//   }, [taskId, token]);

//   const handleAddLink = () => setLinks((prev) => [...prev, ""]);
//   const handleRemoveLink = (idx) => setLinks((prev) => prev.filter((_, i) => i !== idx));
//   const handleChangeLink = (idx, val) => setLinks((prev) => prev.map((v, i) => (i === idx ? val : v)));

//   const handleFileChange = (e) => {
//     const selected = Array.from(e.target.files || []);
//     setFiles(selected);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await submitAssignment({ taskId, token, submissionText, links: links.filter(Boolean), files });
//       // refetch to show updated
//       const data = await getAssignmentDetail(taskId, token);
//       setTask(data?.task || null);
//       setSubmission(data?.submission || null);
//     } catch (_) {}
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center p-8">
//         <div className="animate-spin h-8 w-8 border-2 border-teal-500 border-t-transparent rounded-full" />
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="p-6">
//         <button onClick={() => navigate(-1)} className="text-teal-700 hover:underline mb-4">Back</button>
//         <div className="text-red-600 font-medium">{error}</div>
//       </div>
//     );
//   }

//   if (!task) {
//     return (
//       <div className="p-6">
//         <button onClick={() => navigate(-1)} className="text-teal-700 hover:underline mb-4">Back</button>
//         <div className="text-gray-600">Assignment not found.</div>
//       </div>
//     );
//   }

//   return (
//     <DashboardLayout>
//         <div className="p-6 space-y-6">
//       <button onClick={() => navigate(-1)} className="text-teal-700 hover:underline">Back</button>

//       <div className="space-y-2">
//         <h1 className="text-2xl font-semibold">{task.title}</h1>
//         {task.batch?.name && <p className="text-sm text-gray-600">Batch: {task.batch.name}</p>}
//         {task.dueDate && <p className="text-sm text-gray-600">Due: {new Date(task.dueDate).toLocaleString()}</p>}
//         {task.description && <p className="text-gray-800 mt-2 whitespace-pre-line">{task.description}</p>}
//       </div>

//       <div className="grid gap-4">
//         <div className="border rounded-lg p-4">
//           <h2 className="text-lg font-semibold mb-2">Your Submission</h2>
//           {submission ? (
//             <div className="space-y-2 text-sm text-gray-700">
//               {submission.submittedAt && <p>Submitted: {new Date(submission.submittedAt).toLocaleString()}</p>}
//               {typeof submission.score === "number" && <p>Score: {submission.score}</p>}
//               {submission.feedback && <p>Feedback: {submission.feedback}</p>}
//               {Array.isArray(submission.links) && submission.links.length > 0 && (
//                 <div>
//                   <p className="font-medium">Links:</p>
//                   <ul className="list-disc ml-5">
//                     {submission.links.map((l, i) => (
//                       <li key={i}><a className="text-teal-700 hover:underline" href={l} target="_blank" rel="noreferrer">{l}</a></li>
//                     ))}
//                   </ul>
//                 </div>
//               )}
//               {Array.isArray(submission.files) && submission.files.length > 0 && (
//                 <div>
//                   <p className="font-medium">Files:</p>
//                   <ul className="list-disc ml-5">
//                     {submission.files.map((f, i) => (
//                       <li key={i}><a className="text-teal-700 hover:underline" href={f.url} target="_blank" rel="noreferrer">{f.originalName || `File ${i+1}`}</a></li>
//                     ))}
//                   </ul>
//                 </div>
//               )}
//             </div>
//           ) : (
//             <p className="text-gray-600">No submission yet.</p>
//           )}
//         </div>

//         <form onSubmit={handleSubmit} className="border rounded-lg p-4 space-y-4">
//           <h2 className="text-lg font-semibold">Submit </h2>

//           <div>
//             <label className="block text-sm font-medium mb-1">Submission Text</label>
//             <textarea
//               className="w-full border rounded-md p-2"
//               rows={5}
//               value={submissionText}
//               onChange={(e) => setSubmissionText(e.target.value)}
//               placeholder="Write your answer or notes here"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium mb-1">Links</label>
//             <div className="space-y-2">
//               {links.map((val, idx) => (
//                 <div key={idx} className="flex gap-2">
//                   <input
//                     type="url"
//                     className="flex-1 border rounded-md p-2"
//                     value={val}
//                     onChange={(e) => handleChangeLink(idx, e.target.value)}
//                     placeholder="https://..."
//                   />
//                   <button type="button" className="px-3 py-2 border rounded-md" onClick={() => handleRemoveLink(idx)}>Remove</button>
//                 </div>
//               ))}
//               <button type="button" className="px-3 py-2 bg-gray-100 rounded-md" onClick={handleAddLink}>+ Add link</button>
//             </div>
//           </div>

//           <div>
//             <label className="block text-sm font-medium mb-1">Files</label>
//             <input type="file" multiple onChange={handleFileChange} className="block" />
//             {files?.length > 0 && (
//               <p className="text-xs text-gray-600 mt-1">{files.length} file(s) selected</p>
//             )}
//           </div>

//           <div className="flex gap-3">
//             <button type="submit" className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700">Submit</button>
//             <button type="button" className="px-4 py-2 border rounded-md" onClick={() => navigate("/dashboard/assignments")}>Back to list</button>
//           </div>
//         </form>
//       </div>
//     </div>
//     </DashboardLayout>
//   );
// }

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getAssignmentDetail, submitAssignment } from "../services/operations/assignmentApi";
import DashboardLayout from "../components/common/DashboardLayout";

const ED_TEAL = "#07A698";
const ED_TEAL_DARK = "#059a8c";
const BORDER = "#e0e0e0";
const TEXT_DARK = "#191A1F";

export default function AssignmentDetail() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [task, setTask] = useState(null);
  const [submission, setSubmission] = useState(null);

  // form state
  const [submissionText, setSubmissionText] = useState("");
  const [links, setLinks] = useState([""]);
  const [files, setFiles] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getAssignmentDetail(taskId, token);
        if (!mounted) return;
        setTask(data?.task || null);
        setSubmission(data?.submission || null);
        if (data?.submission) {
          setSubmissionText(data.submission.submissionText || "");
          setLinks(
            Array.isArray(data.submission.links) && data.submission.links.length
              ? data.submission.links
              : [""]
          );
        }
      } catch (e) {
        if (mounted) setError(e?.message || "Failed to load assignment");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [taskId, token]);

  const handleAddLink = () => setLinks((prev) => [...prev, ""]);
  const handleRemoveLink = (idx) =>
    setLinks((prev) => prev.filter((_, i) => i !== idx));
  const handleChangeLink = (idx, val) =>
    setLinks((prev) => prev.map((v, i) => (i === idx ? val : v)));

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    setFiles(selected);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await submitAssignment({
        taskId,
        token,
        submissionText,
        links: links.filter(Boolean),
        files,
      });
      const data = await getAssignmentDetail(taskId, token);
      setTask(data?.task || null);
      setSubmission(data?.submission || null);
    } catch (_) {}
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "32px" }}>
        <div
          style={{
            width: "32px",
            height: "32px",
            border: `3px solid ${ED_TEAL}`,
            borderTop: "3px solid transparent",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "24px" }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            color: ED_TEAL,
            textDecoration: "underline",
            marginBottom: "16px",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          Back
        </button>
        <div style={{ color: "red", fontWeight: "500" }}>{error}</div>
      </div>
    );
  }

  if (!task) {
    return (
      <div style={{ padding: "24px" }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            color: ED_TEAL,
            textDecoration: "underline",
            marginBottom: "16px",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          Back
        </button>
        <div style={{ color: "#6b7280" }}>Assignment not found.</div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div
        style={{
          padding: "32px",
        // maxWidth: "1100px",
        width: "80%",
          marginLeft:"20px",
          color: TEXT_DARK,
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            color: ED_TEAL,
            textDecoration: "underline",
            marginBottom: "20px",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          ← Back
        </button>

        <div style={{ marginBottom: "24px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "600", marginBottom: "8px" }}>
            {task.title}
          </h1>
          {task.batch?.name && (
            <p style={{ fontSize: "14px", color: "#6b7280" }}>
              Batch: {task.batch.name}
            </p>
          )}
          {task.dueDate && (
            <p style={{ fontSize: "14px", color: "#6b7280" }}>
              Due: {new Date(task.dueDate).toLocaleString()}
            </p>
          )}
          {/* {task.description && (
            <p
              style={{
                marginTop: "12px",
                whiteSpace: "pre-line",
                lineHeight: "1.6",
              }}
            >
              {task.description}
            </p>
          )} */}
        </div>

        <div style={{ display: "grid", gap: "24px" }}>
          {/* Submission card */}
          <div
            style={{
              border: `1px solid ${BORDER}`,
              borderRadius: "12px",
              padding: "20px",
              background: "#fff",
              boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
            }}
          >
            <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "12px" }}>
              Your Submission
            </h2>
            {submission ? (
              <div style={{ fontSize: "14px", color: "#374151", lineHeight: "1.6" }}>
                {submission.submittedAt && (
                  <p>Submitted: {new Date(submission.submittedAt).toLocaleString()}</p>
                )}
                {typeof submission.score === "number" && <p>Score: {submission.score}</p>}
                {submission.feedback && <p>Feedback: {submission.feedback}</p>}
                {Array.isArray(submission.links) && submission.links.length > 0 && (
                  <div>
                    <p style={{ fontWeight: "500" }}>Links:</p>
                    <ul style={{ marginLeft: "20px", listStyle: "disc" }}>
                      {submission.links.map((l, i) => (
                        <li key={i}>
                          <a
                            href={l}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: ED_TEAL, textDecoration: "underline" }}
                          >
                            {l}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {Array.isArray(submission.files) && submission.files.length > 0 && (
                  <div>
                    <p style={{ fontWeight: "500" }}>Files:</p>
                    <ul style={{ marginLeft: "20px", listStyle: "disc" }}>
                      {submission.files.map((f, i) => (
                        <li key={i}>
                          <a
                            href={f.url}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: ED_TEAL, textDecoration: "underline" }}
                          >
                            {f.originalName || `File ${i + 1}`}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p style={{ color: "#6b7280" }}>No submission yet.</p>
            )}
          </div>

          {/* Submit form */}
          <form
            onSubmit={handleSubmit}
            style={{
              border: `1px solid ${BORDER}`,
              borderRadius: "12px",
              padding: "20px",
              background: "#fff",
              boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
              display: "grid",
              gap: "16px",
            }}
          >
            <h2 style={{ fontSize: "18px", fontWeight: "600" }}>Submit</h2>

            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "500", marginBottom: "6px" }}>
                Submission Text
              </label>
              <textarea
                style={{
                  width: "100%",
                  border: `1px solid ${BORDER}`,
                  borderRadius: "8px",
                  padding: "10px",
                  fontSize: "14px",
                  minHeight: "120px",
                }}
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                placeholder="Write your answer or notes here"
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "500", marginBottom: "6px" }}>
                Links
              </label>
              <div style={{ display: "grid", gap: "8px" }}>
                {links.map((val, idx) => (
                  <div key={idx} style={{ display: "flex", gap: "8px" }}>
                    <input
                      type="url"
                      style={{
                        flex: 1,
                        border: `1px solid ${BORDER}`,
                        borderRadius: "8px",
                        padding: "10px",
                        fontSize: "14px",
                      }}
                      value={val}
                      onChange={(e) => handleChangeLink(idx, e.target.value)}
                      placeholder="https://..."
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveLink(idx)}
                      style={{
                        padding: "8px 12px",
                        border: `1px solid ${BORDER}`,
                        borderRadius: "8px",
                        background: "#f9fafb",
                        cursor: "pointer",
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddLink}
                  style={{
                    padding: "8px 12px",
                    border: `1px solid ${BORDER}`,
                    borderRadius: "8px",
                    background: "#f9fafb",
                    cursor: "pointer",
                  }}
                >
                  + Add link
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "500", marginBottom: "6px" }}>
                Files
              </label>
              <input type="file" multiple onChange={handleFileChange} />
              {files?.length > 0 && (
                <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "6px" }}>
                  {files.length} file(s) selected
                </p>
              )}
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                type="submit"
                style={{
                  padding: "10px 20px",
                  background: ED_TEAL,
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
                onMouseOver={(e) => (e.target.style.background = ED_TEAL_DARK)}
                onMouseOut={(e) => (e.target.style.background = ED_TEAL)}
              >
                Submit
              </button>
              <button
                type="button"
                onClick={() => navigate("/dashboard/assignments")}
                style={{
                  padding: "10px 20px",
                  border: `1px solid ${BORDER}`,
                  borderRadius: "8px",
                  background: "#f9fafb",
                  cursor: "pointer",
                  color: ED_TEAL,
                }}
              >
                Back to list
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}

