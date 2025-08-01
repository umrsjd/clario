import React, { useState, useEffect, useContext, createContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FourthSVG from './assets/fourth.svg';
import FifthSVG from './assets/fifth.svg';
import SixthSVG from './assets/six.svg';
import logo from './assets/logoo.svg';
import GoogleSVG from './assets/google.svg';
import AppleSVG from './assets/apple.svg';
import ArrowSVG from './assets/Arrow.svg';
import SeventhSVG from './assets/icon.svg';

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
      // Verify token and get user info
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
  const { user, logout } = useAuth();

  return (
    <header className="flex items-center justify-between px-4 py-2 bg-white">
      <div className="flex items-center">
        {/* Removed the clario text */}
      </div>
      <div className="flex items-center space-x-4">
        {user ? (
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Hello, {user.full_name || user.email}</span>
            <button
              onClick={logout}
              className="text-black hover:text-gray-600 transition-colors"
            >
              log out
            </button>
          </div>
        ) : (
          <div></div> // Removed login and signup buttons
        )}
      </div>
    </header>
  );
};

// Authentication Modal Component
export const AuthModal = ({ isOpen, onClose, type }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (type === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const endpoint = type === 'login' ? '/auth/login' : '/auth/register';
      const data = type === 'login'
        ? { email, password }
        : { email, password, full_name: fullName };
      const response = await axios.post(`${API}${endpoint}`, data);
      login(response.data.access_token);
      onClose();
      navigate('/welcome');
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (isLoadingGoogle) return;
    setIsLoadingGoogle(true);
    setError('');

    try {
      console.log('Initiating Google OAuth login from AuthModal');
      const response = await axios.get(`${API}/auth/google/url`, {
        params: { redirect_uri: REDIRECT_URI }
      });

      if (!response.data.url) {
        throw new Error('No authorization URL returned from backend');
      }

      console.log('Google OAuth URL:', response.data.url);
      const urlParams = new URLSearchParams(new URL(response.data.url).search);
      const state = urlParams.get('state');
      console.log('Generated state in AuthModal:', state);
      window.location.href = response.data.url;
    } catch (err) {
      console.error('Google OAuth URL error:', err);
      const errorMessage = err.response?.data?.detail || 'Failed to initiate Google authentication';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoadingGoogle(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <ToastContainer />
      <div style={{
        background: '#fff',
        padding: '2rem',
        borderRadius: '0.5rem',
        width: 'min(90%, 384px)',
        maxWidth: '24rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: 'clamp(20px, 5vw, 24px)', fontWeight: 'bold' }}>
            {type === 'login' ? 'Log In' : 'Sign Up'}
          </h2>
          <button
            onClick={onClose}
            style={{ color: '#6B7280', ':hover': { color: '#374151' } }}
          >
            ×
          </button>
        </div>
        {error && (
          <div style={{
            marginBottom: '1rem',
            padding: '0.75rem',
            backgroundColor: '#FEE2E2',
            border: '1px solid #F87171',
            color: '#B91C1C',
            borderRadius: '0.25rem'
          }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {type === 'signup' && (
            <div>
              <label style={{ display: 'block', fontSize: 'clamp(12px, 3vw, 14px)', fontWeight: 'medium', color: '#374151', marginBottom: '0.5rem' }}>
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #D1D5DB',
                  borderRadius: '0.375rem',
                  outline: 'none',
                  ':focus': { ring: '2px solid #FBBF24' }
                }}
              />
            </div>
          )}
          <div>
            <label style={{ display: 'block', fontSize: 'clamp(12px, 3vw, 14px)', fontWeight: 'medium', color: '#374151', marginBottom: '0.5rem' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                border: '1px solid #D1D5DB',
                borderRadius: '0.375rem',
                outline: 'none',
                ':focus': { ring: '2px solid #FBBF24' }
              }}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 'clamp(12px, 3vw, 14px)', fontWeight: 'medium', color: '#374151', marginBottom: '0.5rem' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                border: '1px solid #D1D5DB',
                borderRadius: '0.375rem',
                outline: 'none',
                ':focus': { ring: '2px solid #FBBF24' }
              }}
              required
            />
          </div>
          {type === 'signup' && (
            <div>
              <label style={{ display: 'block', fontSize: 'clamp(12px, 3vw, 14px)', fontWeight: 'medium', color: '#374151', marginBottom: '0.5rem' }}>
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #D1D5DB',
                  borderRadius: '0.375rem',
                  outline: 'none',
                  ':focus': { ring: '2px solid #FBBF24' }
                }}
                required
              />
            </div>
          )}
          <button
            type="submit"
            disabled={loading || isLoadingGoogle}
            style={{
              width: '100%',
              backgroundColor: '#FBBF24',
              color: '#000',
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              ':hover': { backgroundColor: '#F59E0B' },
              fontWeight: 'medium',
              opacity: loading || isLoadingGoogle ? '0.5' : '1'
            }}
          >
            {loading ? 'Processing...' : (type === 'login' ? 'Log In' : 'Sign Up')}
          </button>
        </form>
        <div style={{ marginTop: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '100%', borderTop: '1px solid #D1D5DB' }} />
            </div>
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', fontSize: 'clamp(12px, 3vw, 14px)' }}>
              <span style={{ padding: '0 0.5rem', backgroundColor: '#fff', color: '#6B7280' }}>Or continue with</span>
            </div>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <button
              onClick={handleGoogleLogin}
              disabled={loading || isLoadingGoogle}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.5rem 1rem',
                border: '1px solid #D1D5DB',
                borderRadius: '0.375rem',
                backgroundColor: '#fff',
                fontSize: 'clamp(12px, 3vw, 14px)',
                fontWeight: 'medium',
                color: '#6B7280',
                ':hover': { backgroundColor: '#F3F4F6' },
                opacity: loading || isLoadingGoogle ? '0.5' : '1'
              }}
            >
              <img
                src={GoogleSVG}
                alt="Google Icon"
                style={{
                  width: '1.25rem',
                  height: '1.25rem',
                  marginRight: '0.5rem'
                }}
              />
              {isLoadingGoogle ? 'Loading...' : 'Continue with Google'}
            </button>
          </div>
        </div>
        <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: 'clamp(12px, 3vw, 14px)', color: '#4B5563' }}>
          {type === 'login' ? (
            <>
              Don't have an account?{' '}
              <button
                onClick={() => {
                  onClose();
                }}
                style={{ color: '#D97706', ':hover': { color: '#B45309' } }}
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={() => {
                  onClose();
                }}
                style={{ color: '#D97706', ':hover': { color: '#B45309' } }}
              >
                Log in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Hero Section Component
export const HeroSection = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [isLoadingOtp, setIsLoadingOtp] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [error, setError] = useState('');
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const meetClarioRef = useRef(null);
  const otpInputRefs = useRef([]);

  const handleGoogleLogin = async () => {
    setIsLoadingGoogle(true);
    setError('');
    console.log('Initiating Google OAuth login from HeroSection');
    
    try {
      const response = await axios.get(`${API}/auth/google/url`, {
        params: { redirect_uri: 'http://localhost:3000/google-callback' }
      });
  
      // Handle both possible response structures
      let authUrl, state;
      
      if (typeof response.data.url === 'string') {
        // Simple structure: {url: string, state: string}
        authUrl = response.data.url;
        state = response.data.state;
      } else if (response.data.url && typeof response.data.url === 'object') {
        // Nested structure: {url: {url: string, state: string, nonce: string}}
        authUrl = response.data.url.url;
        state = response.data.url.state;
      } else {
        throw new Error('Invalid response structure from backend');
      }
  
      if (!authUrl) {
        throw new Error('No authorization URL returned from backend');
      }
  
      console.log('Google OAuth URL:', authUrl);
      const urlParams = new URLSearchParams(new URL(authUrl).search);
      const extractedState = urlParams.get('state');
      console.log('Generated state in HeroSection:', extractedState || state);
      window.location.href = authUrl;
    } catch (err) {
      console.error('Google OAuth URL error:', err);
      const errorMessage = err.response?.data?.detail || 'Unable to connect to Google. Please try again later.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoadingGoogle(false);
    }
  };

  const handleAppleLogin = () => {
    navigate('/welcome'); // Navigate to FlashScreen (Apple login not implemented)
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
        setError('Please enter a valid email address');
        toast.error('Please enter a valid email address');
        return;
    }

    setIsLoadingOtp(true);
    setError('');

    try {
        const response = await axios.post(`${API}/auth/send-otp`, { email: email.trim() });
        console.log('Send OTP response:', response.data);
        setShowOtp(true);
        toast.success('Verification code sent to your email');
    } catch (err) {
        console.error('Send OTP error:', err.response?.data, err.message, err);
        const errorMessage = err.response?.data?.detail || err.message || 'Failed to send verification code';
        setError(errorMessage);
        toast.error(errorMessage);
    } finally {
        setIsLoadingOtp(false);
    }
};

  const handleOtpChange = (index, value) => {
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 5) {
        otpInputRefs.current[index + 1].focus();
      }
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1].focus();
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setIsLoadingOtp(true);
    setError('');

    try {
      const response = await axios.post(`${API}/auth/verify-otp`, {
        email: email.trim(),
        code
      });
      login(response.data.access_token);
      navigate('/welcome');
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Invalid or expired verification code';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoadingOtp(false);
    }
  };

  const toggleDropdown = (index) => {
    setOpenDropdown(openDropdown === index ? null : index);
  };

  const handleExploreClick = () => {
    meetClarioRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <ToastContainer />
      <section style={{
        padding: '0 1rem 2rem',
        background: '#fff'
      }}>
        <div style={{
          maxWidth: 'min(90%, 1150px)',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <h1 style={{
            color: '#000',
            fontFamily: 'Outfit',
            fontSize: 'clamp(28px, 5vw, 40px)',
            fontStyle: 'normal',
            fontWeight: 500,
            lineHeight: 'normal',
            marginTop: '0',
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '15px'
          }}>
            <img
              src={logo}
              alt="Clario Logo"
              style={{
                width: '38px',
                height: '38px',
                flexShrink: 0
              }}
            />
            Clario
          </h1>
          <h2 style={{
            maxWidth: '100%',
            color: '#1B263B',
            fontFamily: 'Outfit',
            fontSize: 'clamp(32px, 6vw, 56px)',
            fontStyle: 'normal',
            fontWeight: 400,
            lineHeight: 'normal',
            margin: '1rem auto'
          }}>
            Always adapting. Never forgetting.
          </h2>
          <p style={{
            color: '#1B263B',
            fontFamily: 'Poppins',
            fontSize: 'clamp(16px, 3vw, 22px)',
            fontStyle: 'normal',
            fontWeight: 400,
            lineHeight: 'normal',
            marginBottom: '6rem'
          }}>
            A memory powered companion that grows with you.
          </p>
          <div style={{
            width: 'min(95%, 550px)',
            height: 'auto',
            minHeight: '200px',
            borderRadius: '20px',
            border: '1px solid #1B263B',
            background: '#fff',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1.5rem'
          }}>
            {error && (
              <div style={{
                marginBottom: '1rem',
                padding: '0.75rem',
                backgroundColor: '#FEE2E2',
                border: '1px solid #F87171',
                color: '#B91C1C',
                borderRadius: '0.25rem',
                width: 'min(95%, 500px)'
              }}>
                {error}
              </div>
            )}
            {!showOtp ? (
              <>
                <div style={{
                  display: 'flex',
                  flexDirection: window.innerWidth <= 640 ? 'column' : 'row',
                  gap: window.innerWidth <= 640 ? '0.5rem' : '0.75rem',
                  justifyContent: 'center',
                  alignItems: window.innerWidth <= 640 ? 'center' : 'stretch',
                  width: '100%'
                }}>
                  <button
                    onClick={handleGoogleLogin}
                    disabled={isLoadingGoogle || isLoadingOtp}
                    style={{
                      display: 'flex',
                      width: window.innerWidth <= 640 ? 'min(100%, 500px)' : 'min(48%, 240px)',
                      padding: window.innerWidth <= 640 ? '0.5rem 1rem' : '0.75rem 1.5rem',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '0.5rem',
                      borderRadius: '8px',
                      border: '1px solid #999',
                      background: '#fff',
                      whiteSpace: 'nowrap',
                      opacity: isLoadingGoogle || isLoadingOtp ? '0.5' : '1'
                    }}
                  >
                    <img
                      src={GoogleSVG}
                      alt="Google Icon"
                      style={{
                        width: '18px',
                        height: '18px',
                        flexShrink: 0
                      }}
                    />
                    <span style={{
                      fontFamily: 'Outfit',
                      fontSize: 'clamp(14px, 2.5vw, 16px)',
                      fontStyle: 'normal',
                      fontWeight: 400,
                      lineHeight: 'normal'
                    }}>
                      {isLoadingGoogle ? 'Loading...' : 'Continue with Google'}
                    </span>
                  </button>
                  <button
                    onClick={handleAppleLogin}
                    disabled={isLoadingOtp}
                    style={{
                      display: 'flex',
                      width: window.innerWidth <= 640 ? 'min(100%, 500px)' : 'min(48%, 240px)',
                      padding: window.innerWidth <= 640 ? '0.5rem 1rem' : '0.75rem 1.5rem',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '0.5rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(153, 153, 153, 0.88)',
                      background: '#fff',
                      opacity: isLoadingOtp ? '0.5' : '1'
                    }}
                  >
                    <img
                      src={AppleSVG}
                      alt="Apple Icon"
                      style={{
                        width: '18px',
                        height: '18px',
                        flexShrink: 0
                      }}
                    />
                    <span style={{
                      color: '#000',
                      fontFamily: 'Outfit',
                      fontSize: 'clamp(14px, 2.5vw, 16px)',
                      fontStyle: 'normal',
                      fontWeight: 400,
                      lineHeight: 'normal'
                    }}>
                      Continue with Apple
                    </span>
                  </button>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginTop: '0.5rem'
                }}>
                  <div style={{
                    width: 'min(30%, 80px)',
                    height: '1px',
                    background: '#000'
                  }} />
                  <span style={{
                    color: '#000',
                    fontFamily: 'Outfit',
                    fontSize: 'clamp(10px, 2vw, 12px)',
                    fontStyle: 'normal',
                    fontWeight: 500,
                    lineHeight: 'normal',
                    textTransform: 'uppercase'
                  }}>
                    or
                  </span>
                  <div style={{
                    width: 'min(30%, 80px)',
                    height: '1px',
                    background: '#000'
                  }} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="enter your email"
                  disabled={isLoadingOtp}
                  style={{
                    width: 'min(95%, 500px)',
                    height: '40px',
                    padding: '0.5rem 1.5rem',
                    borderRadius: '8px',
                    border: '1px solid #999',
                    outline: 'none',
                    opacity: isLoadingOtp ? '0.5' : '1'
                  }}
                />
                <button
                  onClick={handleEmailSubmit}
                  disabled={isLoadingOtp}
                  style={{
                    width: 'min(95%, 500px)',
                    height: '40px',
                    padding: '0.5rem 1.5rem',
                    borderRadius: '8px',
                    background: '#1B263B',
                    opacity: isLoadingOtp ? '0.5' : '1'
                  }}
                >
                  <span style={{
                    color: '#F9F9F9',
                    fontFamily: 'Outfit',
                    fontSize: 'clamp(14px, 2.5vw, 16px)',
                    fontStyle: 'normal',
                    fontWeight: 400,
                    lineHeight: 'normal'
                  }}>
                    {isLoadingOtp ? 'Sending...' : 'Send code'}
                  </span>
                </button>
              </>
            ) : (
              <>
                <h2 style={{
                  color: '#000',
                  fontFamily: 'Outfit',
                  fontSize: 'clamp(18px, 4vw, 24px)',
                  fontStyle: 'normal',
                  fontWeight: 400,
                  lineHeight: 'normal',
                  marginBottom: '0rem'
                }}>
                  Please enter the code to verify
                </h2>
                <p style={{
                  color: '#50555C',
                  textAlign: 'center',
                  fontFamily: 'Outfit',
                  fontSize: 'clamp(10px, 2.5vw, 12px)',
                  fontStyle: 'normal',
                  fontWeight: 400,
                  lineHeight: 'normal',
                  marginBottom: '1.5rem'
                }}>
                  For verification code Check your inbox at {email}.
                </p>
                <div style={{
                  display: 'flex',
                  gap: 'clamp(4px, 1vw, 8px)',
                  justifyContent: 'center',
                  marginBottom: '1.5rem'
                }}>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      maxLength="1"
                      ref={(el) => (otpInputRefs.current[index] = el)}
                      disabled={isLoadingOtp}
                      style={{
                        width: 'clamp(36px, 10vw, 48px)',
                        height: 'clamp(36px, 10vw, 48px)',
                        flexShrink: 0,
                        borderRadius: '10px',
                        border: '0.5px solid #1B263B',
                        textAlign: 'center',
                        fontSize: 'clamp(16px, 4vw, 20px)',
                        fontFamily: 'Outfit',
                        outline: 'none',
                        opacity: isLoadingOtp ? '0.5' : '1'
                      }}
                    />
                  ))}
                </div>
                <button
                  onClick={handleOtpSubmit}
                  disabled={isLoadingOtp}
                  style={{
                    display: 'flex',
                    width: 'min(95%, 353px)',
                    height: '50px',
                    padding: '13px 33px',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '10px',
                    flexShrink: 0,
                    borderRadius: '10px',
                    background: '#1B263B',
                    opacity: isLoadingOtp ? '0.5' : '1'
                  }}
                >
                  <span style={{
                    color: '#F9F9F9',
                    fontFamily: 'Outfit',
                    fontSize: 'clamp(14px, 3vw, 18px)',
                    fontStyle: 'normal',
                    fontWeight: 400,
                    lineHeight: 'normal'
                  }}>
                    {isLoadingOtp ? 'Verifying...' : 'Submit'}
                  </span>
                </button>
              </>
            )}
          </div>
          <button
            onClick={handleExploreClick}
            style={{
              width: 'min(50%, 160px)',
              height: '40px',
              borderRadius: '8px',
              border: '1px solid #778DA9',
              background: 'rgba(235, 245, 255, 0.10)',
              margin: '6.5rem auto 0',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span style={{
              color: '#415A77',
              fontFamily: 'Outfit',
              fontSize: 'clamp(14px, 2.5vw, 16px)',
              fontStyle: 'normal',
              fontWeight: 500,
              lineHeight: 'normal'
            }}>
              Explore more
            </span>
            <img
              src={ArrowSVG}
              alt="Arrow Icon"
              style={{
                width: '15px',
                height: '15px',
                strokeWidth: '1.5px',
                stroke: '#415A77'
              }}
            />
          </button>
          <h2 ref={meetClarioRef} style={{
            color: '#1B263B',
            fontFamily: 'Outfit',
            fontSize: 'clamp(28px, 5vw, 44px)',
            fontStyle: 'normal',
            fontWeight: 400,
            lineHeight: 'normal',
            margin: '12rem 0 0.5rem'
          }}>
            Meet Clario
          </h2>
          <p style={{
            maxWidth: '100%',
            color: '#1B263B',
            fontFamily: 'Poppins',
            fontSize: 'clamp(16px, 3vw, 22px)',
            fontStyle: 'normal',
            fontWeight: 400,
            lineHeight: 'normal',
            margin: '0 auto',
            marginBottom: '6rem'
          }}>
            Your smart companion that remembers, learns, and grows with you more than an assistant, it’s your journey’s memory powered partner.
          </p>
          <div style={{
            width: 'min(95%, 1150px)',
            maxHeight: openDropdown ? '600px' : '300px',
            borderRadius: '25px',
            border: '2px solid rgba(153, 153, 153, 0.88)',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem',
            transition: 'max-height 0.5s ease-in-out',
            overflow: 'hidden'
          }}>
            {/* First Heading */}
            <div style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 0.75rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <img
                  src={FourthSVG}
                  alt="Remembers You Icon"
                  style={{
                    width: 'clamp(20px, 5vw, 30px)',
                    height: 'clamp(16px, 4vw, 24px)',
                    flexShrink: 0
                  }}
                />
                <h3 style={{
                  color: '#1B263B',
                  fontFamily: 'Outfit',
                  fontSize: 'clamp(18px, 3vw, 26px)',
                  fontStyle: 'normal',
                  fontWeight: 400,
                  lineHeight: 'normal',
                  whiteSpace: 'normal'
                }}>
                  Remembers You
                </h3>
              </div>
              <button onClick={() => toggleDropdown(1)} style={{
                color: '#999',
                fontFamily: 'Outfit',
                fontSize: 'clamp(20px, 4vw, 36px)',
                fontStyle: 'normal',
                fontWeight: 400,
                lineHeight: 'normal'
              }}>
                {openDropdown === 1 ? '−' : '+'}
              </button>
            </div>
            {openDropdown !== 1 && (
              <div style={{
                width: 'min(95%, 1032.06px)',
                height: '2px',
                background: '#999',
                margin: '0 0.75rem'
              }} />
            )}
            {openDropdown === 1 && (
              <>
                <p style={{
                  width: 'min(95%, 999px)',
                  maxHeight: '110px',
                  color: '#1B263B',
                  fontFamily: 'Poppins',
                  fontSize: 'clamp(14px, 2.5vw, 20px)',
                  fontStyle: 'normal',
                  fontWeight: 400,
                  lineHeight: 'normal',
                  textAlign: 'left',
                  wordWrap: 'break-word',
                  padding: '0 1.5rem',
                  transition: 'max-height 0.3s ease-in-out'
                }}>
                  Clario stores your thoughts, patterns, and preferences not just facts. It understands your journey and never forgets what matters to you.
                </p>
                <div style={{
                  width: 'min(95%, 1032.06px)',
                  height: '2px',
                  background: '#999',
                  margin: '0 0.75rem'
                }} />
              </>
            )}
            {/* Second Heading */}
            <div style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 0.75rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <img
                  src={FifthSVG}
                  alt="Grows With You Icon"
                  style={{
                    width: 'clamp(20px, 5vw, 30px)',
                    height: 'clamp(20px, 5vw, 30px)',
                    flexShrink: 0
                  }}
                />
                <h3 style={{
                  width: 'min(95%, 300px)',
                  color: '#1B263B',
                  fontFamily: 'Outfit',
                  fontSize: 'clamp(18px, 3vw, 26px)',
                  fontStyle: 'normal',
                  fontWeight: 400,
                  lineHeight: 'normal',
                  whiteSpace: 'normal'
                }}>
                  Grows With You
                </h3>
              </div>
              <button onClick={() => toggleDropdown(2)} style={{
                color: '#999',
                fontFamily: 'Outfit',
                fontSize: 'clamp(20px, 4vw, 36px)',
                fontStyle: 'normal',
                fontWeight: 400,
                lineHeight: 'normal'
              }}>
                {openDropdown === 2 ? '−' : '+'}
              </button>
            </div>
            {openDropdown !== 2 && (
              <div style={{
                width: 'min(95%, 1032.06px)',
                height: '2px',
                background: '#999',
                margin: '0 0.75rem'
              }} />
            )}
            {openDropdown === 2 && (
              <>
                <p style={{
                  width: 'min(95%, 999px)',
                  maxHeight: '92px',
                  color: '#1B263B',
                  fontFamily: 'Poppins',
                  fontSize: 'clamp(14px, 2.5vw, 20px)',
                  fontStyle: 'normal',
                  fontWeight: 400,
                  lineHeight: 'normal',
                  textAlign: 'left',
                  wordWrap: 'break-word',
                  padding: '0 1.5rem',
                  transition: 'max-height 0.3s ease-in-out'
                }}>
                  As your goals shift and ideas evolve, Clario adapts in sync. It’s not static, it learns and matures just like you do.
                </p>
                <div style={{
                  width: 'min(95%, 1032.06px)',
                  height: '2px',
                  background: '#999',
                  margin: '0 0.75rem'
                }} />
              </>
            )}
            {/* Third Heading */}
            <div style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 0.75rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <img
                  src={SeventhSVG}
                  alt="Feels Like a Companion Icon"
                  style={{
                    width: 'clamp(20px, 5vw, 30px)',
                    height: 'clamp(20px, 5vw, 30px)',
                    flexShrink: 0
                  }}
                />
                <h3 style={{
                  width: 'min(95%, 400px)',
                  color: '#1B263B',
                  fontFamily: 'Outfit',
                  fontSize: 'clamp(18px, 3vw, 26px)',
                  fontStyle: 'normal',
                  fontWeight: 400,
                  lineHeight: 'normal',
                  whiteSpace: 'normal'
                }}>
                  Feels Like a Companion
                </h3>
              </div>
              <button onClick={() => toggleDropdown(3)} style={{
                color: '#999',
                fontFamily: 'Outfit',
                fontSize: 'clamp(20px, 4vw, 36px)',
                fontStyle: 'normal',
                fontWeight: 400,
                lineHeight: 'normal'
              }}>
                {openDropdown === 3 ? '−' : '+'}
              </button>
            </div>
            {openDropdown === 3 && (
              <p style={{
                width: 'min(95%, 999px)',
                maxHeight: '92px',
                color: '#1B263B',
                fontFamily: 'Poppins',
                fontSize: 'clamp(14px, 2.5vw, 20px)',
                fontStyle: 'normal',
                fontWeight: 400,
                lineHeight: 'normal',
                textAlign: 'left',
                wordWrap: 'break-word',
                padding: '0 1.5rem',
                transition: 'max-height 0.3s ease-in-out'
              }}>
                Clario listens, reflects, and connects. It’s a steady presence, always there when you need clarity or care.
              </p>
            )}
          </div>
          {/* FAQ Section */}
          <div style={{ marginTop: '12rem' }}>
            <h2 style={{
              color: '#000',
              fontFamily: 'Outfit',
              fontSize: 'clamp(32px, 5vw, 44px)',
              fontStyle: 'normal',
              fontWeight: 400,
              lineHeight: 'normal',
              textAlign: 'center',
              marginBottom: '5rem'
            }}>
              Frequently asked questions
            </h2>
            <div style={{
              width: 'min(95%, 1150px)',
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              {/* FAQ 1 */}
              <div style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 0.75rem'
              }}>
                <h3 style={{
                  color: '#1B263B',
                  fontFamily: 'Outfit',
                  fontSize: 'clamp(20px, 3vw, 26px)',
                  fontStyle: 'normal',
                  fontWeight: 400,
                  lineHeight: 'normal',
                  whiteSpace: 'normal'
                }}>
                  What is Clario and how does it work?
                </h3>
                <button onClick={() => toggleDropdown(4)} style={{
                  color: '#999',
                  fontFamily: 'Outfit',
                  fontSize: 'clamp(20px, 4vw, 36px)',
                  fontStyle: 'normal',
                  fontWeight: 400,
                  lineHeight: 'normal'
                }}>
                  {openDropdown === 4 ? '−' : '+'}
                </button>
              </div>
              {openDropdown !== 4 && (
                <div style={{
                  width: 'min(95%, 1090.02px)',
                  height: '2px',
                  background: '#999',
                  margin: '0 0.75rem'
                }} />
              )}
              {openDropdown === 4 && (
                <>
                  <p style={{
                    width: 'min(95%, 999px)',
                    maxHeight: '110px',
                    color: '#1B263B',
                    fontFamily: 'Poppins',
                    fontSize: 'clamp(14px, 2.5vw, 20px)',
                    fontStyle: 'normal',
                    fontWeight: 400,
                    lineHeight: 'normal',
                    textAlign: 'left',
                    wordWrap: 'break-word',
                    padding: '0 1.5rem',
                    transition: 'max-height 0.3s ease-in-out'
                  }}>
                    Clario is your AI powered emotional companion, it remembers, learns, and grows with you. It helps you reflect, feel heard, and move forward with gentle clarity.
                  </p>
                  <div style={{
                    width: 'min(95%, 1032.02px)',
                    height: '2px',
                    background: '#999',
                    margin: '0 0.75rem'
                  }} />
                </>
              )}
              <div style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 0.75rem'
              }}>
                <h3 style={{
                  color: '#1B263B',
                  fontFamily: 'Outfit',
                  fontSize: 'clamp(20px, 3vw, 26px)',
                  fontStyle: 'normal',
                  fontWeight: 400,
                  lineHeight: 'normal',
                  whiteSpace: 'normal'
                }}>
                  What should I use Clario for?
                </h3>
                <button onClick={() => toggleDropdown(5)} style={{
                  color: '#999',
                  fontFamily: 'Outfit',
                  fontSize: 'clamp(20px, 4vw, 36px)',
                  fontStyle: 'normal',
                  fontWeight: 400,
                  lineHeight: 'normal'
                }}>
                  {openDropdown === 5 ? '−' : '+'}
                </button>
              </div>
              {openDropdown !== 5 && (
                <div style={{
                  width: 'min(95%, 1090.02px)',
                  height: '2px',
                  background: '#999',
                  margin: '0 0.75rem'
                }} />
              )}
              {openDropdown === 5 && (
                <>
                  <p style={{
                    width: 'min(95%, 999px)',
                    maxHeight: '110px',
                    color: '#1B263B',
                    fontFamily: 'Poppins',
                    fontSize: 'clamp(14px, 2.5vw, 20px)',
                    fontStyle: 'normal',
                    fontWeight: 400,
                    lineHeight: 'normal',
                    textAlign: 'left',
                    wordWrap: 'break-word',
                    padding: '0 1.5rem',
                    transition: 'max-height 0.3s ease-in-out'
                  }}>
                    Whether you’re thinking through life, venting emotions, or needing perspective, Clario listens. It’s built to support your mental and emotional growth, anytime you need.
                  </p>
                  <div style={{
                    width: 'min(95%, 1032.02px)',
                    height: '2px',
                    background: '#999',
                    margin: '0 0.75rem'
                  }} />
                </>
              )}
              {/* FAQ 3 */}
              <div style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 0.75rem'
              }}>
                <h3 style={{
                  color: '#1B263B',
                  fontFamily: 'Outfit',
                  fontSize: 'clamp(20px, 3vw, 26px)',
                  fontStyle: 'normal',
                  fontWeight: 400,
                  lineHeight: 'normal',
                  whiteSpace: 'normal'
                }}>
                  How much does it cost to use?
                </h3>
                <button onClick={() => toggleDropdown(6)} style={{
                  color: '#999',
                  fontFamily: 'Outfit',
                  fontSize: 'clamp(20px, 4vw, 36px)',
                  fontStyle: 'normal',
                  fontWeight: 400,
                  lineHeight: 'normal'
                }}>
                  {openDropdown === 6 ? '−' : '+'}
                </button>
              </div>
              {openDropdown !== 6 && (
                <div style={{
                  width: 'min(95%, 1090.02px)',
                  height: '2px',
                  background: '#999',
                  margin: '0 0.75rem'
                }} />
              )}
              {openDropdown === 6 && (
                <p style={{
                  width: 'min(95%, 999px)',
                  maxHeight: '72px',
                  color: '#1B263B',
                  fontFamily: 'Poppins',
                  fontSize: 'clamp(14px, 2.5vw, 20px)',
                  fontStyle: 'normal',
                  fontWeight: 400,
                  lineHeight: 'normal',
                  textAlign: 'left',
                  wordWrap: 'break-word',
                  padding: '0 1.5rem',
                  transition: 'max-height 0.3s ease-in-out'
                }}>
                  Clario is completely free right now. No hidden fees. Just real conversations, whenever you need them.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
      {/* Bottom Container */}
      <div style={{
        height: 'min(449px, 60vh)',
        width: '100vw',
        background: '#0D1B2A',
        margin: 0,
        position: 'relative'
      }}></div>
      {/* Chat Modal */}
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
      // Add initial message
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
    // Mock voice functionality - in production, integrate with Web Speech API
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
        // Extract authorization code and state from URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        if (!code) {
          throw new Error('No authorization code found in URL');
        }

        console.log('Google Callback URL:', window.location.href);
        console.log('Sending authorization code:', code, 'State:', state);
        // Exchange code for token
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
              border: '2px solid rgb(251, 191, 36)',
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