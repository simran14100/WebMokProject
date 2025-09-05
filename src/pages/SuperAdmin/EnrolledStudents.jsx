import React, { useState } from "react";
import { MoreVertical, Eye, Edit, Trash2 } from "lucide-react";

const EnrolledStudents = () => {
  const [students] = useState([
    {
      id: 1,
      date: "2025-09-01",
      regNo: "2500004",
      enrollNo: "MU/25/000001",
      session: "2025-26 test1",
      school: "School of Science",
      course: "Bachelor of Science - Physics (Honours)",
      name: "UHRTYHU",
      fname: "UHTYU",
      phone: "8768798957876",
      email: "gsdfgdgvd@fdg.fdg",
      emergency: "8768798957876",
      address: "trewcvsf",
      city: "Chandigarh",
      state: "Chandigarh",
      dob: "2000-06-27",
      gender: "Male",
      nationality: "Indian",
    },
  ]);

  const [openMenu, setOpenMenu] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Close modal
  const closeModal = () => setSelectedStudent(null);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
        <h1 style={{ fontSize: "20px", fontWeight: "600" }}>Enrolled Students</h1>
        <button
          style={{
            backgroundColor: "#6B21A8",
            color: "#fff",
            padding: "8px 16px",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
            fontWeight: "500",
          }}
        >
          + ADD NEW
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by Reg No., student name and contact number"
        style={{
          width: "100%",
          border: "1px solid #ccc",
          borderRadius: "6px",
          padding: "10px",
          marginBottom: "15px",
        }}
      />

      {/* Table */}
      <div style={{ overflowX: "auto", background: "#fff", borderRadius: "8px", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "900px" }}>
          <thead>
            <tr style={{ background: "#f5f5f5", textAlign: "left" }}>
              {[
                "Action",
                "Date",
                "Reg. No",
                "Enroll No",
                "Session",
                "School",
                "Course",
                "Name",
                "F. Name",
                "Phone",
                "Email",
                "Emg. Contact",
                "Address",
              ].map((head, i) => (
                <th key={i} style={{ padding: "10px", border: "1px solid #ddd" }}>
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} style={{ cursor: "pointer", background: "#fff" }}>
                {/* Action Menu */}
                <td style={{ padding: "10px", border: "1px solid #ddd", position: "relative" }}>
                  <button
                    onClick={() => setOpenMenu(openMenu === s.id ? null : s.id)}
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      padding: "5px",
                    }}
                  >
                    <MoreVertical size={18} />
                  </button>

                  {openMenu === s.id && (
                    <div
                      style={{
                        position: "absolute",
                        top: "35px",
                        left: "10px",
                        background: "#fff",
                        border: "1px solid #ddd",
                        borderRadius: "6px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                        width: "160px",
                        zIndex: 10,
                      }}
                    >
                      <button
                        onClick={() => {
                          setSelectedStudent(s);
                          setOpenMenu(null);
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          width: "100%",
                          padding: "8px 12px",
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                        }}
                      >
                        <Eye size={16} style={{ marginRight: "8px" }} /> View Profile
                      </button>
                      <button
                        style={{
                          display: "flex",
                          alignItems: "center",
                          width: "100%",
                          padding: "8px 12px",
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                        }}
                      >
                        <Edit size={16} style={{ marginRight: "8px" }} /> Update Student
                      </button>
                      <button
                        style={{
                          display: "flex",
                          alignItems: "center",
                          width: "100%",
                          padding: "8px 12px",
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                        }}
                      >
                        ₹ Pay Fee
                      </button>
                      <button
                        style={{
                          display: "flex",
                          alignItems: "center",
                          width: "100%",
                          padding: "8px 12px",
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          color: "red",
                        }}
                      >
                        <Trash2 size={16} style={{ marginRight: "8px" }} /> Delete
                      </button>
                    </div>
                  )}
                </td>

                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{s.date}</td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{s.regNo}</td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{s.enrollNo}</td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{s.session}</td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{s.school}</td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{s.course}</td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{s.name}</td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{s.fname}</td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{s.phone}</td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{s.email}</td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{s.emergency}</td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{s.address}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Admission Form Modal */}
      {selectedStudent && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
          }}
        >
          <div style={{ background: "#fff", borderRadius: "8px", padding: "20px", width: "80%", maxHeight: "90%", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "600" }}>Admission Form</h2>
              <button
                onClick={closeModal}
                style={{ background: "red", color: "#fff", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer" }}
              >
                Close
              </button>
            </div>

            <div style={{ border: "1px solid #000", padding: "20px" }}>
              <h3 style={{ textAlign: "center", fontWeight: "bold" }}>ADMISSION FORM</h3>
              <p><b>Reg No:</b> {selectedStudent.regNo} &nbsp;&nbsp; <b>Enroll No:</b> {selectedStudent.enrollNo}</p>
              <p><b>Course Applying For:</b> {selectedStudent.course}</p>
              <p><b>Academic Session:</b> {selectedStudent.session}</p>
              <h4 style={{ color: "brown" }}>Personal Details</h4>
              <p><b>Name:</b> {selectedStudent.name}</p>
              <p><b>Date of Birth:</b> {selectedStudent.dob}</p>
              <p><b>Gender:</b> {selectedStudent.gender}</p>
              <p><b>Nationality:</b> {selectedStudent.nationality}</p>
              <p><b>Mobile No:</b> {selectedStudent.phone}</p>
              <p><b>Email ID:</b> {selectedStudent.email}</p>
              <p><b>Emergency Contact:</b> {selectedStudent.emergency}</p>
              <p><b>Address:</b> {selectedStudent.address}, {selectedStudent.city}, {selectedStudent.state}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnrolledStudents;
