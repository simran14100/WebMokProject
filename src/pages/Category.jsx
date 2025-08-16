// import React, { useEffect, useState } from "react";
// import { Link, useParams } from "react-router-dom";
// import { apiConnector } from "../services/apiConnector";
// import { subCategory } from "../services/apis";

// function Category() {
//   const { categoryId } = useParams();
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [subs, setSubs] = useState([]);

//   useEffect(() => {
//     let isMounted = true;
//     async function fetchSubs() {
//       setLoading(true);
//       setError("");
//       try {
//         const res = await apiConnector(
//           "GET",
//           `${subCategory.GET_SUBCATEGORIES_BY_PARENT_API}/${categoryId}`
//         );
//         const data = res?.data?.data || res?.data || [];
//         if (isMounted) {
//           setSubs(Array.isArray(data) ? data : []);
//         }
//       } catch (e) {
//         console.error("Failed to load subcategories", e);
//         if (isMounted) setError("Could not load subcategories.");
//       } finally {
//         if (isMounted) setLoading(false);
//       }
//     }
//     if (categoryId) fetchSubs();
//     return () => {
//       isMounted = false;
//     };
//   }, [categoryId]);

//   if (loading) {
//     return (
//       <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center bg-white">
//         <div className="spinner"></div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="text-center text-red-500 py-10 bg-white">{error}</div>
//     );
//   }

//   return (
//     <section className="bg-white" style={{ marginTop: "8rem", padding: "40px 0" }}>
//       <div className="container">
//         <div className="row justify-center mb-6">
//           <div className="col-12 text-center">
//             <h2 className="section-title" style={{ textTransform: "uppercase" }}>
//               Select a Subcategory
//             </h2>
//           </div>
//         </div>

//         {subs.length === 0 ? (
//           <div className="text-center text-gray-600">No subcategories found.</div>
//         ) : (
//           <div className="row" style={{ rowGap: "16px" }}>
//             {subs.map((sc) => (
//               <div key={sc._id} className="col-md-4 col-sm-6">
//                 <Link
//                   to={`/catalog/${sc._id}`}
//                   className="service-item"
//                   style={{
//                     display: "block",
//                     textDecoration: "none",
//                   }}
//                 >
//                   <div className="service-content" style={{ padding: "20px" }}>
//                     <h5 className="service-title" style={{ marginBottom: 8 }}>{sc.name}</h5>
//                     {sc.description ? (
//                       <p className="service-text" style={{ margin: 0 }}>
//                         {sc.description}
//                       </p>
//                     ) : null}
//                   </div>
//                 </Link>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </section>
//   );
// }

// export default Category;

