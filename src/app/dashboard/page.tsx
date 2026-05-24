'use client'
import { useEffect, useState } from 'react'

type Lead = {
  name: string
  city: string
  service: { name: string }
}

type Assignment = {
  lead: Lead
  createdAt: string
}

type Provider = {
  id: number
  name: string
  monthlyQuota: number
  currentCount: number
  assignments: Assignment[]
}

export default function Dashboard() {
  const [providers, setProviders] = useState<Provider[]>([])
  const [lastUpdated, setLastUpdated] = useState('')

  useEffect(() => {
    let ignore = false

    const loadData = async () => {
      const res = await fetch('/api/dashboard')
      const data = await res.json()
      if (!ignore) {
        setProviders(data)
        setLastUpdated(new Date().toLocaleTimeString())
      }
    }

    loadData()

    const es = new EventSource('/api/sse')
    es.onmessage = () => loadData()
    es.onerror = () => es.close()

    return () => {
      ignore = true
      es.close()
    }
  }, [])

  return (
    <main style={{ maxWidth: 1000, margin: '40px auto', padding: '0 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Provider Dashboard</h1>
        {lastUpdated && (
          <span style={{ fontSize: 13, color: '#888' }}>Last updated: {lastUpdated}</span>
        )}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 16,
        marginTop: 24
      }}>
        {providers.map(p => (
          <div key={p.id} style={{
            border: '1px solid #ddd',
            borderRadius: 10,
            padding: 16,
            background: '#fafafa'
          }}>
            <h2 style={{ margin: '0 0 8px' }}>{p.name}</h2>
            <p style={{ margin: '4px 0', fontSize: 14 }}>
              Quota remaining: <strong>{p.monthlyQuota - p.currentCount}</strong> / {p.monthlyQuota}
            </p>
            <p style={{ margin: '4px 0', fontSize: 14 }}>
              Leads received: <strong>{p.currentCount}</strong>
            </p>
            <div style={{ marginTop: 12 }}>
              <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Assigned Leads:</p>
              {p.assignments.length === 0 ? (
                <p style={{ fontSize: 13, color: '#aaa' }}>No leads yet</p>
              ) : (
                <ul style={{ paddingLeft: 16, margin: 0 }}>
                  {p.assignments.map((a, i) => (
                    <li key={i} style={{ fontSize: 13, marginBottom: 4 }}>
                      {a.lead.name} — {a.lead.city} ({a.lead.service.name})
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}