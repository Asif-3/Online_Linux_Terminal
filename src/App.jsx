import { useState, useEffect } from 'react'
import { isLoggedIn, logout } from './utils/auth'
import Login from './components/Login'
import Terminal from './components/Terminal'
import CheatSheet from './components/CheatSheet'

export default function App() {
    const [authenticated, setAuthenticated] = useState(isLoggedIn())
    const [view, setView] = useState('terminal')
    const [sidebarOpen, setSidebarOpen] = useState(true)

    useEffect(() => { setAuthenticated(isLoggedIn()) }, [])

    if (!authenticated) return <Login onLogin={() => setAuthenticated(true)} />

    const handleLogout = () => { logout(); setAuthenticated(false) }

    return (
        <div className="app-layout">
            <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <img src="/logo.jpg" alt="ASIF Terminal" />
                    <div className="brand">
                        <span className="brand-name">ASIF Terminal</span>
                        <span className="brand-sub">Online Linux Shell</span>
                    </div>
                </div>
                <nav className="sidebar-nav">
                    <button className={`nav-item ${view === 'terminal' ? 'active' : ''}`} onClick={() => setView('terminal')}>
                        <span className="nav-icon">⚡</span> Terminal
                    </button>
                    <button className={`nav-item ${view === 'cheatsheet' ? 'active' : ''}`} onClick={() => setView('cheatsheet')}>
                        <span className="nav-icon">📖</span> Cheat Sheet
                    </button>
                </nav>
                <div className="sidebar-footer">
                    <div className="user-info">
                        <div className="user-avatar">A</div>
                        <div className="user-details">
                            <div className="user-name">ASIF</div>
                            <div className="user-role">Administrator</div>
                        </div>
                    </div>
                    <button className="logout-btn" onClick={handleLogout}>
                        <span>🚪</span> Logout
                    </button>
                </div>
            </aside>
            <main className="main-content">
                {view === 'terminal' ? <Terminal /> : <CheatSheet />}
            </main>
        </div>
    )
}
