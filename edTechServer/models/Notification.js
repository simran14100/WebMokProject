const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // Optionally scope by audience later (e.g., roles, batch, users)
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", NotificationSchema);
