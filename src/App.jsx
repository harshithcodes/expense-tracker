import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts'
import {
  Plus, Trash2, Edit2, X, Check, TrendingUp,
  TrendingDown, DollarSign, LayoutDashboard, List,
  ChevronDown, Loader2, AlertCircle
} from 'lucide-react'

const CATEGORIES = [
  { label: 'Food & Dining', color: '#f97316', emoji: '🍔' },
  { label: 'Transport',     color: '#3b82f6', emoji: '🚗' },
  { label: 'Entertainment', color: '#a855f7', emoji: '🎮' },
  { label: 'Utilities',     color: '#14b8a6', emoji: '💡' },
  { label: 'Shopping',      color: '#ec4899', emoji: '🛍️' },
  { label: 'Health',        color: '#34d399', emoji: '💊' },
  { label: 'Other',         color: '#94a3b8', emoji: '📦' },
]

const getCat = (label) => CATEGORIES.find(c => c.label === label) || CATEGORIES[6]

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
const fmtDate = (d) => new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, color }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 16,
      padding: '20px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500, letterSpacing: '0.02em' }}>
          {label}
        </span>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: `${color}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Icon size={18} color={color} />
        </div>
      </div>
      <div style={{ fontSize: 28, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: 'var(--text-primary)' }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{sub}</div>}
    </div>
  )
}

// ─── Add / Edit Modal ─────────────────────────────────────────────────────────
function ExpenseModal({ onClose, onSave, editing }) {
  const [form, setForm] = useState(
    editing
      ? { amount: editing.amount, description: editing.description, category: editing.category, date: editing.date }
      : { amount: '', description: '', category: 'Food & Dining', date: new Date().toISOString().split('T')[0] }
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.amount || !form.description || !form.date) { setError('Please fill all fields.'); return }
    if (isNaN(parseFloat(form.amount)) || parseFloat(form.amount) <= 0) { setError('Amount must be positive.'); return }
    setSaving(true)
    setError('')
    await onSave({ ...form, amount: parseFloat(form.amount) })
    setSaving(false)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 20, padding: 28, width: '100%', maxWidth: 440,
        boxShadow: '0 24px 80px rgba(0,0,0,0.5)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>
            {editing ? 'Edit Expense' : 'Add Expense'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', padding: 4 }}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center', color: '#f87171', fontSize: 14 }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field label="Amount ($)">
            <input
              type="number" min="0" step="0.01" placeholder="0.00"
              value={form.amount} onChange={e => update('amount', e.target.value)}
              style={inputStyle}
            />
          </Field>

          <Field label="Description">
            <input
              type="text" placeholder="What did you spend on?"
              value={form.description} onChange={e => update('description', e.target.value)}
              style={inputStyle}
            />
          </Field>

          <Field label="Category">
            <div style={{ position: 'relative' }}>
              <select
                value={form.category} onChange={e => update('category', e.target.value)}
                style={{ ...inputStyle, appearance: 'none', paddingRight: 36 }}
              >
                {CATEGORIES.map(c => (
                  <option key={c.label} value={c.label}>{c.emoji} {c.label}</option>
                ))}
              </select>
              <ChevronDown size={16} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            </div>
          </Field>

          <Field label="Date">
            <input
              type="date" value={form.date} onChange={e => update('date', e.target.value)}
              style={{ ...inputStyle, colorScheme: 'dark' }}
            />
          </Field>

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button onClick={onClose} style={secondaryBtn}>Cancel</button>
            <button onClick={handleSave} disabled={saving} style={primaryBtn}>
              {saving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={16} />}
              {editing ? 'Save Changes' : 'Add Expense'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>{label}</label>
      {children}
    </div>
  )
}

const inputStyle = {
  background: 'var(--bg-input)', border: '1px solid var(--border)',
  borderRadius: 10, padding: '10px 14px', color: 'var(--text-primary)',
  fontSize: 15, outline: 'none', width: '100%',
  transition: 'border-color 0.2s',
}

const primaryBtn = {
  flex: 1, background: 'var(--accent)', border: 'none', borderRadius: 10,
  color: '#fff', fontSize: 15, fontWeight: 600, padding: '11px 20px',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  transition: 'opacity 0.2s',
}

const secondaryBtn = {
  flex: 0, background: 'var(--bg-input)', border: '1px solid var(--border)',
  borderRadius: 10, color: 'var(--text-secondary)', fontSize: 15,
  fontWeight: 500, padding: '11px 20px', transition: 'opacity 0.2s',
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', fontSize: 13 }}>
      <div style={{ fontWeight: 600, color: payload[0].payload.color || 'var(--accent)' }}>{payload[0].name}</div>
      <div style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{fmt(payload[0].value)}</div>
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('dashboard') // dashboard | list
  const [modal, setModal] = useState(null) // null | 'add' | expense object
  const [filterCat, setFilterCat] = useState('All')
  const [deleting, setDeleting] = useState(null)

  const fetchExpenses = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
    if (!error) setExpenses(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchExpenses() }, [fetchExpenses])

  const handleSave = async (form) => {
    if (modal && modal.id) {
      await supabase.from('expenses').update(form).eq('id', modal.id)
    } else {
      await supabase.from('expenses').insert([form])
    }
    setModal(null)
    fetchExpenses()
  }

  const handleDelete = async (id) => {
    setDeleting(id)
    await supabase.from('expenses').delete().eq('id', id)
    setDeleting(null)
    fetchExpenses()
  }

  // ── Derived stats ──────────────────────────────────────────────────────────
  const total = expenses.reduce((s, e) => s + parseFloat(e.amount), 0)
  const thisMonth = expenses.filter(e => {
    const d = new Date(e.date)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).reduce((s, e) => s + parseFloat(e.amount), 0)

  const byCat = CATEGORIES.map(c => ({
    name: c.label,
    value: expenses.filter(e => e.category === c.label).reduce((s, e) => s + parseFloat(e.amount), 0),
    color: c.color,
  })).filter(c => c.value > 0)

  // Last 6 months bar chart
  const monthlyData = (() => {
    const months = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const label = d.toLocaleDateString('en-US', { month: 'short' })
      const total = expenses.filter(e => {
        const ed = new Date(e.date)
        return ed.getMonth() === d.getMonth() && ed.getFullYear() === d.getFullYear()
      }).reduce((s, e) => s + parseFloat(e.amount), 0)
      months.push({ name: label, amount: parseFloat(total.toFixed(2)) })
    }
    return months
  })()

  const filtered = filterCat === 'All' ? expenses : expenses.filter(e => e.category === filterCat)

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '20px 16px', minHeight: '100vh' }}>
      {/* Header */}
      <header style={{ marginBottom: 24 }}>
        {/* Top row: title + Add button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <h1 style={{ fontSize: 22, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, background: 'linear-gradient(135deg, #818cf8, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              ExpenseFlow
            </h1>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Track every dollar, effortlessly</p>
          </div>
          <button onClick={() => setModal('add')} style={{ background: 'var(--accent)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 14, fontWeight: 600, padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <Plus size={16} /> Add Expense
          </button>
        </div>
        {/* Bottom row: nav tabs full width */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setView('dashboard')}
            style={{ ...navBtn, ...(view === 'dashboard' ? navBtnActive : {}), flex: 1, justifyContent: 'center' }}
          >
            <LayoutDashboard size={15} /> Dashboard
          </button>
          <button
            onClick={() => setView('list')}
            style={{ ...navBtn, ...(view === 'list' ? navBtnActive : {}), flex: 1, justifyContent: 'center' }}
          >
            <List size={15} /> Expenses
          </button>
        </div>
      </header>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
          <Loader2 size={32} color="var(--accent)" style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      ) : view === 'dashboard' ? (
        <Dashboard
          expenses={expenses} total={total} thisMonth={thisMonth}
          byCat={byCat} monthlyData={monthlyData}
          onAdd={() => setModal('add')}
        />
      ) : (
        <ExpenseList
          expenses={filtered} allExpenses={expenses}
          filterCat={filterCat} setFilterCat={setFilterCat}
          onEdit={e => setModal(e)}
          onDelete={handleDelete}
          deleting={deleting}
          onAdd={() => setModal('add')}
        />
      )}

      {modal && (
        <ExpenseModal
          onClose={() => setModal(null)}
          onSave={handleSave}
          editing={modal === 'add' ? null : modal}
        />
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .expense-row:hover { background: var(--bg-card-hover) !important; }
        input:focus, select:focus { border-color: var(--border-focus) !important; box-shadow: 0 0 0 3px var(--accent-glow); }
      `}</style>
    </div>
  )
}

