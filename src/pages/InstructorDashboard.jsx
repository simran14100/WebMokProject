


import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { apiConnector } from '../services/apiConnector';
import { categories, subCategory, course } from '../services/apis';

export default function InstructorOverview() {
  const { user } = useSelector((state) => state.profile);
  const { token } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [counts, setCounts] = useState({
    categories: 0,
    subcategories: 0,
    myCourses: 0,
  });

  useEffect(() => {
    const fetchCounts = async () => {
      setLoading(true);
      setError('');
      try {
        const baseCfg = {
          withCredentials: true,
          'X-Skip-Interceptor': 'true',
          headers: { Authorization: token ? `Bearer ${token}` : undefined },
        };

        const [catRes, subRes] = await Promise.all([
          apiConnector('GET', categories.CATEGORIES_API, null, baseCfg),
          apiConnector('GET', subCategory.SHOW_ALL_SUBCATEGORIES_API, null, baseCfg),
        ]);

        const categoriesCount = Array.isArray(catRes?.data?.allCategories)
          ? catRes.data.allCategories.length
          : (Array.isArray(catRes?.data?.data) ? catRes.data.data.length : 0);

        const subcategoriesCount = Array.isArray(subRes?.data?.allSubCategories)
          ? subRes.data.allSubCategories.length
          : (Array.isArray(subRes?.data?.data) ? subRes.data.data.length : 0);

        const myCoursesRes = await apiConnector('GET', course.GET_INSTRUCTOR_COURSES_API, null, baseCfg);
        const myCoursesArr = Array.isArray(myCoursesRes?.data?.data)
          ? myCoursesRes.data.data
          : (Array.isArray(myCoursesRes?.data?.courses) ? myCoursesRes.data.courses : []);

        setCounts({
          categories: categoriesCount,
          subcategories: subcategoriesCount,
          myCourses: myCoursesArr.length,
        });
      } catch (err) {
        console.error('InstructorOverview: counts fetch failed', err);
        setError(err?.response?.data?.message || err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, [token]);

  return (
    <div
  style={{
    padding: "1.5rem", // p-6
    paddingInline: "2rem", // md:p-8 (approx; media queries can’t be inline)
    width: "100%",
    minHeight: "100vh",
    backgroundColor: "white",
    marginLeft:"220px",
    marginTop:"4rem"
  }}
>
  <h1
    style={{
      fontSize: "1.5rem", // text-2xl
      fontWeight: "bold",
      color: "#111827", // text-gray-900
      // md:text-3xl → fontSize: "1.875rem" (needs media query outside inline styles)
    }}
  >
    Instructor Dashboard
  </h1>

  <p
    style={{
      color: "#4B5563", // text-gray-600
      marginTop: "0.25rem", // mt-1
    }}
  >
    Welcome{user?.firstName ? `, ${user.firstName}` : ""}!
  </p>

  {loading && (
    <div
      style={{
        marginTop: "2rem", // mt-8
        color: "#4B5563",
      }}
    >
      Loading dashboard...
    </div>
  )}

  {error && !loading && (
    <div
      style={{
        marginTop: "1.5rem", // mt-6
        padding: "1rem", // p-4
        borderRadius: "0.5rem",
        backgroundColor: "#FEF2F2", // bg-red-50
        color: "#B91C1C", // text-red-700
        border: "1px solid #FECACA", // border-red-200
      }}
    >
      {error}
    </div>
  )}

  {!loading && !error && (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr", // grid-cols-1
        gap: "1.5rem", // gap-6
        marginTop: "2rem", // mt-8
        // sm:grid-cols-3 → needs media query outside inline styles
      }}
    >
      {/* Categories */}
      <div
        style={{
          borderRadius: "0.75rem", // rounded-xl
          border: "1px solid #E5E7EB", // border-gray-200
          padding: "1.5rem", // p-6
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)", // shadow-sm
          background: "linear-gradient(to bottom right, #ECFDF5, white)", // from-green-50 to-white
        }}
      >
        <div
          style={{
            fontSize: "0.875rem", // text-sm
            textTransform: "uppercase",
            letterSpacing: "0.05em", // tracking-wide
            color: "#4B5563", // text-gray-600
          }}
        >
          Categories
        </div>
        <div
          style={{
            marginTop: "0.5rem", // mt-2
            fontSize: "2.25rem", // text-4xl
            fontWeight: "800", // font-extrabold
            color: "#047857", // text-green-700
          }}
        >
          {counts.categories}
        </div>
      </div>

      {/* Subcategories */}
      <div
        style={{
          borderRadius: "0.75rem",
          border: "1px solid #E5E7EB",
          padding: "1.5rem",
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
          background: "linear-gradient(to bottom right, #EFF6FF, white)", // from-blue-50 to-white
        }}
      >
        <div
          style={{
            fontSize: "0.875rem",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "#4B5563",
          }}
        >
          Subcategories
        </div>
        <div
          style={{
            marginTop: "0.5rem",
            fontSize: "2.25rem",
            fontWeight: "800",
            color: "#1D4ED8", // text-blue-700
          }}
        >
          {counts.subcategories}
        </div>
      </div>

      {/* My Courses */}
      <div
        style={{
          borderRadius: "0.75rem",
          border: "1px solid #E5E7EB",
          padding: "1.5rem",
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
          background: "linear-gradient(to bottom right, #D1FAE5, white)", // from-emerald-50 to-white
        }}
      >
        <div
          style={{
            fontSize: "0.875rem",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "#4B5563",
          }}
        >
          My Courses
        </div>
        <div
          style={{
            marginTop: "0.5rem",
            fontSize: "2.25rem",
            fontWeight: "800",
            color: "#047857", // text-emerald-700
          }}
        >
          {counts.myCourses}
        </div>
      </div>
    </div>
  )}
</div>

  );
}
