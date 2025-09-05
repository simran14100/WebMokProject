import React, { useEffect, useState } from "react";

const VerifiedStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [remarks, setRemarks] = useState("");

  // Fetch verified students from API
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        // Mock data for demonstration
        const mockData = [
          {
            id: 1,
            date: "2024-03-15",
            regNo: "2400005",
            session: "2025-26",
            school: "School of Engineering",
            course: "Computer Science",
            name: "Jile Singh",
            fatherName: "Sansar Singh",
            phone: "9876543210",
            email: "jile@example.com",
            qualification: "B.Tech",
            dob: "08-Feb-2024"
          },
          // Add more mock data as needed
        ];
        setStudents(mockData);
      } catch (error) {
        console.error("Error fetching verified students:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // Handle verify action
  const handleVerify = (student) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  const handleModalSubmit = () => {
    alert(`Student ${selectedStudent.name} verified with remarks: ${remarks}`);
    // Here you would typically make an API call to update the student's verification status
    setShowModal(false);
    setRemarks("");
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      alert(`Delete student with ID: ${id}`);
      // Call API to delete student here
      setStudents((prev) => prev.filter((s) => s.id !== id));
    }
  };

  // Verification Modal Component
  const VerificationModal = () => {
    if (!showModal || !selectedStudent) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Student Verification</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p><strong>Reg. No.:</strong> {selectedStudent.regNo}</p>
                <p><strong>F.Name:</strong> {selectedStudent.name}</p>
              </div>
              <div>
                <p><strong>Session:</strong> {selectedStudent.session}</p>
                <p><strong>M.Name:</strong> {selectedStudent.fatherName.split(' ')[0]}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p><strong>Name:</strong> {selectedStudent.name}</p>
              </div>
              <div>
                <p><strong>DOB:</strong> {selectedStudent.dob}</p>
              </div>
            </div>
            
            <hr className="my-4" />
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <h3 className="font-medium mb-2">Photo</h3>
                <div className="space-y-1">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    Registration Fee
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    Sr. Secondary Marksheet
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    Other Marksheet
                  </label>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Signature</h3>
                <div className="space-y-1">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    Course Fee
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    Graduation Marksheet
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    Annexure
                  </label>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">ID Proof</h3>
                <div className="space-y-1">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    Matric Marksheet
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    P.G. Marksheet
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    Is eligible?
                  </label>
                </div>
              </div>
            </div>
            
            <hr className="my-4" />
            
            <div className="mb-4">
              <h3 className="font-medium mb-2">Registration Status</h3>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" defaultChecked />
                  Pending
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  Registration Fee
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  Yes
                </label>
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className="font-medium mb-2">Verification Status</h3>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" defaultChecked />
                  Pending
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  Verified
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  Yes
                </label>
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className="font-medium mb-2">Remark:</h3>
              <textarea 
                className="w-full p-2 border rounded"
                rows="3"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter remarks here..."
              ></textarea>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button 
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
              <button 
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                onClick={handleModalSubmit}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white p-5 shadow rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Verified Students</h2>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-2">Action</th>
                  <th className="border p-2">Date</th>
                  <th className="border p-2">Reg. No</th>
                  <th className="border p-2">Session</th>
                  <th className="border p-2">School</th>
                  <th className="border p-2">Course</th>
                  <th className="border p-2">Name</th>
                  <th className="border p-2">Father's Name</th>
                  <th className="border p-2">Phone</th>
                  <th className="border p-2">Email</th>
                  <th className="border p-2">Qualification</th>
                </tr>
              </thead>
              <tbody>
                {students.length > 0 ? (
                  students.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      {/* Action dropdown */}
                      <td className="border p-2 text-center">
                        <div className="relative group inline-block">
                          <button className="px-2 py-1 bg-purple-600 text-white rounded">
                            ☰
                          </button>
                          <div className="absolute hidden group-hover:block bg-white border rounded shadow-md mt-1 w-28 z-10">
                            <button
                              onClick={() => handleVerify(student)}
                              className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                            >
                              ✅ Verify
                            </button>
                            <button
                              onClick={() => handleDelete(student.id)}
                              className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-100"
                            >
                              🗑 Delete
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Student data */}
                      <td className="border p-2">{student.date}</td>
                      <td className="border p-2">{student.regNo}</td>
                      <td className="border p-2">{student.session}</td>
                      <td className="border p-2">{student.school}</td>
                      <td className="border p-2">{student.course}</td>
                      <td className="border p-2">{student.name}</td>
                      <td className="border p-2">{student.fatherName}</td>
                      <td className="border p-2">{student.phone}</td>
                      <td className="border p-2">{student.email}</td>
                      <td className="border p-2">{student.qualification}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="11" className="text-center p-4 text-gray-500">
                      No verified students found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {!loading && (
          <p className="text-gray-600 text-sm mt-3">
            Showing {students.length} verified student(s)
          </p>
        )}
      </div>
      
      {/* Render the modal */}
      <VerificationModal />
    </div>
  );
};

export default VerifiedStudents;