import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import CountryCode from "../../data/countrycode.json";

const TAWKTO_GREEN = '#007a44'; // use previous hover as normal
const TAWKTO_GREEN_DARK = '#005c32'; // even darker for hover
const BORDER = '#e0e0e0';
const TEXT_DARK = '#222';

const ContactUsForm = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedCode, setSelectedCode] = useState(CountryCode[0]?.code || "");
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitSuccessful },
  } = useForm();

  const submitContactForm = async (data) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1200);
  };

  useEffect(() => {
    if (isSubmitSuccessful) {
      reset({
        email: "",
        firstname: "",
        lastname: "",
        message: "",
        phoneNo: "",
        countrycode: CountryCode[0]?.code || ""
      });
      setSelectedCode(CountryCode[0]?.code || "");
    }
  }, [reset, isSubmitSuccessful]);

  // Keep react-hook-form in sync with selectedCode
  useEffect(() => {
    setValue("countrycode", selectedCode);
  }, [selectedCode, setValue]);

  if (submitted) {
    return (
      <div style={{ color: TAWKTO_GREEN, fontWeight: 600, fontSize: 18, textAlign: 'center', padding: '2em 0' }}>
        Thank you for contacting us! We'll get back to you soon.
      </div>
    );
  }

  return (
    <form style={{ display: 'flex', flexDirection: 'column', gap: 24 }} onSubmit={handleSubmit(submitContactForm)}>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 180 }}>
          <label htmlFor="firstname" style={{ color: TEXT_DARK, fontWeight: 500, display: 'block', marginBottom: 6 }}>First Name</label>
          <input
            type="text"
            name="firstname"
            id="firstname"
            placeholder="Enter first name"
            style={{ width: '100%', padding: '10px 12px', border: `1px solid ${BORDER}`, borderRadius: 6, background: '#f9fefb', color: TEXT_DARK, outline: 'none', fontSize: 16, transition: 'border 0.2s' }}
            {...register("firstname", { required: true })}
            onFocus={e => e.target.style.border = `1.5px solid ${TAWKTO_GREEN}`}
            onBlur={e => e.target.style.border = `1px solid ${BORDER}`}
          />
          {errors.firstname && (
            <span style={{ color: '#e53935', fontSize: 13 }}>Please enter your name.</span>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 180 }}>
          <label htmlFor="lastname" style={{ color: TEXT_DARK, fontWeight: 500, display: 'block', marginBottom: 6 }}>Last Name</label>
          <input
            type="text"
            name="lastname"
            id="lastname"
            placeholder="Enter last name"
            style={{ width: '100%', padding: '10px 12px', border: `1px solid ${BORDER}`, borderRadius: 6, background: '#f9fefb', color: TEXT_DARK, outline: 'none', fontSize: 16, transition: 'border 0.2s' }}
            {...register("lastname")}
            onFocus={e => e.target.style.border = `1.5px solid ${TAWKTO_GREEN}`}
            onBlur={e => e.target.style.border = `1px solid ${BORDER}`}
          />
        </div>
      </div>
      <div>
        <label htmlFor="email" style={{ color: TEXT_DARK, fontWeight: 500, display: 'block', marginBottom: 6 }}>Email Address</label>
        <input
          type="email"
          name="email"
          id="email"
          placeholder="Enter email address"
          style={{ width: '100%', padding: '10px 12px', border: `1px solid ${BORDER}`, borderRadius: 6, background: '#f9fefb', color: TEXT_DARK, outline: 'none', fontSize: 16, transition: 'border 0.2s' }}
          {...register("email", { required: true })}
          onFocus={e => e.target.style.border = `1.5px solid ${TAWKTO_GREEN}`}
          onBlur={e => e.target.style.border = `1px solid ${BORDER}`}
        />
        {errors.email && (
          <span style={{ color: '#e53935', fontSize: 13 }}>Please enter your Email address.</span>
        )}
      </div>
      <div>
        <label htmlFor="phonenumber" style={{ color: TEXT_DARK, fontWeight: 500, display: 'block', marginBottom: 6 }}>Phone Number</label>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {/* Custom select for user interaction */}
          <select
            style={{
              width: 140,
              padding: '10px 12px',
              border: `1px solid ${BORDER}`,
              borderRadius: 6,
              background: '#f9fefb',
              color: TEXT_DARK,
              outline: 'none',
              fontSize: 16,
            }}
            value={selectedCode}
            onChange={e => setSelectedCode(e.target.value)}
          >
            {CountryCode.map((ele, i) => (
              <option key={i} value={ele.code}>
                {ele.code} - {ele.country}
              </option>
            ))}
          </select>
          {/* Readonly input to display only the code */}
          <input
            type="text"
            value={selectedCode}
            readOnly
            style={{
              width: 60,
              padding: '10px 12px',
              border: `1px solid ${BORDER}`,
              borderRadius: 6,
              background: '#f9fefb',
              color: TEXT_DARK,
              outline: 'none',
              fontSize: 16,
              marginLeft: 8,
            }}
            tabIndex={-1}
          />
          {/* Hidden select for form submission (keeps react-hook-form happy) */}
          <select
            name="countrycode"
            id="countrycode"
            style={{ display: 'none' }}
            {...register("countrycode", { required: true })}
            value={selectedCode}
            readOnly
            tabIndex={-1}
          >
            {CountryCode.map((ele, i) => (
              <option key={i} value={ele.code}>
                {ele.code}
              </option>
            ))}
          </select>
          <input
            type="number"
            name="phonenumber"
            id="phonenumber"
            placeholder="12345 67890"
            style={{ flex: 1, padding: '10px 12px', border: `1px solid ${BORDER}`, borderRadius: 6, background: '#f9fefb', color: TEXT_DARK, outline: 'none', fontSize: 16, transition: 'border 0.2s' }}
            {...register("phoneNo", {
              required: { value: true, message: "Please enter your Phone Number." },
              maxLength: { value: 12, message: "Invalid Phone Number" },
              minLength: { value: 10, message: "Invalid Phone Number" },
            })}
            onFocus={e => e.target.style.border = `1.5px solid ${TAWKTO_GREEN}`}
            onBlur={e => e.target.style.border = `1px solid ${BORDER}`}
          />
        </div>
        {errors.phoneNo && (
          <span style={{ color: '#e53935', fontSize: 13 }}>{errors.phoneNo.message}</span>
        )}
      </div>
      <div>
        <label htmlFor="message" style={{ color: TEXT_DARK, fontWeight: 500, display: 'block', marginBottom: 6 }}>Message</label>
        <textarea
          name="message"
          id="message"
          rows={5}
          placeholder="Enter your message here"
          style={{ width: '100%', padding: '10px 12px', border: `1px solid ${BORDER}`, borderRadius: 6, background: '#f9fefb', color: TEXT_DARK, outline: 'none', fontSize: 16, transition: 'border 0.2s', resize: 'vertical' }}
          {...register("message", { required: true })}
          onFocus={e => e.target.style.border = `1.5px solid ${TAWKTO_GREEN}`}
          onBlur={e => e.target.style.border = `1px solid ${BORDER}`}
        />
        {errors.message && (
          <span style={{ color: '#e53935', fontSize: 13 }}>Please enter your Message.</span>
        )}
      </div>
      <button
        disabled={loading}
        type="submit"
        style={{
          borderRadius: 24,
          background: TAWKTO_GREEN,
          color: '#fff',
          fontWeight: 700,
          fontSize: 18,
          padding: '14px 0',
          marginTop: 8,
          cursor: loading ? 'not-allowed' : 'pointer',
          border: 'none',
          width: '100%',
          transition: 'background 0.2s',
          boxShadow: '0 2px 8px rgba(0,158,92,0.08)'
        }}
        onMouseOver={e => e.target.style.background = TAWKTO_GREEN_DARK}
        onMouseOut={e => e.target.style.background = TAWKTO_GREEN}
      >
        {loading ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
};

export default ContactUsForm; 