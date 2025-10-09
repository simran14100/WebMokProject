const User = require('../models/User');
const UserType = require('../models/UserType');
const Course = require('../models/Course');
const CourseProgress = require('../models/CourseProgress');
const AdmissionConfirmation = require('../models/AdmissionConfirmation');
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

// List students enrolled in courses (UG/PG or others) - separate from UG/PG enrollment list
// Optional query: courseId to filter by a specific course
exports.getCourseStudents = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, courseId } = req.query;

        const filter = {
            accountType: 'Student',
            // must have at least one course
            ...(courseId ? { courses: courseId } : { courses: { $exists: true, $not: { $size: 0 } } }),
        };

        if (search) {
            filter.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }

        const [items, total] = await Promise.all([
            User.find(filter)
                .populate('additionalDetails')
                .populate('courses')
                .select('-password -token -resetPasswordExpires')
                .sort({ createdAt: -1 })
                .limit(Number(limit))
                .skip((Number(page) - 1) * Number(limit))
                .exec(),
            User.countDocuments(filter),
        ]);

        return res.status(200).json({
            success: true,
            data: {
                items,
                meta: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    totalPages: Math.ceil(total / Number(limit || 1)) || 1,
                },
            },
        });
    } catch (error) {
        console.error('Error fetching course-enrolled students:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch course-enrolled students', error: error.message });
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

// Get UG/PG enrolled students (exclude PhD by userType)
exports.getUgpgEnrolledStudents = async (req, res) => {
    try {
        const { page = 1, limit = 10, search } = req.query;

        // Find PhD userType id (if exists)
        const phdType = await UserType.findOne({ name: 'PhD' });

        // Collect UG/PG course IDs via tag (set when creating School)
        const ugpgCourses = await Course.find({ tag: { $in: ['UGPG'] } }).select('_id');
        const ugpgCourseIds = ugpgCourses.map(c => c._id);

        const filter = {
            accountType: 'Student',
            enrollmentFeePaid: true,
            paymentStatus: 'Completed',
            // must be enrolled in at least one UG/PG course
            ...(ugpgCourseIds.length ? { courses: { $in: ugpgCourseIds } } : { courses: { $in: [] } }),
            ...(phdType ? { $or: [ { userType: { $exists: false } }, { userType: null }, { userType: { $ne: phdType._id } } ] } : {}),
        };

        if (search) {
            filter.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const [items, total] = await Promise.all([
            User.find(filter)
                .populate('additionalDetails')
                .populate('courses')
                .select('-password -token -resetPasswordExpires')
                .sort({ 'paymentDetails.paidAt': -1, createdAt: -1 })
                .limit(Number(limit))
                .skip((Number(page) - 1) * Number(limit))
                .exec(),
            User.countDocuments(filter),
        ]);

        return res.status(200).json({
            success: true,
            data: {
                items,
                meta: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    totalPages: Math.ceil(total / Number(limit || 1)) || 1,
                },
            },
        });
    } catch (error) {
        console.error('Error fetching UG/PG enrolled students:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch UG/PG enrolled students', error: error.message });
    }
};

// Get PhD students who have completed enrollment fee AND at least one confirmed course fee
exports.getPhdEnrolledStudents = async (req, res) => {
    try {
        const { page = 1, limit = 10, search } = req.query;

        // Resolve PhD userType id (create if not exists to be robust)
        let phdType = await UserType.findOne({ name: 'PhD' });
        if (!phdType) {
            phdType = await UserType.create({ name: 'PhD', description: 'Doctoral program' });
        }

        // Students must be PhD, have enrollment fee completed, and have at least one confirmed course payment
        const baseFilter = {
            accountType: 'Student',
            enrollmentFeePaid: true,
            paymentStatus: 'Completed',
            userType: phdType._id,
        };

        // Optional search by name/email
        if (search) {
            baseFilter.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }

        // Find students who have at least one Confirmed AdmissionConfirmation (course fee paid)
        const confirmedStudentIds = await AdmissionConfirmation.distinct('student', { status: 'Confirmed' });

        const filter = {
            ...baseFilter,
            _id: { $in: confirmedStudentIds.length ? confirmedStudentIds : [null] },
        };

        const [items, total] = await Promise.all([
            User.find(filter)
                .populate('additionalDetails')
                .populate('userType')
                .select('-password -token -resetPasswordExpires')
                .sort({ 'paymentDetails.paidAt': -1, createdAt: -1 })
                .limit(Number(limit))
                .skip((Number(page) - 1) * Number(limit))
                .exec(),
            User.countDocuments(filter),
        ]);

        return res.status(200).json({
            success: true,
            data: {
                items,
                meta: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    totalPages: Math.ceil(total / Number(limit || 1)) || 1,
                },
            },
        });
    } catch (error) {
        console.error('Error fetching PhD enrolled students:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch PhD enrolled students', error: error.message });
    }
};

