const { instance } = require("../config/razorpay");
const User = require("../models/User");
const crypto = require("crypto");
const mailSender = require("../utils/mailSender");
const { enrollmentFeeEmail } = require("../mail/templates/enrollmentFeeEmail");

// Create enrollment fee payment order
exports.createEnrollmentOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const enrollmentFee = 1000; // 1000 rupees

        // Check if user is a student
        const user = await User.findById(userId);
        if (!user || user.accountType !== "Student") {
            return res.status(403).json({
                success: false,
                message: "Only students can pay enrollment fee"
            });
        }

        // Check if already paid
        if (user.enrollmentFeePaid) {
            return res.status(400).json({
                success: false,
                message: "Enrollment fee already paid"
            });
        }

        const options = {
            amount: enrollmentFee * 100, // Razorpay expects amount in paise
            currency: "INR",
            receipt: `enrollment_${userId}_${Date.now()}`,
            notes: {
                userId: userId,
                type: "enrollment_fee"
            }
        };

        const order = await instance.orders.create(options);

        res.status(200).json({
            success: true,
            message: "Enrollment order created successfully",
            data: {
                orderId: order.id,
                amount: enrollmentFee,
                currency: "INR"
            }
        });
    } catch (error) {
        console.error("Error creating enrollment order:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create enrollment order",
            error: error.message
        });
    }
};

// Verify enrollment payment
exports.verifyEnrollmentPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        const userId = req.user.id;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Payment verification failed - missing parameters"
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
                message: "Payment verification failed - invalid signature"
            });
        }

        // Update user payment status
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                enrollmentFeePaid: true,
                paymentStatus: "Completed",
                paymentDetails: {
                    orderId: razorpay_order_id,
                    paymentId: razorpay_payment_id,
                    amount: 1000,
                    paidAt: new Date()
                }
            },
            { new: true }
        ).populate("additionalDetails");

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Send confirmation email
        try {
            await mailSender(
                updatedUser.email,
                "Enrollment Fee Payment Successful",
                enrollmentFeeEmail(
                    `${updatedUser.firstName} ${updatedUser.lastName}`,
                    1000,
                    razorpay_order_id,
                    razorpay_payment_id
                )
            );
        } catch (emailError) {
            console.error("Error sending enrollment confirmation email:", emailError);
        }

        res.status(200).json({
            success: true,
            message: "Enrollment payment verified successfully",
            data: updatedUser
        });
    } catch (error) {
        console.error("Error verifying enrollment payment:", error);
        res.status(500).json({
            success: false,
            message: "Failed to verify enrollment payment",
            error: error.message
        });
    }
};

// Get enrollment payment status
exports.getEnrollmentStatus = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId).select('enrollmentFeePaid paymentStatus paymentDetails');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            data: {
                enrollmentFeePaid: user.enrollmentFeePaid,
                paymentStatus: user.paymentStatus,
                paymentDetails: user.paymentDetails
            }
        });
    } catch (error) {
        console.error("Error getting enrollment status:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get enrollment status",
            error: error.message
        });
    }
}; 