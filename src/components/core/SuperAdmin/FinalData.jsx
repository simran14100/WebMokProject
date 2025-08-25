import React, { useEffect, useState } from "react";

const ED_TEAL = "#07A698";

export default function FinalData() {
  const [showModal, setShowModal] = useState(false);
  const initialForm = {
    panel: "",
    awardYear: "",
    status: "",
    regDate: "",
    drcDate: "",
    proEnrollmentNo: "",
    batch: "",
    studentName: "",
    addressEmailContact: "",
    city: "",
    state: "",
    pincode: "",
    pgPercent: "",
    university: "",
    entranceType: "",
    mode: "",
    enrollmentNo: "",
    allocationProcess: "",
    supervisorName: "",
    supervisorDesignation: "",
    supervisorDepartment: "",
    isRegularTeacher: "",
    totalPhDNo: "",
    coSupervisorName: "",
    coSupervisorDesignation: "",
    coSupervisorDepartment: "",
    courseworkDate: "",
    courseworkStartDate: "",
    courseworkEndDate: "",
    courseworkReport: "",
    rac: "",
    researchProposalFinalizationReport: "",
    periodicalReviewReport: "",
    presentationDate: "",
    papersPublished: "",
    thesisSubmissionDate: "",
    examinerName: "",
    examinerState: "",
    plagiarismReport: "",
    thesisSendingDate: "",
    thesisReceivingDate: "",
    thesisSuggestion: "",
    vivaDate: "",
    vivaReport: "",
    awardDate: "",
    shodhgangaLink: "",
    provisionalCertificateDate: "",
    otherInformation: "",
    guideChange: "",
    motherName: "",
    fatherName: "",
    aadharNo: "",
    category: "",
    gender: "",
    title: "",
  };
  const [form, setForm] = useState(initialForm);
  const [students, setStudents] = useState([]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => document.body.classList.remove("modal-open");
  }, [showModal]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    // TODO: hook API here
    console.log("Submitting Final Data form", form);
    // Add to table locally
    setStudents((prev) => [{ id: Date.now(), ...form }, ...prev]);
    // Reset form
    setForm(initialForm);
    // Close modal
    setShowModal(false);
  };

  const FormFields = ({ onSubmitHandler }) => (
    <form className="form-grid" onSubmit={onSubmitHandler}>
      {/* Row 1 */}
      <div className="field">
        <label>Panel</label>
        <select name="panel" value={form.panel} onChange={onChange}>
          <option value="">Please select</option>
          <option value="Panel A">Panel A</option>
          <option value="Panel B">Panel B</option>
        </select>
      </div>
      <div className="field">
        <label>Award year</label>
        <input name="awardYear" value={form.awardYear} onChange={onChange} placeholder="YYYY" />
      </div>
      <div className="field">
        <label>Status</label>
        <select name="status" value={form.status} onChange={onChange}>
          <option value="">Please select</option>
          <option value="Active">Active</option>
          <option value="Completed">Completed</option>
        </select>
      </div>
      <div className="field">
        <label>Reg. Date</label>
        <input type="date" name="regDate" value={form.regDate} onChange={onChange} />
      </div>

      {/* Row 2 */}
      <div className="field">
        <label>DRC Date</label>
        <input type="date" name="drcDate" value={form.drcDate} onChange={onChange} />
      </div>
      <div className="field">
        <label>Pro Enrollment No.</label>
        <input name="proEnrollmentNo" value={form.proEnrollmentNo} onChange={onChange} />
      </div>
      <div className="field">
        <label>Batch</label>
        <input name="batch" value={form.batch} onChange={onChange} />
      </div>
      <div className="field">
        <label>Student Name</label>
        <input name="studentName" value={form.studentName} onChange={onChange} />
      </div>

      {/* Row 3 */}
      <div className="field col-4">
        <label>Address with Email & Contact</label>
        <input name="addressEmailContact" value={form.addressEmailContact} onChange={onChange} />
      </div>

      {/* Row 4 */}
      <div className="field">
        <label>City</label>
        <input name="city" value={form.city} onChange={onChange} />
      </div>
      <div className="field">
        <label>State</label>
        <input name="state" value={form.state} onChange={onChange} />
      </div>
      <div className="field">
        <label>Pincode</label>
        <input name="pincode" value={form.pincode} onChange={onChange} />
      </div>
      <div className="field">
        <label>P.G Percent</label>
        <input name="pgPercent" value={form.pgPercent} onChange={onChange} />
      </div>

      {/* Row 5 */}
      <div className="field col-2">
        <label>University</label>
        <input name="university" value={form.university} onChange={onChange} />
      </div>
      <div className="field col-2">
        <label>Type of Entrance</label>
        <input name="entranceType" value={form.entranceType} onChange={onChange} />
      </div>

      {/* Row 6 */}
      <div className="field">
        <label>Mode</label>
        <select name="mode" value={form.mode} onChange={onChange}>
          <option value="">Please select</option>
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
        </select>
      </div>
      <div className="field">
        <label>Enrollment No</label>
        <input name="enrollmentNo" value={form.enrollmentNo} onChange={onChange} />
      </div>
      <div className="field col-2">
        <label>Process for allocation of Supervisor & Co- Supervisor</label>
        <input name="allocationProcess" value={form.allocationProcess} onChange={onChange} />
      </div>

      {/* Row 7 */}
      <div className="field">
        <label>Supervisor Name</label>
        <input name="supervisorName" value={form.supervisorName} onChange={onChange} />
      </div>
      <div className="field">
        <label>Supervisor Designation</label>
        <input name="supervisorDesignation" value={form.supervisorDesignation} onChange={onChange} />
      </div>
      <div className="field">
        <label>Supervisor Department</label>
        <input name="supervisorDepartment" value={form.supervisorDepartment} onChange={onChange} />
      </div>
      <div className="field">
        <label>Regular teacher?</label>
        <select name="isRegularTeacher" value={form.isRegularTeacher} onChange={onChange}>
          <option value="">Please select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </div>

      {/* Row 8 */}
      <div className="field">
        <label>Total no. of Ph.D. scholars</label>
        <input name="totalPhDNo" value={form.totalPhDNo} onChange={onChange} />
      </div>
      <div className="field">
        <label>Co-Supervisor Name</label>
        <input name="coSupervisorName" value={form.coSupervisorName} onChange={onChange} />
      </div>
      <div className="field">
        <label>Co-Supervisor Desig.</label>
        <input name="coSupervisorDesignation" value={form.coSupervisorDesignation} onChange={onChange} />
      </div>
      <div className="field">
        <label>Co-Supervisor Dept</label>
        <input name="coSupervisorDepartment" value={form.coSupervisorDepartment} onChange={onChange} />
      </div>

      {/* Row 9 */}
      <div className="field">
        <label>Coursework Date</label>
        <input type="date" name="courseworkDate" value={form.courseworkDate} onChange={onChange} />
      </div>
      <div className="field">
        <label>Coursework Start Date</label>
        <input type="date" name="courseworkStartDate" value={form.courseworkStartDate} onChange={onChange} />
      </div>
      <div className="field">
        <label>Coursework End Date</label>
        <input type="date" name="courseworkEndDate" value={form.courseworkEndDate} onChange={onChange} />
      </div>
      <div className="field">
        <label>Coursework Report</label>
        <input name="courseworkReport" value={form.courseworkReport} onChange={onChange} />
      </div>

      {/* Row 10 */}
      <div className="field">
        <label>RAC</label>
        <select name="rac" value={form.rac} onChange={onChange}>
          <option value="">Please select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </div>
      <div className="field col-3">
        <label>Report of research proposal topic finalization</label>
        <input name="researchProposalFinalizationReport" value={form.researchProposalFinalizationReport} onChange={onChange} />
      </div>
      <div className="field col-4">
        <label>Report of the periodical reviews</label>
        <input name="periodicalReviewReport" value={form.periodicalReviewReport} onChange={onChange} />
      </div>

      {/* Row 11 */}
      <div className="field">
        <label>Date of presentation</label>
        <input type="date" name="presentationDate" value={form.presentationDate} onChange={onChange} />
      </div>
      <div className="field">
        <label>No. of Paper Published</label>
        <input name="papersPublished" value={form.papersPublished} onChange={onChange} />
      </div>
      <div className="field">
        <label>Thesis Submission Date</label>
        <input type="date" name="thesisSubmissionDate" value={form.thesisSubmissionDate} onChange={onChange} />
      </div>
      <div className="field">
        <label>Examiner Name</label>
        <input name="examinerName" value={form.examinerName} onChange={onChange} />
      </div>

      {/* Row 12 */}
      <div className="field">
        <label>Examiner State</label>
        <input name="examinerState" value={form.examinerState} onChange={onChange} />
      </div>
      <div className="field">
        <label>Plagiarism Report</label>
        <input name="plagiarismReport" value={form.plagiarismReport} onChange={onChange} />
      </div>
      <div className="field">
        <label>Thesis Sending Date</label>
        <input type="date" name="thesisSendingDate" value={form.thesisSendingDate} onChange={onChange} />
      </div>
      <div className="field">
        <label>Thesis Receiving Date</label>
        <input type="date" name="thesisReceivingDate" value={form.thesisReceivingDate} onChange={onChange} />
      </div>

      {/* Row 13 */}
      <div className="field">
        <label>Thesis Suggestion</label>
        <input name="thesisSuggestion" value={form.thesisSuggestion} onChange={onChange} />
      </div>
      <div className="field">
        <label>Viva Date</label>
        <input type="date" name="vivaDate" value={form.vivaDate} onChange={onChange} />
      </div>
      <div className="field">
        <label>Viva Report</label>
        <input name="vivaReport" value={form.vivaReport} onChange={onChange} />
      </div>
      <div className="field">
        <label>Date of Award</label>
        <input type="date" name="awardDate" value={form.awardDate} onChange={onChange} />
      </div>

      {/* Row 14 */}
      <div className="field col-3">
        <label>Shodhganga Link</label>
        <input name="shodhgangaLink" value={form.shodhgangaLink} onChange={onChange} />
      </div>
      <div className="field">
        <label>Prov. Certificate date</label>
        <input type="date" name="provisionalCertificateDate" value={form.provisionalCertificateDate} onChange={onChange} />
      </div>

      {/* Row 15 */}
      <div className="field col-2">
        <label>Other Information</label>
        <input name="otherInformation" value={form.otherInformation} onChange={onChange} />
      </div>
      <div className="field col-2">
        <label>Guide Change</label>
        <input name="guideChange" value={form.guideChange} onChange={onChange} />
      </div>

      {/* Row 16 */}
      <div className="field">
        <label>Mother Name</label>
        <input name="motherName" value={form.motherName} onChange={onChange} />
      </div>
      <div className="field">
        <label>Father Name</label>
        <input name="fatherName" value={form.fatherName} onChange={onChange} />
      </div>
      <div className="field">
        <label>Aadhar No.</label>
        <input name="aadharNo" value={form.aadharNo} onChange={onChange} />
      </div>
      <div className="field">
        <label>Category</label>
        <input name="category" value={form.category} onChange={onChange} />
      </div>

      {/* Row 17 */}
      <div className="field">
        <label>Gender</label>
        <select name="gender" value={form.gender} onChange={onChange}>
          <option value="">Please select</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div className="field col-3">
        <label>Title</label>
        <input name="title" value={form.title} onChange={onChange} />
      </div>

      <div className="actions">
        <button type="button" className="secondary" onClick={() => showModal ? setShowModal(false) : setForm(form)}>Cancel</button>
        <button type="submit" className="primary">Submit</button>
      </div>
    </form>
  );

  return (
    <div className="finaldata-container">
      <div className="header">
        <h1>Final Data</h1>
        <button
          className="primary"
          onClick={() => {
            setForm(initialForm);
            setShowModal(true);
          }}
        >
          Add New Student
        </button>
      </div>

      {/* Table view */}
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Enrollment No</th>
              <th>Panel</th>
              <th>Status</th>
              <th>Reg. Date</th>
              <th>Supervisor</th>
              <th>Coursework Date</th>
              <th>Thesis Submission</th>
              <th>Viva Date</th>
              <th>Award Date</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan={11} className="empty">No records yet. Click "Add New Student" to create one.</td>
              </tr>
            ) : (
              students.map((s, idx) => (
                <tr key={s.id}>
                  <td>{idx + 1}</td>
                  <td>{s.studentName || "-"}</td>
                  <td>{s.enrollmentNo || "-"}</td>
                  <td>{s.panel || "-"}</td>
                  <td>{s.status || "-"}</td>
                  <td>{s.regDate || "-"}</td>
                  <td>{s.supervisorName || "-"}</td>
                  <td>{s.courseworkDate || "-"}</td>
                  <td>{s.thesisSubmissionDate || "-"}</td>
                  <td>{s.vivaDate || "-"}</td>
                  <td>{s.awardDate || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Student</h2>
              <button className="close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <FormFields onSubmitHandler={onSubmit} />
          </div>
        </div>
      )}

      <style jsx>{`
        .finaldata-container { padding: 16px;  margin-top:10rem}
        .header { display: flex; align-items: center; justify-content: space-between; }
        h1 { font-size: 28px; font-weight: 800; color: ${ED_TEAL}; }
        .primary { background: ${ED_TEAL}; color: #fff; border: none; border-radius: 8px; padding: 10px 14px; font-weight: 600; cursor: pointer; }
        .secondary { background: #f3f4f6; color: #111827; border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px 14px; font-weight: 600; cursor: pointer; }

        /* Prevent background scroll when modal is open */
        :global(body.modal-open) { overflow: hidden; }

        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.55); backdrop-filter: blur(2px); display: flex; align-items: center; justify-content: center; z-index: 100000; padding: 20px; pointer-events: auto; }
        .modal { position: relative; z-index: 100001; width: min(96vw, 1200px); max-height: 92vh; background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 24px 64px rgba(0,0,0,0.35); }
        .modal-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid #e5e7eb; background: #f9fafb; }
        .close { background: transparent; border: none; font-size: 22px; cursor: pointer; color: #64748b; }

        /* Make content scroll inside the modal rather than the page */
        .form-grid { padding: 16px; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; overflow: auto; max-height: calc(92vh - 60px); }
        @media (max-width: 1024px) {
          .modal { width: 96vw; max-height: 94vh; }
          .form-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); max-height: calc(94vh - 60px); }
        }
        .table-wrapper { margin-top: 16px; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; background: #fff; }
        .data-table { width: 100%; border-collapse: collapse; }
        .data-table thead { background: #f9fafb; }
        .data-table th, .data-table td { padding: 10px 12px; border-bottom: 1px solid #e5e7eb; text-align: left; font-size: 14px; }
        .data-table th { color: #374151; font-weight: 700; }
        .data-table td { color: #111827; }
        .data-table .empty { text-align: center; padding: 24px; color: #6b7280; }
        .field { display: flex; flex-direction: column; gap: 6px; }
        .field.col-2 { grid-column: span 2 / span 2; }
        .field.col-3 { grid-column: span 3 / span 3; }
        .field.col-4 { grid-column: span 4 / span 4; }
        label { font-size: 12px; color: #374151; }
        input, select, textarea { border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px 12px; outline: none; font-size: 14px; }
        textarea { min-height: 80px; }
        .actions { grid-column: 1 / -1; display: flex; justify-content: flex-end; gap: 8px; padding-top: 8px; }

        @media (max-width: 1024px) { .form-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        @media (max-width: 640px) { .form-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
