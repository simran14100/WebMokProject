import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import Footer from "../components/common/Footer";
import CourseCard from "../components/core/Catalog/Course_Card";
import CourseSlider from "../components/core/Catalog/Course_Slider";
import { apiConnector } from "../services/apiConnector";
import { categories } from "../services/apis";
import { getCatalogPageData } from "../services/operations/courseDetailsAPI";
import pageHeaderShape1 from '../assets/img/shapes/page-header-shape-1.png';
import pageHeaderShape2 from '../assets/img/shapes/page-header-shape-2.png';
import pageHeaderShape3 from '../assets/img/shapes/page-header-shape-3.png';
import { Link } from "react-router-dom";
import pageHeaderBg from '../assets/img/bg-img/page-header-bg.png';

// import Error from "../components/common/Error";

function Catalog() {
  const { loading } = useSelector((state) => state.profile);
  const { catalogName } = useParams();
  const [active, setActive] = useState(1);
  const [catalogPageData, setCatalogPageData] = useState(null);
  const [categoryId, setCategoryId] = useState("");

  // Fetch All Categories and get categoryId
  useEffect(() => {
    (async () => {
      try {
        const res = await apiConnector("GET", categories.CATEGORIES_API);
        console.log("Fetched categories:", res?.data?.data);
        const slugify = str => str.split(" ").join("-").toLowerCase();
        const category = res?.data?.data?.find(
          (ct) => slugify(ct.name) === slugify(catalogName) || ct._id === catalogName
        );
        console.log("Matched category:", category);
        setCategoryId(category?._id || "");
      } catch (error) {
        console.log("Could not fetch Categories.", error);
      }
    })();
  }, [catalogName]);

  // Fetch Catalog Page Data
  useEffect(() => {
    if (categoryId) {
      console.log("Fetching catalog page data for categoryId:", categoryId);
      (async () => {
        try {
          const res = await getCatalogPageData(categoryId);
          console.log("Catalog page API response:", res);
          setCatalogPageData(res);
        } catch (error) {
          console.log(error);
        }
      })();
    } else {
      console.log("No categoryId found, skipping catalog page data fetch.");
    }
  }, [categoryId]);

  console.log("catalogPageData before render:", catalogPageData);

  if (loading || !catalogPageData) {
    return (
      <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center bg-white">
        <div className="spinner"></div>
      </div>
    );
  }
  if (!loading && !catalogPageData.success) {
    return <div className="text-center text-red-500 py-10 bg-white">An error occurred while loading the catalog page.</div>;
  }

  // Helper to get at least 2 courses from a main array, then fill from others if needed
  function getAtLeastTwoCourses(main, ...others) {
    if (main.length >= 2) return main.slice(0, 2);
    const combined = [...main, ...others.flat()];
    // Remove duplicates by _id
    const unique = [];
    const seen = new Set();
    for (const c of combined) {
      if (c && c._id && !seen.has(c._id)) {
        unique.push(c);
        seen.add(c._id);
      }
      if (unique.length === 2) break;
    }
    return unique;
  }

  // Prepare all available courses
  const allCourses = [
    ...(catalogPageData?.data?.selectedCategory?.courses || []),
    ...(catalogPageData?.data?.differentCategory?.courses || []),
    ...(catalogPageData?.data?.mostSellingCourses || []),
  ];

  // For 'Courses to get you started'
  const startedCourses = getAtLeastTwoCourses(
    catalogPageData?.data?.selectedCategory?.courses || [],
    allCourses
  );

  // For 'Top courses in ...'
  const topCourses = getAtLeastTwoCourses(
    catalogPageData?.data?.differentCategory?.courses || [],
    allCourses
  );

  return (
    <>    
      {/* Hero Section */}
      {/* <div className="bg-white px-4 py-16 border-b border-gray-200 ">
        <div className="mx-auto flex min-h-[220px] max-w-6xl flex-col justify-center gap-4">
          <p className="text-xs uppercase tracking-wider text-gray-400 mb-2">
            Home <span className="mx-2">/</span> Catalog <span className="mx-2">/</span>
            <span className="text-[#009e5c] font-semibold">
              {catalogPageData?.data?.selectedCategory?.name}
            </span>
          </p>
          <h1 className="text-5xl font-extrabold mb-2 flex items-center gap-3" style={{ color: '#009e5c' }}>
            <span className="h-10 w-2 rounded bg-[#009e5c] inline-block"></span>
            {catalogPageData?.data?.selectedCategory?.name}
          </h1>
          <p className="max-w-2xl text-gray-700 text-lg">
            {catalogPageData?.data?.selectedCategory?.description}
          </p>
        </div>
      </div> */}
      {/* Page Header */}
<section style={{ 
  position: 'relative', 
  padding: '120px 0', 
  overflow: 'hidden',
  borderBottom: '1px solid #e5e7eb',
  marginTop:'4rem'
}}>
  {/* Background Image */}
  <div style={{ 
    position: 'absolute', 
    inset: 0, 
    backgroundImage: `url(${pageHeaderBg})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    marginTop:'4rem'
  }}></div>
  
  {/* Dark Overlay */}
  <div style={{ 
    position: 'absolute', 
    inset: 0, 
    backgroundColor: 'black', 
    opacity: 0.4 
  }}></div>
  
  {/* Background Shapes */}
  <div style={{ position: 'absolute', inset: 0 }}>
    <div style={{ 
      position: 'absolute', 
      top: '40px', 
      left: '40px', 
      opacity: 0.1 
    }}>
      <img src={pageHeaderShape1} alt="shape" style={{ width: '80px', height: '80px' }} />
    </div>
    <div style={{ 
      position: 'absolute', 
      top: '80px', 
      right: '80px', 
      opacity: 0.1 
    }}>
      <img src={pageHeaderShape2} alt="shape" style={{ width: '64px', height: '64px' }} />
    </div>
    <div style={{ 
      position: 'absolute', 
      bottom: '40px', 
      left: '25%', 
      opacity: 0.1 
    }}>
      <img src={pageHeaderShape3} alt="shape" style={{ width: '48px', height: '48px' }} />
    </div>
  </div>
  
  {/* Content Container */}
  <div style={{ 
    position: 'relative', 
    maxWidth: '1280px', 
    margin: '0 auto', 
    padding: '0 16px' 
  }}>
    <div style={{ 
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      minHeight: '220px',
      gap: '16px'
    }}>
      {/* Breadcrumb Navigation */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px', 
        color: 'rgba(255,255,255,0.8)',
        fontSize: '14px',
        textTransform: 'uppercase',
        letterSpacing: '1px'
      }}>
        <Link to="/" style={{ 
          color: 'rgba(255,255,255,0.8)', 
          textDecoration: 'none',
          transition: 'color 0.3s',
          ':hover': {
            color: 'white'
          }
        }}>
          Home
        </Link>
        <span>/</span>
        <Link to="/catalog" style={{ 
          color: 'rgba(255,255,255,0.8)', 
          textDecoration: 'none',
          transition: 'color 0.3s',
          ':hover': {
            color: 'white'
          }
        }}>
          Catalog
        </Link>
        <span>/</span>
        <span style={{ 
          color: '#07A698',
          fontWeight: '600'
        }}>
          {catalogPageData?.data?.selectedCategory?.name}
        </span>
      </div>
      
      {/* Main Title */}
      <h1 style={{ 
        fontSize: '48px', 
        fontWeight: '800', 
        color: 'white', 
        margin: 0,
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        <span style={{ 
          display: 'inline-block',
          width: '4px',
          height: '40px',
          backgroundColor: '#07A698',
          borderRadius: '2px'
        }}></span>
        {catalogPageData?.data?.selectedCategory?.name}
      </h1>
      
      {/* Description */}
      <p style={{ 
        maxWidth: '600px',
        color: 'rgba(255,255,255,0.9)',
        fontSize: '18px',
        lineHeight: '1.6',
        margin: 0
      }}>
        {catalogPageData?.data?.selectedCategory?.description}
      </p>
    </div>
  </div>
</section>

      {/* Section 1: Courses to get you started */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 bg-white border-b border-gray-100">
        <div className="flex items-center gap-3 mb-8">
          <span className="h-8 w-1 rounded bg-[#009e5c]"></span>
          <h2 className="text-3xl font-extrabold" style={{ color: '#009e5c' }}>Courses to get you started</h2>
        </div>
        <div className="flex gap-4 mb-8">
          <button
            className={`px-6 py-2 rounded-full font-semibold transition-colors duration-200 shadow-sm border ${
              active === 1
                ? "bg-[#009e5c] text-white border-[#009e5c]"
                : "bg-white text-[#009e5c] border-[#009e5c] hover:bg-green-50"
            }`}
            onClick={() => setActive(1)}
          >
            Most Popular
          </button>
          <button
            className={`px-6 py-2 rounded-full font-semibold transition-colors duration-200 shadow-sm border ${
              active === 2
                ? "bg-[#009e5c] text-white border-[#009e5c]"
                : "bg-white text-[#009e5c] border-[#009e5c] hover:bg-green-50"
            }`}
            onClick={() => setActive(2)}
          >
            New
          </button>
        </div>
        <div className="container mx-auto bg-white rounded-2xl p-8 shadow-lg border border-gray-100 transition-all duration-200">
          {startedCourses.length ? (
            <CourseSlider Courses={startedCourses} />
          ) : (
            <div className="text-center py-12 text-gray-400 text-lg">No courses found in this category.</div>
          )}
        </div>
      </section>

      {/* Section 2: Top courses in different category */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 bg-white border-b border-gray-100">
        <div className="flex items-center gap-3 mb-8">
          <span className="h-8 w-1 rounded bg-[#009e5c]"></span>
          <h2 className="text-3xl font-extrabold" style={{ color: '#009e5c' }}>
            Top courses in {catalogPageData?.data?.differentCategory?.name}
          </h2>
        </div>
        <div className="container mx-auto bg-white rounded-2xl p-8 shadow-lg border border-gray-100 transition-all duration-200">
          <div className="overflow-visible px-4 pb-4">
            {topCourses.length ? (
              <CourseSlider Courses={topCourses} />
            ) : (
              <div className="text-center py-12 text-gray-400 text-lg">No top courses found in this category.</div>
            )}
          </div>
        </div>
      </section>

      {/* Section 3: Frequently Bought */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 bg-white">
        <div className="flex items-center gap-3 mb-8">
          <span className="h-8 w-1 rounded bg-[#009e5c]"></span>
          <h2 className="text-3xl font-extrabold" style={{ color: '#009e5c' }}>Frequently Bought</h2>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {catalogPageData?.data?.mostSellingCourses?.slice(0, 6).length ? (
            catalogPageData?.data?.mostSellingCourses?.slice(0, 6).map((course, i) => (
              <CourseCard course={course} key={i} height={"h-[320px]"} />
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-gray-400 text-lg">No frequently bought courses found.</div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}

export default Catalog;