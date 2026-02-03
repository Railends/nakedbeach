import React from 'react'

export default function ProfileModal({ isOpen, onClose, user, stats }) {
    if (!isOpen || !user) return null;

    const winRate = stats.totalMatches > 0
        ? ((stats.totalWins / stats.totalMatches) * 100).toFixed(1)
        : '0.0';

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
            zIndex: 2000,
            backdropFilter: 'blur(15px)',
            padding: '2rem'
        }}>
            <div className="card" style={{
                width: '100%',
                maxWidth: '500px',
                background: 'var(--bg-dark)',
                border: '1px solid var(--border)',
                padding: '0',
                overflow: 'hidden',
                animation: 'pop-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}>
                {/* Header / Banner */}
                <div style={{
                    height: '120px',
                    background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                    position: 'relative'
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            position: 'absolute',
                            top: '1rem',
                            right: '1rem',
                            background: 'rgba(0,0,0,0.2)',
                            border: 'none',
                            color: 'white',
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            zIndex: 10
                        }}
                    >✕</button>

                    {/* Avatar Overlap */}
                    <div style={{
                        position: 'absolute',
                        bottom: '-40px',
                        left: '2rem',
                        width: '100px',
                        height: '100px',
                        borderRadius: '20px',
                        border: '5px solid var(--bg-dark)',
                        background: 'white',
                        overflow: 'hidden',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                    }}>
                        <img src={user.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                </div>

                <div style={{ padding: '50px 2rem 2rem 2rem' }}>
                    <div style={{ marginBottom: '2rem' }}>
                        <h2 style={{
                            margin: 0,
                            fontSize: '1.75rem',
                            fontFamily: 'Rajdhani',
                            fontWeight: '900',
                            letterSpacing: '1px'
                        }}>{user.name}</h2>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-gray)', fontWeight: '600' }}>STEAM ID: {user.steamid}</div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '1px' }}>Total Matches</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'white' }}>{stats.totalMatches}</div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '1px' }}>Total Wins</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--success)' }}>{stats.totalWins}</div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '1px' }}>Win Rate</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--accent)' }}>{winRate}%</div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '1px' }}>Best Win</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--gold)' }}>${stats.bestWin.toFixed(2)}</div>
                        </div>
                    </div>

                    <div style={{ marginTop: '1.5rem', background: 'rgba(249, 115, 22, 0.05)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(249, 115, 22, 0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-gray)', fontWeight: '700' }}>Total Wagered:</span>
                            <span style={{ fontSize: '0.9rem', color: 'white', fontWeight: '900' }}>${stats.totalWagered.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-gray)', fontWeight: '700' }}>Total Won:</span>
                            <span style={{ fontSize: '0.9rem', color: '#10b981', fontWeight: '900' }}>${stats.totalWon.toFixed(2)}</span>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="btn-primary"
                        style={{
                            width: '100%',
                            marginTop: '2rem',
                            padding: '1rem',
                            fontSize: '1rem',
                            borderRadius: '10px'
                        }}
                    >CLOSE PROFILE</button>

                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                        <a href="https://steamcommunity.com/" target="_blank" rel="noreferrer" style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textDecoration: 'none', fontWeight: '600' }}>VIEW ON STEAM ↗</a>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes pop-in {
                    0% { transform: scale(0.9); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    )
}
