const Enrollment = require('../models/Enrollment');
const AdmissionEnquiry = require('../models/AdmissionEnquiry');
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

exports.createAdmissionEnquiry = async (req, res) => {
    try {
        const { name, email, phone, programType, fatherName } = req.body;
        
        // Validate required fields
        if (!name || !email || !phone || !programType) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, phone, and program type are required'
            });
        }

        // Create new enquiry
        const enquiry = new AdmissionEnquiry({
            name,
            email,
            phone,
            programType: programType.toUpperCase(),
            ...(fatherName && { fatherName }),
            ...(req.user?.id && { user: req.user.id })
        });

        await enquiry.save();

        // If user is logged in, create enrollment record
        if (req.user?.id) {
            const enrollment = new Enrollment({
                user: req.user.id,
                programType: programType.toUpperCase(),
                status: 'pending'
            });
            await enrollment.save();
        }

        return res.status(201).json({
            success: true,
            message: 'Admission enquiry submitted successfully',
            enquiry
        });

    } catch (error) {
        console.error('Error creating admission enquiry:', error);
        return res.status(500).json({
            success: false,
            message: 'Error submitting admission enquiry',
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
