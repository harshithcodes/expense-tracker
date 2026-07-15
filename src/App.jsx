import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Plus, Trash2, Edit2, X, Check, TrendingUp, TrendingDown, DollarSign, LayoutDashboard, List, ChevronDown, Loader2, AlertCircle, LogOut, User, Mail, Lock, Eye, EyeOff } from 'lucide-react'

const CATS = [
  { label: 'Food & Dining', color: '#f97316', emoji: '🍔' },
  { label: 'Transport',     color: '#3b82f6', emoji: '🚗' },
  { label: 'Entertainment', color: '#a855f7', emoji: '🎮' },
  { label: 'Utilities',     color: '#14b8a6', emoji: '💡' },
  { label: 'Shopping',      color: '#ec4899', emoji: '🛍️' },
  { label: 'Health',        color: '#34d399', emoji: '💊' },
  { label: 'Other',         color: '#94a3b8', emoji: '📦' },
]
const getCat = l => CATS.find(c => c.label === l) || CATS[6]
const fmt = n => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
const fmtDate = d => new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })

const IS = { background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 10, padding: '11px 14px', color: 'var(--text-primary)', fontSize: 15, outline: 'none', width: '100%' }
const navBtn = { background: 'transparent', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500, padding: '9px 14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }
const navActive = { background: 'var(--accent-glow)', border: '1px solid var(--accent)', color: 'var(--accent-light)' }
const CT = { fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', fontFamily: "'Space Grotesk',sans-serif", marginBottom: 14 }
const IB = c => ({ width: 30, height: 30, borderRadius: 8, border: 'none', background: `${c}15`, color: c, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' })

// ── Auth Screen ───────────────────────────────────────────────────────────────
function AuthScreen() {
  const [mode, setMode] = useState('login') // login | signup
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handle = async () => {
    setError(''); setSuccess('')
    if (!email || !password) { setError('Please enter email and password.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true)
    if (mode === 'signup') {
      const { error: e } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: name || email.split('@')[0] } }
      })
      if (e) setError(e.message)
      else setSuccess('Account created! Check your email to confirm, then log in.')
    } else {
      const { error: e } = await supabase.auth.signInWithPassword({ email, password })
      if (e) setError(e.message)
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'var(--bg-base)' }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ width: 64, height: 64, borderRadius: 18, background: 'linear-gradient(135deg,#818cf8,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, margin: '0 auto 16px' }}>₹</div>
        <h1 style={{ fontSize: 28, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, background: 'linear-gradient(135deg,#818cf8,#6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ExpenseFlow</h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 6 }}>Track every rupee, effortlessly</p>
      </div>

      {/* Card */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: '28px 24px', width: '100%', maxWidth: 400, boxShadow: '0 8px 40px rgba(0,0,0,0.4)' }}>
        {/* Tab switcher */}
        <div style={{ display: 'flex', background: 'var(--bg-input)', borderRadius: 12, padding: 4, marginBottom: 24 }}>
          {['login', 'signup'].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(''); setSuccess('') }} style={{ flex: 1, padding: '9px', borderRadius: 9, border: 'none', background: mode === m ? 'var(--bg-card)' : 'transparent', color: mode === m ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: mode === m ? 600 : 400, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s', boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.3)' : 'none' }}>
              {m === 'login' ? 'Log In' : 'Sign Up'}
            </button>
          ))}
        </div>

        {error && <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center', color: '#f87171', fontSize: 13 }}><AlertCircle size={15}/>{error}</div>}
        {success && <div style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, color: '#34d399', fontSize: 13 }}>{success}</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {mode === 'signup' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}/>
                <input type="text" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} style={{ ...IS, paddingLeft: 38 }}/>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}/>
              <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handle()} style={{ ...IS, paddingLeft: 38 }}/>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}/>
              <input type={showPw ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handle()} style={{ ...IS, paddingLeft: 38, paddingRight: 40 }}/>
              <button onClick={() => setShowPw(p => !p)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 2 }}>
                {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>
            {mode === 'signup' && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>At least 6 characters</span>}
          </div>

          <button onClick={handle} disabled={loading} style={{ background: 'var(--accent)', border: 'none', borderRadius: 12, color: '#fff', fontSize: 15, fontWeight: 600, padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', marginTop: 4, opacity: loading ? 0.7 : 1 }}>
            {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }}/> : null}
            {mode === 'login' ? 'Log In' : 'Create Account'}
          </button>
        </div>
      </div>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 20, textAlign: 'center' }}>Your expenses are private and secure.</p>
    </div>
  )
}

