// component.js
import React, { useState, useEffect, useContext, createContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import FourthSVG from './assets/fourth.svg';
import FifthSVG from './assets/fifth.svg';
import SixthSVG from './assets/six.svg';
import logo from './assets/logoo.svg';
import GoogleSVG from './assets/google.svg';
import ArrowSVG from './assets/Arrow.svg';
import SeventhSVG from './assets/icon.svg';
import PhoneImage1 from './assets/1.svg';
import PhoneImage2 from './assets/2.svg';
import PhoneImage3 from './assets/3.svg';
import CanvaImage from './assets/canva.svg';
import GroupSVG from './assets/Group.svg';
import Group583SVG from './assets/Group 583.svg';
import Group686SVG from './assets/Group 686.svg';

import IPSVG from './assets/svg ip.svg';
import SectionSVG from './assets/clario section.svg';
import HeroStyles from './HeroStyles';

const IS_PRODUCTION = process.env.REACT_APP_ENVIRONMENT === 'production';
const BACKEND_URL = IS_PRODUCTION ? 'https://api.clario.co.in' : 'http://localhost:8001';
const API = `${BACKEND_URL}/api`;
const REDIRECT_URI = IS_PRODUCTION ? 'https://clario.co.in/google-callback' : 'http://localhost:3000/google-callback';

// Debug logging
console.log('Environment variables:', {
  REACT_APP_BACKEND_URL: process.env.REACT_APP_BACKEND_URL,
  REACT_APP_ENVIRONMENT: process.env.REACT_APP_ENVIRONMENT,
  BACKEND_URL: BACKEND_URL,
  API: API,
  REDIRECT_URI: REDIRECT_URI
});

// Auth Context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.get(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(response => {
        setUser(response.data);
      })
      .catch(() => {
        localStorage.removeItem('token');
        setToken(null);
      })
      .finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Header Component
export const Header = () => {
  const navigate = useNavigate();

  const handleTryClick = () => {
    navigate('/auth');
  };

  return (
    <header className="flex items-center justify-between px-10 py-6 bg-transparent">
      <div className="logo-container flex items-center">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'clamp(8px, 2vw, 10px)'
        }}>
          <img
            src={logo}
            alt="Clario Logo"
            style={{
              width: 'clamp(30px, 4vw, 42px)',
              height: 'clamp(30px, 4vw, 42px)'
            }}
          />
          <span style={{
            color: '#3D74B6',
            fontFamily: '"SF UI Display", -apple-system, BlinkMacSystemFont, sans-serif',
            fontSize: 'clamp(24px, 5vw, 36px)',
            fontStyle: 'normal',
            fontWeight: 600,
            lineHeight: 'normal',
            letterSpacing: '-1.76px'
          }}>
            Clario
          </span>
        </div>
      </div>
      <div className="button-container flex items-center space-x-4">
        <button
          onClick={handleTryClick}
          style={{
            display: 'flex',
            width: 'clamp(90px, 9vw, 130px)',
            height: 'clamp(28px, 3.5vw, 47px)',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 'clamp(6px, 1vw, 8px)',
            flexShrink: 0,
            borderRadius: 'clamp(24px, 3.5vw, 32px)',
            border: '0.458px solid #666',
            background: '#FFF'
          }}
        >
          <span style={{
            color: '#3D74B6',
            fontFamily: '"SF UI Display", -apple-system, BlinkMacSystemFont, sans-serif',
            fontSize: 'clamp(12px, 1.8vw, 18px)',
            fontStyle: 'normal',
            fontWeight: 500,
            lineHeight: 'normal'
          }}>
            Try vO1
          </span>
        </button>
      </div>
    </header>
  );
};

