import React, { useEffect, useMemo, useState } from "react";

export default function VisitorLogs() {
  const ED_TEAL = "#14b8a6";
  const BORDER = "#e5e7eb";
  const TEXT = "#334155";
  const API_URL = "http://localhost:4000/api/v1/ugpg-visitor-log"; // UG/PG Visitor Logs (separate from PhD)
  const PURPOSE_API_URL = "http://localhost:4000/api/v1/visit-purposes"; // Visit purposes master
  const DEPT_API_URL = "http://localhost:4000/api/v1/visit-departments"; // Visit departments master

  // Demo data (replace later with API)
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visitPurposes, setVisitPurposes] = useState([]);
  const [visitDepartments, setVisitDepartments] = useState([]);

  // Table controls
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(() => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().slice(0, 5);
    
    return {
      visitPurpose: "",
      department: "",
      name: "",
      fatherName: "",
      phone: "",
      email: "",
      idNumber: "",
      address: "",
      visitFrom: "",
      date: dateStr, // Set default to today's date
      timeIn: timeStr, // Set default to current time
      timeOut: "",
      totalVisitors: 1,
      remarks: "",
    };
  });

  // Load data (client-side pagination/search retained)
  const fetchRows = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}?limit=1000`);
      const json = await res.json();
      if (json?.success) {
        // Normalize id field for frontend
        const items = (json.data || []).map((it) => ({ id: it._id || it.id, ...it }));
        setRows(items);
      }
    } catch (e) {
      // fail silently for now
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
    // Load visit purposes for dropdown
    (async () => {
      try {
        const res = await fetch(`${PURPOSE_API_URL}`);
        const json = await res.json();
        if (json?.success && Array.isArray(json.data)) {
          setVisitPurposes(json.data);
        } else if (Array.isArray(json)) {
          setVisitPurposes(json);
        } else {
          setVisitPurposes([]);
        }
      } catch (_e) {
        setVisitPurposes([]);
      }
    })();
    // Load visit departments for dropdown
    (async () => {
      try {
        const res = await fetch(`${DEPT_API_URL}`);
        const json = await res.json();
        if (json?.success && Array.isArray(json.data)) {
          setVisitDepartments(json.data);
        } else if (Array.isArray(json)) {
          setVisitDepartments(json);
        } else {
          setVisitDepartments([]);
        }
      } catch (_e) {
        setVisitDepartments([]);
      }
    })();
  }, []);

  // Filter + paginate
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [
        r.visitPurpose,
        r.department,
        r.name,
        r.fatherName,
        r.phone,
        r.email,
        r.idNumber,
        r.address,
        r.visitFrom,
        r.date,
        r.timeIn,
        r.timeOut,
        String(r.totalVisitors),
        r.remarks,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [rows, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  const paginated = useMemo(() => {
    const start = (page - 1) * limit;
    return filtered.slice(start, start + limit);
  }, [filtered, page, limit]);

  // Handlers
  const openAdd = () => {
    // Prefill date and time in as per UI mock
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const hh = String(now.getHours()).padStart(2, "0");
    const min = String(now.getMinutes()).padStart(2, "0");
    const today = `${yyyy}-${mm}-${dd}`; // HTML date input format
    const timeNow = `${hh}:${min}`; // HTML time input format
    setEditId(null);
    setForm({
      visitPurpose: "",
      department: "",
      name: "",
      fatherName: "",
      phone: "",
      email: "",
      idNumber: "",
      address: "",
      visitFrom: "",
      date: today,
      timeIn: timeNow,
      timeOut: "",
      totalVisitors: 1,
      remarks: "",
    });
    setModalOpen(true);
  };
  const openEdit = (row) => {
    setEditId(row.id);
    setForm({
      visitPurpose: row.visitPurpose || "",
      department: row.department || "",
      name: row.name || "",
      fatherName: row.fatherName || "",
      phone: row.phone || "",
      email: row.email || "",
      idNumber: row.idNumber || "",
      address: row.address || "",
      visitFrom: row.visitFrom || "",
      date: row.date || "",
      timeIn: row.timeIn || "",
      timeOut: row.timeOut || "",
      totalVisitors: row.totalVisitors || 1,
      remarks: row.remarks || "",
    });
    setModalOpen(true);
  };
  const saveRow = async () => {
    // Validate required fields
    const phoneDigits = String(form.phone || '').replace(/\D/g, '');
    if (!form.visitPurpose || !form.department || !form.name.trim() || !/^\d{10}$/.test(phoneDigits)) {
      alert('Please fill in all required fields and a valid 10-digit Phone number');
      return;
    }
    
    try {
      const method = editId ? "PUT" : "POST";
      const url = editId ? `${API_URL}/${editId}` : `${API_URL}`;
      const payload = { ...form, phone: phoneDigits };
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      const json = await res.json();
      
      if (!res.ok) {
        // Handle HTTP errors (4xx, 5xx)
        const errorMessage = json?.message || 'An error occurred while saving the visitor log';
        throw new Error(errorMessage);
      }
      
      if (json?.success) {
        await fetchRows();
        setModalOpen(false);
      } else {
        // Handle API-level errors (success: false)
        throw new Error(json?.message || 'Failed to save visitor log');
      }
    } catch (e) {
      console.error('Error saving visitor log:', e);
      alert(`Error: ${e.message}`);
    }
  };
  const removeRow = async (row) => {
    if (!window.confirm("Delete this visitor entry?")) return;
    try {
      await fetch(`${API_URL}/${row.id}`, { method: "DELETE" });
      await fetchRows();
    } catch (e) {
      // no-op
    }
  };

  return (

    // <div style={{ 
    //   padding: 24, 
    //   fontFamily: "'Inter', sans-serif", 
    //   position: 'relative', 
    //   zIndex: 1, 
    //   marginTop: "11rem",
    //   background: "#f8fafc",
    //   minHeight: "100vh"
    // }}>
    //   <div
    //     style={{ 
    //       background: "#fff", 
    //       border: `1px solid ${BORDER}`, 
    //       borderRadius: 16, 
    //       boxShadow: "0 4px 20px rgba(0,0,0,0.08)", 
    //       padding: 24,
    //       margin: "0 auto",
    //       maxWidth: "95%",
    //       transition: "all 0.3s ease"
    //     }}
    //     onContextMenu={(e) => {
    //       e.preventDefault();
    //       openAdd();
    //     }}
    //     title="Right-click anywhere on this card to add a new visitor"
    //   >
    //     {/* Header */}
    //     <div style={{ 
    //       display: "flex", 
    //       justifyContent: "space-between", 
    //       alignItems: "center",
    //       paddingBottom: 20,
    //       borderBottom: `1px solid ${BORDER}`,
    //       marginBottom: 24
    //     }}>
    //       <div>
    //         <h3 style={{ 
    //           fontSize: 24, 
    //           fontWeight: 700, 
    //           color: TEXT, 
    //           margin: 0,
    //           marginBottom: 4
    //         }}>Manage Visitors</h3>
    //         <p style={{ 
    //           fontSize: 14, 
    //           color: "#64748b", 
    //           margin: 0 
    //         }}>Track and manage visitor records</p>
    //       </div>
    //       <button 
    //         onClick={openAdd} 
    //         style={{ 
    //           background: ED_TEAL, 
    //           color: "#fff", 
    //           border: "none", 
    //           padding: "12px 24px", 
    //           borderRadius: 10,
    //           fontSize: 14,
    //           fontWeight: 600,
    //           cursor: "pointer",
    //           transition: "all 0.3s ease",
    //           boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    //           display: "flex",
    //           alignItems: "center",
    //           gap: 8
    //         }}
    //         onMouseOver={(e) => {
    //           e.target.style.background = "#008080";
    //           e.target.style.transform = "translateY(-2px)";
    //           e.target.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
    //         }}
    //         onMouseOut={(e) => {
    //           e.target.style.background = ED_TEAL;
    //           e.target.style.transform = "translateY(0)";
    //           e.target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
    //         }}
    //       >
    //         <span style={{ fontSize: 16 }}>+</span> Add New Visitor
    //       </button>
    //     </div>
    
    //     {/* Controls */}
    //     <div style={{ 
    //       display: "flex", 
    //       justifyContent: "space-between", 
    //       alignItems: "center", 
    //       marginBottom: 24,
    //       flexWrap: "wrap",
    //       gap: 16
    //     }}>
    //       <div style={{ 
    //         display: "flex", 
    //         alignItems: "center", 
    //         gap: 12,
    //         background: "#f8fafc",
    //         padding: "8px 16px",
    //         borderRadius: 10,
    //         border: `1px solid ${BORDER}`
    //       }}>
    //         <span style={{ 
    //           color: TEXT, 
    //           fontSize: 14,
    //           fontWeight: 500 
    //         }}>Show</span>
    //         <select 
    //           value={limit} 
    //           onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }} 
    //           style={{ 
    //             border: `1px solid ${BORDER}`, 
    //             borderRadius: 8, 
    //             padding: "8px 12px",
    //             background: "#fff",
    //             fontSize: 14,
    //             cursor: "pointer",
    //             transition: "all 0.2s ease"
    //           }}
    //         >
    //           <option value={10}>10</option>
    //           <option value={25}>25</option>
    //           <option value={50}>50</option>
    //         </select>
    //         <span style={{ 
    //           color: TEXT, 
    //           fontSize: 14,
    //           fontWeight: 500 
    //         }}>entries</span>
    //       </div>
    //       <div style={{ 
    //         display: "flex", 
    //         alignItems: "center", 
    //         gap: 12,
    //         background: "#f8fafc",
    //         padding: "8px 16px",
    //         borderRadius: 10,
    //         border: `1px solid ${BORDER}`
    //       }}>
    //         <label style={{ 
    //           color: TEXT, 
    //           fontSize: 14,
    //           fontWeight: 500 
    //         }}>Search:</label>
    //         <input 
    //           value={search} 
    //           onChange={(e) => { setPage(1); setSearch(e.target.value); }} 
    //           placeholder="Search visitors..." 
    //           style={{ 
    //             border: `1px solid ${BORDER}`, 
    //             borderRadius: 8, 
    //             padding: "10px 16px", 
    //             width: 280,
    //             fontSize: 14,
    //             transition: "all 0.2s ease",
    //             outline: "none"
    //           }}
    //           onFocus={(e) => {
    //             e.target.style.borderColor = ED_TEAL;
    //             e.target.style.boxShadow = "0 0 0 3px rgba(0, 128, 128, 0.1)";
    //           }}
    //           onBlur={(e) => {
    //             e.target.style.borderColor = BORDER;
    //             e.target.style.boxShadow = "none";
    //           }}
    //         />
    //       </div>
    //     </div>
    
    //     {/* Table Container */}
    //     <div style={{ 
    //       background: "#fff", 
    //       border: `1px solid ${BORDER}`, 
    //       borderRadius: 12, 
    //       overflow: "hidden",
    //       boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    //       marginBottom: 24
    //     }}>
    //       {/* Table Header */}
    //       <div style={{ 
    //         display: "grid", 
    //         gridTemplateColumns: "1.5fr 2.5fr 2.5fr 2.5fr 2fr 3fr 2fr 2fr 2fr 2fr 2fr 3fr", 
    //         background: "linear-gradient(135deg, #008080 0%, #006666 100%)",
    //         color: "#fff", 
    //         padding: "16px 20px", 
    //         fontWeight: 600,
    //         fontSize: 13,
    //         alignItems: "center"
    //       }}>
    //         <div>Action</div>
    //         <div>Visit Purpose</div>
    //         <div>Department</div>
    //         <div>Name</div>
    //         <div>Phone</div>
    //         <div>Address</div>
    //         <div>Visit From</div>
    //         <div>Date</div>
    //         <div>Time In</div>
    //         <div>Time Out</div>
    //         <div>Total Visitors</div>
    //         <div>Remarks</div>
    //       </div>
          
    //       {/* Table Body */}
    //       <div style={{ maxHeight: 600, overflowY: "auto" }}>
    //         {loading && (
    //           <div style={{ 
    //             padding: 40, 
    //             textAlign: "center", 
    //             color: TEXT,
    //             fontSize: 16
    //           }}>
    //             <div style={{ 
    //               display: "inline-block",
    //               width: 20,
    //               height: 20,
    //               border: `2px solid ${BORDER}`,
    //               borderTop: `2px solid ${ED_TEAL}`,
    //               borderRadius: "50%",
    //               animation: "spin 1s linear infinite",
    //               marginRight: 12
    //             }}></div>
    //             Loading visitors...
    //           </div>
    //         )}
            
    //         {!loading && paginated.map((row, index) => (
    //           <div 
    //             key={row.id} 
    //             style={{ 
    //               display: "grid", 
    //               gridTemplateColumns: "1.5fr 2.5fr 2.5fr 2.5fr 2fr 3fr 2fr 2fr 2fr 2fr 2fr 3fr", 
    //               alignItems: "center", 
    //               padding: "16px 20px", 
    //               borderBottom: `1px solid ${BORDER}`,
    //               background: index % 2 === 0 ? "#fafafa" : "#fff",
    //               transition: "all 0.2s ease",
    //               fontSize: 13
    //             }}
    //             onMouseOver={(e) => {
    //               e.currentTarget.style.background = "#f0f9ff";
    //             }}
    //             onMouseOut={(e) => {
    //               e.currentTarget.style.background = index % 2 === 0 ? "#fafafa" : "#fff";
    //             }}
    //           >
    //             <div style={{ display: "flex", gap: 8 }}>
    //               <button 
    //                 onClick={() => openEdit(row)} 
    //                 style={{ 
    //                   padding: "6px 12px", 
    //                   borderRadius: 6, 
    //                   border: `1px solid ${ED_TEAL}`, 
    //                   background: "#fff", 
    //                   color: ED_TEAL,
    //                   fontSize: 12,
    //                   fontWeight: 500,
    //                   cursor: "pointer",
    //                   transition: "all 0.2s ease"
    //                 }}
    //                 onMouseOver={(e) => {
    //                   e.target.style.background = ED_TEAL;
    //                   e.target.style.color = "#fff";
    //                 }}
    //                 onMouseOut={(e) => {
    //                   e.target.style.background = "#fff";
    //                   e.target.style.color = ED_TEAL;
    //                 }}
    //               >
    //                 Edit
    //               </button>
    //               <button 
    //                 onClick={() => removeRow(row)} 
    //                 style={{ 
    //                   padding: "6px 12px", 
    //                   borderRadius: 6, 
    //                   border: `1px solid #ef4444`, 
    //                   background: "#fff", 
    //                   color: "#ef4444",
    //                   fontSize: 12,
    //                   fontWeight: 500,
    //                   cursor: "pointer",
    //                   transition: "all 0.2s ease"
    //                 }}
    //                 onMouseOver={(e) => {
    //                   e.target.style.background = "#ef4444";
    //                   e.target.style.color = "#fff";
    //                 }}
    //                 onMouseOut={(e) => {
    //                   e.target.style.background = "#fff";
    //                   e.target.style.color = "#ef4444";
    //                 }}
    //               >
    //                 Delete
    //               </button>
    //             </div>
    //             <div style={{ color: TEXT, fontWeight: 500 }}>{row.visitPurpose}</div>
    //             <div style={{ color: TEXT }}>{row.department}</div>
    //             <div style={{ color: TEXT, fontWeight: 600 }}>{row.name}</div>
    //             <div style={{ color: TEXT, fontFamily: "monospace" }}>{row.phone}</div>
    //             <div style={{ color: TEXT }} title={row.address}>
    //               {row.address?.length > 20 ? `${row.address.substring(0, 20)}...` : row.address}
    //             </div>
    //             <div style={{ color: TEXT }}>{row.visitFrom}</div>
    //             <div style={{ color: TEXT, fontFamily: "monospace" }}>{row.date}</div>
    //             <div style={{ color: TEXT, fontFamily: "monospace" }}>{row.timeIn}</div>
    //             <div style={{ color: TEXT, fontFamily: "monospace" }}>{row.timeOut}</div>
    //             <div style={{ color: TEXT, textAlign: "center", fontWeight: 600 }}>{row.totalVisitors}</div>
    //             <div style={{ color: TEXT }} title={row.remarks}>
    //               {row.remarks?.length > 25 ? `${row.remarks.substring(0, 25)}...` : row.remarks}
    //             </div>
    //           </div>
    //         ))}
            
    //         {!loading && paginated.length === 0 && (
    //           <div style={{ 
    //             padding: 40, 
    //             textAlign: "center", 
    //             color: "#64748b",
    //             fontSize: 16
    //           }}>
    //             <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
    //             No visitor records found
    //           </div>
    //         )}
    //       </div>
    //     </div>
    
    //     {/* Footer */}
    //     <div style={{ 
    //       display: "flex", 
    //       justifyContent: "space-between", 
    //       alignItems: "center", 
    //       flexWrap: "wrap",
    //       gap: 16,
    //       paddingTop: 16,
    //       borderTop: `1px solid ${BORDER}`
    //     }}>
    //       <div style={{ 
    //         color: TEXT, 
    //         fontSize: 14,
    //         background: "#f8fafc",
    //         padding: "8px 16px",
    //         borderRadius: 8,
    //         border: `1px solid ${BORDER}`
    //       }}>
    //         Showing {filtered.length === 0 ? 0 : (page - 1) * limit + 1} to {Math.min(page * limit, filtered.length)} of {filtered.length} entries
    //       </div>
    //       <div style={{ display: "flex", gap: 8 }}>
    //         <button 
    //           disabled={page === 1} 
    //           onClick={() => setPage((p) => Math.max(1, p - 1))} 
    //           style={{ 
    //             padding: "10px 16px", 
    //             borderRadius: 8, 
    //             border: `1px solid ${BORDER}`, 
    //             background: page === 1 ? "#f1f5f9" : "#fff",
    //             color: page === 1 ? "#94a3b8" : TEXT,
    //             cursor: page === 1 ? "not-allowed" : "pointer",
    //             fontWeight: 500,
    //             fontSize: 14,
    //             transition: "all 0.2s ease"
    //           }}
    //         >
    //           Previous
    //         </button>
    //         <div style={{ 
    //           padding: "10px 16px", 
    //           borderRadius: 8, 
    //           border: `1px solid ${ED_TEAL}`, 
    //           color: "#fff", 
    //           background: ED_TEAL,
    //           fontWeight: 600,
    //           fontSize: 14
    //         }}>
    //           {page}
    //         </div>
    //         <button 
    //           disabled={page === totalPages} 
    //           onClick={() => setPage((p) => Math.min(totalPages, p + 1))} 
    //           style={{ 
    //             padding: "10px 16px", 
    //             borderRadius: 8, 
    //             border: `1px solid ${BORDER}`, 
    //             background: page === totalPages ? "#f1f5f9" : "#fff",
    //             color: page === totalPages ? "#94a3b8" : TEXT,
    //             cursor: page === totalPages ? "not-allowed" : "pointer",
    //             fontWeight: 500,
    //             fontSize: 14,
    //             transition: "all 0.2s ease"
    //           }}
    //         >
    //           Next
    //         </button>
    //       </div>
    //     </div>
    //   </div>
    
    //   {/* Modal */}
    //   {modalOpen && (
    //     <div style={{ 
    //       position: "fixed", 
    //       inset: 0, 
    //       background: "rgba(0,0,0,0.5)", 
    //       display: "flex", 
    //       alignItems: "center", 
    //       justifyContent: "center", 
    //       zIndex: 1000,
    //       padding: 20
    //     }}>
    //       <div style={{ 
    //         background: "#fff", 
    //         borderRadius: 16, 
    //         width: 900, 
    //         maxWidth: "95vw", 
    //         border: `1px solid ${BORDER}`,
    //         boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
    //         animation: "modalSlideIn 0.3s ease-out"
    //       }} 
    //       onContextMenu={(e) => e.preventDefault()}
    //       >
    //         <div style={{ 
    //           background: "linear-gradient(135deg, #fce7f3 0%, #fae8ff 100%)", 
    //           padding: "20px 24px", 
    //           borderTopLeftRadius: 16, 
    //           borderTopRightRadius: 16, 
    //           display: "flex", 
    //           justifyContent: "space-between", 
    //           alignItems: "center",
    //           borderBottom: `1px solid ${BORDER}`
    //         }}>
    //           <div>
    //             <h4 style={{ 
    //               fontSize: 20, 
    //               fontWeight: 700, 
    //               color: TEXT, 
    //               margin: 0,
    //               marginBottom: 4
    //             }}>{editId ? "Edit Visitor" : "Add New Visitor"}</h4>
    //             <p style={{ 
    //               fontSize: 14, 
    //               color: "#64748b", 
    //               margin: 0 
    //             }}>
    //               {editId ? "Update visitor information" : "Fill in the visitor details"}
    //             </p>
    //           </div>
    //           <button 
    //             onClick={() => setModalOpen(false)} 
    //             style={{ 
    //               padding: 8, 
    //               borderRadius: 8, 
    //               border: `1px solid ${BORDER}`, 
    //               background: "#fff",
    //               cursor: "pointer",
    //               fontSize: 18,
    //               color: TEXT,
    //               transition: "all 0.2s ease"
    //             }}
    //             onMouseOver={(e) => {
    //               e.target.style.background = "#ef4444";
    //               e.target.style.color = "#fff";
    //               e.target.style.borderColor = "#ef4444";
    //             }}
    //             onMouseOut={(e) => {
    //               e.target.style.background = "#fff";
    //               e.target.style.color = TEXT;
    //               e.target.style.borderColor = BORDER;
    //             }}
    //           >
    //             ✕
    //           </button>
    //         </div>
            
    //         <div style={{ padding: 24, maxHeight: "70vh", overflowY: "auto" }}>
    //           <div style={{ 
    //             display: "grid", 
    //             gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
    //             gap: 16 
    //           }}>
    //             {[
    //               { label: "Visit Purpose", value: form.visitPurpose, type: "select", options: visitPurposes.filter(p => (p.status ? p.status === 'Active' : true)) },
    //               { label: "Department", value: form.department, type: "select", options: visitDepartments.filter(d => (d.status ? d.status === 'Active' : true)), required: true },
    //               { label: "Visitor Name", value: form.name, type: "text", placeholder: "Enter Visitor Name" },
    //               { label: "Father Name", value: form.fatherName, type: "text", placeholder: "Father Name" },
    //               { label: "Visitor Email", value: form.email, type: "text", placeholder: "Email" },
    //               { label: "Visitor Phone", value: form.phone, type: "text", placeholder: "Phone" },
    //               { label: "Visitor Address", value: form.address, type: "text", placeholder: "Address" },
    //               { label: "Visit From", value: form.visitFrom, type: "text", placeholder: "Car / Bike / Walk-in" },
    //               { label: "ID Number", value: form.idNumber, type: "text", placeholder: "ID Number" },
    //               { label: "Visit Date", value: form.date, type: "date" },
    //               { label: "Visit Time In", value: form.timeIn, type: "time" },
    //               { label: "Total Number of Visitors", value: form.totalVisitors, type: "number", placeholder: "Enter Total Number" }
    //             ].map((field, index) => (
    //               <div key={index}>
    //                 <label style={{ 
    //                   display: "block", 
    //                   color: TEXT, 
    //                   marginBottom: 8, 
    //                   fontSize: 14,
    //                   fontWeight: 600 
    //                 }}>
    //                   {field.label} {field.required && <span style={{color: "#ef4444"}}>*</span>}
    //                 </label>
    //                 {field.type === "select" ? (
    //                   <select 
    //                     value={field.value} 
    //                     onChange={(e) => setForm((v) => ({ ...v, [field.label.toLowerCase().replace(/ /g, '')]: e.target.value }))} 
    //                     style={{ 
    //                       width: "100%", 
    //                       border: `1px solid ${BORDER}`, 
    //                       borderRadius: 8, 
    //                       padding: "12px",
    //                       fontSize: 14,
    //                       transition: "all 0.2s ease",
    //                       outline: "none"
    //                     }}
    //                     onFocus={(e) => {
    //                       e.target.style.borderColor = ED_TEAL;
    //                       e.target.style.boxShadow = "0 0 0 3px rgba(0, 128, 128, 0.1)";
    //                     }}
    //                     onBlur={(e) => {
    //                       e.target.style.borderColor = BORDER;
    //                       e.target.style.boxShadow = "none";
    //                     }}
    //                   >
    //                     <option value="">-- Select {field.label} --</option>
    //                     {field.options.map((option) => (
    //                       <option key={option._id || option.id || option.name} value={option.name}>
    //                         {option.name}
    //                       </option>
    //                     ))}
    //                   </select>
    //                 ) : (
    //                   <input 
    //                     type={field.type} 
    //                     value={field.value} 
    //                     onChange={(e) => setForm((v) => ({ ...v, [field.label.toLowerCase().replace(/ /g, '')]: e.target.value }))} 
    //                     placeholder={field.placeholder} 
    //                     min={field.type === "number" ? 1 : undefined}
    //                     style={{ 
    //                       width: "100%", 
    //                       border: `1px solid ${BORDER}`, 
    //                       borderRadius: 8, 
    //                       padding: "12px",
    //                       fontSize: 14,
    //                       transition: "all 0.2s ease",
    //                       outline: "none"
    //                     }}
    //                     onFocus={(e) => {
    //                       e.target.style.borderColor = ED_TEAL;
    //                       e.target.style.boxShadow = "0 0 0 3px rgba(0, 128, 128, 0.1)";
    //                     }}
    //                     onBlur={(e) => {
    //                       e.target.style.borderColor = BORDER;
    //                       e.target.style.boxShadow = "none";
    //                     }}
    //                   />
    //                 )}
    //               </div>
    //             ))}
                
    //             <div style={{ gridColumn: "1 / -1" }}>
    //               <label style={{ 
    //                 display: "block", 
    //                 color: TEXT, 
    //                 marginBottom: 8, 
    //                 fontSize: 14,
    //                 fontWeight: 600 
    //               }}>
    //                 Remarks
    //               </label>
    //               <textarea 
    //                 rows={3} 
    //                 value={form.remarks} 
    //                 onChange={(e) => setForm((v) => ({ ...v, remarks: e.target.value }))} 
    //                 placeholder="Enter Remarks" 
    //                 style={{ 
    //                   width: "100%", 
    //                   border: `1px solid ${BORDER}`, 
    //                   borderRadius: 8, 
    //                   padding: "12px",
    //                   fontSize: 14,
    //                   transition: "all 0.2s ease",
    //                   outline: "none",
    //                   resize: "vertical"
    //                 }}
    //                 onFocus={(e) => {
    //                   e.target.style.borderColor = ED_TEAL;
    //                   e.target.style.boxShadow = "0 0 0 3px rgba(0, 128, 128, 0.1)";
    //                 }}
    //                 onBlur={(e) => {
    //                   e.target.style.borderColor = BORDER;
    //                   e.target.style.boxShadow = "none";
    //                 }}
    //               />
    //             </div>
    //           </div>
              
    //           <div style={{ 
    //             display: "flex", 
    //             justifyContent: "flex-end", 
    //             gap: 12, 
    //             marginTop: 24,
    //             paddingTop: 16,
    //             borderTop: `1px solid ${BORDER}`
    //           }}>
    //             <button 
    //               onClick={() => setModalOpen(false)} 
    //               style={{ 
    //                 padding: "12px 24px", 
    //                 borderRadius: 8, 
    //                 border: `1px solid ${BORDER}`,
    //                 background: "#fff",
    //                 color: TEXT,
    //                 fontSize: 14,
    //                 fontWeight: 500,
    //                 cursor: "pointer",
    //                 transition: "all 0.2s ease"
    //               }}
    //               onMouseOver={(e) => {
    //                 e.target.style.background = "#f1f5f9";
    //               }}
    //               onMouseOut={(e) => {
    //                 e.target.style.background = "#fff";
    //               }}
    //             >
    //               Cancel
    //             </button>
    //             <button 
    //               onClick={saveRow} 
    //               style={{ 
    //                 padding: "12px 24px", 
    //                 borderRadius: 8, 
    //                 background: ED_TEAL, 
    //                 color: "#fff", 
    //                 border: `1px solid ${ED_TEAL}`,
    //                 fontSize: 14,
    //                 fontWeight: 600,
    //                 cursor: "pointer",
    //                 transition: "all 0.2s ease",
    //                 boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
    //               }}
    //               onMouseOver={(e) => {
    //                 e.target.style.background = "#008080";
    //                 e.target.style.transform = "translateY(-2px)";
    //                 e.target.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
    //               }}
    //               onMouseOut={(e) => {
    //                 e.target.style.background = ED_TEAL;
    //                 e.target.style.transform = "translateY(0)";
    //                 e.target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
    //               }}
    //             >
    //               {editId ? "Update Visitor" : "Add Visitor"}
    //             </button>
    //           </div>
    //         </div>
    //       </div>
    //     </div>
    //   )}
    // </div>
    <div style={{ padding: 20, fontFamily: "sans-serif", position: 'relative', zIndex: 1 , marginTop:"11rem"}}>
      <div
        style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", padding: 16 }}
        onContextMenu={(e) => {
          e.preventDefault();
          openAdd();
        }}
        title="Right-click anywhere on this card to add a new visitor"
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: TEXT, marginLeft: "120px" }}>Manage Visitors</h3>
          <button onClick={openAdd} style={{ background: ED_TEAL, color: "#fff", border: `1px solid ${ED_TEAL}`, padding: "8px 12px", borderRadius: 8, marginRight: "120px" }}>+ Add New</button>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "12px 120px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: TEXT }}>Show</span>
            <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }} style={{ border: `1px solid ${BORDER}`, borderRadius: 8, padding: "6px 10px" }}>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span style={{ color: TEXT }}>entries</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <label style={{ color: TEXT }}>Search:</label>
            <input value={search} onChange={(e) => { setPage(1); setSearch(e.target.value); }} placeholder="Search..." style={{ border: `1px solid ${BORDER}`, borderRadius: 8, padding: "8px 10px", width: 240 }} />
          </div>
        </div>

        {/* Table */}
        <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden", width: "80%", marginLeft: "120px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 2.5fr 2.5fr 2.5fr 2fr 3fr 2fr 2fr 2fr 2fr 2fr 3fr", background: ED_TEAL, color: "#fff", padding: "12px 16px", fontWeight: 500 }}>
            <div>Action</div>
            <div>Visit Purpose</div>
            <div>Department</div>
            <div>Name</div>
            <div>Email</div>
            <div>Address</div>
            <div>Visit From</div>
            <div>Date</div>
            <div>Time In</div>
            <div>Time Out</div>
            <div>Total Visitors</div>
            <div>Remarks</div>
          </div>
          <div>
            {loading && <div style={{ padding: 12, color: TEXT }}>Loading...</div>}
            {!loading && paginated.map((row) => (
              <div key={row.id} style={{ display: "grid", gridTemplateColumns: "1.5fr 2.5fr 2.5fr 2.5fr 2fr 3fr 2fr 2fr 2fr 2fr 2fr 3fr", alignItems: "center", padding: "12px 16px", borderBottom: `1px solid ${BORDER}` }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => openEdit(row)} style={{ padding: "6px 10px", borderRadius: 6, border: `1px solid ${ED_TEAL}`, background: "#fff", color: ED_TEAL }}>Edit</button>
                  <button onClick={() => removeRow(row)} style={{ padding: "6px 10px", borderRadius: 6, border: `1px solid #ef4444`, background: "#fff", color: "#ef4444" }}>Delete</button>
                </div>
                <div style={{ color: TEXT }}>{row.visitPurpose}</div>
                <div style={{ color: TEXT }}>{row.department}</div>
                <div style={{ color: TEXT }}>{row.name}</div>
                <div style={{ color: TEXT }}>{row.email}</div>
                <div style={{ color: TEXT }}>{row.address}</div>
                <div style={{ color: TEXT }}>{row.visitFrom}</div>
                <div style={{ color: TEXT }}>{row.date}</div>
                <div style={{ color: TEXT }}>{row.timeIn}</div>
                <div style={{ color: TEXT }}>{row.timeOut}</div>
                <div style={{ color: TEXT }}>{row.totalVisitors}</div>
                <div style={{ color: TEXT }}>{row.remarks}</div>
              </div>
            ))}
            {!loading && paginated.length === 0 && (
              <div style={{ padding: 12, color: TEXT }}>No records found.</div>
            )}
          </div>
        </div>

        {/* Footer: showing entries + pagination */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "12px 120px" }}>
          <div style={{ color: TEXT }}>
            Showing {filtered.length === 0 ? 0 : (page - 1) * limit + 1} to {Math.min(page * limit, filtered.length)} of {filtered.length} entries
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} style={{ padding: "6px 10px", borderRadius: 6, border: `1px solid ${BORDER}`, background: page === 1 ? "#f5f5f5" : "#fff" }}>Previous</button>
            <div style={{ padding: "6px 10px", borderRadius: 6, border: `1px solid ${ED_TEAL}`, color: "#fff", background: ED_TEAL }}>{page}</div>
            <button disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} style={{ padding: "6px 10px", borderRadius: 6, border: `1px solid ${BORDER}`, background: page === totalPages ? "#f5f5f5" : "#fff" }}>Next</button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50  , }}>
          <div style={{ background: "#fff", borderRadius: 12, width: 860, maxWidth: "96vw", border: `1px solid ${BORDER}` }} onContextMenu={(e) => e.preventDefault()}>
            <div style={{ background: "#fce7f3", padding: 12, borderTopLeftRadius: 12, borderTopRightRadius: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h4 style={{ fontSize: 16, fontWeight: 700, color: TEXT }}>{editId ? "Edit Visitor" : "Add New Visitor"}</h4>
              <button onClick={() => setModalOpen(false)} style={{ padding: 6, borderRadius: 6, border: `1px solid ${BORDER}`, background: "#fff" }}>✕</button>
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", color: TEXT, marginBottom: 6 }}>Visit Purpose</label>
                  <select 
                    value={form.visitPurpose} 
                    onChange={(e) => setForm((v) => ({ ...v, visitPurpose: e.target.value }))} 
                    style={{ width: "100%", border: `1px solid ${BORDER}`, borderRadius: 8, padding: 8 }}
                  >
                    <option value="">-- Select Purpose --</option>
                    {visitPurposes
                      .filter(p => (p.status ? p.status === 'Active' : true))
                      .map((p) => (
                        <option key={p._id || p.id || p.name} value={p.name}>{p.name}</option>
                      ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", color: TEXT, marginBottom: 6 }}>Department</label>
                  <select 
                    value={form.department} 
                    onChange={(e) => setForm((v) => ({ ...v, department: e.target.value }))} 
                    style={{ width: "100%", border: `1px solid ${BORDER}`, borderRadius: 8, padding: 8 }}
                    required
                  >
                    <option value="">Select Department</option>
                    {visitDepartments
                      .filter(d => (d.status ? d.status === 'Active' : true))
                      .map((d) => (
                        <option key={d._id || d.id || d.name} value={d.name}>{d.name}</option>
                      ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", color: TEXT, marginBottom: 6 }}>Visitor Name</label>
                  <input value={form.name} onChange={(e) => setForm((v) => ({ ...v, name: e.target.value }))} placeholder="Enter Visitor Name" style={{ width: "100%", border: `1px solid ${BORDER}`, borderRadius: 8, padding: 8 }} />
                </div>
                <div>
                  <label style={{ display: "block", color: TEXT, marginBottom: 6 }}>Father Name</label>
                  <input value={form.fatherName} onChange={(e) => setForm((v) => ({ ...v, fatherName: e.target.value }))} placeholder="Father Name" style={{ width: "100%", border: `1px solid ${BORDER}`, borderRadius: 8, padding: 8 }} />
                </div>
                <div>
                  <label style={{ display: "block", color: TEXT, marginBottom: 6 }}>Visitor Email</label>
                  <input value={form.email} onChange={(e) => setForm((v) => ({ ...v, email: e.target.value }))} placeholder="Email" style={{ width: "100%", border: `1px solid ${BORDER}`, borderRadius: 8, padding: 8 }} />
                </div>
                <div>
                  <label style={{ display: "block", color: TEXT, marginBottom: 6 }}>Visitor Phone</label>
                  <input 
                    value={form.phone}
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="10-digit phone"
                    onChange={(e) => setForm((v) => ({ ...v, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                    style={{ width: "100%", border: `1px solid ${BORDER}`, borderRadius: 8, padding: 8 }} 
                  />
                </div>
                <div>
                  <label style={{ display: "block", color: TEXT, marginBottom: 6 }}>Visitor Address</label>
                  <input value={form.address} onChange={(e) => setForm((v) => ({ ...v, address: e.target.value }))} placeholder="Address" style={{ width: "100%", border: `1px solid ${BORDER}`, borderRadius: 8, padding: 8 }} />
                </div>
                <div>
                  <label style={{ display: "block", color: TEXT, marginBottom: 6 }}>Visit From</label>
                  <input value={form.visitFrom} onChange={(e) => setForm((v) => ({ ...v, visitFrom: e.target.value }))} placeholder="Car / Bike / Walk-in" style={{ width: "100%", border: `1px solid ${BORDER}`, borderRadius: 8, padding: 8 }} />
                </div>
                <div>
                  <label style={{ display: "block", color: TEXT, marginBottom: 6 }}>ID Number</label>
                  <input value={form.idNumber} onChange={(e) => setForm((v) => ({ ...v, idNumber: e.target.value }))} placeholder="ID Number" style={{ width: "100%", border: `1px solid ${BORDER}`, borderRadius: 8, padding: 8 }} />
                </div>
                <div>
                  <label style={{ display: "block", color: TEXT, marginBottom: 6 }}>Visit Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm((v) => ({ ...v, date: e.target.value }))}
                    style={{ width: "100%", border: `1px solid ${BORDER}`, borderRadius: 8, padding: 8 }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", color: TEXT, marginBottom: 6 }}>Visit Time In</label>
                  <input
                    type="time"
                    value={form.timeIn}
                    onChange={(e) => setForm((v) => ({ ...v, timeIn: e.target.value }))}
                    style={{ width: "100%", border: `1px solid ${BORDER}`, borderRadius: 8, padding: 8 }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", color: TEXT, marginBottom: 6 }}>Total Number of Visitors</label>
                  <input type="number" min={1} value={form.totalVisitors} onChange={(e) => setForm((v) => ({ ...v, totalVisitors: Number(e.target.value || 1) }))} placeholder="Enter Total Number of V" style={{ width: "100%", border: `1px solid ${BORDER}`, borderRadius: 8, padding: 8 }} />
                </div>
                <div style={{ gridColumn: "1 / span 3" }}>
                  <label style={{ display: "block", color: TEXT, marginBottom: 6 }}>Remarks</label>
                  <textarea rows={3} value={form.remarks} onChange={(e) => setForm((v) => ({ ...v, remarks: e.target.value }))} placeholder="Enter Remarks" style={{ width: "100%", border: `1px solid ${BORDER}`, borderRadius: 8, padding: 8 }} />
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
                <button onClick={() => setModalOpen(false)} style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${BORDER}` }}>Close</button>
                <button onClick={saveRow} style={{ padding: "8px 12px", borderRadius: 8, background: ED_TEAL, color: "#fff", border: `1px solid ${ED_TEAL}` }}>Submit</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
