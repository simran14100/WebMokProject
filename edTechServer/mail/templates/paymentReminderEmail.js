const paymentReminderEmail = (studentName, courseName, installmentNumber, amount, dueDate, reminderType) => {
    const formattedDueDate = new Date(dueDate).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const getSubject = () => {
        switch (reminderType) {
            case 'Due':
                return `Payment Reminder: Installment ${installmentNumber} Due Soon`;
            case 'Overdue':
                return `URGENT: Payment Overdue - Installment ${installmentNumber}`;
            case 'Final':
                return `FINAL NOTICE: Payment Overdue - Installment ${installmentNumber}`;
            default:
                return `Payment Reminder: Installment ${installmentNumber}`;
        }
    };

    const getHeaderColor = () => {
        switch (reminderType) {
            case 'Due':
                return '#f59e0b'; // Yellow
            case 'Overdue':
                return '#ef4444'; // Red
            case 'Final':
                return '#dc2626'; // Dark Red
            default:
                return '#3b82f6'; // Blue
        }
    };

    const getUrgencyText = () => {
        switch (reminderType) {
            case 'Due':
                return 'This is a friendly reminder that your payment is due soon.';
            case 'Overdue':
                return 'Your payment is now overdue. Please complete the payment immediately to avoid any penalties.';
            case 'Final':
                return 'This is your final notice. Your payment is significantly overdue. Please contact us immediately.';
            default:
                return 'Please complete your pending payment.';
        }
    };

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Reminder</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }
            .header {
                background-color: ${getHeaderColor()};
                color: white;
                padding: 20px;
                text-align: center;
                border-radius: 8px 8px 0 0;
            }
            .content {
                background-color: #f9f9f9;
                padding: 30px;
                border-radius: 0 0 8px 8px;
            }
            .amount {
                font-size: 24px;
                font-weight: bold;
                color: #1f2937;
                text-align: center;
                margin: 20px 0;
            }
            .due-date {
                background-color: #fee2e2;
                border: 1px solid #fecaca;
                padding: 15px;
                border-radius: 6px;
                margin: 20px 0;
                text-align: center;
            }
            .button {
                display: inline-block;
                background-color: #3b82f6;
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 6px;
                margin: 20px 0;
                text-align: center;
            }
            .footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                font-size: 14px;
                color: #6b7280;
            }
            .warning {
                background-color: #fef3c7;
                border: 1px solid #fde68a;
                padding: 15px;
                border-radius: 6px;
                margin: 20px 0;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>${getSubject()}</h1>
        </div>
        
        <div class="content">
            <p>Dear ${studentName},</p>
            
            <p>${getUrgencyText()}</p>
            
            <div class="amount">
                Amount Due: ₹${amount.toLocaleString('en-IN')}
            </div>
            
            <div class="due-date">
                <strong>Due Date:</strong> ${formattedDueDate}
            </div>
            
            <h3>Payment Details:</h3>
            <ul>
                <li><strong>Course:</strong> ${courseName}</li>
                <li><strong>Installment:</strong> ${installmentNumber}</li>
                <li><strong>Amount:</strong> ₹${amount.toLocaleString('en-IN')}</li>
                <li><strong>Due Date:</strong> ${formattedDueDate}</li>
            </ul>
            
            ${reminderType === 'Overdue' || reminderType === 'Final' ? `
            <div class="warning">
                <strong>⚠️ Important:</strong> 
                ${reminderType === 'Final' 
                    ? 'This is your final notice. Failure to pay may result in course access suspension and additional penalties.' 
                    : 'Your payment is overdue. Please complete it immediately to avoid any penalties.'
                }
            </div>
            ` : ''}
            
            <p>To complete your payment, please visit your dashboard or click the button below:</p>
            
            <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" class="button">
                    Complete Payment
                </a>
            </div>
            
            <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
            
            <p>Thank you for your prompt attention to this matter.</p>
            
            <p>Best regards,<br>
            The StudyNotion Team</p>
        </div>
        
        <div class="footer">
            <p>This is an automated reminder. Please do not reply to this email.</p>
            <p>If you have already made the payment, please ignore this reminder.</p>
        </div>
    </body>
    </html>
    `;
};

module.exports = paymentReminderEmail; 