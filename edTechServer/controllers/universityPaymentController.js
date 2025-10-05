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
        const currentPaidAmount = feeAssignment.paidAmount || 0;
        const newTotalPaid = currentPaidAmount + paymentAmount;
        const totalAmount = feeAssignment.amount;
        const updatedBalance = Math.max(0, totalAmount - newTotalPaid);
        const isFullyPaid = updatedBalance <= 0;
        
        console.log('Creating payment with details:', {
            amount: amount,
            feeAssignmentAmount: totalAmount,
            currentBalance: feeAssignment.balance,
            updatedBalance: updatedBalance,
            currentPaidAmount: currentPaidAmount,
            newTotalPaid: newTotalPaid,
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
        
        // Prepare payment data
        const paymentData = {
            student: studentId,
            feeType: feeTypeDetails.name,
            feeTypeId: feeType,
            feeTypeRef: feeType, // Add feeTypeRef as required
            feeAssignment: feeAssignment._id,
            registrationNumber: student.registrationNumber, // Add registrationNumber from student
            semesterDetails: {
                semester: feeAssignment.semester,
                semesterName: `Semester ${feeAssignment.semester}`,
                academicYear: feeAssignment.session,
                session: feeAssignment.session
            },
            course: courseDetails?._id?.toString() || feeAssignment.course?.toString() || '',
            semester: feeAssignment.semester,
            amount: paymentAmount,
            paidAmount: paymentAmount,
            modeOfPayment: paymentMethod,
            paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
            receiptNo: receiptNo || `RCPT-${Date.now().toString().slice(-6)}`,
            receiptDate: req.body.receiptDate ? new Date(req.body.receiptDate) : new Date(),
            remarks: remarks || '',
            scholarshipAmount: scholarship,
            discountAmount: discount,
            transactionId: transactionId,
            status: 'Partial', // Will be updated after calculation
            balanceAmount: 0, // Will be calculated and updated
            totalAmount: feeAssignment.amount,
            session: feeAssignment.session,
            createdBy: req.user?.id || (typeof createdBy === 'object' ? createdBy._id : createdBy) || req.user._id,
            updatedBy: req.user?.id || (typeof createdBy === 'object' ? createdBy._id : createdBy) || req.user._id
        };

        // Create and save the payment
        const payment = new UniversityPayment(paymentData);
        await payment.save({ session });
        
        // Get all payments including the new one
        const allPayments = await UniversityPayment.find({
            feeAssignment: feeAssignment._id
        }).sort({ paymentDate: 1 }).session(session);
        
        // Calculate running balances and total paid amount
        let runningBalance = feeAssignment.amount;
        let totalPaidSoFar = 0;
        
        for (const pmt of allPayments) {
            const paymentAmount = pmt.paidAmount || 0;
            runningBalance = Math.max(0, runningBalance - paymentAmount);
            totalPaidSoFar += paymentAmount;
            
            await UniversityPayment.findByIdAndUpdate(
                pmt._id,
                { 
                    $set: { 
                        balanceAmount: runningBalance,
                        status: runningBalance <= 0 ? 'Paid' : 'Partial',
                        updatedAt: new Date()
                    } 
                },
                { session, new: true }
            );
        }
        
        const totalFeeAmount = feeAssignment.amount;
        const remainingBalance = Math.max(0, totalFeeAmount - totalPaidSoFar);
        const isPaymentComplete = remainingBalance <= 0;

        // Update the fee assignment with the new payment
        const updateData = {
            $inc: { 
                paidAmount: paymentAmount,
                balanceAmount: -paymentAmount
            },
            $set: {
                status: isPaymentComplete ? 'Paid' : 'Partial',
                updatedAt: new Date()
            },
            $push: {
                payments: {
                    paymentId: payment._id,
                    amount: paymentAmount,
                    date: new Date(),
                    receiptNo: receiptNo || `RCPT-${Date.now().toString().slice(-6)}`,
                    modeOfPayment: paymentMethod,
                    remarks: remarks || ''
                }
            }
        };

        // Update the fee assignment with the new payment
        const updatedFeeAssignment = await FeeAssignment.findByIdAndUpdate(
            feeAssignment._id,
            updateData,
            { new: true, session }
        );
        
        // Fetch payments separately to avoid population errors
        const payments = await UniversityPayment.find({
            feeAssignment: feeAssignment._id
        }).session(session);

        // Update the payment with the fee assignment details
        payment.paymentDetails = {
            feeType: feeTypeDetails?.name || 'Unknown',
            category: feeTypeDetails?.category || 'General',
            semester: feeAssignment.semester,
            academicYear: feeAssignment.session,
            description: feeTypeDetails?.description || ''
        };
        payment.isActive = true;
        await payment.save({ session });

        // Log the updated fee assignment with payment details
        console.log('Updated fee assignment:', {
            feeAssignmentId: updatedFeeAssignment._id,
            totalAmount: updatedFeeAssignment.amount,
            totalPaid: updatedFeeAssignment.paidAmount,
            balance: updatedFeeAssignment.balanceAmount,
            status: updatedFeeAssignment.status,
            paymentCount: payments.length,
            lastPayment: payments[payments.length - 1] ? {
                amount: payments[payments.length - 1].paidAmount,
                date: payments[payments.length - 1].paymentDate
            } : null
        });

        // Calculate total paid amount for email
        const totalPaid = allPayments.reduce((sum, p) => sum + (p.paidAmount || 0), 0);
        
        await session.commitTransaction();
        
        // Send payment confirmation email
        if (student?.email) {
            try {
                await sendEmail(
                    student.email,
                    'Payment Confirmation',
                    paymentSuccessEmail(
                        student.firstName,
                        paymentAmount,
                        updatedFeeAssignment.totalAmount - scholarship - discount,
                        totalPaid
                    )
                );
            } catch (emailError) {
                console.error('Error sending payment confirmation email:', emailError);
            }
        }

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
        if (isPaymentComplete && student.status === 'pending_payment') {
            await UniversityRegisteredStudent.findByIdAndUpdate(
                studentId,
                { $set: { status: 'active' } },
                { session }
            );
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
                feeAssignment: updatedFeeAssignment,
                isPaymentComplete
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
        const { studentId } = req.params;
        
        if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid student ID provided'
            });
        }

        // Get student details with course information
        const student = await UniversityRegisteredStudent.findById(studentId)
            .select('course semester session registrationNumber firstName lastName email phone')
            .populate('course', 'name code')
            .lean();

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Get all fee assignments for the student with payment details
        const feeAssignments = await FeeAssignment.aggregate([
            {
                $match: {
                    $or: [
                        { assigneeId: new mongoose.Types.ObjectId(studentId) },
                        { 
                            course: student.course?._id,
                            $or: [
                                { semester: student.semester || { $exists: false } },
                                { semester: { $exists: false } }
                            ]
                        }
                    ],
                    $or: [
                        { status: { $exists: false } },
                        { status: { $ne: 'cancelled' } }
                    ]
                }
            },
            {
                $lookup: {
                    from: 'universitypayments',
                    localField: '_id',
                    foreignField: 'feeAssignment',
                    as: 'payments'
                }
            },
            {
                $unwind: {
                    path: '$payments',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $sort: { 'payments.paymentDate': -1 }
            },
            {
                $group: {
                    _id: '$_id',
                    feeType: { $first: '$feeType' },
                    amount: { $first: '$amount' },
                    semester: { $first: '$semester' },
                    session: { $first: '$session' },
                    status: { $first: '$status' },
                    course: { $first: '$course' },
                    payments: {
                        $push: {
                            $cond: {
                                if: { $eq: [{ $type: '$payments' }, 'object'] },
                                then: '$payments',
                                else: '$$REMOVE'
                            }
                        }
                    }
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
            { $unwind: '$feeType' },
            {
                $lookup: {
                    from: 'ugpgcourses',
                    localField: 'course',
                    foreignField: '_id',
                    as: 'course'
                }
            },
            { $unwind: { path: '$course', preserveNullAndEmptyArrays: true } }
        ]);

        // Process fee assignments to calculate paid and balance amounts
        const processedFees = feeAssignments.map(fee => {
            // Calculate total paid amount from all payments
            const totalPaid = (fee.payments || []).reduce((sum, payment) => {
                return sum + (payment.paidAmount || payment.amount || 0);
            }, 0);

            const amount = Number(fee.amount) || 0;
            const paid = Math.min(totalPaid, amount); // Can't pay more than the total amount
            const balance = Math.max(0, amount - paid);

            // Determine status
            let status = 'Unpaid';
            if (paid > 0) {
                status = balance > 0 ? 'Partial' : 'Paid';
            }

            return {
                _id: fee._id,
                id: fee._id,
                feeType: fee.feeType,
                amount: amount,
                paid: paid,
                balance: balance,
                semester: fee.semester,
                session: fee.session,
                status: status,
                course: fee.course || { _id: null, name: 'N/A', code: 'N/A' },
                payments: (fee.payments || []).map(p => ({
                    _id: p._id,
                    paidAmount: p.paidAmount,
                    amount: p.amount,
                    balanceAmount: p.balanceAmount,
                    paymentDate: p.paymentDate,
                    transactionId: p.transactionId,
                    status: p.status,
                    mode: p.mode || p.modeOfPayment,
                    receiptNo: p.receiptNo,
                    receiptDate: p.receiptDate
                }))
            };
        });

        return res.status(200).json({
            success: true,
            data: processedFees
        });
    } catch (error) {
        console.error('Error in getFeeDetails:', error);
        console.error('Error in getFeeDetails:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching fee details',
            error: error.message,
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
        });
    }
};