// Hero Section Component
export const HeroSection = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const { user, token, loading } = useAuth();

  const toggleDropdown = (index) => {
    setOpenDropdown(openDropdown === index ? null : index);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <div style={{
          animation: 'spin 1s linear infinite',
          borderRadius: '50%',
          height: '3rem',
          width: '3rem',
          border: '2px solid rgb(0, 0, 0)',
          borderBottomColor: 'transparent',
          margin: '0 auto 1rem'
        }}></div>
      </div>
    );
  }

  return (
    <>
      <HeroStyles />
      <div className="gradient-background"></div>
      <section style={{
        padding: '0',
        background: 'transparent',
        margin: 0
      }}>
        <div style={{
          maxWidth: 'min(90%, 1150px)',
          margin: '0 auto',
          padding: '0 clamp(0.5rem, 2vw, 1rem)'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            width: 'clamp(280px, 55vw, 655px)',
            margin: 'clamp(2rem, 5vw, 4rem) auto'
          }}>
            <h1 style={{
              width: 'clamp(280px, 55vw, 750px)',
              color: '#1E1E1E',
              fontFamily: '"SF UI Display", -apple-system, BlinkMacSystemFont, sans-serif',
              fontSize: 'clamp(36px, 8vw, 72px)',
              fontStyle: 'normal',
              fontWeight: 700,
              lineHeight: 'normal',
              letterSpacing: 'clamp(-1.8px, -0.4vw, -3.6px)',
              textTransform: 'capitalize',
              textAlign: 'left',
              display: 'inline-block'
            }}>
              It’s like life,<br />but with cheat codes.
            </h1>
            <p style={{
              width: 'clamp(280px, 55vw, 655px)',
              color: '#303030',
              fontFamily: '"SF UI Display", -apple-system, BlinkMacSystemFont, sans-serif',
              fontSize: 'clamp(16px, 3vw, 26px)',
              fontStyle: 'normal',
              fontWeight: 500,
              lineHeight: 'clamp(20px, 4vw, 31.535px)',
              textAlign: 'left',
              display: 'inline-block',
              margin: 'clamp(0.25rem, 0.5vw, 0.5rem) 0 0 0'
            }}>
              Clario learns who you are and helps you choose better in work, relationships, and life.
            </p>
            <div style={{
              display: 'flex',
              justifyContent: 'flex-start',
              margin: 'clamp(0.25rem, 0.5vw, 0.5rem) 0 0 0'
            }}>
              <button
                style={{
                  display: 'flex',
                  width: 'clamp(120px, 15vw, 180px)',
                  height: 'clamp(32px, 4vw, 48px)',
                  padding: 'clamp(8px, 1.5vw, 12px) clamp(20px, 3vw, 32px)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 'clamp(6px, 1vw, 10px)',
                  borderRadius: 'clamp(30px, 4vw, 50px)',
                  background: '#3D74B6'
                }}
              >
                <span style={{
                  color: '#FFF',
                  fontFamily: '"SF UI Display", -apple-system, BlinkMacSystemFont, sans-serif',
                  fontSize: 'clamp(14px, 2vw, 19.556px)',
                  fontStyle: 'normal',
                  fontWeight: 500,
                  lineHeight: 'normal',
                  whiteSpace: 'nowrap'
                }}>
                  Coming Soon
                </span>
              </button>
            </div>
            <div className="question-wrapper">
              <div className="question-container" style={{
                width: 'min(100%, clamp(300px, 90vw, 661.668px))',
                height: 'auto',
                minHeight: 'clamp(150px, 40vw, 233.005px)',
                transform: 'rotate(-0deg)',
                flexShrink: 0,
                borderRadius: 'clamp(12px, 3vw, 25px)',
                border: '1px solid #FFF',
                background: 'rgba(255, 255, 255, 0.01)',
                boxShadow: '0 4px 10px 8px #FFF inset, 0 4px 20px 0 rgba(0, 0, 0, 0.02) inset, 0 4px 20px 0 rgba(0, 0, 0, 0.05) inset, 0 4px 22px 9px rgba(61, 116, 182, 0.25)',
                backdropFilter: 'blur(10px)',
                margin: '0 auto',
                padding: 'clamp(1rem, 2.5vw, 2rem)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start'
              }}>
                <div className="question-text-container">
                  <img
                    src={GroupSVG}
                    alt="Question Icon"
                    style={{
                      width: 'clamp(20px, 5vw, 33px)',
                      height: 'clamp(20px, 5vw, 33px)',
                      transform: 'rotate(15.647deg)',
                      flexShrink: 0
                    }}
                  />
                  <p className="question-text" style={{
                    color: '#525252',
                    fontFamily: '"SF UI Display", -apple-system, BlinkMacSystemFont, sans-serif',
                    fontSize: 'clamp(14px, 3.5vw, 20px)',
                    fontStyle: 'normal',
                    fontWeight: 500,
                    lineHeight: 'normal',
                    textTransform: 'capitalize',
                    margin: 0,
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word'
                  }}>
                    Question: Why would I even use Clario?
                  </p>
                </div>
                <p className="answer-text" style={{
                  color: '#000',
                  fontFamily: '"SF UI Display", -apple-system, BlinkMacSystemFont, sans-serif',
                  fontSize: 'clamp(14px, 3.5vw, 20px)',
                  fontStyle: 'normal',
                  fontWeight: 500,
                  lineHeight: 'normal',
                  textTransform: 'capitalize',
                  margin: 'clamp(0.5rem, 1.5vw, 2rem) 0 0 0',
                  width: 'min(100%, clamp(260px, 80vw, 518px))',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word'
                }}>
                  Because advice is only good when it’s personal. Clario grows with you, so every suggestion fits you, not just the question you asked.
                </p>
                <p className="suggestion-text-container" style={{
                  margin: 'clamp(1rem, 2.5vw, 4rem) 0 0 0',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word'
                }}>
                  <span style={{
                    color: '#666',
                    fontFamily: '"SF UI Display", -apple-system, BlinkMacSystemFont, sans-serif',
                    fontSize: 'clamp(14px, 3.5vw, 20px)',
                    fontStyle: 'normal',
                    fontWeight: 400,
                    lineHeight: 'normal',
                    textTransform: 'capitalize'
                  }}>
                    Suggestion:{' '}
                  </span>
                  <span style={{
                    color: '#000',
                    fontFamily: '"SF UI Display", -apple-system, BlinkMacSystemFont, sans-serif',
                    fontSize: 'clamp(14px, 3.5vw, 20px)',
                    fontStyle: 'normal',
                    fontWeight: 500,
                    lineHeight: 'normal',
                    textTransform: 'capitalize'
                  }}>
                    I'm sure clario will change your life.
                  </span>
                </p>
              </div>
              <img
                src={Group583SVG}
                alt="Group 583 Icon"
                className="question-icon-right"
              />
            </div>
          </div>
          <div className="normal-background" style={{
            marginTop: '395px',
            marginLeft: '0'
          }}>
            <p className="feature-section-p" style={{
              width: 'min(100%, 861.382px)',
              whiteSpace: 'pre-wrap',
              textAlign: window.innerWidth <= 480 ? 'center' : 'left',
              margin: window.innerWidth <= 480 ? '0 auto 1rem' : '0 0 1rem -8rem'
            }}>
              <span style={{
                color: '#3D74B6',
                fontFamily: '"SF UI Display", -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: 'clamp(36px, 6vw, 52px)',
                fontStyle: 'normal',
                fontWeight: 600,
                lineHeight: 'normal',
                letterSpacing: '-1.04px'
              }}>
                Clario
              </span>
              <span style={{
                color: '#1E1E1E',
                fontFamily: '"SF UI Display", -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: 'clamp(36px, 6vw, 52px)',
                fontStyle: 'normal',
                fontWeight: 400,
                lineHeight: 'normal',
                letterSpacing: '-1.04px'
              }}>
                {' '}helps you make better choices by truly knowing you.
              </span>
            </p>
            <div className="feature-text-container" style={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 'clamp(0.2rem, 1vw, 0.5rem)',
              textAlign: window.innerWidth <= 480 ? 'center' : 'left',
              margin: window.innerWidth <= 480 ? '0 auto 1rem' : '0 0 1rem -8rem',
              justifyContent: window.innerWidth <= 480 ? 'center' : 'flex-start'
            }}>
              {['Always On Insights', 'Smart Recall', 'Emotional Intelligence', 'Growth Tracking'].map((text, index) => (
                <p
                  key={index}
                  className="feature-text"
                  style={{
                    color: '#9F9F9F',
                    fontFamily: '"SF UI Display", -apple-system, BlinkMacSystemFont, sans-serif',
                    fontSize: 'clamp(16px, 2.5vw, 18px)',
                    fontStyle: 'normal',
                    fontWeight: 500,
                    lineHeight: '40.868px',
                    margin: 0,
                    cursor: 'pointer',
                    touchAction: 'manipulation'
                  }}
                >
                  {text}
                </p>
              ))}
            </div>
            <div className="image-container" style={{
              display: 'flex',
              justifyContent: window.innerWidth <= 480 ? 'center' : 'flex-start',
              alignItems: 'center',
              margin: window.innerWidth <= 480 ? '0 auto 1rem' : '0 0 1rem -8rem',
              maxWidth: '100%'
            }}>
              <img
                src={Group686SVG}
                alt="Rectangle"
                style={{
                  width: 'min(100%, 1314px)',
                  height: '900px',
                  maxHeight: '100vh',
                  flexShrink: 0,
                  borderRadius: '25px',
                  border: '1px solid #CFCFAF',
                  objectFit: 'cover'
                }}
              />
            </div>
            <div className="new-sections-container" style={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 'clamp(1rem, 2vw, 2rem)',
              alignItems: 'flex-start',
              margin: '10rem 0'
            }}>
              <div className="section-container" style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start'
              }}>
                <h2 className="section-heading" style={{
                  color: '#000',
                  fontFamily: '"SF UI Display", -apple-system, BlinkMacSystemFont, sans-serif',
                  fontSize: 'clamp(24px, 6vw, 28px)',
                  fontStyle: 'normal',
                  fontWeight: 600,
                  lineHeight: '30px',
                  textAlign: 'left',
                  margin: '0 0 1.5rem 0rem',
                  whiteSpace: 'pre-wrap'
                }}>
                  Help, Right When You Need It
                </h2>
                <p className="section-subtext" style={{
                  color: '#1E1E1E',
                  fontFamily: '"SF UI Display", -apple-system, BlinkMacSystemFont, sans-serif',
                  fontSize: 'clamp(16px, 5vw, 20px)',
                  fontStyle: 'normal',
                  fontWeight: 400,
                  lineHeight: 'normal',
                  textAlign: 'left',
                  margin: '0 0 1.5rem 0rem',
                  whiteSpace: 'pre-wrap'
                }}>
                  Clario spots what’s on your screen and drops help the moment you need it.
                </p>
                <img
                  className="section-image"
                  src={SectionSVG}
                  alt="Real-Time Understanding"
                  style={{
                    height: 'clamp(200px, 60vw, 260px)',
                    flexShrink: 0,
                    borderRadius: '25px',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
              </div>
              <div className="section-container" style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start'
              }}>
                <h2 className="section-heading" style={{
                  color: '#000',
                  fontFamily: '"SF UI Display", -apple-system, BlinkMacSystemFont, sans-serif',
                  fontSize: 'clamp(24px, 6vw, 28px)',
                  fontStyle: 'normal',
                  fontWeight: 600,
                  lineHeight: '30px',
                  textAlign: 'left',
                  margin: '0 0 1.5rem 0rem',
                  whiteSpace: 'pre-wrap'
                }}>
                  Growth, One Chat at a Time
                </h2>
                <p className="section-subtext" style={{
                  color: '#1E1E1E',
                  fontFamily: '"SF UI Display", -apple-system, BlinkMacSystemFont, sans-serif',
                  fontSize: 'clamp(16px, 5vw, 20px)',
                  fontStyle: 'normal',
                  fontWeight: 400,
                  lineHeight: 'normal',
                  textAlign: 'left',
                  margin: '0 0 1.5rem 0rem',
                  whiteSpace: 'pre-wrap'
                }}>
                  It remembers your choices, gives weekly nudges, and chats with you on an emotional level.
                </p>
                <img
                  className="section-image"
                  src={IPSVG}
                  alt="Smart Replies"
                  style={{
                    height: 'clamp(200px, 60vw, 260px)',
                    flexShrink: 0,
                    borderRadius: '25px',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
              </div>
            </div>
            <p className="pre-meet-clario-text" style={{
              width: 'min(100%, 1221px)',
              whiteSpace: 'pre-wrap',
              textAlign: 'left',
              margin: '0 0 1rem 0'
            }}>
              <span style={{
                color: '#3D74B6',
                fontFamily: '"SF UI Display", -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: 'clamp(36px, 6vw, 52px)',
                fontStyle: 'normal',
                fontWeight: 500,
                lineHeight: '54px',
                letterSpacing: '-1.04px'
              }}>
                Clario
              </span>
              <span style={{
                color: '#000',
                fontFamily: '"SF UI Display", -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: 'clamp(36px, 6vw, 52px)',
                fontStyle: 'normal',
                fontWeight: 400,
                lineHeight: '54px',
                letterSpacing: '-1.04px'
              }}>
                {' '}advice that’s always one step ahead personal, timely, and right on point.
              </span>
            </p>
            <div className="phone-images-container" style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              margin: '5rem 0',
              maxWidth: '100%'
            }}>
              <img
                src={PhoneImage1}
                alt="Phone Image 1"
                style={{
                  width: '376px',
                  height: '664px',
                  flexShrink: 0,
                  aspectRatio: '31/63',
                  objectFit: 'contain'
                }}
              />
              <img
                src={PhoneImage2}
                alt="Phone Image 2"
                style={{
                  width: '376px',
                  height: '664px',
                  flexShrink: 0,
                  aspectRatio: '31/63',
                  objectFit: 'contain'
                }}
              />
              <img
                src={PhoneImage3}
                alt="Phone Image 3"
                style={{
                  width: '376px',
                  height: '664px',
                  flexShrink: 0,
                  aspectRatio: '31/63',
                  objectFit: 'contain'
                }}
              />
            </div>
          </div>
        </div>
        <div style={{ width: '100vw', margin: 0, padding: 0 }}>
          <div className="think-smarter-container" style={{
            width: '100vw',
            height: 'clamp(400px, 50vw, 600px)',
            flexShrink: 0,
            borderRadius: '0',
            background: '#000',
            margin: '4rem 0 0',
            padding: 'clamp(1rem, 5vw, 2rem)',
            left: 0,
            right: 0,
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start'
          }}>
            <div className="think-smarter-texts">
              <p className="think-smarter-text-first" style={{
                color: '#FFF',
                fontFamily: '"SF UI Display", -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: 'clamp(32px, 6vw, 76px)',
                fontStyle: 'normal',
                fontWeight: 500,
                lineHeight: 'normal',
                letterSpacing: 'clamp(-1.28px, -0.3vw, -3.84px)',
                margin: '0 0 clamp(0.5rem, 1vw, 1rem) 0',
                whiteSpace: 'nowrap'
              }}>
                It’s time to think smarter
              </p>
              <p className="think-smarter-text-rest" style={{
                color: '#4B4B4B',
                fontFamily: '"SF UI Display", -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: 'clamp(32px, 6vw, 76px)',
                fontStyle: 'normal',
                fontWeight: 500,
                lineHeight: 'normal',
                letterSpacing: 'clamp(-1.28px, -0.3vw, -3.84px)',
                margin: '0 0 clamp(0.5rem, 1vw, 1rem) 0',
                whiteSpace: 'nowrap'
              }}>
                Decisions. Plans.
              </p>
              <p className="think-smarter-text-rest" style={{
                color: '#4B4B4B',
                fontFamily: '"SF UI Display", -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: 'clamp(32px, 6vw, 76px)',
                fontStyle: 'normal',
                fontWeight: 500,
                lineHeight: 'normal',
                letterSpacing: 'clamp(-1.28px, -0.3vw, -3.84px)',
                margin: '0 0 clamp(0.5rem, 1vw, 1rem) 0',
                whiteSpace: 'nowrap'
              }}>
                Conversations. Goals.
              </p>
              <p className="think-smarter-text-rest" style={{
                color: '#4B4B4B',
                fontFamily: '"SF UI Display", -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: 'clamp(32px, 6vw, 76px)',
                fontStyle: 'normal',
                fontWeight: 500,
                lineHeight: 'normal',
                letterSpacing: 'clamp(-1.28px, -0.3vw, -3.84px)',
                margin: '0',
                whiteSpace: 'nowrap'
              }}>
                Really, your whole life.
              </p>
            </div>
          </div>
          <div className="new-container" style={{
            width: 'min(100%, 1480px)',
            height: '750px',
            flexShrink: 0,
            borderRadius: '50px',
            background: '#E2EFFF',
            margin: 'clamp(2rem, 5vw, 4rem) auto 0',
            position: 'relative',
            display: window.innerWidth <= 480 ? 'flex' : 'flex',
            flexDirection: window.innerWidth <= 480 ? 'column' : 'row',
            justifyContent: window.innerWidth <= 480 ? 'center' : 'space-between',
            alignItems: window.innerWidth <= 480 ? 'center' : 'flex-start',
            padding: window.innerWidth <= 480 ? 'clamp(1rem, 2.5vw, 1.5rem)' : 'clamp(1rem, 2.5vw, 2rem)'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: window.innerWidth <= 480 ? 'center' : 'flex-start'
            }}>
              <div className="new-text-container" style={{
                width: window.innerWidth <= 480 ? '100%' : '637px',
                height: window.innerWidth <= 480 ? 'auto' : '172px',
                flexShrink: 0,
                margin: window.innerWidth <= 480 ? 'clamp(0.5rem, 2vw, 1rem) auto 0' : '2rem 0 0 2rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: window.innerWidth <= 480 ? 'center' : 'flex-start',
                textAlign: window.innerWidth <= 480 ? 'center' : 'left'
              }}>
                <p className="new-text-clario" style={{
                  color: '#3D74B6',
                  fontFamily: '"SF UI Display", -apple-system, BlinkMacSystemFont, sans-serif',
                  fontSize: window.innerWidth <= 480 ? 'clamp(24px, 6vw, 32px)' : '68px',
                  fontStyle: 'normal',
                  fontWeight: 500,
                  lineHeight: 'normal',
                  letterSpacing: window.innerWidth <= 480 ? '-0.5px' : '-2.72px',
                  margin: 0,
                  whiteSpace: 'nowrap'
                }}>
                  Clario,
                </p>
                <p className="new-text-rest" style={{
                  color: '#000',
                  fontFamily: '"SF UI Display", -apple-system, BlinkMacSystemFont, sans-serif',
                  fontSize: window.innerWidth <= 480 ? 'clamp(24px, 6vw, 32px)' : '68px',
                  fontStyle: 'normal',
                  fontWeight: 500,
                  lineHeight: 'normal',
                  letterSpacing: window.innerWidth <= 480 ? '-0.5px' : '-2.72px',
                  margin: window.innerWidth <= 480 ? 'clamp(0.2rem, 0.8vw, 0.4rem) 0 0 0' : '0',
                  whiteSpace: 'normal'
                }}>
                  Everywhere You Are.
                </p>
              </div>
              <div className="subtext-container">
                <p className="new-subtext" style={{
                  width: window.innerWidth <= 480 ? '100%' : '556px',
                  color: '#282828',
                  fontFamily: '"SF UI Display", -apple-system, BlinkMacSystemFont, sans-serif',
                  fontSize: window.innerWidth <= 480 ? 'clamp(14px, 4vw, 18px)' : '24px',
                  fontStyle: 'normal',
                  fontWeight: 400,
                  lineHeight: 'normal',
                  margin: window.innerWidth <= 480 ? 'clamp(1rem, 3vw, 1.5rem) auto 0' : '2rem 0 0 2rem',
                  padding: window.innerWidth <= 480 ? '0 clamp(0.5rem, 2vw, 1rem)' : '0',
                  textAlign: window.innerWidth <= 480 ? 'center' : 'left',
                  whiteSpace: 'normal'
                }}>
                  Clario moves with you across iOS, Android, and Mac. Learning once, remembering always. Whether you’re texting, working, or on the go, your intelligence stays synced so you never lose context.
                </p>
              </div>
            </div>
            <img
              className="new-image"
              src={CanvaImage}
              alt="Clario Everywhere"
              style={{
                width: window.innerWidth <= 480 ? 'clamp(280px, 90vw, 340px)' : '980px',
                height: window.innerWidth <= 480 ? 'clamp(230px, 74.36vw, 280px)' : '642px',
                flexShrink: 0,
                aspectRatio: '490/321',
                objectFit: 'contain',
                margin: window.innerWidth <= 480 ? 'clamp(1rem, 3vw, 2rem) auto 0' : '1rem 2rem 0 0',
                alignSelf: window.innerWidth <= 480 ? 'center' : 'flex-start',
                display: 'block'
              }}
            />
          </div>
          <p className="insight-text" style={{
            color: '#3D74B6',
            textAlign: 'center',
            fontFamily: '"SF UI Display", -apple-system, BlinkMacSystemFont, sans-serif',
            fontSize: 'clamp(24px, 4vw, 28px)',
            fontStyle: 'normal',
            fontWeight: 600,
            lineHeight: 'normal',
            margin: 'clamp(10rem, 4vw, 4rem) auto 0',
            maxWidth: '100%'
          }}>
            The insight you didn’t know you needed.
          </p>
          <p className="connect-dots-text" style={{
            color: '#000',
            textAlign: 'center',
            fontFamily: '"SF UI Display", -apple-system, BlinkMacSystemFont, sans-serif',
            fontSize: 'clamp(48px, 8vw, 96px)',
            fontStyle: 'normal',
            fontWeight: 500,
            lineHeight: 'normal',
            letterSpacing: 'clamp(-1.92px, -0.4vw, -3.84px)',
            margin: '2rem auto 0',
            maxWidth: 'min(100%, 959px)'
          }}>
            Clario connects the dots you didn’t see.
          </p>
          <p className="learn-patterns-text" style={{
            color: '#282828',
            textAlign: 'center',
            fontFamily: '"SF UI Display", -apple-system, BlinkMacSystemFont, sans-serif',
            fontSize: 'clamp(20px, 3vw, 24px)',
            fontStyle: 'normal',
            fontWeight: 400,
            lineHeight: 'normal',
            margin: '2rem auto 0',
            maxWidth: 'min(100%, 820px)'
          }}>
            Clario learns your patterns, remembers what matters, and gives you honest, timely advice to help you grow whether in conversations, decisions, or daily life
          </p>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            margin: '2rem auto 0'
          }}>
            <button
              className="coming-soon-button"
              style={{
                display: 'flex',
                width: 'clamp(180px, 50vw, 260px)',
                height: 'clamp(40px, 10vw, 60px)',
                padding: 'clamp(8px, 2vw, 12px) clamp(20px, 5vw, 32px)',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '10px',
                borderRadius: 'clamp(40px, 10vw, 50px)',
                background: '#3D74B6'
              }}
            >
              <span style={{
                color: '#FFF',
                fontFamily: '"SF UI Display", -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: 'clamp(16px, 4vw, 24px)',
                fontStyle: 'normal',
                fontWeight: 500,
                lineHeight: 'normal'
              }}>
                Coming Soon
              </span>
            </button>
          </div>
          <div className="chat-clario-container" style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 'clamp(0.5rem, 1vw, 1rem)',
            marginTop: '6rem'
          }}>
            <p className="chat-clario-text" style={{
              color: '#000',
              fontFamily: '"SF UI Display", -apple-system, BlinkMacSystemFont, sans-serif',
              fontSize: 'clamp(18px, 3vw, 22px)',
              fontStyle: 'normal',
              fontWeight: 600,
              lineHeight: 'normal',
              margin: 0
            }}>
              Chat with Clario
            </p>
            <button
              className="vo1-beta-button"
              style={{
                display: 'inline-flex',
                height: 'clamp(32px, 5vw, 40px)',
                padding: 'clamp(8px, 2vw, 12px) clamp(20px, 5vw, 32px)',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '10px',
                flexShrink: 0,
                borderRadius: 'clamp(30px, 5vw, 50px)',
                border: '1px solid #000'
              }}
            >
              <span style={{
                color: '#3D74B6',
                fontFamily: '"SF UI Display", -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: 'clamp(18px, 3vw, 22px)',
                fontStyle: 'normal',
                fontWeight: 600,
                lineHeight: 'normal'
              }}>
                vO1 Beta
              </span>
            </button>
          </div>
        </div>
        <div style={{ marginTop: '12rem' }}>
          <h2 className="faq-heading" style={{
            color: '#000',
            textAlign: 'center',
            fontFamily: '"SF UI Display", -apple-system, BlinkMacSystemFont, sans-serif',
            fontStyle: 'normal',
            fontWeight: 500,
            lineHeight: '54px',
            letterSpacing: '-1.04px',
            marginBottom: '5rem',
            WebkitTextStrokeWidth: '0.5px',
            WebkitTextStrokeColor: '#000'
          }}>
            Frequently Asked Questions
          </h2>
          <div style={{
            width: 'min(95%, 1150px)',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '2rem',
            alignItems: 'center'
          }}>
            <div className="faq-container" style={{
              width: 'min(100%, 967px)',
              height: '80px',
              flexShrink: 0,
              borderRadius: '15px',
              border: '2px solid #E2EFFF',
              background: '#FEFEFF',
              boxShadow: '0 4px 24px 0 rgba(0, 0, 0, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 1.5rem',
              margin: '0 auto'
            }}>
              <h3 className="faq-question" style={{
                color: '#1B263B',
                fontFamily: '"SF UI Display", -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: '24px',
                fontStyle: 'normal',
                fontWeight: 100,
                lineHeight: 'normal',
                WebkitTextStrokeWidth: '0.5px',
                WebkitTextStrokeColor: '#1B263B',
                flex: 1
              }}>
                What is Clario and how does it work?
              </h3>
              <button onClick={() => toggleDropdown(4)} style={{
                color: '#999',
                fontFamily: '"SF UI Display", -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: 'clamp(20px, 4vw, 36px)',
                fontStyle: 'normal',
                fontWeight: 400,
                lineHeight: 'normal'
              }}>
                {openDropdown === 4 ? '−' : '+'}
              </button>
            </div>
            {openDropdown === 4 && (
              <p className={`faq-answer ${openDropdown === 4 ? 'open' : ''}`} style={{
                width: 'min(95%, 967px)',
                color: '#1B263B',
                fontFamily: '"SF UI Display", -apple-system, BlinkMacSystemFont, sans-serif',
                fontStyle: 'normal',
                fontWeight: 400,
                lineHeight: 'normal',
                textAlign: 'left',
                wordWrap: 'break-word',
                padding: '0 1.5rem',
                margin: '0.5rem auto 0',
                maxWidth: '967px',
                transition: 'max-height 0.3s ease-in-out'
              }}>
                Clario is your AI powered emotional companion, it remembers, learns, and grows with you. It helps you reflect, feel heard, and move forward with gentle clarity.
              </p>
            )}
            <div className="faq-container" style={{
              width: 'min(100%, 967px)',
              height: '80px',
              flexShrink: 0,
              borderRadius: '15px',
              border: '2px solid #E2EFFF',
              background: '#FEFEFF',
              boxShadow: '0 4px 24px 0 rgba(0, 0, 0, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 1.5rem',
              margin: '2rem auto 0'
            }}>
              <h3 className="faq-question" style={{
                color: '#1B263B',
                fontFamily: '"SF UI Display", -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: '24px',
                fontStyle: 'normal',
                fontWeight: 100,
                lineHeight: 'normal',
                WebkitTextStrokeWidth: '0.5px',
                WebkitTextStrokeColor: '#1B263B',
                flex: 1
              }}>
                What should I use Clario for?
              </h3>
              <button onClick={() => toggleDropdown(5)} style={{
                color: '#999',
                fontFamily: '"SF UI Display", -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: 'clamp(20px, 4vw, 36px)',
                fontStyle: 'normal',
                fontWeight: 400,
                lineHeight: 'normal'
              }}>
                {openDropdown === 5 ? '−' : '+'}
              </button>
            </div>
            {openDropdown === 5 && (
              <p className={`faq-answer ${openDropdown === 5 ? 'open' : ''}`} style={{
                width: 'min(95%, 967px)',
                color: '#1B263B',
               
                fontFamily: '"SF UI Display", -apple-system, BlinkMacSystemFont, sans-serif',
                fontStyle: 'normal',
                fontWeight: 400,
                lineHeight: 'normal',
                textAlign: 'left',
                wordWrap: 'break-word',
                padding: '0 1.5rem',
                margin: '0.5rem auto 0',
                maxWidth: '967px',
                transition: 'max-height 0.3s ease-in-out'
              }}>
                Whether you’re thinking through life, venting emotions, or needing perspective, Clario listens. It’s built to support your mental and emotional growth, anytime you need.
              </p>
            )}
            <div className="faq-container" style={{
              width: 'min(100%, 967px)',
              height: '80px',
              flexShrink: 0,
              borderRadius: '15px',
              border: '2px solid #E2EFFF',
              background: '#FEFEFF',
              boxShadow: '0 4px 24px 0 rgba(0, 0, 0, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 1.5rem',
              margin: '2rem auto 0'
            }}>
              <h3 className="faq-question" style={{
                color: '#1B263B',
                fontFamily: '"SF UI Display", -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: '24px',
                fontStyle: 'normal',
                fontWeight: 100,
                lineHeight: 'normal',
                WebkitTextStrokeWidth: '0.5px',
                WebkitTextStrokeColor: '#1B263B',
                flex: 1
              }}>
                How much does it cost to use?
              </h3>
              <button onClick={() => toggleDropdown(6)} style={{
                color: '#999',
                fontFamily: '"SF UI Display", -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: 'clamp(20px, 4vw, 36px)',
                fontStyle: 'normal',
                fontWeight: 400,
                lineHeight: 'normal'
              }}>
                {openDropdown === 6 ? '−' : '+'}
              </button>
            </div>
            {openDropdown === 6 && (
              <p className={`faq-answer ${openDropdown === 6 ? 'open' : ''}`} style={{
                width: 'min(95%, 967px)',
                color: '#1B263B',
                fontFamily: '"SF UI Display", -apple-system, BlinkMacSystemFont, sans-serif',
                fontStyle: 'normal',
                fontWeight: 400,
                lineHeight: 'normal',
                textAlign: 'left',
                wordWrap: 'break-word',
                padding: '0 1.5rem',
                margin: '0.5rem auto 0',
                maxWidth: '967px',
                transition: 'max-height 0.3s ease-in-out'
              }}>
                Clario is completely free right now. No hidden fees. Just real conversations, whenever you need them.
              </p>
            )}
            <div style={{
              marginTop: '5rem',
              width: 'min(95%, 1150px)',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}>
              <div className="chat-clario-footer-container" style={{
                display: 'flex',
                flexDirection: window.innerWidth <= 480 ? 'column' : 'column',
                alignItems: 'flex-start',
                gap: 'clamp(0.5rem, 1.5vw, 1rem)',
                marginTop: '3rem'
              }}>
                <p className="personal-intelligence-text" style={{
                  color: '#000',
                  fontFamily: '"SF UI Display", -apple-system, BlinkMacSystemFont, sans-serif',
                  fontSize: 'clamp(36px, 8vw, 72px)',
                  fontStyle: 'normal',
                  fontWeight: 500,
                  lineHeight: 'normal',
                  letterSpacing: 'clamp(-1.44px, -0.3vw, -2.88px)',
                  textAlign: 'left',
                  width: 'min(100%, clamp(400px, 80vw, 877px))',
                  margin: 0
                }}>
                  Your Personal Intelligence,<br />Ready Anytime.
                </p>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'clamp(0.5rem, 1.5vw, 1rem)'
                }}>
                  <p style={{
                    color: '#3D74B6',
                    fontFamily: '"SF UI Display", -apple-system, BlinkMacSystemFont, sans-serif',
                    fontSize: 'clamp(20px, 5vw, 28px)',
                    fontStyle: 'normal',
                    fontWeight: 500,
                    lineHeight: 'normal',
                    margin: 0
                  }}>
                    Chat with Clario
                  </p>
                  <button style={{
                    display: 'inline-flex',
                    height: 'clamp(36px, 8vw, 48px)',
                    padding: 'clamp(10px, 2.5vw, 14.2px) clamp(24px, 5vw, 37.867px)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 'clamp(8px, 2vw, 11.833px)',
                    flexShrink: 0,
                    borderRadius: 'clamp(40px, 10vw, 59.167px)',
                    border: '0.5px solid #9F9F9F',
                    background: '#3D74B6'
                  }}>
                    <span style={{
                      color: '#FFF',
                      fontFamily: '"SF UI Display", -apple-system, BlinkMacSystemFont, sans-serif',
                      fontSize: 'clamp(18px, 4vw, 26px)',
                      fontStyle: 'normal',
                      fontWeight: 600,
                      lineHeight: 'normal'
                    }}>
                      vO1 Beta
                    </span>
                  </button>
                </div>
              </div>
              <div style={{
                width: 'min(100%, clamp(600px, 90vw, 1312.006px))',
                height: '0.5px',
                background: '#9F9F9F',
                margin: '5rem auto 0'
              }}></div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginTop: '5rem',
                width: 'min(95%, 1150px)',
                flexDirection: window.innerWidth <= 480 ? 'column' : 'row',
                gap: 'clamp(1rem, 3vw, 2rem)'
              }}>
                <div className="footer-logo-container" style={{
                  display: 'flex',
                  flexDirection: window.innerWidth <= 480 ? 'column' : 'row',
                  alignItems: 'center',
                  gap: 'clamp(0.5rem, 1.5vw, 1rem)'
                }}>
                  <img
                    src={logo}
                    alt="Clario Logo"
                    style={{
                      width: 'clamp(30px, 6vw, 41.891px)',
                      height: 'clamp(30px, 6vw, 41.891px)',
                      flexShrink: 0
                    }}
                  />
                  <span style={{
                    color: '#3D74B6',
                    fontFamily: '"SF UI Display", -apple-system, BlinkMacSystemFont, sans-serif',
                    fontSize: 'clamp(24px, 5vw, 38.4px)',
                    fontStyle: 'normal',
                    fontWeight: 600,
                    lineHeight: 'normal',
                    letterSpacing: 'clamp(-0.96px, -0.2vw, -1.536px)',
                    width: 'clamp(80px, 15vw, 103.855px)',
                    height: 'clamp(36px, 8vw, 48px)',
                    flexShrink: 0
                  }}>
                    Clario
                  </span>
                </div>
                <div className="footer-links-container" style={{
                  display: 'grid',
                  gridTemplateColumns: window.innerWidth <= 480 ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
                  gap: 'clamp(1.5rem, 3vw, 2rem)',
                  justifyItems: 'start',
                  width: window.innerWidth <= 480 ? '100%' : 'auto',
                  margin: window.innerWidth <= 480 ? 'clamp(1rem, 3vw, 2rem) auto 0' : '1rem'
                }}>
                  <div className="footer-links-column">
                    <p style={{
                      color: '#3D74B6',
                      fontFamily: '"SF UI Display", -apple-system, BlinkMacSystemFont, sans-serif',
                      fontSize: 'clamp(14px, 3vw, 16px)',
                      fontStyle: 'normal',
                      fontWeight: 600,
                      lineHeight: 'clamp(16px, 3.5vw, 18px)',
                      textTransform: 'capitalize',
                      margin: 0
                    }}>
                      Legal
                    </p>
                    <p style={{
                      color: '#1E1E1E',
                      fontFamily: '"SF UI Display", -apple-system, BlinkMacSystemFont, sans-serif',
                      fontSize: 'clamp(14px, 3vw, 16px)',
                      fontStyle: 'normal',
                      fontWeight: 500,
                      lineHeight: 'clamp(20px, 4vw, 24px)',
                      margin: 'clamp(0.25rem, 0.75vw, 0.5rem) 0 0 0'
                    }}>
                      Privacy Policy
                    </p>
                    <p style={{
                      color: '#1E1E1E',
                      fontFamily: '"SF UI Display", -apple-system, BlinkMacSystemFont, sans-serif',
                      fontSize: 'clamp(14px, 3vw, 16px)',
                      fontStyle: 'normal',
                      fontWeight: 500,
                      lineHeight: 'clamp(20px, 4vw, 24px)',
                      margin: 'clamp(0.25rem, 0.75vw, 0.5rem) 0 0 0'
                    }}>
                      Terms of Service
                    </p>
                  </div>
                  <div className="footer-links-column">
                    <p style={{
                      color: '#3D74B6',
                      fontFamily: '"SF UI Display", -apple-system, BlinkMacSystemFont, sans-serif',
                      fontSize: 'clamp(14px, 3vw, 16px)',
                      fontStyle: 'normal',
                      fontWeight: 600,
                      lineHeight: 'clamp(16px, 3.5vw, 18px)',
                      textTransform: 'capitalize',
                      margin: 0
                    }}>
                      Use Cases
                    </p>
                    <p style={{
                      color: '#1E1E1E',
                      fontFamily: '"SF UI Display", -apple-system, BlinkMacSystemFont, sans-serif',
                      fontSize: 'clamp(14px, 3vw, 16px)',
                      fontStyle: 'normal',
                      fontWeight: 500,
                      lineHeight: 'clamp(20px, 4vw, 24px)',
                      margin: 'clamp(0.25rem, 0.75vw, 0.5rem) 0 0 0'
                    }}>
                      Sales
                    </p>
                    <p style={{
                      color: '#1E1E1E',
                      fontFamily: '"SF UI Display", -apple-system, BlinkMacSystemFont, sans-serif',
                      fontSize: 'clamp(14px, 3vw, 16px)',
                      fontStyle: 'normal',
                      fontWeight: 500,
                      lineHeight: 'clamp(20px, 4vw, 24px)',
                      margin: 'clamp(0.25rem, 0.75vw, 0.5rem) 0 0 0'
                    }}>
                      Support
                    </p>
                  </div>
                  <div className="footer-links-column">
                    <p style={{
                      color: '#3D74B6',
                      fontFamily: '"SF UI Display", -apple-system, BlinkMacSystemFont, sans-serif',
                      fontSize: 'clamp(14px, 3vw, 16px)',
                      fontStyle: 'normal',
                      fontWeight: 600,
                      lineHeight: 'clamp(16px, 3.5vw, 18px)',
                      textTransform: 'capitalize',
                      margin: 0
                    }}>
                      Resources
                    </p>
                    <p style={{
                      color: '#1E1E1E',
                      fontFamily: '"SF UI Display", -apple-system, BlinkMacSystemFont, sans-serif',
                      fontSize: 'clamp(14px, 3vw, 16px)',
                      fontStyle: 'normal',
                      fontWeight: 500,
                      lineHeight: 'clamp(20px, 4vw, 24px)',
                      margin: 'clamp(0.25rem, 0.75vw, 0.5rem) 0 0 0'
                    }}>
                      Pricing
                    </p>
                    <p style={{
                      color: '#1E1E1E',
                      fontFamily: '"SF UI Display", -apple-system, BlinkMacSystemFont, sans-serif',
                      fontSize: 'clamp(14px, 3vw, 16px)',
                      fontStyle: 'normal',
                      fontWeight: 500,
                      lineHeight: 'clamp(20px, 4vw, 24px)',
                      margin: 'clamp(0.25rem, 0.75vw, 0.5rem) 0 0 0'
                    }}>
                      Manifesto
                    </p>
                  </div>
                  <div className="footer-links-column">
                    <p style={{
                      color: '#3D74B6',
                      fontFamily: '"SF UI Display", -apple-system, BlinkMacSystemFont, sans-serif',
                      fontSize: 'clamp(14px, 3vw, 16px)',
                      fontStyle: 'normal',
                      fontWeight: 600,
                      lineHeight: 'clamp(16px, 3.5vw, 18px)',
                      textTransform: 'capitalize',
                      margin: 0
                    }}>
                      Help
                    </p>
                    <p style={{
                      color: '#1E1E1E',
                      fontFamily: '"SF UI Display", -apple-system, BlinkMacSystemFont, sans-serif',
                      fontSize: 'clamp(14px, 3vw, 16px)',
                      fontStyle: 'normal',
                      fontWeight: 500,
                      lineHeight: 'clamp(20px, 4vw, 24px)',
                      margin: 'clamp(0.25rem, 0.75vw, 0.5rem) 0 0 0'
                    }}>
                      Help Center
                    </p>
                    <p style={{
                      color: '#1E1E1E',
                      fontFamily: '"SF UI Display", -apple-system, BlinkMacSystemFont, sans-serif',
                      fontSize: 'clamp(14px, 3vw, 16px)',
                      fontStyle: 'normal',
                      fontWeight: 500,
                      lineHeight: 'clamp(20px, 4vw, 24px)',
                      margin: 'clamp(0.25rem, 0.75vw, 0.5rem) 0 0 0'
                    }}>
                      Contact Us
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div style={{
          height: 'min(49px, 60vh)',
          width: '100vw',
          background: '#FFF',
          margin: 0,
          position: 'relative'
        }}></div>
      </section>
      {isChatOpen && (
        <ChatModal
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
        />
      )}
    </>
  );
};

