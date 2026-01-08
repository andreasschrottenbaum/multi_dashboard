interface CryptoData {
  symbol: string
  name: string
  prices: number[][]
  marketCaps: number[][]
}

class CryptoTracker extends HTMLElement {
  selectedCrypto: 'bitcoin' | 'ethereum' = 'bitcoin'
  cryptoData: Map<string, CryptoData> = new Map()
  handleReset: () => void

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.handleReset = this.reset.bind(this)
  }

  async connectedCallback(): Promise<void> {
    window.addEventListener('reset-widgets', this.handleReset as EventListener)
    await this.fetchCryptoData()
    this.render()
  }

  disconnectedCallback(): void {
    window.removeEventListener('reset-widgets', this.handleReset as EventListener)
  }

  async fetchCryptoData(): Promise<void> {
    try {
      const cryptos = ['bitcoin', 'ethereum']
      for (const crypto of cryptos) {
        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/${crypto}/market_chart?vs_currency=usd&days=7&interval=daily`
        )
        const data = await response.json()
        this.cryptoData.set(crypto, {
          symbol: crypto === 'bitcoin' ? 'BTC' : 'ETH',
          name: crypto === 'bitcoin' ? 'Bitcoin' : 'Ethereum',
          prices: data.prices,
          marketCaps: data.market_caps
        })
      }
    } catch (error) {
      console.error('Failed to fetch crypto data:', error)
    }
  }

  createChart(): string {
    const data = this.cryptoData.get(this.selectedCrypto)
    if (!data || !data.prices.length) return ''

    const prices = data.prices.map(p => p[1])
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    const range = maxPrice - minPrice || 1

    const svgWidth = 350
    const svgHeight = 150
    const padding = 20

    const points = prices
      .map((price, i) => {
        const x = padding + (i / (prices.length - 1)) * (svgWidth - 2 * padding)
        const y = svgHeight - padding - ((price - minPrice) / range) * (svgHeight - 2 * padding)
        return `${x},${y}`
      })
      .join(' ')

    const currentPrice = prices[prices.length - 1]
    const previousPrice = prices[0]
    const change = ((currentPrice - previousPrice) / previousPrice) * 100
    const changeColor = change >= 0 ? '#10b981' : '#ef4444'

    return `
      <svg width="100%" height="150" viewBox="0 0 ${svgWidth} ${svgHeight}" preserveAspectRatio="xMidYMid meet" style="border: 1px solid #e5e7eb; border-radius: 6px; background: #f9fafb; max-width: 100%;">
        <polyline points="${points}" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem; font-size: 0.9rem;">
        <div>
          <div style="color: #6b7280;">Current Price</div>
          <div style="font-size: 1.5rem; font-weight: 700; color: #2563eb;">$${currentPrice.toFixed(2)}</div>
        </div>
        <div>
          <div style="color: #6b7280;">7-Day Change</div>
          <div style="font-size: 1.5rem; font-weight: 700; color: ${changeColor};">${change >= 0 ? '+' : ''}${change.toFixed(2)}%</div>
        </div>
      </div>
    `
  }

  render(): void {
    const shadow = this.shadowRoot
    if (!shadow) return

    shadow.innerHTML = `
      <style>
        :host { display: block; }
        .container {
          padding: 1rem;
          background: white;
          border-radius: 8px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        .title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1f2937;
        }
        .selector {
          display: flex;
          gap: 0.5rem;
        }
        .selector button {
          padding: 0.5rem 1rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: white;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }
        .selector button.active {
          background: #2563eb;
          color: white;
          border-color: #2563eb;
        }
        .selector button:hover:not(.active) {
          border-color: #2563eb;
          color: #2563eb;
        }
        .chart-container {
          margin-top: 1rem;
        }
      </style>
      <div class="container">
        <div class="header">
          <div class="title">Crypto Tracker</div>
          <div class="selector">
            <button class="btc-btn active">Bitcoin</button>
            <button class="eth-btn">Ethereum</button>
          </div>
        </div>
        <div class="chart-container">
          ${this.createChart()}
        </div>
      </div>
    `

    const btcBtn = shadow.querySelector('.btc-btn') as HTMLButtonElement
    const ethBtn = shadow.querySelector('.eth-btn') as HTMLButtonElement

    btcBtn?.addEventListener('click', () => {
      this.selectedCrypto = 'bitcoin'
      this.render()
    })

    ethBtn?.addEventListener('click', () => {
      this.selectedCrypto = 'ethereum'
      this.render()
    })
  }

  reset(): void {
    this.selectedCrypto = 'bitcoin'
    this.render()
  }
}

customElements.define('crypto-tracker', CryptoTracker)

export default CryptoTracker
