import React, { useState, useEffect } from 'react'

export default function InventoryModal({ isOpen, onClose, onDeposit }) {
    const [selectedItems, setSelectedItems] = useState([])
    const [inventory, setInventory] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (isOpen) {
            fetchInventory()
        }
    }, [isOpen])

    const fetchInventory = async () => {
        setLoading(true)
        setError(null)

        const MOCK_DEMO_ITEMS = [
            { id: 'mock-101', assetid: 'mock-101', name: 'AK-47 | Alien Red', price: 185.20, icon: '🔫', rarity: 'High' },
            { id: 'mock-102', assetid: 'mock-102', name: 'Metal Facemask | Glowing Skull', price: 92.50, icon: '🛡️', rarity: 'High' },
            { id: 'mock-103', assetid: 'mock-103', name: 'Metal Chest Plate | Big Grin', price: 850.00, icon: '👕', rarity: 'Legendary' },
            { id: 'mock-104', assetid: 'mock-104', name: 'Bolt Action | Tempered', price: 42.00, icon: '🎯', rarity: 'Mid' },
            { id: 'mock-105', assetid: 'mock-105', name: 'LR-300 | Victoria', price: 65.00, icon: '🔫', rarity: 'High' },
            { id: 'mock-106', assetid: 'mock-106', name: 'MP5 | Arctic Camo', price: 15.00, icon: '🔫', rarity: 'Low' }
        ]

        try {
            const res = await fetch('https://nakedbeach.onrender.com/api/inventory', { credentials: 'include' })
            const data = await res.json()

            let realItems = []
            if (data && !data.error && Array.isArray(data)) {
                realItems = data.map(item => ({
                    ...item,
                    id: item.assetid,
                    rarity: 'Common'
                }))
            }

            // Combine Real + Mock items
            setInventory([...realItems, ...MOCK_DEMO_ITEMS])

        } catch (err) {
            console.error("Failed to fetch inventory:", err)
            // Fallback to mock items
            setInventory(MOCK_DEMO_ITEMS)
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    const toggleItem = (item) => {
        if (selectedItems.find(i => i.id === item.id)) {
            setSelectedItems(selectedItems.filter(i => i.id !== item.id))
        } else {
            setSelectedItems([...selectedItems, item])
        }
    }

    const totalSelected = selectedItems.reduce((sum, i) => sum + i.price, 0)

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
            zIndex: 300,
            backdropFilter: 'blur(8px)'
        }}>
            <div className="card" style={{
                width: '95%',
                maxWidth: '1000px',
                height: '85vh',
                display: 'flex',
                flexDirection: 'column',
                padding: 0,
                border: '1px solid #333',
                overflow: 'hidden'
            }}>
                <div className="card-header" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    margin: 0,
                    borderRadius: '12px 12px 0 0'
                }}>
                    <span>Your Steam Inventory</span>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
                </div>

                <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                    {/* Left: Item Grid */}
                    <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '1rem', alignContent: 'start' }}>
                        {loading && <div style={{ color: 'white', gridColumn: '1 / -1', textAlign: 'center', paddingTop: '2rem' }}>Loading inventory...</div>}

                        {error && (
                            <div style={{ color: '#ef4444', gridColumn: '1 / -1', textAlign: 'center', paddingTop: '2rem' }}>
                                <p>{error}</p>
                                <button onClick={fetchInventory} style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#333', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Retry</button>
                            </div>
                        )}

                        {!loading && !error && inventory.length === 0 && (
                            <div style={{ color: 'var(--text-gray)', gridColumn: '1 / -1', textAlign: 'center', paddingTop: '2rem' }}>No tradable items found.</div>
                        )}

                        {!loading && inventory.map(item => {
                            const isSelected = selectedItems.find(i => i.id === item.id)
                            return (
                                <div
                                    key={item.id}
                                    onClick={() => toggleItem(item)}
                                    style={{
                                        background: isSelected ? 'rgba(249, 115, 22, 0.1)' : 'var(--bg-dark)',
                                        border: `1px solid ${isSelected ? 'var(--orange)' : 'var(--border)'}`,
                                        borderRadius: '8px',
                                        padding: '0.75rem',
                                        cursor: 'pointer',
                                        textAlign: 'center',
                                        transition: 'all 0.2s',
                                        position: 'relative',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center'
                                    }}
                                >
                                    <div style={{ width: '80px', height: '80px', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {item.icon.startsWith('http') ? (
                                            <img src={item.icon} alt={item.name} style={{ maxWidth: '100%', maxHeight: '100%' }} />
                                        ) : (
                                            <span style={{ fontSize: '2.5rem' }}>{item.icon}</span>
                                        )}
                                    </div>
                                    <div style={{ fontSize: '0.7rem', fontWeight: '600', color: 'white', marginBottom: '0.25rem', height: '2rem', overflow: 'hidden', width: '100%' }}>{item.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--gold)', fontWeight: 'bold' }}>${item.price.toFixed(2)}</div>

                                    {isSelected && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '5px',
                                            right: '5px',
                                            background: 'var(--orange)',
                                            color: 'white',
                                            width: '18px',
                                            height: '18px',
                                            borderRadius: '50%',
                                            fontSize: '0.6rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>✓</div>
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    {/* Right: Summary */}
                    <div style={{ width: '300px', background: 'var(--bg-darker)', borderLeft: '1px solid var(--border)', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ fontFamily: 'Rajdhani', marginBottom: '1.5rem' }}>Deposit Summary</h3>

                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ color: 'var(--text-gray)' }}>Items:</span>
                                <span>{selectedItems.length}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                <span style={{ color: 'var(--text-gray)' }}>Total Value:</span>
                                <span style={{ color: 'var(--gold)', fontWeight: 'bold' }}>${totalSelected.toFixed(2)}</span>
                            </div>

                            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                                <label style={{ fontSize: '0.7rem', color: 'var(--text-gray)', display: 'block', marginBottom: '0.5rem' }}>TRADE URL</label>
                                <input
                                    type="text"
                                    placeholder="https://steamcommunity.com/tradeoffer/..."
                                    style={{ width: '100%', background: '#000', border: '1px solid var(--border)', borderRadius: '4px', padding: '0.5rem', color: 'white', fontSize: '0.75rem', marginBottom: '1rem' }}
                                />
                                <a href="#" style={{ fontSize: '0.7rem', color: 'var(--orange)' }}>Where do I find this?</a>
                            </div>
                        </div>

                        <button
                            className="btn-primary"
                            disabled={selectedItems.length === 0}
                            onClick={() => onDeposit(selectedItems)}
                            style={{
                                width: '100%',
                                opacity: selectedItems.length === 0 ? 0.5 : 1,
                                cursor: selectedItems.length === 0 ? 'not-allowed' : 'pointer'
                            }}
                        >
                            DEPOSIT ITEMS
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
