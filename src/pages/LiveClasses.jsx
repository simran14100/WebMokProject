


import React, { useEffect, useMemo, useState } from "react";
import { apiConnector } from "../services/apiConnector";
import { profile } from "../services/apis";

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

export default function LiveClasses() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [calendarView, setCalendarView] = useState("month"); // "month" | "day"
  const [calendarDate, setCalendarDate] = useState(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  });
  const [selectedDate, setSelectedDate] = useState(() => new Date(new Date().setHours(0,0,0,0)));

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await apiConnector("GET", profile.LIVE_CLASSES_API);
        const list = res?.data?.data || res?.data || [];
        if (mounted) setEvents(Array.isArray(list) ? list : []);
      } catch (e) {
        console.error("Fetch live classes failed", e);
        if (mounted) setError("Failed to load live classes");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const eventsByDate = useMemo(() => {
    const map = {};
    for (const e of events) {
      const dt = new Date(e.startTime);
      const key = formatDateKey(dt);
      if (!map[key]) map[key] = [];
      map[key].push({ ...e, date: dt });
    }
    // sort events per day by time
    Object.values(map).forEach((arr) => arr.sort((a, b) => a.date - b.date));
    return map;
  }, [events]);

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const openLink = (link) => {
    if (!link) return;
    try {
      window.open(link, "_blank", "noopener,noreferrer");
    } catch (e) {
      // no-op
    }
  };

  const DayCell = ({ date }) => {
    const key = formatDateKey(date);
    const inMonth = date.getMonth() === calendarDate.getMonth();
    const dayEvents = eventsByDate[key] || [];
    const isSelected = key === formatDateKey(selectedDate);
    const maxShow = 3;
    const cellClass = `day-cell ${isSelected ? "selected" : ""} ${inMonth ? "current-month" : "other-month"}`;
    return (
      <div className={cellClass} onClick={() => setSelectedDate(new Date(date))}>
        <div className="day-number">{String(date.getDate()).padStart(2, "0")}</div>
        {dayEvents.length > 0 && (
          <div className="day-events">
            {dayEvents.slice(0, maxShow).map((ev) => (
              <div
                key={ev.id}
                className="event-chip"
                title={ev.title || "Live Class"}
                onClick={(e) => {
                  e.stopPropagation();
                  openLink(ev.link);
                }}
                role="button"
                tabIndex={0}
              >
                {ev.title || "Live Class"}
              </div>
            ))}
            {dayEvents.length > maxShow && (
              <div className="more-events">+{dayEvents.length - maxShow} more</div>
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
                  <span className="text-xs text-gray-500 min-w-[64px]">
                    {ev.date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <div>
                    <div className="font-medium text-gray-800">{ev.title || "Live Class"}</div>
                    <div className="text-xs text-gray-500">{ev.batchName}</div>
                  </div>
                </div>
                <button className="px-3 py-1.5 rounded bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => openLink(ev.link)}>Join</button>
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
    <div className="page-wrap">
      <h1 className="text-2xl font-semibold mb-4 text-center">Live Classes</h1>

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
                      <span className="event-time">{ev.date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      <span className="event-title">{ev.title || "Live Class"}</span>
                      <button className="secondary-button small" onClick={() => openLink(ev.link)}>Join</button>
                    </div>
                  ))}
                </div>
              );
            })()}
            <div className="time-grid">
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
        .page-wrap { max-width: 1100px; margin: 0 auto; padding: 16px; }
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
        .day-view { border:1px solid #e5e7eb; border-radius:8px; background:#fff; overflow:hidden; }
        .day-header { display:flex; justify-content:space-between; align-items:center; padding:0.75rem 1rem; border-bottom:1px solid #e5e7eb; }
        .day-title { font-weight:700; color:#1f2937; }
        .day-events-list { padding:0.75rem 1rem; border-bottom:1px solid #e5e7eb; }
        .event-item { display:flex; gap:8px; align-items:center; margin-bottom:6px; }
        .event-time { font-size:12px; color:#6b7280; min-width:64px; }
        .event-title { font-size:14px; color:#1f2937; font-weight:600; flex:1; }
        .time-grid { border-top:1px solid #e5e7eb; }
        .time-row { display:grid; grid-template-columns:80px 1fr; }
        .time-label { padding:0.5rem; border-right:1px solid #e5e7eb; color:#6b7280; text-align:right; }
        .time-slot { min-height:40px; border-bottom:1px solid #e5e7eb; }
        .loading-state { margin-top:12px; color:#6b7280; }
        .error-state { margin-top:12px; color:#ef4444; }
        button { padding:8px 16px; border-radius:6px; font-weight:500; cursor:pointer; transition:all 120ms ease; border:1px solid transparent; }
        .secondary-button { background:#fff; color:#1f2937; border-color:#e5e7eb; }
        .secondary-button:hover { background:#f3f4f6; }
        .secondary-button.active { background:#f3f4f6; }
        .small { padding:4px 8px; font-size:12px; }
      `}</style>
    </div>
  );
}
