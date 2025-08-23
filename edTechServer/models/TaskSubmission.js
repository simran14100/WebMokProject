const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String },
    name: { type: String },
    size: { type: Number },
  },
  { _id: false }
);

const TaskSubmissionSchema = new mongoose.Schema(
  {
    task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
    text: { type: String, default: '' },
    links: [{ type: String }],
    files: [FileSchema],
    submittedAt: { type: Date, default: Date.now },
    score: { type: Number },
    feedback: { type: String },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

TaskSubmissionSchema.index({ task: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('TaskSubmission', TaskSubmissionSchema);