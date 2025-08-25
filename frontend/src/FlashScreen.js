import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import logo from './assets/logoo.svg';
import firstIcon from './assets/first.png';
import secondIcon from './assets/second.png';
import thirdIcon from './assets/third.png';

const FlashScreen = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [email, setEmail] = useState('');
  const [selectedValues, setSelectedValues] = useState([]);
  const [selectedMentalHealth, setSelectedMentalHealth] = useState([]);
  const [selectedDecision, setSelectedDecision] = useState([]);
  const [selectedCommunication, setSelectedCommunication] = useState([]);
  const [selectedRole, setSelectedRole] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);

  // Animation variants for first slide
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5 },
    },
  };

  // Animation variants for slide transitions
  const slideVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -50, transition: { duration: 0.5 } },
  };

  const handleNavigate = () => {
    setIsExiting(true);
    setTimeout(() => {
      navigate('/dashboard', { state: { userName: email } });
    }, 500);
  };

const handleSubmit = async () => {
    const token = localStorage.getItem('token'); 
    if (!token) {
      console.error("Authentication token not found.");
      return;
    }

    // NEW: Structure the answers according to the Clario Framework categories
    const profileData = {
      "Personal Facts": {
        "name": email, // The 'email' state holds the user's name
      },
      "Core Values": selectedValues,
      "Emotional History": {
        "mental_health_experience": selectedMentalHealth,
      },
      "Personality Traits": {
        "decision_making_style": selectedDecision,
        "communication_style": selectedCommunication,
      },
      "Preferences": {
        "ai_role_preference": selectedRole,
        "topics_to_avoid": selectedTopics,
      }
    };
    console.log("Submitting profile data:", profileData);
    try {
      // MODIFIED: The body now sends a nested profile_data object
      const response = await fetch('http://localhost:8001/api/user/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ profile_data: profileData }), // The payload is nested
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Profile updated successfully:', result);
      
      handleNavigate();

    } catch (error) {
      console.error('Failed to submit user profile:', error);
    }
  };

  const handleNextSlide = () => {
    // MODIFIED: Check if it's the last slide
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      // On the last slide, call the new submit function
      handleSubmit();
    }
  };


  const ProgressBar = () => {
    const totalSlides = 7;
    return (
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        justifyContent: 'center',
        padding: '10px 16px',
        background: '#0E0E0E',
        zIndex: 1000,
        width: '100%',
        boxSizing: 'border-box',
      }}>
        {Array.from({ length: totalSlides }).map((_, index) => (
          <div
            key={index}
            style={{
              flex: 1,
              height: '4px',
              background: index + 1 <= currentSlide ? '#F9F9F9' : '#4A4A4A',
              borderRadius: '2px',
            }}
          />
        ))}
      </div>
    );
  };

  const CheckboxOption = ({ label, checked, onChange }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        style={{
          width: '26px',
          height: '26px',
          flexShrink: 0,
          borderRadius: '5px',
          border: '1px solid #F9F9F9',
          appearance: 'none',
          background: checked ? '#F9F9F9' : 'transparent',
          cursor: 'pointer',
          margin: 0,
        }}
      />
      <span style={{
        color: '#FFF',
        fontFamily: 'Poppins, sans-serif',
        fontSize: '22px',
        fontStyle: 'normal',
        fontWeight: 500,
        lineHeight: 'normal',
      }}>
        {label}
      </span>
    </div>
  );

  const FirstSlide = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '16px 0 102px 0',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '9px',
        background: '#0E0E0E',
        width: '100%',
        overflowY: 'auto',
      }}
      className="first-slide"
    >
      <div style={{ width: '100%', maxWidth: '600px' }}>
        <motion.img
          variants={itemVariants}
          src={logo}
          alt="Clario Logo"
          style={{
            width: '38px',
            height: '38px',
            marginBottom: '20px',
            alignSelf: 'flex-start',
          }}
        />
        <motion.h1
          variants={itemVariants}
          style={{
            color: '#F9F9F9',
            fontFamily: 'Outfit, sans-serif',
            fontSize: '40px',
            fontStyle: 'normal',
            fontWeight: 500,
            lineHeight: 'normal',
            margin: 0,
            textAlign: 'left',
          }}
          className="title"
        >
          Hey there, I’m Clario.
        </motion.h1>
        <motion.div variants={itemVariants} style={{ marginBottom: '20px' }}>
          <p style={{
            color: '#F9F9F9',
            fontFamily: 'Outfit, sans-serif',
            fontSize: '24px',
            fontStyle: 'normal',
            fontWeight: 400,
            margin: 0,
            textAlign: 'left',
          }}
          className="subtitle"
          >
            Your AI companion here to grow with you
          </p>
          <p style={{
            color: '#F9F9F9',
            fontFamily: 'Outfit, sans-serif',
            fontSize: '24px',
            fontStyle: 'normal',
            fontWeight: 400,
            margin: 0,
            textAlign: 'left',
          }}
          className="subtitle"
          >
            and bring clarity to life.
          </p>
        </motion.div>
        <motion.p variants={itemVariants} style={{
          color: '#F9F9F9',
          fontFamily: 'Outfit, sans-serif',
          fontSize: '24px',
          fontStyle: 'normal',
          fontWeight: 400,
          lineHeight: 'normal',
          marginBottom: '20px',
          margin: 0,
          textAlign: 'left',
        }}>
          Here are a few things you should know about me:
        </motion.p>
        <motion.div variants={itemVariants} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '20px' }}>
          <img
            src={firstIcon}
            alt="Feature Icon 1"
            style={{
              width: '67.983px',
              height: '67.983px',
              flexShrink: 0,
            }}
          />
          <div style={{ flex: 1 }}>
            <h3 style={{
              color: '#F9F9F9',
              fontFamily: 'Outfit, sans-serif',
              fontSize: '24px',
              fontStyle: 'normal',
              fontWeight: 500,
              lineHeight: 'normal',
              margin: 0,
              textAlign: 'left',
            }}>
              I remember you.
            </h3>
            <p style={{
              color: '#C9C9C9',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '18px',
              fontStyle: 'normal',
              fontWeight: 400,
              lineHeight: 'normal',
              margin: 5,
              textAlign: 'left',
            }}
            className="subheading"
            >
              I learn from our conversations to become more helpful thoughtful and aligned with who you are and how you evolve.
            </p>
          </div>
        </motion.div>
        <motion.div variants={itemVariants} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '20px' }}>
          <img
            src={secondIcon}
            alt="Feature Icon 2"
            style={{
              width: '67.983px',
              height: '67.983px',
              flexShrink: 0,
            }}
          />
          <div style={{ flex: 1 }}>
            <h3 style={{
              color: '#F9F9F9',
              fontFamily: 'Outfit, sans-serif',
              fontSize: '24px',
              fontStyle: 'normal',
              fontWeight: 500,
              lineHeight: 'normal',
              margin: 0,
              textAlign: 'left',
            }}>
              You’re in control.
            </h3>
            <p style={{
              color: '#C9C9C9',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '18px',
              fontStyle: 'normal',
              fontWeight: 400,
              lineHeight: 'normal',
              margin: 5,
              textAlign: 'left',
            }}
            className="subheading"
            >
              You decide what I remember You can update or delete memories anytime your data your choice.
            </p>
          </div>
        </motion.div>
        <motion.div variants={itemVariants} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '20px' }}>
          <img
            src={thirdIcon}
            alt="Feature Icon 3"
            style={{
              width: '67.983px',
              height: '67.983px',
              flexShrink: 0,
            }}
          />
          <div style={{ flex: 1 }}>
            <h3 style={{
              color: '#F9F9F9',
              fontFamily: 'Outfit, sans-serif',
              fontSize: '24px',
              fontStyle: 'normal',
              fontWeight: 500,
              lineHeight: 'normal',
              margin: 0,
              textAlign: 'left',
            }}>
              Built for connection not perfection.
            </h3>
            <p style={{
              color: '#C9C9C9',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '18px',
              fontStyle: 'normal',
              fontWeight: 400,
              lineHeight: 'normal',
              margin: 5,
              textAlign: 'left',
            }}
            className="subheading"
            >
              I’m designed to support not judge. From tough days to big dreams I’m always here growing with you every step of the way.
            </p>
          </div>
        </motion.div>
        <motion.button
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleNextSlide}
          style={{
            display: 'inline-flex',
            height: '50.987px',
            padding: '13.597px 34.841px',
            justifyContent: 'center',
            alignItems: 'flex-end',
            gap: '8.498px',
            flexShrink: 0,
            borderRadius: '8.498px',
            background: '#F9F9F9',
            color: '#000',
            fontFamily: 'Poppins, sans-serif',
            fontSize: '15.296px',
            fontStyle: 'normal',
            fontWeight: 500,
            lineHeight: 'normal',
            border: 'none',
            cursor: 'pointer',
            marginTop: '20px',
            alignSelf: 'flex-end',
            marginBottom: '40px',
          }}
        >
          I understand
        </motion.button>
      </div>
    </motion.div>
  );

  const SecondSlide = () => (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '54px 0 102px 0',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        background: '#0E0E0E',
        minHeight: '100vh',
        width: '100%',
      }}
      className="second-slide"
    >
      <ProgressBar />
      <div style={{ width: '100%', maxWidth: '600px', paddingTop: '50px' }}>
        <img
          src={logo}
          alt="Clario Logo"
          style={{ width: '38px', height: '38px', flexShrink: 0, marginBottom: '20px' }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <h2 style={{
            color: '#F9F9F9',
            fontFamily: 'Outfit, sans-serif',
            fontSize: '32px',
            fontStyle: 'normal',
            fontWeight: 500,
            lineHeight: 'normal',
            textAlign: 'left',
            margin: 0,
            maxWidth: '490px',
            marginBottom: '16px',
          }}
          className="prompt-heading"
          >
            Before we get started, what should I call you?
          </h2>
          <div style={{ width: '100%', maxWidth: '490px' }}>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="enter your name"
              className="email-input"
              autoFocus
              style={{
                width: '100%',
                height: '70px',
                flexShrink: 0,
                borderRadius: '12px',
                border: '1px solid #F9F9F9',
                background: 'transparent',
                color: '#FFF',
                fontFamily: 'Outfit, sans-serif',
                fontSize: '20px',
                fontStyle: 'normal',
                fontWeight: 400,
                lineHeight: 'normal',
                padding: '0 16px',
                outline: 'none',
              }}
            />
          </div>
        </div>
        <button
          onClick={handleNextSlide}
          style={{
            display: 'inline-flex',
            height: '60px',
            padding: '16px 41px',
            justifyContent: 'center',
            alignItems: 'flex-end',
            gap: '10px',
            flexShrink: 0,
            borderRadius: '10px',
            background: '#F9F9F9',
            color: '#000',
            fontFamily: 'Poppins, sans-serif',
            fontSize: '18px',
            fontStyle: 'normal',
            fontWeight: 500,
            lineHeight: 'normal',
            border: 'none',
            cursor: 'pointer',
            marginTop: '16px',
            alignSelf: 'flex-end',
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );

  const ThirdSlide = () => (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '54px 0 102px 0',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        background: '#0E0E0E',
        minHeight: '100vh',
        width: '100%',
      }}
      className="third-slide"
    >
      <ProgressBar />
      <div style={{ width: '100%', maxWidth: '912px', paddingTop: '50px' }}>
        <img
          src={logo}
          alt="Clario Logo"
          style={{ width: '38px', height: '38px', flexShrink: 0, marginBottom: '20px' }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <h2 style={{
            color: '#F9F9F9',
            fontFamily: 'Outfit, sans-serif',
            fontSize: '40px',
            fontStyle: 'normal',
            fontWeight: 500,
            lineHeight: 'normal',
            textAlign: 'left',
            margin: 0,
            maxWidth: '912px',
            marginBottom: '16px',
          }}>
            Select core values that guide your decisions:
          </h2>
          <div style={{ width: '100%' }}>
            {[
              'Family and Relationships',
              'Creativity and Innovation',
              'Knowledge and Learning',
              'Adventure and Risk-taking',
              'Spirituality'
            ].map((option) => (
              <CheckboxOption
                key={option}
                label={option}
                checked={selectedValues.includes(option)}
                onChange={() => {
                  setSelectedValues((prev) =>
                    prev.includes(option)
                      ? prev.filter((item) => item !== option)
                      : [...prev, option]
                  );
                }}
              />
            ))}
          </div>
        </div>
        <button
          onClick={handleNextSlide}
          style={{
            display: 'inline-flex',
            height: '60px',
            padding: '16px 41px',
            justifyContent: 'center',
            alignItems: 'flex-end',
            gap: '10px',
            flexShrink: 0,
            borderRadius: '10px',
            background: '#F9F9F9',
            color: '#000',
            fontFamily: 'Poppins, sans-serif',
            fontSize: '18px',
            fontStyle: 'normal',
            fontWeight: 500,
            lineHeight: 'normal',
            border: 'none',
            cursor: 'pointer',
            marginTop: '16px',
            alignSelf: 'flex-end',
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );

  const FourthSlide = () => (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '54px 0 102px 0',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        background: '#0E0E0E',
        minHeight: '100vh',
        width: '100%',
      }}
      className="fourth-slide"
    >
      <ProgressBar />
      <div style={{ width: '100%', maxWidth: '912px', paddingTop: '50px' }}>
        <img
          src={logo}
          alt="Clario Logo"
          style={{ width: '38px', height: '38px', flexShrink: 0, marginBottom: '20px' }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <h2 style={{
            color: '#F9F9F9',
            fontFamily: 'Outfit, sans-serif',
            fontSize: '40px',
            fontStyle: 'normal',
            fontWeight: 500,
            lineHeight: 'normal',
            textAlign: 'left',
            margin: 0,
            maxWidth: '912px',
            marginBottom: '16px',
          }}>
            Have you experienced any mental health concerns in the past or are you currently experiencing?
          </h2>
          <div style={{ width: '100%' }}>
            {[
              'Yes, I am currently suffering from mental health problems.',
              'Yes, I have experienced mental health issues in past.',
              'No, I have never faced mental health issues.'
            ].map((option) => (
              <CheckboxOption
                key={option}
                label={option}
                checked={selectedMentalHealth.includes(option)}
                onChange={() => {
                  setSelectedMentalHealth((prev) =>
                    prev.includes(option)
                      ? prev.filter((item) => item !== option)
                      : [...prev, option]
                  );
                }}
              />
            ))}
          </div>
        </div>
        <button
          onClick={handleNextSlide}
          style={{
            display: 'inline-flex',
            height: '60px',
            padding: '16px 41px',
            justifyContent: 'center',
            alignItems: 'flex-end',
            gap: '10px',
            flexShrink: 0,
            borderRadius: '10px',
            background: '#F9F9F9',
            color: '#000',
            fontFamily: 'Poppins, sans-serif',
            fontSize: '18px',
            fontStyle: 'normal',
            fontWeight: 500,
            lineHeight: 'normal',
            border: 'none',
            cursor: 'pointer',
            marginTop: '16px',
            alignSelf: 'flex-end',
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );

  const FifthSlide = () => (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '54px 0 102px 0',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        background: '#0E0E0E',
        minHeight: '100vh',
        width: '100%',
      }}
      className="fifth-slide"
    >
      <ProgressBar />
      <div style={{ width: '100%', maxWidth: '912px', paddingTop: '50px' }}>
        <img
          src={logo}
          alt="Clario Logo"
          style={{ width: '38px', height: '38px', flexShrink: 0, marginBottom: '20px' }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <h2 style={{
            color: '#F9F9F9',
            fontFamily: 'Outfit, sans-serif',
            fontSize: '40px',
            fontStyle: 'normal',
            fontWeight: 500,
            lineHeight: 'normal',
            textAlign: 'left',
            margin: 0,
            maxWidth: '912px',
            marginBottom: '16px',
          }}>
            Are you more of an intuitive decision-maker or do you analyze everything?
          </h2>
          <div style={{ width: '100%' }}>
            {[
              'Intuitive Decision Maker',
              'Carefully analyses various scenarios and then take decision'
            ].map((option) => (
              <CheckboxOption
                key={option}
                label={option}
                checked={selectedDecision.includes(option)}
                onChange={() => {
                  setSelectedDecision((prev) =>
                    prev.includes(option)
                      ? prev.filter((item) => item !== option)
                      : [...prev, option]
                  );
                }}
              />
            ))}
          </div>
        </div>
        <button
          onClick={handleNextSlide}
          style={{
            display: 'inline-flex',
            height: '60px',
            padding: '16px 41px',
            justifyContent: 'center',
            alignItems: 'flex-end',
            gap: '10px',
            flexShrink: 0,
            borderRadius: '10px',
            background: '#F9F9F9',
            color: '#000',
            fontFamily: 'Poppins, sans-serif',
            fontSize: '18px',
            fontStyle: 'normal',
            fontWeight: 500,
            lineHeight: 'normal',
            border: 'none',
            cursor: 'pointer',
            marginTop: '16px',
            alignSelf: 'flex-end',
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );

  const SixthSlide = () => (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '54px 0 102px 0',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        background: '#0E0E0E',
        minHeight: '100vh',
        width: '100%',
      }}
      className="sixth-slide"
    >
      <ProgressBar />
      <div style={{ width: '100%', maxWidth: '912px', paddingTop: '50px' }}>
        <img
          src={logo}
          alt="Clario Logo"
          style={{ width: '38px', height: '38px', flexShrink: 0, marginBottom: '20px' }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <h2 style={{
            color: '#F9F9F9',
            fontFamily: 'Outfit, sans-serif',
            fontSize: '40px',
            fontStyle: 'normal',
            fontWeight: 500,
            lineHeight: 'normal',
            textAlign: 'left',
            margin: 0,
            maxWidth: '912px',
            marginBottom: '16px',
          }}>
            How do you like others to communicate with you?
          </h2>
          <div style={{ width: '100%' }}>
            {[
              'Analytical and detailed',
              'Friendly',
              'Formal'
            ].map((option) => (
              <CheckboxOption
                key={option}
                label={option}
                checked={selectedCommunication.includes(option)}
                onChange={() => {
                  setSelectedCommunication((prev) =>
                    prev.includes(option)
                      ? prev.filter((item) => item !== option)
                      : [...prev, option]
                  );
                }}
              />
            ))}
          </div>
        </div>
        <button
          onClick={handleNextSlide}
          style={{
            display: 'inline-flex',
            height: '60px',
            padding: '16px 41px',
            justifyContent: 'center',
            alignItems: 'flex-end',
            gap: '10px',
            flexShrink: 0,
            borderRadius: '10px',
            background: '#F9F9F9',
            color: '#000',
            fontFamily: 'Poppins, sans-serif',
            fontSize: '18px',
            fontStyle: 'normal',
            fontWeight: 500,
            lineHeight: 'normal',
            border: 'none',
            cursor: 'pointer',
            marginTop: '16px',
            alignSelf: 'flex-end',
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );

  const SeventhSlide = () => (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '54px 0 102px 0',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        background: '#0E0E0E',
        minHeight: '100vh',
        width: '100%',
      }}
      className="seventh-slide"
    >
      <ProgressBar />
      <div style={{ width: '100%', maxWidth: '912px', paddingTop: '50px' }}>
        <img
          src={logo}
          alt="Clario Logo"
          style={{ width: '38px', height: '38px', flexShrink: 0, marginBottom: '20px' }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <h2 style={{
            color: '#F9F9F9',
            fontFamily: 'Outfit, sans-serif',
            fontSize: '40px',
            fontStyle: 'normal',
            fontWeight: 500,
            lineHeight: 'normal',
            textAlign: 'left',
            margin: 0,
            maxWidth: '912px',
            marginBottom: '16px',
          }}>
            Which role would you prefer your AI assistant to adopt when providing guidance?
          </h2>
          <div style={{ width: '100%' }}>
            {[
              'Coach - Motivational, helps me reach my potential',
              'Friend - Supportive, Emotionally available',
              'Analyst - Problem-solving focused, logical recommendations',
              'Adaptive - Changes role based on the situation'
            ].map((option) => (
              <CheckboxOption
                key={option}
                label={option}
                checked={selectedRole.includes(option)}
                onChange={() => {
                  setSelectedRole((prev) =>
                    prev.includes(option)
                      ? prev.filter((item) => item !== option)
                      : [...prev, option]
                  );
                }}
              />
            ))}
          </div>
        </div>
        <button
          onClick={handleNextSlide}
          style={{
            display: 'inline-flex',
            height: '60px',
            padding: '16px 41px',
            justifyContent: 'center',
            alignItems: 'flex-end',
            gap: '10px',
            flexShrink: 0,
            borderRadius: '10px',
            background: '#F9F9F9',
            color: '#000',
            fontFamily: 'Poppins, sans-serif',
            fontSize: '18px',
            fontStyle: 'normal',
            fontWeight: 500,
            lineHeight: 'normal',
            border: 'none',
            cursor: 'pointer',
            marginTop: '16px',
            alignSelf: 'flex-end',
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );

  const EighthSlide = () => (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '54px 0 102px 0',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        background: '#0E0E0E',
        minHeight: '100vh',
        width: '100%',
      }}
      className="eighth-slide"
    >
      <ProgressBar />
      <div style={{ width: '100%', maxWidth: '912px', paddingTop: '50px' }}>
        <img
          src={logo}
          alt="Clario Logo"
          style={{ width: '38px', height: '38px', flexShrink: 0, marginBottom: '20px' }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <h2 style={{
            color: '#F9F9F9',
            fontFamily: 'Outfit, sans-serif',
            fontSize: '40px',
            fontStyle: 'normal',
            fontWeight: 500,
            lineHeight: 'normal',
            textAlign: 'left',
            margin: 0,
            maxWidth: '912px',
            marginBottom: '16px',
          }}>
            What topics should I be cautious about or avoid?
          </h2>
          <div style={{ width: '100%' }}>
            {[
              'Personal relationships',
              'Past traumas',
              'Religious or spiritual beliefs',
              'Political views and opinions',
              'Physical appearance or body image',
              'No restrictions'
            ].map((option) => (
              <CheckboxOption
                key={option}
                label={option}
                checked={selectedTopics.includes(option)}
                onChange={() => {
                  setSelectedTopics((prev) =>
                    prev.includes(option)
                      ? prev.filter((item) => item !== option)
                      : [...prev, option]
                  );
                }}
              />
            ))}
          </div>
        </div>
        <button
          onClick={handleNextSlide}
          style={{
            display: 'inline-flex',
            height: '60px',
            padding: '16px 41px',
            justifyContent: 'center',
            alignItems: 'flex-end',
            gap: '10px',
            flexShrink: 0,
            borderRadius: '10px',
            background: '#F9F9F9',
            color: '#000',
            fontFamily: 'Poppins, sans-serif',
            fontSize: '18px',
            fontStyle: 'normal',
            fontWeight: 500,
            lineHeight: 'normal',
            border: 'none',
            cursor: 'pointer',
            marginTop: '16px',
            alignSelf: 'flex-end',
          }}
        >
          let's go
        </button>
      </div>
    </div>
  );

  const slides = [
    <FirstSlide key="first-slide" />,
    <SecondSlide key="second-slide" />,
    <ThirdSlide key="third-slide" />,
    <FourthSlide key="fourth-slide" />,
    <FifthSlide key="fifth-slide" />,
    <SixthSlide key="sixth-slide" />,
    <SeventhSlide key="seventh-slide" />,
    <EighthSlide key="eighth-slide" />,
  ];

  return (
    <>
      <style>
        {`
          html, body {
            margin: 0;
            padding: 0;
            height: 100%;
            width: 100%;
            background: #0E0E0E;
            overflow: auto;
          }
          #root {
            height: 100%;
            width: 100%;
            background: #0E0E0E;
            overflow: auto;
          }
          .first-slide {
            height: auto;
            min-height: 100vh;
            overflow-y: auto;
          }
          .second-slide, .third-slide, .fourth-slide, .fifth-slide, .sixth-slide, .seventh-slide, .eighth-slide {
            height: auto;
            min-height: 100vh;
            overflow-y: auto;
          }
          @media (max-width: 768px) {
            .first-slide > div {
              padding-left: 16px;
              padding-right: 16px;
            }
            .second-slide > div, .third-slide > div, .fourth-slide > div, .fifth-slide > div, .sixth-slide > div, .seventh-slide > div, .eighth-slide > div {
              padding-left: 16px;
              padding-right: 16px;
            }
            .title {
              color: #FFFFFB !important;
              font-family: Outfit, sans-serif !important;
              font-size: 28px !important;
              font-style: normal !important;
              font-weight: 500 !important;
              line-height: normal !important;
            }
            .subtitle {
              color: #FFFFFB !important;
              font-family: Outfit, sans-serif !important;
              font-size: 18px !important;
              font-style: normal !important;
              font-weight: 400 !important;
              line-height: normal !important;
              max-width: 361px !important;
            }
            .subheading {
              color: #C9C9C9 !important;
              font-family: Poppins, sans-serif !important;
              font-size: 14px !important;
              font-style: normal !important;
              font-weight: 400 !important;
              line-height: normal !important;
              max-width: 297px !important;
            }
            .prompt-heading {
              font-size: 24px !important;
              max-width: 361px !important;
            }
            .email-input {
              width: 100% !important;
              max-width: 361px !important;
            }
            .third-slide h2, .fourth-slide h2, .fifth-slide h2, .sixth-slide h2, .seventh-slide h2, .eighth-slide h2 {
              font-size: 24px !important;
              max-width: 361px !important;
            }
            .third-slide span, .fourth-slide span, .fifth-slide span, .sixth-slide span, .seventh-slide span, .eighth-slide span {
              font-size: 16px !important;
              max-width: 335px !important;
            }
          }
        `}
      </style>
      <div style={{
        background: '#0E0E0E',
        width: '100%',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'auto',
      }}>
        <AnimatePresence mode="wait">
          {!isExiting && (
            <motion.div
              key={`slide-${currentSlide}`}
              variants={currentSlide === 0 ? containerVariants : slideVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{ width: '100%', height: 'auto' }}
            >
              {slides[currentSlide]}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default FlashScreen;