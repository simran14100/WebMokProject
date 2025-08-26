import React from "react";

export default function UGPGDashboard() {
  return (
    <div style={{marginTop: '10rem'}}>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        {["Registered", "Enrolled", "Collection", "Cash", "Pending", "Visitors", "Enquiries", "Calls"].map((k) => (
          <div key={k} style={{ background: '#fff', border: '1px solid #eaeef3', borderRadius: 12, padding: 16, boxShadow: '0 4px 14px rgba(0,0,0,0.04)'}}>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 6 }}>{k}</div>
            <div style={{ fontSize: 24, fontWeight: 800 }}>2986</div>
          </div>
        ))}
      </div>
    </div>
  );
}
