import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import DashboardLayout from "../../../common/DashboardLayout";
import { getBatchById, updateBatch, deleteBatch, getAllInstructors, getRegisteredUsers, getEnrolledStudents, listBatchStudents, addStudentToBatch, removeStudentFromBatch, listBatchCourses, addCourseToBatch, removeCourseFromBatch, addLiveClassToBatch, createAdminReview, deleteAdminReview, createGoogleMeetLink, listBatchTrainers, addTrainerToBatch, removeTrainerFromBatch } from "../../../../services/operations/adminApi";
import { getAllCourses, getAllReviews } from "../../../../services/operations/courseDetailsAPI";
import { showError, showSuccess, showLoading, dismissToast } from "../../../../utils/toast";

// Style constants (kept consistent with Batch pages)
const ED_TEAL = "#07A698";
const ED_TEAL_DARK = "#059a8c";
const TEXT_DARK = "#2d3748";
const TEXT_LIGHT = "#718096";
const BG_LIGHT = "#f8fafc";
const BORDER_COLOR = "#e2e8f0";

const TABS = [
  { key: "info", label: "Info" },
  { key: "trainer", label: "Trainer" },
  { key: "student", label: "Student" },
  { key: "courses", label: "Courses" },
  { key: "live", label: "Live Classes" },
  { key: "attendance", label: "Attendance" },
  { key: "reviews", label: "Reviews" },
];

