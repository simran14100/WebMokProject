import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { apiConnector } from '../../../../services/apiConnector';
import DashboardLayout from '../../../common/DashboardLayout';

const ED_TEAL = '#07A698';
const TEXT_DARK = '#2d3748';

const AllSubCategory = () => {
  const [loading, setLoading] = useState(false);
  const [subCategories, setSubCategories] = useState([]);

  useEffect(() => {
    const fetchSubCategories = async () => {
      setLoading(true);
      try {
        const response = await apiConnector('GET', 'http://localhost:4000/api/v1/subCategory/showAllSubCategories');
        setSubCategories(response.data.data || []);
      } catch (error) {
        toast.error('Failed to fetch sub-categories');
        console.error('Fetch sub-categories error:', error);
      }
      setLoading(false);
    };
    fetchSubCategories();
  }, []);

  return (
    <DashboardLayout>
      <div className="all-sub-category-container">
        <div className="header">
          <h2>All Sub-Categories</h2>
        </div>

        <div className="table-card">
          <h3>Sub-Category List</h3>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Parent Category</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="3" style={{ textAlign: 'center' }}>Loading...</td></tr>
                ) : subCategories.length > 0 ? (
                  subCategories.map((sub) => (
                    <tr key={sub._id}>
                      <td>{sub.name}</td>
                      <td>{sub.description}</td>
                      <td>{sub.parentCategory?.name || 'N/A'}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="3" style={{ textAlign: 'center' }}>No sub-categories found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <style jsx>{`
          .all-sub-category-container { width: calc(100% - 250px); margin-left: 250px; padding: 2rem; background-color: #f8fafc; }
          .header h2 { font-size: 1.5rem; font-weight: 600; color: ${TEXT_DARK}; margin-bottom: 2rem; }
          .table-card { background: white; border-radius: 0.5rem; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
          h3 { font-size: 1.25rem; font-weight: 600; color: ${TEXT_DARK}; margin-bottom: 1.5rem; }
          table { width: 100%; border-collapse: collapse; }
          th, td { padding: 0.75rem 1rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
          th { background-color: ${ED_TEAL}; color: white; }
        `}</style>
      </div>
    </DashboardLayout>
  );
};

export default AllSubCategory;