// Chat Modal Component
export const ChatModal = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const { user, token } = useAuth();

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: 1,
        content: "Hey there! I'm clario, your AI companion. How are you feeling today?",
        role: 'assistant',
        timestamp: new Date()
      }]);
    }
  }, [isOpen, messages.length]);

  if (!isOpen) return null;

  const handleSendMessage = async () => {
    if (inputMessage.trim() && user && token) {
      const newMessage = {
        id: Date.now(),
        content: inputMessage,
        role: 'user',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, newMessage]);
      setInputMessage('');
      setLoading(true);

      try {
        const response = await axios.post(`${API}/chat/send`, {
          message: inputMessage,
          conversation_id: conversationId
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const aiMessage = {
          id: Date.now() + 1,
          content: response.data.message,
          role: 'assistant',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
        if (!conversationId) {
          setConversationId(response.data.conversation_id);
        }
      } catch (error) {
        console.error('Error sending message:', error);
        const errorMessage = {
          id: Date.now() + 1,
          content: "I'm sorry, I'm having trouble responding right now. Please try again.",
          role: 'assistant',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setLoading(false);
      }
    } else if (!user) {
      toast.error('Please log in to chat with clario');
    }
  };

  const handleVoiceInput = () => {
    setIsListening(!isListening);
    if (!isListening) {
      setTimeout(() => {
        setInputMessage("I'm feeling a bit overwhelmed today...");
        setIsListening(false);
      }, 2000);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50
    }}>
      <div style={{
        background: 'linear-gradient(to bottom right, #FBBF24, #F59E0B)',
        borderRadius: '1.5rem',
        padding: '0.75rem',
        width: 'min(95%, 640px)',
        height: 'min(80vh, 600px)',
        margin: '0 1rem'
      }}>
        <div style={{
          background: '#fff',
          borderRadius: '1rem',
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem',
            borderBottom: '1px solid #D1D5DB'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '0.75rem', height: '0.75rem', background: '#EF4444', borderRadius: '50%' }}></div>
              <div style={{ width: '0.75rem', height: '0.75rem', background: '#FBBF24', borderRadius: '50%' }}></div>
              <div style={{ width: '0.75rem', height: '0.75rem', background: '#10B981', borderRadius: '50%' }}></div>
            </div>
            <div style={{ fontSize: 'clamp(12px, 3vw, 14px)', color: '#4B5563' }}>gen z mode</div>
            <button
              onClick={onClose}
              style={{ color: '#6B7280', ':hover': { color: '#374151' } }}
            >
              ×
            </button>
          </div>

          <div style={{ flex: 1, padding: '0.75rem', overflowY: 'auto' }}>
            {messages.map((message) => (
              <div key={message.id} style={{ marginBottom: '1rem', textAlign: message.role === 'user' ? 'right' : 'left' }}>
                <div style={{
                  display: 'inline-block',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  maxWidth: 'min(80%, 300px)',
                  backgroundColor: message.role === 'user' ? '#FBBF24' : '#F3F4F6',
                  color: message.role === 'user' ? '#000' : '#1F2937'
                }}>
                  {message.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ textAlign: 'left', marginBottom: '1rem' }}>
                <div style={{
                  display: 'inline-block',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  maxWidth: 'min(80%, 300px)',
                  backgroundColor: '#F3F4F6',
                  color: '#4B5563'
                }}>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <div style={{ width: '0.5rem', height: '0.5rem', background: '#9CA3AF', borderRadius: '50%', animation: 'bounce 0.6s infinite' }}></div>
                    <div style={{ width: '0.5rem', height: '0.5rem', background: '#9CA3AF', borderRadius: '50%', animation: 'bounce 0.6s infinite 0.1s' }}></div>
                    <div style={{ width: '0.5rem', height: '0.5rem', background: '#9CA3AF', borderRadius: '50%', animation: 'bounce 0.6s infinite 0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div style={{ padding: '0.75rem', borderTop: '1px solid #D1D5DB' }}>
            {!user && (
              <div style={{
                marginBottom: '1rem',
                padding: '0.75rem',
                backgroundColor: 'rgb(254, 243, 199)',
                border: '1px solid rgb(251, 191, 36)',
                color: 'rgb(180, 83, 9)',
                borderRadius: '0.25rem'
              }}>
                Please log in to start chatting with clario
              </div>
            )}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                disabled={!user || loading}
                style={{
                  flex: 1,
                  padding: '0.5rem 0.75rem',
                  border: '1px solid rgb(209, 213, 219)',
                  borderRadius: '0.375rem',
                  outline: 'none',
                  ':focus': { ring: '2px solid rgb(251, 191, 36)' },
                  opacity: !user || loading ? '0.5' : '1'
                }}
              />
              <button
                onClick={handleVoiceInput}
                disabled={!user || loading}
                style={{
                  padding: '0.5rem',
                  borderRadius: '0.375rem',
                  backgroundColor: isListening ? 'rgb(239, 68, 68)' : 'rgb(229, 231, 235)',
                  color: isListening ? 'rgb(255, 255, 255)' : 'rgb(75, 85, 99)',
                  ':disabled': { opacity: '0.5' }
                }}
              >
                🎤
              </button>
              <button
                onClick={handleSendMessage}
                disabled={!user || loading || !inputMessage.trim()}
                style={{
                  backgroundColor: 'rgb(251, 191, 36)',
                  color: 'rgb(0, 0, 0)',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.375rem',
                  ':hover': { backgroundColor: 'rgb(245, 158, 11)' },
                  ':disabled': { opacity: '0.5' }
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Google OAuth Callback Component
export const GoogleCallback = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState(null);
  const requestSentRef = useRef(false);

  useEffect(() => {
    const handleCallback = async () => {
      if (requestSentRef.current) {
        console.log('Request already sent, skipping');
        return;
      }
      requestSentRef.current = true;
      console.log('Starting Google OAuth callback handling');

      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        if (!code) {
          throw new Error('No authorization code found in URL');
        }

        console.log('Google Callback URL:', window.location.href);
        console.log('Sending authorization code:', code, 'State:', state);
        const response = await axios.post(`${API}/auth/google`, { code });
        login(response.data.access_token);
        navigate('/welcome');
      } catch (error) {
        const errorMessage = error.response?.data?.detail || error.message;
        console.error('Google OAuth callback error:', errorMessage, error);
        setError(errorMessage);
        toast.error(`Authentication failed: ${errorMessage}`);
        navigate('/');
      }
    };

    handleCallback();

    return () => {
      console.log('Cleaning up GoogleCallback useEffect');
    };
  }, [navigate, login]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <ToastContainer />
      <div style={{ textAlign: 'center' }}>
        {error ? (
          <p style={{ color: 'red' }}>Error: {error}</p>
        ) : (
          <>
            <div style={{
              animation: 'spin 1s linear infinite',
              borderRadius: '50%',
              height: '3rem',
              width: '3rem',
              border: '2px solid rgb(0, 0, 0)',
              borderBottomColor: 'transparent',
              margin: '0 auto 1rem'
            }}></div>
            <p style={{ color: 'rgb(75, 85, 99)' }}>Redirecting...</p>
          </>
        )}
      </div>
    </div>
  );
};
