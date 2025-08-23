// import React, { useEffect, useState } from "react";
// import { useSelector } from "react-redux";
// import DashboardLayout from "../components/common/DashboardLayout";
// import { createNotification, listAdminNotifications, deleteNotification } from "../services/operations/notificationApi";

// export default function AdminNotifications() {
//   const { token } = useSelector((state) => state.auth);
//   const [loading, setLoading] = useState(true);
//   const [items, setItems] = useState([]);
//   const [title, setTitle] = useState("");
//   const [message, setMessage] = useState("");
//   const [posting, setPosting] = useState(false);

//   const fetchData = async () => {
//     setLoading(true);
//     try {
//       const data = await listAdminNotifications(token);
//       setItems(Array.isArray(data) ? data : []);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { fetchData(); }, [token]);

//   const onPost = async (e) => {
//     e.preventDefault();
//     if (!title.trim() || !message.trim()) return;
//     setPosting(true);
//     try {
//       await createNotification(token, { title: title.trim(), message: message.trim() });
//       setTitle("");
//       setMessage("");
//       await fetchData();
//     } finally {
//       setPosting(false);
//     }
//   };

//   const onDelete = async (id) => {
//     if (!window.confirm("Delete this notification?")) return;
//     await deleteNotification(token, id);
//     await fetchData();
//   };

//   return (
//     <DashboardLayout>
//       <div className="p-6 space-y-6">
//         <h1 className="text-2xl font-semibold">Notifications</h1>

//         <form onSubmit={onPost} className="border rounded-lg p-4 space-y-3">
//           <h2 className="text-lg font-semibold">Create Notification</h2>
//           <div>
//             <label className="block text-sm font-medium mb-1">Title</label>
//             <input
//               type="text"
//               className="w-full border rounded-md p-2"
//               value={title}
//               onChange={(e) => setTitle(e.target.value)}
//               placeholder="e.g., Holiday Notice"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium mb-1">Message</label>
//             <textarea
//               className="w-full border rounded-md p-2"
//               rows={4}
//               value={message}
//               onChange={(e) => setMessage(e.target.value)}
//               placeholder="Enter notification details"
//             />
//           </div>
//           <button
//             type="submit"
//             disabled={posting}
//             className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-60"
//           >
//             {posting ? "Posting..." : "Post Notification"}
//           </button>
//         </form>

//         <div className="border rounded-lg">
//           <div className="p-4 border-b font-semibold">Latest Notifications</div>
//           {loading ? (
//             <div className="p-6 flex items-center justify-center">
//               <div className="animate-spin h-8 w-8 border-2 border-teal-500 border-t-transparent rounded-full" />
//             </div>
//           ) : items.length === 0 ? (
//             <div className="p-6 text-gray-600">No notifications posted yet.</div>
//           ) : (
//             <ul className="divide-y">
//               {items.map((n) => (
//                 <li key={n._id} className="p-4 flex items-start justify-between gap-4">
//                   <div>
//                     <div className="font-semibold">{n.title}</div>
//                     <div className="text-gray-800 whitespace-pre-line">{n.message}</div>
//                     <div className="text-xs text-gray-500 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
//                   </div>
//                   <button className="text-red-600 hover:underline" onClick={() => onDelete(n._id)}>Delete</button>
//                 </li>
//               ))}
//             </ul>
//           )}
//         </div>
//       </div>
//     </DashboardLayout>
//   );
// }


import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import DashboardLayout from "../components/common/DashboardLayout";
import { createNotification, listAdminNotifications, deleteNotification } from "../services/operations/notificationApi";

// Color theme constants
const ED_TEAL = '#07A698';
const ED_TEAL_DARK = '#059a8c';
const BORDER = '#e0e0e0';
const TEXT_DARK = '#191A1F';

