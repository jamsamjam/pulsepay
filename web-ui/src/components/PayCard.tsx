'use client'

import { useState } from 'react'

interface Result {
  status: string
  fraudScore?: number
  fraudDecision?: string
  errorMessage?: string
}

const statusColor = (s?: string) =>
  s === 'SETTLED' ? 'var(--ok)' : s === 'BLOCKED' ? 'var(--err)' : s === 'FAILED' ? 'var(--warn)' : 'var(--info)'

export default function PayCard() {
  const [amount, setAmount] = useState('50.00')
  const [country, setCountry] = useState('US')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)

  const pay = async () => {
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/v1/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Api-Key': 'dev-api-key-12345' },
        body: JSON.stringify({
          idempotencyKey: `card-${Date.now()}`,
          amount: parseFloat(amount) || 10,
          currency: 'USD',
          merchantId: 'merchant_demo',
          cardLast4: '4242',
          cardCountry: country || 'US',
        }),
      })
      setResult(await res.json())
    } catch (e) {
      setResult({ status: 'ERROR', errorMessage: String(e) })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{
        background: 'linear-gradient(135deg, #2d6a4f 0%, #40916c 55%, #52b788 100%)',
        borderRadius: '18px',
        padding: '20px 20px 18px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 14px 36px rgba(45,106,79,0.28)',
        color: 'white',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, #2A2D2D 50%, #353838 60%, #030504 100%)',
          pointerEvents: 'none',
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px' }}>
            {[0,1,2,3].map(i => (
              <div key={i} style={{ width: '9px', height: '9px', borderRadius: '2px', background: 'rgba(255,255,255,0.5)' }} />
            ))}
          </div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.65 }}>
            <path d="M8.5 12a3.5 3.5 0 0 1 3.5-3.5" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
            <path d="M6 12a6 6 0 0 1 6-6" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
            <path d="M12 12h.01" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>

        <p style={{ margin: '0 0 16px', fontSize: '13px', fontWeight: 500, letterSpacing: '0.06em', opacity: 0.88 }}>
          PulsePay Demo
        </p>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <p style={{ margin: '0 0 3px', fontSize: '10px', opacity: 0.6, letterSpacing: '0.05em' }}>Balance Amount</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
              <span style={{ fontSize: '14px', fontWeight: 500, opacity: 0.8 }}>$</span>
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={e => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  boxShadow: 'none',
                  color: 'white',
                  caretColor: 'rgba(255,255,255,0.8)',
                  fontSize: '22px',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  width: '120px',
                  padding: 0,
                  fontFamily: 'inherit',
                  position: 'relative',
                  zIndex: 1,
                }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '14px', fontSize: '11px', textAlign: 'right' }}>
            <div>
              <p style={{ margin: '0 0 2px', opacity: 0.55, letterSpacing: '0.05em' }}>EXP</p>
              <p style={{ margin: 0, fontWeight: 600 }}>12/26</p>
            </div>
            <div>
              <p style={{ margin: '0 0 2px', opacity: 0.55, letterSpacing: '0.05em' }}>CVV</p>
              <p style={{ margin: 0, fontWeight: 600 }}>335</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: '11px', color: 'var(--text-3)', display: 'block', marginBottom: '5px' }}>Origin</label>
          <input
            type="text"
            value={country}
            onChange={e => setCountry(e.target.value.toUpperCase().slice(0, 2))}
            maxLength={2}
            placeholder="US"
            className="text-input mono"
            style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}
          />
        </div>
        <button
          onClick={pay}
          disabled={loading}
          className="action-button accent"
          style={{ padding: '10px 28px', flexShrink: 0, alignSelf: 'flex-end' }}
        >
          {loading ? '…' : 'Pay'}
        </button>
      </div>

      {result && (
        <div className="mono" style={{
          padding: '10px 12px',
          borderRadius: '12px',
          background: 'rgba(255,255,255,0.75)',
          border: '1px solid var(--border)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          fontSize: '12px',
        }}>
          <span style={{ color: statusColor(result.status), fontWeight: 700 }}>{result.status}</span>
          {result.fraudScore !== undefined && (
            <span style={{ color: 'var(--text-2)' }}>score: {result.fraudScore} · {result.fraudDecision}</span>
          )}
          {result.errorMessage && <span style={{ color: 'var(--err)' }}>{result.errorMessage}</span>}
        </div>
      )}
    </div>
  )
}
