// import React, { useEffect, useMemo, useState } from "react";
// import { apiConnector } from "../services/apiConnector";
// import { profile } from "../services/apis";

// function formatDateKey(date) {
//   const y = date.getFullYear();
//   const m = String(date.getMonth() + 1).padStart(2, "0");
//   const d = String(date.getDate()).padStart(2, "0");
//   return `${y}-${m}-${d}`;
// }

// function startOfMonth(date) {
//   return new Date(date.getFullYear(), date.getMonth(), 1);
// }
// function endOfMonth(date) {
//   return new Date(date.getFullYear(), date.getMonth() + 1, 0);
// }
// function startOfWeek(date) {
//   const d = new Date(date);
//   const day = d.getDay(); // 0=Sun
//   d.setDate(d.getDate() - day);
//   d.setHours(0, 0, 0, 0);
//   return d;
// }
// function addDays(date, n) {
//   const d = new Date(date);
//   d.setDate(d.getDate() + n);
//   return d;
// }

// export default function LiveClasses() {
//   const [events, setEvents] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [calendarView, setCalendarView] = useState("month"); // "month" | "day"
//   const [calendarDate, setCalendarDate] = useState(() => {
//     const now = new Date();
//     now.setHours(0, 0, 0, 0);
//     return now;
//   });
//   const [selectedDate, setSelectedDate] = useState(() => new Date(new Date().setHours(0,0,0,0)));

//   useEffect(() => {
//     let mounted = true;
//     async function load() {
//       setLoading(true);
//       setError("");
//       try {
//         const res = await apiConnector("GET", profile.LIVE_CLASSES_API);
//         const list = res?.data?.data || res?.data || [];
//         if (mounted) setEvents(Array.isArray(list) ? list : []);
//       } catch (e) {
//         console.error("Fetch live classes failed", e);
//         if (mounted) setError("Failed to load live classes");
//       } finally {
//         if (mounted) setLoading(false);
//       }
//     }
//     load();
//     return () => {
//       mounted = false;
//     };
//   }, []);

//   const eventsByDate = useMemo(() => {
//     const map = {};
//     for (const e of events) {
//       const dt = new Date(e.startTime);
//       const key = formatDateKey(dt);
//       if (!map[key]) map[key] = [];
//       map[key].push({ ...e, date: dt });
//     }
//     // sort events per day by time
//     Object.values(map).forEach((arr) => arr.sort((a, b) => a.date - b.date));
//     return map;
//   }, [events]);

//   const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

//   const openLink = (link) => {
//     if (!link) return;
//     try {
//       window.open(link, "_blank", "noopener,noreferrer");
//     } catch (e) {
//       // no-op
//     }
//   };

//   const DayCell = ({ date }) => {
//     const key = formatDateKey(date);
//     const inMonth = date.getMonth() === calendarDate.getMonth();
//     const dayEvents = eventsByDate[key] || [];
//     const isToday = key === formatDateKey(new Date());
//     const isSelected = key === formatDateKey(selectedDate);
//     const maxShow = 3;
//     return (
//       <div
//         className={`h-28 border border-gray-200 ${inMonth ? "bg-slate-50" : "bg-gray-100"} ${isSelected ? "ring-2 ring-sky-300" : ""} hover:bg-sky-50 transition-colors`}
//         onClick={() => setSelectedDate(new Date(date))}
//       >
//         <div className="flex items-center justify-between px-2 pt-1">
//           <span className={`text-[11px] font-semibold ${inMonth ? "text-gray-700" : "text-gray-400"}`}>{String(date.getDate()).padStart(2, "0")}</span>
//           {isToday && <span className="text-[10px] px-1 py-0.5 rounded bg-blue-100 text-blue-700">Today</span>}
//         </div>
//         {dayEvents.length > 0 && (
//           <div className="px-2 pb-1">
//             {dayEvents.slice(0, maxShow).map((ev) => (
//               <button
//                 key={ev.id}
//                 className="w-full truncate text-left text-[11px] px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
//                 title={`${ev.title || "Live Class"} (${new Date(ev.startTime).toLocaleString()})`}
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   openLink(ev.link);
//                 }}
//               >
//                 {ev.title || "Live Class"}
//               </button>
//             ))}
//             {dayEvents.length > maxShow && (
//               <div className="text-[11px] text-gray-500 pl-1">+{dayEvents.length - maxShow} more</div>
//             )}
//           </div>
//         )}
//       </div>
//     );
//   };

