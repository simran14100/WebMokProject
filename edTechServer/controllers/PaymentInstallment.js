const PaymentInstallment = require('../models/PaymentInstallment');
const User = require('../models/User');
const Course = require('../models/Course');
const mailSender = require('../utils/mailSender');
const { paymentReminderEmail } = require('../mail/templates/paymentReminderEmail');
const { instance } = require('../config/razorpay');
const crypto = require('crypto');

// Create installment plan
exports.createInstallmentPlan = async (req, res) => {
    try {
        const { courseId, paymentMethod, installmentCount, initialPayment } = req.body;
        const userId = req.user.id;

        // Validate input
        if (!courseId || !paymentMethod || !installmentCount) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        if (paymentMethod === 'Installment' && installmentCount < 2) {
            return res.status(400).json({
                success: false,
                message: 'Installment plan must have at least 2 installments'
            });
        }

        // Get course details
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Check if user is already enrolled
        const user = await User.findById(userId);
        if (course.studentsEnrolled.includes(userId)) {
            return res.status(400).json({
                success: false,
                message: 'You are already enrolled in this course'
            });
        }

        // Check if installment plan already exists
        const existingPlan = await PaymentInstallment.findOne({
            student: userId,
            course: courseId,
            status: { $in: ['Active', 'Defaulted'] }
        });

        if (existingPlan) {
            return res.status(400).json({
                success: false,
                message: 'An installment plan already exists for this course'
            });
        }

        const totalAmount = course.price;
        let remainingAmount = totalAmount;
        let paidAmount = 0;

        // Calculate installment amounts
        const installmentAmount = Math.ceil(remainingAmount / installmentCount);
        const installmentDetails = [];

        // Create installment schedule
        const today = new Date();
        for (let i = 1; i <= installmentCount; i++) {
            const dueDate = new Date(today);
            dueDate.setDate(dueDate.getDate() + (i * 30)); // 30 days apart

            const amount = i === installmentCount 
                ? remainingAmount - (installmentAmount * (i - 1)) // Last installment gets remaining amount
                : installmentAmount;

            installmentDetails.push({
                installmentNumber: i,
                amount: amount,
                dueDate: dueDate,
                status: 'Pending'
            });
        }

        // Create installment plan
        const installmentPlan = await PaymentInstallment.create({
            student: userId,
            course: courseId,
            totalAmount: totalAmount,
            remainingAmount: remainingAmount,
            installmentDetails: installmentDetails,
            paymentMethod: paymentMethod,
            installmentCount: installmentCount,
            nextReminderDate: installmentDetails[0].dueDate
        });

        res.status(200).json({
            success: true,
            message: 'Installment plan created successfully',
            data: installmentPlan
        });
    } catch (error) {
        console.error('Error creating installment plan:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create installment plan',
            error: error.message
        });
    }
};

// Get installment plans for student
exports.getStudentInstallments = async (req, res) => {
    try {
        const userId = req.user.id;
        const { status } = req.query;

        let filter = { student: userId };
        if (status && status !== 'all') {
            filter.status = status;
        }

        const installments = await PaymentInstallment.find(filter)
            .populate('course', 'courseName price thumbnail')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: installments
        });
    } catch (error) {
        console.error('Error fetching student installments:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch installment plans',
            error: error.message
        });
    }
};

// Get installment details by ID
exports.getInstallmentDetails = async (req, res) => {
    try {
        const { installmentId } = req.params;
        const userId = req.user.id;

        const installment = await PaymentInstallment.findById(installmentId)
            .populate('course', 'courseName price description')
            .populate('student', 'firstName lastName email');

        if (!installment) {
            return res.status(404).json({
                success: false,
                message: 'Installment plan not found'
            });
        }

        // Check if user is authorized to view this installment
        if (installment.student._id.toString() !== userId && req.user.accountType !== 'Admin' && req.user.accountType !== 'SuperAdmin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this installment plan'
            });
        }

        res.status(200).json({
            success: true,
            data: installment
        });
    } catch (error) {
        console.error('Error fetching installment details:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch installment details',
            error: error.message
        });
    }
};

