const AdmissionConfirmation = require('../models/AdmissionConfirmation');
const User = require('../models/User');
const Course = require('../models/Course');

// Create admission confirmation record (called when payment is verified)
exports.createAdmissionConfirmation = async (studentId, courseId, paymentDetails) => {
    try {
        const admissionConfirmation = await AdmissionConfirmation.create({
            student: studentId,
            course: courseId,
            paymentDetails: {
                orderId: paymentDetails.orderId,
                paymentId: paymentDetails.paymentId,
                amount: paymentDetails.amount,
                paidAt: paymentDetails.paidAt
            }
        });

        return admissionConfirmation;
    } catch (error) {
        console.error('Error creating admission confirmation:', error);
        throw error;
    }
};

// Get all admission confirmations (for admin/super admin)
exports.getAllAdmissionConfirmations = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, search } = req.query;
        
        // Build filter object
        let filter = {};
        
        if (status && status !== 'all') {
            filter.status = status;
        }
        
        if (search) {
            // Search in student name, course name, or payment ID
            filter.$or = [
                { 'paymentDetails.orderId': { $regex: search, $options: 'i' } },
                { 'paymentDetails.paymentId': { $regex: search, $options: 'i' } }
            ];
        }

        const admissionConfirmations = await AdmissionConfirmation.find(filter)
            .populate('student', 'firstName lastName email')
            .populate('course', 'courseName price')
            .populate('confirmedBy', 'firstName lastName')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const total = await AdmissionConfirmation.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: {
                admissionConfirmations,
                totalPages: Math.ceil(total / limit),
                currentPage: parseInt(page),
                totalConfirmations: total
            }
        });
    } catch (error) {
        console.error('Error fetching admission confirmations:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch admission confirmations',
            error: error.message
        });
    }
};

// Get admission confirmation by ID
exports.getAdmissionConfirmationById = async (req, res) => {
    try {
        const { confirmationId } = req.params;

        const admissionConfirmation = await AdmissionConfirmation.findById(confirmationId)
            .populate('student', 'firstName lastName email phoneNumber')
            .populate('course', 'courseName price description')
            .populate('confirmedBy', 'firstName lastName');

        if (!admissionConfirmation) {
            return res.status(404).json({
                success: false,
                message: 'Admission confirmation not found'
            });
        }

        res.status(200).json({
            success: true,
            data: admissionConfirmation
        });
    } catch (error) {
        console.error('Error fetching admission confirmation:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch admission confirmation',
            error: error.message
        });
    }
};

// Confirm admission
exports.confirmAdmission = async (req, res) => {
    try {
        const { confirmationId } = req.params;
        const { notes } = req.body;
        const adminId = req.user.id;

        const admissionConfirmation = await AdmissionConfirmation.findById(confirmationId);

        if (!admissionConfirmation) {
            return res.status(404).json({
                success: false,
                message: 'Admission confirmation not found'
            });
        }

        if (admissionConfirmation.status !== 'Pending') {
            return res.status(400).json({
                success: false,
                message: 'Admission confirmation is already processed'
            });
        }

        // Update admission confirmation status
        const updatedConfirmation = await AdmissionConfirmation.findByIdAndUpdate(
            confirmationId,
            {
                status: 'Confirmed',
                confirmedBy: adminId,
                confirmedAt: new Date(),
                notes: notes
            },
            { new: true }
        ).populate('student', 'firstName lastName email')
         .populate('course', 'courseName')
         .populate('confirmedBy', 'firstName lastName');

        res.status(200).json({
            success: true,
            message: 'Admission confirmed successfully',
            data: updatedConfirmation
        });
    } catch (error) {
        console.error('Error confirming admission:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to confirm admission',
            error: error.message
        });
    }
};

// Reject admission
exports.rejectAdmission = async (req, res) => {
    try {
        const { confirmationId } = req.params;
        const { rejectionReason, notes } = req.body;
        const adminId = req.user.id;

        if (!rejectionReason) {
            return res.status(400).json({
                success: false,
                message: 'Rejection reason is required'
            });
        }

        const admissionConfirmation = await AdmissionConfirmation.findById(confirmationId);

        if (!admissionConfirmation) {
            return res.status(404).json({
                success: false,
                message: 'Admission confirmation not found'
            });
        }

        if (admissionConfirmation.status !== 'Pending') {
            return res.status(400).json({
                success: false,
                message: 'Admission confirmation is already processed'
            });
        }

        // Update admission confirmation status
        const updatedConfirmation = await AdmissionConfirmation.findByIdAndUpdate(
            confirmationId,
            {
                status: 'Rejected',
                confirmedBy: adminId,
                confirmedAt: new Date(),
                rejectionReason: rejectionReason,
                notes: notes
            },
            { new: true }
        ).populate('student', 'firstName lastName email')
         .populate('course', 'courseName')
         .populate('confirmedBy', 'firstName lastName');

        res.status(200).json({
            success: true,
            message: 'Admission rejected successfully',
            data: updatedConfirmation
        });
    } catch (error) {
        console.error('Error rejecting admission:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reject admission',
            error: error.message
        });
    }
};

// Get admission confirmation statistics
exports.getAdmissionStats = async (req, res) => {
    try {
        const totalPending = await AdmissionConfirmation.countDocuments({ status: 'Pending' });
        const totalConfirmed = await AdmissionConfirmation.countDocuments({ status: 'Confirmed' });
        const totalRejected = await AdmissionConfirmation.countDocuments({ status: 'Rejected' });
        const totalConfirmations = await AdmissionConfirmation.countDocuments();

        // Get today's confirmations
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayConfirmations = await AdmissionConfirmation.countDocuments({
            createdAt: { $gte: today }
        });

        res.status(200).json({
            success: true,
            data: {
                totalPending,
                totalConfirmed,
                totalRejected,
                totalConfirmations,
                todayConfirmations
            }
        });
    } catch (error) {
        console.error('Error fetching admission stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch admission statistics',
            error: error.message
        });
    }
}; 