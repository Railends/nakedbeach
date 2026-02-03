import React from 'react'

export default function Header({ currentPot, onOpenFair, user, onLogin, onLogout, onOpenProfile, currentView, setCurrentView }) {
    return (
        <header className="header" style={{ position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(10px)', background: 'rgba(20, 20, 20, 0.8)' }}>
            <div className="header-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: 'none', padding: '0 3rem' }}>
                {/* Left Side: Logo Only */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '3rem' }}>
                    <div className="logo-section" style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                        <div className="logo-icon" style={{
                            width: '42px',
                            height: '42px',
                            background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.4rem',
                            fontWeight: '900',
                            color: 'white',
                            boxShadow: '0 0 15px rgba(249, 115, 22, 0.4)'
                        }}>RC</div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <h1 className="logo-text" style={{
                                fontFamily: 'Rajdhani',
                                fontSize: '1.6rem',
                                fontWeight: '800',
                                letterSpacing: '1.5px',
                                margin: 0,
                                lineHeight: 1,
                                background: 'linear-gradient(to right, #fff, #9ca3af)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}>RUSTYCOIN</h1>
                            <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: '800', letterSpacing: '2px', marginLeft: '2px' }}>V1.0.4 LIVE</span>
                        </div>
                    </div>
                </div>

                {/* Centered Navigation - Game Modes */}
                <nav style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', background: 'rgba(255,255,255,0.03)', padding: '0.6rem 2rem', borderRadius: '50px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    <div
                        onClick={() => setCurrentView('jackpot')}
                        style={{
                            color: currentView === 'jackpot' ? 'white' : 'var(--text-gray)',
                            fontWeight: '800',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            letterSpacing: '1px',
                            borderBottom: currentView === 'jackpot' ? '2px solid var(--orange)' : '2px solid transparent',
                            paddingBottom: '4px',
                            transition: 'all 0.2s'
                        }}
                    >
                        JACKPOT
                    </div>
                    <div
                        onClick={() => setCurrentView('coinflip')}
                        style={{
                            color: currentView === 'coinflip' ? 'white' : 'var(--text-gray)',
                            fontWeight: '800',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            letterSpacing: '1px',
                            borderBottom: currentView === 'coinflip' ? '2px solid var(--orange)' : '2px solid transparent',
                            paddingBottom: '4px',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        COINFLIP
                        <span style={{ fontSize: '0.65rem', background: '#3b82f6', color: 'white', padding: '1px 4px', borderRadius: '4px', fontWeight: '700' }}>NEW</span>
                    </div>
                    <div
                        onClick={() => setCurrentView('rps')}
                        style={{
                            color: currentView === 'rps' ? 'white' : 'var(--text-gray)',
                            fontWeight: '800',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            letterSpacing: '1px',
                            borderBottom: currentView === 'rps' ? '2px solid var(--orange)' : '2px solid transparent',
                            paddingBottom: '4px',
                            transition: 'all 0.2s'
                        }}
                    >
                        ROCK PAPER SCISSORS
                    </div>
                </nav>

                {/* Actions - Fair + Support + Profile */}
                <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    {/* Secondary Actions (Left of Profile) */}
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', paddingRight: '1.5rem', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
                        <button
                            onClick={onOpenFair}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--text-gray)',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                fontWeight: '600',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-gray)'}
                        >
                            PROVABLY FAIR
                            <div style={{ width: '6px', height: '6px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 5px #10b981' }}></div>
                        </button>
                        <a href="#support" style={{ color: 'var(--text-gray)', fontWeight: '600', fontSize: '0.85rem', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = 'white'} onMouseLeave={(e) => e.target.style.color = 'var(--text-gray)'}>SUPPORT</a>
                    </div>

                    {user && user.name ? (
                        <div
                            onClick={onOpenProfile}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1.25rem',
                                background: 'rgba(255,255,255,0.03)',
                                padding: '0.4rem 0.4rem 0.4rem 1.25rem',
                                borderRadius: '50px',
                                border: '1px solid rgba(255,255,255,0.05)',
                                cursor: 'pointer',
                                transition: 'background 0.2s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                        >
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#fff' }}>{user.name}</div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onLogout(); }}
                                    style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.7rem', cursor: 'pointer', padding: 0, fontWeight: '700' }}
                                >
                                    Log out
                                </button>
                            </div>
                            <img
                                src={user.avatar || 'https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg'}
                                alt="avatar"
                                style={{ width: '38px', height: '38px', borderRadius: '50%', border: '2px solid var(--orange)', padding: '2px', background: 'rgba(0,0,0,0.2)' }}
                            />
                        </div>
                    ) : (
                        <button
                            className="btn-primary"
                            onClick={onLogin}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.7rem 1.75rem',
                                borderRadius: '10px',
                                fontWeight: '800',
                                letterSpacing: '0.5px',
                                fontSize: '0.85rem'
                            }}
                        >
                            <img src="https://community.cloudflare.steamstatic.com/public/images/signinthroughsteam/sits_01.png" alt="Steam" style={{ height: '18px', filter: 'brightness(0) invert(1)' }} />
                            SIGN IN
                        </button>
                    )}
                </div>
            </div>
        </header>
    )
}