// Create payment order for installment
exports.createInstallmentPaymentOrder = async (req, res) => {
    try {
        const { installmentId, installmentNumber } = req.body;
        const userId = req.user.id;

        const installment = await PaymentInstallment.findById(installmentId)
            .populate('course', 'courseName');

        if (!installment) {
            return res.status(404).json({
                success: false,
                message: 'Installment plan not found'
            });
        }

        if (installment.student.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to pay this installment'
            });
        }

        const installmentDetail = installment.installmentDetails.find(
            inst => inst.installmentNumber === installmentNumber
        );

        if (!installmentDetail) {
            return res.status(404).json({
                success: false,
                message: 'Installment not found'
            });
        }

        if (installmentDetail.status === 'Paid') {
            return res.status(400).json({
                success: false,
                message: 'This installment is already paid'
            });
        }

        const options = {
            amount: installmentDetail.amount * 100, // Razorpay expects amount in paise
            currency: "INR",
            receipt: `installment_${installmentId}_${installmentNumber}_${Date.now()}`,
            notes: {
                installmentId: installmentId,
                installmentNumber: installmentNumber,
                studentId: userId,
                courseId: installment.course._id
            }
        };

        const order = await instance.orders.create(options);

        res.status(200).json({
            success: true,
            message: 'Payment order created successfully',
            data: {
                orderId: order.id,
                amount: installmentDetail.amount,
                currency: "INR"
            }
        });
    } catch (error) {
        console.error('Error creating installment payment order:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create payment order',
            error: error.message
        });
    }
};

// Verify installment payment
exports.verifyInstallmentPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            installmentId,
            installmentNumber
        } = req.body;

        const userId = req.user.id;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !installmentId || !installmentNumber) {
            return res.status(400).json({
                success: false,
                message: 'Payment verification failed - missing parameters'
            });
        }

        // Verify signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: 'Payment verification failed - invalid signature'
            });
        }

        // Update installment payment
        const installment = await PaymentInstallment.findById(installmentId);
        if (!installment) {
            return res.status(404).json({
                success: false,
                message: 'Installment plan not found'
            });
        }

        const installmentDetail = installment.installmentDetails.find(
            inst => inst.installmentNumber === installmentNumber
        );

        if (!installmentDetail) {
            return res.status(404).json({
                success: false,
                message: 'Installment not found'
            });
        }

        // Update installment details
        installmentDetail.status = 'Paid';
        installmentDetail.paidAt = new Date();
        installmentDetail.paymentId = razorpay_payment_id;
        installmentDetail.orderId = razorpay_order_id;

        // Update overall amounts
        installment.paidAmount += installmentDetail.amount;
        installment.remainingAmount -= installmentDetail.amount;

        // Update status if all installments are paid
        if (installment.remainingAmount === 0) {
            installment.status = 'Completed';
            
            // Enroll student in course
            await Course.findByIdAndUpdate(
                installment.course,
                { $push: { studentsEnrolled: userId } }
            );

            await User.findByIdAndUpdate(
                userId,
                { $push: { courses: installment.course } }
            );
        }

        await installment.save();

        res.status(200).json({
            success: true,
            message: 'Installment payment verified successfully',
            data: installment
        });
    } catch (error) {
        console.error('Error verifying installment payment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify installment payment',
            error: error.message
        });
    }
};

