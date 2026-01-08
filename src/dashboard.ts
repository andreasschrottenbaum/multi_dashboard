import './widgets/webcomponents/VanillaCounter'
import ReactCounter from './widgets/react/Counter.tsx'
import VueCounter from './widgets/vue/Counter.vue'
import SvelteCounter from './widgets/svelte/Counter.svelte'
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
        <p>A vanilla TypeScript host with counter widgets in Web Components, React, Vue, and Svelte</p>
        <button id="reset-all" class="reset-all">Reset all widgets</button>
      </header>

      <main class="dashboard-grid">
        <section class="widget-section">
          <div class="widget-header">
            <h2>Web Component</h2>
            <span class="framework-badge">Web Components</span>
          </div>
          <div id="wc-counter"></div>
        </section>

        <section class="widget-section">
          <div class="widget-header">
            <h2>React Widget</h2>
            <span class="framework-badge">React</span>
          </div>
          <div id="react-counter"></div>
        </section>

        <section class="widget-section">
          <div class="widget-header">
            <h2>Vue Widget</h2>
            <span class="framework-badge">Vue</span>
          </div>
          <div id="vue-counter"></div>
        </section>

        <section class="widget-section">
          <div class="widget-header">
            <h2>Svelte Widget</h2>
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
    const el = document.createElement('vanilla-counter')
    wcContainer.appendChild(el)
  }

  // Mount React widget
  const reactContainer = document.querySelector('#react-counter') as HTMLDivElement | null
  if (reactContainer) {
    const root = ReactDOM.createRoot(reactContainer)
    root.render(React.createElement(ReactCounter))
  }

  // Mount Vue widget
  const vueContainer = document.querySelector('#vue-counter') as HTMLDivElement | null
  if (vueContainer) {
    createApp(VueCounter).mount(vueContainer)
  }

  // Mount Svelte widget
  const svelteContainer = document.querySelector('#svelte-counter') as HTMLDivElement | null
  if (svelteContainer) {
    new SvelteCounter({ target: svelteContainer })
  }

  // Wire reset-all button to dispatch a global reset event
  const resetAllBtn = document.querySelector('#reset-all') as HTMLButtonElement | null
  if (resetAllBtn) {
    resetAllBtn.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('reset-widgets'))
    })
  }
}
