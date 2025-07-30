import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Panel1SVG from './assets/panel1.svg';
import Panel2SVG from './assets/panel2.svg';
import Panel3SVG from './assets/panel3.svg';
import ChatArrowSVG from './assets/chatarrow.svg';
import MenuSVG from './assets/menu.svg';
import CrossSVG from './assets/cross.svg';
import ArrowBackSVG from './assets/arrowback.svg';

const Dashboard = () => {
  const location = useLocation();
  const userName = location.state?.userName || 'User';
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [showWelcomeText, setShowWelcomeText] = useState(true);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  const handleNewChat = () => {
    setMessages([]);
    setShowWelcomeText(true);
    setShowChatHistory(false);
    if (isMobile) setIsSidebarExpanded(false);
  };

  const handleChatHistory = () => {
    setShowChatHistory(true);
    if (isMobile) setIsSidebarExpanded(false);
  };

  const handleBackToSidebar = () => {
    setShowChatHistory(false);
    setIsSidebarExpanded(true);
  };

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      setMessages([...messages, {
        id: Date.now(),
        content: inputMessage,
        role: 'user'
      }]);
      setInputMessage('');
      setShowWelcomeText(false);
    }
  };

  const isMobile = window.innerWidth <= 768;

  return (
    <>
      <style>
        {`
          html, body, #root {
            margin: 0;
            padding: 0;
            height: 100%;
            width: 100%;
            background: #0E0E0E !important;
            overflow: auto;
          }
          * {
            box-sizing: border-box;
          }
        `}
      </style>
      <div style={{
        background: '#0E0E0E',
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        margin: 0,
        padding: 0,
        overflow: 'hidden'
      }}>
        {!isMobile ? (
          <div style={{
            width: isSidebarExpanded ? '250px' : '60px',
            height: '100vh',
            background: isSidebarExpanded ? '#1F1F1F' : '#0E0E0E',
            position: 'fixed',
            left: 0,
            top: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: '20px',
            transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1), background 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: 1000,
            borderRight: '1px solid #333',
            willChange: 'width'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: isSidebarExpanded ? 'flex-start' : 'center',
              width: '100%',
              padding: isSidebarExpanded ? '0 20px' : '0',
              gap: '20px',
              marginTop: '20px',
              transition: 'padding 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
              <button onClick={toggleSidebar} style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: isSidebarExpanded ? 'flex-start' : 'center',
                width: '100%',
                transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: isSidebarExpanded ? 'scale(1)' : 'scale(0.95)'
              }}>
                <img
                  src={Panel1SVG}
                  alt="Toggle Icon"
                  style={{
                    width: '20px',
                    height: '18px',
                    flexShrink: 0,
                    marginRight: isSidebarExpanded ? '10px' : '0',
                    transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                />
                {isSidebarExpanded && (
                  <span style={{
                    color: '#F9F9F9',
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: '20px',
                    fontStyle: 'normal',
                    fontWeight: 500,
                    lineHeight: 'normal',
                    opacity: isSidebarExpanded ? 1 : 0,
                    transform: isSidebarExpanded ? 'translateY(0)' : 'translateY(5px)',
                    transition: 'opacity 0.4s ease 0.1s, transform 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.1s',
                    pointerEvents: isSidebarExpanded ? 'auto' : 'none'
                  }}>
                    Clario
                  </span>
                )}
              </button>
              <button onClick={handleNewChat} style={{
                display: 'flex',
                height: isSidebarExpanded ? '40px' : 'auto',
                padding: isSidebarExpanded ? '10px 11px' : '0',
                flexDirection: isSidebarExpanded ? 'column' : 'row',
                alignItems: isSidebarExpanded ? 'flex-start' : 'center',
                gap: isSidebarExpanded ? '10px' : '0',
                alignSelf: 'stretch',
                borderRadius: isSidebarExpanded ? '8px' : '0',
                border: isSidebarExpanded ? '0.5px solid #F9F9F9' : 'none',
                background: isSidebarExpanded ? '#101010' : 'none',
                cursor: 'pointer',
                justifyContent: isSidebarExpanded ? 'flex-start' : 'center',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1), transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: isSidebarExpanded ? 'scale(1)' : 'scale(0.95)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  justifyContent: isSidebarExpanded ? 'flex-start' : 'center'
                }}>
                  <img
                    src={Panel2SVG}
                    alt="New Chat Icon"
                    style={{
                      width: '20px',
                      height: '18px',
                      flexShrink: 0,
                      transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  />
                  {isSidebarExpanded && (
                    <span style={{
                      color: '#FFF',
                      fontFamily: 'Outfit, sans-serif',
                      fontSize: '16px',
                      fontStyle: 'normal',
                      fontWeight: 400,
                      lineHeight: 'normal',
                      opacity: isSidebarExpanded ? 1 : 0,
                      transform: isSidebarExpanded ? 'translateY(0)' : 'translateY(5px)',
                      transition: 'opacity 0.4s ease 0.15s, transform 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.15s',
                      pointerEvents: isSidebarExpanded ? 'auto' : 'none'
                    }}>
                      New chat
                    </span>
                  )}
                </div>
              </button>
              <button onClick={handleChatHistory} style={{
                display: 'flex',
                height: isSidebarExpanded ? '40px' : 'auto',
                padding: isSidebarExpanded ? '10px 11px' : '0',
                flexDirection: isSidebarExpanded ? 'column' : 'row',
                alignItems: isSidebarExpanded ? 'flex-start' : 'center',
                gap: isSidebarExpanded ? '10px' : '0',
                alignSelf: 'stretch',
                borderRadius: isSidebarExpanded ? '8px' : '0',
                border: isSidebarExpanded ? '0.5px solid #F9F9F9' : 'none',
                background: isSidebarExpanded ? '#101010' : 'none',
                cursor: 'pointer',
                justifyContent: isSidebarExpanded ? 'flex-start' : 'center',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1), transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: isSidebarExpanded ? 'scale(1)' : 'scale(0.95)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  justifyContent: isSidebarExpanded ? 'flex-start' : 'center'
                }}>
                  <img
                    src={Panel3SVG}
                    alt="Chat History Icon"
                    style={{
                      width: '20px',
                      height: '18px',
                      flexShrink: 0,
                      transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  />
                  {isSidebarExpanded && (
                    <span style={{
                      color: '#FFF',
                      fontFamily: 'Outfit, sans-serif',
                      fontSize: '16px',
                      fontStyle: 'normal',
                      fontWeight: 400,
                      lineHeight: 'normal',
                      opacity: isSidebarExpanded ? 1 : 0,
                      transform: isSidebarExpanded ? 'translateY(0)' : 'translateY(5px)',
                      transition: 'opacity 0.4s ease 0.2s, transform 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.2s',
                      pointerEvents: isSidebarExpanded ? 'auto' : 'none'
                    }}>
                      Chat history
                    </span>
                  )}
                </div>
              </button>
              {isSidebarExpanded && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '10px',
                  width: '100%',
                  marginTop: '20px',
                  opacity: isSidebarExpanded ? 1 : 0,
                  transform: isSidebarExpanded ? 'translateY(0)' : 'translateY(5px)',
                  transition: 'opacity 0.4s ease 0.25s, transform 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.25s',
                  pointerEvents: isSidebarExpanded ? 'auto' : 'none'
                }}>
                  <span style={{
                    color: 'rgba(153, 153, 153, 0.88)',
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: '12px',
                    fontStyle: 'normal',
                    fontWeight: 400,
                    lineHeight: 'normal'
                  }}>
                    Recent
                  </span>
                  {Array(5).fill().map((_, index) => (
                    <span key={index} style={{
                      color: '#FFF',
                      fontFamily: 'Outfit, sans-serif',
                      fontSize: '16px',
                      fontStyle: 'normal',
                      fontWeight: 400,
                      lineHeight: 'normal',
                      marginTop: '10px',
                      opacity: isSidebarExpanded ? 1 : 0,
                      transform: isSidebarExpanded ? 'translateY(0)' : 'translateY(5px)',
                      transition: `opacity 0.4s ease ${0.3 + index * 0.05}s, transform 0.4s cubic-bezier(0.4, 0, 0.2, 1) ${0.3 + index * 0.05}s`,
                      pointerEvents: isSidebarExpanded ? 'auto' : 'none'
                    }}>
                      Code creation request
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : !showChatHistory && (
          <>
            <button
              onClick={toggleSidebar}
              style={{
                position: 'fixed',
                top: '20px',
                left: '20px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                zIndex: 1001,
                transition: 'opacity 0.4s ease, transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: isSidebarExpanded ? 'scale(1)' : 'scale(0.95)'
              }}
            >
              <img
                src={MenuSVG}
                alt="Menu Icon"
                style={{
                  width: '24px',
                  height: '24px',
                  flexShrink: 0,
                  transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              />
            </button>
            {isSidebarExpanded && (
              <>
                <div style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  width: '100vw',
                  height: '100vh',
                  background: 'rgba(0, 0, 0, 0.5)',
                  zIndex: 999,
                  opacity: isSidebarExpanded ? 1 : 0,
                  transition: 'opacity 0.4s ease',
                  pointerEvents: isSidebarExpanded ? 'auto' : 'none'
                }} onClick={toggleSidebar} />
                <div style={{
                  width: '329px',
                  height: '100vh',
                  background: '#0E0E0E',
                  position: 'fixed',
                  left: 0,
                  top: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  paddingTop: '20px',
                  transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: isSidebarExpanded ? 'translateX(0)' : 'translateX(-100%)',
                  zIndex: 1000,
                  borderRight: '1px solid #333',
                  willChange: 'transform'
                }}>
                  <button
                    onClick={toggleSidebar}
                    style={{
                      position: 'absolute',
                      top: '20px',
                      right: '20px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'opacity 0.4s ease, transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      transform: isSidebarExpanded ? 'scale(1)' : 'scale(0.95)'
                    }}
                  >
                    <img
                      src={CrossSVG}
                      alt="Close Icon"
                      style={{
                        width: '24px',
                        height: '24px',
                        flexShrink: 0,
                        transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    />
                  </button>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    width: '100%',
                    padding: '0 20px',
                    gap: '20px',
                    marginTop: '60px',
                    transition: 'padding 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}>
                    <button onClick={toggleSidebar} style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      width: '100%',
                      transition: 'opacity 0.4s ease, transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      transform: isSidebarExpanded ? 'scale(1)' : 'scale(0.95)'
                    }}>
                      <img
                        src={Panel1SVG}
                        alt="Toggle Icon"
                        style={{
                          width: '20px',
                          height: '18px',
                          flexShrink: 0,
                          marginRight: '10px',
                          transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                      />
                      <span style={{
                        color: '#F9F9F9',
                        fontFamily: 'Outfit, sans-serif',
                        fontSize: '20px',
                        fontStyle: 'normal',
                        fontWeight: 500,
                        lineHeight: 'normal',
                        opacity: isSidebarExpanded ? 1 : 0,
                        transform: isSidebarExpanded ? 'translateY(0)' : 'translateY(5px)',
                        transition: 'opacity 0.4s ease 0.1s, transform 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.1s',
                        pointerEvents: isSidebarExpanded ? 'auto' : 'none'
                      }}>
                        Clario
                      </span>
                    </button>
                    <button onClick={handleNewChat} style={{
                      display: 'flex',
                      height: '40px',
                      padding: '10px 11px',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      gap: '10px',
                      alignSelf: 'stretch',
                      borderRadius: '8px',
                      border: '0.5px solid #F9F9F9',
                      background: '#101010',
                      cursor: 'pointer',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1), transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      transform: isSidebarExpanded ? 'scale(1)' : 'scale(0.95)'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        width: '100%'
                      }}>
                        <img
                          src={Panel2SVG}
                          alt="New Chat Icon"
                          style={{
                            width: '20px',
                            height: '18px',
                            flexShrink: 0,
                            transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                          }}
                        />
                        <span style={{
                          color: '#FFF',
                          fontFamily: 'Outfit, sans-serif',
                          fontSize: '16px',
                          fontStyle: 'normal',
                          fontWeight: 400,
                          lineHeight: 'normal',
                          opacity: isSidebarExpanded ? 1 : 0,
                          transform: isSidebarExpanded ? 'translateY(0)' : 'translateY(5px)',
                          transition: 'opacity 0.4s ease 0.15s, transform 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.15s',
                          pointerEvents: isSidebarExpanded ? 'auto' : 'none'
                        }}>
                          New chat
                        </span>
                      </div>
                    </button>
                    <button onClick={handleChatHistory} style={{
                      display: 'flex',
                      height: '40px',
                      padding: '10px 11px',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      gap: '10px',
                      alignSelf: 'stretch',
                      borderRadius: '8px',
                      border: '0.5px solid #F9F9F9',
                      background: '#101010',
                      cursor: 'pointer',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1), transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      transform: isSidebarExpanded ? 'scale(1)' : 'scale(0.95)'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        width: '100%'
                      }}>
                        <img
                          src={Panel3SVG}
                          alt="Chat History Icon"
                          style={{
                            width: '20px',
                            height: '18px',
                            flexShrink: 0,
                            transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                          }}
                        />
                        <span style={{
                          color: '#FFF',
                          fontFamily: 'Outfit, sans-serif',
                          fontSize: '16px',
                          fontStyle: 'normal',
                          fontWeight: 400,
                          lineHeight: 'normal',
                          opacity: isSidebarExpanded ? 1 : 0,
                          transform: isSidebarExpanded ? 'translateY(0)' : 'translateY(5px)',
                          transition: 'opacity 0.4s ease 0.2s, transform 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.2s',
                          pointerEvents: isSidebarExpanded ? 'auto' : 'none'
                        }}>
                          Chat history
                        </span>
                      </div>
                    </button>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      gap: '10px',
                      width: '100%',
                      marginTop: '20px',
                      opacity: isSidebarExpanded ? 1 : 0,
                      transform: isSidebarExpanded ? 'translateY(0)' : 'translateY(5px)',
                      transition: 'opacity 0.4s ease 0.25s, transform 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.25s',
                      pointerEvents: isSidebarExpanded ? 'auto' : 'none'
                    }}>
                      <span style={{
                        color: 'rgba(153, 153, 153, 0.88)',
                        fontFamily: 'Outfit, sans-serif',
                        fontSize: '12px',
                        fontStyle: 'normal',
                        fontWeight: 400,
                        lineHeight: 'normal'
                      }}>
                        Recent
                      </span>
                      {Array(5).fill().map((_, index) => (
                        <span key={index} style={{
                          color: '#FFF',
                          fontFamily: 'Outfit, sans-serif',
                          fontSize: '16px',
                          fontStyle: 'normal',
                          fontWeight: 400,
                          lineHeight: 'normal',
                          marginTop: '10px',
                          opacity: isSidebarExpanded ? 1 : 0,
                          transform: isSidebarExpanded ? 'translateY(0)' : 'translateY(5px)',
                          transition: `opacity 0.4s ease ${0.3 + index * 0.05}s, transform 0.4s cubic-bezier(0.4, 0, 0.2, 1) ${0.3 + index * 0.05}s`,
                          pointerEvents: isSidebarExpanded ? 'auto' : 'none'
                        }}>
                          Code creation request
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {showChatHistory ? (
          <div style={{
            marginLeft: isMobile ? 0 : (isSidebarExpanded ? '250px' : '60px'),
            padding: isMobile ? '20px 16px' : '60px 20px 20px 20px',
            flex: 1,
            background: '#0E0E0E',
            minHeight: '100vh',
            width: isMobile ? '100vw' : `calc(100vw - ${isSidebarExpanded ? '250px' : '60px'})`,
            transition: 'margin-left 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease',
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            opacity: showChatHistory ? 1 : 0,
            willChange: 'margin-left, opacity'
          }}>
            {isMobile && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                maxWidth: '100%',
                margin: '0 auto',
                padding: '0 16px'
              }}>
                <button onClick={handleBackToSidebar} style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <img
                    src={ArrowBackSVG}
                    alt="Back Icon"
                    style={{
                      width: '24px',
                      height: '24px',
                      flexShrink: 0
                    }}
                  />
                </button>
                <button onClick={handleNewChat} style={{
                  display: 'inline-flex',
                  height: '40px',
                  padding: '13.597px 34.841px',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8.498px',
                  flexShrink: 0,
                  borderRadius: '8.498px',
                  background: '#F9F9F9',
                  cursor: 'pointer'
                }}>
                  <span style={{
                    color: '#000',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '15.296px',
                    fontStyle: 'normal',
                    fontWeight: 500,
                    lineHeight: 'normal'
                  }}>
                    + New chat
                  </span>
                </button>
              </div>
            )}
            <div style={{
              margin: isMobile ? '2rem auto' : '4rem auto 0',
              width: '100%',
              maxWidth: isMobile ? 'calc(100% - 32px)' : '942px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: isMobile ? '10px' : '20px'
            }}>
              {!isMobile && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                  maxWidth: '942px',
                  margin: '0 auto',
                  padding: '0'
                }}>
                  <span style={{
                    color: '#F9F9F9',
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: '32px',
                    fontStyle: 'normal',
                    fontWeight: 400,
                    lineHeight: 'normal',
                    textAlign: 'left'
                  }}>
                    Your chat history
                  </span>
                  <button onClick={handleNewChat} style={{
                    display: 'inline-flex',
                    height: '40px',
                    padding: '13.597px 34.841px',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '8.498px',
                    flexShrink: 0,
                    borderRadius: '8.498px',
                    background: '#F9F9F9',
                    cursor: 'pointer'
                  }}>
                    <span style={{
                      color: '#000',
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '15.296px',
                      fontStyle: 'normal',
                      fontWeight: 500,
                      lineHeight: 'normal'
                    }}>
                      + New chat
                    </span>
                  </button>
                </div>
              )}
              {isMobile && (
                <span style={{
                  color: '#F9F9F9',
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: '24px',
                  fontStyle: 'normal',
                  fontWeight: 400,
                  lineHeight: 'normal',
                  textAlign: 'left',
                  width: '100%'
                }}>
                  Your chat history
                </span>
              )}
              <div style={{
                display: 'flex',
                width: isMobile ? '100%' : '942px',
                padding: isMobile ? '13px 16px' : '13px 33px',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'flex-start',
                gap: '10px',
                borderRadius: '10px',
                border: '1px solid #999',
                background: 'rgba(255, 255, 255, 0.10)'
              }}>
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search your chats"
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    color: '#999',
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: '18px',
                    fontStyle: 'normal',
                    fontWeight: 400,
                    lineHeight: 'normal',
                    outline: 'none'
                  }}
                />
              </div>
              <span style={{
                color: '#FFF',
                fontFamily: 'Poppins, sans-serif',
                fontSize: isMobile ? '12px' : '14px',
                fontStyle: 'normal',
                fontWeight: 400,
                lineHeight: 'normal',
                marginTop: '10px',
                width: '100%',
                textAlign: 'left'
              }}>
                You have 8 previous chats with Clario.
              </span>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                width: '100%',
                maxWidth: isMobile ? '100%' : '942px',
                marginTop: isMobile ? '1.5rem' : '3rem'
              }}>
                {Array(5).fill().map((_, index) => (
                  <div key={index} style={{
                    width: '100%',
                    height: isMobile ? '50px' : '80px',
                    flexShrink: 0,
                    borderRadius: '15px',
                    border: '0.5px solid #F9F9F9',
                    padding: isMobile ? '10px' : '15px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}>
                    <span style={{
                      color: '#FFF',
                      fontFamily: 'Outfit, sans-serif',
                      fontSize: isMobile ? '14px' : '18px',
                      fontStyle: 'normal',
                      fontWeight: 400,
                      lineHeight: 'normal',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'normal',
                      overflowWrap: 'break-word',
                      maxWidth: '100%'
                    }}>
                      Code creation request
                    </span>
                    <span style={{
                      color: 'rgba(153, 153, 153, 0.88)',
                      fontFamily: 'Outfit, sans-serif',
                      fontSize: isMobile ? '10px' : '10px',
                      fontStyle: 'normal',
                      fontWeight: 400,
                      lineHeight: 'normal',
                      marginTop: '5px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'normal',
                      overflowWrap: 'break-word',
                      maxWidth: '100%'
                    }}>
                      last message 1 hour ago
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            marginLeft: isMobile ? 0 : (isSidebarExpanded ? '250px' : '60px'),
            padding: isMobile ? '60px 16px 16px 16px' : '60px 20px 20px 20px',
            flex: 1,
            background: '#0E0E0E',
            minHeight: '100vh',
            width: isMobile ? '100vw' : `calc(100vw - ${isSidebarExpanded ? '250px' : '60px'})`,
            transition: 'margin-left 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease',
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            position: 'relative',
            opacity: showChatHistory ? 0 : 1,
            willChange: 'margin-left, opacity'
          }}>
            {isMobile && showWelcomeText && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '100%',
                maxWidth: '303px',
                textAlign: 'center',
                transition: 'opacity 0.4s ease'
              }}>
                <h1 style={{
                  color: '#F9F9F9',
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: 'clamp(20px, 5vw, 24px)',
                  fontStyle: 'normal',
                  fontWeight: 400,
                  lineHeight: 'normal',
                  margin: 0
                }}>
                  What’s on your mind, {userName}?
                </h1>
              </div>
            )}
            <div style={{
              flex: 1,
              width: '100%',
              maxWidth: isMobile ? '90%' : '881px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              margin: '0 auto',
              overflowY: 'auto',
              paddingBottom: isMobile ? '140px' : '140px'
            }}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  style={{
                    alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: isMobile ? '80%' : '70%',
                    margin: isMobile ? '8px 10px' : '10px'
                  }}
                >
                  <div style={{
                    background: message.role === 'user' ? '#1F1F1F' : '#2A2A2A',
                    color: '#F9F9F9',
                    padding: isMobile ? '8px 12px' : '10px 15px',
                    borderRadius: '10px',
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: isMobile ? '14px' : '16px',
                    fontWeight: 400
                  }}>
                    {message.content}
                  </div>
                </div>
              ))}
            </div>
            <div style={{
              width: '100%',
              maxWidth: isMobile ? '303px' : '881px',
              margin: '0 auto',
              position: isMobile ? 'sticky' : 'static',
              bottom: isMobile ? '40px' : 'auto',
              background: '#0E0E0E',
              zIndex: 999,
              padding: isMobile ? '15px 0' : '0',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
              {!isMobile && showWelcomeText && (
                <h1 style={{
                  color: '#F9F9F9',
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: '40px',
                  fontStyle: 'normal',
                  fontWeight: 400,
                  lineHeight: 'normal',
                  margin: '0 0 3rem 0',
                  textAlign: 'center',
                  transition: 'opacity 0.4s ease'
                }}>
                  What’s on your mind, {userName}?
                </h1>
              )}
              <div style={{
                display: 'flex',
                width: isMobile ? '303px' : '881px',
                height: isMobile ? '52px' : '120px',
                flexShrink: 0,
                borderRadius: isMobile ? '52px' : '25px',
                border: isMobile ? 'none' : '0.5px solid #F9F9F9',
                background: isMobile ? '#2D2C2C' : '#1F1F1F',
                boxShadow: isMobile ? 'none' : '0 4px 10px 0 rgba(153, 153, 153, 0.10)',
                alignItems: isMobile ? 'flex-start' : 'center',
                padding: isMobile ? '10px 28px' : '0 20px',
                gap: isMobile ? '118px' : '0',
                position: 'relative',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
              }}>
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask anything"
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    color: '#F9F9F9',
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: isMobile ? '14px' : '18px',
                    fontStyle: 'normal',
                    fontWeight: 400,
                    lineHeight: 'normal',
                    outline: 'none',
                    padding: isMobile ? '0 10px' : '0 20px',
                    height: '100%',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && inputMessage.trim()) {
                      handleSendMessage();
                    }
                  }}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: inputMessage.trim() ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0',
                    transition: 'opacity 0.4s ease, transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    opacity: inputMessage.trim() ? 1 : 0.5,
                    position: 'absolute',
                    right: isMobile ? '10px' : '20px',
                    top: '50%',
                    transform: 'translateY(-50%)'
                  }}
                >
                  <img
                    src={ChatArrowSVG}
                    alt="Send Message"
                    style={{
                      width: isMobile ? '24px' : '30px',
                      height: isMobile ? '24px' : '30px',
                      flexShrink: 0,
                      transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Dashboard;