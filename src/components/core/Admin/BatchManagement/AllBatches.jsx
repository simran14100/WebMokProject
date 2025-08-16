

import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../../common/DashboardLayout";
import { getBatches, exportBatches } from "../../../../services/operations/adminApi";
import { showError, showSuccess } from "../../../../utils/toast";

// Color constants
const ED_TEAL = '#07A698';
const ED_TEAL_DARK = '#059a8c';
const TEXT_DARK = '#2d3748';
const TEXT_LIGHT = '#718096';
const BG_LIGHT = '#f8fafc';
const BORDER_COLOR = '#e2e8f0';
const CARD_SHADOW = '0 1px 3px rgba(0, 0, 0, 0.1)';

export default function AllBatches() {
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.profile.user);
  const isAdmin = user?.accountType === "Admin";
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  const fetchData = async () => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      const res = await getBatches({ token, page, limit, search });
      setItems(res.items || []);
      setTotal(res.total || 0);
    } catch (e) {
      // error handled in service
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  const onSearchKey = (e) => {
    if (e.key === "Enter") {
      setPage(1);
      fetchData();
    }
  };

  const handleExport = async () => {
    if (!isAdmin) return;
    try {
      const blob = await exportBatches({ token, search });
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "all_batches.csv");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      showSuccess("Exported batches");
    } catch (e) {
      // toast shown in service
    }
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
        <div style={{ 
          marginBottom: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 600,
            color: TEXT_DARK,
            margin: 0
          }}>
            All Batches
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
            <span style={{ 
              color: ED_TEAL, 
              fontWeight: 500 
            }}>
              All Batches
            </span>
          </div>
        </div>

        {/* Content Section */}
        {!isAdmin ? (
          <div style={{
            maxWidth: '28rem',
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '0.5rem',
            boxShadow: CARD_SHADOW,
            border: `1px solid ${BORDER_COLOR}`
          }}>
            <h1 style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              color: '#e53e3e',
              marginBottom: '0.5rem',
              marginTop: 0
            }}>
              Unauthorized
            </h1>
            <p style={{ 
              color: TEXT_LIGHT,
              margin: 0
            }}>
              Only Admin can view batches.
            </p>
          </div>
        ) : (
          <div style={{
            width: '100%',
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '0.5rem',
            boxShadow: CARD_SHADOW,
            border: `1px solid ${BORDER_COLOR}`
          }}>
            {/* Table Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 600,
                color: TEXT_DARK,
                margin: 0
              }}>
                Batch List
              </h3>
              <button
                onClick={handleExport}
                style={{
                  backgroundColor: ED_TEAL,
                  color: 'white',
                  padding: '0.625rem 1.25rem',
                  borderRadius: '0.375rem',
                  border: 'none',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  ':hover': {
                    backgroundColor: ED_TEAL_DARK
                  }
                }}
              >
                Download All Batch File
              </button>
            </div>

            {/* Search Input */}
            <div style={{ marginBottom: '1.5rem' }}>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={onSearchKey}
                placeholder="Search batches..."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.375rem',
                  border: `1px solid ${BORDER_COLOR}`,
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  fontSize: '0.875rem',
                  color: TEXT_DARK,
                  backgroundColor: 'white',
                  ':focus': {
                    borderColor: ED_TEAL,
                    boxShadow: `0 0 0 3px rgba(7, 166, 152, 0.1)`
                  }
                }}
              />
              <div style={{
                fontSize: '0.75rem',
                color: TEXT_LIGHT,
                marginTop: '0.5rem'
              }}>
                Press Enter to search
              </div>
            </div>

            {/* Table */}
            <div style={{
              overflowX: 'auto',
              border: `1px solid ${BORDER_COLOR}`,
              borderRadius: '0.375rem'
            }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                minWidth: '600px'
              }}>
                <thead style={{
                  backgroundColor: ED_TEAL,
                  color: 'white'
                }}>
                  <tr>
                    <th style={{
                      padding: '0.75rem 1rem',
                      textAlign: 'left',
                      fontWeight: 500,
                      width: '80px'
                    }}>
                      Serial No.
                    </th>
                    <th style={{
                      padding: '0.75rem 1rem',
                      textAlign: 'left',
                      fontWeight: 500
                    }}>
                      Department Name
                    </th>
                    <th style={{
                      padding: '0.75rem 1rem',
                      textAlign: 'left',
                      fontWeight: 500
                    }}>
                      Batch Name
                    </th>
                    <th style={{
                      padding: '0.75rem 1rem',
                      textAlign: 'left',
                      fontWeight: 500,
                      width: '120px'
                    }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4} style={{
                        padding: '1.5rem',
                        textAlign: 'center',
                        color: TEXT_LIGHT
                      }}>
                        Loading...
                      </td>
                    </tr>
                  ) : items.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{
                        padding: '1.5rem',
                        textAlign: 'center',
                        color: TEXT_LIGHT
                      }}>
                        No batches found
                      </td>
                    </tr>
                  ) : (
                    items.map((b, idx) => (
                      <tr key={b._id} style={{
                        borderTop: `1px solid ${BORDER_COLOR}`,
                        ':hover': {
                          backgroundColor: '#f8fafc'
                        }
                      }}>
                        <td style={{
                          padding: '0.75rem 1rem',
                          color: TEXT_DARK
                        }}>
                          {(page - 1) * limit + idx + 1}
                        </td>
                        <td style={{
                          padding: '0.75rem 1rem',
                          color: TEXT_DARK
                        }}>
                          {b.department}
                        </td>
                        <td style={{
                          padding: '0.75rem 1rem',
                          color: TEXT_DARK
                        }}>
                          {b.name}
                        </td>
                        <td style={{
                          padding: '0.75rem 1rem'
                        }}>
                          <button onClick={() => navigate(`/admin/batches/${b._id}/edit`)} style={{
                            backgroundColor: ED_TEAL,
                            color: 'white',
                            padding: '0.375rem 0.75rem',
                            borderRadius: '0.25rem',
                            border: 'none',
                            fontWeight: 500,
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            ':hover': {
                              backgroundColor: ED_TEAL_DARK
                            }
                          }}>
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '1.5rem',
              fontSize: '0.875rem',
              color: TEXT_DARK
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                Rows per page:
                <select
                  value={limit}
                  onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                  style={{
                    padding: '0.375rem 0.5rem',
                    borderRadius: '0.25rem',
                    border: `1px solid ${BORDER_COLOR}`,
                    outline: 'none',
                    cursor: 'pointer',
                    ':focus': {
                      borderColor: ED_TEAL
                    }
                  }}
                >
                  {[5,10,20,50].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{
                    padding: '0.375rem 0.75rem',
                    borderRadius: '0.25rem',
                    border: `1px solid ${BORDER_COLOR}`,
                    backgroundColor: 'white',
                    cursor: page === 1 ? 'not-allowed' : 'pointer',
                    opacity: page === 1 ? 0.5 : 1,
                    transition: 'all 0.2s ease',
                    ':hover': page === 1 ? {} : {
                      backgroundColor: '#f1f5f9'
                    }
                  }}
                >
                  Prev
                </button>
                <span>
                  {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  style={{
                    padding: '0.375rem 0.75rem',
                    borderRadius: '0.25rem',
                    border: `1px solid ${BORDER_COLOR}`,
                    backgroundColor: 'white',
                    cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                    opacity: page >= totalPages ? 0.5 : 1,
                    transition: 'all 0.2s ease',
                    ':hover': page >= totalPages ? {} : {
                      backgroundColor: '#f1f5f9'
                    }
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}