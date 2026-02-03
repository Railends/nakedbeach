import React, { useState, useRef, useEffect } from 'react'

export default function ChatSidebar({ user }) {
    const [messages, setMessages] = useState([
        { user: 'DimaxXl', text: 'is suda can withdraw', time: '12:45', avatar: 'D', role: 'LEGEND', color: '#fbbf24' },
        { user: 'スターピー', text: 'ye', time: '12:46', avatar: 'S', role: 'VETERAN', color: '#9ca3af' },
        { user: 'Duke', text: "It's okay my payout is once a month", time: '12:47', avatar: 'D', role: 'MEMBER', color: '#6b7280' },
        { user: 'Vladimir', text: 'ye why', time: '12:48', avatar: 'V', role: 'ADMIN', color: '#ef4444' },
        { user: 'Duke', text: 'So i boom really matter', time: '12:49', avatar: 'D', role: 'MEMBER', color: '#6b7280' },
        { user: 'スターピー', text: 'join jackpot guys, its getting hot!', time: '12:50', avatar: 'S', role: 'VETERAN', color: '#9ca3af' },
        { user: 'casper', text: 'put 01 dollar bot i will join', time: '12:52', avatar: 'C', role: 'MEMBER', color: '#6b7280' },
    ])

    const [inputText, setInputText] = useState('')
    const chatContainerRef = useRef(null)

    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
        }
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSendMessage = (e) => {
        if (e) e.preventDefault()
        if (!inputText.trim() || !user) return

        const now = new Date()
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

        const newMessage = {
            user: user.name,
            text: inputText,
            time: timeStr,
            avatar: user.avatar || user.name[0].toUpperCase(),
            role: 'MEMBER',
            color: '#3b82f6' // Default member blue for user
        }

        setMessages([...messages, newMessage])
        setInputText('')
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage()
        }
    }

    return (
        <div className="card" style={{
            height: 'calc(100vh - 120px)',
            maxHeight: '800px',
            display: 'flex',
            flexDirection: 'column',
            padding: '0',
            border: '1px solid var(--border)',
            background: 'rgba(15, 15, 20, 0.95)',
            backdropFilter: 'blur(10px)',
            overflow: 'hidden'
        }}>
            {/* Header */}
            <div style={{
                padding: '1rem 1.25rem',
                borderBottom: '1px solid var(--border)',
                background: 'rgba(0,0,0,0.2)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ position: 'relative' }}>
                        <div style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', position: 'absolute', top: '-1px', right: '-1px', border: '2px solid #0f0f14', boxShadow: '0 0 5px #10b981' }}></div>
                        <span style={{ fontSize: '1.2rem' }}>💬</span>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: '800', fontFamily: 'Rajdhani', letterSpacing: '1px', textTransform: 'uppercase' }}>Public Chat</div>
                        <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: '600' }}>1,248 Online</div>
                    </div>
                </div>
                <button style={{ background: 'none', border: 'none', color: '#4b5563', cursor: 'pointer', fontSize: '1.2rem', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = 'white'} onMouseLeave={e => e.target.style.color = '#4b5563'}>
                    ⚙️
                </button>
            </div>

            {/* Messages Area */}
            <div
                ref={chatContainerRef}
                className="custom-scroll"
                style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.25rem'
                }}>
                {messages.map((msg, i) => (
                    <div key={i} style={{ display: 'flex', gap: '1rem', animation: 'pop-in 0.3s ease-out forwards' }}>
                        <div style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '10px',
                            background: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1rem',
                            fontWeight: '900',
                            color: msg.color,
                            border: `2px solid ${msg.color}44`,
                            flexShrink: 0,
                            overflow: 'hidden',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                        }}>
                            {msg.avatar && msg.avatar.startsWith('http') ? (
                                <img src={msg.avatar} alt={msg.user} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : msg.avatar}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                                <span style={{
                                    fontSize: '0.6rem',
                                    fontWeight: '900',
                                    padding: '2px 6px',
                                    borderRadius: '5px',
                                    background: `${msg.color}22`,
                                    color: msg.color,
                                    border: `1px solid ${msg.color}44`,
                                    letterSpacing: '0.5px'
                                }}>{msg.role}</span>
                                <span style={{ fontSize: '0.9rem', fontWeight: '800', color: '#fff', fontFamily: 'Rajdhani', letterSpacing: '0.5px' }}>{msg.user}</span>
                                <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginLeft: 'auto', fontWeight: '600' }}>{msg.time}</span>
                            </div>
                            <div style={{
                                fontSize: '0.875rem',
                                color: 'rgba(255,255,255,0.7)',
                                lineHeight: '1.5',
                                background: 'rgba(255,255,255,0.02)',
                                padding: '0.6rem 0.9rem',
                                borderRadius: '0 12px 12px 12px',
                                border: '1px solid rgba(255,255,255,0.03)',
                                wordBreak: 'break-word'
                            }}>
                                {msg.text}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Input Area */}
            <div style={{ padding: '1.25rem', borderTop: '1px solid var(--border)', background: 'rgba(0,0,0,0.1)' }}>
                <div style={{ position: 'relative' }}>
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={user ? "Type a message..." : "Sign in to chat"}
                        style={{
                            width: '100%',
                            background: '#0a0a0f',
                            border: '1px solid #1f2937',
                            borderRadius: '10px',
                            padding: '0.8rem 1rem',
                            paddingRight: '3.5rem',
                            color: 'white',
                            fontSize: '0.85rem',
                            outline: 'none',
                            transition: 'border-color 0.2s',
                            cursor: user ? 'text' : 'not-allowed'
                        }}
                        disabled={!user}
                        onFocus={e => e.target.style.borderColor = 'var(--orange)'}
                        onBlur={e => e.target.style.borderColor = '#1f2937'}
                    />
                    <button
                        onClick={handleSendMessage}
                        style={{
                            position: 'absolute',
                            right: '8px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            fontSize: '1.2rem',
                            cursor: user ? 'pointer' : 'not-allowed',
                            filter: user ? 'none' : 'grayscale(1)',
                            padding: '5px',
                            transition: 'transform 0.1s'
                        }}
                        onMouseDown={e => e.currentTarget.style.transform = 'translateY(-50%) scale(0.9)'}
                        onMouseUp={e => e.currentTarget.style.transform = 'translateY(-50%) scale(1)'}
                    >
                        ✈️
                    </button>
                </div>
                {!user && (
                    <div style={{ fontSize: '0.65rem', color: 'var(--orange)', marginTop: '0.5rem', textAlign: 'center', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Authentication Required
                    </div>
                )}
            </div>
        </div>
    )
}
