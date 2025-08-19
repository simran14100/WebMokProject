const User = require('../models/User');
const UserType = require('../models/UserType');
const Course = require('../models/Course');
const CourseProgress = require('../models/CourseProgress');
const bcrypt = require('bcrypt');
const Profile = require('../models/Profile');
const Batch = require('../models/Batch');
const fs = require('fs');
const path = require('path');

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
            createdByAdmin: true,
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

// Admin-only: Generic create user (Admin, Instructor, Content-management, Student)
// Required body: { name, email, phone, password, confirmPassword, accountType }
// Optional body for Student: { enrollmentFeePaid }
exports.createUserByAdmin = async (req, res) => {
    try {
        const { name, email, phone, password, confirmPassword, accountType, enrollmentFeePaid, userTypeId } = req.body;

        if (!name || !email || !phone || !password || !confirmPassword || !accountType) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ success: false, message: 'Passwords do not match' });
        }

        const validTypes = ['Admin', 'Instructor', 'Content-management', 'Student'];
        if (!validTypes.includes(accountType)) {
            return res.status(400).json({ success: false, message: 'Invalid accountType' });
        }

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(409).json({ success: false, message: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const nameStr = String(name || '').trim().replace(/\s+/g, ' ');
        const parts = nameStr.split(' ');
        const firstName = parts.shift() || 'User';
        const lastName = parts.length ? parts.join(' ') : '-';

        const profileDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: phone,
        });

        const isStudent = accountType === 'Student';
        const enrollmentPaid = isStudent ? Boolean(enrollmentFeePaid) : false;

        // Validate optional userTypeId
        let userType = null;
        if (userTypeId) {
            userType = await UserType.findById(userTypeId);
            if (!userType) {
                return res.status(400).json({ success: false, message: 'Invalid userTypeId' });
            }
        }

        const user = await User.create({
            firstName,
            lastName,
            email,
            contactNumber: phone,
            password: hashedPassword,
            accountType,
            approved: true,
            createdByAdmin: true,
            enrollmentFeePaid: enrollmentPaid,
            paymentStatus: enrollmentPaid ? 'Completed' : (isStudent ? 'Pending' : undefined),
            additionalDetails: profileDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${encodeURIComponent(firstName + ' ' + (lastName || ''))}`,
            userType: userType ? userType._id : null,
        });

        return res.status(201).json({
            success: true,
            message: `${accountType} created successfully`,
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
                userType: user.userType,
            },
        });
    } catch (error) {
        console.error('Error creating user by admin:', error);
        return res.status(500).json({ success: false, message: 'Failed to create user', error: error.message });
    }
};

// Download CSV template for bulk student upload
exports.downloadStudentsTemplate = async (req, res) => {
    const csv = [
        'name,email,phone,enrollmentFeePaid',
        'John Doe,john@example.com,9876543210,false',
        'Jane Smith,jane@example.com,9876543211,true'
    ].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="students_template.csv"');
    return res.status(200).send(csv);
};

// Bulk create students via CSV/XLSX upload and add them to a batch
// Expected: form-data with fields { batchId, file }
exports.bulkCreateStudents = async (req, res) => {
    try {
        const { batchId } = req.body;
        if (!batchId) return res.status(400).json({ success: false, message: 'batchId is required' });
        if (!req.files || !req.files.file) return res.status(400).json({ success: false, message: 'Upload file is required' });

        const batch = await Batch.findById(batchId);
        if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });

        const upload = req.files.file;
        const filepath = upload.tempFilePath || upload.path;
        const ext = (upload.name || '').toLowerCase().split('.').pop();

        let rows = [];
        if (ext === 'csv') {
            const data = fs.readFileSync(filepath, 'utf8');
            rows = parseCSV(data);
        } else if (ext === 'xlsx') {
            // Lazy-load xlsx if available
            let XLSX;
            try { XLSX = require('xlsx'); } catch (_) {}
            if (!XLSX) {
                return res.status(400).json({ success: false, message: 'XLSX not supported on server. Please upload CSV.' });
            }
            const wb = XLSX.readFile(filepath);
            const sheet = wb.SheetNames[0];
            const json = XLSX.utils.sheet_to_json(wb.Sheets[sheet], { defval: '' });
            rows = json.map(r => ({
                name: String(r.name || r.Name || '').trim(),
                email: String(r.email || r.Email || '').trim(),
                phone: String(r.phone || r.Phone || r.contactNumber || '').toString(),
                enrollmentFeePaid: normalizeBool(r.enrollmentFeePaid ?? r.EnrollmentFeePaid),
            }));
        } else {
            return res.status(400).json({ success: false, message: 'Unsupported file type. Upload CSV or XLSX.' });
        }

        // Validate rows
        const emailRe = /[^@\s]+@[^@\s]+\.[^@\s]+/;
        const results = { created: 0, skipped: 0, errors: [], details: [] };
        const toAddToBatch = [];

        for (const [index, row] of rows.entries()) {
            const line = index + 2; // considering header line
            const name = String(row.name || '').trim();
            const email = String(row.email || '').trim().toLowerCase();
            const phoneRaw = String(row.phone || '').trim();
            const phone = phoneRaw.replace(/\D/g, '');
            const enrollmentFeePaid = Boolean(row.enrollmentFeePaid);

            if (!name || !email || !phone) {
                results.skipped++; results.errors.push(`Line ${line}: Missing required fields`); continue;
            }
            if (!emailRe.test(email)) { results.skipped++; results.errors.push(`Line ${line}: Invalid email`); continue; }
            if (phone.length < 8) { results.skipped++; results.errors.push(`Line ${line}: Invalid phone`); continue; }

            const exists = await User.findOne({ email });
            if (exists) { results.skipped++; results.details.push(`Line ${line}: Email already exists, skipped`); toAddToBatch.push(exists._id); continue; }

            const password = randomPassword();
            const nameStr = name.replace(/\s+/g, ' ');
            const parts = nameStr.split(' ');
            const firstName = parts.shift() || 'Student';
            const lastName = parts.length ? parts.join(' ') : '-';

            const profileDetails = await Profile.create({
                gender: null,
                dateOfBirth: null,
                about: null,
                contactNumber: phone,
            });

            const hashedPassword = await require('bcrypt').hash(password, 10);
            const user = await User.create({
                firstName,
                lastName,
                email,
                contactNumber: phone,
                password: hashedPassword,
                accountType: 'Student',
                approved: true,
                createdByAdmin: true,
                enrollmentFeePaid: Boolean(enrollmentFeePaid) || false,
                paymentStatus: enrollmentFeePaid ? 'Completed' : 'Pending',
                additionalDetails: profileDetails._id,
                image: `https://api.dicebear.com/5.x/initials/svg?seed=${encodeURIComponent(firstName + ' ' + (lastName || ''))}`,
            });

            results.created++; toAddToBatch.push(user._id);
        }

        if (toAddToBatch.length) {
            await Batch.findByIdAndUpdate(batchId, { $addToSet: { students: { $each: toAddToBatch } } });
        }

        return res.status(200).json({ success: true, message: 'Bulk upload processed', data: results });
    } catch (error) {
        console.error('Bulk create students error:', error);
        return res.status(500).json({ success: false, message: 'Failed to process bulk upload', error: error.message });
    }
};

