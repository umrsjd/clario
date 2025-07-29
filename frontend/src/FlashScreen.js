import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import logo from './assets/logoo.svg';
import firstIcon from './assets/first.png';
import secondIcon from './assets/second.png';
import thirdIcon from './assets/third.png';

const FlashScreen = () => {
  const navigate = useNavigate();
  const [showSecondSlide, setShowSecondSlide] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [email, setEmail] = useState('');

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
      navigate('/dashboard');
    }, 500);
  };

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
          onClick={() => setShowSecondSlide(true)}
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
            marginLeft: '0px',
            alignSelf: 'flex-start',
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
      <div style={{ width: '100%', maxWidth: '600px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '20px',
          }}
        >
          <img
            src={logo}
            alt="Clario Logo"
            style={{
              width: '38px',
              height: '38px',
              flexShrink: 0,
            }}
          />
          <h1
            style={{
              color: '#FFFFFB',
              fontFamily: 'Outfit, sans-serif',
              fontSize: '32px',
              fontStyle: 'normal',
              fontWeight: 400,
              lineHeight: 'normal',
              margin: 0,
            }}
            className="clario-heading"
          >
            Clario
          </h1>
        </div>
        
        <h2
          style={{
            color: '#F9F9F9',
            fontFamily: 'Outfit, sans-serif',
            fontSize: '32px',
            fontStyle: 'normal',
            fontWeight: 500,
            lineHeight: 'normal',
            textAlign: 'left',
            margin: 0,
          }}
          className="prompt-heading"
        >
          Before we get started, what should I call you?
        </h2>
        
        <div
          style={{
            width: '100%',
            maxWidth: '490px',
            marginTop: '16px',
          }}
        >
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
        
        <button
          onClick={handleNavigate}
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
            alignSelf: 'flex-start',
          }}
        >
          let’s go
        </button>
      </div>
    </div>
  );

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
          .second-slide {
            height: auto;
            min-height: 100vh;
            overflow-y: auto;
          }
          @media (max-width: 768px) {
            .first-slide > div {
              padding-left: 16px;
              padding-right: 16px;
            }
            .second-slide > div {
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
              width: 361px !important;
            }
            .subheading {
              color: #C9C9C9 !important;
              font-family: Poppins, sans-serif !important;
              font-size: 14px !important;
              font-style: normal !important;
              font-weight: 400 !important;
              line-height: normal !important;
              width: 297px !important;
            }
            .clario-heading {
              font-size: 24px !important;
            }
            .prompt-heading {
              font-size: 24px !important;
              width: 361px !important;
            }
            .email-input {
              width: 100% !important;
              max-width: 361px !important;
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
            showSecondSlide ? (
              <div
                key="second-slide"
                style={{ width: '100%', height: 'auto' }}
              >
                <SecondSlide />
              </div>
            ) : (
              <motion.div
                key="first-slide"
                variants={slideVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                style={{ width: '100%', height: 'auto' }}
              >
                <FirstSlide />
              </motion.div>
            )
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default FlashScreen;