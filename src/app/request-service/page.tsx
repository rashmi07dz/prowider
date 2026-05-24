'use client'
import { useState } from 'react'

export default function RequestService() {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    city: '',
    serviceId: '1',
    description: ''
  })
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMsg('')

    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })

    const data = await res.json()

    if (res.ok) {
      setMsg('✅ Lead submitted successfully!')
      setForm({ name: '', phone: '', city: '', serviceId: '1', description: '' })
    } else {
      setMsg(`❌ ${data.error}`)
    }

    setLoading(false)
  }

  return (
    <main style={{ maxWidth: 500, margin: '40px auto', padding: '0 16px', color: '#000' }}>
      <h1>Request a Service</h1>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input
          required
          placeholder="Full Name"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          style={{ padding: 10, fontSize: 15, borderRadius: 6, border: '1px solid #ccc' }}
        />
        <input
          required
          placeholder="Phone Number"
          value={form.phone}
          onChange={e => setForm({ ...form, phone: e.target.value })}
          style={{ padding: 10, fontSize: 15, borderRadius: 6, border: '1px solid #ccc' }}
        />
        <input
          required
          placeholder="City"
          value={form.city}
          onChange={e => setForm({ ...form, city: e.target.value })}
          style={{ padding: 10, fontSize: 15, borderRadius: 6, border: '1px solid #ccc' }}
        />
        <select
          value={form.serviceId}
          onChange={e => setForm({ ...form, serviceId: e.target.value })}
          style={{ padding: 10, fontSize: 15, borderRadius: 6, border: '1px solid #ccc' }}
        >
          <option value="1">Service 1</option>
          <option value="2">Service 2</option>
          <option value="3">Service 3</option>
        </select>
        <textarea
          required
          placeholder="Description"
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
          rows={4}
          style={{ padding: 10, fontSize: 15, borderRadius: 6, border: '1px solid #ccc' }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{ padding: 12, fontSize: 15, borderRadius: 6, background: '#0070f3', color: '#fff', border: 'none', cursor: 'pointer' }}
        >
          {loading ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>
      {msg && (
        <p style={{ marginTop: 16, fontSize: 15 }}>{msg}</p>
      )}
    </main>
  )
}