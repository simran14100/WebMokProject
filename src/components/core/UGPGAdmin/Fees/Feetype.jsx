import React, { useState } from "react";

const FeeTypePage = () => {
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  const [selectedItem, setSelectedItem] = useState(null);
  const entriesPerPage = 10;

  const data = [
    { id: 1, category: "Course", type: "One Time", name: "Application Fee", refundable: "No", status: "Active" },
    { id: 2, category: "Course", type: "Every year", name: "Exam Fee", refundable: "No", status: "Active" },
    { id: 3, category: "Course", type: "One Time", name: "Registration Fee", refundable: "No", status: "Active" },
    { id: 4, category: "Course", type: "Every year", name: "Tuition Fee", refundable: "No", status: "Active" },
    { id: 5, category: "Hostel", type: "One Time", name: "Double Sharing AC", refundable: "No", status: "Active" },
    { id: 6, category: "Hostel", type: "One Time", name: "Double Sharing Non AC", refundable: "No", status: "Active" },
    { id: 7, category: "Hostel", type: "One Time", name: "Twin Share AC Room", refundable: "No", status: "Active" },
    { id: 8, category: "Miscellaneous", type: "After Course", name: "Degree Fee", refundable: "No", status: "Active" },
    { id: 9, category: "Miscellaneous", type: "One Time", name: "Security 11", refundable: "Yes", status: "Active" },
    { id: 10, category: "Transport", type: "One Time", name: "University to Rohtak", refundable: "No", status: "Active" },
    { id: 11, category: "Course", type: "One Time", name: "Library Fee", refundable: "No", status: "Active" },
  ];

  // Search filter
  const filteredData = data.filter((item) =>
    Object.values(item).some((val) =>
      val.toString().toLowerCase().includes(searchText.toLowerCase())
    )
  );

  // Pagination
  const startIndex = (currentPage - 1) * entriesPerPage;
  const displayedData = filteredData.slice(startIndex, startIndex + entriesPerPage);
  const totalPages = Math.ceil(filteredData.length / entriesPerPage);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" , marginTop: "8rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: "600" }}>Manage Fee Type</h2>
        <button
          style={{
            backgroundColor: "#6a0dad",
            color: "white",
            padding: "8px 16px",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "500",
          }}
          onClick={() => setShowAddModal(true)}
        >
          + Add New
        </button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: "10px" }}>
        <input
          type="text"
          placeholder="Search..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{
            padding: "6px 10px",
            width: "250px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />
      </div>

      {/* Table */}
      <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "white" }}>
        <thead>
          <tr style={{ backgroundColor: "#f9f9f9", textAlign: "left" }}>
            <th style={thStyle}>Action</th>
            <th style={thStyle}>Fee Category</th>
            <th style={thStyle}>Fee Type</th>
            <th style={thStyle}>Fee Name</th>
            <th style={thStyle}>Refundable</th>
            <th style={thStyle}>Status</th>
          </tr>
        </thead>
        <tbody>
          {displayedData.map((item) => (
            <tr key={item.id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={tdStyle}>
                <div style={{ position: "relative", display: "inline-block" }}>
                  <span style={{ color: "#6a0dad", fontSize: "18px", cursor: "pointer" }}>☰</span>
                  <div style={{ 
                    position: "absolute", 
                    background: "#fff", 
                    border: "1px solid #ccc", 
                    borderRadius: "4px", 
                    padding: "5px", 
                    display: "none" 
                  }}
                  className="action-menu">
                    <p style={actionStyle} onClick={() => { setSelectedItem(item); setShowUpdateModal(true); }}>Update</p>
                    <p style={actionStyle} onClick={() => alert("Delete " + item.name)}>Delete</p>
                    <p 
  style={actionStyle} 
  onClick={() => { setSelectedItem(item); setShowAssignModal(true); }}
>
  Assign Fee
</p>

                  </div>
                </div>
              </td>
              <td style={tdStyle}>{item.category}</td>
              <td style={tdStyle}>{item.type}</td>
              <td style={tdStyle}>{item.name}</td>
              <td style={tdStyle}>{item.refundable}</td>
              <td style={tdStyle}>
                <span
                  style={{
                    backgroundColor: item.status === "Active" ? "#d4edda" : "#f8d7da",
                    color: item.status === "Active" ? "#155724" : "#721c24",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    fontSize: "12px",
                  }}
                >
                  {item.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div style={{ marginTop: "15px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ fontSize: "14px" }}>
          Showing {startIndex + 1} to {Math.min(startIndex + entriesPerPage, filteredData.length)} of {filteredData.length} entries
        </p>
        <div>
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            style={paginationBtn}
          >
            Previous
          </button>
          <span style={{ margin: "0 10px" }}>{currentPage} / {totalPages}</span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            style={paginationBtn}
          >
            Next
          </button>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <h3 style={{ marginBottom: "15px" }}>Add New Fee Type</h3>
            <label>Fee Category:</label>
            <select style={inputStyle}>
              <option>-- Select Fee Category --</option>
              <option>Course</option>
              <option>Hostel</option>
              <option>Transport</option>
              <option>Miscellaneous</option>
              <option>Other</option>
            </select>
            <label>Fee Type:</label>
            <select style={inputStyle}>
              <option>-- Select Fee Type --</option>
              <option>One Time</option>
              <option>Every Year</option>
              <option>Last Year</option>
              <option>After Course</option>
            </select>
            <label>Fee Name:</label>
            <input type="text" style={inputStyle} />
            <label>Is refundable:</label>
            <select style={inputStyle}>
              <option>No</option>
              <option>Yes</option>
            </select>
            <div style={{ marginTop: "15px", textAlign: "right" }}>
              <button style={closeBtn} onClick={() => setShowAddModal(false)}>Close</button>
              <button style={submitBtn}>Submit</button>
            </div>
          </div>
        </div>
      )}

      {/* Update Modal */}
{showUpdateModal && selectedItem && (
  <div style={modalOverlay}>
    <div style={modalContent}>
      <h3 style={{ marginBottom: "15px" }}>Update {selectedItem.name}</h3>

      <label>Fee Category:</label>
      <select defaultValue={selectedItem.category} style={inputStyle}>
        <option>Course</option>
        <option>Hostel</option>
        <option>Transport</option>
        <option>Miscellaneous</option>
        <option>Other</option>
      </select>

      <label>Fee Type:</label>
      <select defaultValue={selectedItem.type} style={inputStyle}>
        <option>One Time</option>
        <option>Every Year</option>
        <option>Last Year</option>
        <option>After Course</option>
      </select>

      <label>Fee Name:</label>
      <input type="text" defaultValue={selectedItem.name} style={inputStyle} />

      <label>Is Refundable:</label>
      <select defaultValue={selectedItem.refundable} style={inputStyle}>
        <option>No</option>
        <option>Yes</option>
      </select>

      <label>Status:</label>
      <select defaultValue={selectedItem.status} style={inputStyle}>
        <option>Active</option>
        <option>Inactive</option>
      </select>

      <div style={{ marginTop: "15px", textAlign: "right" }}>
        <button style={closeBtn} onClick={() => setShowUpdateModal(false)}>Close</button>
        <button style={submitBtn}>Submit</button>
      </div>
    </div>
  </div>
)}

   {/* Assign Fee Modal */}
{showAssignModal && selectedItem && (
  <div style={modalOverlay}>
    <div style={modalContent}>
      <h3 style={{ marginBottom: "15px" }}>
        ASSIGN FEE
      </h3>
      <p style={{ marginBottom: "10px", fontWeight: "500" }}>
        Assign {selectedItem.category} <b>{selectedItem.name}</b> for {selectedItem.type}
      </p>

      <label>Session:</label>
      <select style={inputStyle}>
        <option>-- Select Session --</option>
        <option>2022-23</option>
        <option>2025-2026</option>
        <option>2025-26</option>
        <option>2025-26 test1</option>
        <option>Spring-2022</option>
      </select>

      <label>Course:</label>
      <select style={inputStyle}>
        <option>-- Select Course --</option>
        <option>B.Tech</option>
        <option>MBA</option>
        <option>MCA</option>
      </select>

      <label>Amount:</label>
      <input type="number" defaultValue="0" style={inputStyle} />

      <div style={{ marginTop: "15px", textAlign: "right" }}>
        <button style={closeBtn} onClick={() => setShowAssignModal(false)}>Close</button>
        <button style={submitBtn}>Submit</button>
      </div>
    </div>
  </div>
)}


    </div>
  );
};

// Styles
const thStyle = { padding: "10px", borderBottom: "2px solid #ddd", fontWeight: "600", fontSize: "14px" };
const tdStyle = { padding: "10px", fontSize: "14px" };
const paginationBtn = { padding: "5px 10px", margin: "0 2px", border: "1px solid #ccc", borderRadius: "4px", backgroundColor: "white", cursor: "pointer" };
const actionStyle = { margin: 0, padding: "5px", cursor: "pointer", fontSize: "14px" };
const modalOverlay = { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" };
const modalContent = { background: "white", padding: "20px", borderRadius: "6px", width: "400px" };
const inputStyle = { display: "block", width: "100%", padding: "8px", margin: "8px 0", border: "1px solid #ccc", borderRadius: "4px" };
const closeBtn = { backgroundColor: "#dc3545", color: "white", padding: "6px 12px", marginRight: "8px", border: "none", borderRadius: "4px", cursor: "pointer" };
const submitBtn = { backgroundColor: "#6a0dad", color: "white", padding: "6px 12px", border: "none", borderRadius: "4px", cursor: "pointer" };

export default FeeTypePage;
