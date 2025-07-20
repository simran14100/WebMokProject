import React, { useState } from 'react';

const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      message: ''
    });
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-richblack-900 via-richblack-800 to-richblack-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-25/5 to-yellow-100/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-richblack-25 mb-6 leading-tight">
              Get in{' '}
              <span className="bg-gradient-to-r from-yellow-25 to-yellow-100 bg-clip-text text-transparent">
                Touch
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-richblack-100 mb-12 max-w-3xl mx-auto leading-relaxed">
              Have questions or need support? We're here to help you with any inquiries about our platform.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-richblack-800 p-8 rounded-2xl border border-richblack-700 shadow-2xl">
              <h2 className="text-3xl font-bold text-richblack-25 mb-6">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-richblack-100 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-richblack-700 border border-richblack-600 rounded-lg text-richblack-25 placeholder-richblack-400 focus:outline-none focus:ring-2 focus:ring-yellow-25 focus:border-transparent transition-all duration-300"
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-richblack-100 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-richblack-700 border border-richblack-600 rounded-lg text-richblack-25 placeholder-richblack-400 focus:outline-none focus:ring-2 focus:ring-yellow-25 focus:border-transparent transition-all duration-300"
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-richblack-100 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-richblack-700 border border-richblack-600 rounded-lg text-richblack-25 placeholder-richblack-400 focus:outline-none focus:ring-2 focus:ring-yellow-25 focus:border-transparent transition-all duration-300"
                    placeholder="Enter your email address"
                  />
                </div>

                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-richblack-100 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-richblack-700 border border-richblack-600 rounded-lg text-richblack-25 placeholder-richblack-400 focus:outline-none focus:ring-2 focus:ring-yellow-25 focus:border-transparent transition-all duration-300"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-richblack-100 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 bg-richblack-700 border border-richblack-600 rounded-lg text-richblack-25 placeholder-richblack-400 focus:outline-none focus:ring-2 focus:ring-yellow-25 focus:border-transparent transition-all duration-300 resize-none"
                    placeholder="Tell us how we can help you..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-yellow-25 to-yellow-100 text-richblack-900 font-bold py-4 px-6 rounded-lg hover:from-yellow-100 hover:to-yellow-25 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-richblack-25 mb-6">Contact Information</h2>
                <p className="text-lg text-richblack-100 mb-8 leading-relaxed">
                  We're here to help and answer any questions you might have. We look forward to hearing from you.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <span className="text-xl">📧</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-richblack-25 mb-2">Email</h3>
                    <p className="text-richblack-100">info@studynotion.com</p>
                    <p className="text-richblack-100">support@studynotion.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <span className="text-xl">📞</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-richblack-25 mb-2">Phone</h3>
                    <p className="text-richblack-100">+91 98765 43210</p>
                    <p className="text-richblack-100">+91 98765 43211</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <span className="text-xl">📍</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-richblack-25 mb-2">Address</h3>
                    <p className="text-richblack-100">StudyNotion Headquarters</p>
                    <p className="text-richblack-100">Education District, Tech City</p>
                    <p className="text-richblack-100">Mumbai, Maharashtra 400001</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <span className="text-xl">🕒</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-richblack-25 mb-2">Business Hours</h3>
                    <p className="text-richblack-100">Monday - Friday: 9:00 AM - 6:00 PM</p>
                    <p className="text-richblack-100">Saturday: 10:00 AM - 4:00 PM</p>
                    <p className="text-richblack-100">Sunday: Closed</p>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="pt-8">
                <h3 className="text-xl font-semibold text-richblack-25 mb-4">Follow Us</h3>
                <div className="flex gap-4">
                  <a href="#" className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center hover:scale-110 transition-transform duration-300">
                    <span className="text-xl">📘</span>
                  </a>
                  <a href="#" className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-500 rounded-lg flex items-center justify-center hover:scale-110 transition-transform duration-300">
                    <span className="text-xl">🐦</span>
                  </a>
                  <a href="#" className="w-12 h-12 bg-gradient-to-r from-pink-500 to-pink-600 rounded-lg flex items-center justify-center hover:scale-110 transition-transform duration-300">
                    <span className="text-xl">📷</span>
                  </a>
                  <a href="#" className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center hover:scale-110 transition-transform duration-300">
                    <span className="text-xl">📺</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-16 bg-richblack-800/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-richblack-25 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-richblack-100">
              Find answers to common questions about our platform.
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-richblack-800 p-6 rounded-xl border border-richblack-700">
              <h3 className="text-lg font-semibold text-richblack-25 mb-2">
                How do I enroll as a student?
              </h3>
              <p className="text-richblack-100">
                Simply sign up for an account, choose the student role, and complete the enrollment payment of ₹1000 to access all courses.
              </p>
            </div>

            <div className="bg-richblack-800 p-6 rounded-xl border border-richblack-700">
              <h3 className="text-lg font-semibold text-richblack-25 mb-2">
                How can I become an instructor?
              </h3>
              <p className="text-richblack-100">
                Register as an instructor, submit your credentials, and wait for admin approval. Once approved, you can create and publish courses.
              </p>
            </div>

            <div className="bg-richblack-800 p-6 rounded-xl border border-richblack-700">
              <h3 className="text-lg font-semibold text-richblack-25 mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-richblack-100">
                We accept all major credit cards, debit cards, and digital wallets through our secure Razorpay integration.
              </p>
            </div>

            <div className="bg-richblack-800 p-6 rounded-xl border border-richblack-700">
              <h3 className="text-lg font-semibold text-richblack-25 mb-2">
                Is there a refund policy?
              </h3>
              <p className="text-richblack-100">
                Yes, we offer a 30-day money-back guarantee for all enrollment fees if you're not satisfied with our platform.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact; 