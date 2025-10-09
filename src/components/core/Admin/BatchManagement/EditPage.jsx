import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addDays, isToday } from 'date-fns';
import DashboardLayout from "../../../common/DashboardLayout";
import { getBatchById, updateBatch, deleteBatch, getAllInstructors, getRegisteredUsers, getEnrolledStudents, listBatchStudents, addStudentToBatch, removeStudentFromBatch, listBatchCourses, addCourseToBatch, removeCourseFromBatch, addLiveClassToBatch, createAdminReview, deleteAdminReview, createGoogleMeetLink, listBatchTrainers, addTrainerToBatch, removeTrainerFromBatch, listTempStudentsInBatch, addTempStudentToBatch, removeTempStudentFromBatch, listBatchTasks, createBatchTask, updateTask, deleteTask, getTaskStatuses, getTaskSummary, bulkUploadStudents } from "../../../../services/operations/adminApi";
import { admin as adminApis } from "../../../../services/apis";
import { apiConnector } from "../../../../services/apiConnector";
import { showLoading, showSuccess, showError, dismissToast } from "../../../../utils/toast";
import { getAllCourses, getAllReviews } from "../../../../services/operations/courseDetailsAPI";

// Style constants
const ED_TEAL = "#07A698";
const ED_TEAL_DARK = "#059a8c";
const ED_TEAL_LIGHT = "#e6f7f5";
const TEXT_DARK = "#1f2937";
const TEXT_LIGHT = "#6b7280";
const BG_LIGHT = "#f9fafb";
const BORDER_COLOR = "#e5e7eb";
const CARD_SHADOW = "0 1px 3px rgba(0,0,0,0.08)";
const MODAL_SHADOW = "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)";

const TABS = [
  { key: "info", label: "Info" },
  { key: "trainer", label: "Trainer" },
  { key: "student", label: "Student" },
  { key: "live", label: "Live Classes" },
  { key: "task", label: "Task" },
  { key: "performance", label: "Performance" },
];

