import React from "react";

const TAWKTO_GREEN = "#00CE7D";
const TAWKTO_GREEN_DARK = "#00b86b";
const BORDER = "#e0e0e0";
const TEXT_DARK = "#222";

export default function ConfirmationModal({ modalData }) {
  if (!modalData) return null;
  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      background: "rgba(0,0,0,0.25)",
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <div style={{
        background: "#fff",
        borderRadius: 14,
        boxShadow: "0 2px 16px rgba(0,0,0,0.10)",
        padding: 36,
        minWidth: 340,
        border: `1px solid ${BORDER}`,
        textAlign: "center"
      }}>
        <div style={{ fontWeight: 700, fontSize: 22, color: TEXT_DARK, marginBottom: 12 }}>{modalData.text1}</div>
        {modalData.text2 && <div style={{ color: "#666", fontSize: 16, marginBottom: 28 }}>{modalData.text2}</div>}
        <div style={{ display: "flex", gap: 18, justifyContent: "center" }}>
          <button
            onClick={modalData.btn1Handler}
            className="bg-green-600 hover:bg-green-700 text-white rounded-md px-7 py-2 font-bold text-base transition-colors"
            style={{ minWidth: 100 }}
          >
            {modalData.btn1Text || "Confirm"}
          </button>
          <button
            onClick={modalData.btn2Handler}
            style={{
              background: "#f9fefb",
              color: TEXT_DARK,
              border: `1px solid ${BORDER}`,
              borderRadius: 8,
              padding: "10px 28px",
              fontWeight: 700,
              fontSize: 16,
              cursor: "pointer"
            }}
          >
            {modalData.btn2Text || "Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
} 