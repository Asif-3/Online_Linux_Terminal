import { useState } from 'react'
import { login } from '../utils/auth'

export default function Login({ onLogin }) {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setTimeout(() => {
            if (login(username, password)) {
                onLogin()
            } else {
                setError('Invalid credentials. Access denied.')
                setLoading(false)
            }
        }, 800)
    }

    const particles = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 15,
        duration: Math.random() * 10 + 8,
        size: Math.random() * 4 + 1,
    }))

    return (
        <div className="login-container">
            <div className="login-bg-grid" />
            <div className="login-particles">
                {particles.map(p => (
                    <div key={p.id} className="particle" style={{
                        left: `${p.left}%`,
                        width: `${p.size}px`, height: `${p.size}px`,
                        animationDelay: `${p.delay}s`,
                        animationDuration: `${p.duration}s`
                    }} />
                ))}
            </div>
            <div className="login-card">
                <div className="login-logo">
                    <img src="/logo.jpg" alt="ASIF Terminal" />
                    <h1>ASIF Terminal</h1>
                    <p>Online Linux Terminal Emulator</p>
                </div>
                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Username</label>
                        <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                            placeholder="Enter username" autoFocus autoComplete="username" />
                    </div>
                    <div className="input-group">
                        <label>Password</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                            placeholder="Enter password" autoComplete="current-password" />
                    </div>
                    {error && <div className="login-error">{error}</div>}
                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? '◌ Authenticating...' : '→ Access Terminal'}
                    </button>
                </form>
                <div className="login-footer">Secured Access • ASIF Terminal v1.0</div>
            </div>
        </div>
    )
}
