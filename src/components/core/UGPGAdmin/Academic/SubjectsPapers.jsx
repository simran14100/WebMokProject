import React, { useEffect, useMemo, useState } from "react";
import { listUGPGSubjects, createUGPGSubject, updateUGPGSubject, deleteUGPGSubject } from "../../../../services/ugpgSubjectApi";
import { listDepartments } from "../../../../services/departmentApi";

export default function SubjectsPapers() {

  const ED_TEAL = "#14b8a6";
  const BORDER = "#e5e7eb";
  const TEXT = "#334155";

  // ===== Subjects =====
  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [sSearch, setSSearch] = useState("");
  const [sPage, setSPage] = useState(1);
  const S_LIMIT = 10;
  const [sLoading, setSLoading] = useState(false);
  const [sModal, setSModal] = useState(false);
  const [sEdit, setSEdit] = useState(null); // id
  const editSubject = useMemo(() => subjects.find((x) => x.id === sEdit) || null, [subjects, sEdit]);
  const [sForm, setSForm] = useState({ department: "", name: "", status: "Active" });

  const loadDepartments = async () => {
    try {
      const res = await listDepartments();
      const list = res?.data?.data || [];
      setDepartments(list.map((d) => ({ id: d._id, name: d.name })));
    } catch {}
  };

  const loadSubjects = async (opts = {}) => {
    const page = opts.page ?? sPage;
    const q = opts.q ?? sSearch;
    setSLoading(true);
    try {
      console.log('Fetching subjects with params:', { q, page, limit: S_LIMIT });
      const res = await listUGPGSubjects({ q, page, limit: S_LIMIT });
      
      if (!res) {
        console.error('No response received from API');
        throw new Error('No response from server');
      }
      
      console.log('Subjects API Response:', {
        status: res.status,
        statusText: res.statusText,
        data: res.data,
        headers: res.headers
      });
      
      if (!res.data || !res.data.success) {
        console.error('API returned error:', res.data?.message || 'Unknown error');
        throw new Error(res.data?.message || 'Failed to load subjects');
      }
      
      const items = Array.isArray(res.data.data) 
        ? res.data.data.map((s) => ({
            id: s._id, 
            name: s.name, 
            departmentId: s.department?._id || "", 
            departmentName: s.department?.name || "", 
            status: s.status || "Active"
          }))
        : [];
      
      console.log('Processed subjects:', items);
      setSubjects(items);
      
    } catch (error) {
      console.error('Error in loadSubjects:', {
        name: error.name,
        message: error.message,
        response: error.response?.data,
        stack: error.stack
      });
      setSubjects([]);
      // Show error to user
      alert(`Failed to load subjects: ${error.message}`);
    } finally { 
      setSLoading(false); 
    }
  };

  const openAddSubject = () => { setSEdit(null); setSForm({ department: departments[0]?.id || "", name: "", status: "Active" }); setSModal(true); };
  const openEditSubject = (row) => { setSEdit(row.id); setSForm({ department: row.departmentId, name: row.name, status: row.status || "Active" }); setSModal(true); };
  const saveSubject = async () => {
    if (!sForm.department || !sForm.name.trim()) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      const payload = { 
        name: sForm.name.trim(), 
        status: sForm.status || 'Active',
        department: sForm.department // This should be the department ID
      };
      
      console.log('[saveSubject] Sending payload:', payload);
      
      let response;
      if (editSubject) {
        console.log(`[saveSubject] Updating subject ${editSubject.id}`);
        response = await updateUGPGSubject(editSubject.id, payload);
      } else {
        console.log('[saveSubject] Creating new subject');
        response = await createUGPGSubject(payload);
      }
      
      console.log('[saveSubject] API Response:', response);
      
      if (!response || !response.data) {
        throw new Error('No response data received from server');
      }
      
      if (response.data.success === false) {
        throw new Error(response.data.message || 'Failed to save subject');
      }
      
      // Success - close modal and refresh data
      setSModal(false); 
      setSPage(1);
      await loadSubjects({ page: 1 });
      
    } catch (error) {
      console.error('[saveSubject] Error details:', {
        name: error.name,
        message: error.message,
        response: error.response?.data,
        stack: error.stack
      });
      
      const errorMessage = error.response?.data?.message || 
                         error.message || 
                         'Failed to save subject. Please try again.';
      
      alert(`Error: ${errorMessage}`);
    }
  };
  const removeSubject = async (row) => { if (!window.confirm("Delete this subject?")) return; await deleteUGPGSubject(row.id); setSubjects((prev)=>prev.filter(x=>x.id!==row.id)); };

  useEffect(() => { loadDepartments(); loadSubjects({ page: 1 }); /* eslint-disable-next-line */ }, []);
  useEffect(() => { const t = setTimeout(()=>{ setSPage(1); loadSubjects({ page:1, q: sSearch }); }, 400); return ()=>clearTimeout(t); /* eslint-disable-next-line */ }, [sSearch]);

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", gap: 8, marginTop: "6rem", marginBottom: 12 }}>
        <button style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${ED_TEAL}`, background: ED_TEAL, color: "#fff" }}>Subjects</button>
      </div>

        <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: TEXT, marginLeft:"120px" }}>Subject Management</h3>
            <button onClick={openAddSubject} style={{ background: ED_TEAL, color: "#fff", border: `1px solid ${ED_TEAL}`, padding: "8px 12px", borderRadius: 8, marginRight:"120px" }}>+ Add Subject</button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "12px 120px" }}>
            <label style={{ color: TEXT }}>Search:</label>
            <input value={sSearch} onChange={(e)=>{ setSPage(1); setSSearch(e.target.value); }} placeholder="Search subject..." style={{ border: `1px solid ${BORDER}`, borderRadius: 8, padding: "8px 10px", width: 240 }} />
          </div>
          <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden", width:"80%", marginLeft:"120px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 4fr 4fr 2fr", background: ED_TEAL, color: "#fff", padding: "12px 16px", fontWeight: 500 }}>
              <div>Action</div>
              <div>School</div>
              <div>Subject</div>
              <div>Status</div>
            </div>
            <div>
              {sLoading ? (
                <div style={{ padding: 12, color: TEXT }}>Loading...</div>
              ) : (
                subjects.map((row) => (
                  <div key={row.id} style={{ display: "grid", gridTemplateColumns: "2fr 4fr 4fr 2fr", alignItems: "center", padding: "12px 16px", borderBottom: `1px solid ${BORDER}` }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={()=>openEditSubject(row)} style={{ padding: "6px 10px", borderRadius: 6, border: `1px solid ${ED_TEAL}`, background: "#fff", color: ED_TEAL }}>Edit</button>
                      <button onClick={()=>removeSubject(row)} style={{ padding: "6px 10px", borderRadius: 6, border: `1px solid #ef4444`, background: "#fff", color: "#ef4444" }}>Delete</button>
                    </div>
                    <div style={{ color: TEXT }}>{row.departmentName}</div>
                    <div style={{ color: TEXT }}>{row.name}</div>
                    <div style={{ color: TEXT }}>{row.status}</div>
                  </div>
                ))
              )}
              {(!sLoading && subjects.length === 0) && (
                <div style={{ padding: 12, color: TEXT }}>No subjects found.</div>
              )}
            </div>
          </div>

          {sModal && (
            <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
              <div style={{ background: "#fff", borderRadius: 12, width: 520, maxWidth: "92vw", padding: 16, border: `1px solid ${BORDER}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <h4 style={{ fontSize: 16, fontWeight: 600, color: TEXT }}>{editSubject ? "Edit Subject" : "Add Subject"}</h4>
                  <button onClick={()=>setSModal(false)} style={{ padding: 6, borderRadius: 6, border: `1px solid ${BORDER}` }}>✕</button>
                </div>
                <div style={{ display: "grid", gap: 12 }}>
                  <div>
                    <label style={{ display: "block", color: TEXT, marginBottom: 6 }}>School</label>
                    <select value={sForm.department} onChange={(e)=>setSForm(v=>({...v, department: e.target.value}))} style={{ width: "100%", border: `1px solid ${BORDER}`, borderRadius: 8, padding: 8 }}>
                      <option value="">Select School</option>
                      {departments.map((d)=>(<option key={d.id} value={d.id}>{d.name}</option>))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", color: TEXT, marginBottom: 6 }}>Subject Name</label>
                    <input value={sForm.name} onChange={(e)=>setSForm(v=>({...v, name: e.target.value}))} placeholder="Enter subject name" style={{ width: "100%", border: `1px solid ${BORDER}`, borderRadius: 8, padding: 8 }} />
                  </div>
                  <div>
                    <label style={{ display: "block", color: TEXT, marginBottom: 6 }}>Status</label>
                    <select value={sForm.status} onChange={(e)=>setSForm(v=>({...v, status: e.target.value}))} style={{ width: "100%", border: `1px solid ${BORDER}`, borderRadius: 8, padding: 8 }}>
                      <option>Active</option>
                      <option>Inactive</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
                  <button onClick={()=>setSModal(false)} style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${BORDER}` }}>Cancel</button>
                  <button onClick={saveSubject} style={{ padding: "8px 12px", borderRadius: 8, background: ED_TEAL, color: "#fff", border: `1px solid ${ED_TEAL}` }}>Save</button>
                </div>
              </div>
            </div>
          )}
        </div>
    </div>
  );
}
