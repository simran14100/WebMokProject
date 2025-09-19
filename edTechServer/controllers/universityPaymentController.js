const FeeAssignment = require('../models/feeAssignmentModel');
const UniversityRegisteredStudent = require('../models/UniversityRegisteredStudent');
const UniversityPayment = require('../models/UniversityPayment');
const FeeType = require('../models/feeTypeModel');
const UGPGCourse = require('../models/UGPGCourse');
const { sendEmail } = require('../utils/mailSender');
const { paymentSuccessEmail } = require('../mail/templates/paymentSuccessEmail');
const { default: mongoose } = require('mongoose');

// Record a new payment for a student
exports.recordPayment = async (req, res) => {
    console.log('=== recordPayment called ===');
    console.log('Request params:', req.params);
    console.log('Request body:', req.body);
    
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        const { 
            amount, 
            paymentMethod, 
            remarks, 
            scholarshipAmount = 0, 
            discountAmount = 0, 
            paymentDate, 
            receiptNo, 
            transactionId,
            feeType,
            feeAssignmentId
        } = req.body;
        
        const { studentId } = req.params;
        const createdBy = req.user?._id; // Make user ID access safer

        // Validate input
        if (!amount || isNaN(amount) || amount <= 0) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid payment amount'
            });
        }

        // Find the student with registration number
        const student = await UniversityRegisteredStudent.findById(studentId)
            .select('firstName lastName email phone registrationNumber course session')
            .session(session);
            
        if (!student) {
            await session.abortTransaction();
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Find the student's fee assignment by ID
        const assignmentId = req.body.feeAssignmentId || feeAssignmentId;
        console.log('Looking for fee assignment with ID:', assignmentId);
        console.log('For student ID:', studentId);
        
        // First try to find the assignment by ID only
        let feeAssignment = await FeeAssignment.findOne({
            _id: assignmentId
        }).session(session);
        
        console.log('Initial fee assignment lookup result:', feeAssignment);
        
        // If not found, try with student ID (for backward compatibility)
        if (!feeAssignment) {
            console.log('Trying with student ID filter...');
            feeAssignment = await FeeAssignment.findOne({
                _id: assignmentId,
                student: studentId
            }).session(session);
        }
        
        // If still not found, check if there's a mismatch in the student ID
        if (!feeAssignment) {
            const anyAssignment = await FeeAssignment.findOne({
                _id: assignmentId
            }).lean();
            
            if (anyAssignment) {
                console.log('Found assignment but with different student ID:', anyAssignment.student);
            }
        }

        console.log('Found fee assignment:', feeAssignment ? {
            _id: feeAssignment._id,
            student: feeAssignment.student,
            status: feeAssignment.status,
            amount: feeAssignment.amount,
            paidAmount: feeAssignment.paidAmount
        } : null);

        if (!feeAssignment) {
            await session.abortTransaction();
            return res.status(404).json({
                success: false,
                message: 'No active fee assignment found for this student and fee type',
                details: {
                    feeAssignmentId: req.body.feeAssignmentId || feeAssignmentId,
                    studentId: studentId,
                    timestamp: new Date().toISOString()
                }
            });
        }

        const paymentAmount = parseFloat(amount);
        const scholarship = parseFloat(scholarshipAmount) || 0;
        const discount = parseFloat(discountAmount) || 0;
        const totalPaid = (feeAssignment.paidAmount || 0) + paymentAmount;
        const isFullyPaid = totalPaid >= (feeAssignment.totalAmount - scholarship - discount);
        
        // Calculate the new balance
        const newBalance = (feeAssignment.balance || feeAssignment.amount) - amount;
        
        console.log('Creating payment with details:', {
            amount: amount,
            feeAssignmentAmount: feeAssignment.amount,
            currentBalance: feeAssignment.balance,
            newBalance: newBalance,
            session: feeAssignment.session,
            createdBy: req.user.id
        });

        // Get fee type details and ensure we have the latest data
        const feeTypeDetails = await FeeType.findById(feeType).lean();
        if (!feeTypeDetails) {
            await session.abortTransaction();
            return res.status(404).json({
                success: false,
                message: 'Fee type not found'
            });
        }
        
        // Get course details for reference
        const courseDetails = await UGPGCourse.findById(feeAssignment.course?._id || feeAssignment.course).lean();
        
        // Prepare payment data with comprehensive details
        const paymentData = {
            student: studentId,
            feeType: feeTypeDetails.name, // Store fee type name directly
            feeTypeId: feeType, // Keep reference to fee type ID
            feeAssignment: feeAssignment._id,
            semesterDetails: {
                semester: feeAssignment.semester,
                semesterName: `Semester ${feeAssignment.semester}`,
                academicYear: feeAssignment.session,
                session: feeAssignment.session
            },
            course: courseDetails?._id?.toString() || feeAssignment.course?.toString() || '',
            semester: feeAssignment.semester,
            amount: paymentAmount,
            modeOfPayment: paymentMethod,
            paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
            receiptNo: receiptNo || `RCPT-${Date.now().toString().slice(-6)}`,
            receiptDate: req.body.receiptDate ? new Date(req.body.receiptDate) : new Date(),
            remarks: remarks || '',
            scholarshipAmount: scholarship,
            discountAmount: discount,
            transactionId: transactionId,
            status: isFullyPaid ? 'Paid' : 'Partial',
            balanceAmount: newBalance,
            totalAmount: feeAssignment.amount,
            session: feeAssignment.session, // Keep for backward compatibility
            academicYear: feeAssignment.session, // Keep for backward compatibility
            semester: feeAssignment.semester, // Keep for backward compatibility
            createdBy: createdBy || req.user.id,
            updatedBy: createdBy || req.user.id,
            paidAmount: paymentAmount,
            registrationNumber: student.registrationNumber || `TEMP-${Date.now()}`,
            // Additional metadata
            paymentDetails: {
                feeType: feeTypeDetails?.name || 'Unknown',
                category: feeTypeDetails?.category || 'General',
                semester: feeAssignment.semester,
                academicYear: feeAssignment.session,
                description: feeTypeDetails?.description || ''
            },
            isActive: true
        };
        
        // Ensure all required fields are present
        if (!paymentData.createdBy) {
            throw new Error('createdBy is required');
        }
        if (!paymentData.student) {
            throw new Error('student is required');
        }
        if (!paymentData.feeType) {
            throw new Error('feeType is required');
        }
        if (!paymentData.feeAssignment) {
            throw new Error('feeAssignment is required');
        }
        
        console.log('Creating payment with data:', paymentData);
        
        const payment = new UniversityPayment(paymentData);

        await payment.save({ session });

        // Update fee assignment
        const updateData = {
            $inc: { 
                paidAmount: paymentAmount,
                scholarshipAmount: scholarship,
                discountAmount: discount
            },
            $push: { payments: payment._id },
            status: isFullyPaid ? 'completed' : 'partially_paid',
            lastPaymentDate: new Date()
        };

        const updatedFeeAssignment = await FeeAssignment.findByIdAndUpdate(
            feeAssignment._id,
            updateData,
            { new: true, session }
        );

        // Update student's registration fee status if this is a registration fee payment
        if (feeType === 'Registration') {
            await UniversityRegisteredStudent.findByIdAndUpdate(
                studentId,
                { 
                    $set: { 
                        'verificationDetails.documents.registrationFee': true,
                        'verificationDetails.verifiedAt': new Date(),
                        'verificationDetails.verifiedBy': req.user.name || 'System',
                        'verificationDetails.verifiedById': req.user.id
                    } 
                },
                { session }
            );
        }
        
        // Update student status based on payment
        if (isFullyPaid && student.status === 'pending_payment') {
            await UniversityRegisteredStudent.findByIdAndUpdate(
                studentId,
                { $set: { status: 'active' } },
                { session }
            );
        }

        // Send payment confirmation email
        try {
            await sendEmail(
                student.email,
                'Payment Received',
                paymentSuccessEmail(
                    student.firstName,
                    paymentAmount,
                    updatedFeeAssignment.totalAmount - scholarship - discount,
                    totalPaid
                )
            );
        } catch (emailError) {
            console.error('Failed to send payment confirmation email:', emailError);
            // Don't fail the transaction if email fails
        }

        await session.commitTransaction();
        
        const savedPayment = await UniversityPayment.findById(payment._id)
            .populate('createdBy', 'firstName lastName')
            .populate('feeAssignment');
        
        res.status(200).json({
            success: true,
            message: 'Payment recorded successfully',
            data: {
                payment: savedPayment,
                feeAssignment: updatedFeeAssignment
            }
        });

    } catch (error) {
        await session.abortTransaction();
        console.error('Error recording payment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to record payment',
            error: error.message
        });
    } finally {
        session.endSession();
    }
};