//   const DayView = ({ date }) => {
//     const key = formatDateKey(date);
//     const list = (eventsByDate[key] || []).slice().sort((a,b) => a.date - b.date);
//     return (
//       <div className="mt-4 border border-gray-200 rounded bg-white overflow-hidden">
//         <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
//           <div className="font-semibold text-gray-800">
//             {date.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
//           </div>
//           <button className="px-2 py-1 rounded border bg-gray-100 hover:bg-gray-200" onClick={() => setCalendarView("month")}>Back to Month</button>
//         </div>
//         {list.length === 0 ? (
//           <div className="px-4 py-6 text-gray-500">No live classes on this day.</div>
//         ) : (
//           <div className="px-4 py-4 space-y-3">
//             {list.map((ev) => (
//               <div key={ev.id} className="flex items-center justify-between p-3 border rounded">
//                 <div className="flex items-center gap-3">
//                   <span className="text-xs text-gray-500 min-w-[64px]">
//                     {ev.date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
//                   </span>
//                   <div>
//                     <div className="font-medium text-gray-800">{ev.title || "Live Class"}</div>
//                     <div className="text-xs text-gray-500">{ev.batchName}</div>
//                   </div>
//                 </div>
//                 <button className="px-3 py-1.5 rounded bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => openLink(ev.link)}>Join</button>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     );
//   };

//   // Month helpers mirroring admin layout
//   const monthInfo = useMemo(() => {
//     const first = startOfMonth(calendarDate);
//     const gridStart = startOfWeek(first);
//     const days = [];
//     for (let i = 0; i < 42; i++) days.push(addDays(gridStart, i));
//     return { days };
//   }, [calendarDate]);

//   const onCalendarToday = () => {
//     const now = new Date();
//     now.setHours(0, 0, 0, 0);
//     setSelectedDate(now);
//     setCalendarDate(new Date(now));
//   };
//   const onCalendarBack = () => {
//     if (calendarView === "day") {
//       setSelectedDate((prev) => addDays(prev, -1));
//       setCalendarDate((prev) => addDays(prev, -1));
//     } else {
//       setCalendarDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
//     }
//   };
//   const onCalendarNext = () => {
//     if (calendarView === "day") {
//       setSelectedDate((prev) => addDays(prev, 1));
//       setCalendarDate((prev) => addDays(prev, 1));
//     } else {
//       setCalendarDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
//     }
//   };

//   const monthLabel = (d) => d.toLocaleDateString(undefined, { month: "long", year: "numeric" });

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <h1 className="text-2xl font-semibold mb-4 text-center">Live Classes</h1>

//       {/* Calendar Card */}
//       <div className="border border-gray-200 rounded shadow-sm bg-white">
//         {/* Top toolbar like FullCalendar */}
//         <div className="flex items-center justify-between px-2 py-2 bg-gray-100 border-b border-gray-200 rounded-t">
//           <div className="space-x-2">
//             <button className="px-3 py-1 rounded border bg-white hover:bg-gray-50" onClick={onCalendarToday}>Today</button>
//             <button className="px-3 py-1 rounded border bg-white hover:bg-gray-50" onClick={onCalendarBack}>Back</button>
//             <button className="px-3 py-1 rounded border bg-white hover:bg-gray-50" onClick={onCalendarNext}>Next</button>
//           </div>
//           <div className="text-sm font-semibold text-gray-700">
//             {monthLabel(calendarDate)}
//           </div>
//           <div className="space-x-2">
//             <button className={`px-3 py-1 rounded border ${calendarView === "month" ? "bg-white" : "bg-white"}`} onClick={() => setCalendarView("month")}>Month</button>
//             <button className={`px-3 py-1 rounded border ${calendarView === "day" ? "bg-white" : "bg-white"}`} onClick={() => setCalendarView("day")}>Day</button>
//           </div>
//         </div>

//         {/* Calendar body */}
//         {loading && <div className="p-4 text-gray-600">Loading live classes...</div>}
//         {error && <div className="p-4 text-red-600">{error}</div>}

//         {!loading && (
//           <>
//             {calendarView === "month" ? (
//               <div>
//                 {/* Week header */}
//                 <div className="grid grid-cols-7 bg-gray-100 border-b border-gray-200">
//                   {weekdays.map((w) => (
//                     <div key={w} className="py-2 text-center font-medium text-gray-700 text-sm">{w}</div>
//                   ))}
//                 </div>
//                 {/* Days grid */}
//                 <div className="grid grid-cols-7">
//                   {monthInfo.days.map((d) => (
//                     <DayCell key={d.toISOString()} date={d} />
//                   ))}
//                 </div>
//               </div>
//             ) : (
//               <DayView date={selectedDate} />
//             )}
//           </>
//         )}
//       </div>

