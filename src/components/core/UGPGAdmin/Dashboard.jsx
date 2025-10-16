// import React, { useEffect, useState } from "react";
// import { useSelector } from "react-redux";
// import { apiConnector } from "../../../services/apiConnector";
// import { admin, universityEndpoints } from "../../../services/apis";
// import DashboardLayout from "../../common/DashboardLayout";
// import { Bar } from "react-chartjs-2";
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend,
// } from "chart.js";

// ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// export default function UGPGDashboard() {
//   const { token } = useSelector((state) => state.auth);
//   const [loading, setLoading] = useState(false);
//   const [registered, setRegistered] = useState([]);
//   const [enrolled, setEnrolled] = useState([]);
//   const [registeredCount, setRegisteredCount] = useState(0);
//   const [enrolledCount, setEnrolledCount] = useState(0);
//   const [error, setError] = useState(null);
//   const [schoolCount, setSchoolCount] = useState(0);
//   const [courseCount, setCourseCount] = useState(0);
//   const [subjectCount, setSubjectCount] = useState(0);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         setError(null);

//         // Registered students
//         const regParams = new URLSearchParams({ page: 1, limit: 10, role: 'Student' });
//         const regRes = await apiConnector(
//           'GET',
//           `${admin.GET_REGISTERED_USERS_API}?${regParams.toString()}`,
//           null,
//           token ? { Authorization: `Bearer ${token}` } : undefined
//         );

//         const regData = regRes?.data?.data || {};
//         setRegistered(Array.isArray(regData.users) ? regData.users : regRes?.data?.users || []);
//         setRegisteredCount(regData.totalUsers || regRes?.data?.total || 0);

//         // Enrolled students (University)
//         const enrParams = new URLSearchParams({ page: 1, limit: 10 });
//         const enrRes = await apiConnector(
//           'GET',
//           `${universityEndpoints.GET_ALL_ENROLLED_STUDENTS}?${enrParams.toString()}`,
//           null,
//           token ? { Authorization: `Bearer ${token}` } : undefined
//         );

//         const enrPayload = enrRes?.data;
//         const enrList = enrPayload?.data?.docs || enrPayload?.data || enrPayload?.students || [];
//         const enrTotal = enrPayload?.data?.totalDocs || enrPayload?.total || enrPayload?.count || (Array.isArray(enrList) ? enrList.length : 0);
//         setEnrolled(Array.isArray(enrList) ? enrList : []);
//         setEnrolledCount(enrTotal);

//         // UG/PG Schools count
//         const schoolsRes = await apiConnector(
//           'GET',
//           `/api/v1/ugpg/schools?limit=1&page=1`,
//           null,
//           token ? { Authorization: `Bearer ${token}` } : undefined
//         );
//         const sPayload = schoolsRes?.data;
//         const sTotal = sPayload?.data?.totalDocs || sPayload?.total || sPayload?.count || (Array.isArray(sPayload?.data) ? sPayload.data.length : 0);
//         setSchoolCount(Number(sTotal) || 0);

//         // UG/PG Courses count
//         const coursesRes = await apiConnector(
//           'GET',
//           `/api/v1/ugpg/courses?limit=1&page=1`,
//           null,
//           token ? { Authorization: `Bearer ${token}` } : undefined
//         );
//         const cPayload = coursesRes?.data;
//         const cTotal = cPayload?.data?.totalDocs || cPayload?.total || cPayload?.count || (Array.isArray(cPayload?.data) ? cPayload.data.length : 0);
//         setCourseCount(Number(cTotal) || 0);

//         // UG/PG Subjects count
//         const subjectsRes = await apiConnector(
//           'GET',
//           `/api/v1/ugpg/subjects?limit=1000&page=1`,
//           null,
//           token ? { Authorization: `Bearer ${token}` } : undefined
//         );
//         const subjPayload = subjectsRes?.data;
//         const subjList = subjPayload?.data?.docs || subjPayload?.data || [];
//         const subjTotal = subjPayload?.data?.totalDocs || subjPayload?.total || subjPayload?.count || (Array.isArray(subjList) ? subjList.length : 0);
//         setSubjectCount(Number(subjTotal) || 0);

//       } catch (e) {
//         console.error('UGPG Dashboard fetch error:', e);
//         setError(e?.response?.data?.message || e.message || 'Failed to load dashboard data');
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, [token]);

