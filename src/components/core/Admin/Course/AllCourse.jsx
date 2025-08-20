// import React, { useState, useEffect } from "react";
// import DashboardLayout from "../../../common/DashboardLayout";
// import { toast } from "react-hot-toast";
// import { getAllCourses } from "../../../../services/operations/courseDetailsAPI";

// const ED_TEAL = "#07A698";
// const ED_TEAL_DARK = "#059a8c";
// const TEXT_DARK = "#2d3748";
// const TEXT_LIGHT = "#718096";

// export default function AllCourses() {
//   const [courses, setCourses] = useState([]); 
//   const [loading, setLoading] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [entriesToShow, setEntriesToShow] = useState(10);

//   useEffect(() => {
//     const fetchCourses = async () => {
//       setLoading(true);
//       try {
//         const data = await getAllCourses();
//         if (Array.isArray(data)) {
//           setCourses(data);
//         } else {
//           setCourses([]);
//         }
//       } catch (error) {
//         toast.error("Could not fetch courses");
//         console.error("GET_ALL_COURSES ERROR............", error);
//       }
//       setLoading(false);
//     };
//     fetchCourses();
//   }, []);

//   const term = (searchTerm || "").trim().toLowerCase();
//   const score = (c) => {
//     if (!term) return 0;
//     const name = (c?.courseName || "").toLowerCase();
//     if (!name) return 0;
//     if (name === term) return 3;
//     if (name.startsWith(term)) return 2;
//     if (name.includes(term)) return 1;
//     return 0;
//   };
//   const displayedCourses = [...courses]
//     .map((c, i) => ({ c, i, s: score(c) }))
//     .sort((a, b) => (b.s - a.s) || (a.i - b.i))
//     .map(({ c }) => c);

//   return (
//     <DashboardLayout>
//       <div className="all-categories-container">
//         <div className="category-header">
//           <h2>All Courses</h2>
//           <div className="breadcrumb">
//             <span>Course</span>
//             <span className="divider">/</span>
//             <span className="active">All Courses</span>
//           </div>
//         </div>

//         <div className="table-card">
//           <div className="table-controls">
//             <div className="entries-control">
//               <label>Show entries</label>
//               <select
//                 value={entriesToShow}
//                 onChange={(e) => setEntriesToShow(Number(e.target.value))}
//               >
//                 <option value={10}>10</option>
//                 <option value={25}>25</option>
//                 <option value={50}>50</option>
//                 <option value={100}>100</option>
//               </select>
//             </div>
//             <div className="search-control">
//               <input
//                 type="text"
//                 placeholder="Search courses..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//               />
//             </div>
//           </div>

//           <div className="table-responsive">
//             <table>
//               <thead>
//                 <tr>
//                   <th>Serial No.</th>
//                   <th>Course Name</th>
//                   <th>Category</th>
//                   <th>Subcategory</th>
//                   <th>Price</th>
//                   <th>Status</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {loading ? (
//                   <tr>
//                     <td colSpan="6" style={{ textAlign: 'center' }}>Loading...</td>
//                   </tr>
//                 ) : displayedCourses.length > 0 ? (
//                   displayedCourses.slice(0, entriesToShow).map((course, index) => (
//                     <tr key={course._id}>
//                       <td>{index + 1}</td>
//                       <td>{course.courseName}</td>
//                       <td>{course.category?.name || '-'}</td>
//                       <td>{course.subCategory?.name || '-'}</td>
//                       <td>{typeof course.price === 'number' ? `₹${course.price}` : (course.price || '-')}</td>
//                       <td>{course.status || '-'}</td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan="6" style={{ textAlign: 'center' }}>No courses found.</td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>

//           <div className="table-footer">
//             <div className="showing-entries">
//               Showing {Math.min(entriesToShow, displayedCourses.length)} of {displayedCourses.length} entries
//             </div>
//             <div className="pagination">
//               <button disabled className="pagination-btn">Previous</button>
//               <button className="pagination-btn active">1</button>
//               <button disabled className="pagination-btn">Next</button>
//             </div>
//           </div>
//         </div>

//         <style jsx>{`
//           .all-categories-container {
//             width: calc(100% - 250px);
//             margin-left: 250px;
//             padding: 2rem;
//             min-height: 100vh;
//             background-color: #f8fafc;
//           }

//           .category-header {
//             margin-bottom: 2rem;
//           }

//           .category-header h2 {
//             font-size: 1.5rem;
//             font-weight: 600;
//             color: ${TEXT_DARK};
//             margin-bottom: 0.5rem;
//           }

//           .breadcrumb {
//             display: flex;
//             align-items: center;
//             gap: 0.5rem;
//             font-size: 0.875rem;
//             color: ${TEXT_LIGHT};
//           }

//           .divider {
//             color: #cbd5e0;
//           }

//           .active {
//             color: ${ED_TEAL};
//             font-weight: 500;
//           }

//           .table-card {
//             background: white;
//             border-radius: 0.5rem;
//             padding: 1.5rem;
//             box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
//           }

//           .table-controls {
//             display: flex;
//             justify-content: space-between;
//             align-items: center;
//             margin-bottom: 1rem;
//             flex-wrap: wrap;
//             gap: 1rem;
//           }

