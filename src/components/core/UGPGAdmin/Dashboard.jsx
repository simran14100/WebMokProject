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
  const [subjects, setSubjects] = useState([]);

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
        console.log('[UGPG Dashboard] Schools count:', Number(sTotal) || 0);

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
        console.log('[UGPG Dashboard] Courses count:', Number(cTotal) || 0);

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
        setSubjects(Array.isArray(subjList) ? subjList : []);
        console.log('[UGPG Dashboard] Subjects count:', Number(subjTotal) || 0);
        if (Number(subjTotal) === 5) {
          console.log('[UGPG Dashboard] We have 5 subjects.');
        }
      } catch (e) {
        console.error('UGPG Dashboard fetch error:', e);
        setError(e?.response?.data?.message || e.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
 
     <div style={{ marginTop: '12rem' , marginLeft:"120px" }}>
      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
        
        <div style={{ background: '#fff', border: '1px solid #eaeef3', borderRadius: 12, padding: 16, boxShadow: '0 4px 14px rgba(0,0,0,0.04)'}}>
          <div style={{ fontSize: 13, color: '#64748b', marginBottom: 6 }}>UG/PG Schools</div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>{schoolCount}</div>
        </div>
        <div style={{ background: '#fff', border: '1px solid #eaeef3', borderRadius: 12, padding: 16, boxShadow: '0 4px 14px rgba(0,0,0,0.04)'}}>
          <div style={{ fontSize: 13, color: '#64748b', marginBottom: 6 }}>UG/PG Courses</div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>{courseCount}</div>
        </div>
        <div style={{ background: '#fff', border: '1px solid #eaeef3', borderRadius: 12, padding: 16, boxShadow: '0 4px 14px rgba(0,0,0,0.04)'}}>
          <div style={{ fontSize: 13, color: '#64748b', marginBottom: 6 }}>UG/PG Subjects</div>
          <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>{subjectCount}</div>
          
        </div>
      </div>

      {/* Comparison Chart: University Registered vs Enrolled */}
      <div style={{ background: '#fff', border: '1px solid #eaeef3', borderRadius: 12, padding: 16, marginTop: 16 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, marginBottom: 12 }}>University Registered vs Enrolled</h3>
        <Bar
          data={{
            labels: ['Registered', 'Enrolled'],
            datasets: [
              {
                label: 'Students',
                data: [registeredCount, enrolledCount],
                backgroundColor: ['#38bdf8', '#34d399'],
                borderRadius: 6,
                borderWidth: 0,
              }
            ]
          }}
          options={{
            responsive: true,
            plugins: {
              legend: { display: true, position: 'bottom' },
              title: { display: false },
              tooltip: { enabled: true }
            },
            scales: {
              y: { beginAtZero: true, ticks: { precision: 0 } },
              x: { grid: { display: false } }
            }
          }}
        />
      </div>

      {/* Lists */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16, marginTop: 16 }}>
        <div style={{ background: '#fff', border: '1px solid #eaeef3', borderRadius: 12, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Recent Registered</h3>
            <a href="/ugpg-admin/admissions/all-registered" style={{ color: '#0ea5e9', fontSize: 13 }}>View all</a>
          </div>
          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div style={{ color: 'crimson' }}>{error}</div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {(registered || []).slice(0, 10).map((s) => (
                <li key={s._id} style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ fontWeight: 600 }}>{s.firstName} {s.lastName}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{s.email}</div>
                </li>
              ))}
              {(!registered || registered.length === 0) && <li style={{ color: '#64748b' }}>No records</li>}
            </ul>
          )}
        </div>

        <div style={{ background: '#fff', border: '1px solid #eaeef3', borderRadius: 12, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Recent Enrolled</h3>
            <a href="/ugpg-admin/admissions/enrolled" style={{ color: '#0ea5e9', fontSize: 13 }}>View all</a>
          </div>
          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div style={{ color: 'crimson' }}>{error}</div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {(enrolled || []).slice(0, 10).map((e) => (
                <li key={e._id} style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ fontWeight: 600 }}>{e.student?.firstName || e.firstName} {e.student?.lastName || e.lastName}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{e.student?.email || e.email}</div>
                </li>
              ))}
              {(!enrolled || enrolled.length === 0) && <li style={{ color: '#64748b' }}>No records</li>}
            </ul>
          )}
        </div>
      </div>
    </div>
  
  );
}