//   if (loading) {
//     return (
//       <DashboardLayout>
//         <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
//           <div>Loading dashboard data...</div>
//         </div>
//       </DashboardLayout>
//     );
//   }

//   if (error) {
//     return (
//       <DashboardLayout>
//         <div style={{ color: 'red', padding: '20px' }}>
//           Error loading dashboard: {error}
//         </div>
//       </DashboardLayout>
//     );
//   }

//   return (
//     <DashboardLayout>
//       <div style={{ padding: '24px' }}>
//         <h1 style={{ fontSize: '24px', marginBottom: '24px' }}>UG/PG Admin Dashboard</h1>
//         <div style={{ marginTop: '2rem' }}>
//           {/* Summary Cards */}
//           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
//             <div style={{ background: '#fff', border: '1px solid #eaeef3', borderRadius: 12, padding: 16, boxShadow: '0 4px 14px rgba(0,0,0,0.04)'}}>
//               <div style={{ fontSize: 13, color: '#64748b', marginBottom: 6 }}>UG/PG Schools</div>
//               <div style={{ fontSize: 28, fontWeight: 800 }}>{schoolCount}</div>
//             </div>
//             <div style={{ background: '#fff', border: '1px solid #eaeef3', borderRadius: 12, padding: 16, boxShadow: '0 4px 14px rgba(0,0,0,0.04)'}}>
//               <div style={{ fontSize: 13, color: '#64748b', marginBottom: 6 }}>UG/PG Courses</div>
//               <div style={{ fontSize: 28, fontWeight: 800 }}>{courseCount}</div>
//             </div>
//             <div style={{ background: '#fff', border: '1px solid #eaeef3', borderRadius: 12, padding: 16, boxShadow: '0 4px 14px rgba(0,0,0,0.04)'}}>
//               <div style={{ fontSize: 13, color: '#64748b', marginBottom: 6 }}>UG/PG Subjects</div>
//               <div style={{ fontSize: 28, fontWeight: 800 }}>{subjectCount}</div>
//             </div>
//           </div>

//           {/* Comparison Chart */}
//           <div style={{ background: '#fff', border: '1px solid #eaeef3', borderRadius: 12, padding: 16, marginTop: 16 }}>
//             <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, marginBottom: 12 }}>University Registered vs Enrolled</h3>
//             <Bar
//               data={{
//                 labels: ['Registered', 'Enrolled'],
//                 datasets: [
//                   {
//                     label: 'Students',
//                     data: [registeredCount, enrolledCount],
//                     backgroundColor: ['#38bdf8', '#34d399'],
//                     borderRadius: 6,
//                     borderWidth: 0,
//                   }
//                 ]
//               }}
//               options={{
//                 responsive: true,
//                 plugins: {
//                   legend: { display: true, position: 'bottom' },
//                   title: { display: false },
//                   tooltip: { enabled: true }
//                 },
//                 scales: {
//                   y: { beginAtZero: true, ticks: { precision: 0 } },
//                   x: { grid: { display: false } }
//                 }
//               }}
//             />
//           </div>

//           {/* Student Lists */}
//           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16, marginTop: 16 }}>
//             {/* Registered Students */}
//             <div style={{ background: '#fff', border: '1px solid #eaeef3', borderRadius: 12, padding: 16 }}>
//               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
//                 <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Recent Registered</h3>
//                 <a href="/ugpg-admin/admissions/all-registered" style={{ color: '#0ea5e9', fontSize: 13 }}>View all</a>
//               </div>
//               <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
//                 {(registered || []).slice(0, 5).map((s) => (
//                   <li key={s._id} style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
//                     <div style={{ fontWeight: 600 }}>{s.firstName} {s.lastName}</div>
//                     <div style={{ fontSize: 12, color: '#64748b' }}>{s.email}</div>
//                   </li>
//                 ))}
//                 {(!registered || registered.length === 0) && <li style={{ color: '#64748b' }}>No registered students</li>}
//               </ul>
//             </div>