export default function EditPage() {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state) => state.profile.user);
  const token = useSelector((state) => state.auth.token);
  const isAdmin = user?.accountType === "Admin";

  const [activeTab, setActiveTab] = useState("info");
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");

  // Instructors modal state
  const [showInstructorModal, setShowInstructorModal] = useState(false);
  const [instructors, setInstructors] = useState([]);
  const [instructorsLoading, setInstructorsLoading] = useState(false);
  const [instructorsError, setInstructorsError] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [pageIndex, setPageIndex] = useState(0); // zero-based page index for client-side pagination

  // Assigned instructors (persisted via backend)
  const [assignedInstructors, setAssignedInstructors] = useState([]);

  // Student tab (UI-only for now)
  const [students, setStudents] = useState([]); // expected shape: {_id,id,name,email,phone}
  const [studentRowsPerPage, setStudentRowsPerPage] = useState(5);
  const [studentPageIndex, setStudentPageIndex] = useState(0);
  const [selectedStudentIds, setSelectedStudentIds] = useState(new Set());

  // Add Student modal state
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [allStudents, setAllStudents] = useState([]); // pool to pick from
  const [studentModalLoading, setStudentModalLoading] = useState(false);
  const [studentModalError, setStudentModalError] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [pickRowsPerPage, setPickRowsPerPage] = useState(5);
  const [pickPageIndex, setPickPageIndex] = useState(0);

  // Courses modal state
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [coursesError, setCoursesError] = useState("");
  const [courseSearch, setCourseSearch] = useState("");
  const [assignedCourses, setAssignedCourses] = useState([]);
  const [assignedCourseIds, setAssignedCourseIds] = useState(new Set());

  // Fetch and split reviews on Reviews tab activation
  useEffect(() => {
    const loadReviews = async () => {
      try {
        const all = await getAllReviews();
        if (!Array.isArray(all)) return;

        // Build a fast lookup set for assigned courses (string ids)
        const courseIdSet = new Set(
          Array.from(assignedCourseIds).map((id) => String(id))
        );

        const admin = [];
        const students = [];
        for (const r of all) {
          const courseObj = r.course || {};
          const userObj = r.user || {};
          const cid = String(courseObj._id || courseObj.id || "");
          if (courseIdSet.size > 0 && !courseIdSet.has(cid)) continue;

          const base = {
            _id: r._id,
            courseId: cid,
            courseTitle: courseObj.title || courseObj.name || courseObj.courseName || "Course",
            email: userObj.email || "-",
            review: r.review || "",
            rating: typeof r.rating !== "undefined" ? r.rating : undefined,
          };
          const accountType = (userObj.accountType || userObj.role || "").toLowerCase();
          if (accountType === "admin" || accountType === "superadmin" || accountType === "instructor") {
            admin.push({ ...base, adminName: `${userObj.firstName || ""} ${userObj.lastName || ""}`.trim() || "Admin" });
          } else {
            students.push({ ...base, studentName: `${userObj.firstName || ""} ${userObj.lastName || ""}`.trim() || "Student" });
          }
        }

        setAdminReviews(admin);
        setStudentReviews(students);
      } catch (e) {
        // Silent, toasts already shown by service
      }
    };

    if (activeTab === "reviews") {
      loadReviews();
    }
  }, [activeTab, assignedCourseIds]);

  // Reviews tab state
  const [studentReviews, setStudentReviews] = useState([]); // student-submitted
  const [adminReviews, setAdminReviews] = useState([]); // admin-submitted
  const [adminReviewCourseId, setAdminReviewCourseId] = useState("");
  const [adminReviewText, setAdminReviewText] = useState("");
  const [adminReviewRating, setAdminReviewRating] = useState(5);

  // Live class modal state
  const [showLiveClassModal, setShowLiveClassModal] = useState(false);
  const [liveTitle, setLiveTitle] = useState("");
  const [liveDescription, setLiveDescription] = useState("");
  const [liveLink, setLiveLink] = useState("");
  const [liveDateTime, setLiveDateTime] = useState(""); // HTML datetime-local string

  // Live classes calendar state
  const [calendarDate, setCalendarDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [calendarView, setCalendarView] = useState("month"); // "month" | "day"

  const today = new Date();
  const isSameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
  const endOfMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0);
  const startOfWeek = (d) => {
    const date = new Date(d);
    const day = date.getDay(); // 0 Sun - 6 Sat
    date.setDate(date.getDate() - day);
    date.setHours(0, 0, 0, 0);
    return date;
  };
  const addDays = (d, n) => {
    const x = new Date(d);
    x.setDate(x.getDate() + n);
    return x;
  };
  const monthLabel = (d) =>
    d.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  // Helpers for Live Class modal
  const toDateTimeLocal = (d) => {
    const pad = (n) => String(n).padStart(2, "0");
    const y = d.getFullYear();
    const m = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hh = pad(d.getHours());
    const mm = pad(d.getMinutes());
    return `${y}-${m}-${day}T${hh}:${mm}`;
  };
  // Build Google Calendar event editor URL and open in new tab (manual Meet add)
  const toGCalDate = (iso) => {
    const d = new Date(iso);
    const pad = (n) => String(n).padStart(2, "0");
    return (
      d.getUTCFullYear().toString() +
      pad(d.getUTCMonth() + 1) +
      pad(d.getUTCDate()) +
      "T" +
      pad(d.getUTCHours()) +
      pad(d.getUTCMinutes()) +
      pad(d.getUTCSeconds()) +
      "Z"
    );
  };
  const openGoogleCalendarEditor = ({ title, description, startISO, endISO, timeZone = "Asia/Kolkata", attendees = [], location = "" }) => {
    if (!startISO || !endISO) return;
    const params = new URLSearchParams({
      text: title || "Live Class",
      details: description || "",
      location: location || "",
      dates: `${toGCalDate(startISO)}/${toGCalDate(endISO)}`,
      ctz: timeZone,
    });
    if (attendees.length) params.set("add", attendees.join(","));
    const url = `https://calendar.google.com/calendar/u/0/r/eventedit?${params.toString()}`;
    window.open(url, "_blank", "noopener");
  };
  const openLiveClassModal = () => {
    // default time 10:00 on selectedDate
    const base = new Date(selectedDate);
    base.setHours(10, 0, 0, 0);
    setLiveDateTime(toDateTimeLocal(base));
    setLiveTitle("");
    setLiveDescription("");
    setLiveLink("");
    setShowLiveClassModal(true);
  };
  const closeLiveClassModal = () => setShowLiveClassModal(false);
  const onCreateLiveClass = async () => {
    // Client-side validations
    const title = (liveTitle || "").trim();
    const whenStr = (liveDateTime || "").trim();
    if (!title) {
      showError("Please enter a class title");
      return;
    }
    if (!whenStr) {
      showError("Please select date & time");
      return;
    }
    const when = new Date(whenStr);
    if (isNaN(when.getTime())) {
      showError("Invalid date/time format");
      return;
    }
    const now = new Date();
    const whenTs = when.getTime();
    const nowTs = now.getTime();
    if (whenTs <= nowTs) {
      const sameDay = when.toDateString() === now.toDateString();
      showError(sameDay ? "Selected time has already passed today" : "Cannot schedule a class in the past");
      return;
    }

    try {
      const payload = {
        title,
        description: (liveDescription || "").trim(),
        link: (liveLink || "").trim(),
        startTime: when.toISOString(),
      };
      const created = await addLiveClassToBatch(batchId, payload, token);
      showSuccess("Live class created");
      setShowLiveClassModal(false);
      // Update local state so calendar reflects immediately
      setBatch((prev) => {
        const prevEvents = Array.isArray(prev?.liveClasses) ? prev.liveClasses : [];
        return { ...(prev || {}), liveClasses: [...prevEvents, created] };
      });
    } catch (e) {
      showError(e?.response?.data?.message || e?.message || "Failed to create live class");
    }
  };

  const onCalendarToday = () => {
    const now = new Date();
    setSelectedDate(now);
    setCalendarDate(now);
  };
  const onCalendarBack = () => {
    if (calendarView === "day") {
      setSelectedDate((prev) => {
        const next = addDays(prev, -1);
        setCalendarDate(next);
        return next;
      });
    } else {
      setCalendarDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    }
  };
  const onCalendarNext = () => {
    if (calendarView === "day") {
      setSelectedDate((prev) => {
        const next = addDays(prev, 1);
        setCalendarDate(next);
        return next;
      });
    } else {
      setCalendarDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    }
  };

  const toggleSelectAllStudents = () => {
    if (students.length === 0) return;
    const pageSlice = students.slice(
      studentPageIndex * studentRowsPerPage,
      studentPageIndex * studentRowsPerPage + studentRowsPerPage
    );
    const pageIds = pageSlice.map((s) => s._id || s.id);
    const allSelected = pageIds.every((id) => selectedStudentIds.has(id));
    const next = new Set(selectedStudentIds);
    if (allSelected) {
      pageIds.forEach((id) => next.delete(id));
    } else {
      pageIds.forEach((id) => id && next.add(id));
    }
    setSelectedStudentIds(next);
  };

  const toggleSelectStudent = (id) => {
    if (!id) return;
    const next = new Set(selectedStudentIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedStudentIds(next);
  };

  const onDownloadAllStudents = () => {
    showSuccess("Download coming soon");
  };

  const onAddStudent = async () => {
    // Open modal and fetch candidates
    setShowStudentModal(true);
    setStudentModalLoading(true);
    setStudentModalError("");
    try {
      // Fetch only registered users with role=Student; large limit to avoid pagination misses
      const registered = await getRegisteredUsers(token, { page: 1, limit: 1000, role: "Student", search: "" }).catch(() => []);

      // Normalize array defensively
      const regArr = Array.isArray(registered?.users || registered?.data || registered) ? (registered.users || registered.data || registered) : [];

      // Filter possible students from registered list only
      const map = new Map();
      for (const u of regArr) {
        const id = u._id || u.id || u.userId || u.email; // fallback to email for uniqueness
        if (!id) continue;
        // Only include Students created by Admin
        if (u.accountType && String(u.accountType).toLowerCase() !== "student") continue;
        if (!u.createdByAdmin) continue;
        // Avoid already-assigned students in this batch UI list
        const alreadyAssigned = Array.isArray(students) && students.some(s => (s._id || s.id || s.userId) === id);
        if (alreadyAssigned) continue;
        if (!map.has(id)) map.set(id, u);
      }
      const list = Array.from(map.values());
      setAllStudents(list);
      setPickPageIndex(0);
    } catch (e) {
      setStudentModalError(e?.message || "Failed to load students");
      showError(e?.message || "Failed to load students");
    } finally {
      setStudentModalLoading(false);
    }
  };

  const onRemoveAllStudents = () => {
    if (students.length === 0) return;
    const ok = window.confirm("Remove all students from this batch?");
    if (!ok) return;
    // UI-only reset for now
    setStudents([]);
    setSelectedStudentIds(new Set());
    showSuccess("All students removed (UI only)");
  };

  const removeStudent = async (id) => {
    if (!id || !batchId) return;
    try {
      await removeStudentFromBatch(batchId, id, token);
      setStudents((prev) => prev.filter((s) => (s._id || s.id || s.userId) !== id));
      setSelectedStudentIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      showSuccess("Student removed from batch");
    } catch (e) {
      showError(e?.message || "Failed to remove student");
    }
  };

  useEffect(() => {
    if (!batchId || !token || !isAdmin) return;
    let mounted = true;
    setLoading(true);
    setError("");
    getBatchById(batchId, token)
      .then((data) => {
        if (mounted) {
          setBatch(data);
          setName(data?.name || "");
          setDepartment(data?.department || "");
          // initialize assigned instructors if backend sends it, else fetch
          if (Array.isArray(data?.trainers)) {
            setAssignedInstructors(data.trainers);
          } else {
            listBatchTrainers(batchId, token)
              .then((trs) => Array.isArray(trs) && setAssignedInstructors(trs))
              .catch(() => {});
          }
          // Fetch assigned students for this batch
          listBatchStudents(batchId, token)
            .then((list) => {
              if (!mounted) return;
              const arr = Array.isArray(list) ? list : [];
              setStudents(arr);
              setSelectedStudentIds(new Set());
            })
            .catch((e) => {
              if (!mounted) return;
              showError(e?.message || "Failed to load batch students");
            });
        }
      })
      .catch((e) => {
        if (mounted) {
          setError(e?.message || "Failed to fetch batch details");
          showError(e?.message || "Failed to fetch batch details");
        }
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [batchId, token, isAdmin]);

  // When user switches to Courses tab, fetch assigned courses (no modal auto-open)
  useEffect(() => {
    if (!batchId || !token) return;
    if (activeTab !== "courses" && activeTab !== "reviews") return;
    (async () => {
      try {
        const assigned = await listBatchCourses(batchId, token);
        const assignedArr = Array.isArray(assigned) ? assigned : [];
        setAssignedCourses(assignedArr);
        setAssignedCourseIds(new Set(assignedArr.map((c) => c._id || c.id)));
        // In a future backend integration, fetch student reviews for these courses
        // setStudentReviews(await fetchStudentReviews(...))
      } catch (e) {
        // non-blocking
      }
    })();
  }, [activeTab, batchId, token]);

  const openCourseModal = async () => {
    setShowCourseModal(true);
    setCoursesLoading(true);
    setCoursesError("");
    try {
      const [all, assigned] = await Promise.all([
        getAllCourses().catch(() => []),
        listBatchCourses(batchId, token).catch(() => []),
      ]);
      const allCourses = Array.isArray(all) ? all : [];
      setCourses(allCourses);
      const assignedArr = Array.isArray(assigned) ? assigned : [];
      setAssignedCourses(assignedArr);
      setAssignedCourseIds(new Set(assignedArr.map((c) => c._id || c.id)));
    } catch (e) {
      setCoursesError(e?.message || "Failed to load courses");
    } finally {
      setCoursesLoading(false);
    }
  };

  const closeCourseModal = () => {
    setShowCourseModal(false);
  };

  const openInstructorModal = async () => {
    setShowInstructorModal(true);
    // Fetch only once per open
    setInstructorsLoading(true);
    setInstructorsError("");
    try {
      const data = await getAllInstructors();
      setInstructors(Array.isArray(data) ? data : []);
      setPageIndex(0);
    } catch (e) {
      setInstructorsError(e?.message || "Failed to load instructors");
      showError(e?.message || "Failed to load instructors");
    } finally {
      setInstructorsLoading(false);
    }
  };

  const closeInstructorModal = () => {
    setShowInstructorModal(false);
  };

  // Add/remove handlers for assigned instructors (persisted)
  const addInstructorToBatch = async (ins) => {
    const id = ins._id || ins.id || ins.userId;
    if (!id || !batchId) return;
    try {
      await addTrainerToBatch(batchId, id, token);
      setAssignedInstructors((prev) => {
        const exists = prev.some((p) => (p._id || p.id || p.userId) === id);
        if (exists) return prev;
        return [...prev, ins];
      });
      showSuccess("Trainer assigned to batch");
    } catch (e) {
      showError(e?.message || "Failed to assign trainer");
    }
  };

  const removeInstructorFromBatch = async (id) => {
    if (!id || !batchId) return;
    try {
      await removeTrainerFromBatch(batchId, id, token);
      setAssignedInstructors((prev) => prev.filter((p) => (p._id || p.id || p.userId) !== id));
      showSuccess("Trainer removed from batch");
    } catch (e) {
      showError(e?.message || "Failed to remove trainer");
    }
  };

  const clearAllInstructors = () => {
    if (assignedInstructors.length === 0) return;
    const ok = window.confirm("Remove all assigned instructors?");
    if (!ok) return;
    setAssignedInstructors([]);
  };

  // Handlers
  const onEditToggle = () => {
    if (!batch) return;
    setIsEditing((prev) => !prev);
  };

  const onSave = async () => {
    // Build a payload with only changed, non-empty fields
    const payload = {};
    const trimmedName = name.trim();
    const trimmedDept = department.trim();

    if (trimmedName && trimmedName !== (batch?.name || "")) {
      payload.name = trimmedName;
    }
    if (trimmedDept && trimmedDept !== (batch?.department || "")) {
      payload.department = trimmedDept;
    }

    if (Object.keys(payload).length === 0) {
      showError("Nothing to update");
      return;
    }
    // Validate department client-side to avoid 400s
    if (payload.department) {
      const allowed = ["skilling", "training", "personality"]; // backend expects lowercase
      const normalized = payload.department.toLowerCase();
      if (!allowed.includes(normalized)) {
        showError(`Department must be one of: ${allowed.join(", ")}`);
        return;
      }
      payload.department = normalized;
    }
    console.log("Submitting batch update payload:", payload);
    const toastId = showLoading("Saving changes...");
    try {
      const updated = await updateBatch(batchId, payload, token);
      setBatch(updated);
      setIsEditing(false);
      showSuccess("Batch updated successfully");
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "Failed to update batch";
      showError(msg);
    } finally {
      dismissToast(toastId);
    }
  };

  const onDelete = async () => {
    if (!batch) return;
    const confirmDelete = window.confirm(`Delete batch "${batch?.name}"? This action cannot be undone.`);
    if (!confirmDelete) return;
    const toastId = showLoading("Deleting batch...");
    try {
      await deleteBatch(batchId, token);
      showSuccess("Batch deleted successfully");
      navigate("/admin/batches");
    } catch (e) {
      showError(e?.message || "Failed to delete batch");
    } finally {
      dismissToast(toastId);
    }
  };

  return (
    <DashboardLayout>
      <div
        style={{
          width: "calc(100% - 250px)",
          marginLeft: "250px",
          minHeight: "100vh",
          backgroundColor: BG_LIGHT,
          padding: "2rem",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "1.5rem" }}>
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: 600,
              color: TEXT_DARK,
              margin: 0,
              marginBottom: "0.5rem",
            }}
          >
            Student Details
          </h2>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.875rem",
              color: TEXT_LIGHT,
            }}
          >
            <span>Batch</span>
            <span style={{ color: BORDER_COLOR }}>/</span>
            <span style={{ color: ED_TEAL, fontWeight: 500 }}>Batch Details</span>
          </div>
        </div>

        {/* Card */}
        <div
          style={{
            backgroundColor: "white",
            border: `1px solid ${BORDER_COLOR}`,
            borderRadius: "0.5rem",
            padding: "1rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          }}
        >
          {/* Tabs */}
          <div
            style={{
              display: "flex",
              gap: "2rem",
              padding: "0.5rem 0.25rem",
              borderBottom: `1px solid ${BORDER_COLOR}`,
              marginBottom: "1rem",
              overflowX: "auto",
            }}
          >
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                style={{
                  background: "transparent",
                  border: "none",
                  padding: "0.5rem 1rem",
                  cursor: "pointer",
                  color: activeTab === t.key ? TEXT_DARK : TEXT_LIGHT,
                  fontWeight: activeTab === t.key ? 600 : 500,
                  position: "relative",
                  whiteSpace: "nowrap",
                }}
              >
                {t.label}
                {activeTab === t.key && (
                  <span
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      bottom: -8,
                      height: 3,
                      backgroundColor: "#3b82f6", // blue underline as in screenshot
                      borderRadius: 999,
                    }}
                  />
                )}

          

              </button>
            ))}
          </div>

          {/* Live Classes section */}
          {activeTab === "live" && (
            <div style={{ minHeight: 300 }}>
              

              {/* Top toolbar */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={onCalendarToday} style={{ background: "#e5e7eb", border: `1px solid ${BORDER_COLOR}`, padding: "0.4rem 0.8rem", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>Today</button>
                  <button onClick={onCalendarBack} style={{ background: "#e5e7eb", border: `1px solid ${BORDER_COLOR}`, padding: "0.4rem 0.8rem", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>Back</button>
                  <button onClick={onCalendarNext} style={{ background: "#e5e7eb", border: `1px solid ${BORDER_COLOR}`, padding: "0.4rem 0.8rem", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>Next</button>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => setCalendarView("month")} style={{ background: calendarView === "month" ? "#d1d5db" : "#e5e7eb", border: `1px solid ${BORDER_COLOR}`, padding: "0.4rem 0.8rem", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>Month</button>
                    <button onClick={() => setCalendarView("day")} style={{ background: calendarView === "day" ? "#d1d5db" : "#e5e7eb", border: `1px solid ${BORDER_COLOR}`, padding: "0.4rem 0.8rem", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>Day</button>
                  </div>
                  <button
                    onClick={openLiveClassModal}
                    style={{ backgroundColor: "#7c3aed", color: "#fff", border: "none", padding: "0.45rem 0.9rem", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}
                  >
                    Add Class
                  </button>
                </div>
              </div>

              {/* Month label strip */}
              <div style={{ background: "#f3f4f6", border: `1px solid ${BORDER_COLOR}`, borderRadius: 8, padding: "0.5rem", textAlign: "center", color: TEXT_DARK, fontWeight: 600, marginBottom: 8 }}>
                {monthLabel(calendarDate)}
              </div>

              {/* Calendar */}
              {calendarView === "month" ? (
                <div style={{ border: `1px solid ${BORDER_COLOR}`, borderRadius: 8, overflow: "hidden", background: "#fff" }}>
                  {/* Week header */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", background: "#f3f4f6", borderBottom: `1px solid ${BORDER_COLOR}` }}>
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((w) => (
                      <div key={w} style={{ padding: "0.5rem", fontWeight: 600, color: TEXT_DARK, textAlign: "center" }}>{w}</div>
                    ))}
                  </div>
                  {/* Days grid */}
                  {(() => {
                    const first = startOfMonth(calendarDate);
                    const gridStart = startOfWeek(first);
                    const days = [];
                    for (let i = 0; i < 6 * 7; i++) {
                      const d = addDays(gridStart, i);
                      const inMonth = d.getMonth() === calendarDate.getMonth();
                      const isToday = isSameDay(d, today);
                      const isSelected = isSameDay(d, selectedDate);
                      days.push(
                        <div
                          key={d.toISOString()}
                          onClick={() => {
                            setSelectedDate(d);
                            // Keep in month view; user toggles to Day if needed
                          }}
                          style={{
                            borderBottom: `1px solid ${BORDER_COLOR}`,
                            borderRight: `1px solid ${BORDER_COLOR}`,
                            minHeight: 84,
                            background: isSelected ? "#e0f2fe" : inMonth ? "#fff" : "#fafafa",
                            cursor: "pointer",
                            transition: "background 120ms ease",
                          }}
                        >
                          <div style={{ padding: "0.4rem", textAlign: "right", color: inMonth ? TEXT_DARK : TEXT_LIGHT, fontWeight: 600 }}>
                            {String(d.getDate()).padStart(2, "0")}
                          </div>
                          {/* Live classes for this date */}
                          {(() => {
                            const events = Array.isArray(batch?.liveClasses) ? batch.liveClasses : [];
                            const evs = events.filter((ev) => {
                              const st = ev?.startTime ? new Date(ev.startTime) : null;
                              return st && isSameDay(st, d);
                            });
                            if (evs.length === 0) return null;
                            const maxShow = 3;
                            return (
                              <div style={{ padding: "0 6px 8px" }}>
                                {evs.slice(0, maxShow).map((ev) => (
                                  <div key={(ev._id || ev.id || ev.startTime) + "-m"} style={{
                                    fontSize: 12,
                                    background: "#eef2ff",
                                    color: "#3730a3",
                                    borderRadius: 6,
                                    padding: "2px 6px",
                                    margin: "4px 0",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }} title={ev.title || "Live Class"}>
                                    {ev.title || "Live Class"}
                                  </div>
                                ))}
                                {evs.length > maxShow && (
                                  <div style={{ fontSize: 12, color: TEXT_LIGHT, paddingLeft: 4 }}>+{evs.length - maxShow} more</div>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      );
                    }
                    return (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
                        {days}
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div style={{ border: `1px solid ${BORDER_COLOR}`, borderRadius: 8, background: "#fff", overflow: "hidden" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 1rem", borderBottom: `1px solid ${BORDER_COLOR}` }}>
                    <div style={{ fontWeight: 700, color: TEXT_DARK }}>
                      {selectedDate.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                    </div>
                    <button onClick={() => setCalendarView("month")} style={{ background: "#e5e7eb", border: `1px solid ${BORDER_COLOR}`, padding: "0.35rem 0.6rem", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>Back to Month</button>
                  </div>
                  {/* Events list for the day */}
                  {(() => {
                    const events = Array.isArray(batch?.liveClasses) ? batch.liveClasses : [];
                    const evs = events
                      .map((ev) => ({ ...ev, _st: ev?.startTime ? new Date(ev.startTime) : null }))
                      .filter((ev) => ev._st && isSameDay(ev._st, selectedDate))
                      .sort((a, b) => a._st - b._st);
                    if (evs.length === 0) return null;
                    return (
                      <div style={{ padding: "0.75rem 1rem", borderBottom: `1px solid ${BORDER_COLOR}` }}>
                        {evs.map((ev) => (
                          <div key={(ev._id || ev.id || ev.startTime) + "-d"} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                            <span style={{ fontSize: 12, color: TEXT_LIGHT, minWidth: 64 }}>
                              {ev._st.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                            <span style={{ fontSize: 14, color: TEXT_DARK, fontWeight: 600 }}>{ev.title || "Live Class"}</span>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                  {/* 24-hour grid */}
                  {(() => {
                    const hours = Array.from({ length: 24 }, (_, h) => h);
                    const now = new Date();
                    const isTodaySelected = isSameDay(selectedDate, now);
                    return (
                      <div>
                        {hours.map((h) => {
                          const highlight = isTodaySelected && now.getHours() === h;
                          return (
                            <div key={h} style={{ display: "grid", gridTemplateColumns: "80px 1fr" }}>
                              <div style={{ padding: "0.5rem", borderRight: `1px solid ${BORDER_COLOR}`, color: TEXT_LIGHT, textAlign: "right" }}>
                                {`${String(h).padStart(2, "0")}:00`}
                              </div>
                              <div style={{ minHeight: 40, borderBottom: `1px solid ${BORDER_COLOR}`, background: highlight ? "#fef3c7" : "transparent" }} />
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          {/* Create Live Class Modal */}
          {showLiveClassModal && (
            <div
              role="dialog"
              aria-modal="true"
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.45)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 60,
              }}
              onClick={closeLiveClassModal}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: "min(720px, 94vw)",
                  background: "#fff",
                  borderRadius: 12,
                  boxShadow:
                    "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
                  border: `1px solid ${BORDER_COLOR}`,
                  overflow: "hidden",
                }}
              >
                <div style={{ padding: "1rem 1.25rem", borderBottom: `1px solid ${BORDER_COLOR}` }}>
                  <h3 style={{ margin: 0, fontSize: "1rem", color: TEXT_DARK, fontWeight: 600 }}>Create Live Class</h3>
                </div>
                <div style={{ padding: "1rem 1.25rem" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", rowGap: 14, columnGap: 14 }}>
                    <label style={{ alignSelf: "center", color: TEXT_DARK, fontWeight: 600 }}>Class Title</label>
                    <input
                      value={liveTitle}
                      onChange={(e) => setLiveTitle(e.target.value)}
                      placeholder="e.g. Algebra Basics"
                      style={{ padding: "0.6rem 0.8rem", border: `1px solid ${BORDER_COLOR}`, borderRadius: 8 }}
                    />

                    <label style={{ alignSelf: "center", color: TEXT_DARK, fontWeight: 600 }}>Class Description</label>
                    <input
                      value={liveDescription}
                      onChange={(e) => setLiveDescription(e.target.value)}
                      placeholder="Short description"
                      style={{ padding: "0.6rem 0.8rem", border: `1px solid ${BORDER_COLOR}`, borderRadius: 8 }}
                    />

                    <label style={{ alignSelf: "center", color: TEXT_DARK, fontWeight: 600 }}>Class Link</label>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <input
                        value={liveLink}
                        onChange={(e) => setLiveLink(e.target.value)}
                        placeholder="Enter Class Link"
                        style={{ padding: "0.6rem 0.8rem", border: `1px solid ${BORDER_COLOR}`, borderRadius: 8, flex: 1 }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!liveDateTime) { showError("Select Class Time first"); return; }
                          const start = new Date(liveDateTime);
                          if (isNaN(start.getTime())) { showError("Invalid Class Time"); return; }
                          const end = new Date(start.getTime() + 60 * 60 * 1000); // default 1 hour
                          openGoogleCalendarEditor({
                            title: liveTitle || "Live Class",
                            description: liveDescription || "",
                            startISO: start.toISOString(),
                            endISO: end.toISOString(),
                            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata",
                          });
                        }}
                        style={{ background: "#0ea5e9", color: "#fff", border: "none", padding: "0.45rem 0.8rem", borderRadius: 8, cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap" }}
                      >
                        Open Google Calendar
                      </button>
                    </div>

                    <label style={{ alignSelf: "center", color: TEXT_DARK, fontWeight: 600 }}>Class Time</label>
                    <input
                      type="datetime-local"
                      value={liveDateTime}
                      onChange={(e) => setLiveDateTime(e.target.value)}
                      style={{ padding: "0.6rem 0.8rem", border: `1px solid ${BORDER_COLOR}`, borderRadius: 8 }}
                    />
                  </div>
                </div>
                <div style={{ padding: "0.75rem 1.25rem", display: "flex", justifyContent: "flex-end", borderTop: `1px solid ${BORDER_COLOR}`, gap: 8 }}>
                  <button onClick={closeLiveClassModal} style={{ backgroundColor: "#7c3aed", color: "#fff", border: "none", padding: "0.5rem 1rem", borderRadius: 8, cursor: "pointer" }}>
                    Close
                  </button>
                  <button
                    onClick={onCreateLiveClass}
                    style={{ backgroundColor: "#22c55e", color: "#fff", border: "none", padding: "0.5rem 1rem", borderRadius: 8, cursor: "pointer" }}
                  >
                    Create Class
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Courses Modal */}
          {showCourseModal && (
            <div
              role="dialog"
              aria-modal="true"
              style={{
                position: "fixed",
                inset: 0,
                marginTop: "10rem",
                marginBottom: "6rem",
                marginLeft: "120px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 60,
              }}
              onClick={closeCourseModal}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: "min(980px, 94vw)",
                  background: "#fff",
                  borderRadius: 12,
                  boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
                  border: `1px solid ${BORDER_COLOR}`,
                  marginTop: "6vh",
                  maxHeight: "86vh",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div style={{ padding: "0.75rem 1.25rem", borderBottom: `1px solid ${BORDER_COLOR}`, position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: "1rem", color: TEXT_DARK, fontWeight: 600 }}>Search Course</h3>
                  <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
                    <input
                      value={courseSearch}
                      onChange={(e) => setCourseSearch(e.target.value)}
                      placeholder="Search Course"
                      style={{ width: "min(520px, 100%)", padding: "0.6rem 0.8rem", border: `1px solid ${BORDER_COLOR}`, borderRadius: 8 }}
                    />
                  </div>
                </div>
                <div style={{ padding: "1rem 1.25rem", overflowY: "auto" }}>
                  {coursesLoading ? (
                    <div style={{ color: TEXT_LIGHT, padding: "2rem", textAlign: "center" }}>Loading courses...</div>
                  ) : coursesError ? (
                    <div style={{ color: "#ef4444", padding: "1rem", textAlign: "center" }}>{coursesError}</div>
                  ) : (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                        gap: 16,
                      }}
                    >
                      {(() => {
                        const q = courseSearch.trim().toLowerCase();
                        const data = (Array.isArray(courses) ? courses : []).filter((c) =>
                          String(c?.courseName || "").toLowerCase().includes(q)
                        );
                        if (data.length === 0) {
                          return (
                            <div style={{ gridColumn: "1 / -1", textAlign: "center", color: TEXT_LIGHT, padding: "2rem" }}>
                              No courses found
                            </div>
                          );
                        }
                        return data.map((c) => {
                          const cid = c?._id || c?.id;
                          const already = cid ? assignedCourseIds.has(cid) : false;
                          return (
                          <div
                            key={c?._id || c?.id}
                            style={{
                              border: `1px solid ${BORDER_COLOR}`,
                              borderRadius: 10,
                              overflow: "hidden",
                              background: "#fff",
                              boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
                            }}
                          >
                            {c?.thumbnail && (
                              <div style={{ height: 140, background: "#f3f4f6" }}>
                                <img src={c.thumbnail} alt={c.courseName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              </div>
                            )}
                            <div style={{ padding: 12 }}>
                              <div style={{ fontWeight: 700, color: TEXT_DARK, marginBottom: 8 }}>
                                {c?.courseName || "Untitled"}
                              </div>
                              <div style={{ fontSize: 13, color: TEXT_LIGHT, marginBottom: 8 }}>
                                {(c?.category?.name || c?.category?.title) ? `Category: ${c?.category?.name || c?.category?.title}` : ""}
                              </div>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ color: TEXT_DARK, fontWeight: 600 }}>{typeof c?.price === "number" ? `₹${c.price}` : ""}</span>
                                <div style={{ display: "flex", gap: 8 }}>
                                  {already ? (
                                    <button
                                      onClick={async () => {
                                        try {
                                          if (!cid) return;
                                          await removeCourseFromBatch(batchId, cid, token);
                                          setAssignedCourses((prev) => prev.filter((x) => (x._id || x.id) !== cid));
                                          setAssignedCourseIds((prev) => {
                                            const next = new Set(prev);
                                            next.delete(cid);
                                            return next;
                                          });
                                          showSuccess("Course removed from batch");
                                        } catch (err) {
                                          showError(err?.response?.data?.message || err?.message || "Failed to remove course");
                                        }
                                      }}
                                      style={{
                                        backgroundColor: "#ef4444",
                                        color: "#fff",
                                        border: "none",
                                        padding: "0.35rem 0.75rem",
                                        borderRadius: 6,
                                        cursor: "pointer",
                                        fontWeight: 600,
                                      }}
                                    >
                                      Remove
                                    </button>
                                  ) : (
                                    <button
                                      onClick={async () => {
                                        try {
                                          if (!cid) return;
                                          await addCourseToBatch(batchId, cid, token);
                                          setAssignedCourses((prev) => {
                                            const exists = prev.some((x) => (x._id || x.id) === cid);
                                            if (exists) return prev;
                                            return [...prev, c];
                                          });
                                          setAssignedCourseIds((prev) => new Set(prev).add(cid));
                                          showSuccess("Course added to batch");
                                        } catch (err) {
                                          showError(err?.response?.data?.message || err?.message || "Failed to add course");
                                        }
                                      }}
                                      style={{
                                        backgroundColor: "#22c55e",
                                        color: "#fff",
                                        border: "none",
                                        padding: "0.35rem 0.75rem",
                                        borderRadius: 6,
                                        cursor: "pointer",
                                        fontWeight: 600,
                                      }}
                                    >
                                      Add Course
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          );
                        });
                      })()}
                    </div>
                  )}
                </div>
                <div style={{ padding: "0.75rem 1.25rem", display: "flex", justifyContent: "flex-end", borderTop: `1px solid ${BORDER_COLOR}` }}>
                  <button onClick={closeCourseModal} style={{ backgroundColor: "#7c3aed", color: "#fff", border: "none", padding: "0.5rem 1rem", borderRadius: 8, cursor: "pointer" }}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Courses section */}
          {activeTab === "courses" && (
            <div style={{ minHeight: 300 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: TEXT_DARK, margin: 0 }}>Assigned Courses</h2>
                <button
                  onClick={openCourseModal}
                  style={{
                    backgroundColor: "#7c3aed",
                    color: "#fff",
                    border: "none",
                    padding: "0.5rem 1rem",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Add Courses
                </button>
              </div>

              {assignedCourses.length === 0 ? (
                <div style={{
                  border: `1px solid ${BORDER_COLOR}`,
                  borderRadius: 10,
                  padding: "2rem",
                  textAlign: "center",
                  color: TEXT_LIGHT,
                  background: "#fff",
                }}>
                  No courses assigned yet.
                  <div>
                    <button onClick={openCourseModal} style={{ marginTop: 12, backgroundColor: "#22c55e", color: "#fff", border: "none", padding: "0.5rem 0.9rem", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>Assign Courses</button>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                    gap: 16,
                  }}
                >
                  {assignedCourses.map((c) => {
                    const cid = c?._id || c?.id;
                    return (
                      <div
                        key={cid}
                        style={{
                          border: `1px solid ${BORDER_COLOR}`,
                          borderRadius: 10,
                          overflow: "hidden",
                          background: "#fff",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
                        }}
                      >
                        {c?.thumbnail && (
                          <div style={{ height: 140, background: "#f3f4f6" }}>
                            <img src={c.thumbnail} alt={c.courseName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          </div>
                        )}
                        <div style={{ padding: 12 }}>
                          <div style={{ fontWeight: 700, color: TEXT_DARK, marginBottom: 8 }}>
                            {c?.courseName || "Untitled"}
                          </div>
                          <div style={{ fontSize: 13, color: TEXT_LIGHT, marginBottom: 8 }}>
                            {(c?.category?.name || c?.category?.title) ? `Category: ${c?.category?.name || c?.category?.title}` : ""}
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ color: TEXT_DARK, fontWeight: 600 }}>{typeof c?.price === "number" ? `₹${c.price}` : ""}</span>
                            <button
                              onClick={async () => {
                                try {
                                  if (!cid) return;
                                  await removeCourseFromBatch(batchId, cid, token);
                                  setAssignedCourses((prev) => prev.filter((x) => (x._id || x.id) !== cid));
                                  setAssignedCourseIds((prev) => {
                                    const next = new Set(prev);
                                    next.delete(cid);
                                    return next;
                                  });
                                  showSuccess("Course removed from batch");
                                } catch (err) {
                                  showError(err?.response?.data?.message || err?.message || "Failed to remove course");
                                }
                              }}
                              style={{
                                backgroundColor: "#ef4444",
                                color: "#fff",
                                border: "none",
                                padding: "0.35rem 0.75rem",
                                borderRadius: 6,
                                cursor: "pointer",
                                fontWeight: 600,
                              }}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Reviews section (single render) */}
          {activeTab === "reviews" && (
            <div style={{ minHeight: 300 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <h3 style={{ margin: 0, color: TEXT_DARK }}>Reviews</h3>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    onClick={() => {
                      const rows = Array.isArray(studentReviews) ? studentReviews : [];
                      if (rows.length === 0) { showError("No student reviews to download"); return; }
                      const header = ["Student","Email","Course","Review"]; 
                      const csv = [header.join(","), ...rows.map(r => [r.studentName||"", r.email||"", r.courseTitle||"", (r.review||"").replaceAll('\n',' ').replaceAll('"','""')].map(x => `"${x}"`).join(","))].join("\n");
                      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `student-reviews-${batchId}.csv`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }}
                    style={{ background: "#2563eb", color: "#fff", border: "none", padding: "0.45rem 0.9rem", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}
                  >
                    Download Student Reviews
                  </button>
                  <button
                    onClick={() => {
                      const rows = Array.isArray(adminReviews) ? adminReviews : [];
                      if (rows.length === 0) { showError("No admin reviews to download"); return; }
                      const header = ["Admin","Email","Course","Rating","Review"]; 
                      const csv = [header.join(","), ...rows.map(r => [r.adminName||"Admin", r.email||"", r.courseTitle||"", String(r.rating ?? ""), (r.review||"").replaceAll('\n',' ').replaceAll('"','""')].map(x => `"${x}"`).join(","))].join("\n");
                      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `admin-reviews-${batchId}.csv`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }}
                    style={{ background: "#0ea5e9", color: "#fff", border: "none", padding: "0.45rem 0.9rem", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}
                  >
                    Download Admin Reviews
                  </button>
                </div>
              </div>

              {/* Admin review form */}
              <div style={{ border: `1px solid ${BORDER_COLOR}`, borderRadius: 8, background: "#fff", padding: "1rem", marginBottom: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", rowGap: 12, columnGap: 12 }}>
                  <label style={{ alignSelf: "center", color: TEXT_DARK, fontWeight: 600 }}>Select Course</label>
                  <select
                    value={adminReviewCourseId}
                    onChange={(e) => setAdminReviewCourseId(e.target.value)}
                    style={{ padding: "0.6rem 0.8rem", border: `1px solid ${BORDER_COLOR}`, borderRadius: 8 }}
                  >
                    <option value="">-- choose course --</option>
                    {assignedCourses.map((c) => (
                      <option key={c._id || c.id} value={c._id || c.id}>{c.title || c.name || c.courseName || "Course"}</option>
                    ))}
                  </select>

                  <label style={{ alignSelf: "center", color: TEXT_DARK, fontWeight: 600 }}>Rating (1-5)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={adminReviewRating}
                    onChange={(e) => setAdminReviewRating(Number(e.target.value))}
                    style={{ padding: "0.6rem 0.8rem", border: `1px solid ${BORDER_COLOR}`, borderRadius: 8, width: 120 }}
                  />

                  <label style={{ alignSelf: "start", color: TEXT_DARK, fontWeight: 600, paddingTop: 6 }}>Admin Review</label>
                  <textarea
                    value={adminReviewText}
                    onChange={(e) => setAdminReviewText(e.target.value)}
                    rows={3}
                    style={{ padding: "0.6rem 0.8rem", border: `1px solid ${BORDER_COLOR}`, borderRadius: 8, resize: "vertical" }}
                  />
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
                  <button
                    onClick={async () => {
                      if (!adminReviewCourseId) { showError("Please select a course"); return; }
                      const text = (adminReviewText || "").trim();
                      if (!text) { showError("Please enter a review"); return; }
                      const r = Number(adminReviewRating);
                      if (!Number.isFinite(r) || r < 1 || r > 5) { showError("Rating must be between 1 and 5"); return; }
                      try {
                        const created = await createAdminReview({ courseId: adminReviewCourseId, rating: r, review: text }, token);
                        const course = assignedCourses.find(c => (c._id || c.id) === adminReviewCourseId);
                        setAdminReviews((prev) => [
                          { _id: created?._id, courseId: adminReviewCourseId, adminName: `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || (user?.name || "Admin"), email: user?.email || "admin@site", courseTitle: course?.title || course?.name || course?.courseName || "Course", review: text, rating: r },
                          ...prev,
                        ]);
                        setAdminReviewText("");
                        showSuccess("Review added");
                      } catch (e) {
                        showError(e?.response?.data?.message || e?.message || "Failed to submit review");
                      }
                    }}
                    style={{ backgroundColor: "#22c55e", color: "#fff", border: "none", padding: "0.5rem 1rem", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}
                  >
                    Add Review
                  </button>
                </div>
              </div>

              {/* Admin Reviews table */}
              <div style={{ background: "#fff", border: `1px solid ${BORDER_COLOR}`, borderRadius: 8, overflow: "hidden", marginBottom: 12 }}>
                <div style={{ padding: "0.75rem 1rem", borderBottom: `1px solid ${BORDER_COLOR}`, color: TEXT_DARK, fontWeight: 700 }}>Admin Reviews</div>
                {adminReviews.length === 0 ? (
                  <div style={{ padding: "1rem", color: TEXT_LIGHT }}>No admin reviews.</div>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ background: "#f9fafb" }}>
                          <th style={{ textAlign: "left", padding: "0.5rem", borderBottom: `1px solid ${BORDER_COLOR}`, color: TEXT_LIGHT }}>Admin</th>
                          <th style={{ textAlign: "left", padding: "0.5rem", borderBottom: `1px solid ${BORDER_COLOR}`, color: TEXT_LIGHT }}>Email</th>
                          <th style={{ textAlign: "left", padding: "0.5rem", borderBottom: `1px solid ${BORDER_COLOR}`, color: TEXT_LIGHT }}>Course</th>
                          <th style={{ textAlign: "left", padding: "0.5rem", borderBottom: `1px solid ${BORDER_COLOR}`, color: TEXT_LIGHT }}>Rating</th>
                          <th style={{ textAlign: "left", padding: "0.5rem", borderBottom: `1px solid ${BORDER_COLOR}`, color: TEXT_LIGHT }}>Review</th>
                          <th style={{ textAlign: "left", padding: "0.5rem", borderBottom: `1px solid ${BORDER_COLOR}`, color: TEXT_LIGHT }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminReviews.map((r, idx) => (
                          <tr key={r._id || idx}>
                            <td style={{ padding: "0.5rem", borderBottom: `1px solid ${BORDER_COLOR}` }}>{r.adminName || "Admin"}</td>
                            <td style={{ padding: "0.5rem", borderBottom: `1px solid ${BORDER_COLOR}` }}>{r.email || "-"}</td>
                            <td style={{ padding: "0.5rem", borderBottom: `1px solid ${BORDER_COLOR}` }}>{r.courseTitle || "-"}</td>
                            <td style={{ padding: "0.5rem", borderBottom: `1px solid ${BORDER_COLOR}` }}>{r.rating ?? "-"}</td>
                            <td style={{ padding: "0.5rem", borderBottom: `1px solid ${BORDER_COLOR}` }}>{r.review || "-"}</td>
                            <td style={{ padding: "0.5rem", borderBottom: `1px solid ${BORDER_COLOR}` }}>
                              {r._id ? (
                                <button
                                  onClick={async () => {
                                    const ok = window.confirm("Remove this review?");
                                    if (!ok) return;
                                    const success = await deleteAdminReview(r._id, token);
                                    if (success) {
                                      setAdminReviews((prev) => prev.filter((x) => (x._id || x.id) !== r._id));
                                      showSuccess("Review removed");
                                    }
                                  }}
                                  style={{ background: "#ef4444", color: "#fff", border: "none", padding: "0.35rem 0.6rem", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}
                                >
                                  Remove
                                </button>
                              ) : (
                                <span style={{ color: TEXT_LIGHT }}>—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Student Reviews table */}
              <div style={{ background: "#fff", border: `1px solid ${BORDER_COLOR}`, borderRadius: 8, overflow: "hidden" }}>
                <div style={{ padding: "0.75rem 1rem", borderBottom: `1px solid ${BORDER_COLOR}`, color: TEXT_DARK, fontWeight: 700 }}>Student Reviews</div>
                {studentReviews.length === 0 ? (
                  <div style={{ padding: "1rem", color: TEXT_LIGHT }}>No student reviews.</div>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ background: "#f9fafb" }}>
                          <th style={{ textAlign: "left", padding: "0.5rem", borderBottom: `1px solid ${BORDER_COLOR}`, color: TEXT_LIGHT }}>Student</th>
                          <th style={{ textAlign: "left", padding: "0.5rem", borderBottom: `1px solid ${BORDER_COLOR}`, color: TEXT_LIGHT }}>Email</th>
                          <th style={{ textAlign: "left", padding: "0.5rem", borderBottom: `1px solid ${BORDER_COLOR}`, color: TEXT_LIGHT }}>Course</th>
                          <th style={{ textAlign: "left", padding: "0.5rem", borderBottom: `1px solid ${BORDER_COLOR}`, color: TEXT_LIGHT }}>Review</th>
                          <th style={{ textAlign: "left", padding: "0.5rem", borderBottom: `1px solid ${BORDER_COLOR}`, color: TEXT_LIGHT }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentReviews.map((r, idx) => (
                          <tr key={r._id || idx}>
                            <td style={{ padding: "0.5rem", borderBottom: `1px solid ${BORDER_COLOR}` }}>{r.studentName || "-"}</td>
                            <td style={{ padding: "0.5rem", borderBottom: `1px solid ${BORDER_COLOR}` }}>{r.email || "-"}</td>
                            <td style={{ padding: "0.5rem", borderBottom: `1px solid ${BORDER_COLOR}` }}>{r.courseTitle || "-"}</td>
                            <td style={{ padding: "0.5rem", borderBottom: `1px solid ${BORDER_COLOR}` }}>{r.review || "-"}</td>
                            <td style={{ padding: "0.5rem", borderBottom: `1px solid ${BORDER_COLOR}` }}>
                              {r._id ? (
                                <button
                                  onClick={async () => {
                                    const ok = window.confirm("Remove this review?");
                                    if (!ok) return;
                                    const success = await deleteAdminReview(r._id, token);
                                    if (success) {
                                      setStudentReviews((prev) => prev.filter((x) => (x._id || x.id) !== r._id));
                                      showSuccess("Review removed");
                                    }
                                  }}
                                  style={{ background: "#ef4444", color: "#fff", border: "none", padding: "0.35rem 0.6rem", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}
                                >
                                  Remove
                                </button>
                              ) : (
                                <span style={{ color: TEXT_LIGHT }}>—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Add Student Modal */}
          {showStudentModal && (
            <div
              role="dialog"
              aria-modal="true"
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.45)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 50,
              }}
              onClick={() => setShowStudentModal(false)}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: "min(920px, 92vw)",
                  background: "#fff",
                  borderRadius: 12,
                  boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
                  border: `1px solid ${BORDER_COLOR}`,
                  overflow: "hidden",
                }}
              >
                <div style={{ padding: "1rem 1.25rem", borderBottom: `1px solid ${BORDER_COLOR}` }}>
                  <h3 style={{ margin: 0, fontSize: "1rem", color: TEXT_DARK, fontWeight: 600 }}>Add Students</h3>
                </div>
                <div style={{ padding: "1rem 1.25rem" }}>
                  <h2 style={{ textAlign: "center", marginTop: 0, marginBottom: 16, fontSize: "1.5rem", fontWeight: 700, color: TEXT_DARK }}>
                    All Students
                  </h2>

                  {/* Search */}
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
                    <input
                      value={studentSearch}
                      onChange={(e) => { setStudentSearch(e.target.value); setPickPageIndex(0); }}
                      placeholder="Search Student"
                      style={{ width: "min(520px, 90%)", padding: "0.6rem 0.8rem", border: `1px solid ${BORDER_COLOR}`, borderRadius: 8 }}
                    />
                  </div>

                  {studentModalLoading ? (
                    <div style={{ color: TEXT_LIGHT, padding: "2rem", textAlign: "center" }}>Loading students...</div>
                  ) : studentModalError ? (
                    <div style={{ color: "#ef4444", padding: "1rem", textAlign: "center" }}>{studentModalError}</div>
                  ) : (
                    <>
                      <div
                        style={{
                          border: `1px solid ${BORDER_COLOR}`,
                          borderRadius: 8,
                          overflow: "hidden",
                        }}
                      >
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                          <thead style={{ backgroundColor: "#f9fafb", textAlign: "left" }}>
                            <tr>
                              <th style={{ padding: "0.75rem", borderBottom: `1px solid ${BORDER_COLOR}` }}>ID</th>
                              <th style={{ padding: "0.75rem", borderBottom: `1px solid ${BORDER_COLOR}` }}>Full name</th>
                              <th style={{ padding: "0.75rem", borderBottom: `1px solid ${BORDER_COLOR}` }}>Email</th>
                              <th style={{ padding: "0.75rem", borderBottom: `1px solid ${BORDER_COLOR}` }}>Mobile</th>
                              <th style={{ padding: "0.75rem", borderBottom: `1px solid ${BORDER_COLOR}` }}>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(() => {
                              const q = studentSearch.trim().toLowerCase();
                              let data = Array.isArray(allStudents) ? allStudents : [];
                              if (q) {
                                data = data.filter((u) => {
                                  const name = u.name || [u.firstName, u.lastName].filter(Boolean).join(" ") || "";
                                  const email = u.email || "";
                                  const phone = u.phone || u.mobile || u.contactNumber || "";
                                  return (
                                    String(name).toLowerCase().includes(q) ||
                                    String(email).toLowerCase().includes(q) ||
                                    String(phone).toLowerCase().includes(q)
                                  );
                                });
                              }
                              const total = data.length;
                              const page = data.slice(pickPageIndex * pickRowsPerPage, pickPageIndex * pickRowsPerPage + pickRowsPerPage);
                              return page.length === 0 ? (
                                <tr>
                                  <td colSpan={5} style={{ textAlign: "center", padding: "2rem", color: TEXT_LIGHT }}>No students</td>
                                </tr>
                              ) : (
                                page.map((u) => {
                                  const id = u._id || u.id || u.userId || "—";
                                  const name = u.name || [u.firstName, u.lastName].filter(Boolean).join(" ") || "—";
                                  const email = u.email || "—";
                                  const phone = u.phone || u.mobile || u.contactNumber || "—";
                                  const already = students.some((s) => (s._id || s.id || s.userId) === (u._id || u.id || u.userId));
                                  return (
                                    <tr key={`${id}-${email}`} style={{ borderBottom: `1px solid ${BORDER_COLOR}` }}>
                                      <td style={{ padding: "0.75rem" }}>{String(id).slice(-6)}</td>
                                      <td style={{ padding: "0.75rem" }}>{name}</td>
                                      <td style={{ padding: "0.75rem" }}>{email}</td>
                                      <td style={{ padding: "0.75rem" }}>{phone}</td>
                                      <td style={{ padding: "0.75rem" }}>
                                        <button
                                          disabled={already}
                                          onClick={async () => {
                                            if (already) return;
                                            try {
                                              const sid = u._id || u.id || u.userId;
                                              if (!sid) throw new Error("Invalid student id");
                                              await addStudentToBatch(batchId, sid, token);
                                              setStudents((prev) => {
                                                const exists = prev.some((p) => (p._id || p.id || p.userId) === sid);
                                                if (exists) return prev;
                                                return [...prev, u];
                                              });
                                              showSuccess("Student assigned to batch");
                                            } catch (err) {
                                              showError(err?.response?.data?.message || err?.message || "Failed to add student");
                                            }
                                          }}
                                          style={{
                                            backgroundColor: already ? "#9ca3af" : "#22c55e",
                                            color: "#fff",
                                            border: "none",
                                            padding: "0.25rem 0.75rem",
                                            borderRadius: 6,
                                            cursor: already ? "not-allowed" : "pointer",
                                            fontWeight: 600,
                                          }}
                                        >
                                          {already ? "Added" : "Add"}
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })
                              );
                            })()}
                          </tbody>
                        </table>

                        {/* Pagination footer */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.5rem 0.75rem", borderTop: `1px solid ${BORDER_COLOR}` }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ color: TEXT_LIGHT }}>Rows per page:</span>
                            <select value={pickRowsPerPage} onChange={(e) => { setPickRowsPerPage(Number(e.target.value)); setPickPageIndex(0); }} style={{ padding: "0.25rem 0.5rem", borderRadius: 6, border: `1px solid ${BORDER_COLOR}` }}>
                              <option value={5}>5</option>
                              <option value={10}>10</option>
                              <option value={20}>20</option>
                            </select>
                          </div>
                          <div style={{ color: TEXT_LIGHT }}>
                            {(() => {
                              const q = studentSearch.trim().toLowerCase();
                              let data = Array.isArray(allStudents) ? allStudents : [];
                              if (q) {
                                data = data.filter((u) => {
                                  const name = u.name || [u.firstName, u.lastName].filter(Boolean).join(" ") || "";
                                  const email = u.email || "";
                                  const phone = u.phone || u.mobile || u.contactNumber || "";
                                  return (
                                    String(name).toLowerCase().includes(q) ||
                                    String(email).toLowerCase().includes(q) ||
                                    String(phone).toLowerCase().includes(q)
                                  );
                                });
                              }
                              const total = data.length;
                              const start = total ? pickPageIndex * pickRowsPerPage + 1 : 0;
                              const end = Math.min((pickPageIndex + 1) * pickRowsPerPage, total);
                              return (
                                <>
                                  {start}-{end} of {total}
                                </>
                              );
                            })()}
                          </div>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={() => setPickPageIndex((p) => Math.max(0, p - 1))} style={{ padding: "0.25rem 0.5rem", borderRadius: 6, border: `1px solid ${BORDER_COLOR}`, background: "#fff", cursor: "pointer" }}>&lt;</button>
                            <button onClick={() => setPickPageIndex((p) => (p + 1) * pickRowsPerPage < ((studentSearch?allStudents.filter((u)=>{const name=u.name||[u.firstName,u.lastName].filter(Boolean).join(" ")||"";const email=u.email||"";const phone=u.phone||u.mobile||u.contactNumber||"";return name.toLowerCase().includes(studentSearch.toLowerCase())||email.toLowerCase().includes(studentSearch.toLowerCase())||String(phone).toLowerCase().includes(studentSearch.toLowerCase());}):allStudents).length) ? p + 1 : p)} style={{ padding: "0.25rem 0.5rem", borderRadius: 6, border: `1px solid ${BORDER_COLOR}`, background: "#fff", cursor: "pointer" }}>&gt;</button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <div style={{ padding: "0.75rem 1.25rem", display: "flex", justifyContent: "flex-end", borderTop: `1px solid ${BORDER_COLOR}` }}>
                  <button onClick={() => setShowStudentModal(false)} style={{ backgroundColor: "#7c3aed", color: "#fff", border: "none", padding: "0.5rem 1rem", borderRadius: 8, cursor: "pointer" }}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Student section */}
          {activeTab === "student" && (
            <div style={{ minHeight: 300 }}>
              {/* Header row with title and actions */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: TEXT_DARK, margin: 0, width: "100%", textAlign: "center" }}>
                  Assign To Student
                </h2>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <button
                  onClick={onDownloadAllStudents}
                  style={{
                    backgroundColor: "#0ea5e9", // sky blue
                    color: "#fff",
                    padding: "0.5rem 1rem",
                    borderRadius: 6,
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Download All Student File
                </button>

                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <button
                    onClick={onAddStudent}
                    style={{
                      backgroundColor: "#7c3aed", // purple
                      color: "#fff",
                      padding: "0.5rem 1rem",
                      borderRadius: 6,
                      border: "none",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    Add Student
                  </button>
                  <button
                    onClick={onRemoveAllStudents}
                    style={{
                      backgroundColor: "#ef4444", // red
                      color: "#fff",
                      padding: "0.5rem 1rem",
                      borderRadius: 6,
                      border: "none",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    Remove All Student
                  </button>
                </div>
              </div>

              {/* Table */}
              <div
                style={{
                  border: `1px solid ${BORDER_COLOR}`,
                  borderRadius: 8,
                  overflow: "hidden",
                }}
              >
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead style={{ backgroundColor: "#f9fafb", textAlign: "left" }}>
                    <tr>
                      <th style={{ padding: "0.75rem", borderBottom: `1px solid ${BORDER_COLOR}` }}>
                        <input type="checkbox" onChange={toggleSelectAllStudents} />
                      </th>
                      <th style={{ padding: "0.75rem", borderBottom: `1px solid ${BORDER_COLOR}` }}>ID</th>
                      <th style={{ padding: "0.75rem", borderBottom: `1px solid ${BORDER_COLOR}` }}>Full name</th>
                      <th style={{ padding: "0.75rem", borderBottom: `1px solid ${BORDER_COLOR}` }}>Email</th>
                      <th style={{ padding: "0.75rem", borderBottom: `1px solid ${BORDER_COLOR}` }}>Mobile</th>
                      <th style={{ padding: "0.75rem", borderBottom: `1px solid ${BORDER_COLOR}` }}>Assessment</th>
                      <th style={{ padding: "0.75rem", borderBottom: `1px solid ${BORDER_COLOR}` }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: "center", padding: "2rem", color: TEXT_LIGHT }}>
                          No rows
                        </td>
                      </tr>
                    ) : (
                      students
                        .slice(studentPageIndex * studentRowsPerPage, studentPageIndex * studentRowsPerPage + studentRowsPerPage)
                        .map((stu) => {
                          const id = stu._id || stu.id || "—";
                          const name = stu.name || [stu.firstName, stu.lastName].filter(Boolean).join(" ") || "—";
                          const email = stu.email || "—";
                          const phone = stu.phone || stu.mobile || stu.contactNumber || "—";
                          const checked = selectedStudentIds.has(stu._id || stu.id);
                          return (
                            <tr key={id} style={{ borderBottom: `1px solid ${BORDER_COLOR}` }}>
                              <td style={{ padding: "0.75rem" }}>
                                <input type="checkbox" checked={checked} onChange={() => toggleSelectStudent(stu._id || stu.id)} />
                              </td>
                              <td style={{ padding: "0.75rem" }}>{String(id).slice(-6)}</td>
                              <td style={{ padding: "0.75rem" }}>{name}</td>
                              <td style={{ padding: "0.75rem" }}>{email}</td>
                              <td style={{ padding: "0.75rem" }}>{phone}</td>
                              <td style={{ padding: "0.75rem" }}>/0</td>
                              <td style={{ padding: "0.75rem" }}>
                                <button
                                  onClick={() => removeStudent(stu._id || stu.id || stu.userId)}
                                  style={{
                                    backgroundColor: "#ef4444",
                                    color: "#fff",
                                    border: "none",
                                    padding: "0.25rem 0.75rem",
                                    borderRadius: 6,
                                    cursor: "pointer",
                                    fontWeight: 600,
                                  }}
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          );
                        })
                    )}
                  </tbody>
                </table>

                {/* Pagination footer */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.5rem 0.75rem", borderTop: `1px solid ${BORDER_COLOR}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: TEXT_LIGHT }}>Rows per page:</span>
                    <select value={studentRowsPerPage} onChange={(e) => { setStudentRowsPerPage(Number(e.target.value)); setStudentPageIndex(0); }} style={{ padding: "0.25rem 0.5rem", borderRadius: 6, border: `1px solid ${BORDER_COLOR}` }}>
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                    </select>
                  </div>
                  <div style={{ color: TEXT_LIGHT }}>
                    {students.length > 0 && (
                      <>
                        {studentPageIndex * studentRowsPerPage + 1}-{Math.min((studentPageIndex + 1) * studentRowsPerPage, students.length)} of {students.length}
                      </>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => setStudentPageIndex((p) => Math.max(0, p - 1))} style={{ padding: "0.25rem 0.5rem", borderRadius: 6, border: `1px solid ${BORDER_COLOR}`, background: "#fff", cursor: "pointer" }}>&lt;</button>
                    <button onClick={() => setStudentPageIndex((p) => (p + 1) * studentRowsPerPage < students.length ? p + 1 : p)} style={{ padding: "0.25rem 0.5rem", borderRadius: 6, border: `1px solid ${BORDER_COLOR}`, background: "#fff", cursor: "pointer" }}>&gt;</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Basic Info section */}
          {activeTab === "info" && (
            <div style={{ minHeight: 80 }}>
              {loading ? (
                <div style={{ color: TEXT_LIGHT }}>Loading batch details...</div>
              ) : error ? (
                <div style={{ color: "#ef4444" }}>{error}</div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                  <div>
                    <div style={{ fontWeight: 600, color: TEXT_DARK, marginBottom: 6 }}>Batch Name</div>
                    {isEditing ? (
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter batch name"
                        style={{
                          width: "100%",
                          padding: "0.5rem 0.75rem",
                          border: `1px solid ${BORDER_COLOR}`,
                          borderRadius: 8,
                          color: TEXT_DARK,
                        }}
                      />
                    ) : (
                      <div style={{ color: TEXT_DARK }}>{batch?.name || "—"}</div>
                    )}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: TEXT_DARK, marginBottom: 6 }}>Department Name</div>
                    {isEditing ? (
                      <input
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        placeholder="Enter department name"
                        style={{
                          width: "100%",
                          padding: "0.5rem 0.75rem",
                          border: `1px solid ${BORDER_COLOR}`,
                          borderRadius: 8,
                          color: TEXT_DARK,
                        }}
                      />
                    ) : (
                      <div style={{ color: TEXT_DARK }}>{batch?.department || "—"}</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab !== "info" && activeTab !== "trainer" && activeTab !== "student" && (
            <div style={{ color: TEXT_LIGHT }}>
              Placeholder for "{TABS.find((t) => t.key === activeTab)?.label}" content.
            </div>
          )}


          {/* Trainer section */}
{activeTab === "trainer" && (
  <div style={{ minHeight: 300 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
      <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: TEXT_DARK }}>
        Assign to Trainer
      </h2>
      <div style={{ display: "flex", gap: "1rem" }}>
        <button
          onClick={openInstructorModal}
          style={{
            backgroundColor: "#7c3aed", // purple
            color: "#fff",
            padding: "0.5rem 1rem",
            borderRadius: 6,
            border: "none",
            cursor: "pointer",
          }}
        >
          Add Instructor
        </button>
        <button
          onClick={clearAllInstructors}
          style={{
            backgroundColor: "#ef4444", // red
            color: "#fff",
            padding: "0.5rem 1rem",
            borderRadius: 6,
            border: "none",
            cursor: "pointer",
          }}
        >
          Remove All Trainer
        </button>
      </div>
    </div>

    {/* Table */}
    <div
      style={{
        border: `1px solid ${BORDER_COLOR}`,
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead style={{ backgroundColor: "#f9fafb", textAlign: "left" }}>
          <tr>
            <th style={{ padding: "0.75rem", borderBottom: `1px solid ${BORDER_COLOR}` }}>ID</th>
            <th style={{ padding: "0.75rem", borderBottom: `1px solid ${BORDER_COLOR}` }}>Name</th>
            <th style={{ padding: "0.75rem", borderBottom: `1px solid ${BORDER_COLOR}` }}>Email</th>
            <th style={{ padding: "0.75rem", borderBottom: `1px solid ${BORDER_COLOR}` }}>Mobile No.</th>
            <th style={{ padding: "0.75rem", borderBottom: `1px solid ${BORDER_COLOR}` }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {assignedInstructors.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ textAlign: "center", padding: "2rem", color: TEXT_LIGHT }}>
                No rows
              </td>
            </tr>
          ) : (
            assignedInstructors.map((ins) => {
              const id = ins._id || ins.id || ins.userId || "—";
              const name = ins.name || [ins.firstName, ins.lastName].filter(Boolean).join(" ") || "—";
              const email = ins.email || ins.mail || ins.contactEmail || "—";
              const phone = ins.phone || ins.mobile || ins.contactNumber || ins.number || "—";
              return (
                <tr key={id} style={{ borderBottom: `1px solid ${BORDER_COLOR}` }}>
                  <td style={{ padding: "0.75rem" }}>{String(id).slice(-6)}</td>
                  <td style={{ padding: "0.75rem" }}>{name}</td>
                  <td style={{ padding: "0.75rem" }}>{email}</td>
                  <td style={{ padding: "0.75rem" }}>{phone}</td>
                  <td style={{ padding: "0.75rem" }}>
                    <button
                      onClick={() => removeInstructorFromBatch(ins._id || ins.id || ins.userId)}
                      style={{
                        backgroundColor: "#ef4444",
                        color: "#fff",
                        border: "none",
                        padding: "0.25rem 0.75rem",
                        borderRadius: 6,
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  </div>
)}

          {/* Add Instructor Modal */}
          {showInstructorModal && (
            <div
              role="dialog"
              aria-modal="true"
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.45)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 50,
              }}
              onClick={closeInstructorModal}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: "min(920px, 92vw)",
                  background: "#fff",
                  borderRadius: 12,
                  boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
                  border: `1px solid ${BORDER_COLOR}`,
                  overflow: "hidden",
                }}
              >
                <div style={{ padding: "1rem 1.25rem", borderBottom: `1px solid ${BORDER_COLOR}` }}>
                  <h3 style={{ margin: 0, fontSize: "1rem", color: TEXT_DARK, fontWeight: 600 }}>Add Trainer</h3>
                </div>
                <div style={{ padding: "1rem 1.25rem" }}>
                  <h2 style={{ textAlign: "center", marginTop: 0, marginBottom: 16, fontSize: "1.5rem", fontWeight: 700, color: TEXT_DARK }}>
                    All Trainers
                  </h2>

                  {instructorsLoading ? (
                    <div style={{ color: TEXT_LIGHT, padding: "2rem", textAlign: "center" }}>Loading instructors...</div>
                  ) : instructorsError ? (
                    <div style={{ color: "#ef4444", padding: "1rem", textAlign: "center" }}>{instructorsError}</div>
                  ) : (
                    <>
                      <div
                        style={{
                          border: `1px solid ${BORDER_COLOR}`,
                          borderRadius: 8,
                          overflow: "hidden",
                        }}
                      >
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                          <thead style={{ backgroundColor: "#f9fafb", textAlign: "left" }}>
                            <tr>
                              <th style={{ padding: "0.75rem", borderBottom: `1px solid ${BORDER_COLOR}` }}>ID</th>
                              <th style={{ padding: "0.75rem", borderBottom: `1px solid ${BORDER_COLOR}` }}>Name</th>
                              <th style={{ padding: "0.75rem", borderBottom: `1px solid ${BORDER_COLOR}` }}>Email</th>
                              <th style={{ padding: "0.75rem", borderBottom: `1px solid ${BORDER_COLOR}` }}>Number</th>
                              <th style={{ padding: "0.75rem", borderBottom: `1px solid ${BORDER_COLOR}` }}>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {instructors.length === 0 ? (
                              <tr>
                                <td colSpan={5} style={{ textAlign: "center", padding: "2rem", color: TEXT_LIGHT }}>No trainers</td>
                              </tr>
                            ) : (
                              instructors
                                .slice(pageIndex * rowsPerPage, pageIndex * rowsPerPage + rowsPerPage)
                                .map((ins, idx) => {
                                  const id = ins.id || ins._id || ins.userId || "—";
                                  const name = ins.name || [ins.firstName, ins.lastName].filter(Boolean).join(" ") || "—";
                                  const email = ins.email || ins.mail || ins.contactEmail || "—";
                                  const phone = ins.phone || ins.mobile || ins.contactNumber || ins.number || "—";
                                  return (
                                    <tr key={id} style={{ borderBottom: `1px solid ${BORDER_COLOR}` }}>
                                      <td style={{ padding: "0.75rem" }}>{String(id).slice(-6)}</td>
                                      <td style={{ padding: "0.75rem" }}>{name}</td>
                                      <td style={{ padding: "0.75rem" }}>{email}</td>
                                      <td style={{ padding: "0.75rem" }}>{phone}</td>
                                      <td style={{ padding: "0.75rem" }}>
                                        <button
                                          onClick={() => addInstructorToBatch(ins)}
                                          style={{
                                            backgroundColor: "#22c55e",
                                            color: "#fff",
                                            border: "none",
                                            padding: "0.25rem 0.75rem",
                                            borderRadius: 6,
                                            cursor: "pointer",
                                            fontWeight: 600,
                                          }}
                                        >
                                          Add
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })
                            )}
                          </tbody>
                        </table>
                        {/* Pagination footer */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.5rem 0.75rem", borderTop: `1px solid ${BORDER_COLOR}` }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ color: TEXT_LIGHT }}>Rows per page:</span>
                            <select value={rowsPerPage} onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPageIndex(0); }} style={{ padding: "0.25rem 0.5rem", borderRadius: 6, border: `1px solid ${BORDER_COLOR}` }}>
                              <option value={5}>5</option>
                              <option value={10}>10</option>
                              <option value={20}>20</option>
                            </select>
                          </div>
                          <div style={{ color: TEXT_LIGHT }}>
                            {instructors.length > 0 && (
                              <>
                                {pageIndex * rowsPerPage + 1}-{Math.min((pageIndex + 1) * rowsPerPage, instructors.length)} of {instructors.length}
                              </>
                            )}
                          </div>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={() => setPageIndex((p) => Math.max(0, p - 1))} style={{ padding: "0.25rem 0.5rem", borderRadius: 6, border: `1px solid ${BORDER_COLOR}`, background: "#fff", cursor: "pointer" }}>&lt;</button>
                            <button onClick={() => setPageIndex((p) => (p + 1) * rowsPerPage < instructors.length ? p + 1 : p)} style={{ padding: "0.25rem 0.5rem", borderRadius: 6, border: `1px solid ${BORDER_COLOR}`, background: "#fff", cursor: "pointer" }}>&gt;</button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <div style={{ padding: "0.75rem 1.25rem", display: "flex", justifyContent: "flex-end", borderTop: `1px solid ${BORDER_COLOR}` }}>
                  <button onClick={closeInstructorModal} style={{ backgroundColor: "#7c3aed", color: "#fff", border: "none", padding: "0.5rem 1rem", borderRadius: 8, cursor: "pointer" }}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Footer actions (Info tab only) */}
          {activeTab === "info" && (
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "0.75rem",
                marginTop: "2rem",
              }}
            >
              {isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    style={{
                      backgroundColor: "#6b7280",
                      color: "white",
                      padding: "0.5rem 1rem",
                      borderRadius: 8,
                      border: "none",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onSave}
                    style={{
                      backgroundColor: ED_TEAL,
                      color: "white",
                      padding: "0.5rem 1rem",
                      borderRadius: 8,
                      border: "none",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Save
                  </button>
                </>
              ) : (
                <button
                  onClick={onEditToggle}
                  style={{
                    backgroundColor: ED_TEAL,
                    color: "white",
                    padding: "0.5rem 1rem",
                    borderRadius: 8,
                    border: "none",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Edit
                </button>
              )}
              <button
                onClick={onDelete}
                style={{
                  backgroundColor: "#ef4444",
                  color: "white",
                  padding: "0.5rem 1rem",
                  borderRadius: 8,
                  border: "none",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