// Send payment reminders (for admin/scheduled job)
exports.sendPaymentReminders = async (req, res) => {
    try {
        const today = new Date();
        const threeDaysFromNow = new Date(today);
        threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

        // Find installments that need reminders
        const installmentsNeedingReminders = await PaymentInstallment.find({
            status: { $in: ['Active', 'Defaulted'] },
            $or: [
                {
                    'installmentDetails.dueDate': {
                        $gte: today,
                        $lte: threeDaysFromNow
                    },
                    'installmentDetails.status': 'Pending'
                },
                {
                    'installmentDetails.dueDate': { $lt: today },
                    'installmentDetails.status': 'Overdue'
                }
            ]
        }).populate('student', 'firstName lastName email')
          .populate('course', 'courseName');

        let remindersSent = 0;

        for (const installment of installmentsNeedingReminders) {
            const pendingInstallments = installment.installmentDetails.filter(
                inst => inst.status === 'Pending' || inst.status === 'Overdue'
            );

            for (const pendingInst of pendingInstallments) {
                const isOverdue = pendingInst.dueDate < today;
                const daysOverdue = isOverdue 
                    ? Math.floor((today - pendingInst.dueDate) / (1000 * 60 * 60 * 24))
                    : 0;

                let reminderType = 'Due';
                if (isOverdue) {
                    reminderType = daysOverdue > 7 ? 'Final' : 'Overdue';
                }

                // Check if reminder was already sent recently
                const lastReminder = installment.reminderSent.find(
                    r => r.installmentNumber === pendingInst.installmentNumber
                );

                const shouldSendReminder = !lastReminder || 
                    (today - lastReminder.sentAt) > (24 * 60 * 60 * 1000); // 24 hours

                if (shouldSendReminder) {
                    try {
                        await mailSender(
                            installment.student.email,
                            `Payment Reminder: Installment ${pendingInst.installmentNumber}`,
                            paymentReminderEmail(
                                `${installment.student.firstName} ${installment.student.lastName}`,
                                installment.course.courseName,
                                pendingInst.installmentNumber,
                                pendingInst.amount,
                                pendingInst.dueDate,
                                reminderType
                            )
                        );

                        // Update reminder sent record
                        installment.reminderSent.push({
                            installmentNumber: pendingInst.installmentNumber,
                            sentAt: today,
                            reminderType: reminderType
                        });

                        installment.lastReminderSent = today;
                        await installment.save();

                        remindersSent++;
                    } catch (emailError) {
                        console.error('Error sending reminder email:', emailError);
                    }
                }
            }
        }

        res.status(200).json({
            success: true,
            message: `Payment reminders sent successfully`,
            data: {
                remindersSent,
                totalInstallmentsChecked: installmentsNeedingReminders.length
            }
        });
    } catch (error) {
        console.error('Error sending payment reminders:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send payment reminders',
            error: error.message
        });
    }
};

// Get all installments (for admin)
exports.getAllInstallments = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, search } = req.query;
        
        let filter = {};
        
        if (status && status !== 'all') {
            filter.status = status;
        }
        
        if (search) {
            filter.$or = [
                { 'student.firstName': { $regex: search, $options: 'i' } },
                { 'student.lastName': { $regex: search, $options: 'i' } },
                { 'student.email': { $regex: search, $options: 'i' } },
                { 'course.courseName': { $regex: search, $options: 'i' } }
            ];
        }

        const installments = await PaymentInstallment.find(filter)
            .populate('student', 'firstName lastName email')
            .populate('course', 'courseName price')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const total = await PaymentInstallment.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: {
                installments,
                totalPages: Math.ceil(total / limit),
                currentPage: parseInt(page),
                totalInstallments: total
            }
        });
    } catch (error) {
        console.error('Error fetching installments:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch installments',
            error: error.message
        });
    }
};

// Get installment statistics (for admin)
exports.getInstallmentStats = async (req, res) => {
    try {
        const totalActive = await PaymentInstallment.countDocuments({ status: 'Active' });
        const totalCompleted = await PaymentInstallment.countDocuments({ status: 'Completed' });
        const totalDefaulted = await PaymentInstallment.countDocuments({ status: 'Defaulted' });
        const totalInstallments = await PaymentInstallment.countDocuments();

        // Calculate total revenue
        const completedInstallments = await PaymentInstallment.find({ status: 'Completed' });
        const totalRevenue = completedInstallments.reduce((sum, inst) => sum + inst.totalAmount, 0);

        // Calculate pending revenue
        const activeInstallments = await PaymentInstallment.find({ status: 'Active' });
        const pendingRevenue = activeInstallments.reduce((sum, inst) => sum + inst.remainingAmount, 0);

        // Get overdue installments
        const overdueCount = await PaymentInstallment.countDocuments({
            'installmentDetails.status': 'Overdue'
        });

        res.status(200).json({
            success: true,
            data: {
                totalActive,
                totalCompleted,
                totalDefaulted,
                totalInstallments,
                totalRevenue,
                pendingRevenue,
                overdueCount
            }
        });
    } catch (error) {
        console.error('Error fetching installment stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch installment statistics',
            error: error.message
        });
    }
}; 