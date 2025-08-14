


// import React, { useState } from 'react';
// import DashboardLayout from "../../../common/DashboardLayout";
// import { apiConnector } from "../../../../services/apiConnector";
// import { course } from "../../../../services/apis";
// import { toast } from "react-hot-toast";

// const ED_TEAL = "#07A698";
// const ED_TEAL_DARK = "#059a8c";
// const TEXT_DARK = "#2d3748";
// const TEXT_LIGHT = "#718096";

// export default function CreateCategory() {
//   const [categoryName, setCategoryName] = useState("");
//   const [categoryDescription, setCategoryDescription] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleCreate = async () => {
//     if (!categoryName.trim() || !categoryDescription.trim()) {
//       toast.error("All fields are required");
//       return;
//     }

//     try {
//       setLoading(true);
//       const response = await apiConnector(
//         "POST",
//         course.CREATE_CATEGORY_API,
//         {
//           name: categoryName.trim(),
//           description: categoryDescription.trim()
//         }
//       );
      
//       if (!response.data.success) {
//         throw new Error(response.data.message);
//       }

//       toast.success("Category created successfully!");
//       setCategoryName("");
//       setCategoryDescription("");
//     } catch (error) {
//       console.error("Error creating category:", error);
//       toast.error(error.message || "Failed to create category");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <DashboardLayout>
//       <div className="create-category-container">
//         {/* Header with Breadcrumb */}
//         <div className="category-header">
//           <h2>Create Category</h2>
//           <div className="breadcrumb">
//             <span>Category</span>
//             <span className="divider">/</span>
//             <span className="active">Create Category</span>
//           </div>
//         </div>

//         {/* Form Section */}
//         <div className="category-form-section">
//           <div className="form-card">
//             <h3>Category Details</h3>
            
//             <div className="form-group">
//               <label>Category Name</label>
//               <input
//                 type="text"
//                 placeholder="e.g. Web Development"
//                 value={categoryName}
//                 onChange={(e) => setCategoryName(e.target.value)}
//                 className="form-input"
//               />
//             </div>

//             <div className="form-group">
//               <label>Description</label>
//               <textarea
//                 placeholder="Describe the category..."
//                 value={categoryDescription}
//                 onChange={(e) => setCategoryDescription(e.target.value)}
//                 className="form-input"
//                 rows={4}
//               />
//             </div>

//             <button
//               onClick={handleCreate}
//               disabled={loading}
//               className="submit-button"
//             >
//               {loading ? (
//                 <>
//                   <span className="spinner"></span>
//                   Creating...
//                 </>
//               ) : (
//                 "Create Category"
//               )}
//             </button>
//           </div>
//         </div>

//         <style jsx>{`
//           .create-category-container {
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

//           .category-form-section {
//             max-width: 800px;
//             margin: 0 auto;
//           }

//           .form-card {
//             background: white;
//             border-radius: 0.5rem;
//             padding: 2rem;
//             box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
//           }

//           .form-card h3 {
//             font-size: 1.25rem;
//             font-weight: 600;
//             margin-bottom: 1.5rem;
//             color: ${TEXT_DARK};
//           }

//           .form-group {
//             margin-bottom: 1.5rem;
//             font-size: 1rem;
//           }

//           .form-group label {
//             display: block;
//             font-size: 0.875rem;
//             font-weight: 500;
//             margin-bottom: 0.5rem;
//             color: ${TEXT_DARK};
//           }

//           .form-input {
//             width: 100%;
//             padding: 0.75rem;
//             border: 1px solid #e2e8f0;
//             border-radius: 0.375rem;
//             font-size: 0.875rem;
//             transition: border-color 0.2s;
//           }

//           .form-input:focus {
//             outline: none;
//             border-color: ${ED_TEAL};
//             box-shadow: 0 0 0 3px rgba(7, 166, 152, 0.1);
//           }

//           textarea.form-input {
//             min-height: 120px;
//             resize: vertical;
//           }

//           .submit-button {
//             display: flex;
//             align-items: center;
//             justify-content: center;
//             gap: 0.5rem;
//             background-color: ${ED_TEAL};
//             color: white;
//             border: none;
//             padding: 0.75rem 1.5rem;
//             border-radius: 0.375rem;
//             font-size: 0.875rem;
//             font-weight: 500;
//             cursor: pointer;
//             transition: background-color 0.2s;
//             width: 100%;
//             max-width: 200px;
//             margin-top: 1rem;
//           }

//           .submit-button:hover:not(:disabled) {
//             background-color: ${ED_TEAL_DARK};
//           }

//           .submit-button:disabled {
//             opacity: 0.7;
//             cursor: not-allowed;
//           }

//           .spinner {
//             display: inline-block;
//             width: 1rem;
//             height: 1rem;
//             border: 2px solid rgba(255, 255, 255, 0.3);
//             border-radius: 50%;
//             border-top-color: white;
//             animation: spin 1s ease-in-out infinite;
//           }

