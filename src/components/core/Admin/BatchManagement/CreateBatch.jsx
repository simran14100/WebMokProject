


import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { createBatch as createBatchApi, listBatchDepartments } from "../../../../services/operations/adminApi";
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
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [deptLoading, setDeptLoading] = useState(false);
  const [departments, setDepartments] = useState([]);

  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.profile.user);
  // const isAdmin = user?.accountType === "Admin";
  const isAdmin = user?.accountType === "Admin" || user?.accountType === "SuperAdmin";
  useEffect(() => {
    setDeptLoading(true);
    listBatchDepartments({ onlyActive: true })
      .then((list) => {
        setDepartments(list);
      })
      .catch(() => {})
      .finally(() => setDeptLoading(false));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (!batchName.trim() || !batchDepartment) {
      showError("Please fill all fields");
      return;
    }

    setLoading(true);
    createBatchApi(
      { name: batchName.trim(), department: batchDepartment, description: description || "" },
      token
    )
      .then(() => {
        showSuccess("Batch created");
        setBatchName("");
        setBatchDepartment("");
        setDescription("");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  return (
    <DashboardLayout>
      <div style={{
        width: '100%',
        minHeight: '100vh',
        backgroundColor: BG_LIGHT,
        padding: '2rem 1rem',
        maxWidth: 1280,
        marginLeft:"200px"
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
                  <option value="">{deptLoading ? 'Loading...' : 'Select...'}</option>
                  {departments.map((d) => (
                    <option key={d._id} value={(d.name || '').toLowerCase()}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: TEXT_DARK,
                  marginBottom: '0.5rem'
                }}>
                  Description (optional)
                </label>
                <textarea
                  placeholder="Write a short description for this batch"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
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
                  }}
                />
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