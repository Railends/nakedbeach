import React, { useState } from 'react'
import Chance from 'chance'

export default function FairModal({ isOpen, onClose, prefillData }) {
    const [testServerSeed, setTestServerSeed] = useState('')
    const [testRandomSeed, setTestRandomSeed] = useState('')
    const [testResult, setTestResult] = useState(null)

    React.useEffect(() => {
        if (prefillData) {
            setTestServerSeed(prefillData.serverSeed || '')
            setTestRandomSeed(prefillData.randomSeed || '')
            setTestResult(null)
        }
    }, [prefillData])

    if (!isOpen) return null

    const handleVerify = (e) => {
        e.preventDefault()
        if (!testServerSeed || !testRandomSeed) return

        try {
            const combinedSeed = `${testServerSeed.trim()}-${testRandomSeed.trim()}`
            const chanceInstance = new Chance(combinedSeed)
            const ticket = chanceInstance.floating({ min: 0, max: 1, fixed: 8 })
            setTestResult(ticket)
        } catch (err) {
            console.error(err)
            alert('Invalid seeds provided')
        }
    }

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
            backdropFilter: 'blur(5px)'
        }}>
            <div className="card" style={{
                width: '90%',
                maxWidth: '850px',
                maxHeight: '92vh',
                overflowY: 'auto',
                border: '2px solid var(--orange)'
            }}>
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Provably Fair Verification</span>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
                </div>

                <div style={{ padding: '2rem' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                        <h2 style={{ fontFamily: 'Rajdhani', fontSize: '2rem', marginBottom: '1rem' }}>Don't Trust, Verify.</h2>
                        <p style={{ color: '#9ca3af', lineHeight: '1.6', maxWidth: '600px', margin: '0 auto' }}>
                            Our system allows anyone to manually verify every round. Below is the technical logic and an interactive tool to test it yourself.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
                        {/* Left Side: Explanation */}
                        <div>
                            <h3 style={{ fontFamily: 'Rajdhani', fontSize: '1.4rem', color: 'var(--orange)', marginBottom: '1rem' }}>How to verify manually</h3>
                            <div style={{ color: '#d1d5db', fontSize: '0.9rem', lineHeight: '1.7' }}>
                                <p style={{ marginBottom: '1rem' }}>
                                    1. Go to the <strong>History</strong> and find the round you want to check.
                                </p>
                                <p style={{ marginBottom: '1rem' }}>
                                    2. Copy the <strong>Server Seed</strong> (revealed after the round) and the <strong>Random Seed</strong> (from Random.org).
                                </p>
                                <p style={{ marginBottom: '1rem' }}>
                                    3. Join them with a dash: <code>serverSeed-randomSeed</code>.
                                </p>
                                <p style={{ marginBottom: '1.5rem' }}>
                                    4. Use our tool or any <strong>Chance.js (v1.1.8)</strong> library to generate a ticket.
                                    If the ticket matches the history, the round was honest.
                                </p>
                            </div>

                            <div style={{ background: '#000', padding: '1rem', borderRadius: '8px', textAlign: 'left', fontFamily: 'monospace', fontSize: '0.8rem', color: '#10b981', border: '1px solid #1a1a1a' }}>
                                <div style={{ color: '#6b7280', marginBottom: '0.5rem' }}>// Logic Snippet</div>
                                <div>const mod = {'`${serverSeed}-${randomSeed}`'};</div>
                                <div>const chance = new Chance(mod);</div>
                                <div style={{ color: '#fbbf24' }}>const ticket = chance.floating({'{'}min: 0, max: 1, fixed: 8{'}'});</div>
                            </div>
                        </div>

                        {/* Right Side: Interactive Verifier */}
                        <div style={{ background: 'var(--bg-darker)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                            <h3 style={{ fontFamily: 'Rajdhani', fontSize: '1.3rem', marginBottom: '1.5rem', textAlign: 'center' }}>🛠️ Interactive Verifier</h3>

                            <form onSubmit={handleVerify}>
                                <div style={{ marginBottom: '1.2rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Server Seed</label>
                                    <input
                                        type="text"
                                        value={testServerSeed}
                                        onChange={(e) => setTestServerSeed(e.target.value)}
                                        placeholder="Paste revealed server seed here..."
                                        style={{ width: '100%', padding: '0.75rem', background: '#0c0c14', border: '1px solid #2a2a2a', borderRadius: '6px', color: 'white', fontSize: '0.85rem' }}
                                    />
                                </div>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Random Seed</label>
                                    <input
                                        type="text"
                                        value={testRandomSeed}
                                        onChange={(e) => setTestRandomSeed(e.target.value)}
                                        placeholder="Paste random.org seed here..."
                                        style={{ width: '100%', padding: '0.75rem', background: '#0c0c14', border: '1px solid #2a2a2a', borderRadius: '6px', color: 'white', fontSize: '0.85rem' }}
                                    />
                                </div>
                                <button className="btn-primary" style={{ width: '100%', padding: '0.8rem' }}>CALCULATE TICKET</button>
                            </form>

                            {testResult !== null && (
                                <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px dashed #10b981', borderRadius: '8px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.75rem', color: '#10b981', marginBottom: '0.25rem', fontWeight: 'bold' }}>RESULTING TICKET:</div>
                                    <div style={{ fontSize: '1.5rem', fontFamily: 'monospace', color: 'white', fontWeight: 'bold' }}>{testResult.toFixed(8)}</div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{ marginTop: '2.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', borderTop: '1px solid #2a2a2a', paddingTop: '2rem' }}>
                        <div>
                            <h4 style={{ color: 'var(--orange)', marginBottom: '0.5rem', fontSize: '1rem' }}>Why show the Hash first?</h4>
                            <p style={{ fontSize: '0.85rem', color: '#9ca3af', lineHeight: '1.5' }}>
                                It's a digital seal. By showing the SHA256 Hash upfront, we prove that the Server Seed was generated
                                <strong> before</strong> any bets were placed. We cannot change it later without changing the hash.
                            </p>
                        </div>
                        <div>
                            <h4 style={{ color: 'var(--orange)', marginBottom: '0.5rem', fontSize: '1rem' }}>Can it be reverse-engineered?</h4>
                            <p style={{ fontSize: '0.85rem', color: '#9ca3af', lineHeight: '1.5' }}>
                                <strong>No.</strong> SHA256 is a one-way function. It's mathematically impossible to calculate the original
                                seed from the hash. Your bets are safe and the outcome is truly random.
                            </p>
                        </div>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                        <button className="btn-primary" onClick={onClose} style={{ width: '200px' }}>CLOSE</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

