import React, { useState } from "react";

// EdCare Design System Colors
const ED_TEAL = "#07A698";
const ED_TEAL_DARK = "#059a8c";
const ED_TEAL_LIGHT = "#e6f7f5";
const BORDER = "#e0e0e0";
const TEXT_DARK = "#191A1F";
const TEXT_GRAY = "#666";
const BG = "#f8f9fa";

export default function ConfirmationModal({ modalData }) {
  const [hoveredButton, setHoveredButton] = useState(null);

  if (!modalData) return null;
  
  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      background: "rgba(0, 0, 0, 0.5)",
      backdropFilter: "blur(4px)",
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px"
    }}>
      <div style={{
        background: "#fff",
        borderRadius: "16px",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        padding: "40px",
        minWidth: "400px",
        maxWidth: "500px",
        border: `1px solid ${BORDER}`,
        textAlign: "center",
        animation: "modalSlideIn 0.3s ease-out"
      }}>
        {/* Warning Icon */}
        <div style={{
          width: "64px",
          height: "64px",
          background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 24px",
          border: "3px solid #fbbf24"
        }}>
          <svg style={{ width: "32px", height: "32px", color: "#d97706" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>

        {/* Title */}
        <h2 style={{ 
          fontWeight: 700, 
          fontSize: "24px", 
          color: TEXT_DARK, 
          marginBottom: "12px",
          fontFamily: "Poppins, sans-serif"
        }}>
          {modalData.text1}
        </h2>

        {/* Description */}
        {modalData.text2 && (
          <p style={{ 
            color: TEXT_GRAY, 
            fontSize: "16px", 
            marginBottom: "32px",
            lineHeight: "1.5",
            fontFamily: "Poppins, sans-serif"
          }}>
            {modalData.text2}
          </p>
        )}

        {/* Buttons */}
        <div style={{ 
          display: "flex", 
          gap: "16px", 
          justifyContent: "center",
          flexWrap: "wrap"
        }}>
          {/* Primary Button (Logout) */}
          <button
            onClick={modalData.btn1Handler}
            onMouseEnter={() => setHoveredButton('primary')}
            onMouseLeave={() => setHoveredButton(null)}
            style={{
              background: hoveredButton === 'primary' 
                ? `linear-gradient(135deg, ${ED_TEAL_DARK} 0%, ${ED_TEAL} 100%)`
                : `linear-gradient(135deg, ${ED_TEAL} 0%, ${ED_TEAL_DARK} 100%)`,
              color: "white",
              border: "none",
              borderRadius: "12px",
              padding: "14px 32px",
              fontWeight: 600,
              fontSize: "16px",
              cursor: "pointer",
              minWidth: "120px",
              transition: "all 0.3s ease",
              transform: hoveredButton === 'primary' ? "translateY(-2px)" : "translateY(0)",
              boxShadow: hoveredButton === 'primary' 
                ? "0 10px 25px rgba(7, 166, 152, 0.3)"
                : "0 4px 12px rgba(7, 166, 152, 0.2)",
              fontFamily: "Poppins, sans-serif"
            }}
          >
            {modalData.btn1Text || "Confirm"}
          </button>

          {/* Secondary Button (Cancel) */}
          <button
            onClick={modalData.btn2Handler}
            onMouseEnter={() => setHoveredButton('secondary')}
            onMouseLeave={() => setHoveredButton(null)}
            style={{
              background: hoveredButton === 'secondary' ? ED_TEAL_LIGHT : "#fff",
              color: hoveredButton === 'secondary' ? ED_TEAL_DARK : TEXT_DARK,
              border: `2px solid ${hoveredButton === 'secondary' ? ED_TEAL : BORDER}`,
              borderRadius: "12px",
              padding: "14px 32px",
              fontWeight: 600,
              fontSize: "16px",
              cursor: "pointer",
              minWidth: "120px",
              transition: "all 0.3s ease",
              transform: hoveredButton === 'secondary' ? "translateY(-2px)" : "translateY(0)",
              boxShadow: hoveredButton === 'secondary' 
                ? "0 10px 25px rgba(7, 166, 152, 0.15)"
                : "0 4px 12px rgba(0, 0, 0, 0.1)",
              fontFamily: "Poppins, sans-serif"
            }}
          >
            {modalData.btn2Text || "Cancel"}
          </button>
        </div>
      </div>

      <style>
        {`
          @keyframes modalSlideIn {
            from {
              opacity: 0;
              transform: scale(0.9) translateY(-20px);
            }
            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
} 