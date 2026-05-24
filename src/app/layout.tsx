import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Prowider Lead Distribution',
  description: 'Mini lead distribution system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ background: '#fff', color: '#000', margin: 0 }}>
        <nav style={{
          padding: '12px 24px',
          borderBottom: '1px solid #eee',
          display: 'flex',
          gap: 24,
          alignItems: 'center',
          background: '#fff'
        }}>
          <span style={{ fontWeight: 700, fontSize: 16, marginRight: 16 }}>
            Prowider
          </span>
          <a href="/request-service" style={{ fontSize: 14, color: '#0070f3', textDecoration: 'none' }}>
            Submit Request
          </a>
          <a href="/dashboard" style={{ fontSize: 14, color: '#0070f3', textDecoration: 'none' }}>
            Dashboard
          </a>
          <a href="/test-tools" style={{ fontSize: 14, color: '#0070f3', textDecoration: 'none' }}>
            Test Tools
          </a>
        </nav>
        {children}
      </body>
    </html>
  )
}