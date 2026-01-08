class VanillaCounter extends HTMLElement {
  count: number = 0

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.render()
  }

  render(): void {
    const shadow = this.shadowRoot
    if (!shadow) return

    shadow.innerHTML = `
      <style>
        :host { display: block; }
        .display {
          font-size: 2.5rem;
          font-weight: 700;
          text-align: center;
          color: #2563eb;
          padding: 1rem 0;
          background: #f9fafb;
          border-radius: 6px;
          margin-bottom: 1rem;
        }
        .buttons {
          display: flex;
          gap: 0.5rem;
          justify-content: center;
        }
        button {
          padding: 0.6rem 1.2rem;
          border: none;
          border-radius: 6px;
          background: #2563eb;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s, transform 0.1s;
        }
        button:hover { background: #1d4ed8; }
        button:active { transform: scale(0.98); }
        button.reset { background: #ef4444; }
        button.reset:hover { background: #dc2626; }
      </style>
      <div class="display">${this.count}</div>
      <div class="buttons">
        <button class="dec">−</button>
        <button class="inc">+</button>
        <button class="reset">Reset</button>
      </div>
    `

    const display = shadow.querySelector('.display') as HTMLElement
    const dec = shadow.querySelector('.dec') as HTMLButtonElement
    const inc = shadow.querySelector('.inc') as HTMLButtonElement
    const reset = shadow.querySelector('.reset') as HTMLButtonElement

    dec?.addEventListener('click', () => {
      this.count--
      display.textContent = String(this.count)
    })

    inc?.addEventListener('click', () => {
      this.count++
      display.textContent = String(this.count)
    })

    reset?.addEventListener('click', () => {
      this.count = 0
      display.textContent = String(this.count)
    })
  }
}

customElements.define('vanilla-counter', VanillaCounter)

export default VanillaCounter