//           @keyframes spin {
//             to { transform: rotate(360deg); }
//           }

//           @media (max-width: 1024px) {
//             .create-category-container {
//               width: calc(100% - 200px);
//               margin-left: 200px;
//               padding: 1.5rem;
//             }
//           }

//           @media (max-width: 768px) {
//             .create-category-container {
//               width: 100%;
//               margin-left: 0;
//               padding: 1rem;
//             }

//             .category-form-section {
//               padding: 0 1rem;
//             }

//             .form-card {
//               padding: 1.5rem;
//             }
//           }

//           @media (max-width: 480px) {
//             .submit-button {
//               max-width: 100%;
//             }
//           }
//         `}</style>
//       </div>
//     </DashboardLayout>
//   );
// }


import React, { useState } from 'react';
import DashboardLayout from "../../../common/DashboardLayout";
import { apiConnector } from "../../../../services/apiConnector";
import { course } from "../../../../services/apis";
import { toast } from "react-hot-toast";

const ED_TEAL = "#07A698";
const ED_TEAL_DARK = "#059a8c";
const TEXT_DARK = "#2d3748";
const TEXT_LIGHT = "#718096";

export default function CreateCategory() {
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!categoryName.trim() || !categoryDescription.trim()) {
      toast.error("All fields are required");
      return;
    }

    try {
      setLoading(true);

      // Get token from localStorage
       const token = localStorage.getItem("token");

      const response = await apiConnector(
        "POST",
        course.CREATE_CATEGORY_API,
        { name: categoryName.trim(), description: categoryDescription.trim() },
        { Authorization: `Bearer ${token}` } // send JWT token
      );

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      toast.success("Category created successfully!");
      setCategoryName("");
      setCategoryDescription("");

    } catch (error) {
      console.error("Error creating category:", error);
      toast.error(error.message || "Failed to create category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="create-category-container">
        {/* Header with Breadcrumb */}
        <div className="category-header">
          <h2>Create Category</h2>
          <div className="breadcrumb">
            <span>Category</span>
            <span className="divider">/</span>
            <span className="active">Create Category</span>
          </div>
        </div>

        {/* Form Section */}
        <div className="category-form-section">
          <div className="form-card">
            <h3>Category Details</h3>
            
            <div className="form-group">
              <label>Category Name</label>
              <input
                type="text"
                placeholder="e.g. Web Development"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                placeholder="Describe the category..."
                value={categoryDescription}
                onChange={(e) => setCategoryDescription(e.target.value)}
                className="form-input"
                rows={4}
              />
            </div>

            <button
              onClick={handleCreate}
              disabled={loading}
              className="submit-button"
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Creating...
                </>
              ) : (
                "Create Category"
              )}
            </button>
          </div>
        </div>

        <style jsx>{`
          .create-category-container {
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

          .category-form-section {
            max-width: 800px;
            margin: 0 auto;
          }

          .form-card {
            background: white;
            border-radius: 0.5rem;
            padding: 2rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }

          .form-card h3 {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 1.5rem;
            color: ${TEXT_DARK};
          }

          .form-group {
            margin-bottom: 1.5rem;
            font-size: 1rem;
          }

          .form-group label {
            display: block;
            font-size: 0.875rem;
            font-weight: 500;
            margin-bottom: 0.5rem;
            color: ${TEXT_DARK};
          }

          .form-input {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #e2e8f0;
            border-radius: 0.375rem;
            font-size: 0.875rem;
            transition: border-color 0.2s;
          }

          .form-input:focus {
            outline: none;
            border-color: ${ED_TEAL};
            box-shadow: 0 0 0 3px rgba(7, 166, 152, 0.1);
          }

          textarea.form-input {
            min-height: 120px;
            resize: vertical;
          }

          .submit-button {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            background-color: ${ED_TEAL};
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 0.375rem;
            font-size: 0.875rem;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.2s;
            width: 100%;
            max-width: 200px;
            margin-top: 1rem;
          }

          .submit-button:hover:not(:disabled) {
            background-color: ${ED_TEAL_DARK};
          }

          .submit-button:disabled {
            opacity: 0.7;
            cursor: not-allowed;
          }

          .spinner {
            display: inline-block;
            width: 1rem;
            height: 1rem;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            border-top-color: white;
            animation: spin 1s ease-in-out infinite;
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }

          @media (max-width: 1024px) {
            .create-category-container {
              width: calc(100% - 200px);
              margin-left: 200px;
              padding: 1.5rem;
            }
          }

          @media (max-width: 768px) {
            .create-category-container {
              width: 100%;
              margin-left: 0;
              padding: 1rem;
            }

            .category-form-section {
              padding: 0 1rem;
            }

            .form-card {
              padding: 1.5rem;
            }
          }

          @media (max-width: 480px) {
            .submit-button {
              max-width: 100%;
            }
          }
        `}</style>
      </div>
    </DashboardLayout>
  );
}
