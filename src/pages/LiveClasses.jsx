import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from "react-hot-toast";
import DashboardLayout from "../components/common/DashboardLayout";

function formatDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}
function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}
function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}
function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

// Day view helpers
function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function LiveClasses() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.profile);
  const { batchId: urlBatchId } = useParams();
  
  // Use a hardcoded batch ID for testing
  const TEST_BATCH_ID = "689f561b05ca720224de841f"; // Frontend development batch ID
  const [currentBatchId, setCurrentBatchId] = useState(urlBatchId || user?.batchId || TEST_BATCH_ID);
  const batchId = currentBatchId; // Use the state variable
  
  console.log('Using batch ID:', batchId); // Debug log
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [calendarView, setCalendarView] = useState("month"); // "month" | "day"
  const [calendarDate, setCalendarDate] = useState(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  });
  const [selectedDate, setSelectedDate] = useState(() => new Date(new Date().setHours(0,0,0,0)));
  const [now, setNow] = useState(() => new Date());
  const [rowHeight, setRowHeight] = useState(40);
  const [rowBaseOffset, setRowBaseOffset] = useState(0);
  const gridRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    
    async function load() {
      console.log('Starting to load live classes...');
      
      setLoading(true);
      setError("");
      
      try {
        // Get token from Redux store and local storage for debugging
        const token = user?.token || localStorage.getItem('token');
        console.log('Auth Debug:', { 
          hasUser: !!user,
          hasTokenInUser: !!user?.token,
          hasTokenInStorage: !!localStorage.getItem('token'),
          batchId 
        });
        
        if (!token) {
          const errorMsg = 'No authentication token found. Please log in again.';
          console.error(errorMsg);
          throw new Error(errorMsg);
        }
        
        console.log('Making API request to fetch live classes...');
        const startTime = Date.now();
        
        // Fetch live classes for the student
        const response = await fetch(`http://localhost:4000/api/v1/profile/live-classes`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          mode: 'cors'
        });
        
        const responseTime = Date.now() - startTime;
        console.log(`API Response received in ${responseTime}ms`, { 
          status: response.status,
          statusText: response.statusText,
          url: response.url
        });
        
        if (response.status === 401) {
          console.log('Received 401 Unauthorized, redirecting to login...');
          localStorage.removeItem('token');
          window.location.href = '/login';
          return;
        }
        
        if (!response.ok) {
          const errorText = await response.text();
          let errorData;
          try {
            errorData = JSON.parse(errorText);
            console.error('API Error Response:', errorData);
          } catch (e) {
            console.error('Failed to parse error response:', errorText);
            throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
          }
          throw new Error(errorData.message || `Failed to fetch live classes. Status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('API Response Data:', result);
        
        if (result?.data && Array.isArray(result.data)) {
          const liveClasses = result.data
            .filter(lc => lc && (lc._id || lc.id)) // Filter out any invalid entries
            .map(lc => {
              try {
                const startTime = lc.startTime ? new Date(lc.startTime) : new Date();
                const event = {
                  ...lc,
                  id: lc._id || lc.id,
                  date: startTime, // Use 'date' for consistency with calendar component
                  start: startTime,
                  end: lc.endTime ? new Date(lc.endTime) : new Date(startTime.getTime() + 60 * 60 * 1000), // Default 1 hour duration
                  title: lc.title || 'Untitled Class',
                  description: lc.description || '',
                  link: lc.link || lc.meetingUrl || '',
                  batchName: lc.batch?.name || 'Batch'
                };
                console.log('Processed event:', event);
                return event;
              } catch (error) {
                console.error('Error processing live class:', { lc, error });
                return null;
              }
            })
            .filter(Boolean); // Remove any null entries from mapping errors
          
          console.log(`Successfully processed ${liveClasses.length} live classes`);
          if (mounted) {
            setEvents(liveClasses);
            setLoading(false);
          }
        } else {
          console.log('No live classes found or invalid data format:', result);
          if (mounted) {
            setEvents([]);
            setLoading(false);
          }
        }
      } catch (e) {
        console.error('Error in load:', {
          message: e.message,
          stack: e.stack,
          response: e.response?.data
        });
        if (mounted) {
          setError(`Error: ${e.message || 'Failed to load live classes'}`);
          setLoading(false);
        }
      }
    }
    
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // Tick every second for current time line
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Measure actual row height and base offset to position the time line accurately
  useEffect(() => {
    const measure = () => {
      if (!gridRef.current) return;
      const rows = gridRef.current.querySelectorAll('.time-row');
      if (!rows || rows.length === 0) return;
      const firstRow = rows[0];
      const rowRect = firstRow.getBoundingClientRect();
      const gridRect = gridRef.current.getBoundingClientRect();
      let computedHour = rowRect.height;
      if (rows.length > 1) {
        const secondRect = rows[1].getBoundingClientRect();
        const dy = secondRect.top - rowRect.top;
        if (dy > 0) computedHour = dy; // account for borders/margins
      }
      const base = Math.max(0, rowRect.top - gridRect.top);
      if (computedHour && Math.abs(computedHour - rowHeight) > 0.5) setRowHeight(computedHour);
      if (Math.abs(base - rowBaseOffset) > 0.5) setRowBaseOffset(base);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [rowHeight, rowBaseOffset]);

  const eventsByDate = useMemo(() => {
    console.log('Grouping events by date. Total events:', events.length);
    const groups = {};
    events.forEach((ev) => {
      try {
        if (!ev || !ev.date) {
          console.warn('Skipping invalid event (missing date):', ev);
          return;
        }
        const key = formatDateKey(ev.date);
        if (!groups[key]) groups[key] = [];
        groups[key].push(ev);
      } catch (error) {
        console.error('Error processing event:', { ev, error });
      }
    });
    console.log('Grouped events by date:', groups);
    return groups;
  }, [events]);

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const openLink = (raw) => {
    const s = String(raw || "").trim();
    if (!s) return;
    try {
      // 1) explicit URL
      const urlMatch = s.match(/https?:\/\/[\w\-._~:?#\[\]@!$&'()*+,;=%/]+/i);
      let target = urlMatch ? urlMatch[0] : "";
      // 2) known meeting domains
      if (!target) {
        const domainMatch = s.match(/(?:meet\.google\.com|zoom\.us|teams\.microsoft\.com|webex\.com)[^\s,]*/i);
        if (domainMatch) target = domainMatch[0].replace(/^\/+/, "");
      }
      // 3) Google Meet code
      if (!target) {
        const meetCode = s.match(/\b([a-z]{3}-[a-z]{4}-[a-z]{3})\b/i);
        if (meetCode) target = `meet.google.com/${meetCode[1]}`;
      }
      if (!target) return;
      if (!/^https?:\/\//i.test(target)) target = `https://${target}`;
      window.open(target, "_blank", "noopener,noreferrer");
    } catch {}
  };

  const DayCell = ({ date }) => {
    const key = formatDateKey(date);
    const dayEvents = eventsByDate[key] || [];
    const maxShow = 2; // Max events to show in day cell
    const isToday = isSameDay(date, new Date());
    const isCurrentMonth = date.getMonth() === calendarDate.getMonth();
    
    return (
      <div
        className={`day-cell ${isToday ? 'today' : ''} ${
          !isCurrentMonth ? 'other-month' : ''
        }`}
        onClick={() => {
          setSelectedDate(date);
          setCalendarView('day');
        }}
      >
        <div className="day-number">
          {date.getDate()}
          {dayEvents.length > 0 && (
            <span className="event-count">{dayEvents.length}</span>
          )}
        </div>
        {dayEvents.length > 0 && (
          <div className="day-events">
            {dayEvents.slice(0, maxShow).map((ev) => {
              const isPast = ev.date.getTime() < Date.now() && !isSameDay(ev.date, new Date());
              return (
                <div
                  key={ev.id}
                  className={`event-preview ${isPast ? 'past' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (ev.link) {
                      window.open(ev.link, '_blank', 'noopener,noreferrer');
                    }
                  }}
                  title={`${ev.title || 'Live Class'} - ${ev.date.toLocaleTimeString()}`}
                >
                  <div className="event-title">{ev.title || 'Live Class'}</div>
                  <div className="event-time">
                    {ev.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  {isPast && <span className="status-badge done">Done</span>}
                </div>
              );
            })}
            {dayEvents.length > maxShow && (
              <div
                className="more-events"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedDate(date);
                  setCalendarView("day");
                }}
                role="button"
                tabIndex={0}
              >
                +{dayEvents.length - maxShow} more
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const DayView = ({ date }) => {
    const key = formatDateKey(date);
    const list = (eventsByDate[key] || []).slice().sort((a,b) => a.date - b.date);
    return (
      <div className="mt-4 border border-gray-200 rounded bg-white overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <div className="font-semibold text-gray-800">
            {date.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </div>
          <button className="px-2 py-1 rounded border bg-gray-100 hover:bg-gray-200" onClick={() => setCalendarView("month")}>Back to Month</button>
        </div>
        {list.length === 0 ? (
          <div className="px-4 py-6 text-gray-500">No live classes on this day.</div>
        ) : (
          <div className="px-4 py-4 space-y-3">
            {list.map((ev) => (
              <div key={ev.id} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 min-w-[84px]">
                    {ev.date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </span>
                  <div>
                    <div className="font-medium text-gray-800">{ev.title || "Live Class"}</div>
                    <div className="text-xs text-gray-500">{ev.batchName}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {ev.date.getTime() < Date.now() && !isSameDay(ev.date, new Date()) && (
                    <span className="status-badge done">Done</span>
                  )}
                  <button
                    className="px-3 py-1.5 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
                    onClick={() => {
                      const isPast = ev.date.getTime() < Date.now() && !isSameDay(ev.date, new Date());
                      if (isPast) {
                        try { toast.error("This class link has expired."); } catch {}
                        return;
                      }
                      openLink(ev.link);
                    }}
                  >
                    Join
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Month helpers mirroring admin layout
  const monthInfo = useMemo(() => {
    const first = startOfMonth(calendarDate);
    const gridStart = startOfWeek(first);
    const days = [];
    for (let i = 0; i < 42; i++) days.push(addDays(gridStart, i));
    return { days };
  }, [calendarDate]);

  const onCalendarToday = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    setSelectedDate(now);
    setCalendarDate(new Date(now));
  };
  const onCalendarBack = () => {
    if (calendarView === "day") {
      setSelectedDate((prev) => addDays(prev, -1));
      setCalendarDate((prev) => addDays(prev, -1));
    } else {
      setCalendarDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    }
  };
  const onCalendarNext = () => {
    if (calendarView === "day") {
      setSelectedDate((prev) => addDays(prev, 1));
      setCalendarDate((prev) => addDays(prev, 1));
    } else {
      setCalendarDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    }
  };

  const monthLabel = (d) => d.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  return (
    <DashboardLayout>
    <div className="page-wrap">
      <h1 className="text-2xl font-semibold mb-4 text-center "
      >Live Classes</h1>

      <div className="live-classes-section">
        {/* Toolbar */}
        <div className="calendar-toolbar">
          <div className="calendar-nav-buttons">
            <button onClick={onCalendarToday} className="secondary-button">Today</button>
            <button onClick={onCalendarBack} className="secondary-button">Back</button>
            <button onClick={onCalendarNext} className="secondary-button">Next</button>
          </div>
          <div className="calendar-view-controls">
            <div className="view-toggle">
              <button onClick={() => setCalendarView("month")} className={`secondary-button ${calendarView === "month" ? "active" : ""}`}>Month</button>
              <button onClick={() => setCalendarView("day")} className={`secondary-button ${calendarView === "day" ? "active" : ""}`}>Day</button>
            </div>
          </div>
        </div>

        {/* Month label */}
        {calendarView === "month" && (
          <div className="month-label">{monthLabel(calendarDate)}</div>
        )}

        {/* Calendar */}
        {!loading && calendarView === "month" && (
          <div className="month-calendar">
            <div className="week-header">
              {weekdays.map((w) => (
                <div key={w} className="weekday">{w}</div>
              ))}
            </div>
            <div className="days-grid">
              {monthInfo.days.map((d) => (
                <DayCell key={d.toISOString()} date={d} />
              ))}
            </div>
          </div>
        )}

        {!loading && calendarView === "day" && (
          <div className="day-view">
            <div className="day-header">
              <div className="day-title">
                {selectedDate.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </div>
              <button onClick={() => setCalendarView("month")} className="secondary-button">Back to Month</button>
            </div>
            {(() => {
              const key = formatDateKey(selectedDate);
              const list = (eventsByDate[key] || []).slice().sort((a, b) => a.date - b.date);
              if (list.length === 0) return null;
              return (
                <div className="day-events-list">
                  {list.map((ev) => (
                    <div key={ev.id} className="event-item">
                      <span className="event-time">{ev.date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
                      <span className="event-title">{ev.title || "Live Class"}</span>
                      <button className="secondary-button small" onClick={() => openLink(ev.link)}>Join</button>
                    </div>
                  ))}
                </div>
              );
            })()}
            <div className="time-grid" ref={gridRef}>
              {isSameDay(selectedDate, now) && (
                (() => {
                  const midnight = new Date(now);
                  midnight.setHours(0, 0, 0, 0);
                  const elapsedMs = now.getTime() - midnight.getTime();
                  const hoursFloat = elapsedMs / 3600000; // hours since local midnight
                  const offset = rowBaseOffset + hoursFloat * rowHeight;
                  return <div className="current-time-line" style={{ top: `${offset}px` }}><span className="current-time-dot" /></div>;
                })()
              )}
              {Array.from({ length: 24 }, (_, h) => (
                <div key={h} className="time-row">
                  <div className="time-label">{`${String(h).padStart(2, "0")}:00`}</div>
                  <div className="time-slot" />
                </div>
              ))}
            </div>
          </div>
        )}

        {loading && <div className="loading-state">Loading live classes...</div>}
        {error && <div className="error-state">{error}</div>}
      </div>

      <style jsx>{`
        .page-wrap { width: 100%; max-width: 80%; margin: 0 auto; padding: 10px; padding-top: 0; padding-left: 50px; margin-top: -32px; }
        .live-classes-section { min-height: 300px; }
        .calendar-toolbar { display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; }
        .calendar-nav-buttons { display:flex; gap:8px; }
        .calendar-view-controls { display:flex; align-items:center; gap:8px; }
        .view-toggle { display:flex; gap:8px; }
        .month-label { background:#f3f4f6; border:1px solid #e5e7eb; border-radius:8px; padding:0.5rem; text-align:center; color:#1f2937; font-weight:600; margin-bottom:8px; }
        .month-calendar { border:1px solid #e5e7eb; border-radius:8px; overflow:hidden; background:#fff; }
        .week-header { display:grid; grid-template-columns:repeat(7,1fr); background:#f3f4f6; border-bottom:1px solid #e5e7eb; }
        .weekday { padding:8px; font-weight:600; color:#1f2937; text-align:center; }
        .days-grid { display:grid; grid-template-columns:repeat(7,1fr); background:#fff; }
        .day-cell { border-bottom:1px solid #e5e7eb; border-right:1px solid #e5e7eb; height:96px; cursor:pointer; transition:background 120ms ease; }
        .days-grid .day-cell:nth-child(7n) { border-right:none; }
        .days-grid .day-cell:nth-last-child(-n+7) { border-bottom:none; }
        .day-cell.current-month { background:#fff; }
        .day-cell.other-month { background:#f3f4f6; }
        .day-cell.selected { background:#e0f2fe; }
        .day-number { padding:0.4rem; text-align:right; font-weight:600; }
        .day-cell.current-month .day-number { color:#1f2937; }
        .day-cell.other-month .day-number { color:#6b7280; }
        .day-events { padding:0 6px 8px; }
        .event-chip { font-size:12px; background:#eef2ff; color:#3730a3; border-radius:6px; padding:2px 6px; margin:4px 0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; width:100%; text-align:left; border:none; }
        .event-chip:hover { filter:brightness(0.95); }
        .more-events { font-size:12px; color:#6b7280; padding-left:4px; }
        .status-badge { display:inline-block; margin-left:6px; font-size:10px; padding:1px 6px; border-radius:9999px; border:1px solid #e5e7eb; color:#374151; background:#f9fafb; }
        .status-badge.done { color:#065f46; border-color:#a7f3d0; background:#d1fae5; }
        .day-view { border:1px solid #e5e7eb; border-radius:8px; background:#fff; overflow:hidden; }
        .day-header { display:flex; justify-content:space-between; align-items:center; padding:0.75rem 1rem; border-bottom:1px solid #e5e7eb; }
        .day-title { font-weight:700; color:#1f2937; }
        .day-events-list { padding:0.75rem 1rem; border-bottom:1px solid #e5e7eb; }
        .event-item { display:flex; gap:8px; align-items:center; margin-bottom:6px; }
        .event-time { font-size:12px; color:#6b7280; min-width:64px; }
        .event-title { font-size:14px; color:#1f2937; font-weight:600; flex:1; }
        .time-grid { border-top:1px solid #e5e7eb; }
        .time-grid { position:relative; }
        .time-row { display:grid; grid-template-columns:80px 1fr; }
        .time-label { padding:0.5rem; border-right:1px solid #e5e7eb; color:#6b7280; text-align:right; }
        .time-slot { min-height:40px; border-bottom:1px solid #e5e7eb; }
        .current-time-line { position:absolute; left:0; right:0; height:0; border-top:2px solid #22c55e; z-index:2; }
        .current-time-dot { position:absolute; left:80px; width:8px; height:8px; background:#22c55e; border-radius:9999px; top:-4px; }
        .loading-state { margin-top:12px; color:#6b7280; }
        .error-state { margin-top:12px; color:#ef4444; }
        button { padding:8px 16px; border-radius:6px; font-weight:500; cursor:pointer; transition:all 120ms ease; border:1px solid transparent; }
        .secondary-button { background:#fff; color:#1f2937; border-color:#e5e7eb; }
        .secondary-button:hover { background:#f3f4f6; }
        .secondary-button.active { background:#f3f4f6; }
        .small { padding:4px 8px; font-size:12px; }
      `}</style>
    </div>
    </DashboardLayout>
  );
}
