const User = require('../models/User');
const Course = require('../models/Course');
const CourseProgress = require('../models/CourseProgress');
const bcrypt = require('bcrypt');
const Profile = require('../models/Profile');

// Get all registered users for admin dashboard
exports.getRegisteredUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, role, search } = req.query;
        
        // Build filter object
        let filter = {};
        
        if (role && role !== 'all') {
            filter.accountType = role;
        }
        
        if (search) {
            filter.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(filter)
            .populate('additionalDetails')
            .select('-password -token -resetPasswordExpires')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const total = await User.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: {
                users,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
                totalUsers: total
            }
        });
    } catch (error) {
        console.error('Error fetching registered users:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch registered users',
            error: error.message
        });
    }
};

// Get enrolled students (students who have paid enrollment fee)
exports.getEnrolledStudents = async (req, res) => {
    try {
        const { page = 1, limit = 10, search } = req.query;
        
        let filter = {
            accountType: 'Student',
            enrollmentFeePaid: true,
            paymentStatus: 'Completed'
        };
        
        if (search) {
            filter.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const enrolledStudents = await User.find(filter)
            .populate('additionalDetails')
            .populate('courses')
            .select('-password -token -resetPasswordExpires')
            .sort({ 'paymentDetails.paidAt': -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const total = await User.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: {
                enrolledStudents,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
                totalEnrolled: total
            }
        });
    } catch (error) {
        console.error('Error fetching enrolled students:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch enrolled students',
            error: error.message
        });
    }
};

// Get all approved instructors
exports.getAllInstructors = async (req, res) => {
    try {
        const instructors = await User.find({
            accountType: 'Instructor',
            approved: true
        })
        .populate('additionalDetails')
        .select('-password -token -resetPasswordExpires')
        .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: instructors
        });
    } catch (error) {
        console.error('Error fetching all instructors:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch instructors',
            error: error.message
        });
    }
};

// Get individual instructor by ID
exports.getInstructorById = async (req, res) => {
    try {
        const { instructorId } = req.params;

        const instructor = await User.findOne({
            _id: instructorId,
            accountType: 'Instructor',
            approved: true
        })
        .populate('additionalDetails')
        .select('-password -token -resetPasswordExpires');

        if (!instructor) {
            return res.status(404).json({
                success: false,
                message: 'Instructor not found'
            });
        }

        res.status(200).json({
            success: true,
            data: instructor
        });
    } catch (error) {
        console.error('Error fetching instructor by ID:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch instructor',
            error: error.message
        });
    }
};

// Get pending instructor approvals
exports.getPendingInstructors = async (req, res) => {
    try {
        const pendingInstructors = await User.find({
            accountType: 'Instructor',
            approved: false
        })
        .populate('additionalDetails')
        .select('-password -token -resetPasswordExpires')
        .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: pendingInstructors
        });
    } catch (error) {
        console.error('Error fetching pending instructors:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch pending instructors',
            error: error.message
        });
    }
};

// Approve instructor
exports.approveInstructor = async (req, res) => {
    try {
        const { instructorId } = req.body;

        const instructor = await User.findByIdAndUpdate(
            instructorId,
            { approved: true },
            { new: true }
        ).populate('additionalDetails');

        if (!instructor) {
            return res.status(404).json({
                success: false,
                message: 'Instructor not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Instructor approved successfully',
            data: instructor
        });
    } catch (error) {
        console.error('Error approving instructor:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to approve instructor',
            error: error.message
        });
    }
};

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalStudents = await User.countDocuments({ accountType: 'Student' });
        const totalInstructors = await User.countDocuments({ accountType: 'Instructor' });
        const enrolledStudents = await User.countDocuments({ 
            accountType: 'Student', 
            enrollmentFeePaid: true 
        });
        const pendingInstructors = await User.countDocuments({ 
            accountType: 'Instructor', 
            approved: false 
        });
        const totalCourses = await Course.countDocuments();
        const totalRevenue = enrolledStudents * 1000; // 1000 rupees per student

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                totalStudents,
                totalInstructors,
                enrolledStudents,
                pendingInstructors,
                totalCourses,
                totalRevenue
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard statistics',
            error: error.message
        });
    }
};

// Admin-only: Create a Student user without OTP flow
// Required body: { name, email, phone, password, confirmPassword }
// Optional: { enrollmentFeePaid (default false) }
exports.createStudentByAdmin = async (req, res) => {
    try {
        const { name, email, phone, password, confirmPassword, enrollmentFeePaid } = req.body;

        if (!name || !email || !phone || !password || !confirmPassword) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ success: false, message: 'Passwords do not match' });
        }

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(409).json({ success: false, message: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Split name into first/last with safe fallback for single-word names
        const nameStr = String(name || '').trim().replace(/\s+/g, ' ');
        const parts = nameStr.split(' ');
        const firstName = parts.shift() || 'Student';
        const lastName = parts.length ? parts.join(' ') : '-';

        const profileDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: phone,
        });

        const user = await User.create({
            firstName,
            lastName,
            email,
            contactNumber: phone,
            password: hashedPassword,
            accountType: 'Student',
            approved: true,
            enrollmentFeePaid: Boolean(enrollmentFeePaid) || false,
            paymentStatus: Boolean(enrollmentFeePaid) ? 'Completed' : 'Pending',
            additionalDetails: profileDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${encodeURIComponent(firstName + ' ' + (lastName || ''))}`,
        });

        return res.status(201).json({
            success: true,
            message: 'Student created successfully',
            data: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                contactNumber: user.contactNumber,
                accountType: user.accountType,
                approved: user.approved,
                enrollmentFeePaid: user.enrollmentFeePaid,
                paymentStatus: user.paymentStatus,
            },
        });
    } catch (error) {
        console.error('Error creating student by admin:', error);
        return res.status(500).json({ success: false, message: 'Failed to create student', error: error.message });
    }
};

// Update user status (activate/deactivate)
exports.updateUserStatus = async (req, res) => {
    try {
        const { userId, active } = req.body;

        const user = await User.findByIdAndUpdate(
            userId,
            { active },
            { new: true }
        ).populate('additionalDetails');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: `User ${active ? 'activated' : 'deactivated'} successfully`,
            data: user
        });
    } catch (error) {
        console.error('Error updating user status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update user status',
            error: error.message
        });
    }
}; 