import React, { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { FiFolder, FiArrowRight, FiAlertCircle, FiLoader } from "react-icons/fi"
import { apiConnector } from "../services/apiConnector"
import { subCategory } from "../services/apis"

// Color constants
const ED_TEAL = '#07A698'
const ED_TEAL_DARK = '#059a8c'
const ED_TEAL_LIGHT = '#E6F7F5'
const ED_TEAL_LIGHTER = '#F0FDFC'
const WHITE = '#FFFFFF'
const GRAY_50 = '#F9FAFB'
const GRAY_100 = '#F3F4F6'
const GRAY_200 = '#E5E7EB'
const GRAY_300 = '#D1D5DB'
const GRAY_400 = '#9CA3AF'
const GRAY_500 = '#6B7280'
const GRAY_600 = '#4B5563'
const GRAY_700 = '#374151'
const GRAY_800 = '#1F2937'
const GRAY_900 = '#111827'
const RED_500 = '#EF4444'

function Category() {
  const { categoryId } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [subs, setSubs] = useState([])

  useEffect(() => {
    let isMounted = true
    async function fetchSubs() {
      setLoading(true)
      setError("")
      try {
        const res = await apiConnector(
          "GET",
          `${subCategory.GET_SUBCATEGORIES_BY_PARENT_API}/${categoryId}`
        )
        const data = res?.data?.data || res?.data || []
        if (isMounted) {
          setSubs(Array.isArray(data) ? data : [])
        }
      } catch (e) {
        console.error("Failed to load subcategories", e)
        if (isMounted) setError("Could not load subcategories.")
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    if (categoryId) fetchSubs()
    return () => {
      isMounted = false
    }
  }, [categoryId])

  const styles = {
    container: {
      backgroundColor: GRAY_50,
      minHeight: 'calc(100vh - 80px)',
      paddingTop: '120px',
      marginTop:"6rem",
      paddingBottom: '80px',
    },
    contentWrapper: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 20px',
    },
    header: {
      textAlign: 'center',
      marginBottom: '60px',
    },
    title: {
      fontSize: '48px',
      fontWeight: 700,
      color: GRAY_900,
      marginBottom: '16px',
      background: `linear-gradient(135deg, ${ED_TEAL} 0%, ${ED_TEAL_DARK} 100%)`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      textTransform: 'uppercase',
      letterSpacing: '2px',
    },
    subtitle: {
      fontSize: '18px',
      color: GRAY_600,
      maxWidth: '600px',
      margin: '0 auto',
      lineHeight: '1.6',
    },
    loadingContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '400px',
      gap: '20px',
    },
    spinner: {
      width: '40px',
      height: '40px',
      border: `4px solid ${ED_TEAL_LIGHT}`,
      borderTop: `4px solid ${ED_TEAL}`,
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    },
    loadingText: {
      fontSize: '18px',
      color: GRAY_600,
      fontWeight: 500,
    },
    errorContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '400px',
      gap: '16px',
      padding: '40px',
      backgroundColor: WHITE,
      borderRadius: '12px',
      border: `1px solid ${GRAY_200}`,
      maxWidth: '500px',
      margin: '0 auto',
    },
    errorIcon: {
      fontSize: '48px',
      color: RED_500,
    },
    errorText: {
      fontSize: '18px',
      color: RED_500,
      textAlign: 'center',
      fontWeight: 500,
    },
    emptyContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '400px',
      gap: '20px',
      padding: '40px',
      backgroundColor: WHITE,
      borderRadius: '12px',
      border: `1px solid ${GRAY_200}`,
      maxWidth: '500px',
      margin: '0 auto',
    },
    emptyIcon: {
      fontSize: '64px',
      color: GRAY_400,
    },
    emptyText: {
      fontSize: '20px',
      color: GRAY_600,
      textAlign: 'center',
      fontWeight: 500,
    },
    emptySubtext: {
      fontSize: '16px',
      color: GRAY_500,
      textAlign: 'center',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
      gap: '24px',
      marginTop: '40px',
    },
    card: {
      backgroundColor: WHITE,
      borderRadius: '16px',
      border: `1px solid ${GRAY_200}`,
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      transition: 'all 0.3s ease',
      overflow: 'hidden',
      textDecoration: 'none',
      color: 'inherit',
      display: 'block',
      height: '100%',
    },
    cardHover: {
      transform: 'translateY(-4px)',
      boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      borderColor: ED_TEAL_LIGHT,
    },
    cardContent: {
      padding: '32px 28px',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
    },
    cardIcon: {
      width: '56px',
      height: '56px',
      backgroundColor: ED_TEAL_LIGHTER,
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '20px',
      color: ED_TEAL,
      fontSize: '24px',
    },
    cardTitle: {
      fontSize: '20px',
      fontWeight: 600,
      color: GRAY_900,
      marginBottom: '12px',
      lineHeight: '1.3',
    },
    cardDescription: {
      fontSize: '16px',
      color: GRAY_600,
      lineHeight: '1.6',
      flex: 1,
      marginBottom: '20px',
    },
    cardFooter: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 'auto',
    },
    cardAction: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      color: ED_TEAL,
      fontSize: '14px',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    cardArrow: {
      fontSize: '16px',
      transition: 'transform 0.3s ease',
    },
    cardArrowHover: {
      transform: 'translateX(4px)',
    },
  }

  // Add keyframe animation for spinner
  const spinnerAnimation = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `

  if (loading) {
    return (
      <div style={styles.container}>
        <style>{spinnerAnimation}</style>
        <div style={styles.contentWrapper}>
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p style={styles.loadingText}>Loading subcategories...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.contentWrapper}>
          <div style={styles.errorContainer}>
            <FiAlertCircle style={styles.errorIcon} />
            <p style={styles.errorText}>{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.contentWrapper}>
        <div style={styles.header}>
          <h1 style={styles.title}>Select a Subcategory</h1>
          <p style={styles.subtitle}>
            Explore our comprehensive range of subcategories to find the perfect learning path for your goals.
          </p>
        </div>

        {subs.length === 0 ? (
          <div style={styles.emptyContainer}>
            <FiFolder style={styles.emptyIcon} />
            <p style={styles.emptyText}>No subcategories found</p>
            <p style={styles.emptySubtext}>
              This category doesn't have any subcategories available at the moment.
            </p>
          </div>
        ) : (
          <div style={styles.grid}>
            {subs.map((sc) => (
              <Link
                key={sc._id}
                to={`/catalog/${sc._id}`}
                style={styles.card}
                onMouseEnter={(e) => {
                  Object.assign(e.currentTarget.style, styles.cardHover)
                  const arrow = e.currentTarget.querySelector('.card-arrow')
                  if (arrow) arrow.style.transform = 'translateX(4px)'
                }}
                onMouseLeave={(e) => {
                  Object.assign(e.currentTarget.style, styles.card)
                  const arrow = e.currentTarget.querySelector('.card-arrow')
                  if (arrow) arrow.style.transform = 'translateX(0)'
                }}
              >
                <div style={styles.cardContent}>
                  <div style={styles.cardIcon}>
                    <FiFolder />
                  </div>
                  
                  <h3 style={styles.cardTitle}>{sc.name}</h3>
                  
                  {sc.description && (
                    <p style={styles.cardDescription}>
                      {sc.description.length > 120 
                        ? `${sc.description.substring(0, 120)}...` 
                        : sc.description
                      }
                    </p>
                  )}
                  
                  <div style={styles.cardFooter}>
                    <div style={styles.cardAction}>
                      <span>Explore</span>
                      <FiArrowRight 
                        className="card-arrow"
                        style={styles.cardArrow}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Category
