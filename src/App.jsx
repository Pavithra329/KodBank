import './App.css'
import { useState } from 'react'

// const API_BASE = 'http://localhost:4000/api';
const API_BASE =
  import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

function RegisterForm({ onSwitchToLogin }) {
  const [form, setForm] = useState({
    uid: '',
    uname: '',
    password: '',
    email: '',
    phone: '',
    role: 'customer',
  })
  const [message, setMessage] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setMessage(data.message || 'Registration failed')
        return
      }
      setMessage('Registration successful! Redirecting to login...')
      setTimeout(() => {
        onSwitchToLogin()
      }, 1200)
    } catch (err) {
      console.error(err)
      setMessage('Something went wrong. Please try again.')
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="logo-mark">KB</div>
        <div>
          <h1 className="app-title">Kodbank</h1>
          <p className="subtitle">Create your Kodbank account</p>
        </div>
      </div>
      <form className="form" onSubmit={handleSubmit}>
        <div className="field-row">
          <div className="field">
            <label>UID</label>
            <input
              type="text"
              name="uid"
              value={form.uid}
              onChange={handleChange}
              required
            />
          </div>
          <div className="field">
            <label>Username</label>
            <input
              type="text"
              name="uname"
              value={form.uname}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="field">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>
        <div className="field-row">
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="field">
            <label>Phone</label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="field">
          <label>Role</label>
          <select name="role" value={form.role} disabled>
            <option value="customer">customer</option>
          </select>
          <small className="hint">Only customer role is allowed</small>
        </div>
        {message && <div className="message">{message}</div>}
        <button className="primary-btn" type="submit">
          Register
        </button>
      </form>
      <p className="switch-text">
        Already registered?{' '}
        <button type="button" className="link-btn" onClick={onSwitchToLogin}>
          Go to Login
        </button>
      </p>
    </div>
  )
}

function LoginForm({ onLoginSuccess, onSwitchToRegister }) {
  const [uname, setUname] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ uname, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setMessage(data.message || 'Login failed')
        return
      }
      setMessage('Login successful! Redirecting...')
      setTimeout(() => {
        onLoginSuccess(uname)
      }, 800)
    } catch (err) {
      console.error(err)
      setMessage('Something went wrong. Please try again.')
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="logo-mark">KB</div>
        <div>
          <h1 className="app-title">Kodbank</h1>
          <p className="subtitle">Welcome back, customer</p>
        </div>
      </div>
      <form className="form" onSubmit={handleSubmit}>
        <div className="field">
          <label>Username</label>
          <input
            type="text"
            value={uname}
            onChange={(e) => setUname(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {message && <div className="message">{message}</div>}
        <button className="primary-btn" type="submit">
          Login
        </button>
      </form>
      <p className="switch-text">
        New to Kodbank?{' '}
        <button type="button" className="link-btn" onClick={onSwitchToRegister}>
          Create account
        </button>
      </p>
    </div>
  )
}

function Dashboard({ username }) {
  const [balance, setBalance] = useState(null)
  const [message, setMessage] = useState('')
  const [party, setParty] = useState(false)

  const handleCheckBalance = async () => {
    setMessage('')
    setParty(false)
    try {
      const res = await fetch(`${API_BASE}/balance`, {
        method: 'GET',
        credentials: 'include',
      })
      const data = await res.json()
      if (!res.ok) {
        setMessage(data.message || 'Unable to fetch balance')
        return
      }
      setBalance(data.balance)
      setMessage(`Your balance is: ₹${data.balance}`)
      setParty(true)
      setTimeout(() => setParty(false), 3000)
    } catch (err) {
      console.error(err)
      setMessage('Something went wrong. Please try again.')
    }
  }

  return (
    <div className="dashboard">
      <div className={`party-bg ${party ? 'party-bg--active' : ''}`} />
      <div className="card card--dashboard">
        <div className="card-header card-header--center">
          <div className="logo-mark logo-mark--large">KB</div>
          <div>
            <h1 className="app-title">Kodbank</h1>
            <p className="subtitle">Hello, {username}</p>
          </div>
        </div>
        <div className="dashboard-grid">
          <div className="balance-card">
            <div className="balance-card-header">
              <span className="balance-label">Available balance</span>
              <span className="balance-chip">Customer</span>
            </div>
            <div className="balance-visual">
              <div className="balance-ring">
                <div className="balance-ring-inner">
                  <span className="balance-main">
                    {balance !== null ? `₹${balance}` : '— — —'}
                  </span>
                  <span className="balance-sub">Kodbank wallet</span>
                </div>
              </div>
              <div className="balance-details">
                <div className="balance-detail-row">
                  <span className="detail-label">Last check</span>
                  <span className="detail-value">
                    {balance !== null ? 'Just now' : 'Not checked yet'}
                  </span>
                </div>
                <div className="balance-detail-row">
                  <span className="detail-label">Status</span>
                  <span className="detail-value detail-value--secure">JWT secured</span>
                </div>
              </div>
            </div>
          </div>
          <div className="action-panel">
            <p className="action-text">
              Tap once to verify your JWT token and pull the latest balance from your Kodbank
              account.
            </p>
            <button className="primary-btn primary-btn--large" onClick={handleCheckBalance}>
              Check Balance
            </button>
            {message && (
              <div className={`message message--large ${party ? 'message--party' : ''}`}>
                {message}
              </div>
            )}
          </div>
        </div>
        {party && (
          <div className="confetti-layer">
            <div className="confetti confetti--1" />
            <div className="confetti confetti--2" />
            <div className="confetti confetti--3" />
            <div className="confetti confetti--4" />
            <div className="confetti confetti--5" />
          </div>
        )}
      </div>
    </div>
  )
}

function App() {
  const [page, setPage] = useState('register')
  const [username, setUsername] = useState('')

  if (page === 'dashboard') {
    return <Dashboard username={username} />
  }

  return (
    <div className="app kodbank-app">
      <div className="gradient-orbit" />
      <div className="auth-layout">
        <div className="hero-panel">
          <div className="hero-glow" />
          <h2 className="hero-title">Your digital vault for everyday banking.</h2>
          <p className="hero-copy">
            Track balances in real time, protected by modern JWT security, with a playful twist
            every time you check in on your money.
          </p>
          <div className="hero-badges">
            <span className="hero-badge">JWT secured</span>
            <span className="hero-badge">Instant balance</span>
            <span className="hero-badge">Customer first</span>
          </div>
          <div className="hero-stat-row">
            <div className="hero-stat">
              <span className="hero-stat-number">100K</span>
              <span className="hero-stat-label">Starting balance</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-number">1</span>
              <span className="hero-stat-label">Secure role</span>
            </div>
          </div>
        </div>
        <div className="auth-panel">
          {page === 'register' ? (
            <RegisterForm onSwitchToLogin={() => setPage('login')} />
          ) : (
            <LoginForm
              onSwitchToRegister={() => setPage('register')}
              onLoginSuccess={(uname) => {
                setUsername(uname)
                setPage('dashboard')
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default App