// Get payment history for a student
exports.getPaymentHistory = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { feeType, startDate, endDate } = req.query;
        
        const query = { student: studentId };
        
        if (feeType) {
            query.feeType = feeType;
        }
        
        if (startDate && endDate) {
            query.paymentDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        
        const payments = await UniversityPayment.find(query)
            .populate('createdBy', 'firstName lastName email')
            .populate('feeAssignment')
            .sort({ paymentDate: -1, createdAt: -1 });
            
        res.status(200).json({
            success: true,
            data: payments
        });
        
    } catch (error) {
        console.error('Error fetching payment history:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch payment history',
            error: error.message
        });
    }
};

// Get payment receipt by ID
exports.getPaymentReceipt = async (req, res) => {
    try {
        const { paymentId } = req.params;
        
        const payment = await UniversityPayment.findById(paymentId)
            .populate('student', 'firstName lastName registrationNumber course session')
            .populate('createdBy', 'firstName lastName')
            .populate('feeAssignment');
            
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: payment
        });
        
    } catch (error) {
        console.error('Error fetching payment receipt:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch payment receipt',
            error: error.message
        });
    }
};

// Assign fees to a student
exports.assignFeesToStudent = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { courseId, session, semester, feeTypeId, amount } = req.body;

        // Validate required fields
        if (!studentId || !courseId || !session || !feeTypeId || amount === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Check if student exists
        const student = await UniversityRegisteredStudent.findById(studentId);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Create fee assignment
        const feeAssignment = new FeeAssignment({
            feeType: feeTypeId,
            session,
            course: courseId,
            semester,
            student: studentId,
            assigneeId: req.user.id, // Assuming you have user in req
            amount,
            status: 'unpaid',
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
        });

        await feeAssignment.save();

        res.status(201).json({
            success: true,
            message: 'Fee assigned successfully',
            data: feeAssignment
        });
    } catch (error) {
        console.error('Error assigning fees:', error);
        res.status(500).json({
            success: false,
            message: 'Error assigning fees',
            error: error.message
        });
    }
};

