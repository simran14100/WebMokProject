// import React, { useEffect, useMemo, useState } from "react";
// import { useSelector } from "react-redux";
// import DashboardLayout from "../components/common/DashboardLayout";
// import { listStudentNotifications } from "../services/operations/notificationApi";

// export default function Notifications() {
//   const { token } = useSelector((state) => state.auth);
//   const [loading, setLoading] = useState(true);
//   const [items, setItems] = useState([]);
//   const [error, setError] = useState("");
//   const [filterRange, setFilterRange] = useState("all"); // all | 1w | 2w | 1m

//   useEffect(() => {
//     let mounted = true;
//     (async () => {
//       setLoading(true);
//       try {
//         const data = await listStudentNotifications(token);
//         if (mounted) {
//           const arr = Array.isArray(data) ? data : [];
//           // Ensure newest on top by sorting desc on createdAt
//           arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
//           setItems(arr);
//         }
//       } catch (e) {
//         if (mounted) setError(e?.message || "Failed to fetch notifications");
//       } finally {
//         if (mounted) setLoading(false);
//       }
//     })();
//     return () => { mounted = false; };
//   }, [token]);

//   // Derived filtered + sorted list
//   const filteredItems = useMemo(() => {
//     if (!Array.isArray(items)) return [];
//     const now = Date.now();
//     let threshold = 0;
//     if (filterRange === "1w") threshold = now - 7 * 24 * 60 * 60 * 1000;
//     else if (filterRange === "2w") threshold = now - 14 * 24 * 60 * 60 * 1000;
//     else if (filterRange === "1m") threshold = now - 30 * 24 * 60 * 60 * 1000;

//     const list = threshold
//       ? items.filter((n) => new Date(n.createdAt).getTime() >= threshold)
//       : items.slice();
//     // Keep newest on top
//     list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
//     return list;
//   }, [items, filterRange]);

//   return (
//     <DashboardLayout>
//       <div className="p-6">
//         <div className="flex items-center justify-between gap-4 mb-4">
//           <h1 className="text-2xl font-semibold">Notifications</h1>
//           <div className="flex items-center gap-2">
//             <label htmlFor="notif-filter" className="text-sm text-gray-600">Filter:</label>
//             <select
//               id="notif-filter"
//               value={filterRange}
//               onChange={(e) => setFilterRange(e.target.value)}
//               className="border rounded-md px-2 py-1 text-sm"
//             >
//               <option value="all">All</option>
//               <option value="1w">Last 1 week</option>
//               <option value="2w">Last 2 weeks</option>
//               <option value="1m">Last 1 month</option>
//             </select>
//           </div>
//         </div>
//         {loading ? (
//           <div className="p-6 flex items-center justify-center">
//             <div className="animate-spin h-8 w-8 border-2 border-teal-500 border-t-transparent rounded-full" />
//           </div>
//         ) : error ? (
//           <div className="text-red-600">{error}</div>
//         ) : filteredItems.length === 0 ? (
//           <div className="text-gray-600">No notifications yet.</div>
//         ) : (
//           <ul className="space-y-3">
//             {filteredItems.map((n) => (
//               <li key={n._id} className="border rounded-lg p-4">
//                 <div className="flex items-start justify-between gap-4">
//                   <div>
//                     <div className="font-semibold">{n.title}</div>
//                     <div className="text-gray-800 whitespace-pre-line">{n.message}</div>
//                     <div className="text-xs text-gray-500 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
//                   </div>
//                 </div>
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>
//     </DashboardLayout>
//   );
// }
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import DashboardLayout from "../components/common/DashboardLayout";
import { listStudentNotifications } from "../services/operations/notificationApi";

export default function Notifications() {
  const { token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [filterRange, setFilterRange] = useState("all"); // all | 1w | 2w | 1m

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const data = await listStudentNotifications(token);
        if (mounted) {
          const arr = Array.isArray(data) ? data : [];
          arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setItems(arr);
        }
      } catch (e) {
        if (mounted) setError(e?.message || "Failed to fetch notifications");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [token]);

  // filter logic
  const filteredItems = useMemo(() => {
    if (!Array.isArray(items)) return [];
    const now = Date.now();
    let threshold = 0;
    if (filterRange === "1w") threshold = now - 7 * 24 * 60 * 60 * 1000;
    else if (filterRange === "2w") threshold = now - 14 * 24 * 60 * 60 * 1000;
    else if (filterRange === "1m") threshold = now - 30 * 24 * 60 * 60 * 1000;

    const list = threshold
      ? items.filter((n) => new Date(n.createdAt).getTime() >= threshold)
      : items.slice();

    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return list;
  }, [items, filterRange]);

  return (
    <DashboardLayout>
      <div
        style={{
          padding: "12px",
          width: "80%",
         
          marginLeft:"150px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <h1
            style={{
              fontSize: "24px",
              fontWeight: "600",
              margin: 0,
              color: "#1e293b",
            }}
          >
            Notifications
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <label
              htmlFor="notif-filter"
              style={{ fontSize: "14px", color: "#475569" }}
            >
              Filter:
            </label>
            <select
              id="notif-filter"
              value={filterRange}
              onChange={(e) => setFilterRange(e.target.value)}
              style={{
                border: "1px solid #cbd5e1",
                borderRadius: "6px",
                padding: "6px 10px",
                fontSize: "14px",
                outline: "none",
              }}
            >
              <option value="all">All</option>
              <option value="1w">Last 1 week</option>
              <option value="2w">Last 2 weeks</option>
              <option value="1m">Last 1 month</option>
            </select>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div
            style={{
              padding: "40px",
              textAlign: "center",
              fontSize: "16px",
              color: "#0891b2",
            }}
          >
            Loading notifications...
          </div>
        ) : error ? (
          <div style={{ color: "red", fontSize: "16px" }}>{error}</div>
        ) : filteredItems.length === 0 ? (
          <div style={{ color: "#64748b", fontSize: "16px" }}>
            No notifications yet.
          </div>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              backgroundColor: "#fff",
              borderRadius: "12px",
              overflow: "hidden",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            }}
          >
            <thead style={{ backgroundColor: "#07A698", color: "#fff" }}>
              <tr>
                <th
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    fontWeight: "600",
                  }}
                >
                  Title
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    fontWeight: "600",
                  }}
                >
                  Message
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    fontWeight: "600",
                  }}
                >
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((n) => (
                <tr
                  key={n._id}
                  style={{
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  <td style={{ padding: "12px 16px", fontWeight: "500" }}>
                    {n.title}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      color: "#334155",
                      whiteSpace: "pre-line",
                    }}
                  >
                    {n.message}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      fontSize: "12px",
                      color: "#64748b",
                    }}
                  >
                    {new Date(n.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  );
}