// Get PhD students who have paid ONLY the enrollment fee (no course fee requirement)
exports.getPhdEnrollmentPaidStudents = async (req, res) => {
    try {
        const { page = 1, limit = 10, search } = req.query;

        // Resolve PhD userType id (create if not exists)
        let phdType = await UserType.findOne({ name: 'PhD' });
        if (!phdType) {
            phdType = await UserType.create({ name: 'PhD', description: 'Doctoral program' });
        }

        const filter = {
            accountType: 'Student',
            enrollmentFeePaid: true,
            paymentStatus: 'Completed',
            userType: phdType._id,
        };

        if (search) {
            filter.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }

        const [items, total] = await Promise.all([
            User.find(filter)
                .populate('additionalDetails')
                .populate('userType')
                .select('-password -token -resetPasswordExpires')
                .sort({ 'paymentDetails.paidAt': -1, createdAt: -1 })
                .limit(Number(limit))
                .skip((Number(page) - 1) * Number(limit))
                .exec(),
            User.countDocuments(filter),
        ]);

        return res.status(200).json({
            success: true,
            data: {
                items,
                meta: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    totalPages: Math.ceil(total / Number(limit || 1)) || 1,
                },
            },
        });
    } catch (error) {
        console.error('Error fetching PhD students with enrollment fee paid:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch PhD enrollment-paid students', error: error.message });
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

