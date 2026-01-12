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
  isFlipped: boolean = false
  isInitialized: boolean = false
  failedToFetch: boolean = false

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.handleReset = this.reset.bind(this)
  }

  async connectedCallback(): Promise<void> {
    if (this.isInitialized) return
    this.isInitialized = true

    window.addEventListener('reset-widgets', this.handleReset as EventListener)
    window.addEventListener('toggle-flip-wc', () => {
      this.isFlipped = !this.isFlipped
      this.render()
    })
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
          `https://api.coingecko.com/api/v3/coins/${crypto}/market_chart?vs_currency=eur&days=7&interval=daily`
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
      this.failedToFetch = true

      // Fallback to static data in case of fetch failure
      this.cryptoData.set('bitcoin', {
        symbol: 'BTC',
        name: 'Bitcoin',
        prices: [[1767657600000,93926.7956485658],[1767744000000,93666.86387314305],[1767830400000,91257.15544035907],[1767916800000,90983.51578142625],[1768003200000,90504.89560340019],[1768089600000,90442.01907847001],[1768176000000,90819.36598904192],[1768182821000,91332.45154303852]],
        marketCaps: [[1767657600000,1876558232963.0544],[1767744000000,1870043996457.1855],[1767830400000,1822220317807.3809],[1767916800000,1817249307661.4592],[1768003200000,1807784901284.322],[1768089600000,1806483854865.5005],[1768176000000,1814078415941.0112],[1768182821000,1824417146676.6152]]
      })


      this.cryptoData.set('ethereum', {
        symbol: 'ETH',
        name: 'Ethereum',
        prices: [[1767657600000,3228.2962247842056],[1767744000000,3295.101927879638],[1767830400000,3164.794750249208],[1767916800000,3104.220322474917],[1768003200000,3083.1361173724354],[1768089600000,3082.9653288303607],[1768176000000,3119.3619360372772],[1768182840000,3123.5351899627035]],
        marketCaps: [[1767657600000,389933475562.2665],[1767744000000,397608381234.7261],[1767830400000,381974224305.5651],[1767916800000,374637574706.1186],[1768003200000,372149000810.8756],[1768089600000,372186920089.48895],[1768176000000,376488796661.5709],[1768182840000,377064259286.1257]]
      })
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
          <div style="font-size: 1.5rem; font-weight: 700; color: #2563eb;">€${currentPrice.toFixed(2)}</div>
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
        .flipper { perspective: 1000px; min-height: 100%; }
        .flip-inner { position: relative; width: 100%; transition: transform 0.6s; transform-style: preserve-3d; }
        .flip-inner.flipped { transform: rotateY(180deg); }
        .flip-front, .flip-back { backface-visibility: hidden; width: 100%; position: absolute; }
        .flip-back { transform: rotateY(180deg); }
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
        .error {
          margin-top: 1rem;
          color: #ef4444;
          font-weight: 600;
          background: #fee2e2;
          padding: 0.5rem;
        }
      </style>
      <div class="flipper">
        <div class="flip-inner ${this.isFlipped ? 'flipped' : ''}">
          <div class="flip-front">
            <div class="container">
              <div class="header">
                <div class="title">Crypto Tracker</div>
                <div class="selector">
                  <button class="btc-btn ${this.selectedCrypto === 'bitcoin' ? 'active' : ''}">Bitcoin</button>
                  <button class="eth-btn ${this.selectedCrypto === 'ethereum' ? 'active' : ''}">Ethereum</button>
                </div>
              </div>
              <div class="chart-container">
                ${this.createChart()}
              </div>

              ${this.failedToFetch ? `<div class="error">Failed to fetch live data. Displaying static data.</div>` : ''}
            </div>
          </div>
          <div class="flip-back">
            <div style="padding: 1rem;">
              <h3 style="margin-top: 0;">Crypto Tracker</h3>
              <p><strong>Description:</strong> Real-time cryptocurrency price tracking and 7-day trend analysis.</p>
              <p><strong>Features:</strong> Bitcoin and Ethereum price charts, 7-day price changes, interactive crypto selection.</p>
              <p><strong>Data Source:</strong> CoinGecko API (free, no authentication required)</p>
            </div>
          </div>
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
    this.isFlipped = false
    this.render()
  }
}

customElements.define('crypto-tracker', CryptoTracker)

export default CryptoTracker
