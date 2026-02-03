import React, { useState } from 'react'

export default function HistorySidebar({ history = [], onVerify }) {
    const [showAllHistory, setShowAllHistory] = useState(false)
    const [selectedRound, setSelectedRound] = useState(null)

    return (
        <div className="card" style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--border)', background: 'rgba(15, 15, 20, 0.95)' }}>
            <div style={{
                padding: '1rem 1.25rem',
                borderBottom: '1px solid var(--border)',
                background: 'rgba(255,255,255,0.02)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
            }}>
                <span style={{ fontSize: '1.1rem' }}>📜</span>
                <span style={{
                    fontSize: '0.9rem',
                    fontWeight: '800',
                    fontFamily: 'Rajdhani',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    color: '#e5e7eb'
                }}>Recent History</span>
            </div>

            <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }} className="custom-scroll">
                {history.length === 0 ? (
                    <div style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '1rem', opacity: 0.2 }}>📜</div>
                        <div>No rounds recorded yet.</div>
                    </div>
                ) : (
                    history.slice(0, 30).map((item, i) => (
                        <div key={item.id || i} style={{
                            padding: '1.25rem 1.5rem',
                            borderBottom: '1px solid rgba(255,255,255,0.02)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            transition: 'all 0.2s',
                            cursor: 'pointer',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                            onClick={() => setSelectedRound(item)}
                            onMouseEnter={e => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                                e.currentTarget.style.paddingLeft = '1.75rem';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.paddingLeft = '1.5rem';
                            }}
                        >
                            <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '8px',
                                background: 'white',
                                color: 'var(--bg-dark)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1rem',
                                fontWeight: '900',
                                flexShrink: 0,
                                boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                            }}>
                                {item.avatar && item.avatar.startsWith('http') ? (
                                    <img src={item.avatar} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '8px' }} />
                                ) : (
                                    item.avatar
                                )}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                    <span style={{ fontSize: '0.9rem', fontWeight: '800', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'Rajdhani' }}>{item.winner}</span>
                                    <span style={{ fontSize: '0.9rem', fontWeight: '900', color: 'var(--orange)', fontFamily: 'Rajdhani' }}>${item.amount.toFixed(2)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: '600' }}>{item.time}</span>
                                    <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: '800', textTransform: 'uppercase' }}>{item.chance.toFixed(1)}% WIN</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {history.length > 5 && (
                <button
                    onClick={() => setShowAllHistory(true)}
                    style={{
                        width: '100%',
                        padding: '1rem',
                        background: 'rgba(0,0,0,0.2)',
                        border: 'none',
                        color: '#9ca3af',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => { e.target.style.background = 'rgba(255,255,255,0.05)'; e.target.style.color = 'white'; }}
                    onMouseLeave={e => { e.target.style.background = 'rgba(0,0,0,0.2)'; e.target.style.color = '#9ca3af'; }}
                >
                    View Full History ({history.length}) →
                </button>
            )}

            {/* ROUND DETAIL MODAL */}
            {selectedRound && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    background: 'rgba(0,0,0,0.95)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2000,
                    backdropFilter: 'blur(10px)',
                    padding: '2rem'
                }}>
                    <div className="card" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', border: '1px solid var(--border)', background: '#0f0f14' }}>
                        <div style={{
                            padding: '1.5rem 2rem',
                            borderBottom: '1px solid var(--border)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: 'rgba(255,255,255,0.02)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '8px',
                                    background: 'white',
                                    color: '#0f0f14',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.5rem',
                                    fontWeight: 'bold'
                                }}>
                                    {selectedRound.avatar && selectedRound.avatar.startsWith('http') ? (
                                        <img src={selectedRound.avatar} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '8px' }} />
                                    ) : (
                                        selectedRound.avatar
                                    )}
                                </div>
                                <div>
                                    <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800' }}>{selectedRound.winner}'s Win</h2>
                                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Won ${selectedRound.amount.toFixed(2)} with {selectedRound.chance.toFixed(2)}%</div>
                                </div>
                            </div>
                            <button onClick={() => setSelectedRound(null)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                        </div>

                        <div style={{ overflowY: 'auto', padding: '1.5rem 2rem' }}>
                            {/* Fairness Section */}
                            <div style={{ marginBottom: '2rem' }}>
                                <h3 style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--orange)', marginBottom: '1rem', letterSpacing: '1px' }}>Provably Fair Data</h3>
                                <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ marginBottom: '0.75rem' }}>
                                        <div style={{ fontSize: '0.65rem', color: '#4b5563', marginBottom: '2px' }}>SERVER SEED</div>
                                        <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontFamily: 'monospace', wordBreak: 'break-all' }}>{selectedRound.fairData?.serverSeed}</div>
                                    </div>
                                    <div style={{ marginBottom: '0.75rem' }}>
                                        <div style={{ fontSize: '0.65rem', color: '#4b5563', marginBottom: '2px' }}>RANDOM.ORG SEED</div>
                                        <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontFamily: 'monospace' }}>{selectedRound.fairData?.randomSeed}</div>
                                    </div>
                                    <div style={{ marginTop: '1rem' }}>
                                        <button
                                            onClick={() => {
                                                if (onVerify) {
                                                    onVerify({
                                                        serverSeed: selectedRound.fairData.serverSeed,
                                                        randomSeed: selectedRound.fairData.randomSeed
                                                    });
                                                    setSelectedRound(null);
                                                }
                                            }}
                                            style={{
                                                width: '100%',
                                                padding: '0.6rem',
                                                background: 'rgba(249, 115, 22, 0.1)',
                                                border: '1px solid var(--orange)',
                                                borderRadius: '6px',
                                                color: 'var(--orange)',
                                                fontSize: '0.7rem',
                                                fontWeight: '800',
                                                cursor: 'pointer',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px'
                                            }}
                                            onMouseEnter={e => { e.currentTarget.style.background = 'var(--orange)'; e.currentTarget.style.color = 'white'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(249, 115, 22, 0.1)'; e.currentTarget.style.color = 'var(--orange)'; }}
                                        >
                                            Verify on Provably Fair
                                        </button>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.65rem', color: '#4b5563', marginBottom: '2px' }}>WINNING TICKET</div>
                                        <div style={{ fontSize: '1.1rem', color: '#fbbf24', fontWeight: '800', fontFamily: 'monospace' }}>{selectedRound.fairData?.winningTicket.toFixed(10)}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Items Section */}
                            <div>
                                <h3 style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--orange)', marginBottom: '1rem', letterSpacing: '1px' }}>Winning Pot ({selectedRound.items?.length || 0} items)</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '0.75rem' }}>
                                    {selectedRound.items?.map((item, idx) => (
                                        <div key={idx} style={{
                                            background: 'rgba(255,255,255,0.03)',
                                            borderRadius: '8px',
                                            padding: '0.5rem',
                                            textAlign: 'center',
                                            border: '1px solid rgba(255,255,255,0.05)',
                                            position: 'relative'
                                        }}>
                                            <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{item.icon || '📦'}</div>
                                            <div style={{ fontSize: '0.65rem', color: 'var(--gold)', fontWeight: 'bold' }}>${item.price.toFixed(2)}</div>
                                            <div style={{ fontSize: '0.5rem', color: '#4b5563', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* FULL HISTORY MODAL */}
            {showAllHistory && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    background: 'rgba(0,0,0,0.95)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    backdropFilter: 'blur(10px)',
                    padding: '2rem'
                }}>
                    <div className="card" style={{ width: '100%', maxWidth: '900px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', border: '1px solid var(--border)', background: '#0f0f14' }}>
                        <div style={{
                            padding: '1.5rem 2rem',
                            borderBottom: '1px solid var(--border)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: 'rgba(255,255,255,0.02)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <span style={{ fontSize: '1.5rem' }}>🏆</span>
                                <div>
                                    <h2 style={{ margin: 0, fontSize: '1.25rem', fontFamily: 'Rajdhani', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Global History</h2>
                                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Showing last {history.length} matches</div>
                                </div>
                            </div>
                            <button onClick={() => setShowAllHistory(false)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                        </div>

                        <div style={{ overflowY: 'auto', padding: '0' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)' }}>
                                        <th style={{ padding: '1rem 2rem', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: '#4b5563', letterSpacing: '1px' }}>Winner</th>
                                        <th style={{ padding: '1rem 2rem', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: '#4b5563', letterSpacing: '1px' }}>Pot Value</th>
                                        <th style={{ padding: '1rem 2rem', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: '#4b5563', letterSpacing: '1px' }}>Win Chance</th>
                                        <th style={{ padding: '1rem 2rem', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: '#4b5563', letterSpacing: '1px' }}>Verification</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.map((item, i) => (
                                        <tr
                                            key={i}
                                            style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', transition: 'background 0.2s', cursor: 'pointer' }}
                                            onClick={() => {
                                                setSelectedRound(item);
                                                setShowAllHistory(false);
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.01)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <td style={{ padding: '1rem 2rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <div style={{ width: '32px', height: '32px', borderRadius: '4px', background: 'white', color: '#0f0f14', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                                        {item.avatar && item.avatar.startsWith('http') ? <img src={item.avatar} style={{ width: '100%', height: '100%', borderRadius: '4px' }} /> : item.avatar}
                                                    </div>
                                                    <span style={{ fontSize: '0.9rem', fontWeight: '700' }}>{item.winner}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem 2rem' }}>
                                                <span style={{ color: 'var(--orange)', fontWeight: '800' }}>${item.amount.toFixed(2)}</span>
                                            </td>
                                            <td style={{ padding: '1rem 2rem' }}>
                                                <span style={{ color: '#10b981', fontWeight: '700' }}>{item.chance.toFixed(2)}%</span>
                                            </td>
                                            <td style={{ padding: '1rem 2rem' }}>
                                                {item.fairData ? (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                        <div style={{ fontSize: '0.65rem', color: '#4b5563', fontFamily: 'monospace' }}>Ticket: <span style={{ color: '#fbbf24' }}>{item.fairData.winningTicket.toFixed(8)}</span></div>
                                                        <div style={{ fontSize: '0.65rem', color: '#4b5563', fontFamily: 'monospace' }}>Hash: {item.fairData.serverHash.substring(0, 12)}...</div>
                                                    </div>
                                                ) : (
                                                    <span style={{ color: '#374151', fontSize: '0.75rem' }}>Pre-Fairness</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