// Helpers
function parseCSV(text) {
    const lines = text.replace(/\r\n?/g, '\n').split('\n').filter(Boolean);
    if (!lines.length) return [];
    const headers = lines.shift().split(',').map(h => h.trim().toLowerCase());
    const idx = {
        name: headers.indexOf('name'),
        email: headers.indexOf('email'),
        phone: headers.indexOf('phone'),
        enrollmentFeePaid: headers.indexOf('enrollmentfeepaid'),
    };
    const rows = [];
    for (const line of lines) {
        const cols = splitCSVLine(line);
        rows.push({
            name: idx.name >= 0 ? cols[idx.name] : '',
            email: idx.email >= 0 ? cols[idx.email] : '',
            phone: idx.phone >= 0 ? cols[idx.phone] : '',
            enrollmentFeePaid: normalizeBool(idx.enrollmentFeePaid >= 0 ? cols[idx.enrollmentFeePaid] : false),
        });
    }
    return rows;
}
function splitCSVLine(line) {
    const result = [];
    let cur = '', inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
            if (inQuotes && line[i+1] === '"') { cur += '"'; i++; }
            else inQuotes = !inQuotes;
        } else if (ch === ',' && !inQuotes) { result.push(cur); cur = ''; }
        else cur += ch;
    }
    result.push(cur);
    return result.map(s => s.trim());
}
function normalizeBool(v) {
    if (typeof v === 'boolean') return v;
    const s = String(v).trim().toLowerCase();
    return s === '1' || s === 'true' || s === 'yes' || s === 'y';
}
function randomPassword() {
    const rand = () => Math.random().toString(36).slice(-8);
    return `${rand()}${rand()}`;
}

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