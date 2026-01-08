import './widgets/webcomponents/CryptoTracker.ts'
import NewsTicker from './widgets/react/NewsTicker.tsx'
import WeatherWidget from './widgets/vue/WeatherWidget.vue'
import WordleGame from './widgets/svelte/WordleGame.svelte'
import * as React from 'react'
import * as ReactDOM from 'react-dom/client'
import { createApp } from 'vue'

export function setupDashboard(): void {
  const appEl = document.querySelector('#app') as HTMLDivElement | null
  if (!appEl) return

  appEl.innerHTML = `
    <div class="dashboard">
      <header class="dashboard-header">
        <h1>Multi-Framework Dashboard</h1>
        <p>A TypeScript dashboard with widgets in Web Components, React, Vue, and Svelte</p>
        <p>See the source code on <a href="https://github.com/andreasschrottenbaum/multi_dashboard/tree/main">GitHub</a>.</p>
        <button id="reset-all" class="reset-all">Reset all widgets</button>
      </header>

      <main class="dashboard-grid">
        <section class="widget-section" data-widget-id="wc" draggable="true">
          <div class="widget-header">
            <h2>Crypto Tracker</h2>
            <span class="framework-badge">Web Components</span>
          </div>
          <div id="wc-counter"></div>
        </section>

        <section class="widget-section" data-widget-id="react" draggable="true">
          <div class="widget-header">
            <h2>News Ticker</h2>
            <span class="framework-badge">React</span>
          </div>
          <div id="react-counter"></div>
        </section>

        <section class="widget-section" data-widget-id="vue" draggable="true">
          <div class="widget-header">
            <h2>Weather</h2>
            <span class="framework-badge">Vue</span>
          </div>
          <div id="vue-counter"></div>
        </section>

        <section class="widget-section" data-widget-id="svelte" draggable="true">
          <div class="widget-header">
            <h2>Wordle</h2>
            <span class="framework-badge">Svelte</span>
          </div>
          <div id="svelte-counter"></div>
        </section>
      </main>
    </div>
  `

  // Mount Web Component (custom element auto-registers)
  const wcContainer = document.querySelector('#wc-counter') as HTMLDivElement | null
  if (wcContainer) {
    const el = document.createElement('crypto-tracker')
    wcContainer.appendChild(el)
  }

  // Mount React widget
  const reactContainer = document.querySelector('#react-counter') as HTMLDivElement | null
  if (reactContainer) {
    const root = ReactDOM.createRoot(reactContainer)
    root.render(React.createElement(NewsTicker))
  }

  // Mount Vue widget
  const vueContainer = document.querySelector('#vue-counter') as HTMLDivElement | null
  if (vueContainer) {
    createApp(WeatherWidget).mount(vueContainer)
  }

  // Mount Svelte widget
  const svelteContainer = document.querySelector('#svelte-counter') as HTMLDivElement | null
  if (svelteContainer) {
    new WordleGame({ target: svelteContainer })
  }

  // Wire reset-all button to dispatch a global reset event
  const resetAllBtn = document.querySelector('#reset-all') as HTMLButtonElement | null
  if (resetAllBtn) {
    resetAllBtn.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('reset-widgets'))
    })
  }

  // Drag & drop: reorder widget sections and persist order to localStorage
  const mainGrid = appEl.querySelector('.dashboard-grid') as HTMLElement | null
  if (mainGrid) {
    const saveOrder = () => {
      const order: string[] = Array.from(mainGrid.querySelectorAll('.widget-section'))
        .map((s) => (s as HTMLElement).dataset.widgetId || '')
        .filter(Boolean)
      localStorage.setItem('widgetOrder', JSON.stringify(order))
    }

    const restoreOrder = () => {
      try {
        const raw = localStorage.getItem('widgetOrder')
        if (!raw) return
        const order: string[] = JSON.parse(raw)
        if (!Array.isArray(order)) return
        for (const id of order) {
          const el = mainGrid.querySelector(`.widget-section[data-widget-id="${id}"]`) as HTMLElement | null
          if (el) mainGrid.appendChild(el)
        }
      } catch (e) {
        // ignore parse errors
      }
    }

    // Restore previously-saved order before mounting widgets (if any)
    restoreOrder()

    let draggedId: string | null = null

    const onDragStart = (e: DragEvent) => {
      const target = e.currentTarget as HTMLElement | null
      if (!target) return
      draggedId = target.dataset.widgetId || null
      e.dataTransfer?.setData('text/plain', draggedId || '')
      e.dataTransfer!.effectAllowed = 'move'
      target.classList.add('dragging')
    }

    const onDragEnd = (e: DragEvent) => {
      const target = e.currentTarget as HTMLElement | null
      if (target) target.classList.remove('dragging')
      draggedId = null
    }

    const onDragOver = (e: DragEvent) => {
      e.preventDefault()
      e.dataTransfer!.dropEffect = 'move'
    }

    const onDrop = (e: DragEvent) => {
      e.preventDefault()
      const target = e.currentTarget as HTMLElement | null
      if (!target) return
      const data = e.dataTransfer?.getData('text/plain') || draggedId
      if (!data) return
      const draggedEl = mainGrid.querySelector(`.widget-section[data-widget-id="${data}"]`) as HTMLElement | null
      if (!draggedEl || draggedEl === target) return
      mainGrid.insertBefore(draggedEl, target)
      saveOrder()
    }

    const sections = Array.from(mainGrid.querySelectorAll('.widget-section')) as HTMLElement[]
    sections.forEach((sec) => {
      sec.addEventListener('dragstart', onDragStart)
      sec.addEventListener('dragend', onDragEnd)
      sec.addEventListener('dragover', onDragOver)
      sec.addEventListener('drop', onDrop)
    })
  }
}
