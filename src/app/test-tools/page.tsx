'use client'
import { useState } from 'react'

export default function TestTools() {
  const [log, setLog] = useState<string[]>([])

  const addLog = (msg: string) => {
    setLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev])
  }

  const resetQuota = async () => {
    const eventId = `quota-reset-${Date.now()}`
    const res = await fetch('/api/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId, action: 'reset_quota' })
    })
    const data = await res.json()
    addLog(`Reset quota: ${JSON.stringify(data)}`)
  }

  const testIdempotency = async () => {
    const eventId = `idempotency-test-fixed-123`
    addLog('Calling webhook 3 times with same eventId...')
    for (let i = 0; i < 3; i++) {
      const res = await fetch('/api/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, action: 'reset_quota' })
      })
      const data = await res.json()
      addLog(`Call ${i + 1}: ${JSON.stringify(data)}`)
    }
  }

  const generateLeads = async () => {
    addLog('Generating 10 concurrent leads...')
    const promises = Array.from({ length: 10 }, (_, i) =>
      fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Test User ${i + 1}`,
          phone: `98000000${String(i).padStart(2, '0')}`,
          city: 'Test City',
          serviceId: (i % 3) + 1,
          description: 'Concurrency test lead'
        })
      }).then(r => r.json())
    )

    const results = await Promise.all(promises)
    const succeeded = results.filter(r => r.success).length
    const failed = results.filter(r => r.error).length
    addLog(`Done: ${succeeded} succeeded, ${failed} failed/duplicate`)
    results.forEach((r, i) => addLog(`Lead ${i + 1}: ${JSON.stringify(r)}`))
  }

  const btnStyle = {
    padding: '12px 16px',
    fontSize: 14,
    borderRadius: 6,
    border: 'none',
    cursor: 'pointer',
    background: '#0070f3',
    color: '#fff',
    width: '100%'
  }

  return (
    <main style={{ maxWidth: 640, margin: '40px auto', padding: '0 16px' }}>
      <h1>Test Tools</h1>
      <p style={{ color: '#666', fontSize: 14 }}>
        Use these tools to test webhook, idempotency, and concurrency.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
        <button onClick={resetQuota} style={btnStyle}>
          🔄 Reset All Provider Quotas (webhook)
        </button>
        <button onClick={testIdempotency} style={{ ...btnStyle, background: '#6366f1' }}>
          🔁 Call Webhook 3× Same Event ID (idempotency test)
        </button>
        <button onClick={generateLeads} style={{ ...btnStyle, background: '#10b981' }}>
          ⚡ Generate 10 Leads Simultaneously (concurrency test)
        </button>
      </div>

      <h2>Log</h2>
      <div style={{
        fontFamily: 'monospace',
        fontSize: 12,
        background: '#f4f4f4',
        padding: 12,
        borderRadius: 8,
        maxHeight: 400,
        overflowY: 'auto',
        border: '1px solid #ddd'
      }}>
        {log.length === 0
          ? <p style={{ color: '#aaa', margin: 0 }}>No activity yet. Click a button above.</p>
          : log.map((l, i) => <div key={i} style={{ marginBottom: 4 }}>{l}</div>)
        }
      </div>
    </main>
  )
}