// ── Expense Modal ─────────────────────────────────────────────────────────────
function Modal({ onClose, onSave, editing }) {
  const [form, setForm] = useState(editing
    ? { amount: editing.amount, description: editing.description, category: editing.category, date: editing.date }
    : { amount: '', description: '', category: 'Food & Dining', date: new Date().toISOString().split('T')[0] })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')
  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const save = async () => {
    if (!form.amount || !form.description || !form.date) { setErr('Please fill all fields.'); return }
    if (isNaN(parseFloat(form.amount)) || parseFloat(form.amount) <= 0) { setErr('Amount must be positive.'); return }
    setSaving(true); setErr('')
    await onSave({ ...form, amount: parseFloat(form.amount) })
    setSaving(false)
  }
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 1000 }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px 20px 0 0', padding: '24px 20px 36px', width: '100%', maxWidth: 500 }}>
        <div style={{ width: 36, height: 4, background: 'var(--border)', borderRadius: 2, margin: '0 auto 20px' }}/>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600 }}>{editing ? 'Edit Expense' : 'Add Expense'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={20}/></button>
        </div>
        {err && <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 14, display: 'flex', gap: 8, alignItems: 'center', color: '#f87171', fontSize: 13 }}><AlertCircle size={15}/>{err}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Amount (₹)"><input type="number" min="0" step="1" placeholder="0" value={form.amount} onChange={e => upd('amount', e.target.value)} style={IS}/></Field>
          <Field label="Description"><input type="text" placeholder="What did you spend on?" value={form.description} onChange={e => upd('description', e.target.value)} style={IS}/></Field>
          <Field label="Category">
            <div style={{ position: 'relative' }}>
              <select value={form.category} onChange={e => upd('category', e.target.value)} style={{ ...IS, appearance: 'none', paddingRight: 36 }}>
                {CATS.map(c => <option key={c.label} value={c.label}>{c.emoji} {c.label}</option>)}
              </select>
              <ChevronDown size={16} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}/>
            </div>
          </Field>
          <Field label="Date"><input type="date" value={form.date} onChange={e => upd('date', e.target.value)} style={{ ...IS, colorScheme: 'dark' }}/></Field>
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button onClick={onClose} style={{ flex: 0, background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text-secondary)', fontSize: 14, fontWeight: 500, padding: '13px 20px', cursor: 'pointer' }}>Cancel</button>
            <button onClick={save} disabled={saving} style={{ flex: 1, background: 'var(--accent)', border: 'none', borderRadius: 12, color: '#fff', fontSize: 15, fontWeight: 600, padding: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}>
              {saving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }}/> : <Check size={16}/>}
              {editing ? 'Save Changes' : 'Add Expense'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}><label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>{label}</label>{children}</div>
}

function Tip({ active, payload }) {
  if (!active || !payload?.length) return null
  return <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', fontSize: 13 }}><div style={{ fontWeight: 600, color: payload[0].payload.color || 'var(--accent)' }}>{payload[0].name}</div><div style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{fmt(payload[0].value)}</div></div>
}