// Get fee details for a student
exports.getFeeDetails = async (req, res) => {
    try {
        console.log('getFeeDetails called with params:', req.params);
        const { studentId } = req.params;
        
        if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid student ID provided'
            });
        }

        // Get student details first
        const student = await UniversityRegisteredStudent.findById(studentId)
            .select('course semester session registrationNumber')
            .populate('course', 'name code');

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }
        
        console.log('Looking up fee details for student:', {
            studentId,
            registrationNumber: student.registrationNumber,
            course: student.course?._id,
            semester: student.semester,
            session: student.session
        });

        // Build the match conditions
        const matchConditions = [
            // Try with student's ID as assigneeId
            { assigneeId: new mongoose.Types.ObjectId(studentId) },
            // Also try with admin's ID as assigneeId
            { assigneeId: req.user._id }
        ];

        // Add course-based conditions if we have course info
        if (student.course?._id) {
            const courseCondition = {
                course: student.course._id.toString()
            };
            
            if (student.session) {
                courseCondition.session = student.session;
            }
            
            if (student.semester) {
                courseCondition.$or = [
                    { semester: student.semester },
                    { semester: { $exists: false } }
                ];
            }
            
            matchConditions.push(courseCondition);
        }

        console.log('Searching fee assignments with conditions:', JSON.stringify(matchConditions, null, 2));

        // Find all fee assignments for the student
        const feeAssignments = await FeeAssignment.aggregate([
            {
                $match: {
                    $or: matchConditions
                }
            },
            {
                $lookup: {
                    from: 'feetypes',
                    localField: 'feeType',
                    foreignField: '_id',
                    as: 'feeType'
                }
            },
            { $unwind: { path: '$feeType', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'ugpgcourses',
                    localField: 'course',
                    foreignField: '_id',
                    as: 'course'
                }
            },
            { $unwind: { path: '$course', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'universitypayments',
                    let: { feeAssignmentId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$feeAssignment', '$$feeAssignmentId'] },
                                        { $eq: ['$student', new mongoose.Types.ObjectId(studentId)] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'payments'
                }
            }
        ]);
        
        console.log(`Found ${feeAssignments.length} fee assignments for student`);
        
        // Transform the data to include detailed fee information
        const formattedData = feeAssignments.map(assignment => {
            const totalAmount = assignment.amount || 0;
            const paidAmount = assignment.payments?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;
            const balance = totalAmount - paidAmount;
            
            return {
                id: assignment._id,
                feeType: assignment.feeType ? {
                    _id: assignment.feeType._id,
                    name: assignment.feeType.name,
                    category: assignment.feeType.category,
                    type: assignment.feeType.type,
                    refundable: assignment.feeType.refundable
                } : {
                    name: 'General Fee',
                    category: 'General',
                    type: 'One Time',
                    refundable: false
                },
                amount: totalAmount,
                paid: paidAmount,
                balance: balance,
                semester: assignment.semester || student.semester,
                session: assignment.session || student.session,
                status: balance <= 0 ? 'Paid' : (paidAmount > 0 ? 'Partial' : 'Unpaid'),
                dueDate: assignment.dueDate,
                createdAt: assignment.createdAt,
                course: {
                    _id: assignment.course?._id || student.course?._id,
                    name: assignment.course?.name || student.course?.name || 'N/A',
                    code: assignment.course?.code || student.course?.code || 'N/A'
                },
                payments: assignment.payments || []
            };
        });
        
        res.status(200).json({
            success: true,
            data: formattedData
        });
        
    } catch (error) {
        console.error('Error fetching fee details:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch fee details',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};
