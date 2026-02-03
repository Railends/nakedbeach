import React, { useState, useEffect } from 'react'
import InventoryModal from './InventoryModal'

export default function Coinflip({ user, onOpenProfile, onLogin }) {
    const [duels, setDuels] = useState([
        { id: 1, creator: 'SkinsLover22', creatorAvatar: '🦁', creatorItems: [{ name: 'AK-47 | Redline', price: 25.50, icon: '🔫' }], creatorTotal: 25.50, joiner: null, status: 'waiting', winner: null },
        { id: 2, creator: 'RustKing_99', creatorAvatar: '💀', creatorItems: [{ name: 'Metal Facemask', price: 95.00, icon: '🛡️' }, { name: 'Chest Plate', price: 85.00, icon: '👕' }], creatorTotal: 180.00, joiner: null, status: 'waiting', winner: null },
    ])
    const [isInventoryOpen, setIsInventoryOpen] = useState(false)
    const [actionDuelId, setActionDuelId] = useState(null) // ID of duel being joined

    const handleCreateDuel = (items) => {
        const totalValue = items.reduce((sum, i) => sum + i.price, 0)
        const newDuel = {
            id: Date.now(),
            creator: user.name,
            creatorAvatar: user.avatar || '👤',
            creatorItems: items,
            creatorTotal: totalValue,
            joiner: null,
            status: 'waiting',
            winner: null
        }
        setDuels([newDuel, ...duels])
        setIsInventoryOpen(false)
    }

    const handleJoinDuel = (duelId) => {
        if (!user) {
            onLogin()
            return
        }
        setActionDuelId(duelId)
        setIsInventoryOpen(true)
    }

    const handleConfirmJoin = (items) => {
        const joinTotal = items.reduce((sum, i) => sum + i.price, 0)
        const duel = duels.find(d => d.id === actionDuelId)

        if (!duel) {
            setIsInventoryOpen(false)
            return
        }

        // Logic: "almost 50/50 regarding bet size" => +/- 10%
        const min = duel.creatorTotal * 0.9
        const max = duel.creatorTotal * 1.1

        if (joinTotal < min || joinTotal > max) {
            alert(`Fair Duel Required! Your bet ($${joinTotal.toFixed(2)}) must be within 10% of the opponent's ($${duel.creatorTotal.toFixed(2)}). range: $${min.toFixed(2)} - $${max.toFixed(2)}`)
            return
        }

        // Proceed to start duel
        const updatedDuels = duels.map(d => {
            if (d.id === actionDuelId) {
                return {
                    ...d,
                    joiner: user.name,
                    joinerAvatar: user.avatar || '👤',
                    joinerItems: items,
                    joinerTotal: joinTotal,
                    status: 'flipping'
                }
            }
            return d
        })
        setDuels(updatedDuels)
        setIsInventoryOpen(false)
        setActionDuelId(null)

        // Simulate flip result
        setTimeout(() => {
            const winner = Math.random() > 0.5 ? duel.creator : user.name
            setDuels(prev => prev.map(d => d.id === actionDuelId ? { ...d, status: 'finished', winner: winner } : d))
        }, 3000)
    }

    const handleInventoryAction = (items) => {
        if (actionDuelId) {
            handleConfirmJoin(items)
        } else {
            handleCreateDuel(items)
        }
    }

    return (
        <div style={{ padding: '2rem 0', maxWidth: '1200px', margin: '0 auto', color: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', padding: '0 1rem' }}>
                <h2 style={{ fontFamily: 'Rajdhani', fontSize: '2rem', fontWeight: '700' }}>COINFLIP DUELS</h2>
                <button
                    className="btn-primary"
                    onClick={() => {
                        if (!user) { onLogin(); return; }
                        setActionDuelId(null);
                        setIsInventoryOpen(true);
                    }}
                    style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}
                >
                    CREATE DUEL
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem', padding: '0 1rem' }}>
                {duels.map(duel => (
                    <div key={duel.id} className="card" style={{ padding: '1.5rem', background: 'var(--bg-card)', border: duel.status === 'finished' ? (duel.winner === user?.name ? '1px solid #10b981' : '1px solid var(--border)') : '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>

                        {/* Status Label */}
                        <div style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '0.7rem', fontWeight: '700', padding: '2px 8px', borderRadius: '4px', background: duel.status === 'flipping' ? '#f97316' : (duel.status === 'finished' ? '#10b981' : 'rgba(255,255,255,0.1)'), color: 'white' }}>
                            {duel.status === 'waiting' && 'WAITING FOR PLAYER'}
                            {duel.status === 'flipping' && 'FLIPPING...'}
                            {duel.status === 'finished' && 'FINISHED'}
                        </div>

                        {/* Players */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                            {/* Creator (Heads) */}
                            <div style={{ textAlign: 'center', opacity: duel.status === 'finished' && duel.winner !== duel.creator ? 0.3 : 1 }}>
                                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #f97316, #ea580c)', padding: '2px', margin: '0 auto 0.5rem auto', position: 'relative' }}>
                                    <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', overflow: 'hidden' }}>
                                        {duel.creatorAvatar.length > 2 ? <img src={duel.creatorAvatar} alt="" style={{ width: '100%' }} /> : duel.creatorAvatar}
                                    </div>
                                    <div style={{ position: 'absolute', bottom: -5, left: '50%', transform: 'translateX(-50%)', background: '#f97316', fontSize: '0.6rem', fontWeight: '800', padding: '1px 6px', borderRadius: '10px', color: 'white' }}>HEADS</div>
                                </div>
                                <div style={{ fontSize: '0.85rem', fontWeight: '700' }}>{duel.creator}</div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--gold)', fontWeight: 'bold' }}>${duel.creatorTotal.toFixed(2)}</div>
                                <div style={{ display: 'flex', gap: '2px', justifyContent: 'center', marginTop: '4px' }}>
                                    {duel.creatorItems.map((i, idx) => idx < 3 && <div key={idx} style={{ width: '20px', height: '20px', background: '#222', borderRadius: '4px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i.icon}</div>)}
                                    {duel.creatorItems.length > 3 && <span style={{ fontSize: '0.7rem' }}>+{duel.creatorItems.length - 3}</span>}
                                </div>
                            </div>

                            {/* VS / Coin */}
                            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                {duel.status === 'flipping' ? (
                                    <div className="coin-flip-anim" style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#fbbf24', border: '4px solid #f59e0b', boxShadow: '0 0 20px #fbbf24', animation: 'spin 0.5s linear infinite' }}></div>
                                ) : duel.status === 'finished' ? (
                                    <div style={{ fontSize: '2rem' }}>{duel.winner === duel.creator ? '🟠' : '⚫'}</div>
                                ) : (
                                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#333' }}>VS</div>
                                )}
                            </div>

                            {/* Joiner (Tails) */}
                            <div style={{ textAlign: 'center', opacity: duel.status === 'finished' && duel.winner !== duel.joiner ? 0.3 : 1 }}>
                                {duel.joiner ? (
                                    <>
                                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #333, #000)', padding: '2px', margin: '0 auto 0.5rem auto', position: 'relative' }}>
                                            <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', overflow: 'hidden' }}>
                                                {duel.joinerAvatar.length > 2 ? <img src={duel.joinerAvatar} alt="" style={{ width: '100%' }} /> : duel.joinerAvatar}
                                            </div>
                                            <div style={{ position: 'absolute', bottom: -5, left: '50%', transform: 'translateX(-50%)', background: '#333', fontSize: '0.6rem', fontWeight: '800', padding: '1px 6px', borderRadius: '10px', color: 'white' }}>TAILS</div>
                                        </div>
                                        <div style={{ fontSize: '0.85rem', fontWeight: '700' }}>{duel.joiner}</div>
                                        <div style={{ fontSize: '0.9rem', color: 'var(--gold)', fontWeight: 'bold' }}>${duel.joinerTotal.toFixed(2)}</div>
                                        <div style={{ display: 'flex', gap: '2px', justifyContent: 'center', marginTop: '4px' }}>
                                            {duel.joinerItems.map((i, idx) => idx < 3 && <div key={idx} style={{ width: '20px', height: '20px', background: '#222', borderRadius: '4px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i.icon}</div>)}
                                            {duel.joinerItems.length > 3 && <span style={{ fontSize: '0.7rem' }}>+{duel.joinerItems.length - 3}</span>}
                                        </div>
                                    </>
                                ) : (
                                    <button
                                        className="btn-primary"
                                        onClick={() => handleJoinDuel(duel.id)}
                                        style={{ width: '64px', height: '64px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', margin: '0 auto 0.5rem auto', background: 'rgba(255,255,255,0.05)', border: '1px dashed #555' }}
                                    >
                                        JOIN
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <InventoryModal
                isOpen={isInventoryOpen}
                onClose={() => setIsInventoryOpen(false)}
                onDeposit={handleInventoryAction}
            />

            <style>{`
                @keyframes spin {
                    0% { transform: rotateY(0deg); }
                    100% { transform: rotateY(360deg); }
                }
            `}</style>
        </div>
    )
}
