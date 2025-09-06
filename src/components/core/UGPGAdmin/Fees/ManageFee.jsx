import React, { useState } from "react";

const ManageFee = () => {
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const data = [
    { id: 1, category: "Course", type: "One Time", name: "Application Fee", session: "2022-23", course: "B.Tech - CSE", amount: 1400 },
    { id: 2, category: "Course", type: "One Time", name: "Application Fee", session: "2022-23", course: "B.Sc - Physics (H)", amount: 1100 },
    { id: 3, category: "Course", type: "One Time", name: "Application Fee", session: "2025-26 test1", course: "B.Sc", amount: 1200 },
    { id: 4, category: "Course", type: "Every Year", name: "Exam Fee", session: "Spring-2022", course: "B.Tech - CSE", amount: 200 },
  ];

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ marginBottom: "15px" }}>Manage Fee</h2>

      {/* Entries + Search */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
        <div>
          Show{" "}
          <select style={{ padding: "5px" }}>
            <option>10</option>
            <option>25</option>
            <option>50</option>
          </select>{" "}
          entries
        </div>
        <div>
          Search:{" "}
          <input type="text" style={{ padding: "5px", border: "1px solid #ccc" }} />
        </div>
      </div>

      {/* Table */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f8f8f8", textAlign: "left" }}>
            <th style={thStyle}>Action</th>
            <th style={thStyle}>Fee Category</th>
            <th style={thStyle}>Fee Type</th>
            <th style={thStyle}>Fee Name</th>
            <th style={thStyle}>Session</th>
            <th style={thStyle}>Course</th>
            <th style={thStyle}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={tdStyle}>
                <button
                  onClick={() => {
                    setSelectedItem(item);
                    setShowAssignModal(true);
                  }}
                  style={{
                    background: "#673ab7",
                    color: "#fff",
                    border: "none",
                    padding: "6px 10px",
                    cursor: "pointer",
                    borderRadius: "4px",
                  }}
                >
                  ☰
                </button>
              </td>
              <td style={tdStyle}>{item.category}</td>
              <td style={tdStyle}>{item.type}</td>
              <td style={tdStyle}>{item.name}</td>
              <td style={tdStyle}>{item.session}</td>
              <td style={tdStyle}>{item.course}</td>
              <td style={tdStyle}>{item.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal */}
      {showAssignModal && selectedItem && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <h3>Assign Fee</h3>
            <p>
              Assign <b>{selectedItem.name}</b> for <b>{selectedItem.course}</b>
            </p>

            <label>Session:</label>
            <select style={inputStyle}>
              <option>-- Select Session --</option>
              <option>2022-23</option>
              <option>2025-26</option>
            </select>

            <label>Course:</label>
            <select style={inputStyle}>
              <option>-- Select Course --</option>
              <option>B.Tech</option>
              <option>MBA</option>
            </select>

            <label>Amount:</label>
            <input type="number" defaultValue={selectedItem.amount} style={inputStyle} />

            <div style={{ marginTop: "15px", textAlign: "right" }}>
              <button
                style={{
                  padding: "6px 12px",
                  background: "#ccc",
                  border: "none",
                  marginRight: "10px",
                  cursor: "pointer",
                }}
                onClick={() => setShowAssignModal(false)}
              >
                Close
              </button>
              <button
                style={{
                  padding: "6px 12px",
                  background: "#673ab7",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* Inline styles */
const thStyle = {
  padding: "10px",
  borderBottom: "2px solid #ddd",
};

const tdStyle = {
  padding: "10px",
};

const inputStyle = {
  display: "block",
  width: "100%",
  padding: "8px",
  margin: "8px 0",
  border: "1px solid #ccc",
  borderRadius: "4px",
};

const modalOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const modalContent = {
  background: "#fff",
  padding: "20px",
  borderRadius: "8px",
  width: "400px",
};

export default ManageFee;
