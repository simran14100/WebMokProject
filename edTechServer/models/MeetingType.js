const mongoose = require('mongoose');
mongoose.plugin(require('mongoose-paginate-v2'));

const meetingTypeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Meeting type name is required'],
        trim: true,
        unique: true
    },
    description: {
        type: String,
        trim: true
    },
    duration: {
        type: Number, // in minutes
        required: [true, 'Duration is required'],
        min: [5, 'Duration must be at least 5 minutes']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    color: {
        type: String,
        default: '#1890ff',
        match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please enter a valid hex color code']
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better query performance
meetingTypeSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('MeetingType', meetingTypeSchema);