// Get dashboard statistics (with dynamic previous-period comparison)
exports.getDashboardStats = async (req, res) => {
    try {
        // Define time windows: last 30 days vs the 30 days before that
        const now = new Date();
        const startCurrent = new Date(now);
        startCurrent.setDate(startCurrent.getDate() - 30);
        const startPrev = new Date(startCurrent);
        startPrev.setDate(startPrev.getDate() - 30);

        // Helper to compute delta percentage safely
        const pct = (curr, prev) => {
            if (prev === 0) return curr > 0 ? 100 : 0;
            return Number((((curr - prev) / prev) * 100).toFixed(2));
        };

        // Base totals
        const totalUsers = await User.countDocuments();
        const totalStudents = await User.countDocuments({ accountType: 'Student' });
        const totalInstructors = await User.countDocuments({ accountType: 'Instructor' });
        const enrolledStudents = await User.countDocuments({ accountType: 'Student', enrollmentFeePaid: true });
        const pendingInstructors = await User.countDocuments({ accountType: 'Instructor', approved: false });
        // Consider only active (non-draft) courses for dashboard cards
        const activeCourseFilter = { status: { $ne: 'Draft' } };
        const totalCourses = await Course.countDocuments(activeCourseFilter);

        // Totals per model
        const totalBatches = await require('../models/Batch').countDocuments();

        // Current vs previous period counts
        const [
            coursesCurrent, coursesPrev,
            batchesCurrent, batchesPrev,
            studentsCurrent, studentsPrev,
        ] = await Promise.all([
            // Courses
            Course.countDocuments({ ...activeCourseFilter, createdAt: { $gte: startCurrent, $lt: now } }),
            Course.countDocuments({ ...activeCourseFilter, createdAt: { $gte: startPrev, $lt: startCurrent } }),
            // Batches
            require('../models/Batch').countDocuments({ createdAt: { $gte: startCurrent, $lt: now } }),
            require('../models/Batch').countDocuments({ createdAt: { $gte: startPrev, $lt: startCurrent } }),
            // Students (registered users with Student role)
            User.countDocuments({ accountType: 'Student', createdAt: { $gte: startCurrent, $lt: now } }),
            User.countDocuments({ accountType: 'Student', createdAt: { $gte: startPrev, $lt: startCurrent } }),
        ]);

        const stats = {
            // Keep legacy fields for backward compatibility
            totalUsers,
            totalStudents,
            totalInstructors,
            enrolledStudents,
            pendingInstructors,
            totalCourses,
            // Extended structured cards data
            cards: {
                courses: {
                    title: 'Courses in LMS',
                    total: totalCourses,
                    currentPeriod: coursesCurrent,
                    previousPeriod: coursesPrev,
                    deltaPercent: pct(coursesCurrent, coursesPrev),
                },
                batches: {
                    title: 'Batch Register',
                    total: totalBatches,
                    currentPeriod: batchesCurrent,
                    previousPeriod: batchesPrev,
                    deltaPercent: pct(batchesCurrent, batchesPrev),
                },
                students: {
                    title: 'Student Registered',
                    total: totalStudents,
                    currentPeriod: studentsCurrent,
                    previousPeriod: studentsPrev,
                    deltaPercent: pct(studentsCurrent, studentsPrev),
                },
            },
        };

        // =============================
        // Purchases & Learning Progress
        // =============================
        // Purchased courses = Confirmed admissions
        const totalPurchased = await AdmissionConfirmation.countDocuments({ status: 'Confirmed' });
        // =============================
        // Revenue: Course fees + Enrollment fees
        // =============================
        // 1) Course fees primary source: AdmissionConfirmation (Confirmed)
        let courseAgg = await AdmissionConfirmation.aggregate([
            { $match: { status: 'Confirmed' } },
            { $group: {
                _id: { y: { $year: '$paymentDetails.paidAt' }, m: { $month: '$paymentDetails.paidAt' } },
                amount: { $sum: '$paymentDetails.amount' }
            }},
            { $sort: { '_id.y': 1, '_id.m': 1 } }
        ]);
        // 2) If no confirmations exist (e.g., legacy), fallback to installments sum
        if (!courseAgg || courseAgg.length === 0) {
            const fromInstallments = await require('../models/PaymentInstallment').aggregate([
                { $unwind: '$installmentDetails' },
                { $match: {
                    'installmentDetails.status': 'Paid',
                    'installmentDetails.paidAt': { $type: 'date' },
                    'installmentDetails.amount': { $gt: 0 }
                }},
                { $group: {
                    _id: { y: { $year: '$installmentDetails.paidAt' }, m: { $month: '$installmentDetails.paidAt' } },
                    amount: { $sum: '$installmentDetails.amount' }
                }},
                { $sort: { '_id.y': 1, '_id.m': 1 } }
            ]);
            courseAgg = fromInstallments;
        }
        const monthlyCourseEarnings = (courseAgg || []).map(e => ({ year: e._id.y, month: e._id.m, amount: e.amount }));

        // 3) Enrollment fees (one-time) from User.paymentDetails
        const enrollmentAgg = await User.aggregate([
            { $match: {
                accountType: 'Student',
                enrollmentFeePaid: true,
                paymentStatus: 'Completed',
                'paymentDetails.amount': { $gt: 0 },
                'paymentDetails.paidAt': { $type: 'date' }
            }},
            { $group: {
                _id: { y: { $year: '$paymentDetails.paidAt' }, m: { $month: '$paymentDetails.paidAt' } },
                amount: { $sum: '$paymentDetails.amount' }
            }},
            { $sort: { '_id.y': 1, '_id.m': 1 } }
        ]);
        const monthlyEnrollmentEarnings = (enrollmentAgg || []).map(e => ({ year: e._id.y, month: e._id.m, amount: e.amount }));

        // 4) Merge monthly arrays by (year, month)
        const key = (y, m) => `${y}-${m}`;
        const mergeMap = new Map();
        for (const e of monthlyCourseEarnings) {
            mergeMap.set(key(e.year, e.month), { year: e.year, month: e.month, amount: e.amount, courseAmount: e.amount, enrollmentAmount: 0 });
        }
        for (const e of monthlyEnrollmentEarnings) {
            const k = key(e.year, e.month);
            if (!mergeMap.has(k)) {
                mergeMap.set(k, { year: e.year, month: e.month, amount: e.amount, courseAmount: 0, enrollmentAmount: e.amount });
            } else {
                const v = mergeMap.get(k);
                v.amount += e.amount;
                v.enrollmentAmount += e.amount;
                mergeMap.set(k, v);
            }
        }
        const monthlyEarnings = Array.from(mergeMap.values()).sort((a, b) => (a.year - b.year) || (a.month - b.month));
        // Monthly purchases count
        // 1) AdmissionConfirmation counts
        let purchasesAgg = await AdmissionConfirmation.aggregate([
            { $match: { status: 'Confirmed' } },
            { $group: {
                _id: { y: { $year: '$paymentDetails.paidAt' }, m: { $month: '$paymentDetails.paidAt' } },
                count: { $sum: 1 }
            }},
            { $sort: { '_id.y': 1, '_id.m': 1 } }
        ]);
        // 2) If empty, try PaymentInstallment (count paid installments)
        if (!purchasesAgg || purchasesAgg.length === 0) {
            const purchasesFromInstallments = await require('../models/PaymentInstallment').aggregate([
                { $unwind: '$installmentDetails' },
                { $match: {
                    'installmentDetails.status': 'Paid',
                    'installmentDetails.paidAt': { $type: 'date' },
                    'installmentDetails.amount': { $gt: 0 }
                }},
                { $group: {
                    _id: { y: { $year: '$installmentDetails.paidAt' }, m: { $month: '$installmentDetails.paidAt' } },
                    count: { $sum: 1 }
                }},
                { $sort: { '_id.y': 1, '_id.m': 1 } }
            ]);
            purchasesAgg = purchasesFromInstallments;
        }
        // 3) If still empty, fallback to User.paymentDetails
        if (!purchasesAgg || purchasesAgg.length === 0) {
            const purchasesFromUsers = await User.aggregate([
                { $match: {
                    accountType: 'Student',
                    enrollmentFeePaid: true,
                    paymentStatus: 'Completed',
                    'paymentDetails.amount': { $gt: 0 },
                    'paymentDetails.paidAt': { $type: 'date' }
                }},
                { $group: {
                    _id: { y: { $year: '$paymentDetails.paidAt' }, m: { $month: '$paymentDetails.paidAt' } },
                    count: { $sum: 1 }
                }},
                { $sort: { '_id.y': 1, '_id.m': 1 } }
            ]);
            purchasesAgg = purchasesFromUsers;
        }
        const monthlyPurchases = (purchasesAgg || []).map(e => ({ year: e._id.y, month: e._id.m, count: e.count }));

        // Compute completed vs pending using CourseProgress against total lectures per course
        const cpDocs = await CourseProgress.find({}, { courseID: 1, completedVideos: 1 });
        let completedCourses = 0;
        let pendingCourses = 0;
        if (cpDocs.length) {
            // Build set of courseIds from progress
            const courseIds = [...new Set(cpDocs.map(d => d.courseID).filter(Boolean))];
            if (courseIds.length) {
                // For these courses, compute total lectures = sum of subSection array sizes in their sections
                const totals = await Course.aggregate([
                    { $match: { _id: { $in: courseIds } } },
                    { $lookup: { from: 'sections', localField: 'courseContent', foreignField: '_id', as: 'sections' } },
                    { $project: {
                        _id: 1,
                        totalLectures: { $sum: { $map: { input: '$sections', as: 's', in: { $size: '$$s.subSection' } } } }
                    } }
                ]);
                const totalMap = new Map(totals.map(t => [String(t._id), t.totalLectures || 0]));

                for (const d of cpDocs) {
                    const t = totalMap.get(String(d.courseID)) || 0;
                    const done = (d.completedVideos || []).length;
                    if (t > 0 && done >= t) completedCourses += 1;
                    else if (t > 0 && done < t) pendingCourses += 1;
                }
            }
        }

        // =============================
        // Batch details: totals and monthly trends
        // =============================
        const batchAgg = await Batch.aggregate([
            { $project: {
                createdAt: 1,
                studentsCount: { $size: { $ifNull: ["$students", []] } }
            }},
            { $group: {
                _id: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' } },
                batches: { $sum: 1 },
                students: { $sum: '$studentsCount' }
            }},
            { $sort: { '_id.y': 1, '_id.m': 1 } }
        ]);
        const batchMonthly = batchAgg.map(e => ({ year: e._id.y, month: e._id.m, batches: e.batches, students: e.students }));
        const batchTotalsAgg = await Batch.aggregate([
            { $project: { studentsCount: { $size: { $ifNull: ["$students", []] } } } },
            { $group: { _id: null, batches: { $sum: 1 }, students: { $sum: '$studentsCount' } } }
        ]);
        const batchTotals = batchTotalsAgg[0] || { batches: 0, students: 0 };

        // Students monthly enrolled (paid students)
        const enrolledMonthlyAgg = await User.aggregate([
            { $match: { accountType: 'Student', enrollmentFeePaid: true, paymentStatus: 'Completed' } },
            { $group: { _id: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' } }, count: { $sum: 1 } } },
            { $sort: { '_id.y': 1, '_id.m': 1 } }
        ]);
        const monthlyEnrolled = enrolledMonthlyAgg.map(e => ({ year: e._id.y, month: e._id.m, count: e.count }));
        const nowY = now.getFullYear();
        const nowM = now.getMonth() + 1;
        const currentMonthEnrolled = monthlyEnrolled.find(e => e.year === nowY && e.month === nowM)?.count || 0;

        // Attach new stats
        stats.learning = {
            purchased: { title: 'Purchased Courses', total: totalPurchased },
            completed: { title: 'Completed Courses', total: completedCourses },
            pending: { title: 'Pending Courses', total: pendingCourses },
        };
        stats.revenue = {
            monthlyEarnings, // [{year, month, amount, courseAmount, enrollmentAmount}]
            monthlyPurchases, // [{year, month, count}]
            breakdown: {
                course: monthlyCourseEarnings,
                enrollment: monthlyEnrollmentEarnings,
            },
            currency: 'INR',
        };
        stats.students = {
            monthlyEnrolled, // [{year, month, count}]
            currentMonthEnrolled,
        };
        // Totals for Donut: overall earnings and enrolled students
        const totalEarnings = (monthlyEarnings || []).reduce((sum, e) => sum + (e.amount || 0), 0);
        // Overall enrolled students = unique students who have any successful payment record across sources
        // Source 1: Confirmed admissions
        const acStudentIds = await AdmissionConfirmation.distinct('student', { status: 'Confirmed' });
        // Source 2: Any paid installment in PaymentInstallment
        const piAgg = await require('../models/PaymentInstallment').aggregate([
            { $unwind: '$installmentDetails' },
            { $match: { 'installmentDetails.status': 'Paid', 'installmentDetails.amount': { $gt: 0 }, 'installmentDetails.paidAt': { $type: 'date' } } },
            { $group: { _id: '$student' } }
        ]);
        const piStudentIds = piAgg.map(d => String(d._id));
        // Source 3: Fallback paid users (enrollment fee)
        const paidUserIds = await User.distinct('_id', { accountType: 'Student', enrollmentFeePaid: true, paymentStatus: 'Completed' });
        // Deduplicate
        const enrolledSet = new Set([
            ...acStudentIds.map(String),
            ...piStudentIds,
            ...paidUserIds.map(String),
        ]);
        const totalStudentsEnrolled = enrolledSet.size;
        stats.totals = {
            totalEarnings,
            totalStudentsEnrolled,
        };
        stats.batch = {
            totals: { batches: batchTotals.batches || 0, students: batchTotals.students || 0 },
            monthly: batchMonthly,
        };

        res.status(200).json({ success: true, data: stats });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard statistics',
            error: error.message,
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

// Update user details
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { firstName, lastName, email, contactNumber, accountType } = req.body;

        // Find the user
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "User not found" 
            });
        }

        // Update user fields
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (email) user.email = email;
        if (accountType) user.accountType = accountType;

        // Update additional details if they exist
        if (contactNumber) {
            let profile = await Profile.findOne({ _id: user.additionalDetails });
            if (!profile) {
                profile = await Profile.create({ contactNumber });
                user.additionalDetails = profile._id;
            } else {
                profile.contactNumber = contactNumber;
                await profile.save();
            }
        }

        await user.save();

        // Get the updated user with populated data
        const updatedUser = await User.findById(id)
            .populate('additionalDetails')
            .select('-password -token -resetPasswordExpires');

        res.status(200).json({
            success: true,
            data: updatedUser,
            message: "User updated successfully"
        });

    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Error updating user"
        });
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