//       {loading && <div className="mt-4 text-gray-600">Loading live classes...</div>}
//       {error && <div className="mt-4 text-red-600">{error}</div>}
//     </div>
//   );
// }


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
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isToday = key === formatDateKey(today);
    const isSelected = key === formatDateKey(selectedDate);
    const maxShow = 3;
    
    return (
      <div
        className={`h-28 border border-gray-200 ${inMonth ? "bg-slate-50" : "bg-gray-100"} ${isSelected ? "ring-2 ring-sky-300" : ""} ${isToday ? "bg-blue-50 ring-2 ring-blue-300" : ""} hover:bg-sky-50 transition-colors`}
        onClick={() => setSelectedDate(new Date(date))}
      >
        <div className="flex items-center justify-between px-2 pt-1">
          <span className={`text-[11px] font-semibold ${inMonth ? (isToday ? "text-blue-700" : "text-gray-700") : "text-gray-400"}`}>
            {String(date.getDate()).padStart(2, "0")}
          </span>
          {isToday && <span className="text-[10px] px-1 py-0.5 rounded bg-blue-100 text-blue-700">Today</span>}
        </div>
        {dayEvents.length > 0 && (
          <div className="px-2 pb-1">
            {dayEvents.slice(0, maxShow).map((ev) => (
              <button
                key={ev.id}
                className="w-full truncate text-left text-[11px] px-2 py-1 mb-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                title={`${ev.title || "Live Class"} (${new Date(ev.startTime).toLocaleString()})`}
                onClick={(e) => {
                  e.stopPropagation();
                  openLink(ev.link);
                }}
              >
                {ev.title || "Live Class"}
              </button>
            ))}
            {dayEvents.length > maxShow && (
              <div className="text-[11px] text-gray-500 pl-1">+{dayEvents.length - maxShow} more</div>
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4 text-center">Live Classes</h1>

      {/* Calendar Card */}
      <div className="border border-gray-200 rounded shadow-sm bg-white">
        {/* Top toolbar like FullCalendar */}
        <div className="flex items-center justify-between px-2 py-2 bg-gray-100 border-b border-gray-200 rounded-t">
          <div className="space-x-2">
            <button className="px-3 py-1 rounded border bg-white hover:bg-gray-50" onClick={onCalendarToday}>Today</button>
            <button className="px-3 py-1 rounded border bg-white hover:bg-gray-50" onClick={onCalendarBack}>Back</button>
            <button className="px-3 py-1 rounded border bg-white hover:bg-gray-50" onClick={onCalendarNext}>Next</button>
          </div>
          <div className="text-sm font-semibold text-gray-700">
            {monthLabel(calendarDate)}
          </div>
          <div className="space-x-2">
            <button className={`px-3 py-1 rounded border ${calendarView === "month" ? "bg-white" : "bg-white"}`} onClick={() => setCalendarView("month")}>Month</button>
            <button className={`px-3 py-1 rounded border ${calendarView === "day" ? "bg-white" : "bg-white"}`} onClick={() => setCalendarView("day")}>Day</button>
          </div>
        </div>

        {/* Calendar body */}
        {loading && <div className="p-4 text-gray-600">Loading live classes...</div>}
        {error && <div className="p-4 text-red-600">{error}</div>}

        {!loading && (
          <>
            {calendarView === "month" ? (
              <div>
                {/* Week header */}
                <div className="grid grid-cols-7 bg-gray-100 border-b border-gray-200">
                  {weekdays.map((w) => (
                    <div key={w} className="py-2 text-center font-medium text-gray-700 text-sm">{w}</div>
                  ))}
                </div>
                {/* Days grid */}
                <div className="grid grid-cols-7">
                  {monthInfo.days.map((d) => (
                    <DayCell key={d.toISOString()} date={d} />
                  ))}
                </div>
              </div>
            ) : (
              <DayView date={selectedDate} />
            )}
          </>
        )}
      </div>

      {loading && <div className="mt-4 text-gray-600">Loading live classes...</div>}
      {error && <div className="mt-4 text-red-600">{error}</div>}
    </div>
  );
}
