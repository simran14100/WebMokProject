import React, { useState, useEffect } from "react";
import DashboardLayout from "../../../common/DashboardLayout";
import { toast } from "react-hot-toast";
import { getAllCourses } from "../../../../services/operations/courseDetailsAPI";

const ED_TEAL = "#07A698";
const ED_TEAL_DARK = "#059a8c";
const TEXT_DARK = "#2d3748";
const TEXT_LIGHT = "#718096";

export default function AllCourses() {
  const [courses, setCourses] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesToShow, setEntriesToShow] = useState(10);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const data = await getAllCourses();
        if (Array.isArray(data)) {
          setCourses(data);
        } else {
          setCourses([]);
        }
      } catch (error) {
        toast.error("Could not fetch courses");
        console.error("GET_ALL_COURSES ERROR............", error);
      }
      setLoading(false);
    };
    fetchCourses();
  }, []);

  const term = (searchTerm || "").trim().toLowerCase();
  const score = (c) => {
    if (!term) return 0;
    const name = (c?.courseName || "").toLowerCase();
    if (!name) return 0;
    if (name === term) return 3;
    if (name.startsWith(term)) return 2;
    if (name.includes(term)) return 1;
    return 0;
  };
  const displayedCourses = [...courses]
    .map((c, i) => ({ c, i, s: score(c) }))
    .sort((a, b) => (b.s - a.s) || (a.i - b.i))
    .map(({ c }) => c);

  return (
    <DashboardLayout>
      <div className="all-categories-container">
        <div className="category-header">
          <h2>All Courses</h2>
          <div className="breadcrumb">
            <span>Course</span>
            <span className="divider">/</span>
            <span className="active">All Courses</span>
          </div>
        </div>

        <div className="table-card">
          <div className="table-controls">
            <div className="entries-control">
              <label>Show entries</label>
              <select
                value={entriesToShow}
                onChange={(e) => setEntriesToShow(Number(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            <div className="search-control">
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Serial No.</th>
                  <th>Course Name</th>
                  <th>Category</th>
                  <th>Subcategory</th>
                  <th>Price</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center' }}>Loading...</td>
                  </tr>
                ) : displayedCourses.length > 0 ? (
                  displayedCourses.slice(0, entriesToShow).map((course, index) => (
                    <tr key={course._id}>
                      <td>{index + 1}</td>
                      <td>{course.courseName}</td>
                      <td>{course.category?.name || '-'}</td>
                      <td>{course.subCategory?.name || '-'}</td>
                      <td>{typeof course.price === 'number' ? `₹${course.price}` : (course.price || '-')}</td>
                      <td>{course.status || '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center' }}>No courses found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="table-footer">
            <div className="showing-entries">
              Showing {Math.min(entriesToShow, displayedCourses.length)} of {displayedCourses.length} entries
            </div>
            <div className="pagination">
              <button disabled className="pagination-btn">Previous</button>
              <button className="pagination-btn active">1</button>
              <button disabled className="pagination-btn">Next</button>
            </div>
          </div>
        </div>

        <style jsx>{`
          .all-categories-container {
            width: calc(100% - 250px);
            margin-left: 250px;
            padding: 2rem;
            min-height: 100vh;
            background-color: #f8fafc;
          }

          .category-header {
            margin-bottom: 2rem;
          }

          .category-header h2 {
            font-size: 1.5rem;
            font-weight: 600;
            color: ${TEXT_DARK};
            margin-bottom: 0.5rem;
          }

          .breadcrumb {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.875rem;
            color: ${TEXT_LIGHT};
          }

          .divider {
            color: #cbd5e0;
          }

          .active {
            color: ${ED_TEAL};
            font-weight: 500;
          }

          .table-card {
            background: white;
            border-radius: 0.5rem;
            padding: 1.5rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }

          .table-controls {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
            flex-wrap: wrap;
            gap: 1rem;
          }

          .entries-control {
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .entries-control label {
            font-size: 0.875rem;
            color: ${TEXT_DARK};
          }

          .entries-control select {
            padding: 0.5rem;
            border: 1px solid #e2e8f0;
            border-radius: 0.375rem;
            font-size: 0.875rem;
          }

          .search-control input {
            padding: 0.5rem 1rem;
            border: 1px solid #e2e8f0;
            border-radius: 0.375rem;
            font-size: 0.875rem;
            min-width: 200px;
          }

          .table-responsive {
            overflow-x: auto;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.875rem;
          }

          th {
            background-color: ${ED_TEAL};
            color: white;
            padding: 0.75rem 1rem;
            text-align: left;
            font-weight: 500;
          }

          td {
            padding: 0.75rem 1rem;
            border-bottom: 1px solid #e2e8f0;
            color: ${TEXT_DARK};
          }

          tr:hover {
            background-color: #f8fafc;
          }

          .table-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px solid #e2e8f0;
          }

          .showing-entries {
            font-size: 0.875rem;
            color: ${TEXT_LIGHT};
          }

          .pagination {
            display: flex;
            gap: 0.5rem;
          }

          .pagination-btn {
            padding: 0.5rem 1rem;
            border: 1px solid #e2e8f0;
            border-radius: 0.375rem;
            background-color: white;
            color: ${TEXT_DARK};
            cursor: pointer;
            font-size: 0.875rem;
            transition: background-color 0.2s, color 0.2s;
          }

          .pagination-btn:hover {
            background-color: #f1f5f9;
          }

          .pagination-btn.active {
            background-color: ${ED_TEAL};
            color: white;
            border-color: ${ED_TEAL};
          }

          .pagination-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          @media (max-width: 1024px) {
            .all-categories-container {
              width: calc(100% - 200px);
              margin-left: 200px;
              padding: 1.5rem;
            }
          }

          @media (max-width: 768px) {
            .all-categories-container {
              width: 100%;
              margin-left: 0;
              padding: 1rem;
            }

            .table-card {
              padding: 1rem;
            }

            .table-controls {
              flex-direction: column;
              align-items: flex-start;
            }

            .search-control input {
              width: 100%;
            }

            .table-footer {
              flex-direction: column;
              gap: 1rem;
              align-items: flex-start;
            }
          }
        `}</style>
      </div>
    </DashboardLayout>
  );
}