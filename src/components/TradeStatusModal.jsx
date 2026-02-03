import React, { useState, useEffect } from 'react'

export default function TradeStatusModal({ isOpen, onClose, offerId, type = 'deposit' }) {
    const [status, setStatus] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (isOpen && offerId) {
            pollStatus()
            const interval = setInterval(pollStatus, 5000) // Poll every 5 seconds
            return () => clearInterval(interval)
        }
    }, [isOpen, offerId])

    const pollStatus = async () => {
        try {
            const res = await fetch(`/api/${type}/status/${offerId}`, {
                credentials: 'include'
            })
            const data = await res.json()

            if (data.error) {
                setError(data.error)
                setLoading(false)
                return
            }

            setStatus(data)
            setLoading(false)

            // Auto-close if accepted
            if (data.status === 'accepted') {
                setTimeout(() => {
                    onClose()
                }, 3000)
            }
        } catch (err) {
            setError('Failed to check trade status')
            setLoading(false)
        }
    }

    if (!isOpen) return null

    const getStatusIcon = () => {
        if (loading) return '⏳'
        if (error) return '❌'
        if (status?.status === 'accepted') return '✅'
        if (status?.status === 'pending') return '⏳'
        if (status?.status === 'failed') return '❌'
        return '📦'
    }

    const getStatusText = () => {
        if (loading) return 'Checking status...'
        if (error) return error
        if (status?.status === 'accepted') return type === 'deposit' ? 'Deposit accepted! Items received.' : 'Withdrawal accepted! Check your Steam.'
        if (status?.status === 'pending') return type === 'deposit' ? 'Waiting for you to accept the trade offer...' : 'Withdrawal sent! Accept it in Steam.'
        if (status?.status === 'failed') return 'Trade failed. Please try again.'
        return 'Processing...'
    }

    const getStatusColor = () => {
        if (status?.status === 'accepted') return '#10b981'
        if (status?.status === 'failed' || error) return '#ef4444'
        return '#f97316'
    }

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
            zIndex: 500,
            backdropFilter: 'blur(8px)'
        }}>
            <div className="card" style={{
                width: '90%',
                maxWidth: '500px',
                padding: '2rem',
                border: '1px solid #333',
                textAlign: 'center'
            }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
                    {getStatusIcon()}
                </div>

                <h2 style={{ fontFamily: 'Rajdhani', fontSize: '1.8rem', marginBottom: '1rem', color: getStatusColor() }}>
                    {type === 'deposit' ? 'Deposit Status' : 'Withdrawal Status'}
                </h2>

                <p style={{ fontSize: '1rem', color: 'var(--text-gray)', marginBottom: '1.5rem' }}>
                    {getStatusText()}
                </p>

                {status?.status === 'pending' && (
                    <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(249, 115, 22, 0.1)', border: '1px solid rgba(249, 115, 22, 0.3)', borderRadius: '8px' }}>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#fb923c' }}>
                            <strong>Action Required:</strong><br />
                            Open Steam and accept the trade offer to continue.
                        </p>
                        <a
                            href="https://steamcommunity.com/my/tradeoffers"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ display: 'inline-block', marginTop: '0.75rem', padding: '0.5rem 1rem', background: 'var(--orange)', color: 'white', borderRadius: '6px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '700' }}
                        >
                            OPEN STEAM TRADES
                        </a>
                    </div>
                )}

                {status?.items && (
                    <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                        <h3 style={{ fontSize: '0.9rem', color: 'var(--text-gray)', marginBottom: '0.5rem' }}>ITEMS ({status.items.length})</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '0.5rem' }}>
                            {status.items.slice(0, 6).map((item, idx) => (
                                <div key={idx} style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{item.icon || '📦'}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-gray)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                                </div>
                            ))}
                            {status.items.length > 6 && (
                                <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: 'var(--text-gray)' }}>
                                    +{status.items.length - 6}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <button
                    className="btn-primary"
                    onClick={onClose}
                    style={{ width: '100%', padding: '0.875rem' }}
                >
                    {status?.status === 'accepted' ? 'CONTINUE' : 'CLOSE'}
                </button>
            </div>
        </div>
    )
}
