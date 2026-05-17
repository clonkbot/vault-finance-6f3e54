import { useState, useEffect, useRef } from 'react'
import './styles.css'

// Animated counter component
function AnimatedNumber({ value, prefix = '', suffix = '', decimals = 0, duration = 1500 }: {
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
  duration?: number
}) {
  const [displayValue, setDisplayValue] = useState(0)
  const startTime = useRef<number | null>(null)
  const animationRef = useRef<number>(0)

  useEffect(() => {
    startTime.current = null

    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp
      const progress = Math.min((timestamp - startTime.current) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayValue(eased * value)

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      }
    }

    animationRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationRef.current)
  }, [value, duration])

  const formatted = displayValue.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })

  return <span>{prefix}{formatted}{suffix}</span>
}

// Sparkline mini chart
function Sparkline({ data, color, height = 40 }: { data: number[], color: string, height?: number }) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * 100
    const y = ((val - min) / range) * height
    return `${x},${height - y}`
  }).join(' ')

  return (
    <svg viewBox={`0 0 100 ${height}`} className="w-full" preserveAspectRatio="none">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        points={points}
        vectorEffect="non-scaling-stroke"
      />
      <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={color} stopOpacity="0.3" />
        <stop offset="100%" stopColor={color} stopOpacity="0" />
      </linearGradient>
      <polygon
        fill={`url(#gradient-${color.replace('#', '')})`}
        points={`0,${height} ${points} 100,${height}`}
      />
    </svg>
  )
}

// Transaction row
function TransactionRow({ name, category, amount, date, icon }: {
  name: string
  category: string
  amount: number
  date: string
  icon: string
}) {
  const isExpense = amount < 0

  return (
    <div className="flex items-center justify-between py-4 border-b border-white/5 group hover:bg-white/[0.02] transition-colors px-2 -mx-2 rounded">
      <div className="flex items-center gap-3 md:gap-4">
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center text-lg md:text-xl">
          {icon}
        </div>
        <div>
          <p className="font-medium text-cream text-sm md:text-base">{name}</p>
          <p className="text-xs md:text-sm text-cream/40">{category}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-mono text-sm md:text-base ${isExpense ? 'text-red-400' : 'text-emerald-400'}`}>
          {isExpense ? '-' : '+'}${Math.abs(amount).toLocaleString()}
        </p>
        <p className="text-xs text-cream/30">{date}</p>
      </div>
    </div>
  )
}

// Investment card
function InvestmentCard({ name, symbol, value, change, data, delay }: {
  name: string
  symbol: string
  value: number
  change: number
  data: number[]
  delay: number
}) {
  const isPositive = change >= 0

  return (
    <div
      className="card-glass p-4 md:p-6 rounded-2xl relative overflow-hidden group animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="diagonal-accent" />
      <div className="flex justify-between items-start mb-4 md:mb-6">
        <div>
          <p className="text-cream/50 text-xs md:text-sm uppercase tracking-wider">{symbol}</p>
          <p className="text-cream font-serif text-base md:text-lg">{name}</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${
          isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
        }`}>
          {isPositive ? '+' : ''}{change}%
        </span>
      </div>

      <div className="h-10 md:h-12 mb-3 md:mb-4">
        <Sparkline data={data} color={isPositive ? '#4ADE80' : '#EF4444'} />
      </div>

      <p className="font-mono text-xl md:text-2xl text-cream">
        ${value.toLocaleString()}
      </p>
    </div>
  )
}

