const enrollmentFeeEmail = (userName, amount, orderId, paymentId) => {
	return `<!DOCTYPE html>
	<html>
	
	<head>
		<meta charset="UTF-8">
		<title>Enrollment Fee Payment Confirmation</title>
		<style>
			body {
				background-color: #ffffff;
				font-family: Arial, sans-serif;
				font-size: 16px;
				line-height: 1.4;
				color: #333333;
				margin: 0;
				padding: 0;
			}
	
			.container {
				max-width: 600px;
				margin: 0 auto;
				padding: 20px;
				text-align: center;
			}
	
			.logo {
				max-width: 200px;
				margin-bottom: 20px;
			}
	
			.message {
				font-size: 18px;
				font-weight: bold;
				margin-bottom: 20px;
				color: #28a745;
			}
	
			.body {
				font-size: 16px;
				margin-bottom: 20px;
				text-align: left;
			}
	
			.payment-details {
				background-color: #f8f9fa;
				padding: 20px;
				border-radius: 8px;
				margin: 20px 0;
				text-align: left;
			}
	
			.payment-details h3 {
				margin-top: 0;
				color: #495057;
			}
	
			.payment-details p {
				margin: 8px 0;
			}
	
			.amount {
				font-size: 24px;
				font-weight: bold;
				color: #28a745;
			}
	
			.support {
				font-size: 14px;
				color: #999999;
				margin-top: 20px;
			}
	
			.highlight {
				font-weight: bold;
				color: #495057;
			}
		</style>
	
	</head>
	
	<body>
		<div class="container">
			<a href="https://studynotion-edtech-project.vercel.app"><img class="logo"
					src="https://i.ibb.co/7Xyj3PC/logo.png" alt="StudyNotion Logo"></a>
			<div class="message">Enrollment Fee Payment Successful!</div>
			<div class="body">
				<p>Dear ${userName},</p>
				<p>Thank you for completing your enrollment fee payment. Your payment has been successfully processed and your account is now fully activated.</p>
				
				<div class="payment-details">
					<h3>Payment Details:</h3>
					<p><span class="highlight">Amount Paid:</span> <span class="amount">₹${amount}</span></p>
					<p><span class="highlight">Order ID:</span> ${orderId}</p>
					<p><span class="highlight">Payment ID:</span> ${paymentId}</p>
					<p><span class="highlight">Payment Date:</span> ${new Date().toLocaleDateString('en-IN')}</p>
				</div>
				
				<p>You now have access to all student features including:</p>
				<ul>
					<li>Course enrollment and access</li>
					<li>Progress tracking</li>
					<li>Course materials and resources</li>
					<li>Instructor support</li>
				</ul>
				
				<p>Welcome to StudyNotion! We're excited to have you as part of our learning community.</p>
			</div>
			<div class="support">If you have any questions or need assistance, please feel free to reach out to us at <a
					href="mailto:info@studynotion.com">info@studynotion.com</a>. We are here to help!</div>
		</div>
	</body>
	
	</html>`;
};

module.exports = { enrollmentFeeEmail }; 