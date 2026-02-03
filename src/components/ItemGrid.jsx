import React from 'react'

export default function ItemGrid({ items }) {
    return (
        <div className="card">
            <div className="card-header">Current Items ({items.length})</div>

            {items.length > 0 ? (
                <div className="item-list">
                    {items.map((item, i) => (
                        <div key={item.id || i} className="item-card">
                            <div className="item-icon">{item.icon}</div>
                            <div className="item-info">
                                <div className="item-name">{item.name}</div>
                                <div className="item-stats">
                                    <span className="item-price">${item.price.toFixed(2)}</span>
                                    <span className="item-chance" style={{ color: '#9ca3af' }}>
                                        Owner: {item.owner}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '3rem 0', color: '#9ca3af' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📦</div>
                    <p>No items in the current jackpot</p>
                    <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>Be the first to deposit!</p>
                </div>
            )}
        </div>
    )
}
