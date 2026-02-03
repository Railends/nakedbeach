import React, { useState, useEffect } from 'react'

export default function TradeUrlModal({ isOpen, onClose, user }) {
    const [tradeUrl, setTradeUrl] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        if (isOpen && user) {
            fetchTradeUrl()
        }
    }, [isOpen, user])

    const fetchTradeUrl = async () => {
        try {
            const res = await fetch('/api/trade-url', {
                credentials: 'include'
            })
            const data = await res.json()
            if (data.tradeUrl) {
                setTradeUrl(data.tradeUrl)
            }
        } catch (err) {
            console.error('Failed to fetch trade URL:', err)
        }
    }

    const handleSave = async () => {
        if (!tradeUrl || !tradeUrl.includes('steamcommunity.com/tradeoffer')) {
            setError('Please enter a valid Steam trade URL')
            return
        }

        setLoading(true)
        setError(null)

        try {
            const res = await fetch('/api/trade-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ tradeUrl })
            })

            const data = await res.json()

            if (data.success) {
                setSuccess(true)
                setTimeout(() => {
                    onClose()
                    setSuccess(false)
                }, 1500)
            } else {
                setError(data.error || 'Failed to save trade URL')
            }
        } catch (err) {
            setError('Network error. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 400,
            backdropFilter: 'blur(8px)'
        }}>
            <div className="card" style={{
                width: '90%',
                maxWidth: '600px',
                padding: '2rem',
                border: '1px solid #333'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontFamily: 'Rajdhani', fontSize: '1.8rem', margin: 0 }}>Steam Trade URL</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.5rem' }}>✕</button>
                </div>

                <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '8px' }}>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#93c5fd' }}>
                        <strong>Why do we need this?</strong><br />
                        Your trade URL allows our bot to send you winnings automatically. Without it, we can't send you items when you win!
                    </p>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-gray)' }}>
                        TRADE URL
                    </label>
                    <input
                        type="text"
                        value={tradeUrl}
                        onChange={(e) => setTradeUrl(e.target.value)}
                        placeholder="https://steamcommunity.com/tradeoffer/new/?partner=..."
                        style={{
                            width: '100%',
                            background: '#000',
                            border: '1px solid var(--border)',
                            borderRadius: '8px',
                            padding: '0.75rem',
                            color: 'white',
                            fontSize: '0.85rem',
                            fontFamily: 'monospace'
                        }}
                    />
                </div>

                <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--text-gray)' }}>
                    <strong style={{ color: 'white' }}>How to find your Trade URL:</strong>
                    <ol style={{ marginTop: '0.5rem', marginBottom: 0, paddingLeft: '1.5rem' }}>
                        <li>Go to <a href="https://steamcommunity.com/id/me/tradeoffers/privacy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--orange)' }}>Steam Trade Offers</a></li>
                        <li>Scroll down to "Third-Party Sites"</li>
                        <li>Copy your Trade URL</li>
                        <li>Paste it above</li>
                    </ol>
                </div>

                {error && (
                    <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#ef4444', fontSize: '0.85rem' }}>
                        {error}
                    </div>
                )}

                {success && (
                    <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', color: '#10b981', fontSize: '0.85rem' }}>
                        ✅ Trade URL saved successfully!
                    </div>
                )}

                <button
                    className="btn-primary"
                    onClick={handleSave}
                    disabled={loading || !tradeUrl}
                    style={{
                        width: '100%',
                        padding: '0.875rem',
                        fontSize: '1rem',
                        fontWeight: '700',
                        opacity: (loading || !tradeUrl) ? 0.5 : 1,
                        cursor: (loading || !tradeUrl) ? 'not-allowed' : 'pointer'
                    }}
                >
                    {loading ? 'SAVING...' : 'SAVE TRADE URL'}
                </button>
            </div>
        </div>
    )
}
