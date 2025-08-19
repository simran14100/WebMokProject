const mongoose = require('mongoose');

const UserTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    contentManagement: {
      type: Boolean,
      default: false,
    },
    trainerManagement: {
      type: Boolean,
      default: false,
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('UserType', UserTypeSchema);