export default function EditPage() {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state) => state.profile.user);
  const token = useSelector((state) => state.auth.token);
  const isAdmin = user?.accountType === "Admin" || user?.accountType === "SuperAdmin";

  // State variables
  const [activeTab, setActiveTab] = useState("info");
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [description, setDescription] = useState("");

  // Task tab state
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksError, setTasksError] = useState("");
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: "", description: "", dueDate: "" });
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState("");
  const [statusSummary, setStatusSummary] = useState({ total: 0, submitted: 0, completed: 0, pending: 0, graded: 0 });
  const [taskStatuses, setTaskStatuses] = useState([]);
  const [statusTaskTitle, setStatusTaskTitle] = useState("");
  const [selectedAttendanceTaskId, setSelectedAttendanceTaskId] = useState("");

  // Auto-select the first task for Attendance tab when tasks load
  useEffect(() => {
    if (!selectedAttendanceTaskId && Array.isArray(tasks) && tasks.length > 0) {
      const firstId = String(tasks[0]._id || tasks[0].id || "");
      setSelectedAttendanceTaskId(firstId);
    }
  }, [tasks]);

  // Live classes state
  const [showLiveClassModal, setShowLiveClassModal] = useState(false);
  const [liveTitle, setLiveTitle] = useState("");
  const [liveDescription, setLiveDescription] = useState("");
  const [liveLink, setLiveLink] = useState("");
  const [liveDateTime, setLiveDateTime] = useState("");
  const [liveClasses, setLiveClasses] = useState([]);
  
  // Debug liveClasses changes
  useEffect(() => {
    console.log('Live classes updated:', {
      count: liveClasses?.length || 0,
      items: liveClasses?.map(lc => {
        const date = lc.startTime ? new Date(lc.startTime) : null;
        return {
          id: lc.id || lc._id,
          title: lc.title,
          startTime: lc.startTime,
          formattedDate: date ? format(date, 'yyyy-MM-dd HH:mm') : 'Invalid date',
          dateObject: date,
          isValidDate: date && !isNaN(date.getTime())
        };
      })
    });
    
    // Log all unique dates in the events
    if (liveClasses?.length > 0) {
      const dateMap = new Map();
      liveClasses.forEach(lc => {
        if (lc.startTime) {
          const date = new Date(lc.startTime);
          if (!isNaN(date.getTime())) {
            const dateStr = format(date, 'yyyy-MM-dd');
            dateMap.set(dateStr, (dateMap.get(dateStr) || 0) + 1);
          }
        }
      });
      console.log('Unique dates in events:', Object.fromEntries(dateMap));
    }
  }, [liveClasses]);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState("month");

  // Courses state
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [coursesError, setCoursesError] = useState("");
  const [courseSearch, setCourseSearch] = useState("");
  const [assignedCourses, setAssignedCourses] = useState([]);
  const [assignedCourseIds, setAssignedCourseIds] = useState(new Set());

  // Students state
  const [students, setStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState(new Set());
  const [studentPageIndex, setStudentPageIndex] = useState(0);
  const [studentRowsPerPage, setStudentRowsPerPage] = useState(10);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [studentModalLoading, setStudentModalLoading] = useState(false);
  const [studentModalError, setStudentModalError] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [pickPageIndex, setPickPageIndex] = useState(0);
  const [pickRowsPerPage, setPickRowsPerPage] = useState(10);

  // Temp students state
  const [tempStudents, setTempStudents] = useState([]); // {_id,name,email,phone,enrollmentFeePaid}
  const [tempStudentPageIndex, setTempStudentPageIndex] = useState(0);
  const [tempStudentRowsPerPage, setTempStudentRowsPerPage] = useState(10);

  // Instructors state
  const [showInstructorModal, setShowInstructorModal] = useState(false);
  const [instructors, setInstructors] = useState([]);
  const [instructorsLoading, setInstructorsLoading] = useState(false);
  const [instructorsError, setInstructorsError] = useState("");
  const [assignedInstructors, setAssignedInstructors] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Reviews state
  const [studentReviews, setStudentReviews] = useState([]);
  const [adminReviews, setAdminReviews] = useState([]);
  const [adminReviewCourseId, setAdminReviewCourseId] = useState("");
  const [adminReviewText, setAdminReviewText] = useState("");
  const [adminReviewRating, setAdminReviewRating] = useState(5);

  // Date helpers
  const today = new Date();
  const isSameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
  const startOfWeek = (d) => {
    const date = new Date(d);
    const day = date.getDay();
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

  // Live Class helpers
  const toDateTimeLocal = (d) => {
    const pad = (n) => String(n).padStart(2, "0");
    const y = d.getFullYear();
    const m = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hh = pad(d.getHours());
    const mm = pad(d.getMinutes());
    return `${y}-${m}-${day}T${hh}:${mm}`;
  };

  // ==========================
  // Student Tab: Data & Actions
  // ==========================
  // Fetch assigned students and temp students whenever Student tab becomes active
  useEffect(() => {
    if (activeTab !== "student" || !batchId || !token) return;
    let cancelled = false;
    (async () => {
      try {
        const [persisted, temps] = await Promise.all([
          listBatchStudents(batchId, token).catch(() => []),
          listTempStudentsInBatch(batchId, token).catch(() => []),
        ]);
        if (!cancelled) setStudents(Array.isArray(persisted) ? persisted : []);
        if (!cancelled) setTempStudents(Array.isArray(temps) ? temps : []);
        if (!cancelled) {
          setSelectedStudentIds(new Set());
          setTempStudentPageIndex(0);
        }
      } catch (e) {
        if (!cancelled) {
          showError(e?.response?.data?.message || e?.message || "Failed to load batch students");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeTab, batchId, token]);

  // Load tasks when Task tab becomes active
  useEffect(() => {
    const loadTasks = async () => {
      if (!batchId || !token) return;
      setTasksLoading(true);
      setTasksError("");
      try {
        const list = await listBatchTasks(batchId, token);
        setTasks(Array.isArray(list) ? list : []);
      } catch (e) {
        const msg = e?.response?.data?.message || e?.message || "Failed to load tasks";
        setTasksError(msg);
      } finally {
        setTasksLoading(false);
      }
    };
    if (activeTab === "task" || activeTab === "performance" || activeTab === "attendance") {
      loadTasks();
    }
  }, [activeTab, batchId, token]);

  // Task tab handlers
  const openCreateTaskModal = () => {
    setTaskForm({ title: "", description: "", dueDate: "" });
    setEditingTaskId(null);
    setTaskModalOpen(true);
  };

  const openEditTaskModal = (task) => {
    setTaskForm({
      title: task?.title || "",
      description: task?.description || "",
      dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : "",
    });
    setEditingTaskId(task?._id || task?.id);
    setTaskModalOpen(true);
  };

  const handleDeleteTask = async (taskId) => {
    if (!taskId) return;
    const ok = window.confirm("Delete this task?");
    if (!ok) return;
    const toastId = showLoading("Deleting task...");
    try {
      await deleteTask(taskId, token);
      showSuccess("Task deleted");
      setTasks((prev) => prev.filter((t) => (t._id || t.id) !== taskId));
    } catch (e) {
      showError(e?.response?.data?.message || e?.message || "Failed to delete task");
    } finally {
      dismissToast(toastId);
    }
  };

  // Status controls removed
  const openStatusModal = async (task) => {
    if (!isAdmin) {
      showError("Admins only: not authorized to view task statuses");
      return;
    }
    const tId = task?._id || task?.id;
    if (!tId) return;
    setStatusTaskTitle(task?.title || "Task");
    setStatusModalOpen(true);
    setStatusLoading(true);
    setStatusError("");
    try {
      const [summary, statuses] = await Promise.all([
        getTaskSummary(tId, token).catch((e) => { throw e; }),
        getTaskStatuses(tId, token).catch((e) => { throw e; }),
      ]);
      setStatusSummary(summary || { total: 0, submitted: 0, completed: 0, pending: 0, graded: 0 });
      setTaskStatuses(Array.isArray(statuses) ? statuses : []);
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "Failed to load task statuses";
      setStatusError(msg);
    } finally {
      setStatusLoading(false);
    }
  };

  const submitTaskForm = async (e) => {
    e.preventDefault();
    const title = (taskForm.title || "").trim();
    if (!title) {
      showError("Title is required");
      return;
    }
    const payload = {
      title,
      description: (taskForm.description || "").trim(),
      dueDate: taskForm.dueDate ? new Date(taskForm.dueDate).toISOString() : undefined,
    };
    const toastId = showLoading(editingTaskId ? "Updating task..." : "Creating task...");
    try {
      if (editingTaskId) {
        await updateTask(editingTaskId, payload, token);
        showSuccess("Task updated");
      } else {
        await createBatchTask(batchId, payload, token);
        showSuccess("Task created");
      }
      setTaskModalOpen(false);
      setEditingTaskId(null);
      // refresh list
      const list = await listBatchTasks(batchId, token).catch(() => []);
      setTasks(Array.isArray(list) ? list : []);
    } catch (e) {
      showError(e?.response?.data?.message || e?.message || "Failed to submit task");
    } finally {
      dismissToast(toastId);
    }
  };

  // Open Add Student modal and load admin-created students with role=Student
  const onAddStudent = async () => {
    setShowStudentModal(true);
    setStudentModalLoading(true);
    setStudentModalError("");
    try {
      const registered = await getRegisteredUsers(token, {
        page: 1,
        limit: 1000,
        role: "Student",
        search: "",
      }).catch(() => []);

      const regArr = Array.isArray(registered?.users || registered?.data || registered)
        ? (registered.users || registered.data || registered)
        : [];

      const assignedIds = new Set((students || []).map((s) => String(s._id || s.id || s.userId || s.email)));
      const map = new Map();
      for (const u of regArr) {
        const id = u._id || u.id || u.userId || u.email;
        if (!id) continue;
        // Only Students (ONLY Admin-created accounts)
        const isStudent = !u.accountType || String(u.accountType).toLowerCase() === "student";
        if (!isStudent) continue;
        if (!u.createdByAdmin) continue;
        // Exclude already assigned
        if (assignedIds.has(String(id))) continue;
        if (!map.has(id)) map.set(id, u);
      }
      setAllStudents(Array.from(map.values()));
      setPickPageIndex(0);
    } catch (e) {
      setStudentModalError(e?.message || "Failed to load students");
      showError(e?.message || "Failed to load students");
    } finally {
      setStudentModalLoading(false);
    }
  };

  const onDownloadAllStudents = () => {
    showSuccess("Download coming soon");
  };

  const onRemoveAllStudents = () => {
    if (students.length === 0) return;
    const ok = window.confirm("Remove all students from this batch?");
    if (!ok) return;
    // UI-only for now to avoid accidental mass deletions
    setStudents([]);
    setSelectedStudentIds(new Set());
    showSuccess("All students removed (UI only)");
  };

  const toggleSelectAllStudents = (e) => {
    const checked = !!e.target.checked;
    const pageSlice = students.slice(
      studentPageIndex * studentRowsPerPage,
      studentPageIndex * studentRowsPerPage + studentRowsPerPage
    );
    const ids = pageSlice.map((s) => s._id || s.id || s.userId).filter(Boolean);
    const next = new Set(selectedStudentIds);
    if (checked) {
      ids.forEach((id) => next.add(id));
    } else {
      ids.forEach((id) => next.delete(id));
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
      showError(e?.response?.data?.message || e?.message || "Failed to remove student");
    }
  };

  const removeTempStudent = async (tempId) => {
    if (!tempId || !batchId) return;
    try {
      await removeTempStudentFromBatch(batchId, tempId, token);
      setTempStudents((prev) => prev.filter((t) => (t._id || t.id) !== tempId));
      showSuccess("Student removed from batch");
    } catch (e) {
      showError(e?.response?.data?.message || e?.message || "Failed to remove student");
    }
  };

  const openLiveClassModal = () => {
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

  // Live class event click handling (open link if not expired)
  const normalizeLink = (url) => {
    const s = String(url || "").trim();
    if (!s) return "";
    // 1) Extract first explicit URL
    const urlMatch = s.match(/https?:\/\/[\w\-._~:?#\[\]@!$&'()*+,;=%/]+/i);
    if (urlMatch) return urlMatch[0];
    // 2) Extract known meeting domains even without protocol
    const domainMatch = s.match(/(?:meet\.google\.com|zoom\.us|teams\.microsoft\.com|webex\.com)[^\s,]*/i);
    if (domainMatch) {
      const val = domainMatch[0].replace(/^\/+/, "");
      return /^https?:\/\//i.test(val) ? val : `https://${val}`;
    }
    // 3) Extract Google Meet code pattern (xxx-xxxx-xxx) if present
    const meetCode = s.match(/\b([a-z]{3}-[a-z]{4}-[a-z]{3})\b/i);
    if (meetCode) {
      return `https://meet.google.com/${meetCode[1]}`;
    }
    // 4) Fallback: if starts like a domain, prefix https
    if (/^([\w-]+\.)+[\w-]+(\/[^\s]*)?$/i.test(s)) return `https://${s}`;
    return ""; // could not infer a safe link
  };

  const handleEventClick = (ev) => {
    if (!ev) return;
    const st = ev?._st ? ev._st : ev?.startTime ? new Date(ev.startTime) : null;
    const isPast = st ? (!isSameDay(st, today) && st.getTime() < Date.now()) : false;
    const link = normalizeLink(ev?.link || "");
    if (!link) {
      showError("No class link available.");
      return;
    }
    if (isPast) {
      showError("This class link has expired.");
      return;
    }
    window.open(link, "_blank", "noopener");
  };

  // Course functions
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

  // Instructor functions
  const openInstructorModal = async () => {
    setShowInstructorModal(true);
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

  // Review functions
  useEffect(() => {
    const loadReviews = async () => {
      try {
        const all = await getAllReviews();
        if (!Array.isArray(all)) return;

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

  // Batch CRUD functions
  useEffect(() => {
    if (!batchId || !token || !isAdmin) return;
    let mounted = true;
    setLoading(true);
    setError("");
    
    const loadBatchData = async () => {
      try {
        // First fetch batch data
        const data = await getBatchById(batchId, token);
        if (!mounted) return;
        
        // Debug: Log the complete batch data
        console.log('[loadBatchData] Complete batch data:', JSON.parse(JSON.stringify(data)));
        
        setBatch(data);
        setName(data?.name || "");
        setDepartment(data?.department || "");
        setDescription(data?.description || "");
        
        // Process live classes from the batch data
        try {
          console.log('[loadBatchData] Raw live classes data:', data?.liveClasses);
          
          // Ensure we have an array of live classes
          let liveClasses = [];
          
          // Handle different possible data structures
          if (Array.isArray(data?.liveClasses)) {
            liveClasses = [...data.liveClasses];
          } else if (data?.liveClasses && typeof data.liveClasses === 'object') {
            // Handle case where liveClasses is an object with _ids as keys
            if (data.liveClasses._id) {
              // Single live class object
              liveClasses = [data.liveClasses];
            } else {
              // Object with multiple live classes
              liveClasses = Object.values(data.liveClasses);
            }
          }
          
          // Filter out any invalid or null entries
          liveClasses = liveClasses.filter(cls => cls && (cls._id || cls.id));
          
          console.log('[loadBatchData] Raw live classes data structure:', {
            hasLiveClasses: Boolean(data?.liveClasses),
            type: typeof data?.liveClasses,
            isArray: Array.isArray(data?.liveClasses),
            keys: data?.liveClasses ? Object.keys(data.liveClasses) : [],
            firstItem: data?.liveClasses?.[0],
            sampleItem: data?.liveClasses ? data.liveClasses[Object.keys(data.liveClasses)[0]] : null
          });
          
          console.log('[loadBatchData] Processed live classes array:', liveClasses);
          
          // Process dates and ensure required fields
          const processedLiveClasses = liveClasses.map(cls => ({
            ...cls,
            id: cls.id || cls._id || `temp-${Math.random().toString(36).substr(2, 9)}`,
            title: cls.title || 'Untitled Class',
            startTime: cls.startTime || cls.scheduledTime || cls.date,
            endTime: cls.endTime || (cls.startTime ? new Date(new Date(cls.startTime).getTime() + 60 * 60 * 1000) : null)
          }));
          
          console.log('[loadBatchData] Final processed live classes:', processedLiveClasses);
          
          if (processedLiveClasses.length > 0) {
            const processedClasses = processedLiveClasses.map(cls => {
              try {
                let startTime = cls.startTime || cls.date || cls.scheduledTime;
                let dateObj = null;
                
                // Parse the date if it's a string
                if (typeof startTime === 'string') {
                  // Try parsing as ISO string first
                  dateObj = new Date(startTime);
                  
                  // If invalid, try adding timezone info
                  if (isNaN(dateObj.getTime()) && !startTime.endsWith('Z')) {
                    dateObj = new Date(startTime + 'Z');
                  }
                  
                  // If still invalid, try different formats
                  if (isNaN(dateObj.getTime())) {
                    dateObj = new Date(startTime.replace(' ', 'T') + 'Z');
                  }
                } else if (typeof startTime === 'number') {
                  // Handle timestamps (convert to milliseconds if in seconds)
                  dateObj = new Date(startTime.toString().length === 10 ? startTime * 1000 : startTime);
                } else if (startTime instanceof Date) {
                  // Already a Date object
                  dateObj = startTime;
                }
                
                // If we have a valid date, update the object
                if (dateObj && !isNaN(dateObj.getTime())) {
                  return {
                    ...cls,
                    id: cls.id || cls._id || `temp-${Math.random().toString(36).substr(2, 9)}`,
                    title: cls.title || 'Untitled Class',
                    startTime: dateObj.toISOString(),
                    _st: dateObj,
                    link: cls.link || cls.meetingUrl || cls.url || ''
                  };
                }
                
                console.warn('Could not parse date for live class:', { 
                  id: cls.id || cls._id, 
                  startTime: cls.startTime,
                  type: typeof cls.startTime 
                });
                
                return {
                  ...cls,
                  id: cls.id || cls._id || `temp-${Math.random().toString(36).substr(2, 9)}`,
                  title: cls.title || 'Untitled Class',
                  link: cls.link || cls.meetingUrl || cls.url || ''
                };
                
              } catch (error) {
                console.error('Error processing live class:', {
                  id: cls.id || cls._id,
                  error: error.message,
                  classData: cls
                });
                return null;
              }
            }).filter(cls => cls !== null); // Remove any null entries from failed processing
            
            console.log('[loadBatchData] Processed live classes:', processedClasses);
            setLiveClasses(processedClasses);
          } else {
            console.log('[loadBatchData] No live classes found in batch data');
            setLiveClasses([]);
          }
        } catch (error) {
          console.error('Error processing live classes:', error);
          setLiveClasses([]);
        }
        // Handle trainers
        if (Array.isArray(data?.trainers)) {
          setAssignedInstructors(data.trainers);
        } else {
          listBatchTrainers(batchId, token)
            .then((trs) => mounted && Array.isArray(trs) && setAssignedInstructors(trs))
            .catch((err) => console.error('Error loading trainers:', err));
        }
        
        // Handle students
        try {
          const students = await listBatchStudents(batchId, token);
          if (mounted) {
            const arr = Array.isArray(students) ? students : [];
            setStudents(arr);
            setSelectedStudentIds(new Set());
          }
        } catch (e) {
          if (mounted) {
            showError(e?.message || "Failed to load batch students");
          }
        }
      } catch (e) {
        if (mounted) {
          const errorMessage = e?.message || "Failed to fetch batch details";
          setError(errorMessage);
          showError(errorMessage);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    loadBatchData();
    return () => { mounted = false; };
  }, [batchId, token, isAdmin]);

  useEffect(() => {
    if (!batchId || !token) return;
    if (activeTab !== "courses" && activeTab !== "reviews") return;
    (async () => {
      try {
        const assigned = await listBatchCourses(batchId, token);
        const assignedArr = Array.isArray(assigned) ? assigned : [];
        setAssignedCourses(assignedArr);
        setAssignedCourseIds(new Set(assignedArr.map((c) => c._id || c.id)));
      } catch (e) {
        // non-blocking
      }
    })();
  }, [activeTab, batchId, token]);

  const onEditToggle = () => {
    if (!batch) return;
    setIsEditing((prev) => !prev);
  };

  const onSave = async () => {
    const payload = {};
    const trimmedName = name.trim();
    const trimmedDept = department.trim();
    const trimmedDesc = description.trim();

    if (trimmedName && trimmedName !== (batch?.name || "")) {
      payload.name = trimmedName;
    }
    if (trimmedDept && trimmedDept !== (batch?.department || "")) {
      payload.department = trimmedDept;
    }

    if (trimmedDesc !== (batch?.description || "")) {
      payload.description = trimmedDesc;
    }

    if (Object.keys(payload).length === 0) {
      showError("Nothing to update");
      return;
    }
    if (payload.department) {
      const allowed = ["skilling", "training", "personality"];
      const normalized = payload.department.toLowerCase();
      if (!allowed.includes(normalized)) {
        showError(`Department must be one of: ${allowed.join(", ")}`);
        return;
      }
      payload.department = normalized;
    }

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
      <div className="batch-details-container">
        {/* Header */}
        <div className="batch-header">
          <h2 className="batch-title">Student Details</h2>
          <div className="breadcrumbs">
            <span>Batch</span>
            <span className="divider">/</span>
            <span className="active">Batch Details</span>
          </div>
        </div>

        {/* Main Card */}
        <div className="batch-card">
          {/* Tabs */}
          <div className="batch-tabs">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`tab-button ${activeTab === t.key ? "active" : ""}`}
              >
                {t.label}
                {activeTab === t.key && <span className="tab-indicator" />}
              </button>
            ))}
          </div>

          {/* Live Classes Section */}
          {activeTab === "live" && (
            <div className="live-classes-section">
              <div className="calendar-toolbar">
                <div className="calendar-nav-buttons">
                  <button onClick={onCalendarToday} className="secondary-button">Today</button>
                  <button onClick={onCalendarBack} className="secondary-button">Back</button>
                  <button onClick={onCalendarNext} className="secondary-button">Next</button>
                </div>
                <div className="calendar-view-controls">
                  <div className="view-toggle">
                    <button 
                      onClick={() => setCalendarView("month")} 
                      className={`secondary-button ${calendarView === "month" ? "active" : ""}`}
                    >
                      Month
                    </button>
                    <button 
                      onClick={() => setCalendarView("day")} 
                      className={`secondary-button ${calendarView === "day" ? "active" : ""}`}
                    >
                      Day
                    </button>
                  </div>
                  <button
                    onClick={openLiveClassModal}
                    className="primary-button"
                  >
                    Add Class
                  </button>
                </div>
              </div>

              <div className="month-label">
                {monthLabel(calendarDate)}
              </div>

              {calendarView === "month" ? (
                <div className="month-calendar">
                  <div className="week-header">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((w) => (
                      <div key={w} className="weekday">{w}</div>
                    ))}
                  </div>
                  <div className="days-grid">
                    {(() => {
                      const first = startOfMonth(calendarDate);
                      const gridStart = startOfWeek(first);
                      const days = [];
                      
                      // Log calendar date range
                      console.log(`[Calendar] Displaying dates from ${format(gridStart, 'yyyy-MM-dd')} to ${format(addDays(gridStart, 6*7-1), 'yyyy-MM-dd')}`);
                      
                      for (let i = 0; i < 6 * 7; i++) {
                        const d = addDays(gridStart, i);
                        const inMonth = d.getMonth() === calendarDate.getMonth();
                        const isToday = isSameDay(d, new Date());
                        const isSelected = isSameDay(d, selectedDate);
                        
                        // Get events for this day
                        const dayEvents = liveClasses.filter(ev => {
                          try {
                            const eventDate = ev._st || (ev.startTime ? new Date(ev.startTime) : null);
                            return eventDate && isSameDay(eventDate, d);
                          } catch (e) {
                            return false;
                          }
                        });
                        
                        days.push(
                          <div
                            key={d.toISOString()}
                            onClick={() => setSelectedDate(d)}
                            className={`day-cell ${isSelected ? "selected" : ""} ${inMonth ? "current-month" : "other-month"}`}
                          >
                            <div className="day-number">
                              {String(d.getDate()).padStart(2, "0")}
                              {dayEvents.length > 0 && (
                                <span className="event-count">{dayEvents.length}</span>
                              )}
                            </div>
                            <div className="events-list">
                              {dayEvents.map((event, idx) => {
                                const eventDate = event._st || (event.startTime ? new Date(event.startTime) : null);
                                const isPast = eventDate ? (eventDate < new Date() && !isSameDay(eventDate, new Date())) : false;
                                return (
                                  <div 
                                    key={`${event.id || event._id}-${idx}`}
                                    className={`event-item ${isPast ? 'past-event' : ''}`}
                                    title={`${event.title} - ${eventDate ? format(eventDate, 'MMM d, yyyy h:mm a') : 'No date'}`}
                                  >
                                    {event.title}
                                  </div>
                                );
                              })}
                            </div>
                            {(() => {
                              const events = Array.isArray(liveClasses) ? liveClasses : [];
                              const today = new Date();
                              
                              // Log all events once when the calendar renders
                              if (isSameDay(d, startOfMonth(calendarDate))) {
                                console.log(`[Calendar] All live classes (${events.length} total):`, events.map(ev => {
                                  const eventDate = ev?.startTime ? new Date(ev.startTime) : null;
                                  return {
                                    id: ev.id || ev._id,
                                    title: ev.title,
                                    date: eventDate?.toISOString() || 'No date',
                                    formattedDate: eventDate ? format(eventDate, 'yyyy-MM-dd HH:mm') : null,
                                    hasStartTime: !!ev.startTime,
                                    isPast: eventDate ? (eventDate < today) : false
                                  };
                                }));
                              }
                              
                              // Get events for this day
                              const evs = events.filter(ev => {
                                try {
                                  // Use the pre-parsed _st if available, otherwise parse startTime
                                  const eventDate = ev._st || (ev.startTime ? new Date(ev.startTime) : null);
                                  
                                  if (!eventDate || isNaN(eventDate.getTime())) {
                                    console.warn('Invalid date for event:', {
                                      id: ev.id || ev._id,
                                      title: ev.title,
                                      startTime: ev.startTime,
                                      _st: ev._st
                                    });
                                    return false;
                                  }
                                  
                                  const matches = isSameDay(eventDate, d);
                                  
                                  // Log all events and why they match/not match
                                  console.log(`[Calendar] Checking event for ${format(d, 'yyyy-MM-dd')}:`, {
                                    id: ev.id || ev._id,
                                    title: ev.title,
                                    eventDate: format(eventDate, 'yyyy-MM-dd HH:mm'),
                                    currentDay: format(d, 'yyyy-MM-dd'),
                                    matches,
                                    timezoneOffset: eventDate.getTimezoneOffset()
                                  });
                                  
                                  return matches;
                                } catch (error) {
                                  console.error('Error processing event:', {
                                    id: ev.id || ev._id,
                                    error: error.message,
                                    startTime: ev.startTime,
                                    _st: ev._st
                                  });
                                  return false;
                                }
                              });
                              
                              // Log events for this day if any
                              if (evs.length > 0) {
                                console.log(`[Calendar] Found ${evs.length} events for ${format(d, 'yyyy-MM-dd')}`, 
                                  evs.map(ev => ({
                                    id: ev.id || ev._id,
                                    title: ev.title,
                                    time: ev._st ? format(ev._st, 'HH:mm') : 'No time',
                                    date: ev._st ? ev._st.toISOString() : 'No date',
                                    rawDate: ev.startTime
                                  }))
                                );
                              }
                              
                              const maxShow = 10; // Show more events per day
                              return (
                                <div className="day-events">
                                  {evs.slice(0, maxShow).map((ev, idx) => {
                                    const isPast = ev._st ? (ev._st < today && !isSameDay(ev._st, today)) : false;
                                    return (
                                      <div 
                                        key={(ev._id || ev.id || ev.startTime) + "-m"} 
                                        className={`event-chip ${isPast ? 'past' : ''}`}
                                        onClick={(e) => { 
                                          e.stopPropagation(); 
                                          handleEventClick(ev); 
                                        }}
                                        title={`${ev.title || 'Live Class'}\n${ev._st ? ev._st.toLocaleString() : 'No date'}`}
                                      >
                                        <span className="event-title">{ev.title || "Live Class"}</span>
                                        {ev._st && (
                                          <span className="event-time">
                                            {format(ev._st, 'h:mm a')}
                                          </span>
                                        )}
                                        {/* Status badge */}
                                          <span
                                            style={{
                                              marginLeft: 6,
                                              background: "#DCFCE7",
                                              color: "#166534",
                                              border: "1px solid #86efac",
                                              borderRadius: 999,
                                              padding: "1px 6px",
                                              fontSize: 10,
                                              fontWeight: 700,
                                              lineHeight: 1.4,
                                              whiteSpace: "nowrap",
                                            }}
                                          >
                                            Done
                                          </span>
                                      </div>
                                    );
                                  })}
                                  {evs.length > maxShow && (
                                    <div className="more-events">+{evs.length - maxShow} more</div>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                        );
                      }
                      return days;
                    })()}
                  </div>
                </div>
              ) : (
                <div className="day-view">
                  <div className="day-header">
                    <div className="day-title">
                      {selectedDate.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                    </div>
                    <button 
                      onClick={() => setCalendarView("month")} 
                      className="secondary-button"
                    >
                      Back to Month
                    </button>
                  </div>
                  {(() => {
                    const events = Array.isArray(liveClasses) ? liveClasses : [];
                    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
                    console.log(`[DayView] Processing ${events.length} live classes for date: ${formattedDate}`);
                    
                    // Log all events with their dates for debugging
                    console.log(`[DayView] All events:`, events.map(ev => {
                      const _st = ev?.startTime ? new Date(ev.startTime) : null;
                      return {
                        id: ev.id || ev._id,
                        title: ev.title,
                        startTime: _st?.toISOString(),
                        formattedDate: _st ? format(_st, 'yyyy-MM-dd HH:mm') : 'No date',
                        isSameDay: _st ? isSameDay(_st, selectedDate) : false,
                        rawDate: ev.startTime
                      };
                    }));
                    
                    const evs = events
                      .map((ev) => {
                        const _st = ev?.startTime ? new Date(ev.startTime) : null;
                        const isSameDayEvent = _st ? isSameDay(_st, selectedDate) : false;
                        
                        if (isSameDayEvent) {
                          console.log(`[DayView] Matched event:`, {
                            id: ev.id || ev._id,
                            title: ev.title,
                            startTime: _st?.toISOString(),
                            formattedDate: _st ? format(_st, 'yyyy-MM-dd HH:mm') : 'No date'
                          });
                        }
                        return { ...ev, _st, isSameDayEvent };
                      })
                      .filter(ev => ev.isSameDay)
                      .sort((a, b) => (a._st?.getTime() || 0) - (b._st?.getTime() || 0));
                    if (evs.length === 0) return null;
                    return (
                      <div className="day-events-list">
                        {evs.map((ev) => {
                          const isPast = ev?._st ? (ev._st.getTime() < Date.now() && !isSameDay(ev._st, today)) : false;
                          return (
                            <div 
                              key={(ev._id || ev.id || ev.startTime) + "-d"} 
                              className="event-item" 
                              onClick={() => handleEventClick(ev)}
                              style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
                            >
                              <span className="event-time">
                                {ev._st.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                              <span className="event-title">{ev.title || "Live Class"}</span>
                              {isPast && (
                                <span
                                  style={{
                                    marginLeft: 6,
                                    background: "#DCFCE7",
                                    color: "#166534",
                                    border: "1px solid #86efac",
                                    borderRadius: 999,
                                    padding: "2px 8px",
                                    fontSize: 11,
                                    fontWeight: 700,
                                    lineHeight: 1.4,
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  Done
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                  <div className="time-grid">
                    {Array.from({ length: 24 }, (_, h) => {
                      const highlight = isSameDay(selectedDate, today) && today.getHours() === h;
                      return (
                        <div key={h} className="time-row">
                          <div className="time-label">
                            {`${String(h).padStart(2, "0")}:00`}
                          </div>
                          <div className={`time-slot ${highlight ? "current-time" : ""}`} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Global Task Statuses Modal (for Performance tab and others) */}
          {statusModalOpen && activeTab !== "task" && (
            <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 60 , marginLeft:"220px"}}>
              <div style={{ background: "#fff", width: "min(900px, 96vw)", borderRadius: 12, border: `1px solid ${BORDER_COLOR}`, boxShadow: MODAL_SHADOW }}>
                <div style={{ padding: 16, borderBottom: `1px solid ${BORDER_COLOR}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ margin: 0, color: TEXT_DARK }}>Task Statuses • {statusTaskTitle}</h3>
                  <button onClick={() => setStatusModalOpen(false)} style={{ background: "transparent", border: "none", fontSize: 18, cursor: "pointer" }}>✕</button>
                </div>
                <div style={{ padding: 16 }}>
                  {/* Summary Cards */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0,1fr))", gap: 12, marginBottom: 12 }}>
                    {[
                      { label: "Total", value: statusSummary.total },
                      { label: "Submitted", value: statusSummary.submitted },
                      { label: "Pending", value: statusSummary.pending },
                      { label: "Completed", value: statusSummary.completed },
                      { label: "Graded", value: statusSummary.graded },
                    ].map((card) => (
                      <div key={card.label} style={{ background: BG_LIGHT, border: `1px solid ${BORDER_COLOR}`, borderRadius: 10, padding: 12, textAlign: "center" }}>
                        <div style={{ color: TEXT_LIGHT, fontSize: 12 }}>{card.label}</div>
                        <div style={{ color: TEXT_DARK, fontWeight: 700, fontSize: 18 }}>{Number(card.value ?? 0)}</div>
                      </div>
                    ))}
                  </div>

                  {/* Error/Loading */}
                  {statusLoading ? (
                    <div style={{ color: TEXT_LIGHT }}>Loading statuses...</div>
                  ) : statusError ? (
                    <div style={{ color: "#ef4444" }}>{statusError}</div>
                  ) : (
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr style={{ background: "#f9fafb" }}>
                            <th style={{ textAlign: "left", padding: 10, borderBottom: `1px solid ${BORDER_COLOR}` }}>Student</th>
                            <th style={{ textAlign: "left", padding: 10, borderBottom: `1px solid ${BORDER_COLOR}` }}>Email</th>
                            <th style={{ textAlign: "left", padding: 10, borderBottom: `1px solid ${BORDER_COLOR}` }}>Status</th>
                            <th style={{ textAlign: "left", padding: 10, borderBottom: `1px solid ${BORDER_COLOR}` }}>Submitted At</th>
                            <th style={{ textAlign: "left", padding: 10, borderBottom: `1px solid ${BORDER_COLOR}` }}>Score</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(Array.isArray(taskStatuses) ? taskStatuses : []).length === 0 ? (
                            <tr>
                              <td colSpan="5" style={{ padding: 16, color: TEXT_LIGHT, textAlign: "center" }}>No data</td>
                            </tr>
                          ) : (
                            taskStatuses.map((s, idx) => (
                              <tr key={(s.student?._id || idx) + "-status"}>
                                <td style={{ padding: 10, borderBottom: `1px solid ${BORDER_COLOR}` }}>
                                  {(s.student?.firstName || "") + " " + (s.student?.lastName || "")}
                                </td>
                                <td style={{ padding: 10, borderBottom: `1px solid ${BORDER_COLOR}` }}>{s.student?.email || "-"}</td>
                                <td style={{ padding: 10, borderBottom: `1px solid ${BORDER_COLOR}` }}>
                                  <span style={{
                                    background: s.status === "completed" ? "#dcfce7" : "#fee2e2",
                                    color: s.status === "completed" ? "#166534" : "#991b1b",
                                    borderRadius: 999,
                                    padding: "2px 8px",
                                    fontSize: 12,
                                    fontWeight: 700,
                                  }}>{(s.status || "").toUpperCase()}</span>
                                </td>
                                <td style={{ padding: 10, borderBottom: `1px solid ${BORDER_COLOR}` }}>
                                  {s.submittedAt ? new Date(s.submittedAt).toLocaleString() : "-"}
                                </td>
                                <td style={{ padding: 10, borderBottom: `1px solid ${BORDER_COLOR}` }}>
                                  {typeof s.score === "number" ? s.score : "-"}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                <div style={{ padding: 16, borderTop: `1px solid ${BORDER_COLOR}`, display: "flex", justifyContent: "flex-end" }}>
                  <button onClick={() => setStatusModalOpen(false)} style={{ background: "#e5e7eb",color:ED_TEAL,  border: `1px solid ${BORDER_COLOR}`, padding: "0.45rem 0.9rem", borderRadius: 8, cursor: "pointer" }}>Close</button>
                </div>
              </div>
            </div>
          )}

          {/* Task Tab Section */}
          {activeTab === "task" && (
            <div className="task-tab-section" style={{ marginTop: 16 }}>
              {/* Toolbar */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ color: TEXT_LIGHT }}>
                  {tasksLoading ? "Loading tasks..." : `${tasks.length} task${tasks.length === 1 ? "" : "s"}`}
                  {tasksError && <span style={{ color: "#ef4444", marginLeft: 8 }}>• {tasksError}</span>}
                </div>
                <button onClick={openCreateTaskModal} style={{ backgroundColor: "#07A698", color: "#fff", border: "none", padding: "0.45rem 0.9rem", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>
            
                  Add Task
                </button>
              </div>

              {/* Tasks table */}
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f9fafb" }}>
                      <th style={{ textAlign: "left", padding: 10, borderBottom: `1px solid ${BORDER_COLOR}` }}>Title</th>
                      <th style={{ textAlign: "left", padding: 10, borderBottom: `1px solid ${BORDER_COLOR}` }}>Description</th>
                      <th style={{ textAlign: "left", padding: 10, borderBottom: `1px solid ${BORDER_COLOR}` }}>Due</th>
                      <th style={{ textAlign: "right", padding: 10, borderBottom: `1px solid ${BORDER_COLOR}` }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.length === 0 ? (
                      <tr>
                        <td colSpan="4" style={{ padding: 16, color: TEXT_LIGHT, textAlign: "center" }}>
                          {tasksLoading ? "Loading..." : "No tasks yet"}
                        </td>
                      </tr>
                    ) : (
                      tasks.map((t) => {
                        const id = t._id || t.id;
                        return (
                          <tr key={id}>
                            <td style={{ padding: 10, borderBottom: `1px solid ${BORDER_COLOR}` }}>{t.title}</td>
                            <td style={{ padding: 10, borderBottom: `1px solid ${BORDER_COLOR}`, maxWidth: 420, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={t.description}>
                              {t.description || "-"}
                            </td>
                            <td style={{ padding: 10, borderBottom: `1px solid ${BORDER_COLOR}` }}>
                              {t.dueDate ? new Date(t.dueDate).toLocaleString() : "-"}
                            </td>
                            <td style={{ padding: 10, borderBottom: `1px solid ${BORDER_COLOR}`, textAlign: "right" }}>
                              <button onClick={() => openEditTaskModal(t)} style={{ background: "#e5e7eb", color:ED_TEAL,  border: `1px solid ${BORDER_COLOR}`, padding: "6px 10px", borderRadius: 6, cursor: "pointer", marginRight: 8 }}>Edit</button>
                              <button onClick={() => handleDeleteTask(id)} style={{ background: "#ef4444", color: "#fff", border: "none", padding: "6px 10px", borderRadius: 6, cursor: "pointer" }}>Delete</button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Create/Edit Task Modal */}
              {taskModalOpen && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 50 }}>
                  <div style={{ background: "#fff", width: "min(720px, 96vw)", borderRadius: 12, border: `1px solid ${BORDER_COLOR}` }}>
                    <div style={{ padding: 16, borderBottom: `1px solid ${BORDER_COLOR}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <h3 style={{ margin: 0, color: TEXT_DARK }}>{editingTaskId ? "Edit Task" : "Create Task"}</h3>
                      <button onClick={() => setTaskModalOpen(false)} style={{ background: "transparent", border: "none", fontSize: 18, cursor: "pointer" }}>✕</button>
                    </div>
                    <form onSubmit={submitTaskForm} style={{ padding: 16 }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <div>
                          <label style={{ display: "block", fontSize: 12, color: TEXT_LIGHT, marginBottom: 6 }}>Title</label>
                          <input value={taskForm.title} onChange={(e) => setTaskForm((f) => ({ ...f, title: e.target.value }))} placeholder="Task title" style={{ width: "100%", padding: 10, border: `1px solid ${BORDER_COLOR}`, borderRadius: 8 }} />
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: 12, color: TEXT_LIGHT, marginBottom: 6 }}>Due Date</label>
                          <input type="datetime-local" value={taskForm.dueDate} onChange={(e) => setTaskForm((f) => ({ ...f, dueDate: e.target.value }))} style={{ width: "100%", padding: 10, border: `1px solid ${BORDER_COLOR}`, borderRadius: 8 }} />
                        </div>
                        <div style={{ gridColumn: "1 / -1" }}>
                          <label style={{ display: "block", fontSize: 12, color: TEXT_LIGHT, marginBottom: 6 }}>Description</label>
                          <textarea value={taskForm.description} onChange={(e) => setTaskForm((f) => ({ ...f, description: e.target.value }))} placeholder="Task description" rows="4" style={{ width: "100%", padding: 10, border: `1px solid ${BORDER_COLOR}`, borderRadius: 8, resize: "vertical" }} />
                        </div>
                      </div>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
                        <button type="button" onClick={() => setTaskModalOpen(false)} style={{ background: "#e5e7eb", color:ED_TEAL , border: `1px solid ${BORDER_COLOR}`, padding: "0.45rem 0.9rem", borderRadius: 8, cursor: "pointer" }}>Cancel</button>
                        <button type="submit" style={{ background: "#2563eb", color: "#fff", border: "none", padding: "0.45rem 0.9rem", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>{editingTaskId ? "Update" : "Create"}</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Task Statuses Modal */}
              {statusModalOpen && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 60 }}>
                  <div style={{ background: "#fff", width: "min(900px, 96vw)", borderRadius: 12, border: `1px solid ${BORDER_COLOR}`, boxShadow: MODAL_SHADOW }}>
                    <div style={{ padding: 16, borderBottom: `1px solid ${BORDER_COLOR}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <h3 style={{ margin: 0, color: TEXT_DARK }}>Task Statuses • {statusTaskTitle}</h3>
                      <button onClick={() => setStatusModalOpen(false)} style={{ background: "transparent", border: "none", fontSize: 18, cursor: "pointer" }}>✕</button>
                    </div>
                    <div style={{ padding: 16 }}>
                      {/* Summary Cards */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0,1fr))", gap: 12, marginBottom: 12 }}>
                        {[
                          { label: "Total", value: statusSummary.total },
                          { label: "Submitted", value: statusSummary.submitted },
                          { label: "Pending", value: statusSummary.pending },
                          { label: "Completed", value: statusSummary.completed },
                          { label: "Graded", value: statusSummary.graded },
                        ].map((card) => (
                          <div key={card.label} style={{ background: BG_LIGHT, border: `1px solid ${BORDER_COLOR}`, borderRadius: 10, padding: 12, textAlign: "center" }}>
                            <div style={{ color: TEXT_LIGHT, fontSize: 12 }}>{card.label}</div>
                            <div style={{ color: TEXT_DARK, fontWeight: 700, fontSize: 18 }}>{Number(card.value ?? 0)}</div>
                          </div>
                        ))}
                      </div>

                      {/* Error/Loading */}
                      {statusLoading ? (
                        <div style={{ padding: 12, color: TEXT_LIGHT }}>Loading...</div>
                      ) : statusError ? (
                        <div style={{ padding: 12, color: "#ef4444" }}>{statusError}</div>
                      ) : (
                        <div style={{ overflowX: "auto" }}>
                          <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                              <tr style={{ background: "#f9fafb" }}>
                                <th style={{ textAlign: "left", padding: 10, borderBottom: `1px solid ${BORDER_COLOR}` }}>Student</th>
                                <th style={{ textAlign: "left", padding: 10, borderBottom: `1px solid ${BORDER_COLOR}` }}>Email</th>
                                <th style={{ textAlign: "left", padding: 10, borderBottom: `1px solid ${BORDER_COLOR}` }}>Status</th>
                                <th style={{ textAlign: "left", padding: 10, borderBottom: `1px solid ${BORDER_COLOR}` }}>Submitted At</th>
                                <th style={{ textAlign: "left", padding: 10, borderBottom: `1px solid ${BORDER_COLOR}` }}>Score</th>
                              </tr>
                            </thead>
                            <tbody>
                              {taskStatuses.length === 0 ? (
                                <tr>
                                  <td colSpan="5" style={{ padding: 16, color: TEXT_LIGHT, textAlign: "center" }}>No students found</td>
                                </tr>
                              ) : (
                                taskStatuses.map((row, idx) => {
                                  const name = `${row?.student?.firstName || ""} ${row?.student?.lastName || ""}`.trim() || (row?.student?.name || "-")
                                  const email = row?.student?.email || "-"
                                  const status = row?.status || "pending"
                                  const submittedAt = row?.submittedAt ? new Date(row.submittedAt).toLocaleString() : "-"
                                  const score = (typeof row?.score === "number") ? row.score : "-"
                                  return (
                                    <tr key={row?.student?._id || idx}>
                                      <td style={{ padding: 10, borderBottom: `1px solid ${BORDER_COLOR}` }}>{name}</td>
                                      <td style={{ padding: 10, borderBottom: `1px solid ${BORDER_COLOR}` }}>{email}</td>
                                      <td style={{ padding: 10, borderBottom: `1px solid ${BORDER_COLOR}` }}>{status}</td>
                                      <td style={{ padding: 10, borderBottom: `1px solid ${BORDER_COLOR}` }}>{submittedAt}</td>
                                      <td style={{ padding: 10, borderBottom: `1px solid ${BORDER_COLOR}` }}>{score}</td>
                                    </tr>
                                  )
                                })
                              )}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                    <div style={{ padding: 16, borderTop: `1px solid ${BORDER_COLOR}`, display: "flex", justifyContent: "flex-end" }}>
                      <button onClick={() => setStatusModalOpen(false)} style={{ background: "#e5e7eb", border: `1px solid ${BORDER_COLOR}`, padding: "0.45rem 0.9rem", borderRadius: 8, cursor: "pointer" }}>Close</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Performance Tab Section */}
          {(activeTab === "performance" || activeTab === "attendance") && (
  <div
    className="performance-tab-section"
    style={{
      marginTop: 20,
      padding: 16,
      background: "#fff",
      border: `1px solid ${BORDER_COLOR}`,
      borderRadius: 12,
      boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
    }}
  >
    <div
      style={{
        display: "flex",
        gap: 16,
        alignItems: "center",
        marginBottom: 14,
      }}
    >
      <label
        style={{
          color: TEXT_LIGHT,
          fontSize: 14,
          fontWeight: 500,
          minWidth: 90,
        }}
      >
        Select Task:
      </label>

      <select
        value={selectedAttendanceTaskId}
        onChange={(e) => setSelectedAttendanceTaskId(e.target.value)}
        style={{
          padding: "8px 12px",
          border: `1px solid ${BORDER_COLOR}`,
          borderRadius: 8,
          fontSize: 14,
          outline: "none",
          transition: "0.2s",
          flex: "1",
          background: "#f9fafb",
          color: "#333",
        }}
        onFocus={(e) =>
          (e.target.style.border = `1px solid ${ED_TEAL}`)
        }
        onBlur={(e) =>
          (e.target.style.border = `1px solid ${BORDER_COLOR}`)
        }
      >
        <option value="">-- Choose a task --</option>
        {(Array.isArray(tasks) ? tasks : []).map((t) => (
          <option key={t._id || t.id} value={String(t._id || t.id)}>
            {t.title}
          </option>
        ))}
      </select>

      <button
        onClick={() => {
          const t = (tasks || []).find(
            (x) => String(x._id || x.id) === String(selectedAttendanceTaskId)
          );
          if (!t) {
            showError("Please select a task");
            return;
          }
          openStatusModal(t);
        }}
        style={{
          background: ED_TEAL,
          color: "#fff",
          border: "none",
          padding: "8px 16px",
          borderRadius: 8,
          cursor: "pointer",
          fontWeight: 600,
          fontSize: 14,
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          transition: "0.2s",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = "#059481")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.background = ED_TEAL)
        }
      >
        View Task Statuses
      </button>
    </div>

    <div
      style={{
        color: TEXT_LIGHT,
        fontSize: 13,
        lineHeight: 1.5,
        background: "#f9fafb",
        padding: "10px 12px",
        borderRadius: 8,
        border: `1px dashed ${BORDER_COLOR}`,
      }}
    >
      Use this to quickly view per-student submission status for a selected task
      as part of performance tracking.
    </div>
  </div>
)}


          {/* Create Live Class Modal */}
          {showLiveClassModal && (
            <div className="modal-overlay" onClick={closeLiveClassModal}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>Create Live Class</h3>
                </div>
                <div className="modal-body">
                  <div className="form-grid">
                    <label>Class Title</label>
                    <input
                      value={liveTitle}
                      onChange={(e) => setLiveTitle(e.target.value)}
                      placeholder="e.g. Algebra Basics"
                    />

                    <label>Class Description</label>
                    <input
                      value={liveDescription}
                      onChange={(e) => setLiveDescription(e.target.value)}
                      placeholder="Short description"
                    />

                    <label>Class Link</label>
                    <div className="link-input-group">
                      <input
                        value={liveLink}
                        onChange={(e) => setLiveLink(e.target.value)}
                        placeholder="Enter Class Link"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!liveDateTime) { showError("Select Class Time first"); return; }
                          const start = new Date(liveDateTime);
                          if (isNaN(start.getTime())) { showError("Invalid Class Time"); return; }
                          const end = new Date(start.getTime() + 60 * 60 * 1000);
                          window.open(
                            `https://calendar.google.com/calendar/u/0/r/eventedit?text=${encodeURIComponent(liveTitle || "Live Class")}&details=${encodeURIComponent(liveDescription || "")}&dates=${start.toISOString().replace(/[-:]/g, "").split(".")[0]}Z/${end.toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
                            "_blank",
                            "noopener"
                          );
                        }}
                        className="secondary-button"
                      >
                        Open Google Calendar
                      </button>
                    </div>

                    <label>Class Time</label>
                    <input
                      type="datetime-local"
                      value={liveDateTime}
                      onChange={(e) => setLiveDateTime(e.target.value)}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button onClick={closeLiveClassModal} className="secondary-button">
                    Close
                  </button>
                  <button
                    onClick={onCreateLiveClass}
                    className="success-button"
                  >
                    Create Class
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Courses Section */}
          {activeTab === "courses" && (
            <div className="courses-section">
              <div className="section-header">
                <h2>Assigned Courses</h2>
                <button
                  onClick={openCourseModal}
                  className="primary-button"
                >
                  Add Courses
                </button>
              </div>

              {assignedCourses.length === 0 ? (
                <div className="empty-state">
                  No courses assigned yet.
                  <div>
                    <button onClick={openCourseModal} className="success-button">
                      Assign Courses
                    </button>
                  </div>
                </div>
              ) : (
                <div className="courses-grid">
                  {assignedCourses.map((c) => {
                    const cid = c?._id || c?.id;
                    return (
                      <div key={cid} className="course-card">
                        {c?.thumbnail && (
                          <div className="course-thumbnail">
                            <img src={c.thumbnail} alt={c.courseName} />
                          </div>
                        )}
                        <div className="course-details">
                          <div className="course-name">
                            {c?.courseName || "Untitled"}
                          </div>
                          <div className="course-category">
                            {(c?.category?.name || c?.category?.title) ? `Category: ${c?.category?.name || c?.category?.title}` : ""}
                          </div>
                          <div className="course-footer">
                            <span className="course-price">{typeof c?.price === "number" ? `₹${c.price}` : ""}</span>
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
                              className="danger-button"
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

          {/* Courses Modal */}
          {showCourseModal && (
            <div className="modal-overlay course-modal" onClick={closeCourseModal}>
              <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header sticky">
                  <h3>Search Course</h3>
                  <div className="search-bar">
                    <input
                      value={courseSearch}
                      onChange={(e) => setCourseSearch(e.target.value)}
                      placeholder="Search Course"
                    />
                  </div>
                </div>
                <div className="modal-body scrollable">
                  {coursesLoading ? (
                    <div className="loading-state">Loading courses...</div>
                  ) : coursesError ? (
                    <div className="error-state">{coursesError}</div>
                  ) : (
                    <div className="courses-grid">
                      {(() => {
                        const q = courseSearch.trim().toLowerCase();
                        const data = (Array.isArray(courses) ? courses : []).filter((c) =>
                          String(c?.courseName || "").toLowerCase().includes(q)
                        );
                        if (data.length === 0) {
                          return (
                            <div className="empty-state">
                              No courses found
                            </div>
                          );
                        }
                        return data.map((c) => {
                          const cid = c?._id || c?.id;
                          const already = cid ? assignedCourseIds.has(cid) : false;
                          return (
                            <div key={c?._id || c?.id} className="course-card">
                              {c?.thumbnail && (
                                <div className="course-thumbnail">
                                  <img src={c.thumbnail} alt={c.courseName} />
                                </div>
                              )}
                              <div className="course-details">
                                <div className="course-name">
                                  {c?.courseName || "Untitled"}
                                </div>
                                <div className="course-category">
                                  {(c?.category?.name || c?.category?.title) ? `Category: ${c?.category?.name || c?.category?.title}` : ""}
                                </div>
                                <div className="course-footer">
                                  <span className="course-price">{typeof c?.price === "number" ? `₹${c.price}` : ""}</span>
                                  <div className="action-buttons">
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
                                        className="danger-button"
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
                                        className="success-button"
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
                <div className="modal-footer">
                  <button onClick={closeCourseModal} className="primary-button">
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Reviews Section */}
          {activeTab === "reviews" && (
            <div className="reviews-section">
              <div className="reviews-header">
                <h3>Reviews</h3>
                <div className="review-actions">
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
                    className="secondary-button"
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
                    className="secondary-button"
                  >
                    Download Admin Reviews
                  </button>
                </div>
              </div>

              {/* Admin review form */}
              <div className="review-form">
                <div className="form-grid">
                  <label>Select Course</label>
                  <select
                    value={adminReviewCourseId}
                    onChange={(e) => setAdminReviewCourseId(e.target.value)}
                  >
                    <option value="">-- choose course --</option>
                    {assignedCourses.map((c) => (
                      <option key={c._id || c.id} value={c._id || c.id}>{c.title || c.name || c.courseName || "Course"}</option>
                    ))}
                  </select>

                  <label>Rating (1-5)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={adminReviewRating}
                    onChange={(e) => setAdminReviewRating(Number(e.target.value))}
                    className="rating-input"
                  />

                  <label className="textarea-label">Admin Review</label>
                  <textarea
                    value={adminReviewText}
                    onChange={(e) => setAdminReviewText(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="form-footer">
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
                    className="success-button"
                  >
                    Add Review
                  </button>
                </div>
              </div>

              {/* Admin Reviews table */}
              <div className="reviews-table-container">
                <div className="table-header">Admin Reviews</div>
                {adminReviews.length === 0 ? (
                  <div className="empty-table">No admin reviews.</div>
                ) : (
                  <div className="table-scroll">
                    <table className="reviews-table">
                      <thead>
                        <tr>
                          <th>Admin</th>
                          <th>Email</th>
                          <th>Course</th>
                          <th>Rating</th>
                          <th>Review</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminReviews.map((r, idx) => (
                          <tr key={r._id || idx}>
                            <td>{r.adminName || "Admin"}</td>
                            <td>{r.email || "-"}</td>
                            <td>{r.courseTitle || "-"}</td>
                            <td>{r.rating ?? "-"}</td>
                            <td>{r.review || "-"}</td>
                            <td>
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
                                  className="danger-button small"
                                >
                                  Remove
                                </button>
                              ) : (
                                <span className="empty-action">—</span>
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
              <div className="reviews-table-container">
                <div className="table-header">Student Reviews</div>
                {studentReviews.length === 0 ? (
                  <div className="empty-table">No student reviews.</div>
                ) : (
                  <div className="table-scroll">
                    <table className="reviews-table">
                      <thead>
                        <tr>
                          <th>Student</th>
                          <th>Email</th>
                          <th>Course</th>
                          <th>Review</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentReviews.map((r, idx) => (
                          <tr key={r._id || idx}>
                            <td>{r.studentName || "-"}</td>
                            <td>{r.email || "-"}</td>
                            <td>{r.courseTitle || "-"}</td>
                            <td>{r.review || "-"}</td>
                            <td>
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
                                  className="danger-button small"
                                >
                                  Remove
                                </button>
                              ) : (
                                <span className="empty-action">—</span>
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

          {/* Student Section */}
          {activeTab === "student" && (
            <div className="student-section">
              <div className="section-header">
                <h2>Assign To Student</h2>
              </div>

              <div className="student-actions">
                <button
                  onClick={onDownloadAllStudents}
                  className="secondary-button"
                >
                  Download All Student File
                </button>

                <div className="action-group" style={{ gap: 8 }}>
                  <button
                    onClick={() => setBulkModalOpen(true)}
                    className="primary-button"
                  >
                    Bulk Add Students
                  </button>
                  <button
                    onClick={async () => {
                      const toastId = showLoading('Preparing template...')
                      try {
                        const response = await apiConnector(
                          'GET',
                          adminApis.STUDENTS_TEMPLATE_API,
                          {},
                          { Authorization: `Bearer ${token}` },
                          { responseType: 'blob' }
                        )
                        const blob = new Blob([response.data], { type: 'text/csv' })
                        const url = window.URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = 'students_template.csv'
                        document.body.appendChild(a)
                        a.click()
                        a.remove()
                        window.URL.revokeObjectURL(url)
                        showSuccess('Template downloaded')
                      } catch (e) {
                        showError(e?.response?.data?.message || e.message || 'Failed to download template')
                      } finally {
                        dismissToast(toastId)
                      }
                    }}
                    className="secondary-button"
                  >
                    Download Template
                  </button>
                </div>

                <div className="action-group">
                  <button
                    onClick={onAddStudent}
                    className="primary-button"
                  >
                    Add Student
                  </button>
                  <button
                    onClick={onRemoveAllStudents}
                    className="danger-button"
                  >
                    Remove All Student
                  </button>
                </div>
              </div>

              {/* Assigned Students */}
              {students.length === 0 ? (
                <div style={{ marginTop: 8, color: TEXT_LIGHT }}>
                  No students assigned to this batch.
                </div>
              ) : (
                <div style={{ marginTop: 24 }} className="data-table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students
                        .slice(
                          studentPageIndex * studentRowsPerPage,
                          studentPageIndex * studentRowsPerPage + studentRowsPerPage
                        )
                        .map((stu) => {
                          const id = stu._id || stu.id || stu.userId || "—";
                          const name = stu.name || [stu.firstName, stu.lastName].filter(Boolean).join(" ") || "—";
                          const email = stu.email || "—";
                          const phone = stu.phone || stu.mobile || stu.contactNumber || "—";
                          return (
                            <tr key={`stu-${id}`}>
                              <td>{String(id).slice(-6)}</td>
                              <td>{name}</td>
                              <td>{email}</td>
                              <td>{phone}</td>
                              <td>
                                <button
                                  onClick={() => removeStudent(stu._id || stu.id || stu.userId)}
                                  className="danger-button small"
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>

                  {/* Pagination */}
                  <div className="table-footer">
                    <div className="rows-per-page">
                      <span>Rows per page:</span>
                      <select
                        value={studentRowsPerPage}
                        onChange={(e) => {
                          setStudentRowsPerPage(Number(e.target.value));
                          setStudentPageIndex(0);
                        }}
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                      </select>
                    </div>
                    <div className="page-info">
                      {students.length > 0 && (
                        <>
                          {studentPageIndex * studentRowsPerPage + 1}-
                          {Math.min((studentPageIndex + 1) * studentRowsPerPage, students.length)} of {students.length}
                        </>
                      )}
                    </div>
                    <div className="pagination-buttons">
                      <button
                        onClick={() => setStudentPageIndex((p) => Math.max(0, p - 1))}
                        className="pagination-button"
                      >
                        &lt;
                      </button>
                      <button
                        onClick={() =>
                          setStudentPageIndex((p) =>
                            (p + 1) * studentRowsPerPage < students.length ? p + 1 : p
                          )
                        }
                        className="pagination-button"
                      >
                        &gt;
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Add Student Modal */}
          {showStudentModal && (
            <div className="modal-overlay student-modal" onClick={() => setShowStudentModal(false)}>
              <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header sticky">
                  <h3>Add Students</h3>
                </div>
                <div className="modal-body">
                  <h2 className="modal-title">All Students</h2>

                  {/* Search */}
                  <div className="search-bar">
                    <input
                      value={studentSearch}
                      onChange={(e) => { setStudentSearch(e.target.value); setPickPageIndex(0); }}
                      placeholder="Search Student"
                    />
                  </div>

                  {studentModalLoading ? (
                    <div className="loading-state">Loading students...</div>
                  ) : studentModalError ? (
                    <div className="error-state">{studentModalError}</div>
                  ) : (
                    <>
                      <div className="data-table-container">
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>ID</th>
                              <th>Full name</th>
                              <th>Email</th>
                              <th>Mobile</th>
                              <th>Action</th>
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
                                  <td colSpan={5} className="empty-table">No students</td>
                                </tr>
                              ) : (
                                page.map((u) => {
                                  const id = u._id || u.id || u.userId || "—";
                                  const name = u.name || [u.firstName, u.lastName].filter(Boolean).join(" ") || "—";
                                  const email = u.email || "—";
                                  const phone = u.phone || u.mobile || u.contactNumber || "—";
                                  const already = students.some((s) => (s._id || s.id || s.userId) === (u._id || u.id || u.userId));
                                  return (
                                    <tr key={`${id}-${email}`}>
                                      <td>{String(id).slice(-6)}</td>
                                      <td>{name}</td>
                                      <td>{email}</td>
                                      <td>{phone}</td>
                                      <td>
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
                                          className={`action-button ${already ? "disabled" : "success"}`}
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

                        {/* Pagination */}
                        <div className="table-footer">
                          <div className="rows-per-page">
                            <span>Rows per page:</span>
                            <select 
                              value={pickRowsPerPage} 
                              onChange={(e) => { 
                                setPickRowsPerPage(Number(e.target.value)); 
                                setPickPageIndex(0); 
                              }}
                            >
                              <option value={5}>5</option>
                              <option value={10}>10</option>
                              <option value={20}>20</option>
                            </select>
                          </div>
                          <div className="page-info">
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
                          <div className="pagination-buttons">
                            <button 
                              onClick={() => setPickPageIndex((p) => Math.max(0, p - 1))} 
                              className="pagination-button"
                            >
                              &lt;
                            </button>
                            <button 
                              onClick={() => setPickPageIndex((p) => (p + 1) * pickRowsPerPage < ((studentSearch?allStudents.filter((u)=>{const name=u.name||[u.firstName,u.lastName].filter(Boolean).join(" ")||"";const email=u.email||"";const phone=u.phone||u.mobile||u.contactNumber||"";return name.toLowerCase().includes(studentSearch.toLowerCase())||email.toLowerCase().includes(studentSearch.toLowerCase())||String(phone).toLowerCase().includes(studentSearch.toLowerCase());}):allStudents).length) ? p + 1 : p)} 
                              className="pagination-button"
                            >
                              &gt;
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <div className="modal-footer">
                  <button onClick={() => setShowStudentModal(false)} className="primary-button">
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Bulk Upload Modal */}
          {bulkModalOpen && (
            <div className="modal-overlay" onClick={() => (!bulkUploading ? setBulkModalOpen(false) : {})}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header sticky">
                  <h3>Bulk Add Students</h3>
                </div>
                <div className="modal-body">
                  <p style={{ marginBottom: 12 }}>Upload a CSV/XLSX using the template format: name, email, phone, enrollmentFeePaid</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <input
                      type="file"
                      accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                      onChange={(e) => setBulkFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
                      disabled={bulkUploading}
                    />
                    <a
                      href={adminApis.STUDENTS_TEMPLATE_API}
                      target="_blank"
                      rel="noreferrer"
                      className="secondary-button"
                      style={{ textDecoration: 'none' }}
                    >
                      Download Template
                    </a>
                  </div>
                </div>
                <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  <button
                    onClick={() => setBulkModalOpen(false)}
                    className="secondary-button"
                    disabled={bulkUploading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      if (!bulkFile) return;
                      try {
                        setBulkUploading(true);
                        const res = await bulkUploadStudents({ batchId, file: bulkFile }, token);
                        // Refresh students after bulk add
                        const refreshed = await listBatchStudents(batchId, token);
                        setStudents(Array.isArray(refreshed) ? refreshed : []);
                        setBulkModalOpen(false);
                      } catch (e) {
                        // error toast already shown by api layer
                      } finally {
                        setBulkUploading(false);
                        setBulkFile(null);
                      }
                    }}
                    className="primary-button"
                    disabled={!bulkFile || bulkUploading}
                  >
                    {bulkUploading ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Basic Info Section */}
          {activeTab === "info" && (
            <div className="info-section">
              {loading ? (
                <div className="loading-state">Loading batch details...</div>
              ) : error ? (
                <div className="error-state">{error}</div>
              ) : (
                <div className="info-grid">
                  <div className="info-field">
                    <label>Batch Name</label>
                    {isEditing ? (
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter batch name"
                      />
                    ) : (
                      <div className="info-value">{batch?.name || "—"}</div>
                    )}
                  </div>
                  <div className="info-field">
                    <label>Department Name</label>
                    {isEditing ? (
                      <input
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        placeholder="Enter department name"
                      />
                    ) : (
                      <div className="info-value">{batch?.department || "—"}</div>
                    )}
                  </div>
                  <div className="info-field" style={{ gridColumn: "1 / -1" }}>
                    <label>Description</label>
                    {isEditing ? (
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Enter description"
                        rows={3}
                      />
                    ) : (
                      <div className="info-value">{batch?.description || "—"}</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Trainer Section */}
          {activeTab === "trainer" && (
            <div className="trainer-section">
              <div className="section-header">
                <h2>Assign to Trainer</h2>
                <div className="action-group">
                  <button
                    onClick={openInstructorModal}
                    className="primary-button"
                  >
                    Add Instructor
                  </button>
                  <button
                    onClick={clearAllInstructors}
                    className="danger-button"
                  >
                    Remove All Trainer
                  </button>
                </div>
              </div>

              {/* Trainer Table */}
              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Mobile No.</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignedInstructors.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="empty-table">
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
                          <tr key={id}>
                            <td>{String(id).slice(-6)}</td>
                            <td>{name}</td>
                            <td>{email}</td>
                            <td>{phone}</td>
                            <td>
                              <button
                                onClick={() => removeInstructorFromBatch(ins._id || ins.id || ins.userId)}
                                className="danger-button small"
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
            <div className="modal-overlay instructor-modal" onClick={closeInstructorModal}>
              <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header sticky">
                  <h3>All Trainers</h3>
                </div>
                <div className="modal-body">

                  {instructorsLoading ? (
                    <div className="loading-state">Loading instructors...</div>
                  ) : instructorsError ? (
                    <div className="error-state">{instructorsError}</div>
                  ) : (
                    <>
                      <div className="data-table-container">
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>ID</th>
                              <th>Name</th>
                              <th>Email</th>
                              <th>Number</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {instructors.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="empty-table">No trainers</td>
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
                                    <tr key={id}>
                                      <td>{String(id).slice(-6)}</td>
                                      <td>{name}</td>
                                      <td>{email}</td>
                                      <td>{phone}</td>
                                      <td>
                                        <button
                                          onClick={() => addInstructorToBatch(ins)}
                                          className="success-button small"
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

                        {/* Pagination */}
                        <div className="table-footer">
                          <div className="rows-per-page">
                            <span>Rows per page:</span>
                            <select 
                              value={rowsPerPage} 
                              onChange={(e) => { 
                                setRowsPerPage(Number(e.target.value)); 
                                setPageIndex(0); 
                              }}
                            >
                              <option value={5}>5</option>
                              <option value={10}>10</option>
                              <option value={20}>20</option>
                            </select>
                          </div>
                          <div className="page-info">
                            {instructors.length > 0 && (
                              <>
                                {pageIndex * rowsPerPage + 1}-{Math.min((pageIndex + 1) * rowsPerPage, instructors.length)} of {instructors.length}
                              </>
                            )}
                          </div>
                          <div className="pagination-buttons">
                            <button 
                              onClick={() => setPageIndex((p) => Math.max(0, p - 1))} 
                              className="pagination-button"
                            >
                              &lt;
                            </button>
                            <button 
                              onClick={() => setPageIndex((p) => (p + 1) * rowsPerPage < instructors.length ? p + 1 : p)} 
                              className="pagination-button"
                            >
                              &gt;
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <div className="modal-footer">
                  <button onClick={closeInstructorModal} className="primary-button">
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Footer actions (Info tab only) */}
          {activeTab === "info" && (
            <div className="action-buttons">
              {isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="secondary-button"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onSave}
                    className="teal-button"
                  >
                    Save
                  </button>
                </>
              ) : (
                <button
                  onClick={onEditToggle}
                  className="teal-button"
                >
                  Edit
                </button>
              )}
              <button
                onClick={onDelete}
                className="danger-button"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
     <style jsx>{`
     /* Main Container */
.batch-details-container {
  width: calc(100% - 250px);
  margin-left: 250px;
  min-height: 100vh;
  background-color: #f9fafb;
  padding: 2rem;
}

/* Header Section */
.batch-header {
  margin-bottom: 1.5rem;
}

.batch-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  margin-bottom: 0.5rem;
}

.breadcrumbs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.divider {
  color: #e5e7eb;
}

.active {
  color: #07A698;
  font-weight: 500;
}

/* Main Card */
.batch-card {
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}

.batch-card.selected {
  background-color: #f0fdf4;
  border: 2px solid #4ade80;
  z-index: 2;
  
  .day-number {
    background: #4ade80;
    color: white;
    font-weight: 600;
  }
}

/* Improved Tabs */
.batch-tabs {
  display: flex;
  gap: 1rem;
  padding: 0.5rem 0.25rem;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 1rem;
  overflow-x: auto;
}

.tab-button {
  background: transparent;
  border: none;
  padding: 0.75rem 1.25rem;
  cursor: pointer;
  color: #6b7280;
  font-weight: 500;
  position: relative;
  white-space: nowrap;
  transition: all 0.2s ease;
  border-radius: 6px 6px 0 0;
}

.tab-button:hover {
  background-color: #e6f7f5;
  color: #07A698;
}

.tab-button.active {
  color: #07A698;
  font-weight: 600;
}

.tab-indicator {
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 3px;
  background-color: #07A698;
  border-radius: 999px 999px 0 0;
}

/* Live Classes Section */
.live-classes-section {
  min-height: 300px;
}

.calendar-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.calendar-nav-buttons {
  display: flex;
  gap: 8px;
}

.calendar-view-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.view-toggle {
  display: flex;
  gap: 8px;
}

.month-label {
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 0.5rem;
  text-align: center;
  color: #1f2937;
  font-weight: 600;
  margin-bottom: 8px;
}

/* Month Calendar */
.month-calendar {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  background: white;
  background: #fff;
}

.week-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
  padding: 12px 0;
  font-weight: 600;
  color: #475569;
}

.weekday {
  padding: 0.5rem;
  font-weight: 600;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.day-cell {
  border-bottom: 1px solid #e5e7eb;
  border-right: 1px solid #e5e7eb;
  min-height: 120px;
  padding: 10px 8px;
  background: white;
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  display: flex;
  flex-direction: column;
  gap: 4px;
  
  &:hover {
    background: #f8fafc;
    z-index: 1;
    box-shadow: 0 0 0 1px #e2e8f0;
  }
}

.day-cell.current-month {
  background: #fff;
}

.day-cell.other-month {
  background: #f8fafc;
  color: #94a3b8;
}

.day-cell.selected {
  background: #e0f2fe;
}

.day-number {
  padding: 0.4rem;
  text-align: right;
  font-weight: 600;
  font-size: 0.9rem;
  color: #334155;
  margin-bottom: 4px;
  padding: 2px 4px;
  align-self: flex-end;
  border-radius: 12px;
  min-width: 24px;
  text-align: center;
}

.day-cell.current-month .day-number {
  color: #1e293b;
  background: #f1f5f9;
}

.day-cell.other-month .day-number {
  color: #6b7280;
}

.day-events {
  padding: 4px 2px;
  max-height: 120px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.event-item {
  font-size: 0.75rem;
  padding: 4px 6px;
  border-radius: 6px;
  margin-bottom: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  background: #f0f9ff;
  border-left: 3px solid #0ea5e9;
  color: #0369a1;
  font-weight: 500;
  transition: all 0.2s ease;
  
  &:hover {
    background: #e0f2fe;
    transform: translateX(2px);
  }
  cursor: pointer;
  transition: all 0.2s;
  margin: 2px 0;
  color: #1f2937;
  display: flex;
}

.event-chip {
  background: #e6f7f5;
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  border-left: 3px solid #07A698;
  cursor: pointer;
  transition: all 0.2s ease;
  margin: 2px 0;
  color: #1f2937;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.event-chip:hover {
  background: #d0f0ed;
  transform: translateX(2px);
}

.event-chip.past-event {
  opacity: 0.7;
  background: #f3f4f6;
  color: #64748b;
  border-left-color: #94a3b8;
}

.event-chip.past:hover {
  background: #e5e7eb;
}

.event-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  background: #3b82f6;
  color: white;
  border-radius: 9px;
  font-size: 0.7rem;
  margin-left: 4px;
  padding: 0 4px;
  font-weight: 600;
}

/* Day View */
.day-view {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  overflow: hidden;
}

.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.day-title {
  font-weight: 700;
  color: #1f2937;
}

.day-events-list {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.event-item {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 6px;
}

.event-time {
  font-size: 12px;
  color: #6b7280;
  min-width: 64px;
}

.event-title {
  font-size: 14px;
  color: #1f2937;
  font-weight: 600;
}

.time-grid {
  border-top: 1px solid #e5e7eb;
}

.time-row {
  display: grid;
  grid-template-columns: 80px 1fr;
}

.time-label {
  padding: 0.5rem;
  border-right: 1px solid #e5e7eb;
  color: #6b7280;
  text-align: right;
}

.time-slot {
  min-height: 40px;
  border-bottom: 1px solid #e5e7eb;
}

.current-time {
  background: #fef3c7;
}

/* Modal Styles */


.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 60000; /* above sidebar and navbar */
  padding: 2rem;
  padding-top: 7rem; /* start lower from top on desktop by default */
  overflow-y: auto;
}

.modal-content {
  width: min(800px, 90vw);
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);
  border: 1px solid #e5e7eb;
  overflow: hidden;
  margin: 0;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

.modal-content.large {
  width: min(1100px, 94vw);
}

.modal-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.modal-header.sticky {
  position: sticky;
  top: 0;
  background: #fff;
  z-index: 60010; /* above other modal content */
}

/* Course modal: stack title and search field to avoid overlap */
.course-modal .modal-header {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.5rem;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #1f2937;
  font-weight: 600;
}

.modal-title {
  text-align: center;
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
}

.modal-body {
  padding: 1rem;
}

.modal-body.scrollable {
  overflow-y: auto;
  max-height: 70vh;
}

.modal-footer {
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #e5e7eb;
  gap: 0.75rem;
  background-color: #f9fafb;
  position: sticky;
  bottom: 0;
  z-index: 2;
}

/* Form Grid */
.form-grid {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
}

.form-grid label {
  font-weight: 500;
  color: #1f2937;
}

.form-grid input, 
.form-grid select, 
.form-grid textarea {
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
}

.form-grid textarea {
  min-height: 80px;
  resize: vertical;
}

.textarea-label {
  align-self: start;
  margin-top: 8px;
}

.form-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

/* Search Bar */
.search-bar {
  margin-bottom: 16px;
}

.search-bar input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
}

/* Link Input Group */
.link-input-group {
  display: flex;
  gap: 8px;
}

.link-input-group input {
  flex: 1;
}

/* Button Styles */
button {
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 120ms ease;
  border: 1px solid transparent;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.primary-button {
  background-color: #07A698;
  color: white;
}

.primary-button:hover {
  background-color: #059a8c;
}

.secondary-button {
  background-color: white;
  color: #1f2937;
  border-color: #e5e7eb;
}

.secondary-button:hover {
  background-color: #f3f4f6;
}

.success-button {
  background-color: #07A698;
  color: white;
}

.success-button:hover {
  background-color: #059a8c;
}

.danger-button {
  background-color: #ef4444;
  color: white;
}

.danger-button:hover {
  background-color: #dc2626;
}

.teal-button {
  background-color: #07A698;
  color: white;
}

.teal-button:hover {
  background-color: #059a8c;
}

.action-button {
  padding: 4px 8px;
  font-size: 12px;
}

.action-button.disabled {
  background-color: #d1d5db;
  color: #6b7280;
}

.small {
  padding: 4px 8px;
  font-size: 12px;
}

/* Info Section */
.info-section {
  padding: 16px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.info-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-field label {
  font-weight: 500;
  color: #1f2937;
}

.info-value {
  padding: 8px;
  background-color: #f9fafb;
  border-radius: 4px;
}

/* Courses Section */
.courses-section {
  padding: 16px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.course-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  transition: all 120ms ease;
}

.course-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
}

.course-thumbnail {
  height: 160px;
  background-color: #f3f4f6;
}

.course-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.course-details {
  padding: 12px;
}

.course-name {
  font-weight: 600;
  margin-bottom: 4px;
}

.course-category {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 8px;
}

.course-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.course-price {
  font-weight: 600;
  color: #1f2937;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

/* Student Section */
.student-section {
  padding: 16px;
}

.student-actions {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.action-group {
  display: flex;
  gap: 8px;
}

/* Data Table */
.data-table-container {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  background-color: #f3f4f6;
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: #1f2937;
  border-bottom: 1px solid #e5e7eb;
}

.data-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
  color: #1f2937;
}

.data-table tr:last-child td {
  border-bottom: none;
}

.data-table tr:hover {
  background-color: #e6f7f5;
}

.empty-table {
  padding: 32px;
  text-align: center;
  color: #6b7280;
}

/* Table Footer */
.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

.rows-per-page {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rows-per-page select {
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
}

.page-info {
  color: #6b7280;
}

.pagination-buttons {
  display: flex;
  gap: 8px;
}

.pagination-button {
  background: white;
  border: 1px solid #e5e7eb;
  padding: 4px 8px;
  border-radius: 4px;
  min-width: 32px;
}

.pagination-button:hover {
  background: #f3f4f6;
}

/* Reviews Section */
.reviews-section {
  padding: 16px;
}

.reviews-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.review-actions {
  display: flex;
  gap: 8px;
}

.reviews-table-container {
  margin-top: 24px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.table-header {
  padding: 12px 16px;
  background-color: #f3f4f6;
  font-weight: 600;
  color: #1f2937;
  border-bottom: 1px solid #e5e7eb;
}

.reviews-table {
  width: 100%;
  border-collapse: collapse;
}

.reviews-table th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: #1f2937;
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.reviews-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
}

.reviews-table tr:last-child td {
  border-bottom: none;
}

.table-scroll {
  overflow-x: auto;
}

.empty-table {
  padding: 32px;
  text-align: center;
  color: #6b7280;
}

/* Rating Input */
.rating-input {
  width: 60px;
}

/* Empty States */
.empty-state {
  padding: 32px;
  text-align: center;
  color: #6b7280;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Loading States */
.loading-state {
  padding: 32px;
  text-align: center;
  color: #6b7280;
}

/* Error States */
.error-state {
  padding: 32px;
  text-align: center;
  color: #ef4444;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}
  /* Replace the success button class with teal */
.action-button.success {
  background-color: #0d9488; /* Teal-600 */
  color: white;
  border: 1px solid #0d9488;
}

.action-button.success:hover {
  background-color: #0f766e; /* Teal-700 */
  border-color: #0f766e;
}

.action-button.disabled {
  background-color: #e5e7eb; /* Gray-200 */
  color: #6b7280; /* Gray-500 */
  cursor: not-allowed;
}

/* Student and Instructor Modal Specific Styles */
.student-modal .modal-content,
.instructor-modal .modal-content,
.course-modal .modal-content {
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.student-modal .modal-body,
.instructor-modal .modal-body,
.course-modal .modal-body {
  flex: 1;
  overflow-y: auto;
}

/* Ensure tables in pick modals are scrollable horizontally on small screens */
.student-modal .data-table-container,
.instructor-modal .data-table-container {
  overflow-x: auto;
}

.student-modal .data-table,
.instructor-modal .data-table {
  min-width: 640px; /* allow horizontal scroll if viewport is narrow */
}

/* Add Course Modal Improvements */
.course-modal .modal-body {
  padding-top: 0;
}

.course-modal .search-bar {
  position: static;
  top: auto;
  background: transparent;
  z-index: auto;
  padding: 0;
  margin: 0;
}

/* Responsive Adjustments */
@media (max-width: 1024px) {
  .batch-details-container {
    width: calc(100% - 200px);
    margin-left: 200px;
  }
}

/* Desktop overlays should not overlap sidebar */
@media (min-width: 1024px) and (max-width: 1279px) {
  .modal-overlay {
    justify-content: flex-start;
    padding-left: calc(200px + 2rem);
  }
  .modal-content {
    width: min(760px, calc(100vw - 200px - 4rem));
  }
  .modal-content.large {
    width: min(900px, calc(100vw - 200px - 4rem));
  }
}

@media (min-width: 1280px) {
  .modal-overlay {
    justify-content: flex-start;
    padding-left: calc(250px + 2rem);
  }
  .modal-content {
    width: min(760px, calc(100vw - 250px - 4rem));
  }
  .modal-content.large {
    width: min(1000px, calc(100vw - 250px - 4rem));
  }
}

@media (max-width: 768px) {
  .batch-details-container {
    width: 100%;
    margin-left: 0;
    padding: 1rem;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .courses-grid {
    grid-template-columns: 1fr;
  }

  .student-actions {
    flex-direction: column;
    gap: 8px;
  }

  .action-group {
    justify-content: flex-end;
  }

  .modal-content {
    width: 95vw;
    margin-top: 0;
  }
  .modal-content.large {
    width: 98vw;
  }
  
  .modal-overlay {
    padding: 1rem;
    padding-top: 6rem; /* ensure clear of mobile navbar */
  }
  /* Compact modal header and title on mobile */
  .modal-header {
    padding: 0.75rem 1rem;
  }
  .modal-header h3 {
    font-size: 1.125rem; /* 18px */
  }
  
  .modal-footer {
    flex-direction: column-reverse;
    gap: 0.5rem;
  }
  
  .modal-footer button {
    width: 100%;
  }

  .batch-tabs {
    gap: 0.5rem;
  }

  .tab-button {
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
  }

  /* Tighter table cell padding in modals for small screens */
  .student-modal .data-table th,
  .student-modal .data-table td,
  .instructor-modal .data-table th,
  .instructor-modal .data-table td {
    padding: 8px 10px;
  }
}

`}</style>

</DashboardLayout>
);
}