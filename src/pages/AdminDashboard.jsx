import React, { useEffect, useState } from "react";
import { Line, Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { useSelector } from "react-redux";
import DashboardLayout from '../components/common/DashboardLayout';
import { fetchEnrolledStudents } from "../services/operations/enrollmentApi";
import { getDashboardStats } from "../services/operations/adminApi";
import { jwtDecode } from "jwt-decode";
import EnrolledStudents from './EnrolledStudents'; // Add this import at the top

const ED_TEAL = "#07A698";
const ED_TEAL_DARK = "#059a8c";
// Helper: lighten a hex color by mixing toward white by `amount` (0..1)
const lighten = (hex, amount = 0.2) => {
  try {
    const h = hex.replace('#','');
    const bigint = parseInt(h.length === 3 ? h.split('').map(c=>c+c).join('') : h, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    const lr = Math.round(r + (255 - r) * amount);
    const lg = Math.round(g + (255 - g) * amount);
    const lb = Math.round(b + (255 - b) * amount);
    const toHex = (n) => n.toString(16).padStart(2, '0');
    return `#${toHex(lr)}${toHex(lg)}${toHex(lb)}`;
  } catch { return hex; }
};
// Approximately "two shades lighter" than ED_TEAL
const ED_TEAL_LIGHT_2 = lighten(ED_TEAL, 0.85);
const LIGHT_BG = "#fff";
const BORDER = "#e0e0e0";
const TEXT_DARK = "#191A1F";

const AdminDashboard = () => {
  const { token } = useSelector((state) => state.auth);
  // Debug log: show token and decoded user info
  console.log("AdminDashboard token:", token);
  if (token) {
    try {
      const decoded = jwtDecode(token);
      console.log("Logged in user:", decoded.email, "| Role:", decoded.accountType);
    } catch (e) {
      console.log("Could not decode token");
    }
  }
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // KPI state
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(-1);

  useEffect(() => {
    async function getStudents() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchEnrolledStudents(token);
        console.log("Fetched enrolled students data:", data);
        console.log("enrolledStudents array:", data.data?.enrolledStudents);
        setStudents(data.data?.enrolledStudents || []);
      } catch (err) {
        setError("Failed to fetch enrolled students");
      }
      setLoading(false);
    }
    getStudents();
  }, [token]);

  useEffect(() => {
    async function loadStats() {
      setStatsLoading(true);
      setStatsError(null);
      try {
        const data = await getDashboardStats(token);
        console.log("Dashboard stats: ", data);
        setStats(data);
      } catch (e) {
        setStatsError("Failed to load dashboard stats");
      }
      setStatsLoading(false);
    }
    if (token) loadStats();
  }, [token]);

  // Prepare monthly earnings chart data
  const earnings = stats?.revenue?.monthlyEarnings || [];
  const currency = stats?.revenue?.currency || "INR";

  ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, BarElement, Tooltip, Legend);

  // Prepare area chart with Earnings vs Purchases
  const purchases = stats?.revenue?.monthlyPurchases || [];
  // Build a unified sorted label set like YYYY-MM
  const monthKey = (y, m) => `${y}-${String(m).padStart(2, "0")}`;
  const keyToLabel = (k) => `${k.split("-")[1]}/${k.split("-")[0]}`;
  const earnMap = new Map(earnings.map((e) => [monthKey(e.year, e.month), e.amount || 0]));
  const purchMap = new Map(purchases.map((p) => [monthKey(p.year, p.month), p.count || 0]));
  const keys = Array.from(new Set([...earnMap.keys(), ...purchMap.keys()])).sort();
  const areaLabels = keys.map(keyToLabel);
  const areaEarnings = keys.map((k) => earnMap.get(k) || 0);
  const areaPurchases = keys.map((k) => purchMap.get(k) || 0);

  const lineData = {
    labels: areaLabels,
    datasets: [
      {
        label: `Monthly Earnings (${currency})`,
        data: areaEarnings,
        borderColor: ED_TEAL,
        backgroundColor: ED_TEAL + "33",
        tension: 0.35,
        pointRadius: 2,
        fill: true,
        yAxisID: 'y',
      },
      {
        label: "Monthly Purchases",
        data: areaPurchases,
        borderColor: "#6C63FF",
        backgroundColor: "#6C63FF33",
        tension: 0.35,
        pointRadius: 2,
        fill: true,
        yAxisID: 'y1',
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, labels: { color: TEXT_DARK } },
      tooltip: { mode: "index", intersect: false },
    },
    interaction: { mode: "nearest", intersect: false },
    scales: {
      x: { ticks: { color: TEXT_DARK }, grid: { display: false } },
      y: { position: 'left', ticks: { color: TEXT_DARK }, grid: { color: "#eee" } },
      y1: { position: 'right', ticks: { color: TEXT_DARK }, grid: { drawOnChartArea: false } },
    },
  };

  // Doughnut (pie) data for learning composition
  const purchasedTotal = stats?.learning?.purchased?.total ?? 0;
  const completedTotal = stats?.learning?.completed?.total ?? 0;
  const pendingTotal = stats?.learning?.pending?.total ?? 0;
  const doughnutData = {
    labels: ["Purchased", "Completed", "Pending"],
    datasets: [
      {
        data: [purchasedTotal, completedTotal, pendingTotal],
        backgroundColor: ["#6C63FF", ED_TEAL, "#E5E7EB"],
        borderColor: ["#6C63FF", ED_TEAL, "#E5E7EB"],
        borderWidth: 1,
      },
    ],
  };
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true, position: 'bottom', labels: { color: TEXT_DARK } } },
    cutout: '65%',
  };

  // 3 KPI cards: Courses, Batches, Students
  const cardOrder = [
    stats?.cards?.courses,
    stats?.cards?.batches,
    stats?.cards?.students,
  ].filter(Boolean);

  // Donut: show TOTAL Earnings vs TOTAL Students Enrolled (not only current month)
  const totalEarnings = stats?.totals?.totalEarnings ?? 0;
  const totalStudentsEnrolled = stats?.totals?.totalStudentsEnrolled ?? 0;
  // Scale earnings for visualization so that students slice remains visible
  const scaleInfo = (() => {
    if (totalEarnings >= 1e7) return { divisor: 1e7, label: "crores" };
    if (totalEarnings >= 1e5) return { divisor: 1e5, label: "lakhs" };
    if (totalEarnings >= 1e3) return { divisor: 1e3, label: "thousands" };
    return { divisor: 1, label: "" };
  })();
  const scaledEarnings = Math.round((totalEarnings / scaleInfo.divisor) * 100) / 100; // 2 decimals
  const earningVsStudentData = {
    labels: [
      scaleInfo.label ? `Total Earnings (in ${scaleInfo.label})` : "Total Earnings",
      "Students Enrolled",
    ],
    datasets: [
      {
        data: [scaledEarnings, totalStudentsEnrolled],
        backgroundColor: ["#6C63FF", ED_TEAL],
        borderColor: ["#ffffff", "#ffffff"],
        borderWidth: 1,
        hoverOffset: 6,
      },
    ],
  };

  // Bar chart for learning totals: purchased, completed, pending
  const barData = {
    labels: ["Purchased", "Completed", "Pending"],
    datasets: [
      {
        label: "Courses",
        data: [
          stats?.learning?.purchased?.total ?? 0,
          stats?.learning?.completed?.total ?? 0,
          stats?.learning?.pending?.total ?? 0,
        ],
        backgroundColor: ["#6C63FF", ED_TEAL, "#E5E7EB"],
        borderRadius: 8,
      },
    ],
  };
  const barOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: TEXT_DARK } },
      y: { ticks: { color: TEXT_DARK }, beginAtZero: true },
    },
  };

  // Courses vs Students Enrolled (totals)
  const totalCoursesCount = stats?.cards?.courses?.total ?? 0;
  const totalStudentsEnrolledCount = stats?.totals?.totalStudentsEnrolled ?? 0;

  const coursesVsStudentsData = {
    labels: ['Courses', 'Students Enrolled'],
    datasets: [
      {
        label: 'Totals',
        data: [totalCoursesCount, totalStudentsEnrolledCount],
        backgroundColor: ['#6366F1', ED_TEAL],
        borderRadius: 10,
        maxBarThickness: 20,
        barPercentage: 0.5,
        categoryPercentage: 0.6,
      },
    ],
  };
  const coursesVsStudentsMax = Math.max(totalCoursesCount, totalStudentsEnrolledCount);
  const coursesVsStudentsOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    layout: { padding: { top: 0, right: 8, bottom: 0, left: 8 } },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.label}: ${Number(ctx.raw).toLocaleString('en-IN')}`,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: TEXT_DARK,
          beginAtZero: true,
          precision: 0,
          font: { size: 11 },
          callback: (value) => new Intl.NumberFormat('en-US', { notation: 'compact' }).format(value),
        },
        grid: { color: '#f2f2f2' },
        border: { display: false },
        suggestedMax: Math.ceil(coursesVsStudentsMax * 1.1),
      },
      y: {
        ticks: { color: TEXT_DARK, font: { size: 12 } },
        grid: { display: false },
      },
    },
  };

  // Students Registered vs Students Enrolled (totals, compact horizontal)
  const totalStudentsRegistered = stats?.cards?.students?.total ?? 0;
  const totalStudentsEnrolled2 = stats?.totals?.totalStudentsEnrolled ?? 0;
  const regVsEnrollData = {
    labels: ['Registered Students', 'Enrolled Students'],
    datasets: [
      {
        label: 'Totals',
        data: [totalStudentsRegistered, totalStudentsEnrolled2],
        backgroundColor: ['#6366F1', ED_TEAL],
        borderRadius: 10,
        maxBarThickness: 20,
        barPercentage: 0.5,
        categoryPercentage: 0.6,
      },
    ],
  };
  const regVsEnrollMax = Math.max(totalStudentsRegistered, totalStudentsEnrolled2);
  const regVsEnrollOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    layout: { padding: { top: 0, right: 8, bottom: 0, left: 8 } },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.label}: ${Number(ctx.raw).toLocaleString('en-IN')}`,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: TEXT_DARK,
          beginAtZero: true,
          precision: 0,
          font: { size: 11 },
          callback: (value) => new Intl.NumberFormat('en-US', { notation: 'compact' }).format(value),
        },
        grid: { color: '#f2f2f2' },
        border: { display: false },
        suggestedMax: Math.ceil(regVsEnrollMax * 1.1),
      },
      y: {
        ticks: { color: TEXT_DARK, font: { size: 12 } },
        grid: { display: false },
      },
    },
  };

  // Batch monthly line chart (batches vs students)
  const batchMonthly = stats?.batch?.monthly || [];
  const bKeys = batchMonthly.map(b => monthKey(b.year, b.month));
  const bLabels = bKeys.map(keyToLabel);
  const bBatches = batchMonthly.map(b => b.batches || 0);
  const bStudents = batchMonthly.map(b => b.students || 0);
  const batchLineData = {
    labels: bLabels,
    datasets: [
      {
        label: "Total Batches",
        data: bBatches,
        borderColor: "#6C63FF",
        backgroundColor: "#6C63FF33",
        tension: 0.35,
        pointRadius: 2,
        fill: true,
      },
      {
        label: "Students in Batches",
        data: bStudents,
        borderColor: ED_TEAL,
        backgroundColor: ED_TEAL + '33',
        tension: 0.35,
        pointRadius: 2,
        fill: true,
      },
    ],
  };

  // Bar version of Batch details (grouped bars per month) with improved UI
  const batchBarData = {
    labels: bLabels,
    datasets: [
      {
        label: "Total Batches",
        data: bBatches,
        backgroundColor: "#6366F1",
        borderRadius: 8,
        maxBarThickness: 26,
        barPercentage: 0.7,
        categoryPercentage: 0.6,
      },
      {
        label: "Students in Batches",
        data: bStudents,
        backgroundColor: ED_TEAL,
        borderRadius: 8,
        maxBarThickness: 26,
        barPercentage: 0.7,
        categoryPercentage: 0.6,
      },
    ],
  };
  const batchBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { top: 0, right: 8, bottom: 0, left: 8 } },
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: { color: TEXT_DARK },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${Number(ctx.raw).toLocaleString('en-IN')}`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: TEXT_DARK, font: { size: 11 } },
        grid: { display: false },
      },
      y: {
        ticks: { color: TEXT_DARK, beginAtZero: true, precision: 0, font: { size: 11 } },
        grid: { color: '#f2f2f2' },
        border: { display: false },
      },
    },
  };

  return (
    <DashboardLayout>
  <div className="admin-container">
    <div style={{ textAlign: "center", marginBottom: "24px" }}>
      <h1
        style={{
          fontSize: "36px",
          fontWeight: 700,
          color: "#07A698", // TEXT_DARK
          marginBottom: "12px",
          marginTop: "22px",
        }}
      >
        Admin Dashboard
      </h1>
      
    </div>

    {/* KPI Cards */}
    <div className="kpi-grid">
      {cardOrder.map((card, idx) => (
        <div
          key={idx}
          style={{
            background: hoveredCard === idx ? ED_TEAL_LIGHT_2 : "#ffffff", // LIGHT_BG
            borderRadius: "12px",
            border: "1px solid #e0e0e0", // BORDER
            boxShadow: hoveredCard === idx ? "0 6px 18px rgba(7,166,152,0.16)" : "0 4px 14px rgba(0,0,0,0.05)",
            padding: "20px",
            transform: hoveredCard === idx ? "translateY(-2px)" : "none",
            transition: "all 180ms ease",
            cursor: "pointer",
          }}
          onMouseEnter={() => setHoveredCard(idx)}
          onMouseLeave={() => setHoveredCard(-1)}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "8px",
            }}
          >
            <span
              style={{
                fontSize: "14px",
                color: "#191A1F",
                opacity: 0.8,
                fontWeight: 600,
              }}
            >
              {card?.title}
            </span>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 999,
                background: (card?.deltaPercent ?? 0) >= 0 ? "#ECFDF5" : "#FEE2E2",
                color: (card?.deltaPercent ?? 0) >= 0 ? "#047857" : "#B91C1C",
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
              }}
              title={card?.title}
            >
              {(card?.title || '').charAt(0).toUpperCase()}
            </div>
          </div>
          {statsLoading ? (
            <div
              style={{
                height: "36px",
                display: "flex",
                alignItems: "center",
                color: "#07A698", // ED_TEAL
              }}
            >
              Loading...
            </div>
          ) : statsError ? (
            <div
              style={{
                height: "36px",
                display: "flex",
                alignItems: "center",
                color: "#e53935",
              }}
            >
              {statsError}
            </div>
          ) : (
            <div
              style={{
                fontSize: "30px",
                fontWeight: 800,
                color: "#0f172a",
              }}
            >
              {card?.total ?? 0}
            </div>
          )}
          {!statsLoading && !statsError && (
            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  background: (card?.deltaPercent ?? 0) >= 0 ? '#ECFDF5' : '#FEE2E2',
                  color: (card?.deltaPercent ?? 0) >= 0 ? '#047857' : '#B91C1C',
                  borderRadius: 999,
                  padding: '4px 8px',
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {(card?.deltaPercent ?? 0) >= 0 ? '▲' : '▼'} {Math.abs(card?.deltaPercent ?? 0)}%
              </span>
              <span style={{ fontSize: 12, color: '#64748b' }}>from previous period</span>
            </div>
          )}
        </div>
      ))}
    </div>

    {/* Charts Row: Donut + Area */}
    <div className="charts-grid">
      <div
        style={{
          background: "#ffffff",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          padding: "24px",
          border: "1px solid #e0e0e0",
        }}
      >
        <h2
          style={{
            fontSize: "22px",
            fontWeight: 600,
            color: "#07A698",
            marginBottom: "12px",
          }}
        >
          Total Earnings vs Students Enrolled
        </h2>
        {statsLoading ? (
          <div style={{ color: "#07A698" }}>Loading...</div>
        ) : statsError ? (
          <div style={{ color: "#e53935" }}>{statsError}</div>
        ) : totalEarnings === 0 && totalStudentsEnrolled === 0 ? (
          <div style={{ color: "#191A1F" }}>
            No earnings or enrolled students recorded yet.
          </div>
        ) : (
          <>
            <div className="chart-box">
              <Doughnut data={earningVsStudentData} options={doughnutOptions} />
            </div>
            {scaleInfo.label && (
              <div style={{ marginTop: 8, fontSize: 12, color: "#6b7280" }}>
                Note: Earnings scaled in {scaleInfo.label} for visualization.
              </div>
            )}
          </>
        )}
      </div>
      <div
        style={{
          background: "#ffffff",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          padding: "24px",
          border: "1px solid #e0e0e0",
        }}
      >
        <h2
          style={{
            fontSize: "22px",
            fontWeight: 600,
            color: "#07A698",
            marginBottom: "12px",
          }}
        >
         Monthly Purchased vs Earnings
        </h2>
        {statsLoading ? (
          <div style={{ color: "#07A698" }}>Loading...</div>
        ) : statsError ? (
          <div style={{ color: "#e53935" }}>{statsError}</div>
        ) : areaLabels.length === 0 ? (
          <div style={{ color: "#191A1F" }}>No trend data yet.</div>
        ) : (
          <div className="line-box">
            <Line data={lineData} options={lineOptions} />
          </div>
        )}
      </div>
    </div>

    {/* Courses vs Students Enrolled */}
    <div
      style={{
        background: "#ffffff",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        padding: "16px",
        marginBottom: "16px",
        border: "1px solid #e0e0e0",
        minHeight: "180px",
      }}
    >
      <h2
        style={{
          fontSize: "18px",
          fontWeight: 600,
          color: "#07A698",
          marginBottom: "8px",
        }}
      >
        No. of Courses vs Students Enrolled
      </h2>
      {statsLoading ? (
        <div style={{ color: "#07A698" }}>Loading...</div>
      ) : statsError ? (
        <div style={{ color: "#e53935" }}>{statsError}</div>
      ) : (
        <div className="bar-box">
          <Bar data={coursesVsStudentsData} options={coursesVsStudentsOptions} />
        </div>
      )}
    </div>

    {/* Students Registered vs Students Enrolled */}
    <div
      style={{
        background: "#ffffff",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        padding: "16px",
        marginBottom: "16px",
        border: "1px solid #e0e0e0",
        minHeight: "180px",
      }}
    >
      <h2
        style={{
          fontSize: "18px",
          fontWeight: 600,
          color: "#07A698",
          marginBottom: "8px",
        }}
      >
        Students Registered vs Students Enrolled
      </h2>
      {statsLoading ? (
        <div style={{ color: "#07A698" }}>Loading...</div>
      ) : statsError ? (
        <div style={{ color: "#e53935" }}>{statsError}</div>
      ) : (
        <div className="bar-box">
          <Bar data={regVsEnrollData} options={regVsEnrollOptions} />
        </div>
      )}
    </div>

    

    {/* Batch details chart */}
    <div
      style={{
        background: "#ffffff",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        padding: "24px",
        marginBottom: "24px",
        border: "1px solid #e0e0e0",
      }}
    >
      <h2
        style={{
          fontSize: "22px",
          fontWeight: 600,
          color: "#07A698",
          marginBottom: "12px",
        }}
      >
        Batch Details: Batches vs Students
      </h2>
      {statsLoading ? (
        <div style={{ color: "#07A698" }}>Loading...</div>
      ) : statsError ? (
        <div style={{ color: "#e53935" }}>{statsError}</div>
      ) : bLabels.length === 0 ? (
        <div style={{ color: "#191A1F" }}>No batch data yet.</div>
      ) : (
        <div className="batch-bar-box">
          <Bar data={batchBarData} options={batchBarOptions} />
        </div>
      )}
    </div>
  <style jsx>{`
    .admin-container {
      max-width: 1200px;
      margin-right : -3rem; /* mobile: no sidebar offset */
      padding: 0 16px;
      overflow-x: hidden;
      margin-top: 20px; /* mobile top spacing */
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 16px;
      margin-bottom: 24px;
    }
    @media (min-width: 640px) { /* sm */
      .kpi-grid { grid-template-columns: repeat(2, 1fr); }
      .admin-container { margin-top: 8px; }
    }
    @media (min-width: 1024px) { /* lg */
      .kpi-grid { grid-template-columns: repeat(3, 1fr); }
      .admin-container { margin-top: 0; margin-left: 100px; }
    }

    .charts-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 16px;
      margin-bottom: 24px;
    }
    @media (min-width: 1024px) { /* lg */
      .charts-grid { grid-template-columns: 1fr 2fr; }
    }

    /* Chart containers for responsive heights */
    .chart-box { height: 240px; }
    .line-box { height: 220px; }
    .bar-box { height: 200px; }
    .batch-bar-box { height: 220px; }
    @media (min-width: 640px) { /* sm */
      .chart-box { height: 300px; }
      .line-box { height: 260px; }
      .bar-box { height: 220px; }
      .batch-bar-box { height: 260px; }
    }
  `}</style>
  </div>
</DashboardLayout>

  )
};

export default AdminDashboard; 