import React from "react";
import ContactUsForm from "../components/common/ContactUsForm";
import Footer from "../components/common/Footer";
import { FaPhone, FaLocationDot, FaClock, FaUser, FaFacebookF, FaInstagram, FaBehance, FaSkype, FaYoutube, FaHeart, FaCartShopping, FaBars, FaXmark, FaEnvelope, FaCalendar } from 'react-icons/fa6';
import { FaChevronDown, FaArrowUp } from 'react-icons/fa';
import pageHeaderShape1 from '../assets/img/shapes/page-header-shape-1.png';
import pageHeaderShape2 from '../assets/img/shapes/page-header-shape-2.png';
import pageHeaderShape3 from '../assets/img/shapes/page-header-shape-3.png';
import { Link } from "react-router-dom";
import pageHeaderBg from '../assets/img/bg-img/page-header-bg.png';

const TAWKTO_GREEN = '#009e5c';
const TAWKTO_GREEN_DARK = '#007a44';
const BORDER = '#e0e0e0';
const TEXT_DARK = '#222';





const EdCareTemplate = () => {
  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", color: '#333' , marginTop:'150px'}}>
      

    

      {/* Page Header */}
            <section style={{ 
              position: 'relative', 
              padding: '120px 0', 
              overflow: 'hidden',
             
            }}>
              {/* Background Image */}
              <div style={{ 
                position: 'absolute', 
                inset: 0, 
                backgroundImage: `url(${pageHeaderBg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                
              }}></div>
              <div style={{ 
                position: 'absolute', 
                inset: 0, 
                backgroundColor: 'black', 
                opacity: 0.4 
              }}></div>
              
              {/* Background Shapes */}
              <div style={{ position: 'absolute', inset: 0 }}>
                <div style={{ 
                  position: 'absolute', 
                  top: '40px', 
                  left: '40px', 
                  opacity: 0.1 
                }}>
                  <img src={pageHeaderShape1} alt="shape" style={{ width: '80px', height: '80px' }} />
                </div>
                <div style={{ 
                  position: 'absolute', 
                  top: '80px', 
                  right: '80px', 
                  opacity: 0.1 
                }}>
                  <img src={pageHeaderShape2} alt="shape" style={{ width: '64px', height: '64px' }} />
                </div>
                <div style={{ 
                  position: 'absolute', 
                  bottom: '40px', 
                  left: '25%', 
                  opacity: 0.1 
                }}>
                  <img src={pageHeaderShape3} alt="shape" style={{ width: '48px', height: '48px' }} />
                </div>
              </div>
              
              <div style={{ 
                position: 'relative', 
                maxWidth: '1280px', 
                margin: '0 auto', 
                padding: '0 16px' 
              }}>
                <div style={{ textAlign: 'center' }}>
                  <h1 style={{ 
                    fontSize: '48px', 
                    fontWeight: 'bold', 
                    color: 'white', 
                    marginBottom: '16px' 
                  }}>
                    Contact Us
                  </h1>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '8px', 
                    color: 'white' 
                  }}>
                    <Link to="/" style={{ 
                      color: 'white', 
                      textDecoration: 'none',
                      transition: 'color 0.3s'
                    }}>
                      Contact
                    </Link>
                    <span style={{ color: '#e6fcf5' }}>/</span>
                    <span style={{ color: '#e6fcf5' }}>Contact Us</span>
                  </div>
                </div>
              </div>
            </section>

      {/* Contact Section */}
      {/* <section style={{ padding: '80px 0' }}>
        <div style={{ 
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 15px'
        }}>
          <div style={{ 
            display: 'flex',
            gap: '30px',
            flexWrap: 'wrap'
          }}>
            <div style={{ flex: '1', minWidth: '300px' }}>
              <h2 style={{ 
                fontSize: '32px',
                fontWeight: '700',
                marginBottom: '10px'
              }}>Leave A Reply</h2>
              <p style={{ 
                marginBottom: '30px',
                color: '#666'
              }}>Fill-up The Form and Message us of your amazing question</p>
              
              <form style={{ maxWidth: '600px' }}>
                <div style={{ 
                  display: 'flex',
                  gap: '20px',
                  marginBottom: '20px'
                }}>
                  <div style={{ flex: '1' }}>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type="text" 
                        placeholder="Your Name" 
                        style={{
                          width: '100%',
                          padding: '15px 15px 15px 40px',
                          border: '1px solid #ddd',
                          borderRadius: '5px'
                        }}
                      />
                      <FaUser style={{
                        position: 'absolute',
                        left: '15px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#666'
                      }} />
                    </div>
                  </div>
                  <div style={{ flex: '1' }}>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type="email" 
                        placeholder="Your Email" 
                        style={{
                          width: '100%',
                          padding: '15px 15px 15px 40px',
                          border: '1px solid #ddd',
                          borderRadius: '5px'
                        }}
                      />
                      <FaEnvelope style={{
                        position: 'absolute',
                        left: '15px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#666'
                      }} />
                    </div>
                  </div>
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                  <select style={{
                    width: '100%',
                    padding: '15px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    appearance: 'none'
                  }}>
                    <option value="">Select Subject</option>
                    <option value="1">General Inquiry</option>
                    <option value="2">Technical Support</option>
                    <option value="3">Billing Question</option>
                  </select>
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                  <textarea 
                    placeholder="Message" 
                    rows="5" 
                    style={{
                      width: '100%',
                      padding: '15px',
                      border: '1px solid #ddd',
                      borderRadius: '5px'
                    }}
                  ></textarea>
                </div>
                
                <button style={{
                  background: '#07A698',
                  color: '#fff',
                  border: 'none',
                  padding: '15px 30px',
                  borderRadius: '5px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}>
                  Submit Message
                </button>
              </form>
            </div>
            
            <div style={{ flex: '1', minWidth: '300px' }}>
              <div>
                <h3 style={{ 
                  fontSize: '24px',
                  fontWeight: '700',
                  marginBottom: '15px'
                }}>Office Information</h3>
                <p style={{ 
                  marginBottom: '30px',
                  color: '#666'
                }}>Completely recapitalize 24/7 communities via standards compliant metrics whereas.</p>
                
                <div style={{ marginBottom: '30px' }}>
                  <div style={{ 
                    display: 'flex',
                    gap: '15px',
                    marginBottom: '20px'
                  }}>
                    <div style={{
                      width: '50px',
                      height: '50px',
                      background: '#f5f5f5',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <FaPhone style={{ color: '#07A698' }} />
                    </div>
                    <div>
                      <h4 style={{ 
                        fontSize: '18px',
                        fontWeight: '600',
                        marginBottom: '5px'
                      }}>Phone Number & Email</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <a href="tel:+65485965789" style={{ color: '#333', textDecoration: 'none' }}>(+65) - 48596 - 5789</a>
                        <a href="mailto:hello@edcare.com" style={{ color: '#333', textDecoration: 'none' }}>hello@edcare.com</a>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ 
                    display: 'flex',
                    gap: '15px',
                    marginBottom: '20px'
                  }}>
                    <div style={{
                      width: '50px',
                      height: '50px',
                      background: '#f5f5f5',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <FaLocationDot style={{ color: '#07A698' }} />
                    </div>
                    <div>
                      <h4 style={{ 
                        fontSize: '18px',
                        fontWeight: '600',
                        marginBottom: '5px'
                      }}>Our Office Address</h4>
                      <p>2690 Hilton Street Victoria Road, <br />New York, Canada</p>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '15px' }}>
                    <div style={{
                      width: '50px',
                      height: '50px',
                      background: '#f5f5f5',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <FaClock style={{ color: '#07A698' }} />
                    </div>
                    <div>
                      <h4 style={{ 
                        fontSize: '18px',
                        fontWeight: '600',
                        marginBottom: '5px'
                      }}>Official Work Time</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <span>Monday - Friday: 09:00 - 20:00</span>
                        <span>Sunday & Saturday: 10:30 - 22:00</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section> */}

     
  <section style={{ 
  padding: '80px 0',
  background: '#F9FAFC'
}}>
  <div style={{ 
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 15px'
  }}>
    <div style={{ 
      display: 'flex',
      gap: '30px',
      flexWrap: 'wrap'
    }}>
      {/* Contact Form */}
      <div style={{ 
        flex: '1', 
        minWidth: '300px',
        background: '#FFFFFF',
        borderRadius: '8px',
        padding: '40px',
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)'
      }}>
        <h2 style={{ 
          fontSize: '28px',
          fontWeight: '700',
          color: '#071C35',
          marginBottom: '15px'
        }}>Leave A Reply</h2>
        <p style={{ 
          fontSize: '16px',
          color: '#4A4A4A',
          marginBottom: '30px',
          lineHeight: '1.6'
        }}>Fill-up The Form and Message us of your amazing question</p>
        
        <form>
          <div style={{ 
            display: 'flex',
            gap: '20px',
            marginBottom: '20px',
            flexWrap: 'wrap'
          }}>
            <div style={{ flex: '1', minWidth: '250px' }}>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  placeholder="Your Name" 
                  style={{
                    width: '100%',
                    padding: '14px 14px 14px 45px',
                    border: '1px solid #E0E3EB',
                    borderRadius: '6px',
                    fontSize: '15px',
                    transition: 'border-color 0.3s ease',
                    ':focus': {
                      outline: 'none',
                      borderColor: '#07A698'
                    }
                  }}
                />
                <FaUser style={{
                  position: 'absolute',
                  left: '15px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#8E9AAB',
                  fontSize: '18px'
                }} />
              </div>
            </div>
            <div style={{ flex: '1', minWidth: '250px' }}>
              <div style={{ position: 'relative' }}>
                <input 
                  type="email" 
                  placeholder="Your Email" 
                  style={{
                    width: '100%',
                    padding: '14px 14px 14px 45px',
                    border: '1px solid #E0E3EB',
                    borderRadius: '6px',
                    fontSize: '15px',
                    transition: 'border-color 0.3s ease',
                    ':focus': {
                      outline: 'none',
                      borderColor: '#07A698'
                    }
                  }}
                />
                <FaEnvelope style={{
                  position: 'absolute',
                  left: '15px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#8E9AAB',
                  fontSize: '18px'
                }} />
              </div>
            </div>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <select style={{
              width: '100%',
              padding: '14px 15px',
              border: '1px solid #E0E3EB',
              borderRadius: '6px',
              fontSize: '15px',
              appearance: 'none',
              backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%238E9AAB%22%20d%3D%22M6%208.825L1.175%204%201.825%203.35%206%207.525%2010.175%203.35%2010.825%204z%22%2F%3E%3C%2Fsvg%3E")',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 15px center',
              transition: 'border-color 0.3s ease',
              ':focus': {
                outline: 'none',
                borderColor: '#07A698'
              }
            }}>
              <option value="">Select Subject</option>
              <option value="1">General Inquiry</option>
              <option value="2">Technical Support</option>
              <option value="3">Billing Question</option>
            </select>
          </div>
          
          <div style={{ marginBottom: '25px' }}>
            <textarea 
              placeholder="Message" 
              rows="5" 
              style={{
                width: '100%',
                padding: '14px',
                border: '1px solid #E0E3EB',
                borderRadius: '6px',
                fontSize: '15px',
                transition: 'border-color 0.3s ease',
                ':focus': {
                  outline: 'none',
                  borderColor: '#07A698'
                }
              }}
            ></textarea>
          </div>
          
          <button style={{
            background: '#07A698',
            color: '#FFFFFF',
            border: 'none',
            padding: '14px 30px',
            borderRadius: '6px',
            fontWeight: '600',
            fontSize: '16px',
            cursor: 'pointer',
            width: '100%',
            transition: 'all 0.3s ease',
            ':hover': {
              background: '#058B7D',
              transform: 'translateY(-2px)'
            }
          }}>
            Submit Message
          </button>
        </form>
      </div>
      
      {/* Contact Information */}
      {/* <div style={{ 
        flex: '1', 
        minWidth: '300px',
        background: '#FFFFFF',
        borderRadius: '8px',
        padding: '40px',
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)'
      }}>
        <h3 style={{ 
          fontSize: '24px',
          fontWeight: '700',
          color: '#071C35',
          marginBottom: '15px'
        }}>Office Information</h3>
        <p style={{ 
          fontSize: '16px',
          color: '#4A4A4A',
          marginBottom: '30px',
          lineHeight: '1.6'
        }}>Completely recapitalize 24/7 communities via standards compliant metrics whereas.</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          <div style={{ display: 'flex', gap: '15px' }}>
            <div style={{
              width: '50px',
              height: '50px',
              background: 'rgba(7, 166, 152, 0.1)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <FaPhone style={{ 
                color: '#07A698',
                fontSize: '18px'
              }} />
            </div>
            <div>
              <h4 style={{ 
                fontSize: '18px',
                fontWeight: '600',
                color: '#191A1F',
                marginBottom: '8px'
              }}>Phone Number & Email</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <a href="tel:+65485965789" style={{ 
                  color: '#4A4A4A',
                  textDecoration: 'none',
                  fontSize: '15px',
                  transition: 'color 0.3s ease',
                  ':hover': {
                    color: '#07A698'
                  }
                }}>
                  (+65) - 48596 - 5789
                </a>
                <a href="mailto:hello@edcare.com" style={{ 
                  color: '#4A4A4A',
                  textDecoration: 'none',
                  fontSize: '15px',
                  transition: 'color 0.3s ease',
                  ':hover': {
                    color: '#07A698'
                  }
                }}>
                  hello@edcare.com
                </a>
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '15px' }}>
            <div style={{
              width: '50px',
              height: '50px',
              background: 'rgba(7, 166, 152, 0.1)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <FaLocationDot style={{ 
                color: '#07A698',
                fontSize: '18px'
              }} />
            </div>
            <div>
              <h4 style={{ 
                fontSize: '18px',
                fontWeight: '600',
                color: '#191A1F',
                marginBottom: '8px'
              }}>Our Office Address</h4>
              <p style={{ 
                color: '#4A4A4A',
                fontSize: '15px',
                lineHeight: '1.6',
                margin: 0
              }}>
                2690 Hilton Street Victoria Road, <br />
                New York, Canada
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '15px' }}>
            <div style={{
              width: '50px',
              height: '50px',
              background: 'rgba(7, 166, 152, 0.1)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <FaClock style={{ 
                color: '#07A698',
                fontSize: '18px'
              }} />
            </div>
            <div>
              <h4 style={{ 
                fontSize: '18px',
                fontWeight: '600',
                color: '#191A1F',
                marginBottom: '8px'
              }}>Official Work Time</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ 
                  color: '#4A4A4A',
                  fontSize: '15px'
                }}>
                  Monday - Friday: 09:00 - 20:00
                </span>
                <span style={{ 
                  color: '#4A4A4A',
                  fontSize: '15px'
                }}>
                  Sunday & Saturday: 10:30 - 22:00
                </span>
              </div>
            </div>
          </div>
        </div>
      </div> */}
      <div style={{ 
  flex: '1', 
  minWidth: '300px',
  background: '#FFFFFF',
  borderRadius: '8px',
  padding: '40px',
  boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)'
}}>
  <h3 style={{ 
    fontSize: '24px',
    fontWeight: '700',
    color: '#071C35',
    marginBottom: '15px'
  }}>Office Information</h3>
  <p style={{ 
    fontSize: '16px',
    color: '#4A4A4A',
    marginBottom: '30px',
    lineHeight: '1.6'
  }}>Completely recapitalize 24/7 communities via standards compliant metrics whereas.</p>
  
  <div style={{ 
    display: 'flex', 
    flexDirection: 'column',
    gap: '30px'
  }}>
    {/* Phone & Email */}
    <div style={{ 
      display: 'flex', 
      gap: '20px',
      paddingBottom: '30px',
      borderBottom: '1px solid #F0F2F5'
    }}>
      <div style={{
        width: '56px',
        height: '56px',
        background: 'rgba(7, 166, 152, 0.1)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        marginRight: '10px'
      }}>
        <FaPhone style={{ 
          color: '#07A698',
          fontSize: '20px'
        }} />
      </div>
      <div>
        <h4 style={{ 
          fontSize: '18px',
          fontWeight: '600',
          color: '#191A1F',
          marginBottom: '12px'
        }}>Phone Number & Email</h4>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '8px'
        }}>
          <a href="tel:+65485965789" style={{ 
            color: '#4A4A4A',
            textDecoration: 'none',
            fontSize: '15px',
            transition: 'color 0.3s ease',
            ':hover': {
              color: '#07A698'
            }
          }}>
            (+65) - 48596 - 5789
          </a>
          <a href="mailto:hello@edcare.com" style={{ 
            color: '#4A4A4A',
            textDecoration: 'none',
            fontSize: '15px',
            transition: 'color 0.3s ease',
            ':hover': {
              color: '#07A698'
            }
          }}>
            hello@edcare.com
          </a>
        </div>
      </div>
    </div>
    
    {/* Address */}
    <div style={{ 
      display: 'flex', 
      gap: '20px',
      paddingBottom: '30px',
      borderBottom: '1px solid #F0F2F5'
    }}>
      <div style={{
        width: '56px',
        height: '56px',
        background: 'rgba(7, 166, 152, 0.1)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        marginRight: '10px'
      }}>
        <FaLocationDot style={{ 
          color: '#07A698',
          fontSize: '20px'
        }} />
      </div>
      <div>
        <h4 style={{ 
          fontSize: '18px',
          fontWeight: '600',
          color: '#191A1F',
          marginBottom: '12px'
        }}>Our Office Address</h4>
        <p style={{ 
          color: '#4A4A4A',
          fontSize: '15px',
          lineHeight: '1.6',
          margin: 0
        }}>
          2690 Hilton Street Victoria Road, <br />
          New York, Canada
        </p>
      </div>
    </div>
    
    {/* Work Time */}
    <div style={{ 
      display: 'flex', 
      gap: '20px',
      paddingTop: '10px'
    }}>
      <div style={{
        width: '56px',
        height: '56px',
        background: 'rgba(7, 166, 152, 0.1)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        marginRight: '10px'
      }}>
        <FaClock style={{ 
          color: '#07A698',
          fontSize: '20px'
        }} />
      </div>
      <div>
        <h4 style={{ 
          fontSize: '18px',
          fontWeight: '600',
          color: '#191A1F',
          marginBottom: '12px'
        }}>Official Work Time</h4>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '8px'
        }}>
          <span style={{ 
            color: '#4A4A4A',
            fontSize: '15px'
          }}>
            Monday - Friday: 09:00 - 20:00
          </span>
          <span style={{ 
            color: '#4A4A4A',
            fontSize: '15px'
          }}>
            Sunday & Saturday: 10:30 - 22:00
          </span>
        </div>
      </div>
    </div>
  </div>
</div>
    </div>
  </div>
</section>

      
      
    <Footer />
    </div>
  );
};

      
   
export default EdCareTemplate;