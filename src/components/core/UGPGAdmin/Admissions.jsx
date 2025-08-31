import React from "react";
import { Outlet } from "react-router-dom";

export default function UGPGAdmissions() {
  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Admissions</h2>
      <Outlet />
    </div>
  );
}