//           .entries-control {
//             display: flex;
//             align-items: center;
//             gap: 0.5rem;
//           }

//           .entries-control label {
//             font-size: 0.875rem;
//             color: ${TEXT_DARK};
//           }

//           .entries-control select {
//             padding: 0.5rem;
//             border: 1px solid #e2e8f0;
//             border-radius: 0.375rem;
//             font-size: 0.875rem;
//           }

//           .search-control input {
//             padding: 0.5rem 1rem;
//             border: 1px solid #e2e8f0;
//             border-radius: 0.375rem;
//             font-size: 0.875rem;
//             min-width: 200px;
//           }

//           .table-responsive {
//             overflow-x: auto;
//           }

//           table {
//             width: 100%;
//             border-collapse: collapse;
//             font-size: 0.875rem;
//           }

//           th {
//             background-color: ${ED_TEAL};
//             color: white;
//             padding: 0.75rem 1rem;
//             text-align: left;
//             font-weight: 500;
//           }

//           td {
//             padding: 0.75rem 1rem;
//             border-bottom: 1px solid #e2e8f0;
//             color: ${TEXT_DARK};
//           }

//           tr:hover {
//             background-color: #f8fafc;
//           }

//           .table-footer {
//             display: flex;
//             justify-content: space-between;
//             align-items: center;
//             margin-top: 1rem;
//             padding-top: 1rem;
//             border-top: 1px solid #e2e8f0;
//           }

//           .showing-entries {
//             font-size: 0.875rem;
//             color: ${TEXT_LIGHT};
//           }

//           .pagination {
//             display: flex;
//             gap: 0.5rem;
//           }

//           .pagination-btn {
//             padding: 0.5rem 1rem;
//             border: 1px solid #e2e8f0;
//             border-radius: 0.375rem;
//             background-color: white;
//             color: ${TEXT_DARK};
//             cursor: pointer;
//             font-size: 0.875rem;
//             transition: background-color 0.2s, color 0.2s;
//           }

//           .pagination-btn:hover {
//             background-color: #f1f5f9;
//           }

//           .pagination-btn.active {
//             background-color: ${ED_TEAL};
//             color: white;
//             border-color: ${ED_TEAL};
//           }

//           .pagination-btn:disabled {
//             opacity: 0.5;
//             cursor: not-allowed;
//           }

//           @media (max-width: 1024px) {
//             .all-categories-container {
//               width: calc(100% - 200px);
//               margin-left: 200px;
//               padding: 1.5rem;
//             }
//           }

//           @media (max-width: 768px) {
//             .all-categories-container {
//               width: 100%;
//               margin-left: 0;
//               padding: 1rem;
//             }

//             .table-card {
//               padding: 1rem;
//             }

//             .table-controls {
//               flex-direction: column;
//               align-items: flex-start;
//             }

//             .search-control input {
//               width: 100%;
//             }

//             .table-footer {
//               flex-direction: column;
//               gap: 1rem;
//               align-items: flex-start;
//             }
//           }
//         `}</style>
//       </div>
//     </DashboardLayout>
//   );
// }


