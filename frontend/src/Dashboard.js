import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import Panel1SVG from './assets/panel1.svg';
import Panel2SVG from './assets/panel2.svg';
import Panel3SVG from './assets/panel3.svg';
import ChatArrowSVG from './assets/chatarrow.svg';


const IS_PRODUCTION = process.env.REACT_APP_ENVIRONMENT === 'production';
const BACKEND_URL = IS_PRODUCTION ? 'https://api.clario.co.in' : 'http://localhost:8001';
const API = `${BACKEND_URL}/api`;

const formatTimeAgo = (dateString) => {
    if (!dateString) return 'No messages yet';
    let date = new Date(dateString);

    // TEMP FIX: if backend saved IST time but marked as UTC
    date = new Date(date.getTime() + (5.5 * 60 * 60 * 1000));

    const now = new Date();
    const diffInSeconds = Math.round((now.getTime() - date.getTime()) / 1000);

    const units = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60,
        second: 1
    };
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    for (const unit in units) {
        const interval = diffInSeconds / units[unit];
        if (interval >= 1) {
            return rtf.format(-Math.floor(interval), unit);
        }
    }
    return rtf.format(0, 'second');
};



const Dashboard = () => {
    const [userName, setUserName] = useState('User');
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
    const [inputMessage, setInputMessage] = useState('');
    const [showWelcomeText, setShowWelcomeText] = useState(true);
    const [showChatHistory, setShowChatHistory] = useState(false);
    const [messages, setMessages] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [activeConversationId, setActiveConversationId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const chatContainerRef = useRef(null);
    const [searchQuery, setSearchQuery] = useState('');

    const getToken = () => localStorage.getItem('token');
    const isMobile = window.innerWidth <= 768;

    useEffect(() => {
        const token = getToken();
        if (!token) return;
        const fetchInitialData = async () => {
            try {
                const userResponse = await fetch(`${API}/auth/me`, { headers: { 'Authorization': `Bearer ${token}` } });
                const userData = await userResponse.json();
                setUserName(
                    userData.user_profile?.["Personal Facts"]?.name ||
                    userData.full_name ||
                    userData.email ||
                    'User'
                );
                console.log("User data fetched:", userData);

                const convResponse = await fetch(`${API}/chat/conversations`, { headers: { 'Authorization': `Bearer ${token}` } });
                const convData = await convResponse.json();
                setConversations(convData);
            } catch (error) {
                console.error("Error fetching initial data:", error);
            }
        };
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const toggleSidebar = () => setIsSidebarExpanded(!isSidebarExpanded);

    const handleNewChat = () => {
        setActiveConversationId(null);
        setMessages([]);
        setShowWelcomeText(true);
        setShowChatHistory(false);
    };

    const handleShowHistory = () => {
        setShowChatHistory(true);
    };

    const handleSelectConversation = async (conversationId) => {
        const token = getToken();
        if (!token) return;

        setShowChatHistory(false);
        setIsLoading(true);
        setMessages([]);
        setShowWelcomeText(false);

        try {
            const response = await fetch(`${API}/chat/conversations/${conversationId}`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error('Failed to fetch messages');
            const data = await response.json();
            setMessages(data.messages);
            setActiveConversationId(conversationId);
        } catch (error) {
            console.error("Error fetching conversation history:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async () => {
        if (!inputMessage.trim()) return;
        const token = getToken();
        if (!token) return;

        const userMessage = { id: Date.now(), content: inputMessage, role: 'user' };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = inputMessage;
        setInputMessage('');
        setShowWelcomeText(false);
        setIsLoading(true);

        try {
            const response = await fetch(`${API}/chat/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ message: currentInput, conversation_id: activeConversationId }),
            });
            if (!response.ok) throw new Error('Failed to send message');
            const data = await response.json();

            const aiMessage = { id: data.message_id, content: data.message, role: 'assistant' };
            setMessages(prev => [...prev.filter(m => m.id !== userMessage.id), userMessage, aiMessage]);

            if (!activeConversationId) {
                setActiveConversationId(data.conversation_id);
                const convResponse = await fetch(`${API}/chat/conversations`, { headers: { 'Authorization': `Bearer ${token}` } });
                const convData = await convResponse.json();
                setConversations(convData);
            }
        } catch (error) {
            console.error("Error sending message:", error);
            const errorMessage = { id: 'error', content: 'Sorry, something went wrong.', role: 'assistant' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredConversations = conversations.filter(conv =>
        conv.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const SidebarContent = () => (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: isSidebarExpanded ? '20px' : '20px 0', alignItems: 'center' }}>
            <div style={{ width: '100%', padding: isSidebarExpanded ? '0 20px' : '0 18px' }}>
                <button onClick={toggleSidebar} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', width: '100%', justifyContent: isSidebarExpanded ? 'flex-start' : 'center', marginBottom: '20px' }}>
                    <img src={Panel1SVG} alt="Toggle Icon" style={{ width: '24px', height: '24px', marginRight: isSidebarExpanded ? '10px' : '0' }} />
                    {isSidebarExpanded && <span style={{ color: '#F9F9F9', fontFamily: 'Outfit, sans-serif', fontSize: '20px' }}>Clario</span>}
                </button>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button onClick={handleNewChat} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: isSidebarExpanded ? '#101010' : 'transparent', border: isSidebarExpanded ? '0.5px solid #F9F9F9' : 'none', borderRadius: '8px', padding: '10px 11px', cursor: 'pointer', justifyContent: 'center' }}>
                        <img src={Panel2SVG} alt="New Chat Icon" style={{ width: '24px', height: '24px', marginRight: isSidebarExpanded ? '10px' : '0' }} />
                        {isSidebarExpanded && <span style={{ flex: 1, textAlign: 'left', color: '#FFF', fontFamily: 'Outfit, sans-serif', fontSize: '16px' }}>New chat</span>}
                    </button>
                    <button onClick={handleShowHistory} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: isSidebarExpanded ? '#101010' : 'transparent', border: isSidebarExpanded ? '0.5px solid #F9F9F9' : 'none', borderRadius: '8px', padding: '10px 11px', cursor: 'pointer', justifyContent: 'center' }}>
                        <img src={Panel3SVG} alt="History Icon" style={{ width: '24px', height: '24px', marginRight: isSidebarExpanded ? '10px' : '0' }} />
                        {isSidebarExpanded && <span style={{ flex: 1, textAlign: 'left', color: '#FFF', fontFamily: 'Outfit, sans-serif', fontSize: '16px' }}>Chat history</span>}
                    </button>
                </div>
            </div>
            {isSidebarExpanded && (
                <div style={{ width: '100%', padding: '0 20px', marginTop: '20px', overflowY: 'auto', flex: 1 }}>
                    <span style={{ color: 'rgba(153, 153, 153, 0.88)', fontFamily: 'Outfit, sans-serif', fontSize: '12px' }}>Recent</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '10px' }}>
                        {conversations.slice(0, 7).map(conv => (
                            <button key={conv.id} onClick={() => handleSelectConversation(conv.id)} style={{ background: 'none', border: 'none', color: '#FFF', fontFamily: 'Outfit, sans-serif', fontSize: '16px', cursor: 'pointer', textAlign: 'left', width: '100%', padding: '8px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {conv.title}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <>
            <style>{`html,body,#root{margin:0;padding:0;height:100%;width:100%;background:#0E0E0E!important;overflow:hidden;}*{box-sizing:border-box;}`}</style>
            <div style={{ display: 'flex', position: 'fixed', inset: 0, background: '#0E0E0E' }}>
                <div style={{
                    width: isSidebarExpanded ? (isMobile ? '80%' : '250px') : '80px',
                    height: '100vh', background: '#1F1F1F', position: 'fixed',
                    left: 0, top: 0, display: 'flex', flexDirection: 'column',
                    transition: 'width 0.3s ease', zIndex: 1000,
                    borderRight: '1px solid #333',
                }}>
                    <SidebarContent />
                </div>

                <main style={{
                    marginLeft: isSidebarExpanded ? (isMobile ? '0' : '250px') : (isMobile ? '0' : '80px'),
                    flex: 1, display: 'flex', flexDirection: 'column',
                    transition: 'margin-left 0.3s ease', height: '100vh',
                }}>
                    {showChatHistory ? (
                        <div style={{ padding: '60px 20px 20px', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', overflowY: 'auto' }}>
                            <div style={{ width: '100%', maxWidth: '942px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                    <h1 style={{ color: '#F9F9F9', fontFamily: 'Outfit, sans-serif', fontSize: '32px' }}>Your chat history</h1>
                                    <button
                                        onClick={() => {
                                            handleNewChat();
                                            setShowChatHistory(false); // exit history view
                                        }}
                                        style={{
                                            background: '#F9F9F9',
                                            color: '#000',
                                            border: 'none',
                                            borderRadius: '8px',
                                            padding: '10px 20px',
                                            fontFamily: 'Poppins, sans-serif',
                                            cursor: 'pointer',
                                            fontSize: '15px'
                                        }}
                                    >
                                        + New chat
                                    </button>

                                </div>
                                <input
                                    type="text"
                                    placeholder="Search your chats"
                                    style={{ width: '100%', padding: '15px 20px', background: 'rgba(255, 255, 255, 0.10)', border: '1px solid #999', borderRadius: '10px', color: '#FFF', fontSize: '18px', marginBottom: '1rem', outline: 'none' }}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <p style={{ color: '#FFF', fontFamily: 'Poppins, sans-serif', fontSize: '14px', marginBottom: '2rem' }}>You have {filteredConversations.length} previous chats with Clario.</p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {filteredConversations.map(conv => (
                                        <button key={conv.id} onClick={() => handleSelectConversation(conv.id)} style={{ width: '100%', background: 'none', border: '0.5px solid #F9F9F9', borderRadius: '15px', padding: '20px', textAlign: 'left', cursor: 'pointer' }}>
                                            <span style={{ color: '#FFF', fontFamily: 'Outfit, sans-serif', fontSize: '18px' }}>{conv.title}</span>
                                            <span style={{ display: 'block', color: 'rgba(153, 153, 153, 0.88)', fontFamily: 'Outfit, sans-serif', fontSize: '12px', marginTop: '5px' }}>
                                                last message {formatTimeAgo(conv.updated_at)}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div ref={chatContainerRef} style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                                {messages.length === 0 && (
                                    <div style={{ textAlign: 'center', paddingTop: '20vh' }}>
                                        <h1 style={{ color: '#F9F9F9', fontFamily: 'Outfit, sans-serif', fontSize: '40px' }}>
                                            What’s on your mind, {userName}?
                                        </h1>
                                    </div>
                                )}
                                {messages.map((message) => (
                                    <div key={message.id} style={{ display: 'flex', justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start', margin: '10px 0' }}>
                                        <div style={{ background: message.role === 'user' ? '#2D2C2C' : '#1F1F1F', color: '#F9F9F9', padding: '10px 15px', borderRadius: '15px', maxWidth: '70%', fontFamily: 'Outfit, sans-serif', fontSize: '16px', wordWrap: 'break-word' }}>
                                            <ReactMarkdown>{message.content}</ReactMarkdown>
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div style={{ display: 'flex', justifyContent: 'flex-start', margin: '10px 0' }}>
                                        <div style={{ background: '#1F1F1F', color: '#F9F9F9', padding: '10px 15px', borderRadius: '15px' }}>...</div>
                                    </div>
                                )}
                            </div>
                            <div style={{ padding: '20px', maxWidth: '881px', margin: '0 auto', width: '100%' }}>
                                <div style={{ display: 'flex', alignItems: 'center', background: '#1F1F1F', borderRadius: '25px', border: '0.5px solid #F9F9F9', padding: '10px 20px', minHeight: '60px' }}>
                                    <textarea
                                        value={inputMessage}
                                        onChange={(e) => setInputMessage(e.target.value)}
                                        placeholder="Ask anything"
                                        style={{ flex: 1, background: 'transparent', border: 'none', color: '#F9F9F9', fontFamily: 'Outfit, sans-serif', fontSize: '18px', outline: 'none', resize: 'none', height: '24px' }}
                                        onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                                        rows={1}
                                        onInput={(e) => {
                                            e.target.style.height = 'auto';
                                            e.target.style.height = `${e.target.scrollHeight}px`;
                                        }}
                                    />
                                    <button onClick={handleSendMessage} disabled={!inputMessage.trim() || isLoading} style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: '10px' }}>
                                        <img src={ChatArrowSVG} alt="Send" style={{ width: '30px', height: '30px' }} />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </main>
            </div>
        </>
    );
};

export default Dashboard;