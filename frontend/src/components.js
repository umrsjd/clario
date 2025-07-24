import React, { useState, useEffect, useContext, createContext } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

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
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);

  return (
    <>
      <header className="flex items-center justify-between p-6 bg-white">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-black">calmi</h1>
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
            <>
              <button 
                onClick={() => setIsLoginOpen(true)}
                className="text-black hover:text-gray-600 transition-colors"
              >
                log in
              </button>
              <button 
                onClick={() => setIsSignupOpen(true)}
                className="bg-yellow-400 text-black px-4 py-2 rounded-md hover:bg-yellow-500 transition-colors"
              >
                sign up
              </button>
            </>
          )}
        </div>
      </header>
      
      {/* Login Modal */}
      {isLoginOpen && (
        <AuthModal 
          isOpen={isLoginOpen} 
          onClose={() => setIsLoginOpen(false)} 
          type="login"
        />
      )}
      
      {/* Signup Modal */}
      {isSignupOpen && (
        <AuthModal 
          isOpen={isSignupOpen} 
          onClose={() => setIsSignupOpen(false)} 
          type="signup"
        />
      )}
    </>
  );
};

// Authentication Modal Component
export const AuthModal = ({ isOpen, onClose, type }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

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
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      // Get Google OAuth URL from backend
      const response = await axios.get(`${API}/auth/google/url`);
      
      // Redirect to Google OAuth
      window.location.href = response.data.url;
    } catch (err) {
      setError('Failed to initiate Google authentication');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg w-96 max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {type === 'login' ? 'Log In' : 'Sign Up'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {type === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
              required
            />
          </div>
          
          {type === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                required
              />
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-400 text-black py-2 px-4 rounded-md hover:bg-yellow-500 transition-colors font-medium disabled:opacity-50"
          >
            {loading ? 'Processing...' : (type === 'login' ? 'Log In' : 'Sign Up')}
          </button>
        </form>
        
        <div className="mt-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>
          
          <div className="mt-4">
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          </div>
        </div>
        
        <div className="mt-4 text-center text-sm text-gray-600">
          {type === 'login' ? (
            <>
              Don't have an account?{' '}
              <button 
                onClick={() => {
                  onClose();
                  // You might want to add a way to switch between modals
                }}
                className="text-yellow-600 hover:text-yellow-700"
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
                  // You might want to add a way to switch between modals
                }}
                className="text-yellow-600 hover:text-yellow-700"
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
  const { user } = useAuth();

  return (
    <>
      <section className="px-6 py-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-6xl font-bold text-black mb-6 leading-tight">
                it's not therapy.<br />
                it's just calmi.
              </h1>
              
              <p className="text-xl text-gray-600 mb-8">
                your wise, witty ai built to help you explore your thoughts, emotions, and behaviors.
              </p>
              
              <button 
                onClick={() => setIsChatOpen(true)}
                className="bg-yellow-400 text-black px-8 py-3 rounded-md text-lg font-medium hover:bg-yellow-500 transition-colors"
              >
                start yapping — it's free
              </button>
              
              <p className="text-sm text-gray-500 mt-4">
                loved by 100,000+ cool people
              </p>
            </div>
            
            <div className="flex justify-center">
              <div className="relative">
                <div className="bg-gradient-to-br from-orange-400 to-yellow-500 rounded-3xl p-8 w-96 h-96 shadow-2xl">
                  <div className="bg-white rounded-2xl h-full flex flex-col">
                    <div className="flex items-center justify-between p-4 border-b">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      </div>
                      <div className="text-sm text-gray-600">gen z mode</div>
                    </div>
                    
                    <div className="flex-1 flex items-center justify-center">
                      <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center">
                        <span className="text-2xl">💭</span>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <button 
                        onClick={() => setIsChatOpen(true)}
                        className="w-full bg-yellow-400 text-black py-2 px-4 rounded-md hover:bg-yellow-500 transition-colors"
                      >
                        begin session
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
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
        content: "Hey there! I'm calmi, your AI companion. How are you feeling today?",
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
      alert('Please log in to chat with calmi');
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-orange-400 to-yellow-500 rounded-3xl p-4 w-full max-w-2xl h-[80vh] mx-4">
        <div className="bg-white rounded-2xl h-full flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <div className="text-sm text-gray-600">gen z mode</div>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.map((message) => (
              <div key={message.id} className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block p-3 rounded-lg max-w-xs ${
                  message.role === 'user' 
                    ? 'bg-yellow-400 text-black' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {message.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="text-left mb-4">
                <div className="inline-block p-3 rounded-lg max-w-xs bg-gray-100 text-gray-800">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="p-4 border-t">
            {!user && (
              <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
                Please log in to start chatting with calmi
              </div>
            )}
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                disabled={!user || loading}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-50"
              />
              <button
                onClick={handleVoiceInput}
                disabled={!user || loading}
                className={`p-2 rounded-md transition-colors disabled:opacity-50 ${
                  isListening ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'
                }`}
              >
                🎤
              </button>
              <button
                onClick={handleSendMessage}
                disabled={!user || loading || !inputMessage.trim()}
                className="bg-yellow-400 text-black px-4 py-2 rounded-md hover:bg-yellow-500 transition-colors disabled:opacity-50"
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

// Partners Section Component
export const PartnersSection = () => {
  const partners = [
    { name: "IIElevenLabs", logo: "🔊" },
    { name: "Microsoft for Startups", logo: "🏢" },
    { name: "AWS", logo: "☁️" },
    { name: "inQubate", logo: "🚀" },
    { name: "Founders Hub", logo: "🎯" }
  ];

  return (
    <section className="px-6 py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center justify-center">
          {partners.map((partner, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl mb-2">{partner.logo}</div>
              <div className="text-sm text-gray-600">{partner.name}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Features Section Component
export const FeaturesSection = () => {
  return (
    <section className="px-6 py-16 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-black mb-6">all the good stuff</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-3xl font-bold text-black mb-6">whenever, wherever</h3>
            <p className="text-lg text-gray-600 mb-8">
              never need a friend at 3 a.m. again. just start yapping with calmi, your conversational ai for wellbeing that's ready 24/7.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-6 h-6 bg-yellow-400 rounded-full flex-shrink-0 mt-1"></div>
                <div>
                  <h4 className="font-semibold text-black">24/7 availability</h4>
                  <p className="text-gray-600">Always there when you need support</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-6 h-6 bg-yellow-400 rounded-full flex-shrink-0 mt-1"></div>
                <div>
                  <h4 className="font-semibold text-black">Secure & confidential</h4>
                  <p className="text-gray-600">Your conversations are private and secure</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-6 h-6 bg-yellow-400 rounded-full flex-shrink-0 mt-1"></div>
                <div>
                  <h4 className="font-semibold text-black">Personalized insights</h4>
                  <p className="text-gray-600">Learn patterns and get personalized tips</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center">
            <div className="relative">
              <div className="bg-gradient-to-br from-orange-400 to-yellow-500 rounded-3xl p-6 w-80 h-80 shadow-xl">
                <div className="bg-white rounded-2xl h-full flex flex-col">
                  <div className="flex items-center justify-between p-3 border-b">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                  </div>
                  
                  <div className="flex-1 flex items-center justify-center">
                    <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                      <span className="text-xl">💭</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Testimonials Section Component
export const TestimonialsSection = () => {
  const testimonials = [
    {
      id: 1,
      text: "I'm... speechless. I used this for less than 5 minutes and I'm already crying. I really needed this. Thank you so much.",
      username: "@mvggotz",
      avatar: "https://images.unsplash.com/photo-1560656788-d5b6f2e83696?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHwyfHxwZW9wbGV8ZW58MHx8fHllbGxvd3wxNzUyNTE4MzU2fDA&ixlib=rb-4.1.0&q=85"
    },
    {
      id: 2,
      text: "that shit works a little bit too well.",
      username: "@_rose_boy_1029",
      avatar: "https://images.unsplash.com/photo-1512755051947-dea0029e93ad?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHwzfHxwZW9wbGV8ZW58MHx8fHllbGxvd3wxNzUyNTE4MzU2fDA&ixlib=rb-4.1.0&q=85"
    },
    {
      id: 3,
      text: "this ateeee.",
      username: "@aflynaaa",
      avatar: "https://images.pexels.com/photos/1330645/pexels-photo-1330645.jpeg"
    },
    {
      id: 4,
      text: "I tried it and I can genuinely say—this is insane. I'm so amused by how good the ai is.",
      username: "@orianagomez",
      avatar: "https://images.pexels.com/photos/13541630/pexels-photo-13541630.jpeg"
    },
    {
      id: 5,
      text: "to be honest, I gave it a try and it's really good. I feel better now.",
      username: "@manzanilawoo",
      avatar: "https://images.pexels.com/photos/10168547/pexels-photo-10168547.jpeg"
    },
    {
      id: 6,
      text: "guys, it works, i swear. this made my day.",
      username: "@alisson.music",
      avatar: "https://images.unsplash.com/photo-1489710437720-ebb67ec84dd2?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHwxfHxwZW9wbGV8ZW58MHx8fHllbGxvd3wxNzUyNTE4MzU2fDA&ixlib=rb-4.1.0&q=85"
    }
  ];

  return (
    <section className="px-6 py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white p-6 rounded-lg shadow-sm">
              <p className="text-gray-800 mb-4">"{testimonial.text}"</p>
              <div className="flex items-center space-x-3">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <span className="text-sm text-gray-600">{testimonial.username}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// FAQ Section Component
export const FAQSection = () => {
  const [openFAQ, setOpenFAQ] = useState(null);

  const faqs = [
    {
      question: "what is calmi?",
      answer: "calmi is your conversational AI companion designed to help you explore your thoughts, emotions, and behaviors. It's not therapy, but it's a supportive tool for mental wellbeing."
    },
    {
      question: "how does calmi work?",
      answer: "calmi uses advanced AI technology to have natural conversations with you. It listens to your concerns, asks thoughtful questions, and provides insights to help you better understand yourself."
    },
    {
      question: "is calmi a replacement for traditional therapy?",
      answer: "No, calmi is not a replacement for professional therapy or medical treatment. It's a supportive tool that can complement professional care, but it's not a substitute for licensed mental health professionals."
    },
    {
      question: "is my data secure and confidential?",
      answer: "Yes, your privacy is our top priority. All conversations are encrypted and stored securely. We never share your personal information with third parties."
    },
    {
      question: "does calmi support multiple languages?",
      answer: "Currently, calmi primarily supports English, but we're working on expanding to other languages to make mental health support more accessible globally."
    }
  ];

  return (
    <section className="px-6 py-16 bg-white">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold text-black text-center mb-12">
          frequently asked questions
        </h2>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-gray-200">
              <button
                onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                className="w-full py-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="text-lg font-medium text-black">{faq.question}</span>
                <span className="text-2xl text-gray-400">
                  {openFAQ === index ? '−' : '+'}
                </span>
              </button>
              
              {openFAQ === index && (
                <div className="pb-6 text-gray-600">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// CTA Section Component
export const CTASection = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      <section className="px-6 py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-black mb-4">
            get started for free
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            be heard. be understood. be better.
          </p>
          
          <button 
            onClick={() => setIsChatOpen(true)}
            className="bg-yellow-400 text-black px-8 py-3 rounded-md text-lg font-medium hover:bg-yellow-500 transition-colors"
          >
            try calmi free
          </button>
        </div>
      </section>
      
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

// Footer Component
export const Footer = () => {
  return (
    <footer className="px-6 py-12 bg-white border-t">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold text-black mb-4">🟡 calmi</h3>
          </div>
          
          <div>
            <h4 className="font-semibold text-black mb-4">socials</h4>
            <ul className="space-y-2 text-gray-600">
              <li><a href="#" className="hover:text-black transition-colors">instagram</a></li>
              <li><a href="#" className="hover:text-black transition-colors">tiktok</a></li>
              <li><a href="#" className="hover:text-black transition-colors">x (twitter)</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-black mb-4">legal</h4>
            <ul className="space-y-2 text-gray-600">
              <li><a href="#" className="hover:text-black transition-colors">privacy policy</a></li>
              <li><a href="#" className="hover:text-black transition-colors">terms of service</a></li>
              <li><a href="#" className="hover:text-black transition-colors">ai disclaimer</a></li>
            </ul>
          </div>
          
          <div>
            <p className="text-sm text-gray-600">
              © 2025 calmi inc<br />
              by derrick han & vikky nyz
            </p>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t text-center">
          <p className="text-xs text-gray-500">
            we use cookies (yummy) to improve your experience. essential cookies are always active.{' '}
            <button className="underline">manage preferences</button>
          </p>
          <div className="mt-4 space-x-4">
            <button className="bg-gray-800 text-white px-4 py-2 rounded text-sm">
              reject all
            </button>
            <button className="bg-yellow-400 text-black px-4 py-2 rounded text-sm">
              accept all
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Google OAuth Callback Component
export const GoogleCallback = () => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');

        if (error) {
          setError('Google authentication was cancelled or failed');
          setLoading(false);
          return;
        }

        if (!code) {
          setError('No authorization code received from Google');
          setLoading(false);
          return;
        }

        // Send code to backend
        const response = await axios.post(`${API}/auth/google`, {
          code: code
        });

        // Login user with received token
        login(response.data.access_token);
        
        // Redirect to home page
        window.location.href = '/';
      } catch (err) {
        setError(err.response?.data?.detail || 'Authentication failed');
        setLoading(false);
      }
    };

    handleCallback();
  }, [login]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-600">Completing authentication...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4">{error}</div>
          <button 
            onClick={() => window.location.href = '/'}
            className="bg-yellow-400 text-black px-4 py-2 rounded-md hover:bg-yellow-500 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return null;
};