function StatCard({ label, value, sub, icon: Icon, color }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={16} color={color}/></div>
      </div>
      <div style={{ fontSize: 22, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, color: 'var(--text-primary)' }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{sub}</div>}
    </div>
  )
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [session, setSession] = useState(undefined) // undefined=loading, null=no session
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('dashboard')
  const [modal, setModal] = useState(null)
  const [filterCat, setFilterCat] = useState('All')
  const [deleting, setDeleting] = useState(null)

  // Track auth session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  const fetchExpenses = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('expenses').select('*').order('date', { ascending: false }).order('created_at', { ascending: false })
    setExpenses(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { if (session) fetchExpenses() }, [session, fetchExpenses])

  const handleSave = async form => {
    const payload = { ...form, user_id: session.user.id }
    if (modal?.id) await supabase.from('expenses').update(payload).eq('id', modal.id)
    else await supabase.from('expenses').insert([payload])
    setModal(null); fetchExpenses()
  }

  const handleDelete = async id => {
    setDeleting(id)
    await supabase.from('expenses').delete().eq('id', id)
    setDeleting(null); fetchExpenses()
  }

  const signOut = () => supabase.auth.signOut()

  // Show nothing while checking session
  if (session === undefined) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 size={32} color="var(--accent)" style={{ animation: 'spin 1s linear infinite' }}/></div>

  // Not logged in → auth screen
  if (!session) return <AuthScreen/>

  // Derived stats
  const total = expenses.reduce((s, e) => s + parseFloat(e.amount), 0)
  const thisMonth = expenses.filter(e => { const d = new Date(e.date); const n = new Date(); return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear() }).reduce((s, e) => s + parseFloat(e.amount), 0)
  const byCat = CATS.map(c => ({ name: c.label, value: expenses.filter(e => e.category === c.label).reduce((s, e) => s + parseFloat(e.amount), 0), color: c.color })).filter(c => c.value > 0)
  const monthly = (() => { const ms = []; const now = new Date(); for (let i = 5; i >= 0; i--) { const d = new Date(now.getFullYear(), now.getMonth() - i, 1); const lbl = d.toLocaleDateString('en-IN', { month: 'short' }); const amt = expenses.filter(e => { const ed = new Date(e.date); return ed.getMonth() === d.getMonth() && ed.getFullYear() === d.getFullYear() }).reduce((s, e) => s + parseFloat(e.amount), 0); ms.push({ name: lbl, amount: Math.round(amt) }) } return ms })()
  const filtered = filterCat === 'All' ? expenses : expenses.filter(e => e.category === filterCat)
  const topCat = [...byCat].sort((a, b) => b.value - a.value)[0]
  const userName = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User'

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '20px 16px', minHeight: '100vh' }}>
      {/* Header */}
      <header style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <h1 style={{ fontSize: 22, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, background: 'linear-gradient(135deg,#818cf8,#6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ExpenseFlow</h1>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Hi, {userName} 👋</p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={() => setModal('add')} style={{ background: 'var(--accent)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 14, fontWeight: 600, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              <Plus size={16}/> Add
            </button>
            <button onClick={signOut} title="Sign out" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text-secondary)', padding: '10px', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <LogOut size={16}/>
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setView('dashboard')} style={{ ...navBtn, ...(view === 'dashboard' ? navActive : {}), flex: 1 }}><LayoutDashboard size={15}/>Dashboard</button>
          <button onClick={() => setView('list')} style={{ ...navBtn, ...(view === 'list' ? navActive : {}), flex: 1 }}><List size={15}/>Expenses</button>
        </div>
      </header>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}><Loader2 size={32} color="var(--accent)" style={{ animation: 'spin 1s linear infinite' }}/></div>
      ) : view === 'dashboard' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12 }}>
            <StatCard label="Total Spent" value={fmt(total)} sub={`${expenses.length} transactions`} icon={DollarSign} color="#6366f1"/>
            <StatCard label="This Month" value={fmt(thisMonth)} sub="Current month" icon={TrendingUp} color="#34d399"/>
            <StatCard label="Avg Expense" value={fmt(expenses.length ? total / expenses.length : 0)} sub="All time" icon={TrendingDown} color="#fbbf24"/>
            <StatCard label="Top Category" value={topCat?.name || '—'} sub={topCat ? fmt(topCat.value) : 'No data'} icon={LayoutDashboard} color="#a855f7"/>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 14 }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 20 }}>
              <h3 style={CT}>Spending by Category</h3>
              {byCat.length === 0 ? <Empty onAdd={() => setModal('add')}/> : (<>
                <ResponsiveContainer width="100%" height={180}><PieChart><Pie data={byCat} cx="50%" cy="50%" innerRadius={50} outerRadius={78} paddingAngle={3} dataKey="value">{byCat.map((e, i) => <Cell key={i} fill={e.color} stroke="none"/>)}</Pie><Tooltip content={<Tip/>}/></PieChart></ResponsiveContainer>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>{byCat.map(c => <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ width: 10, height: 10, borderRadius: 3, background: c.color, flexShrink: 0 }}/><span style={{ fontSize: 12, color: 'var(--text-secondary)', flex: 1 }}>{c.name}</span><span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{fmt(c.value)}</span></div>)}</div>
              </>)}
            </div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 20 }}>
              <h3 style={CT}>Monthly Spending</h3>
              <ResponsiveContainer width="100%" height={200}><BarChart data={monthly} barSize={26}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/><XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false}/><YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`}/><Tooltip content={<Tip/>} cursor={{ fill: 'rgba(99,102,241,0.06)' }}/><Bar dataKey="amount" name="Spent" fill="#6366f1" radius={[6, 6, 0, 0]}/></BarChart></ResponsiveContainer>
            </div>
          </div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 20 }}>
            <h3 style={CT}>Recent Expenses</h3>
            {expenses.length === 0 ? <Empty onAdd={() => setModal('add')}/> : expenses.slice(0, 6).map(e => { const cat = getCat(e.category); return <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 8px', borderRadius: 10 }}><div style={{ width: 36, height: 36, borderRadius: 10, background: `${cat.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{cat.emoji}</div><div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.description}</div><div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{fmtDate(e.date)}</div></div><div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', flexShrink: 0 }}>{fmt(e.amount)}</div></div> })}
          </div>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
            {['All', ...CATS.map(c => c.label)].map(c => <button key={c} onClick={() => setFilterCat(c)} style={{ background: filterCat === c ? 'var(--accent-glow)' : 'var(--bg-card)', border: `1px solid ${filterCat === c ? 'var(--accent)' : 'var(--border)'}`, color: filterCat === c ? 'var(--accent-light)' : 'var(--text-secondary)', borderRadius: 20, padding: '5px 12px', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>{c === 'All' ? 'All' : `${getCat(c).emoji} ${c}`}</button>)}
          </div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
            {filtered.length === 0
              ? <Empty onAdd={() => setModal('add')}/>
              : filtered.map(e => { const cat = getCat(e.category); return (
                <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: `${cat.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>{cat.emoji}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.description}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                      <span style={{ fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 20, background: `${cat.color}18`, color: cat.color }}>{e.category}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{fmtDate(e.date)}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{fmt(e.amount)}</span>
                    <button onClick={() => setModal(e)} style={IB('#6366f1')}><Edit2 size={13}/></button>
                    <button onClick={() => handleDelete(e.id)} disabled={deleting === e.id} style={IB('#f87171')}>{deleting === e.id ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }}/> : <Trash2 size={13}/>}</button>
                  </div>
                </div>
              )})}
          </div>
          <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-muted)', textAlign: 'right' }}>{filtered.length} expense{filtered.length !== 1 ? 's' : ''} · {fmt(filtered.reduce((s, e) => s + parseFloat(e.amount), 0))} total</div>
        </div>
      )}

      {modal && <Modal onClose={() => setModal(null)} onSave={handleSave} editing={modal === 'add' ? null : modal}/>}
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

function Empty({ onAdd }) {
  return (
    <div style={{ padding: '40px 16px', textAlign: 'center' }}>
      <div style={{ fontSize: 36, marginBottom: 10 }}>💸</div>
      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>No expenses yet</div>
      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>Start tracking your spending</div>
      <button onClick={onAdd} style={{ background: 'var(--accent)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 14, fontWeight: 600, padding: '10px 20px', display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}><Plus size={15}/> Add Expense</button>
    </div>
  )
}
