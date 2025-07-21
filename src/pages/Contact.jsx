import React from "react";
import ContactUsForm from "../components/common/ContactUsForm";

const TAWKTO_GREEN = '#009e5c';
const TAWKTO_GREEN_DARK = '#007a44';
const BORDER = '#e0e0e0';
const TEXT_DARK = '#222';

const Contact = () => {
  return (
    <div style={{ background: '#fff', minHeight: '100vh', padding: '2rem 0' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 36, fontWeight: 700, color: TAWKTO_GREEN, marginBottom: 12 }}>Contact Us</h1>
          <p style={{ fontSize: 18, color: TEXT_DARK }}>
            Got an idea? We've got the skills. Let's team up!
          </p>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: 32, border: `1px solid ${BORDER}`, marginBottom: 40 }}>
          <h2 style={{ color: TAWKTO_GREEN, fontWeight: 600, fontSize: 22, marginBottom: 18 }}>Frequently Asked Questions</h2>
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ color: TEXT_DARK, fontWeight: 600, fontSize: 18, marginBottom: 6 }}>How do I enroll as a student?</h3>
            <p style={{ color: TEXT_DARK, marginBottom: 12 }}>
              Simply sign up for an account, choose the student role, and complete the enrollment payment of ₹1000 to access all courses.
            </p>
            <h3 style={{ color: TEXT_DARK, fontWeight: 600, fontSize: 18, marginBottom: 6 }}>How can I become an instructor?</h3>
            <p style={{ color: TEXT_DARK, marginBottom: 12 }}>
              Register as an instructor, submit your credentials, and wait for admin approval. Once approved, you can create and publish courses.
            </p>
            <h3 style={{ color: TEXT_DARK, fontWeight: 600, fontSize: 18, marginBottom: 6 }}>What payment methods do you accept?</h3>
            <p style={{ color: TEXT_DARK, marginBottom: 12 }}>
              We accept all major credit cards, debit cards, and digital wallets through our secure Razorpay integration.
            </p>
            <h3 style={{ color: TEXT_DARK, fontWeight: 600, fontSize: 18, marginBottom: 6 }}>Is there a refund policy?</h3>
            <p style={{ color: TEXT_DARK, marginBottom: 12 }}>
              Yes, we offer a 30-day money-back guarantee for all enrollment fees if you're not satisfied with our platform.
            </p>
          </div>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: 32, border: `1px solid ${BORDER}` }}>
          <h2 style={{ color: TAWKTO_GREEN, fontWeight: 600, fontSize: 22, marginBottom: 18 }}>Tell us more about yourself and what you've got in mind.</h2>
          <ContactUsForm />
        </div>
      </div>
    </div>
  );
};

export default Contact; 