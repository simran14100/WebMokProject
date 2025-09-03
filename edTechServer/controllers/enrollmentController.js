const Enrollment = require('../models/Enrollment');
const User = require('../models/User');

exports.checkEnrollment = async (req, res) => {
    try {
        const enrollment = await Enrollment.findOne({ user: req.user.id })
            .sort({ createdAt: -1 });

        if (!enrollment) {
            return res.status(200).json({
                success: true,
                isEnrolled: false,
                status: 'not_enrolled',
                message: 'No enrollment found for this user'
            });
        }

        return res.status(200).json({
            success: true,
            isEnrolled: enrollment.status === 'approved',
            enrollment: {
                status: enrollment.status,
                programType: enrollment.programType,
                rejectionReason: enrollment.rejectionReason,
                appliedAt: enrollment.appliedAt,
                approvedAt: enrollment.approvedAt
            }
        });
    } catch (error) {
        console.error('Error checking enrollment:', error);
        return res.status(500).json({
            success: false,
            message: 'Error checking enrollment status',
            error: error.message
        });
    }
};

exports.getEnrollmentStatus = async (req, res) => {
    try {
        const enrollment = await Enrollment.findOne({ user: req.user.id })
            .sort({ createdAt: -1 });

        if (!enrollment) {
            return res.status(200).json({
                success: true,
                status: 'not_enrolled',
                message: 'No enrollment found for this user'
            });
        }

        return res.status(200).json({
            success: true,
            status: enrollment.status,
            enrollment: {
                programType: enrollment.programType,
                rejectionReason: enrollment.rejectionReason,
                appliedAt: enrollment.appliedAt,
                approvedAt: enrollment.approvedAt
            }
        });
    } catch (error) {
        console.error('Error getting enrollment status:', error);
        return res.status(500).json({
            success: false,
            message: 'Error getting enrollment status',
            error: error.message
        });
    }
};
