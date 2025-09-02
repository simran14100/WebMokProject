 import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ACCOUNT_TYPE } from '../utils/constants';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.profile);

  useEffect(() => {
    // Redirect SuperAdmin to /dashboard/my-profile
    if (user?.accountType === ACCOUNT_TYPE.SUPER_ADMIN && window.location.pathname === '/dashboard') {
      navigate('/dashboard/my-profile', { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="bg-white">
      <div className="flex-1" style={{ paddingTop: 120 }}>
        <Outlet />
      </div>
    </div>
  );
};

export default Dashboard;