import React, { useState, useEffect, useRef } from 'react'
import Chance from 'chance'

export default function JackpotDisplay({ currentPot, totalItems, maxItems, participants, depositedItems, onAddItem, onReset, onAddHistory, fairData, onOpenInventory, user }) {
    const [timeLeft, setTimeLeft] = useState(120) // 2 minutes
    const [isSpinning, setIsSpinning] = useState(false)
    const [winner, setWinner] = useState(null)
    const [showWinner, setShowWinner] = useState(false)
    const [spinTranslate, setSpinTranslate] = useState(0)
    const [lockedParticipants, setLockedParticipants] = useState([]) // Snapshot for visual stability
    const [copied, setCopied] = useState(false)
    const spinnerRef = useRef(null)

    const handleCopyHash = () => {
        if (!fairData?.serverHash) return
        navigator.clipboard.writeText(fairData.serverHash)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const startSpin = (force = false) => {
        // Snapshot current state to prevent desync if parent updates during the 5s spin
        const pSnapshot = [...participants];
        const itemsSnapshot = [...depositedItems];
        const potSnapshot = currentPot;
        const fairSnapshot = { ...fairData };

        if ((!force && pSnapshot.length < 2) || pSnapshot.length < 1 || isSpinning || showWinner) return;

        // --- PROVABLY FAIR WINNER SELECTION ---
        const randomSeedFromThirdParty = Math.random().toString(36).substring(2, 11) // Simulated Random.org
        const combinedSeed = `${fairSnapshot.serverSeed}-${randomSeedFromThirdParty}`
        const chanceInstance = new Chance(combinedSeed)
        const winningTicket = chanceInstance.floating({ min: 0, max: 1, fixed: 8 })

        let cumulativeChance = 0
        let selectedWinner = pSnapshot[0]

        for (let i = 0; i < pSnapshot.length; i++) {
            const p = pSnapshot[i]
            const playerRange = p.chance / 100

            // Precise boundary check: [cumulative, cumulative + range)
            if (i === pSnapshot.length - 1 || (winningTicket >= cumulativeChance && winningTicket < (cumulativeChance + playerRange))) {
                selectedWinner = p
                break
            }
            cumulativeChance += playerRange
        }

        // --- CALCULATE PRECISE OFFSET (Supports Variable Widths) ---
        const calcIterationWidth = (plist) => plist.reduce((sum, p) => sum + Math.max(p.chance * 10, 50), 0)
        const iterationWidth = calcIterationWidth(pSnapshot)
        const landingIteration = 10

        // Measured container width
        const containerWidth = spinnerRef.current?.offsetWidth || 800
        const centerPos = containerWidth / 2

        // Find exact pixel where ticket lands in the sequence
        let ticketPixelOffset = 0
        let offsetCumulativeChance = 0
        for (const p of pSnapshot) {
            const barWidth = Math.max(p.chance * 10, 50)
            const playerRange = p.chance / 100
            if (winningTicket >= offsetCumulativeChance && winningTicket < (offsetCumulativeChance + playerRange)) {
                // Find where in this specific bar the ticket lands
                const relativePos = (winningTicket - offsetCumulativeChance) / playerRange
                ticketPixelOffset += (relativePos * barWidth)
                break
            }
            ticketPixelOffset += barWidth
            offsetCumulativeChance += playerRange
        }

        const finalOffset = (landingIteration * iterationWidth) + ticketPixelOffset - centerPos

        setLockedParticipants(pSnapshot)
        setWinner({ ...selectedWinner, amountWon: potSnapshot })
        setSpinTranslate(0)
        setIsSpinning(true)

        // Delay to allow DOM update for Translate(0) before starting transition
        setTimeout(() => {
            setSpinTranslate(finalOffset)
        }, 50)

        // After 8 seconds of spinning (baity), show winner
        setTimeout(() => {
            setIsSpinning(false)
            setShowWinner(true)
            setSpinTranslate(0)

            if (onAddHistory) {
                onAddHistory({
                    winner: selectedWinner.name,
                    amount: potSnapshot,
                    chance: selectedWinner.chance,
                    avatar: selectedWinner.avatar,
                    items: itemsSnapshot,
                    fairData: {
                        ...fairSnapshot,
                        randomSeed: randomSeedFromThirdParty,
                        winningTicket
                    }
                })
            }

            setTimeout(() => {
                setShowWinner(false)
                setWinner(null)
                setLockedParticipants([])
                if (onReset) onReset()
            }, 6000)
        }, 8000)

        setTimeLeft(120)
    }

    // Timer countdown
    useEffect(() => {
        if (participants.length < 2 || isSpinning || showWinner) {
            if (participants.length < 2) setTimeLeft(120)
            return
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer)
                    startSpin()
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [participants, isSpinning, showWinner])

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const handleDemoDeposit = () => {
        const demoBotIcons = ['🤖', '🎮', '🕹️', '👽', '👾', '🎃', '💀', '🔥', '⚡', '🌟'];
        const demoItems = [
            { name: 'AK-47 | Alien Red', price: 185.00, icon: '🔫' },
            { name: 'Metal Facemask | Glowing Skull', price: 92.00, icon: '🛡️' },
            { name: 'Metal Chest Plate | Big Grin', price: 850.00, icon: '👕' },
            { name: 'Bolt Action | Tempered', price: 42.00, icon: '🎯' },
            { name: 'LR-300 | Victoria', price: 65.00, icon: '🔫' }
        ]
        const randomItem = demoItems[Math.floor(Math.random() * demoItems.length)]
        const randomBot = {
            ...randomItem,
            owner: 'Bot_' + Math.floor(Math.random() * 1000),
            avatar: demoBotIcons[Math.floor(Math.random() * demoBotIcons.length)]
        }
        onAddItem(randomBot)
    }

    const handleForceSpin = () => {
        if (participants.length >= 1) {
            startSpin(true)
        }
    }

    const itemProgress = Math.min((totalItems / maxItems) * 100, 100);

    return (
        <div className="card" style={{ padding: '0', background: 'var(--bg-dark)', border: '1px solid var(--border)', overflow: 'hidden', minWidth: 0, width: '100%', boxSizing: 'border-box' }}>
            {/* Upper Info Bar */}
            <div style={{
                background: 'rgba(0,0,0,0.3)',
                padding: '1rem 1.5rem',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '12px', height: '12px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 10px #10b981' }}></div>
                    <span style={{ fontSize: '0.75rem', fontWeight: '900', color: '#10b981', letterSpacing: '1px', textTransform: 'uppercase' }}>Round Active</span>
                </div>
                <div
                    onClick={handleCopyHash}
                    style={{
                        fontFamily: 'Rajdhani',
                        fontSize: '0.75rem',
                        color: 'var(--text-gray)',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        cursor: 'pointer',
                        background: 'rgba(255,255,255,0.02)',
                        padding: '0.3rem 0.75rem',
                        borderRadius: '6px',
                        border: '1px solid rgba(255,255,255,0.05)',
                        transition: 'all 0.2s',
                        position: 'relative'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; }}
                >
                    <span style={{ whiteSpace: 'nowrap' }}># ROUND HASH:</span>
                    <span style={{
                        color: copied ? '#10b981' : 'var(--gold)',
                        letterSpacing: '0.5px',
                        fontFamily: 'monospace',
                        wordBreak: 'break-all',
                        maxWidth: '300px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    }}>
                        {copied ? 'COPIED TO CLIPBOARD!' : fairData?.serverHash}
                    </span>
                    {!copied && <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>📋</span>}
                </div>
            </div>

            {/* Jackpot Main Hero Area */}
            <div style={{
                padding: '1.5rem 1rem',
                textAlign: 'center',
                background: 'radial-gradient(circle at center, rgba(249, 115, 22, 0.05) 0%, transparent 70%)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem'
            }}>
                {/* Mini Item Icons Feed - Sleek Slider Design */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '1.5rem',
                    marginBottom: '1.25rem',
                    maxWidth: '100%',
                    maxWidth: '900px',
                    width: '100%',
                    minHeight: '40px',
                    overflowX: 'auto',
                    padding: '0 1rem 0.5rem 1rem',
                }} className="custom-scroll">
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                        {(() => {
                            const groups = [];
                            depositedItems.slice(-15).forEach(item => {
                                if (groups.length > 0 && groups[groups.length - 1].owner === item.owner) {
                                    groups[groups.length - 1].items.push(item);
                                } else {
                                    groups.push({ owner: item.owner, items: [item] });
                                }
                            });

                            return groups.map((group, gIdx) => {
                                const owner = participants.find(p => p.name === group.owner);
                                const themeColor = owner ? owner.color : 'var(--orange)';
                                return (
                                    <div key={gIdx} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        animation: 'pop-in 0.3s ease-out forwards'
                                    }}>
                                        {/* Player Avatar with pulse indicator */}
                                        <div style={{ position: 'relative' }}>
                                            <div style={{
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: '50%',
                                                background: themeColor,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '0.8rem',
                                                fontWeight: '900',
                                                color: 'white',
                                                border: '2px solid rgba(255,255,255,0.1)',
                                                boxShadow: `0 0 10px ${themeColor}44`
                                            }}>
                                                {owner && owner.avatar && owner.avatar.startsWith('http') ? (
                                                    <img src={owner.avatar} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                                                ) : (
                                                    owner ? owner.avatar : group.owner[0]
                                                )}
                                            </div>
                                        </div>

                                        {/* Items icons flowing out */}
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            {group.items.map((item, iIdx) => (
                                                <div key={iIdx} style={{
                                                    fontSize: '1.2rem',
                                                    width: '28px',
                                                    height: '28px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    background: 'rgba(255,255,255,0.02)',
                                                    borderRadius: '6px',
                                                    position: 'relative',
                                                    borderBottom: `2px solid ${themeColor}aa`
                                                }} title={`${item.name} ($${item.price.toFixed(2)})`}>
                                                    {item.icon || '📦'}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            });
                        })()}
                    </div>
                </div>

                <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--orange)', fontWeight: '900', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Current Jackpot</div>
                    <div style={{
                        fontSize: '4rem',
                        fontWeight: '900',
                        color: 'white',
                        fontFamily: 'Rajdhani',
                        lineHeight: '1',
                        textShadow: '0 0 40px rgba(249, 115, 22, 0.3)'
                    }}>$ {currentPot?.toFixed(2) || '0.00'}</div>
                </div>

                {/* Stats Pill */}
                <div style={{ display: 'inline-flex', gap: '2rem', background: 'rgba(255,255,255,0.03)', padding: '0.75rem 2rem', borderRadius: '50px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: 'var(--text-gray)', fontSize: '0.8rem', fontWeight: '600' }}>ITEMS:</span>
                        <span style={{ color: 'white', fontSize: '0.9rem', fontWeight: '800' }}>{totalItems} / {maxItems}</span>
                    </div>
                    <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: 'var(--text-gray)', fontSize: '0.8rem', fontWeight: '600' }}>TIME:</span>
                        <span style={{ color: 'white', fontSize: '0.9rem', fontWeight: '800', fontFamily: 'monospace' }}>{formatTime(timeLeft)}</span>
                    </div>
                </div>
            </div>

            {/* Item Progress Bar */}
            <div style={{ height: '4px', background: 'rgba(255,255,255,0.03)', width: '100%', position: 'relative' }}>
                <div style={{
                    height: '100%',
                    background: 'linear-gradient(to right, #f97316, #ea580c)',
                    width: `${itemProgress}%`,
                    transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 0 10px rgba(249, 115, 22, 0.5)'
                }}></div>
            </div>

            {/* Spinner Area */}
            <div ref={spinnerRef} style={{ position: 'relative', height: '180px', width: '100%', maxWidth: '100%', background: '#0a0a0f', overflow: 'hidden', borderBottom: '1px solid var(--border)', borderTop: '1px solid var(--border)' }}>
                {showWinner ? (
                    <div style={{
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        animation: 'pop-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                    }}>
                        <div style={{
                            background: `${winner.color}15`,
                            padding: '1.5rem 4rem',
                            borderRadius: '16px',
                            border: `2px solid ${winner.color}`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2.5rem'
                        }}>
                            <div style={{
                                width: '72px',
                                height: '72px',
                                borderRadius: '15px',
                                background: 'white',
                                color: winner.color,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '2.5rem',
                                fontWeight: '900'
                            }}>{winner.avatar && winner.avatar.startsWith('http') ? <img src={winner.avatar} style={{ width: '100%', height: '100%', borderRadius: '15px' }} /> : winner.avatar}</div>
                            <div>
                                <div style={{ fontSize: '1.75rem', fontWeight: '900', color: 'white', textTransform: 'uppercase', letterSpacing: '2px', fontFamily: 'Rajdhani' }}>{winner.name} Won!</div>
                                <div style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.7)', fontWeight: '700' }}>
                                    Profit: <span style={{ color: '#10b981' }}>+${winner.amountWon.toFixed(2)}</span> ({winner.chance.toFixed(1)}%)
                                </div>
                            </div>
                        </div>
                    </div>
                ) : isSpinning ? (
                    <>
                        <div style={{
                            display: 'flex',
                            height: '100%',
                            transition: 'transform 8s cubic-bezier(0.1, 0, 0, 1)',
                            transform: `translateX(-${spinTranslate}px)`,
                            alignItems: 'center'
                        }}>
                            {[...Array(15)].flatMap(() => lockedParticipants).map((p, i) => (
                                <div key={i} style={{
                                    minWidth: `${Math.max(p.chance * 10, 50)}px`,
                                    width: `${Math.max(p.chance * 10, 50)}px`,
                                    height: '130px',
                                    background: p.color,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRight: '1px solid rgba(0,0,0,0.2)',
                                    flexShrink: 0,
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        width: '44px',
                                        height: '44px',
                                        borderRadius: '10px',
                                        background: 'rgba(255,255,255,0.15)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.2rem',
                                        color: 'white',
                                        marginBottom: '0.25rem',
                                        overflow: 'hidden'
                                    }}>
                                        {p.avatar && p.avatar.toString().startsWith('http') ? <img src={p.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : p.avatar}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', fontWeight: '900', color: 'rgba(255,255,255,0.6)' }}>{p.chance.toFixed(1)}%</div>
                                </div>
                            ))}
                        </div>
                        {/* Needle - Enhanced Visibility */}
                        <div style={{
                            position: 'absolute',
                            top: '0',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '4px',
                            height: '100%',
                            background: 'var(--gold)',
                            boxShadow: '0 0 15px var(--gold)',
                            zIndex: 20
                        }}></div>
                        <div style={{
                            position: 'absolute',
                            top: '0',
                            left: '50%',
                            transform: 'translate(-50%, -5px)',
                            width: '0',
                            height: '0',
                            borderLeft: '15px solid transparent',
                            borderRight: '15px solid transparent',
                            borderTop: '25px solid var(--gold)',
                            filter: 'drop-shadow(0 0 10px var(--gold))',
                            zIndex: 21
                        }}></div>
                        <div style={{
                            position: 'absolute',
                            bottom: '0',
                            left: '50%',
                            transform: 'translate(-50%, 5px)',
                            width: '0',
                            height: '0',
                            borderLeft: '15px solid transparent',
                            borderRight: '15px solid transparent',
                            borderBottom: '25px solid var(--gold)',
                            filter: 'drop-shadow(0 0 10px var(--gold))',
                            zIndex: 21
                        }}></div>
                    </>
                ) : (
                    <div style={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'rgba(255,255,255,0.2)',
                        gap: '0.75rem'
                    }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: '900', fontFamily: 'Rajdhani', letterSpacing: '3px', color: 'rgba(255,255,255,0.4)' }}>
                            {participants.length >= 2 ? `ROUND STARTS IN ${timeLeft}s` : `WAITING FOR PLAYERS (${participants.length}/2)`}
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} style={{ width: '40px', height: '8px', background: i <= participants.length ? 'var(--orange)' : 'rgba(255,255,255,0.05)', borderRadius: '10px' }}></div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Participants Bar */}
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '900', color: 'var(--text-gray)', letterSpacing: '1px', textTransform: 'uppercase' }}>Active Participants</span>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)' }}></div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }} className="custom-scroll">
                    {participants.map((p, i) => (
                        <div key={i} style={{
                            background: 'rgba(255,255,255,0.02)',
                            padding: '0.6rem 1rem',
                            borderRadius: '10px',
                            border: `1px solid ${p.color}33`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            minWidth: 'fit-content'
                        }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: '900' }}>{p.avatar}</div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: '800', whiteSpace: 'nowrap' }}>{p.name}</span>
                                <span style={{ fontSize: '0.65rem', color: p.color, fontWeight: '700' }}>{p.chance.toFixed(1)}%</span>
                            </div>
                        </div>
                    ))}
                    {participants.length === 0 && <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', padding: '0.5rem' }}>Be the first one to join the round!</div>}
                </div>
            </div>

            {/* Final Action Area */}
            <div style={{ padding: '1.5rem 2rem 2rem 2rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                    <button
                        onClick={user ? onOpenInventory : () => alert('Please sign in first!')}
                        disabled={isSpinning || showWinner}
                        className="btn-primary"
                        style={{
                            width: '100%',
                            padding: '1.5rem',
                            fontSize: '1.25rem',
                            borderRadius: '16px',
                            textShadow: 'none',
                            position: 'relative',
                            overflow: 'hidden',
                            fontFamily: 'Rajdhani',
                            fontWeight: '900',
                            letterSpacing: '1px',
                            boxShadow: 'none'
                        }}
                    >
                        {isSpinning ? '🎲 ROLLING...' : showWinner ? '🏆 REVEALING' : user ? '🎒 ENTER ROUND' : '🔑 LOGIN TO PLAY'}
                        {!isSpinning && !showWinner && <div style={{ position: 'absolute', top: 0, left: '-100%', width: '50%', height: '100%', background: 'rgba(255,255,255,0.1)', transform: 'skewX(-25deg)', animation: 'shine 3s infinite' }}></div>}
                    </button>
                    <style>{`
                        @keyframes shine {
                            0% { left: -100%; }
                            20% { left: 200%; }
                            100% { left: 200%; }
                        }
                    `}</style>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={handleDemoDeposit}
                        title="Add Demo Bot"
                        style={{ width: '64px', height: '64px', borderRadius: '16px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '1.5rem', cursor: 'pointer', transition: 'all 0.2s', boxShadow: 'none' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                    >🤖</button>
                    <button
                        onClick={handleForceSpin}
                        title="Force Spin"
                        style={{ width: '64px', height: '64px', borderRadius: '16px', border: '1px solid var(--orange)', background: 'rgba(249, 115, 22, 0.1)', color: 'var(--orange)', fontSize: '1.5rem', cursor: 'pointer', transition: 'all 0.2s', boxShadow: 'none' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--orange)'; e.currentTarget.style.color = 'white' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(249, 115, 22, 0.1)'; e.currentTarget.style.color = 'var(--orange)' }}
                    >⚡</button>
                </div>
            </div>
        </div >
    )
}