//             {/* Enrolled Students */}
//             <div style={{ background: '#fff', border: '1px solid #eaeef3', borderRadius: 12, padding: 16 }}>
//               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
//                 <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Recent Enrolled</h3>
//                 <a href="/ugpg-admin/admissions/enrolled" style={{ color: '#0ea5e9', fontSize: 13 }}>View all</a>
//               </div>
//               <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
//                 {(enrolled || []).slice(0, 5).map((e) => (
//                   <li key={e._id || e.email} style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
//                     <div style={{ fontWeight: 600 }}>{e.firstName} {e.lastName}</div>
//                     <div style={{ fontSize: 12, color: '#64748b' }}>{e.email}</div>
//                   </li>
//                 ))}
//                 {(!enrolled || enrolled.length === 0) && <li style={{ color: '#64748b' }}>No enrolled students</li>}
//               </ul>
//             </div>
//           </div>
//         </div>
//       </div>
//     </DashboardLayout>
//   );
// }
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { apiConnector } from "../../../services/apiConnector";
import { admin, universityEndpoints } from "../../../services/apis";
import DashboardLayout from "../../common/DashboardLayout";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function UGPGDashboard() {
  const { token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState([]);
  const [enrolled, setEnrolled] = useState([]);
  const [registeredCount, setRegisteredCount] = useState(0);
  const [enrolledCount, setEnrolledCount] = useState(0);
  const [error, setError] = useState(null);
  const [schoolCount, setSchoolCount] = useState(0);
  const [courseCount, setCourseCount] = useState(0);
  const [subjectCount, setSubjectCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Registered students
        const regParams = new URLSearchParams({ page: 1, limit: 10, role: 'Student' });
        const regRes = await apiConnector(
          'GET',
          `${admin.GET_REGISTERED_USERS_API}?${regParams.toString()}`,
          null,
          token ? { Authorization: `Bearer ${token}` } : undefined
        );

        const regData = regRes?.data?.data || {};
        setRegistered(Array.isArray(regData.users) ? regData.users : regRes?.data?.users || []);
        setRegisteredCount(regData.totalUsers || regRes?.data?.total || 0);

        // Enrolled students (University)
        const enrParams = new URLSearchParams({ page: 1, limit: 10 });
        const enrRes = await apiConnector(
          'GET',
          `${universityEndpoints.GET_ALL_ENROLLED_STUDENTS}?${enrParams.toString()}`,
          null,
          token ? { Authorization: `Bearer ${token}` } : undefined
        );

        const enrPayload = enrRes?.data;
        const enrList = enrPayload?.data?.docs || enrPayload?.data || enrPayload?.students || [];
        const enrTotal = enrPayload?.data?.totalDocs || enrPayload?.total || enrPayload?.count || (Array.isArray(enrList) ? enrList.length : 0);
        setEnrolled(Array.isArray(enrList) ? enrList : []);
        setEnrolledCount(enrTotal);

        // UG/PG Schools count
        const schoolsRes = await apiConnector(
          'GET',
          `/api/v1/ugpg/schools?limit=1&page=1`,
          null,
          token ? { Authorization: `Bearer ${token}` } : undefined
        );
        const sPayload = schoolsRes?.data;
        const sTotal = sPayload?.data?.totalDocs || sPayload?.total || sPayload?.count || (Array.isArray(sPayload?.data) ? sPayload.data.length : 0);
        setSchoolCount(Number(sTotal) || 0);

        // UG/PG Courses count
        const coursesRes = await apiConnector(
          'GET',
          `/api/v1/ugpg/courses?limit=1&page=1`,
          null,
          token ? { Authorization: `Bearer ${token}` } : undefined
        );
        const cPayload = coursesRes?.data;
        const cTotal = cPayload?.data?.totalDocs || cPayload?.total || cPayload?.count || (Array.isArray(cPayload?.data) ? cPayload.data.length : 0);
        setCourseCount(Number(cTotal) || 0);

        // UG/PG Subjects count
        const subjectsRes = await apiConnector(
          'GET',
          `/api/v1/ugpg/subjects?limit=1000&page=1`,
          null,
          token ? { Authorization: `Bearer ${token}` } : undefined
        );
        const subjPayload = subjectsRes?.data;
        const subjList = subjPayload?.data?.docs || subjPayload?.data || [];
        const subjTotal = subjPayload?.data?.totalDocs || subjPayload?.total || subjPayload?.count || (Array.isArray(subjList) ? subjList.length : 0);
        setSubjectCount(Number(subjTotal) || 0);

      } catch (e) {
        console.error('UGPG Dashboard fetch error:', e);
        setError(e?.response?.data?.message || e.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '60vh',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              border: '4px solid #f3f4f6',
              borderTop: '4px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <div style={{ 
              fontSize: '16px', 
              color: '#6b7280',
              fontWeight: '500'
            }}>Loading dashboard data...</div>
          </div>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div style={{ 
          margin: '24px',
          padding: '20px 24px',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '12px',
          color: '#991b1b',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          fontSize: '15px',
          lineHeight: '1.6'
        }}>
          <strong style={{ display: 'block', marginBottom: '8px', fontSize: '16px' }}>Error Loading Dashboard</strong>
          {error}
        </div>
      </DashboardLayout>
    );
  }

  return (
    
      <div style={{ 
        padding: '24px',
        maxWidth: '1200px',
        
        margin: '130px 0 0 50px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }}>
        <div style={{
          marginBottom: '32px'
        }}>
          <h1 style={{ 
            fontSize: '32px',
            fontWeight: '700',
            margin: '0 0 8px 0',
            color: '#111827',
            letterSpacing: '-0.02em'
          }}>UG/PG Admin Dashboard</h1>
          <p style={{
            margin: 0,
            fontSize: '15px',
            color: '#6b7280'
          }}>Overview of undergraduate and postgraduate programs</p>
        </div>

        <div style={{ marginTop: '32px' }}>
          {/* Summary Cards */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
            gap: '20px',
            marginBottom: '24px'
          }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '16px', 
              padding: '24px',
              boxShadow: '0 10px 30px rgba(102, 126, 234, 0.25)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 15px 40px rgba(102, 126, 234, 0.35)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(102, 126, 234, 0.25)';
            }}>
              <div style={{
                position: 'absolute',
                right: '-20px',
                top: '-20px',
                width: '100px',
                height: '100px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '50%'
              }}></div>
              <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)', marginBottom: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>UG/PG Schools</div>
              <div style={{ fontSize: '42px', fontWeight: '800', color: '#fff', lineHeight: '1' }}>{schoolCount}</div>
            </div>

            <div style={{ 
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              borderRadius: '16px', 
              padding: '24px',
              boxShadow: '0 10px 30px rgba(245, 87, 108, 0.25)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 15px 40px rgba(245, 87, 108, 0.35)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(245, 87, 108, 0.25)';
            }}>
              <div style={{
                position: 'absolute',
                right: '-20px',
                top: '-20px',
                width: '100px',
                height: '100px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '50%'
              }}></div>
              <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)', marginBottom: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>UG/PG Courses</div>
              <div style={{ fontSize: '42px', fontWeight: '800', color: '#fff', lineHeight: '1' }}>{courseCount}</div>
            </div>

            <div style={{ 
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              borderRadius: '16px', 
              padding: '24px',
              boxShadow: '0 10px 30px rgba(79, 172, 254, 0.25)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 15px 40px rgba(79, 172, 254, 0.35)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(79, 172, 254, 0.25)';
            }}>
              <div style={{
                position: 'absolute',
                right: '-20px',
                top: '-20px',
                width: '100px',
                height: '100px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '50%'
              }}></div>
              <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)', marginBottom: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>UG/PG Subjects</div>
              <div style={{ fontSize: '42px', fontWeight: '800', color: '#fff', lineHeight: '1' }}>{subjectCount}</div>
            </div>
          </div>

          {/* Comparison Chart */}
          <div style={{ 
            background: '#fff', 
            border: '1px solid #e5e7eb', 
            borderRadius: '16px', 
            padding: '28px',
            marginBottom: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
            transition: 'box-shadow 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.08)'}
          onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.04)'}>
            <h3 style={{ 
              margin: '0 0 20px 0', 
              fontSize: '20px', 
              fontWeight: '700',
              color: '#111827',
              letterSpacing: '-0.01em'
            }}>University Registered vs Enrolled</h3>
            <Bar
              data={{
                labels: ['Registered', 'Enrolled'],
                datasets: [
                  {
                    label: 'Students',
                    data: [registeredCount, enrolledCount],
                    backgroundColor: ['#3b82f6', '#10b981'],
                    borderRadius: 8,
                    borderWidth: 0,
                  }
                ]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                  legend: { 
                    display: true, 
                    position: 'bottom',
                    labels: {
                      padding: 20,
                      font: {
                        size: 13,
                        weight: '600'
                      },
                      usePointStyle: true,
                      pointStyle: 'circle'
                    }
                  },
                  title: { display: false },
                  tooltip: { 
                    enabled: true,
                    backgroundColor: '#1f2937',
                    padding: 12,
                    titleFont: { size: 14, weight: '600' },
                    bodyFont: { size: 13 },
                    cornerRadius: 8
                  }
                },
                scales: {
                  y: { 
                    beginAtZero: true, 
                    ticks: { 
                      precision: 0,
                      font: { size: 12 },
                      color: '#6b7280'
                    },
                    grid: {
                      color: '#f3f4f6',
                      drawBorder: false
                    }
                  },
                  x: { 
                    grid: { display: false },
                    ticks: {
                      font: { size: 13, weight: '600' },
                      color: '#374151'
                    }
                  }
                }
              }}
            />
          </div>

          {/* Student Lists */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', 
            gap: '20px'
          }}>
            {/* Registered Students */}
            <div style={{ 
              background: '#fff', 
              border: '1px solid #e5e7eb', 
              borderRadius: '16px', 
              padding: '24px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              transition: 'box-shadow 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.08)'}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.04)'}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '20px'
              }}>
                <h3 style={{ 
                  margin: 0, 
                  fontSize: '18px', 
                  fontWeight: '700',
                  color: '#111827'
                }}>Recent Registered</h3>
                <a href="/ugpg-admin/admissions/all-registered" style={{ 
                  color: '#3b82f6', 
                  fontSize: '14px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#2563eb'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#3b82f6'}>
                  View all →
                </a>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {(registered || []).slice(0, 5).map((s, idx) => (
                  <li key={s._id} style={{ 
                    padding: '14px 0', 
                    borderBottom: idx < 4 ? '1px solid #f3f4f6' : 'none',
                    transition: 'background-color 0.2s ease',
                    marginLeft: '-8px',
                    marginRight: '-8px',
                    paddingLeft: '8px',
                    paddingRight: '8px',
                    borderRadius: '8px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <div style={{ 
                      fontWeight: '600',
                      color: '#111827',
                      fontSize: '15px',
                      marginBottom: '4px'
                    }}>{s.firstName} {s.lastName}</div>
                    <div style={{ 
                      fontSize: '13px', 
                      color: '#6b7280'
                    }}>{s.email}</div>
                  </li>
                ))}
                {(!registered || registered.length === 0) && (
                  <li style={{ 
                    color: '#9ca3af',
                    fontSize: '14px',
                    padding: '20px 0',
                    textAlign: 'center'
                  }}>No registered students</li>
                )}
              </ul>
            </div>

            {/* Enrolled Students */}
            <div style={{ 
              background: '#fff', 
              border: '1px solid #e5e7eb', 
              borderRadius: '16px', 
              padding: '24px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              transition: 'box-shadow 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.08)'}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.04)'}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '20px'
              }}>
                <h3 style={{ 
                  margin: 0, 
                  fontSize: '18px', 
                  fontWeight: '700',
                  color: '#111827'
                }}>Recent Enrolled</h3>
                <a href="/ugpg-admin/admissions/enrolled" style={{ 
                  color: '#3b82f6', 
                  fontSize: '14px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#2563eb'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#3b82f6'}>
                  View all →
                </a>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {(enrolled || []).slice(0, 5).map((e, idx) => (
                  <li key={e._id || e.email} style={{ 
                    padding: '14px 0', 
                    borderBottom: idx < 4 ? '1px solid #f3f4f6' : 'none',
                    transition: 'background-color 0.2s ease',
                    marginLeft: '-8px',
                    marginRight: '-8px',
                    paddingLeft: '8px',
                    paddingRight: '8px',
                    borderRadius: '8px'
                  }}
                  onMouseEnter={(ev) => ev.currentTarget.style.backgroundColor = '#f9fafb'}
                  onMouseLeave={(ev) => ev.currentTarget.style.backgroundColor = 'transparent'}>
                    <div style={{ 
                      fontWeight: '600',
                      color: '#111827',
                      fontSize: '15px',
                      marginBottom: '4px'
                    }}>{e.firstName} {e.lastName}</div>
                    <div style={{ 
                      fontSize: '13px', 
                      color: '#6b7280'
                    }}>{e.email}</div>
                  </li>
                ))}
                {(!enrolled || enrolled.length === 0) && (
                  <li style={{ 
                    color: '#9ca3af',
                    fontSize: '14px',
                    padding: '20px 0',
                    textAlign: 'center'
                  }}>No enrolled students</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    
  );
}