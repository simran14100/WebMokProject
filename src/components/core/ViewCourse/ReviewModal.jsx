// import React, { useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { createRating } from "../../../services/operations/courseDetailsAPI";
// import IconBtn from "../../common/IconBtn";

// const Star = ({ filled, onClick }) => (
//   <button
//     type="button"
//     onClick={onClick}
//     className={`text-2xl ${filled ? "text-yellow-400" : "text-gray-300"}`}
//     aria-label={filled ? "filled star" : "empty star"}
//   >
//     ★
//   </button>
// );

// const ReviewModal = ({ isOpen, onClose, courseId, onSubmitted }) => {
//   const dispatch = useDispatch();
//   const { token } = useSelector((state) => state.auth);
//   const [rating, setRating] = useState(0);
//   const [review, setReview] = useState("");
//   const [submitting, setSubmitting] = useState(false);

//   if (!isOpen) return null;

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!rating || rating < 1) return;
//     setSubmitting(true);
//     const ok = await createRating({ courseId, rating, review }, token);
//     setSubmitting(false);
//     if (ok) {
//       onClose?.();
//       onSubmitted?.();
//       setRating(0);
//       setReview("");
//     }
//   };

//   return (
//     <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
//       <div className="w-full max-w-lg rounded-lg bg-white shadow-2xl">
//         <div className="flex items-center justify-between border-b px-5 py-4">
//           <h3 className="text-lg font-semibold text-gray-900">Add Review</h3>
//           <button
//             onClick={onClose}
//             className="rounded-md p-1 text-gray-500 hover:bg-gray-100"
//             aria-label="Close"
//           >
//             ✕
//           </button>
//         </div>
//         <form onSubmit={handleSubmit} className="space-y-5 px-5 py-6">
//           <div>
//             <label className="mb-2 block text-sm font-medium text-gray-700">
//               Your rating
//             </label>
//             <div className="flex items-center gap-1">
//               {[1, 2, 3, 4, 5].map((i) => (
//                 <Star key={i} filled={i <= rating} onClick={() => setRating(i)} />
//               ))}
//               <span className="ml-2 text-sm text-gray-600">{rating || 0}/5</span>
//             </div>
//           </div>

//           <div>
//             <label className="mb-2 block text-sm font-medium text-gray-700">
//               Write a review (optional)
//             </label>
//             <textarea
//               value={review}
//               onChange={(e) => setReview(e.target.value)}
//               placeholder="Share your thoughts about this course"
//               className="h-28 w-full resize-none rounded-md border border-gray-300 p-3 text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
//             />
//           </div>

//           <div className="flex items-center justify-end gap-3 pt-2">
//             <button
//               type="button"
//               onClick={onClose}
//               className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
//             >
//               Cancel
//             </button>
//             <IconBtn
//               type="submit"
//               disabled={submitting || rating < 1}
//               text={submitting ? "Submitting..." : "Submit Review"}
//               customClasses="px-4"
//             />
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default ReviewModal;
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createRating } from "../../../services/operations/courseDetailsAPI";
import IconBtn from "../../common/IconBtn";

// Professional color constants
const ED_TEAL = '#07A698';
const ED_TEAL_DARK = '#059a8c';
const ED_TEAL_LIGHT = '#e8f6f5';
const BORDER = '#e0e0e0';
const TEXT_DARK = '#191A1F';
const TEXT_LIGHT = '#6b7280';
const BG_LIGHT = '#f8fafc';
const WHITE = '#ffffff';
const SHADOW_LG = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
const SHADOW_XL = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
const YELLOW = '#fbbf24';
const YELLOW_LIGHT = '#fef3c7';

const Star = ({ filled, onClick, hovered }) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      background: 'none',
      border: 'none',
      fontSize: '1.75rem',
      color: filled || hovered ? YELLOW : BORDER,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      transform: filled || hovered ? 'scale(1.1)' : 'scale(1)',
      filter: filled || hovered ? 'drop-shadow(0 2px 4px rgba(251, 191, 36, 0.3))' : 'none',
      padding: '4px'
    }}
    onMouseOver={(e) => {
      if (!filled) {
        e.target.style.transform = 'scale(1.1)';
        e.target.style.filter = 'drop-shadow(0 2px 4px rgba(251, 191, 36, 0.3))';
      }
    }}
    onMouseOut={(e) => {
      if (!filled) {
        e.target.style.transform = 'scale(1)';
        e.target.style.filter = 'none';
      }
    }}
    aria-label={filled ? "filled star" : "empty star"}
  >
    ★
  </button>
);

