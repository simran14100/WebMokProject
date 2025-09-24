const mongoose = require("mongoose");

const VisitorLogSchema = new mongoose.Schema(
  {
    // Allow dynamic values managed via VisitPurpose and VisitDepartment
    visitPurpose: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    fatherName: { type: String, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true },
    idNumber: { type: String, trim: true },
    address: { type: String, trim: true },
    visitFrom: { type: String, trim: true },
    date: { type: String, trim: true }, // store as string to match UI for now
    timeIn: { type: String, trim: true },
    timeOut: { type: String, trim: true },
    totalVisitors: { type: Number, default: 1 },
    remarks: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("VisitorLog", VisitorLogSchema);
