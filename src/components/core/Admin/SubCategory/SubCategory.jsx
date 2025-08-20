import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { apiConnector } from '../../../../services/apiConnector';
import { categories } from '../../../../services/apis';
import DashboardLayout from '../../../common/DashboardLayout';

const ED_TEAL = '#07A698';
const TEXT_DARK = '#2d3748';

const SubCategory = () => {
  const [loading, setLoading] = useState(false);
  const [parentCategories, setParentCategories] = useState([]);
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  useEffect(() => {
    const fetchParentCategories = async () => {
      setLoading(true);
      try {
        const response = await apiConnector('GET', categories.CATEGORIES_API);
        setParentCategories(response.data.data || []);
      } catch (error) {
        toast.error('Failed to fetch parent categories');
        console.error('Fetch parent categories error:', error);
      }
      setLoading(false);
    };
    fetchParentCategories();
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await apiConnector('POST', 'http://localhost:4000/api/v1/subCategory/createSubCategory', data);
      if (response.data.success) {
        toast.success('Sub-category created successfully');
        reset();       
      } else {
        toast.error(response.data.message || 'Failed to create sub-category');
      }
    } catch (error) {
      toast.error('An error occurred');
      console.error('Sub-category creation error:', error);
    }
    setLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="sub-category-container">
        
 <div className="category-header">
          <h2>Create Sub Category</h2>
          <div className="breadcrumb">
            <span>Category</span>
            <span className="divider">/</span>
            <span className="active">Create Sub Category</span>
          </div>
        </div>
        <div className="form-card">
          {/* <h3>Add New Sub-Category</h3> */}
          <form onSubmit={handleSubmit(onSubmit)} className="sub-category-form">
            <div className="form-field">
              <label>Parent Category</label>
              <select {...register('parentCategory', { required: true })}>
                <option value="">Select Parent Category</option>
                {parentCategories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
              {errors.parentCategory && <span className="error-message">Parent category is required</span>}
            </div>

            <div className="form-field">
              <label>Sub-Category Name</label>
              <input type="text" placeholder="Enter sub-category name" {...register('name', { required: true })} />
              {errors.name && <span className="error-message">Name is required</span>}
            </div>

            <div className="form-field">
              <label>Description</label>
              <textarea placeholder="Enter description" {...register('description', { required: true })} />
              {errors.description && <span className="error-message">Description is required</span>}
            </div>

            <button type="submit" disabled={loading} className="submit-button">
              {loading ? 'Creating...' : 'Create Sub-Category'}
            </button>
          </form>
        </div>

        <style jsx>{`
        .category-header {
            margin-bottom: 2rem;
            margin-top: 3rem;
          }

          .category-header h2 {
            font-size: 1.5rem;
            font-weight: 600;
            color: ${TEXT_DARK};
            margin-bottom: 0.5rem;
          }
          .sub-category-container {
            width: calc(100% - 250px);
            margin-left: 250px;
            padding: 2rem;
            background-color: #f8fafc;
            min-height: 100vh;
          }
          .header h2 { font-size: 1.5rem; font-weight: 600; color: ${TEXT_DARK}; margin-bottom: 2rem; }
          .form-card { background: white; border-radius: 0.5rem; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
          h3 { font-size: 1.25rem; font-weight: 600; color: ${TEXT_DARK}; margin-bottom: 1.5rem; }
          .form-field { margin-bottom: 1rem; }
          label { display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem; color: ${TEXT_DARK}; }
          input, select, textarea { width: 100%; padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 0.375rem; font-size: 0.875rem; }
          .error-message { color: #e53e3e; font-size: 0.75rem; margin-top: 0.25rem; }
          .submit-button { background-color: ${ED_TEAL}; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 0.375rem; cursor: pointer; font-weight: 500; }
          .submit-button:disabled { opacity: 0.5; cursor: not-allowed; }

          @media (max-width: 1024px) {
            .sub-category-container {
              width: calc(100% - 200px);
              margin-left: 200px;
              padding: 1.5rem;
            }
          }

          @media (max-width: 768px) {
            .sub-category-container {
              width: 100%;
              margin-left: 0;
              padding: 1rem;
            }

            .form-card { padding: 1rem; }
          }
        `}</style>
      </div>
    </DashboardLayout>
  );
};

export default SubCategory;