export default function AdminNotifications() {
  const { token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [posting, setPosting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await listAdminNotifications(token);
      setItems(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [token]);

  const onPost = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    setPosting(true);
    try {
      await createNotification(token, { title: title.trim(), message: message.trim() });
      setTitle("");
      setMessage("");
      await fetchData();
    } finally {
      setPosting(false);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("Delete this notification?")) return;
    await deleteNotification(token, id);
    await fetchData();
  };

  return (
    <DashboardLayout>
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', width:"80%" , marginLeft:"150px"}}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: TEXT_DARK }}>Notifications</h1>

        <form 
          onSubmit={onPost} 
          style={{ 
            border: `1px solid ${BORDER}`, 
            borderRadius: '0.5rem', 
            padding: '1rem', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '0.75rem' 
          }}
        >
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: TEXT_DARK }}>Create Notification</h2>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem', color: TEXT_DARK }}>Title</label>
            <input
              type="text"
              style={{ 
                width: '100%', 
                border: `1px solid ${BORDER}`, 
                borderRadius: '0.375rem', 
                padding: '0.5rem',
                color: TEXT_DARK
              }}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Holiday Notice"
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem', color: TEXT_DARK }}>Message</label>
            <textarea
              style={{ 
                width: '100%', 
                border: `1px solid ${BORDER}`, 
                borderRadius: '0.375rem', 
                padding: '0.5rem',
                color: TEXT_DARK
              }}
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter notification details"
            />
          </div>
          <button
            type="submit"
            disabled={posting}
            style={{ 
              padding: '0.5rem 1rem', 
              backgroundColor: ED_TEAL, 
              color: 'white', 
              borderRadius: '0.375rem', 
              border: 'none',
              cursor: 'pointer',
              fontWeight: 500,
              opacity: posting ? 0.6 : 1,
              alignSelf: 'flex-start',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => !posting && (e.target.style.backgroundColor = ED_TEAL_DARK)}
            onMouseOut={(e) => !posting && (e.target.style.backgroundColor = ED_TEAL)}
          >
            {posting ? "Posting..." : "Post Notification"}
          </button>
        </form>

        <div style={{ border: `1px solid ${BORDER}`, borderRadius: '0.5rem' }}>
  <div style={{ padding: '1rem', borderBottom: `1px solid ${BORDER}`, fontWeight: 600, color: TEXT_DARK }}>
    Latest Notifications
  </div>
  {loading ? (
    <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ 
        animation: 'spin 1s linear infinite', 
        height: '2rem', 
        width: '2rem', 
        border: `2px solid ${ED_TEAL}`, 
        borderTop: 'transparent',
        borderRadius: '50%' 
      }} />
    </div>
  ) : items.length === 0 ? (
    <div style={{ padding: '1.5rem', color: '#6B7280' }}>No notifications posted yet.</div>
  ) : (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f9fafb' }}>
            <th style={{ 
              padding: '0.75rem 1rem', 
              textAlign: 'left', 
              borderBottom: `1px solid ${BORDER}`, 
              fontWeight: 600, 
              color: TEXT_DARK 
            }}>
              Title
            </th>
            <th style={{ 
              padding: '0.75rem 1rem', 
              textAlign: 'left', 
              borderBottom: `1px solid ${BORDER}`, 
              fontWeight: 600, 
              color: TEXT_DARK 
            }}>
              Message
            </th>
            <th style={{ 
              padding: '0.75rem 1rem', 
              textAlign: 'left', 
              borderBottom: `1px solid ${BORDER}`, 
              fontWeight: 600, 
              color: TEXT_DARK 
            }}>
              Date
            </th>
            <th style={{ 
              padding: '0.75rem 1rem', 
              textAlign: 'center', 
              borderBottom: `1px solid ${BORDER}`, 
              fontWeight: 600, 
              color: TEXT_DARK 
            }}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((n) => (
            <tr key={n._id} style={{ borderBottom: items.indexOf(n) !== items.length - 1 ? `1px solid ${BORDER}` : 'none' }}>
              <td style={{ padding: '1rem', fontWeight: 600, color: TEXT_DARK }}>
                {n.title}
              </td>
              <td style={{ padding: '1rem', color: TEXT_DARK, maxWidth: '300px' }}>
                <div style={{ 
                  whiteSpace: 'nowrap', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis' 
                }} title={n.message}>
                  {n.message}
                </div>
              </td>
              <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#6B7280' }}>
                {new Date(n.createdAt).toLocaleString()}
              </td>
              <td style={{ padding: '1rem', textAlign: 'center' }}>
                <button 
                  onClick={() => onDelete(n._id)}
                  style={{ 
                    color: '#DC2626', 
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '0.25rem',
                    fontWeight: 500
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = '#FEE2E2';
                    e.target.style.opacity = 0.8;
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.opacity = 1;
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</div>
        
        {/* Add CSS for the spin animation */}
        <style>
          {`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    </DashboardLayout>
  );
}