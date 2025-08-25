import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import logo from './assets/logoo.svg';
import GoogleSVG from './assets/google.svg';
import { useAuth } from './components';

// Constants
const IS_PRODUCTION = process.env.REACT_APP_ENVIRONMENT === 'production';
const BACKEND_URL = IS_PRODUCTION ? 'https://api.clario.co.in' : 'http://localhost:8001';
const API = `${BACKEND_URL}/api`;
const REDIRECT_URI = IS_PRODUCTION ? 'https://clario.co.in/google-callback' : 'http://localhost:3000/google-callback';

const AuthPage = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [isLoadingOtp, setIsLoadingOtp] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [error, setError] = useState('');
  const { user, token, login, logout, loading } = useAuth();
  const navigate = useNavigate();
  const otpInputRefs = useRef([]);

  const handleGoogleLogin = async () => {
    setIsLoadingGoogle(true);
    setError('');
    console.log('Initiating Google OAuth login from HeroSection');

    try {
      const response = await axios.get(`${API}/auth/google/url`, {
        params: { redirect_uri: REDIRECT_URI }
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

  const handleContinue = async () => {
    // Re-check the user profile to ensure we have the latest data
    if (token) {
      try {
        const meResponse = await axios.get(`${API}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const userData = meResponse.data;

        if (userData.user_profile && Object.keys(userData.user_profile).length > 0) {
          navigate('/dashboard');
        } else {
          navigate('/welcome');
        }
      } catch (err) {
        console.error("Failed to verify user status, navigating to welcome.", err);
        navigate('/welcome');
      }
    } else {
      // If for some reason there's no token, go to the start
      navigate('/');
    }
  };


  const handleLogout = () => {
    logout();
    navigate('/auth');
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
      const token = response.data.access_token;
      login(token); // Set the token in context

      // Check user profile before navigating
      const meResponse = await axios.get(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const user = meResponse.data;

      // Only set name if it doesn't exist in localStorage
      if (user.full_name && !localStorage.getItem('userName')) {
        localStorage.setItem('userName', user.full_name);
      }

      if (user.user_profile && Object.keys(user.user_profile).length > 0) {
        navigate('/dashboard');
      } else {
        navigate('/welcome');
      }

    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Invalid or expired verification code';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoadingOtp(false);
    }
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
      <ToastContainer />
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        flexShrink: 0,
        background: 'linear-gradient(287deg, #D0E5FF 4.24%, #FFF 98.16%)',
        filter: 'blur(50px)',
        zIndex: -1
      }}></div>
      <section style={{
        padding: 'clamp(0.5rem, 2vw, 1rem) clamp(1rem, 4vw, 2rem)',
        background: 'transparent',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{
          maxWidth: 'min(90%, 1150px)',
          margin: '0 auto',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <h1 style={{
            width: 'auto',
            height: 'auto',
            color: '#3D74B6',
            fontFamily: '"SF UI Display", -apple-system, BlinkMacSystemFont, sans-serif',
            fontSize: 'clamp(24px, 5vw, 44px)',
            fontStyle: 'normal',
            fontWeight: 550,
            lineHeight: 'normal',
            letterSpacing: '-1.76px',
            marginTop: '0',
            marginBottom: 'clamp(0.5rem, 2vw, 1rem)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'clamp(10px, 2vw, 15px)'
          }}>
            <img
              src={logo}
              alt="Clario Logo"
              style={{
                width: 'clamp(30px, 5vw, 48px)',
                height: 'clamp(30px, 5vw, 48px)',
                flexShrink: 0
              }}
            />
            Clario
          </h1>
          <h2 style={{
            maxWidth: '100%',
            color: '#1B263B',
            fontFamily: '"SF UI Display", -apple-system, BlinkMacSystemFont, sans-serif',
            fontSize: 'clamp(32px, 10vw, 72px)',
            fontStyle: 'normal',
            fontWeight: 500,
            lineHeight: 'normal',
            letterSpacing: 'clamp(-1.28px, -0.4vw, -2.88px)',
            textAlign: 'center',
            margin: 'clamp(0.25rem, 1vw, 0.5rem) auto'
          }}>
            Always adapting. Never forgetting.
          </h2>
          <p style={{
            color: '#1B263B',
            fontFamily: '"SF UI Display", -apple-system, BlinkMacSystemFont, sans-serif',
            fontSize: 'clamp(16px, 4vw, 28px)',
            fontStyle: 'normal',
            fontWeight: 400,
            lineHeight: 'normal',
            textAlign: 'center',
            marginBottom: 'clamp(1rem, 4vw, 2rem)'
          }}>
            A memory powered companion that grows with you.
          </p>
          
          {user || token ? (
            <div style={{
              width: 'clamp(250px, 80vw, 550px)',
              height: 'auto',
              minHeight: 'clamp(150px, 40vw, 200px)',
              borderRadius: 'clamp(10px, 4vw, 20px)',
              border: '1px solid #1B263B',
              background: '#fff',
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: 'clamp(1rem, 3vw, 1.5rem)'
            }}>
              <p style={{
                color: '#1B263B',
                fontFamily: '"SF UI Display", -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: 'clamp(16px, 4vw, 20px)',
                fontStyle: 'normal',
                fontWeight: 500,
                marginBottom: 'clamp(1rem, 3vw, 1.5rem)'
              }}>
                Welcome back{user ? `, ${user.full_name || user.email}` : ''}!
              </p>
              <div style={{
                display: 'flex',
                gap: 'clamp(0.5rem, 2vw, 1rem)',
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'center'
              }}>
                <button
                  onClick={handleContinue}
                  style={{
                    width: 'clamp(150px, 40vw, 300px)',
                    padding: 'clamp(0.5rem, 2vw, 0.75rem) clamp(1rem, 3vw, 1.5rem)',
                    borderRadius: 'clamp(4px, 2vw, 8px)',
                    background: '#3D74B6',
                    color: '#F9F9F9',
                    fontFamily: '"SF UI Display", -apple-system, BlinkMacSystemFont, sans-serif',
                    fontSize: 'clamp(14px, 3vw, 16px)',
                    fontStyle: 'normal',
                    fontWeight: 500,
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Continue
                </button>
                <button
                  onClick={handleLogout}
                  style={{
                    width: 'clamp(150px, 40vw, 300px)',
                    padding: 'clamp(0.5rem, 2vw, 0.75rem) clamp(1rem, 3vw, 1.5rem)',
                    borderRadius: 'clamp(4px, 2vw, 8px)',
                    background: '#3D74B6',
                    color: '#F9F9F9',
                    fontFamily: '"SF UI Display", -apple-system, BlinkMacSystemFont, sans-serif',
                    fontSize: 'clamp(14px, 3vw, 16px)',
                    fontStyle: 'normal',
                    fontWeight: 500,
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div style={{
              width: 'clamp(250px, 80vw, 550px)',
              height: 'auto',
              minHeight: 'clamp(150px, 40vw, 200px)',
              borderRadius: 'clamp(10px, 4vw, 20px)',
              border: '1px solid #1B263B',
              background: '#fff',
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 'clamp(0.5rem, 2vw, 0.75rem)',
              padding: 'clamp(1rem, 3vw, 1.5rem)'
            }}>
              {error && (
                <div style={{
                  marginBottom: 'clamp(0.5rem, 2vw, 1rem)',
                  padding: 'clamp(0.5rem, 2vw, 0.75rem)',
                  backgroundColor: '#FEE2E2',
                  border: '1px solid #F87171',
                  color: '#B91C1C',
                  borderRadius: 'clamp(0.125rem, 1vw, 0.25rem)',
                  width: 'clamp(200px, 90%, 500px)',
                  fontFamily: '"SF UI Display", -apple-system, BlinkMacSystemFont, sans-serif',
                  fontSize: 'clamp(14px, 3vw, 16px)',
                  fontStyle: 'normal',
                  fontWeight: 400
                }}>
                  {error}
                </div>
              )}
              {!showOtp ? (
                <>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'clamp(0.5rem, 2vw, 0.75rem)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%'
                  }}>
                    <button
                      onClick={handleGoogleLogin}
                      disabled={isLoadingGoogle || isLoadingOtp}
                      style={{
                        display: 'flex',
                        width: 'clamp(200px, 90%, 500px)',
                        padding: 'clamp(0.5rem, 2vw, 0.75rem) clamp(1rem, 3vw, 1.5rem)',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 'clamp(0.25rem, 1vw, 0.5rem)',
                        borderRadius: 'clamp(4px, 2vw, 8px)',
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
                          width: 'clamp(14px, 4vw, 18px)',
                          height: 'clamp(14px, 4vw, 18px)',
                          flexShrink: 0
                        }}
                      />
                      <span style={{
                        fontFamily: '"SF UI Display", -apple-system, BlinkMacSystemFont, sans-serif',
                        fontSize: 'clamp(14px, 3vw, 16px)',
                        fontStyle: 'normal',
                        fontWeight: 500,
                        lineHeight: 'normal'
                      }}>
                        {isLoadingGoogle ? 'Loading...' : 'Continue with Google'}
                      </span>
                    </button>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'clamp(0.25rem, 1vw, 0.5rem)',
                    marginTop: 'clamp(0.25rem, 1vw, 0.5rem)'
                  }}>
                    <div style={{
                      width: 'clamp(50px, 20vw, 80px)',
                      height: '1px',
                      background: '#000'
                    }} />
                    <span style={{
                      color: '#000',
                      fontFamily: '"SF UI Display", -apple-system, BlinkMacSystemFont, sans-serif',
                      fontSize: 'clamp(10px, 2vw, 12px)',
                      fontStyle: 'normal',
                      fontWeight: 600,
                      lineHeight: 'normal',
                      textTransform: 'uppercase'
                    }}>
                      or
                    </span>
                    <div style={{
                      width: 'clamp(50px, 20vw, 80px)',
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
                      width: 'clamp(200px, 90%, 500px)',
                      height: 'clamp(30px, 8vw, 40px)',
                      padding: 'clamp(0.25rem, 1vw, 0.5rem) clamp(1rem, 3vw, 1.5rem)',
                      borderRadius: 'clamp(4px, 2vw, 8px)',
                      border: '1px solid #999',
                      outline: 'none',
                      opacity: isLoadingOtp ? '0.5' : '1',
                      fontFamily: '"SF UI Display", -apple-system, BlinkMacSystemFont, sans-serif',
                      fontSize: 'clamp(14px, 3vw, 16px)',
                      fontStyle: 'normal',
                      fontWeight: 400
                    }}
                  />
                  <button
                    onClick={handleEmailSubmit}
                    disabled={isLoadingOtp}
                    style={{
                      width: 'clamp(200px, 90%, 500px)',
                      height: 'clamp(30px, 8vw, 40px)',
                      padding: 'clamp(0.25rem, 1vw, 0.5rem) clamp(1rem, 3vw, 1.5rem)',
                      borderRadius: 'clamp(4px, 2vw, 8px)',
                      background: '#3D74B6',
                      opacity: isLoadingOtp ? '0.5' : '1'
                    }}
                  >
                    <span style={{
                      color: '#F9F9F9',
                      fontFamily: '"SF UI Display", -apple-system, BlinkMacSystemFont, sans-serif',
                      fontSize: 'clamp(14px, 3vw, 16px)',
                      fontStyle: 'normal',
                      fontWeight: 500,
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
                    fontFamily: '"SF UI Display", -apple-system, BlinkMacSystemFont, sans-serif',
                    fontSize: 'clamp(18px, 5vw, 24px)',
                    fontStyle: 'normal',
                    fontWeight: 600,
                    lineHeight: 'normal',
                    marginBottom: '0rem'
                  }}>
                    Please enter the code to verify
                  </h2>
                  <p style={{
                    color: '#50555C',
                    textAlign: 'center',
                    fontFamily: '"SF UI Display", -apple-system, BlinkMacSystemFont, sans-serif',
                    fontSize: 'clamp(10px, 2vw, 12px)',
                    fontStyle: 'normal',
                    fontWeight: 400,
                    lineHeight: 'normal',
                    marginBottom: 'clamp(1rem, 3vw, 1.5rem)'
                  }}>
                    For verification code Check your inbox at {email}.
                  </p>
                  <div style={{
                    display: 'flex',
                    gap: 'clamp(2px, 1vw, 8px)',
                    justifyContent: 'center',
                    marginBottom: 'clamp(1rem, 3vw, 1.5rem)'
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
                          width: 'clamp(30px, 12vw, 48px)',
                          height: 'clamp(30px, 12vw, 48px)',
                          flexShrink: 0,
                          borderRadius: 'clamp(5px, 3vw, 10px)',
                          border: '0.5px solid #1B263B',
                          textAlign: 'center',
                          fontSize: 'clamp(14px, 5vw, 20px)',
                          fontFamily: '"SF UI Display", -apple-system, BlinkMacSystemFont, sans-serif',
                          fontStyle: 'normal',
                          fontWeight: 400,
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
                      width: 'clamp(200px, 70vw, 353px)',
                      height: 'clamp(40px, 10vw, 50px)',
                      padding: 'clamp(8px, 3vw, 13px) clamp(20px, 8vw, 33px)',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: 'clamp(5px, 2vw, 10px)',
                      flexShrink: 0,
                      borderRadius: 'clamp(5px, 3vw, 10px)',
                      background: '#1B263B',
                      opacity: isLoadingOtp ? '0.5' : '1'
                    }}
                  >
                    <span style={{
                      color: '#F9F9F9',
                      fontFamily: '"SF UI Display", -apple-system, BlinkMacSystemFont, sans-serif',
                      fontSize: 'clamp(14px, 4vw, 18px)',
                      fontStyle: 'normal',
                      fontWeight: 600,
                      lineHeight: 'normal'
                    }}>
                      {isLoadingOtp ? 'Verifying...' : 'Submit'}
                    </span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </section>
    </>
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
      if (requestSentRef.current) return;
      requestSentRef.current = true;

      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        if (!code) throw new Error('No authorization code found in URL');

        const response = await axios.post(`${API}/auth/google`, { code });
        const token = response.data.access_token;
        login(token); // Set the token in context

        // Check user profile before navigating
        const meResponse = await axios.get(`${API}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const user = meResponse.data;

        // Don't automatically set name from Google login
        // User will set their preferred name in the welcome flow

        if (user.user_profile && Object.keys(user.user_profile).length > 0) {
          navigate('/dashboard');
        } else {
          navigate('/welcome');
        }

      } catch (error) {
        const errorMessage = error.response?.data?.detail || error.message;
        setError(errorMessage);
        toast.error(`Authentication failed: ${errorMessage}`);
        navigate('/');
      }
    };

    handleCallback();
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

export default AuthPage;