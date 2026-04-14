'use client'

import { useState } from 'react'
import { clsx } from 'clsx'

const SCENARIOS = [
  {
    label: 'Normal Payment',
    description: 'Low-risk US transaction',
    color: 'green',
    payload: {
      amount: 99.99,
      currency: 'USD',
      merchantId: 'merchant_demo',
      cardLast4: '4242',
      cardCountry: 'US',
    },
  },
  {
    label: 'Large Amount',
    description: 'Unusually large transaction (amount anomaly)',
    color: 'yellow',
    payload: {
      amount: 9999.99,
      currency: 'USD',
      merchantId: 'merchant_demo',
      cardLast4: '1234',
      cardCountry: 'US',
    },
  },
  {
    label: 'Geo Anomaly',
    description: 'Different country → impossible travel score',
    color: 'orange',
    payload: {
      amount: 250.00,
      currency: 'USD',
      merchantId: 'merchant_demo',
      cardLast4: '5678',
      cardCountry: 'RU',
    },
  },
  {
    label: 'Fraud Block',
    description: 'High-risk combo → score >80 → BLOCKED',
    color: 'red',
    payload: {
      amount: 4999.99,
      currency: 'USD',
      merchantId: 'merchant_demo',
      cardLast4: '9999',
      cardCountry: 'KP',
    },
  },
]

interface Result {
  status: string
  fraudScore?: number
  fraudDecision?: string
  provider?: string
  transactionId?: string
  errorMessage?: string
}

export default function TestPaymentPanel() {
  const [loading, setLoading] = useState<string | null>(null)
  const [results, setResults] = useState<Record<string, Result>>({})
  const [customAmount, setCustomAmount] = useState('50.00')
  const [customCountry, setCustomCountry] = useState('US')

  const send = async (label: string, payload: Record<string, unknown>) => {
    setLoading(label)
    const idempotencyKey = `ui-${label.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`
    try {
      const res = await fetch('/api/v1/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': 'dev-api-key-12345',
        },
        body: JSON.stringify({ ...payload, idempotencyKey }),
      })
      const data = await res.json()
      setResults(prev => ({ ...prev, [label]: data }))
    } catch (e) {
      setResults(prev => ({ ...prev, [label]: { status: 'ERROR', errorMessage: String(e) } }))
    } finally {
      setLoading(null)
    }
  }

  const statusColor = (status?: string) => {
    if (!status) return 'text-slate-400'
    if (status === 'SETTLED') return 'text-green-400'
    if (status === 'BLOCKED') return 'text-red-400'
    if (status === 'FAILED') return 'text-orange-400'
    return 'text-yellow-400'
  }

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700">
      <div className="px-4 py-3 border-b border-slate-700">
        <h2 className="text-sm font-semibold text-slate-200">Test Payments</h2>
        <p className="text-xs text-slate-500 mt-0.5">Send demo transactions to see the system in action</p>
      </div>
      <div className="p-3 space-y-2">
        {SCENARIOS.map(({ label, description, color, payload }) => {
          const result = results[label]
          const isLoading = loading === label
          return (
            <div key={label} className="bg-slate-700/50 rounded-lg p-3 border border-slate-600/50">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <span className="text-xs font-semibold text-slate-200">{label}</span>
                  <p className="text-xs text-slate-500">{description}</p>
                </div>
                <button
                  onClick={() => send(label, payload)}
                  disabled={!!loading}
                  className={clsx(
                    'px-3 py-1 rounded text-xs font-medium border transition-colors min-w-[64px]',
                    isLoading
                      ? 'opacity-50 cursor-wait border-slate-600 text-slate-400'
                      : color === 'green' ? 'border-green-700/60 text-green-400 hover:bg-green-900/30'
                      : color === 'yellow' ? 'border-yellow-700/60 text-yellow-400 hover:bg-yellow-900/30'
                      : color === 'orange' ? 'border-orange-700/60 text-orange-400 hover:bg-orange-900/30'
                      : 'border-red-700/60 text-red-400 hover:bg-red-900/30'
                  )}
                >
                  {isLoading ? '…' : 'Send'}
                </button>
              </div>
              {result && (
                <div className="mt-1.5 text-xs font-mono bg-slate-800/60 rounded px-2 py-1 flex gap-3 flex-wrap">
                  <span className={statusColor(result.status)}>{result.status}</span>
                  {result.fraudScore !== undefined && (
                    <span className="text-slate-400">fraud:{result.fraudScore} ({result.fraudDecision})</span>
                  )}
                  {result.provider && <span className="text-slate-400">via {result.provider}</span>}
                  {result.errorMessage && <span className="text-orange-400">{result.errorMessage}</span>}
                </div>
              )}
            </div>
          )
        })}

        {/* Custom payment */}
        <div className="bg-slate-700/50 rounded-lg p-3 border border-slate-600/50">
          <p className="text-xs font-semibold text-slate-200 mb-2">Custom</p>
          <div className="flex gap-2 mb-2">
            <div className="flex-1">
              <label className="text-xs text-slate-500 block mb-0.5">Amount (USD)</label>
              <input
                type="number"
                value={customAmount}
                onChange={e => setCustomAmount(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="w-20">
              <label className="text-xs text-slate-500 block mb-0.5">Country</label>
              <input
                type="text"
                value={customCountry}
                onChange={e => setCustomCountry(e.target.value.toUpperCase().slice(0, 2))}
                maxLength={2}
                className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 uppercase"
              />
            </div>
          </div>
          <button
            onClick={() => send('Custom', {
              amount: parseFloat(customAmount) || 10,
              currency: 'USD',
              merchantId: 'merchant_demo',
              cardLast4: String(Math.floor(1000 + Math.random() * 9000)),
              cardCountry: customCountry || 'US',
            })}
            disabled={!!loading}
            className="w-full py-1.5 text-xs rounded border border-indigo-700/60 text-indigo-400 hover:bg-indigo-900/30 transition-colors disabled:opacity-50"
          >
            {loading === 'Custom' ? 'Sending…' : 'Send Custom Payment'}
          </button>
          {results['Custom'] && (
            <div className="mt-1.5 text-xs font-mono bg-slate-800/60 rounded px-2 py-1 flex gap-3 flex-wrap">
              <span className={statusColor(results['Custom'].status)}>{results['Custom'].status}</span>
              {results['Custom'].fraudScore !== undefined && (
                <span className="text-slate-400">fraud:{results['Custom'].fraudScore} ({results['Custom'].fraudDecision})</span>
              )}
              {results['Custom'].provider && <span className="text-slate-400">via {results['Custom'].provider}</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
