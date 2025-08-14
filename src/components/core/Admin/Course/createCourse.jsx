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
    
        {/* <div className="mx-auto w-11/12 max-w-[1000px] py-10">
            <RenderSteps />
        </div> */}
         <div style={{
      width: "100%",
      maxWidth: "100vw",  // optional max width for large screens
      margin: "0 auto",    // center the content
      padding: "15px",
      marginLeft:"60px",
      boxSizing: "border-box",
      overflowX: "hidden"  // prevent horizontal scroll
    }}>
      <RenderSteps />
    </div>
  
   </DashboardLayout>
  )
}