import React, { useState, useEffect } from "react";
import DashboardLayout from "../../../common/DashboardLayout";
import { toast } from "react-hot-toast";
import { getAllCourses } from "../../../../services/operations/courseDetailsAPI";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const ED_TEAL = "#07A698";
const ED_TEAL_DARK = "#059a8c";
const ED_TEAL_LIGHT = "#E6F7F5"; // Added this line
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

  const getCourseThumbnail = (course) => {
    return course.thumbnail || "/assets/img/default-course-thumbnail.jpg";
  };

  return (
    <DashboardLayout>
      <div className="all-courses-container">
        <div className="category-header">
          <h2>All Courses</h2>
          <div className="breadcrumb">
            <span>Course</span>
            <span className="divider">/</span>
            <span className="active">All Courses</span>
          </div>
        </div>

        <div className="controls-container">
          {/* <div className="entries-control">
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
          </div> */}
          <div className="search-control">
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading courses...</p>
          </div>
        ) : displayedCourses.length > 0 ? (
          <div className="courses-grid">
            {displayedCourses.slice(0, entriesToShow).map((course, index) => (
              <motion.div 
                key={course._id}
                className="course-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ y: -5 }}
              >
                <div className="course-thumbnail">
                  <img 
                    src={getCourseThumbnail(course)} 
                    alt={course.courseName}
                  />
                </div>
                
                <div className="course-content">
                  <div className="course-price">
                    {course.price === 0 ? 'Free' : `₹${course.price}`}
                  </div>
                  
                  <h3 className="course-title">
                    <Link to={`/course/${course._id}`}>
                      {course.courseName}
                    </Link>
                  </h3>
                  
                  <div className="course-meta">
                    <div className="meta-item">
                      <i className="fa-light fa-file"></i>
                      {course.courseContent?.length || 0} Lessons
                    </div>
                    <div className="meta-item">
                      <i className="fa-light fa-user"></i>
                      {course.studentsEnrolled?.length || 0} Students
                    </div>
                  </div>
                  
                  <div className="course-footer">
                    <div className="instructor-info">
                      <div className="instructor-avatar">
                        <img 
                          src={course.instructor?.image || "/assets/img/default-avatar.png"} 
                          alt="Instructor"
                        />
                      </div>
                      <div className="instructor-name">
                        {course.instructor?.firstName || "Instructor"} {course.instructor?.lastName || ""}
                      </div>
                    </div>
                    
                    <div className="course-rating">
                      <i className="fa-sharp fa-solid fa-star"></i>
                      <span>4.7</span>
                    </div>
                  </div>
                  
                  <Link to={`/course/${course._id}`} className="view-details-btn">
                    View Details
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No courses found.</p>
          </div>
        )}

        <div className="pagination-container">
          <div className="showing-entries">
            Showing {Math.min(entriesToShow, displayedCourses.length)} of {displayedCourses.length} entries
          </div>
          <div className="pagination">
            <button disabled className="pagination-btn">Previous</button>
            <button className="pagination-btn active">1</button>
            <button disabled className="pagination-btn">Next</button>
          </div>
        </div>

        <style jsx>{`
          .all-courses-container {
            width: calc(100% - 250px);
            margin-left: 250px;
            padding: 6rem 2rem 2rem; /* top padding avoids fixed navbar overlap */
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

          .controls-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
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

          .loading-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 3rem;
            gap: 1rem;
          }

          .spinner {
            border: 3px solid rgba(0, 0, 0, 0.1);
            border-radius: 50%;
            border-top: 3px solid ${ED_TEAL};
            width: 30px;
            height: 30px;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          .courses-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
          }

          .course-card {
            background: white;
            border-radius: 16px;
            overflow: hidden;
            border: 1px solid #E8ECF0;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
            transition: all 0.3s ease;
            display: flex;
            flex-direction: column;
          }

          .course-thumbnail {
            height: 200px;
            overflow: hidden;
          }

          .course-thumbnail img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s ease;
          }

          .course-card:hover .course-thumbnail img {
            transform: scale(1.05);
          }

          .course-content {
            padding: 1.25rem;
            flex: 1;
            display: flex;
            flex-direction: column;
          }

          .course-price {
            background-color: ${ED_TEAL};
            color: white;
            padding: 4px 12px;
            border-radius: 15px;
            font-size: 12px;
            font-weight: 600;
            display: inline-block;
            margin-bottom: 12px;
            align-self: flex-start;
          }

          .course-title {
            font-size: 18px;
            font-weight: 700;
            color: ${TEXT_DARK};
            margin-bottom: 12px;
            line-height: 1.3;
          }

          .course-title a {
            color: inherit;
            text-decoration: none;
          }

          .course-title a:hover {
            color: ${ED_TEAL};
          }

          .course-meta {
            display: flex;
            gap: 15px;
            margin-bottom: 15px;
            font-size: 14px;
            color: #666;
          }

          .meta-item {
            display: flex;
            align-items: center;
            gap: 5px;
          }

          .meta-item i {
            color: ${ED_TEAL};
          }

          .course-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: auto;
            margin-bottom: 15px;
          }

          .instructor-info {
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .instructor-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            overflow: hidden;
          }

          .instructor-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .instructor-name {
            font-size: 14px;
            font-weight: 600;
            color: ${TEXT_DARK};
          }

          .course-rating {
            display: flex;
            align-items: center;
            gap: 5px;
            color: #FFD700;
            font-size: 14px;
          }

          .course-rating span {
            color: #666;
          }

          .view-details-btn {
            display: block;
            text-align: center;
            padding: 8px 16px;
            border: 1px solid #E0E5EB;
            border-radius: 100px;
            color: ${TEXT_DARK};
            font-weight: 600;
            text-decoration: none;
            transition: all 0.3s ease;
          }

          .view-details-btn:hover {
            border-color: ${ED_TEAL};
            background-color: ${ED_TEAL_LIGHT};
            color: ${ED_TEAL};
            
          }

          .empty-state {
            text-align: center;
            padding: 3rem;
            color: #666;
            font-size: 1rem;
          }

          .pagination-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 2rem;
            padding-top: 1.5rem;
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
            transition: all 0.2s;
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
            .all-courses-container {
              width: calc(100% - 200px);
              margin-left: 200px;
              padding: 5.5rem 1.5rem 1.5rem;
            }
            .course-thumbnail { height: 180px; }
          }

          @media (max-width: 768px) {
            .all-courses-container {
              width: 100%;
              margin-left: 0;
              padding: 5rem 1rem 1rem;
            }

            .controls-container {
              flex-direction: column;
              align-items: flex-start;
            }

            .search-control input { width: 100%; }

            .pagination-container {
              flex-direction: column;
              gap: 1rem;
              align-items: flex-start;
            }

            .courses-grid { grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); }
            .course-thumbnail { height: 160px; }
          }

          @media (max-width: 480px) {
            .courses-grid { grid-template-columns: 1fr; }
            .course-thumbnail { height: 140px; }
          }
        `}</style>
      </div>
    </DashboardLayout>
  );
}