const ReviewModal = ({ isOpen, onClose, courseId, onSubmitted }) => {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating || rating < 1) return;
    setSubmitting(true);
    const ok = await createRating({ courseId, rating, review }, token);
    setSubmitting(false);
    if (ok) {
      onClose?.();
      onSubmitted?.();
      setRating(0);
      setReview("");
    }
  };

  const getRatingText = (stars) => {
    const texts = {
      1: "Poor",
      2: "Fair", 
      3: "Good",
      4: "Very Good",
      5: "Excellent"
    };
    return texts[stars] || "";
  };

  return (
    <>
      {/* Enhanced Backdrop */}
      <div 
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
        
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(8px)',
          padding: '16px',
          animation: 'fadeIn 0.3s ease-out'
        }}
        onClick={onClose}
      >
        {/* Enhanced Modal */}
        <div 
          style={{
            width: '100%',
            maxWidth: '500px',
            borderRadius: '20px',
            backgroundColor: WHITE,
            boxShadow: SHADOW_XL,
            overflow: 'hidden',
            animation: 'slideUp 0.3s ease-out'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Enhanced Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: `linear-gradient(135deg, ${ED_TEAL} 0%, ${ED_TEAL_DARK} 100%)`,
            color: WHITE,
            padding: '24px 32px',
            position: 'relative'
          }}>
            <div>
              <h3 style={{
                margin: 0,
                fontSize: '1.375rem',
                fontWeight: 700,
                letterSpacing: '-0.025em'
              }}>
                Rate This Course
              </h3>
              <p style={{
                margin: '4px 0 0 0',
                fontSize: '0.875rem',
                opacity: 0.9,
                fontWeight: 500
              }}>
                Share your experience with other learners
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: WHITE,
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '8px',
                fontSize: '1.25rem',
                fontWeight: 700,
                transition: 'all 0.2s ease',
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                e.target.style.transform = 'scale(1.1)';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                e.target.style.transform = 'scale(1)';
              }}
              aria-label="Close"
            >
              ✕
            </button>

            {/* Decorative Elements */}
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              pointerEvents: 'none'
            }} />
            <div style={{
              position: 'absolute',
              bottom: '-10px',
              left: '-10px',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              pointerEvents: 'none'
            }} />
          </div>

          {/* Enhanced Form */}
          <form onSubmit={handleSubmit} style={{ padding: '32px' }}>
            {/* Rating Section */}
            <div style={{ marginBottom: '32px', textAlign: 'center' }}>
              <label style={{
                display: 'block',
                marginBottom: '16px',
                fontSize: '1rem',
                fontWeight: 600,
                color: TEXT_DARK,
                letterSpacing: '-0.025em'
              }}>
                How would you rate this course?
              </label>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginBottom: '12px'
              }}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star 
                    key={i} 
                    filled={i <= rating} 
                    hovered={i <= hoveredStar}
                    onClick={() => setRating(i)}
                  />
                ))}
              </div>

              {/* Rating Text & Counter */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                marginBottom: '8px'
              }}>
                <span style={{
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  color: rating ? ED_TEAL : TEXT_LIGHT
                }}>
                  {rating}/5
                </span>
                {rating > 0 && (
                  <span style={{
                    fontSize: '1rem',
                    fontWeight: 500,
                    color: ED_TEAL,
                    backgroundColor: ED_TEAL_LIGHT,
                    padding: '4px 12px',
                    borderRadius: '20px'
                  }}>
                    {getRatingText(rating)}
                  </span>
                )}
              </div>
            </div>

            {/* Review Section */}
            <div style={{ marginBottom: '32px' }}>
              <label style={{
                display: 'block',
                marginBottom: '12px',
                fontSize: '1rem',
                fontWeight: 600,
                color: TEXT_DARK,
                letterSpacing: '-0.025em'
              }}>
                Write a review <span style={{ color: TEXT_LIGHT, fontWeight: 400 }}>(optional)</span>
              </label>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="What did you like about this course? What could be improved?"
                style={{
                  width: '100%',
                  height: '120px',
                  padding: '16px',
                  border: `2px solid ${BORDER}`,
                  borderRadius: '12px',
                  fontSize: '0.9375rem',
                  color: TEXT_DARK,
                  backgroundColor: WHITE,
                  resize: 'none',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  lineHeight: '1.5',
                  transition: 'all 0.2s ease',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = ED_TEAL;
                  e.target.style.backgroundColor = ED_TEAL_LIGHT;
                  e.target.style.boxShadow = `0 0 0 3px rgba(7, 166, 152, 0.1)`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = BORDER;
                  e.target.style.backgroundColor = WHITE;
                  e.target.style.boxShadow = 'none';
                }}
              />
              <div style={{
                marginTop: '8px',
                fontSize: '0.8125rem',
                color: TEXT_LIGHT,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span>Help others by sharing your honest feedback</span>
                <span>{review.length}/500</span>
              </div>
            </div>

            {/* Enhanced Action Buttons */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              paddingTop: '8px'
            }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  border: `2px solid ${BORDER}`,
                  borderRadius: '12px',
                  backgroundColor: WHITE,
                  color: TEXT_DARK,
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = BG_LIGHT;
                  e.target.style.borderColor = TEXT_LIGHT;
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = WHITE;
                  e.target.style.borderColor = BORDER;
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={submitting || rating < 1}
                style={{
                  flex: 2,
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '12px',
                  background: submitting || rating < 1 
                    ? TEXT_LIGHT 
                    : `linear-gradient(135deg, ${ED_TEAL} 0%, ${ED_TEAL_DARK} 100%)`,
                  color: WHITE,
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  cursor: submitting || rating < 1 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: submitting || rating < 1 ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseOver={(e) => {
                  if (!submitting && rating >= 1) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 16px rgba(7, 166, 152, 0.3)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!submitting && rating >= 1) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              >
                {submitting && (
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                )}
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Enhanced Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        /* Enhanced focus styles */
        button:focus {
          outline: 2px solid ${ED_TEAL} !important;
          outline-offset: 2px !important;
        }

        textarea:focus {
          outline: none !important;
        }

        /* Smooth font rendering */
        * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
      `}</style>
    </>
  );
};

export default ReviewModal;