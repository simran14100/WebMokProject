// import React from "react";
// import { useSelector } from "react-redux";
// import RenderSteps from "../../AddCourse/RenderSteps";
// import Dashboard from "../../../../pages/Dashboard";
// import DashboardLayout from "../../../common/DashboardLayout";

// export default function CreateCourse() {
//   const { user, loading } = useSelector((state) => state.profile);
//   console.log("Current user:", user);

//   if (loading || user === undefined) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <h1 className="text-2xl font-bold text-yellow-500">Loading...</h1>
//       </div>
//     );
//   }

//   if (user?.accountType !== "Instructor" && user?.accountType !== "Admin") {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <h1 className="text-2xl font-bold text-red-500">Access Denied: Only instructors and admins can add courses.</h1>
//       </div>
//     );
//   }

//   return (
//    <DashboardLayout>
//       <div style={{
//       width: "100%",
//       maxWidth: "100vw",  // optional max width for large screens
//       margin: "0 auto",    // center the content
//       padding: "15px",
//       marginLeft:"60px",
//       boxSizing: "border-box",
//       overflowX: "hidden"  // prevent horizontal scroll
//     }}>
//       <RenderSteps />
//     </div>
//    </DashboardLayout>
     
  
//   );
// } 


import RenderSteps from "../../AddCourse/RenderSteps"
import DashboardLayout from "../../../common/DashboardLayout";
import { useSelector } from "react-redux";

export default function AddCourse() {


 const { user, loading } = useSelector((state) => state.profile);
  console.log("Current user:", user);

  if (loading || user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl font-bold text-yellow-500">Loading...</h1>
      </div>
    );
  }

  if (user?.accountType !== "Instructor" && user?.accountType !== "Admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl font-bold text-red-500">Access Denied: Only instructors and admins can add courses.</h1>
      </div>
    );
  }

  return (
     <DashboardLayout>
        {/* Wrapper uses responsive layout respecting sidebar + fixed navbar */}
        <div className="create-course-container">
          <RenderSteps />
        </div>

        <style jsx>{`
          .create-course-container {
            width: calc(100% - 250px);
            margin-left: 250px;
            padding: 6rem 1.5rem 1.5rem; /* top padding avoids fixed navbar overlap */
            max-width: 100vw;
            box-sizing: border-box;
            overflow-x: hidden;
            background: #f8fafc;
            min-height: 100vh;
          }

          @media (max-width: 1024px) {
            .create-course-container {
              width: calc(100% - 200px);
              margin-left: 200px;
              padding: 5.5rem 1.25rem 1.25rem;
            }
          }

          @media (max-width: 768px) {
            .create-course-container {
              width: 100%;
              margin-left: 0;
              padding: 5rem 1rem 1rem;
            }
          }
        `}</style>
  
     </DashboardLayout>
  )
}