const navBtn = {
  background: 'transparent', border: '1px solid var(--border)',
  borderRadius: 10, color: 'var(--text-secondary)', fontSize: 13,
  fontWeight: 500, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s',
}
const navBtnActive = {
  background: 'var(--accent-glow)', border: '1px solid var(--accent)',
  color: 'var(--accent-light)',
}

// ─── Dashboard View ───────────────────────────────────────────────────────────
function Dashboard({ expenses, total, thisMonth, byCat, monthlyData, onAdd }) {
  const topCat = byCat.sort((a, b) => b.value - a.value)[0]
  const avg = expenses.length ? total / expenses.length : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeIn 0.3s ease' }}>
      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
        <StatCard label="Total Spent" value={fmt(total)} sub={`${expenses.length} transactions`} icon={DollarSign} color="#6366f1" />
        <StatCard label="This Month" value={fmt(thisMonth)} sub="Current month" icon={TrendingUp} color="#34d399" />
        <StatCard label="Avg per Expense" value={fmt(avg)} sub="All time" icon={TrendingDown} color="#fbbf24" />
        <StatCard label="Top Category" value={topCat?.name || '—'} sub={topCat ? fmt(topCat.value) : 'No data'} icon={LayoutDashboard} color="#a855f7" />
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 14 }}>
        {/* Pie */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
          <h3 style={cardTitle}>Spending by Category</h3>
          {byCat.length === 0 ? (
            <EmptyChart />
          ) : (
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={byCat} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                    {byCat.map((entry, i) => <Cell key={i} fill={entry.color} stroke="none" />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 140 }}>
                {byCat.map(c => (
                  <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: c.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)', flex: 1 }}>{c.name}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{fmt(c.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bar */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
          <h3 style={cardTitle}>Monthly Spending</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.06)' }} />
              <Bar dataKey="amount" name="Spent" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={cardTitle}>Recent Expenses</h3>
        </div>
        {expenses.length === 0 ? (
          <EmptyState onAdd={onAdd} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {expenses.slice(0, 6).map(e => (
              <ExpenseRow key={e.id} expense={e} compact />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Expense List View ────────────────────────────────────────────────────────
function ExpenseList({ expenses, allExpenses, filterCat, setFilterCat, onEdit, onDelete, deleting, onAdd }) {
  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {['All', ...CATEGORIES.map(c => c.label)].map(c => (
          <button
            key={c}
            onClick={() => setFilterCat(c)}
            style={{
              background: filterCat === c ? 'var(--accent-glow)' : 'var(--bg-card)',
              border: `1px solid ${filterCat === c ? 'var(--accent)' : 'var(--border)'}`,
              color: filterCat === c ? 'var(--accent-light)' : 'var(--text-secondary)',
              borderRadius: 20, padding: '6px 14px', fontSize: 13, fontWeight: 500, cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {c === 'All' ? 'All' : `${getCat(c).emoji} ${c}`}
          </button>
        ))}
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
        {expenses.length === 0 ? (
          <EmptyState onAdd={onAdd} />
        ) : (
          <div>
            {expenses.map(e => (
              <ExpenseRow
                key={e.id} expense={e}
                onEdit={() => onEdit(e)}
                onDelete={() => onDelete(e.id)}
                isDeleting={deleting === e.id}
              />
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: 12, fontSize: 13, color: 'var(--text-muted)', textAlign: 'right' }}>
        {expenses.length} expense{expenses.length !== 1 ? 's' : ''} · {fmt(expenses.reduce((s, e) => s + parseFloat(e.amount), 0))} total
      </div>
    </div>
  )
}

// ─── Expense Row ──────────────────────────────────────────────────────────────
function ExpenseRow({ expense: e, onEdit, onDelete, isDeleting, compact }) {
  const cat = getCat(e.category)

  // Compact version used in dashboard recent list
  if (compact) {
    return (
      <div className="expense-row" style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
        borderRadius: 10, transition: 'background 0.15s',
      }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: `${cat.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
          {cat.emoji}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.description}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{fmtDate(e.date)}</div>
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', flexShrink: 0 }}>{fmt(e.amount)}</div>
      </div>
    )
  }

  // Card-style row for Expenses tab — works on all screen sizes
  return (
    <div className="expense-row" style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '14px 16px', borderBottom: '1px solid var(--border)',
      transition: 'background 0.15s',
    }}>
      {/* Emoji icon */}
      <div style={{ width: 38, height: 38, borderRadius: 10, background: `${cat.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>
        {cat.emoji}
      </div>

      {/* Main info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {e.description}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 20, background: `${cat.color}18`, color: cat.color }}>
            {e.category}
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{fmtDate(e.date)}</span>
        </div>
      </div>

      {/* Amount + actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{fmt(e.amount)}</span>
        <button onClick={onEdit} style={iconBtn('#6366f1')} title="Edit">
          <Edit2 size={13} />
        </button>
        <button onClick={onDelete} disabled={isDeleting} style={iconBtn('#f87171')} title="Delete">
          {isDeleting ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={13} />}
        </button>
      </div>
    </div>
  )
}

const iconBtn = (color) => ({
  width: 30, height: 30, borderRadius: 8, border: 'none',
  background: `${color}15`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', transition: 'opacity 0.15s',
})

const cardTitle = {
  fontSize: 15, fontWeight: 600, color: 'var(--text-primary)',
  fontFamily: "'Space Grotesk', sans-serif", marginBottom: 16,
}

function EmptyState({ onAdd }) {
  return (
    <div style={{ padding: '48px 24px', textAlign: 'center' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>💸</div>
      <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>No expenses yet</div>
      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Add your first expense to start tracking</div>
      <button onClick={onAdd} style={{ ...primaryBtn, display: 'inline-flex', flex: 'none' }}>
        <Plus size={16} /> Add Expense
      </button>
    </div>
  )
}

function EmptyChart() {
  return <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 14 }}>No data yet</div>
}
