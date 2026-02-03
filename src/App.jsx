import React, { useState, useEffect } from 'react'
import * as CryptoJS from 'crypto-js'
import Header from './components/Header'
import JackpotDisplay from './components/JackpotDisplay'
import Coinflip from './components/Coinflip'
import HistorySidebar from './components/HistorySidebar'
import ChatSidebar from './components/ChatSidebar'
import ItemGrid from './components/ItemGrid'
import FairModal from './components/FairModal'
import InventoryModal from './components/InventoryModal'
import ProfileModal from './components/ProfileModal'

function App() {
  // --- STATE MANAGEMENT ---
  const [user, setUser] = useState(null) // Initialize as null to show "Sign In"
  const [currentView, setCurrentView] = useState('jackpot')
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(true)
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(true)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  // currentPot and participants are derived, removed duplicate state declarations

  const [userStats, setUserStats] = useState(() => {
    const saved = localStorage.getItem('user_stats')
    return saved ? JSON.parse(saved) : {
      totalMatches: 0,
      totalWins: 0,
      totalWagered: 0,
      totalWon: 0,
      bestWin: 0
    }
  })

  // Persist stats
  useEffect(() => {
    localStorage.setItem('user_stats', JSON.stringify(userStats))
  }, [userStats])

  const [depositedItems, setDepositedItems] = useState([])
  const [jackpotHistory, setJackpotHistory] = useState([])
  const [fairVerificationData, setFairVerificationData] = useState(null)
  const [isFairModalOpen, setIsFairModalOpen] = useState(false)
  const [fairData, setFairData] = useState(null)

  const generateNewSeeds = () => {
    const serverSeed = CryptoJS.lib.WordArray.random(32).toString()
    const serverHash = CryptoJS.SHA256(serverSeed).toString()
    setFairData({ serverSeed, serverHash })
  }

  // --- AUTHENTICATION & SESSION ---
  useEffect(() => {
    fetch('https://nakedbeach.onrender.com/api/user', {
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        if (data.loggedIn) {
          setUser({
            name: data.user.name,
            avatar: data.user.avatar,
            fullAvatar: data.user.avatar,
            balance: 0,
            level: 1,
            steamId: data.user.steamid
          })
        }
      })
      .catch(err => console.error("Failed to fetch session:", err))
  }, [])

  // Load mock history on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('jackpot_history')
    if (savedHistory) {
      setJackpotHistory(JSON.parse(savedHistory))
    } else {
      setJackpotHistory([
        { id: 1, winner: 'SkinsLover22', amount: 1540.50, chance: 42.5, time: '2 mins ago', avatar: '🦁', items: [] },
        { id: 2, winner: 'RustKing_99', amount: 890.20, chance: 12.8, time: '5 mins ago', avatar: '💀', items: [] },
        { id: 3, winner: 'NoScopePro', amount: 2310.00, chance: 65.2, time: '12 mins ago', avatar: '🎯', items: [] },
      ])
    }

    generateNewSeeds()
  }, [])

  const addHistory = (round) => {
    setJackpotHistory(prev => {
      const newHistory = [{ ...round, id: Date.now(), time: 'Just now' }, ...prev].slice(0, 30)
      return newHistory
    })

    // Update user stats if they participated
    if (user) {
      const userItemsValue = round.items
        .filter(item => item.owner === user.name)
        .reduce((sum, item) => sum + item.price, 0)

      const didWin = round.winner === user.name

      if (userItemsValue > 0 || didWin) {
        setUserStats(prev => ({
          ...prev,
          totalMatches: prev.totalMatches + 1,
          totalWins: didWin ? prev.totalWins + 1 : prev.totalWins,
          totalWagered: prev.totalWagered + userItemsValue,
          totalWon: didWin ? prev.totalWon + round.amount : prev.totalWon,
          bestWin: didWin ? Math.max(prev.bestWin, round.amount) : prev.bestWin
        }))
      }
    }

    generateNewSeeds() // Start new round seeds
  }

  // Calculate total pot value from items
  const currentPot = depositedItems.reduce((sum, item) => sum + item.price, 0)
  const totalItems = depositedItems.length
  const maxItems = 200

  // Calculate participants and their chances
  const calculateParticipants = () => {
    const participantMap = {}

    depositedItems.forEach(item => {
      if (!participantMap[item.owner]) {
        participantMap[item.owner] = {
          name: item.owner,
          amount: 0,
          items: 0
        }
      }
      participantMap[item.owner].amount += item.price
      participantMap[item.owner].items += 1
    })

    return Object.values(participantMap).map((p, i) => ({
      ...p,
      chance: currentPot > 0 ? (p.amount / currentPot) * 100 : 0,
      avatar: p.name[0].toUpperCase(),
      color: ['#dc2626', '#f97316', '#fbbf24', '#10b981', '#3b82f6'][i % 5]
    }))
  }

  const participants = calculateParticipants()

  const handleAddItem = (item) => {
    setDepositedItems([...depositedItems, { ...item, id: Date.now() }])
  }

  const handleLogin = () => {
    // Redirect to backend auth
    window.location.href = 'https://nakedbeach.onrender.com/auth/steam'
  }

  const handleLogout = () => {
    // Clear session via backend
    window.location.href = 'https://nakedbeach.onrender.com/auth/logout'
  }

  const handleDepositItems = (items) => {
    if (!user) return

    const newItems = items.map(item => ({
      ...item,
      owner: user.name,
      avatar: user.avatar,
      id: Date.now() + Math.random()
    }))
    setDepositedItems([...depositedItems, ...newItems])
    setIsInventoryModalOpen(false)
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header
        currentPot={currentPot}
        onOpenFair={() => setIsFairModalOpen(true)}
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        currentView={currentView}
        setCurrentView={setCurrentView}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
        stats={userStats}
      />

      <div className="container">
        <div className="grid">
          {/* Left Sidebar - History */}
          <div>
            <HistorySidebar
              history={jackpotHistory}
              onVerify={(data) => {
                setFairVerificationData(data);
                setIsFairModalOpen(true);
              }}
            />
          </div>

          {/* Main Content */}
          <div>
            {currentView === 'jackpot' && (
              <JackpotDisplay
                currentPot={currentPot}
                totalItems={totalItems}
                maxItems={maxItems}
                participants={participants}
                depositedItems={depositedItems}
                onAddItem={handleAddItem}
                onReset={() => setDepositedItems([])}
                onAddHistory={addHistory}
                fairData={fairData}
                user={user}
                onOpenInventory={() => setIsInventoryModalOpen(true)}
              />
            )}
            {currentView === 'coinflip' && (
              <Coinflip
                user={user}
                onOpenProfile={() => setIsProfileModalOpen(true)}
                onLogin={handleLogin}
              />
            )}
            {currentView === 'rps' && (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'white' }}>
                <h2>ROCK PAPER SCISSORS COMING SOON</h2>
              </div>
            )}
          </div>

          {/* Right Sidebar - Chat */}
          <div>
            <ChatSidebar user={user} />
          </div>
        </div>
      </div>
      <FairModal
        isOpen={isFairModalOpen}
        onClose={() => {
          setIsFairModalOpen(false);
          setFairVerificationData(null);
        }}
        prefillData={fairVerificationData}
      />
      <InventoryModal
        isOpen={isInventoryModalOpen}
        onClose={() => setIsInventoryModalOpen(false)}
        onDeposit={handleDepositItems}
      />
    </div>
  )
}

export default App