// Spending category
function SpendingCategory({ name, amount, percentage, color, delay }: {
  name: string
  amount: number
  percentage: number
  color: string
  delay: number
}) {
  return (
    <div className="animate-fade-up" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex justify-between mb-2">
        <span className="text-cream/70 text-sm">{name}</span>
        <span className="font-mono text-cream text-sm">${amount.toLocaleString()}</span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out animate-width"
          style={{
            backgroundColor: color,
            width: `${percentage}%`
          }}
        />
      </div>
    </div>
  )
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'investments' | 'spending'>('overview')

  const portfolioData = [45000, 47200, 46800, 48500, 49200, 51000, 49800, 52400, 54100, 53200, 55800, 58420]
  const stockData1 = [120, 125, 118, 130, 128, 135, 140, 138, 145, 150, 148, 155]
  const stockData2 = [80, 78, 82, 79, 85, 88, 84, 90, 92, 88, 95, 98]
  const stockData3 = [200, 210, 195, 205, 215, 208, 220, 225, 218, 230, 240, 245]
  const cryptoData = [2800, 2650, 2900, 2750, 3100, 2950, 3200, 3400, 3150, 3500, 3300, 3680]

  const transactions = [
    { name: 'Apple Inc.', category: 'Dividend', amount: 142, date: 'Today', icon: '🍎' },
    { name: 'Netflix', category: 'Subscription', amount: -15.99, date: 'Yesterday', icon: '📺' },
    { name: 'Transfer In', category: 'Bank Transfer', amount: 2500, date: 'Dec 18', icon: '🏦' },
    { name: 'Whole Foods', category: 'Groceries', amount: -127.43, date: 'Dec 17', icon: '🥑' },
    { name: 'Uber', category: 'Transportation', amount: -24.50, date: 'Dec 16', icon: '🚗' },
  ]

  const spending = [
    { name: 'Housing', amount: 2400, percentage: 40, color: '#C9A962' },
    { name: 'Food & Dining', amount: 680, percentage: 28, color: '#4ADE80' },
    { name: 'Transportation', amount: 420, percentage: 18, color: '#60A5FA' },
    { name: 'Entertainment', amount: 280, percentage: 12, color: '#F472B6' },
    { name: 'Other', amount: 220, percentage: 9, color: '#A78BFA' },
  ]

  return (
    <div className="min-h-screen bg-charcoal text-cream selection:bg-gold/30 overflow-x-hidden">
      {/* Noise overlay */}
      <div className="noise-overlay" />

      {/* Gold gradient orb */}
      <div className="fixed top-[-20%] right-[-10%] w-[50vw] md:w-[40vw] h-[50vw] md:h-[40vw] rounded-full bg-gold/5 blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 px-4 md:px-8 lg:px-12 py-6 md:py-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-gold to-gold/60 flex items-center justify-center">
              <span className="text-charcoal font-serif font-bold text-lg md:text-xl">V</span>
            </div>
            <div>
              <h1 className="font-serif text-xl md:text-2xl tracking-tight">Vault</h1>
              <p className="text-cream/40 text-xs">Private Wealth</p>
            </div>
          </div>

          <nav className="flex gap-1 bg-white/5 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
            {(['overview', 'investments', 'spending'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 md:px-5 py-2 md:py-2.5 rounded-lg text-xs md:text-sm capitalize transition-all whitespace-nowrap flex-1 sm:flex-initial ${
                  activeTab === tab
                    ? 'bg-gold text-charcoal font-medium'
                    : 'text-cream/60 hover:text-cream hover:bg-white/5'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 px-4 md:px-8 lg:px-12 pb-8 md:pb-16">
        <div className="max-w-7xl mx-auto">

          {/* Hero stats */}
          <section className="mb-8 md:mb-16 animate-fade-up">
            <p className="text-cream/40 text-xs md:text-sm uppercase tracking-[0.2em] mb-2">Total Net Worth</p>
            <h2 className="font-serif text-4xl sm:text-5xl md:text-7xl lg:text-8xl text-cream mb-4 md:mb-6 leading-none">
              <AnimatedNumber value={284632} prefix="$" decimals={0} duration={2000} />
            </h2>
            <div className="flex flex-wrap items-center gap-3 md:gap-6">
              <span className="flex items-center gap-2 text-emerald-400 text-sm md:text-base">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                </svg>
                +12.4% this month
              </span>
              <span className="text-cream/30 text-sm">|</span>
              <span className="text-cream/50 text-sm">+$31,240 YTD</span>
            </div>
          </section>

          {/* Portfolio chart */}
          <section className="card-glass rounded-2xl md:rounded-3xl p-4 md:p-8 mb-6 md:mb-8 animate-fade-up" style={{ animationDelay: '100ms' }}>
            <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6 md:mb-8 gap-4">
              <div>
                <h3 className="font-serif text-lg md:text-xl text-cream mb-1">Portfolio Performance</h3>
                <p className="text-cream/40 text-sm">12 month overview</p>
              </div>
              <div className="flex gap-2 overflow-x-auto">
                {['1M', '3M', '6M', '1Y', 'ALL'].map((period, i) => (
                  <button
                    key={period}
                    className={`px-3 py-1.5 rounded-lg text-xs transition-all whitespace-nowrap ${
                      i === 3 ? 'bg-gold text-charcoal' : 'text-cream/50 hover:text-cream hover:bg-white/5'
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-32 sm:h-48 md:h-64">
              <Sparkline data={portfolioData} color="#C9A962" height={256} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-6 md:mt-8 pt-6 md:pt-8 border-t border-white/5">
              {[
                { label: 'Invested', value: '$142,500' },
                { label: 'Returns', value: '+$142,132', positive: true },
                { label: 'Dividends', value: '$4,820' },
                { label: 'Cash', value: '$12,340' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-cream/40 text-xs uppercase tracking-wider mb-1">{stat.label}</p>
                  <p className={`font-mono text-base md:text-lg ${stat.positive ? 'text-emerald-400' : 'text-cream'}`}>
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Investment cards */}
          {(activeTab === 'overview' || activeTab === 'investments') && (
            <section className="mb-6 md:mb-8">
              <h3 className="font-serif text-lg md:text-xl text-cream mb-4 md:mb-6">Holdings</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <InvestmentCard name="S&P 500 ETF" symbol="VOO" value={45200} change={8.4} data={stockData1} delay={200} />
                <InvestmentCard name="Apple Inc." symbol="AAPL" value={28400} change={12.1} data={stockData2} delay={300} />
                <InvestmentCard name="Microsoft" symbol="MSFT" value={32100} change={-2.3} data={stockData3} delay={400} />
                <InvestmentCard name="Ethereum" symbol="ETH" value={18600} change={24.7} data={cryptoData} delay={500} />
              </div>
            </section>
          )}

          {/* Two column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            {/* Recent transactions */}
            {(activeTab === 'overview' || activeTab === 'spending') && (
              <section className="card-glass rounded-2xl md:rounded-3xl p-4 md:p-8 animate-fade-up" style={{ animationDelay: '600ms' }}>
                <div className="flex justify-between items-center mb-4 md:mb-6">
                  <h3 className="font-serif text-lg md:text-xl text-cream">Recent Activity</h3>
                  <button className="text-gold text-sm hover:underline">View all</button>
                </div>

                <div>
                  {transactions.map((tx, i) => (
                    <TransactionRow key={i} {...tx} />
                  ))}
                </div>
              </section>
            )}

            {/* Spending breakdown */}
            {(activeTab === 'overview' || activeTab === 'spending') && (
              <section className="card-glass rounded-2xl md:rounded-3xl p-4 md:p-8 animate-fade-up" style={{ animationDelay: '700ms' }}>
                <div className="flex justify-between items-center mb-4 md:mb-6">
                  <h3 className="font-serif text-lg md:text-xl text-cream">Monthly Spending</h3>
                  <span className="font-mono text-cream/60 text-sm">$4,000</span>
                </div>

                <div className="space-y-4 md:space-y-5">
                  {spending.map((cat, i) => (
                    <SpendingCategory key={cat.name} {...cat} delay={800 + i * 100} />
                  ))}
                </div>

                <div className="mt-6 md:mt-8 pt-6 border-t border-white/5">
                  <div className="flex justify-between items-center">
                    <span className="text-cream/50 text-sm">Budget remaining</span>
                    <span className="font-mono text-emerald-400">$1,200</span>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-4 md:px-8 lg:px-12 py-6 md:py-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-cream/30 text-xs">
            Requested by @web-user · Built by @clonkbot
          </p>
        </div>
      </footer>
    </div>
  )
}
