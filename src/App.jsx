import { useState, useEffect } from 'react'
import { isLoggedIn, logout } from './utils/auth'
import Login from './components/Login'
import Terminal from './components/Terminal'
import CheatSheet from './components/CheatSheet'
import ContactBadge from './components/ContactBadge'

export default function App() {
    const [authenticated, setAuthenticated] = useState(isLoggedIn())
    const [view, setView] = useState('terminal')
    const [sidebarOpen, setSidebarOpen] = useState(false)

    useEffect(() => { setAuthenticated(isLoggedIn()) }, [])

    const handleLogout = () => { logout(); setAuthenticated(false) }

    return (
        <>
            {!authenticated ? (
                <Login onLogin={() => setAuthenticated(true)} />
            ) : (
                <div className="app-layout">
                    {/* Overlay for mobile sidebar close */}
                    {sidebarOpen && (
                        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
                    )}

                    {/* Mobile hamburger — only visible on mobile */}
                    <button
                        className="mobile-menu-btn"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        aria-label="Toggle menu"
                    >
                        {sidebarOpen ? '✕' : '☰'}
                    </button>

                    <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                        <div className="sidebar-header">
                            <img src="/logo.jpg" alt="ASIF Terminal" />
                            <div className="brand">
                                <span className="brand-name">ASIF Terminal</span>
                                <span className="brand-sub">Online Linux Shell</span>
                            </div>
                        </div>

                        <nav className="sidebar-nav">
                            <button
                                className={`nav-item ${view === 'terminal' ? 'active' : ''}`}
                                onClick={() => { setView('terminal'); setSidebarOpen(false) }}
                            >
                                <span className="nav-icon">⚡</span> Terminal
                            </button>
                            <button
                                className={`nav-item ${view === 'cheatsheet' ? 'active' : ''}`}
                                onClick={() => { setView('cheatsheet'); setSidebarOpen(false) }}
                            >
                                <span className="nav-icon">📖</span> Cheat Sheet
                            </button>
                        </nav>

                        <div className="sidebar-footer">
                            <button className="logout-btn" onClick={handleLogout}>
                                <span>🚪</span> Logout
                            </button>
                        </div>
                    </aside>

                    <main className="main-content">
                        {view === 'terminal' ? <Terminal /> : <CheatSheet />}
                    </main>
                </div>
            )}
            <ContactBadge />
        </>
    )
}
