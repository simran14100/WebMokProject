import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { apiConnector } from '../../services/apiConnector';
import { VscCheck, VscError, VscHistory } from 'react-icons/vsc';

const COLORS = {
  navy: '#0E3A5D',
  blue: '#1F7AAF',
  teal: '#07A698',
  sky: '#E6F7F5',
  white: '#FFFFFF',
  text: '#122B49',
  subtext: '#526581',
  border: '#E6EEF5',
  badge: '#0D6EFD',
};

export default function EnrollmentApproved() {
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [courseDetails, setCourseDetails] = useState(null);
  const [isApproved, setIsApproved] = useState(false);
  const [statusData, setStatusData] = useState(null);

  const searchParams = new URLSearchParams(location.search);
  const programType = useMemo(() => searchParams.get('program') || user?.programType || localStorage.getItem('selectedProgram') || '-', [location.search, user]);
  
  // Calculate derived data
  const d = statusData || {};
  const approvedAt = d?.approvedAt || d?.updatedAt || d?.createdAt;
  
  // Debug: Log the entire status data and course info
  useEffect(() => {
    console.log('Status Data:', d);
    console.log('Course data from status:', d?.course);
    console.log('Course name from status:', d?.courseName);
    console.log('User selected course:', user?.selectedCourse);
  }, [d, user?.selectedCourse]);
  
  // Fetch course details when we have a course ID
  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!d?.course) {
        console.log('No course ID found in status data');
        return;
      }

      // If course is a string ID, fetch the course details
      if (typeof d.course === 'string') {
        try {
          console.log('Fetching course details for ID:', d.course);
          const response = await apiConnector(
            'GET',
            `/api/v1/ugpgcourse/${d.course}`,  // Using the correct UGPG course endpoint
            null,
            { 'Authorization': `Bearer ${token}` }
          );
          console.log('API Response:', response);  // Add this line for debugging

          if (response?.data?.success && response.data.data) {
            console.log('Fetched course details:', response.data.data);
            setCourseDetails({
              name: response.data.data.courseName || response.data.data.name || `Course (${d.course})`,
              ...response.data.data
            });
          } else {
            console.log('No course data found, using fallback');
            setCourseDetails({ name: `Course (${d.course})`  });
          }
        } catch (error) {
          console.error('Error fetching course details:', error);
          setCourseDetails({ name: `Course (${d.course})`  });
        }
      }
      // If course is already an object, use it directly
      else if (typeof d.course === 'object') {
        console.log('Using course object from response:', d.course);
        setCourseDetails({
          name: d.course.courseName || d.course.name || `Course (${d.course._id})`,
          ...d.course
        });
      }
    };

    fetchCourseDetails();
  }, [d?.course, token]);

  // Get course name from the most reliable source first
  const courseName = useMemo(() => {
    console.log('Calculating course name...');
    
    // 1. First check if we have courseDetails with a name
    if (courseDetails?.courseName) {
      console.log('Using courseDetails.courseName:', courseDetails.courseName);
      return courseDetails.courseName;
    }
    if (courseDetails?.name) {
      console.log('Using courseDetails.name:', courseDetails.name);
      return courseDetails.name;
    }
    
    // 2. Check direct properties in the status data
    if (d?.courseName) {
      console.log('Using courseName from status data:', d.courseName);
      return d.courseName;
    }
    
    // 3. Check if course is an object with name properties
    if (d?.course) {
      if (typeof d.course === 'object') {
        if (d.course.courseName) {
          console.log('Using course.courseName:', d.course.courseName);
          return d.course.courseName;
        }
        if (d.course.name) {
          console.log('Using course.name:', d.course.name);
          return d.course.name;
        }
      }
    }
    
    // 4. Check if course is a string ID (last resort)
    if (d?.course && typeof d.course === 'string') {
      console.log('Using course ID as fallback:', d.course);
      return `Course (${d.course})`;
    }
    
    // 5. Fallback to user's selected course or default
    const fallback = user?.selectedCourse || 'Course not specified';
    console.log('Using fallback course name:', fallback);
    return fallback;
  }, [courseDetails, d, user?.selectedCourse]);
  
  const schoolName = d?.school?.name || d?.schoolName || d?.school || '-';
  const sessionName = d?.session?.name || d?.sessionName || d?.session || '-';
  const enrollmentId = d?.registrationId || d?._id || '-';

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        if (!token) {
          navigate(`/login?redirect=${encodeURIComponent('/university/approved')}`);
          return;
        }

        // Fetch current university registration status and details
        const res = await apiConnector('GET', '/api/v1/university/registered-students/my-status', null, {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        });

        const ok = res?.data?.success;
        const data = res?.data?.data || {};
        const approved = ok && data?.matched && (data?.status === 'approved' || data?.status === 'Approved');
        console.log('API Response:', { ok, data, approved });
        console.log('Course data from API:', data?.course);
        setIsApproved(!!approved);
        setStatusData(data);
      } catch (e) {
        setError(e?.response?.data?.message || e.message || 'Failed to load enrollment details');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [token, navigate, programType]);

  const row = (label, value) => (
    <tr>
      <td style={{ padding: 10, background: '#F8FBFE', border: `1px solid ${COLORS.border}`, fontWeight: 700, width: 210 }}>{label}</td>
      <td style={{ padding: 10, border: `1px solid ${COLORS.border}`, color: COLORS.text }}>{value || '-'}</td>
    </tr>
  );

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: COLORS.white, display: 'grid', placeItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="animate-spin" style={{ width: 42, height: 42, border: '4px solid #e6eef5', borderTopColor: COLORS.teal, borderRadius: '50%', margin: '0 auto 12px' }} />
          <div style={{ color: COLORS.subtext }}>Loading your enrollment details...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen" style={{ background: COLORS.white, display: 'grid', placeItems: 'center', padding: 16 }}>
        <div style={{ maxWidth: 560, width: '100%', background: '#fff', border: `1px solid #fecaca`, borderRadius: 16, boxShadow: '0 10px 30px rgba(16, 42, 67, 0.06)', padding: 20, textAlign: 'center' }}>
          <VscError className="h-10 w-10" style={{ color: '#ef4444', width: 36, height: 36, margin: '0 auto 10px' }} />
          <div style={{ fontWeight: 800, fontSize: 18, color: COLORS.text, marginBottom: 6 }}>Unable to load</div>
          <div style={{ color: COLORS.subtext, marginBottom: 12 }}>{error}</div>
          <button
            onClick={() => window.location.reload()}
            style={{ background: COLORS.teal, color: '#fff', padding: '10px 14px', borderRadius: 12, border: 'none', fontWeight: 700 }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }


  // If not approved, render a simple Pending view inside this page
  if (!isApproved) {
    return (
      <div style={{ background: COLORS.white, minHeight: '100vh' }}>
        <div
          style={{
            background: `linear-gradient(135deg, ${COLORS.navy} 0%, ${COLORS.blue} 55%, ${COLORS.teal} 100%)`,
            color: COLORS.white,
            padding: '90px 20px 60px',
            marginTop: '8rem',
          }}
        >
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.12)', padding: '8px 14px', borderRadius: 999 }}>
              <span style={{ display: 'grid', placeItems: 'center', background: 'rgba(255,255,255,0.15)', width: 28, height: 28, borderRadius: '50%' }}>
                <VscHistory style={{ color: '#f59e0b', width: 18, height: 18 }} />
              </span>
              <span style={{ fontWeight: 800, letterSpacing: 0.4 }}>Enrollment Pending</span>
            </div>
            <h1 style={{ margin: '14px 0 8px', fontSize: 34, lineHeight: 1.2, fontWeight: 800 }}>
              Your enrollment is under review
            </h1>
            <p style={{ margin: 0, maxWidth: 700, color: '#E7F1FA', fontSize: 15 }}>
              We are processing your university registration. Please check back later or visit your dashboard for updates.
            </p>
          </div>
        </div>

        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '26px 20px 60px' }}>
          <div style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 16, boxShadow: '0 10px 30px rgba(16, 42, 67, 0.06)', padding: 18 }}>
            <div style={{ fontWeight: 800, fontSize: 18, color: COLORS.navy, marginBottom: 8 }}>Status</div>
            <div style={{ color: COLORS.subtext }}>
              Current status: <strong>Pending</strong>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: COLORS.white, minHeight: '100vh' }}>
      {/* Hero */}
      <div
        style={{
          background: `linear-gradient(135deg, ${COLORS.navy} 0%, ${COLORS.blue} 55%, ${COLORS.teal} 100%)`,
          color: COLORS.white,
          padding: '90px 20px 60px',
          marginTop: '8rem',
        }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.12)', padding: '8px 14px', borderRadius: 999 }}>
            <span style={{ display: 'grid', placeItems: 'center', background: 'rgba(255,255,255,0.15)', width: 28, height: 28, borderRadius: '50%' }}>
              <VscCheck style={{ color: '#22c55e', width: 18, height: 18 }} />
            </span>
            <span style={{ fontWeight: 800, letterSpacing: 0.4 }}>Enrollment Approved</span>
          </div>
          <h1 style={{ margin: '14px 0 8px', fontSize: 34, lineHeight: 1.2, fontWeight: 800 }}>
            Welcome to the {programType} program
          </h1>
          <p style={{ margin: 0, maxWidth: 700, color: '#E7F1FA', fontSize: 15 }}>
            Your university registration has been approved. Below are your enrollment details and next steps.
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '26px 20px 60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 340px', gap: 24 }}>
          {/* Details Card */}
          <div>
            <div style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 16, boxShadow: '0 10px 30px rgba(16, 42, 67, 0.06)' }}>
              <div style={{ height: 6, background: `linear-gradient(90deg, ${COLORS.blue}, ${COLORS.teal})`, borderTopLeftRadius: 16, borderTopRightRadius: 16 }} />
              <div style={{ padding: 18 }}>
                <div style={{ fontWeight: 800, fontSize: 20, color: COLORS.text }}>Enrollment Details</div>
                <div style={{ color: COLORS.subtext, marginTop: 6 }}>Keep these details for your records.</div>

                <div style={{ marginTop: 16, overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                    <tbody>
                      {row('Enrollment ID', enrollmentId)}
                      {row('Status', (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#dcfce7', color: '#166534', border: '1px solid #86efac', padding: '4px 10px', borderRadius: 999, fontWeight: 700 }}>
                          <VscCheck /> Approved
                        </span>
                      ))}
                      {row('Program', programType)}
                      {row('Course', courseName)}
                      {/* {row('School', schoolName)}
                      {row('Session', sessionName)} */}
                      {row('Approved On', approvedAt ? new Date(approvedAt).toLocaleString() : '-')}
                    </tbody>
                  </table>
                </div>

                {/* Tips */}
                <div style={{ marginTop: 18, background: '#F8FBFE', border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 14, color: COLORS.subtext, lineHeight: 1.6 }}>
                  <div style={{ fontWeight: 700, color: COLORS.navy, marginBottom: 6 }}>Next steps</div>
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    <li>Complete your profile and document uploads.</li>
                    <li>Review your timetable and exam schedule.</li>
                    <li>Visit the University Dashboard to access all student services.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Actions */}
          <aside>
            <div style={{ position: 'sticky', top: 120 }}>
              <div style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 16, boxShadow: '0 10px 30px rgba(16, 42, 67, 0.06)', padding: 18 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: COLORS.navy, marginBottom: 8 }}>Quick Actions</div>
                <div style={{ color: COLORS.subtext, fontSize: 14, marginBottom: 14 }}>Jump to commonly used sections.</div>
                <div style={{ display: 'grid', gap: 10 }}>
                  <button
                    onClick={() => navigate('/EnrolledStudents')}
                    style={{
                      display: 'inline-block',
                      textAlign: 'center',
                      background: `linear-gradient(90deg, ${COLORS.teal}, ${COLORS.blue})`,
                      color: COLORS.white,
                      padding: '10px 12px',
                      borderRadius: 12,
                      border: 'none',
                      fontWeight: 800,
                      letterSpacing: 0.3,
                      boxShadow: '0 6px 14px rgba(7, 166, 152, 0.18)',
                      cursor: 'pointer',
                    }}
                  >
                    Go to University Dashboard
                  </button>
                  <button
                    onClick={() => navigate('/EnrolledStudents/Timetable')}
                    style={{
                      display: 'inline-block',
                      textAlign: 'center',
                      background: COLORS.white,
                      color: COLORS.teal,
                      border: `2px solid ${COLORS.teal}`,
                      padding: '10px 12px',
                      borderRadius: 12,
                      fontWeight: 800,
                      letterSpacing: 0.3,
                      cursor: 'pointer',
                    }}
                  >
                    View Timetable
                  </button>
                </div>
              </div>

              <div style={{ color: COLORS.subtext, fontSize: 12, marginTop: 12 }}>
                Need help? Contact support from your dashboard.
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
