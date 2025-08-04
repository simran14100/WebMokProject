import React from 'react';
import DashboardLayout from '../components/common/DashboardLayout';

const Cart = () => (
  <DashboardLayout>
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#191A1F', marginBottom: '2rem' }}>Your Cart</h1>
      {/* Add your cart content here */}
    </div>
  </DashboardLayout>
);

export default Cart; 