// @desc    Get all payments with filters
// @route   GET /api/v1/university/payments
// @access  Private/Admin,Accountant,SuperAdmin
exports.getPayments = async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      feeType, 
      status, 
      paymentMethod, 
      page = 1, 
      limit = 10,
      studentId,
      registeredOnly = 'false'
    } = req.query;
    
    const query = {};
    
    // Filter by student if provided
    if (studentId) {
      query.student = studentId;
    }
    
    // Filter for registered students only if requested
    if (registeredOnly === 'true') {
      // Get all registered student IDs
      const registeredStudents = await UniversityRegisteredStudent.find({}, '_id');
      const registeredStudentIds = registeredStudents.map(s => s._id);
      
      // Add filter to only include payments from registered students
      query.student = { $in: registeredStudentIds };
    }
    
    // Date range filter
    if (startDate || endDate) {
      query.paymentDate = {};
      if (startDate) query.paymentDate.$gte = new Date(startDate);
      if (endDate) query.paymentDate.$lte = new Date(endDate);
    }
    
    // Other filters
    if (feeType) query.feeType = feeType;
    if (status) query.status = status;
    if (paymentMethod) query.modeOfPayment = paymentMethod;
    
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { paymentDate: -1 },
      populate: [
        { 
          path: 'student', 
          select: 'firstName lastName registrationNumber email',
          model: 'UniversityRegisteredStudent'
        },
        { 
          path: 'createdBy', 
          select: 'firstName lastName',
          model: 'User'
        },
        {
          path: 'feeAssignment',
          select: 'feeType totalAmount course',
          populate: {
            path: 'course',
            select: 'name code',
            model: 'UGPGCourse'
          }
        }
      ]
    };
    
    const payments = await UniversityPayment.paginate(query, options);
    
    res.status(200).json({
      success: true,
      data: payments
    });
    
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};