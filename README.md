# Multi-Framework Dashboard (Micro-Frontend Orchestration)

This project is a technical demonstration of a **Micro-Frontend Architecture**. It orchestrates market-leading frontend technologies into a stable, high-performance, and framework-agnostic shell.

## 🚀 Core Concept & Motivation

In modern software engineering—especially within industrial environments (IoT, Automation, Industry 4.0)—code longevity and interoperability are paramount. This dashboard demonstrates how to:

* **Break Down Technological Silos:** Seamlessly integrate React, Vue, and Svelte within a single runtime.
* **Guarantee Future-Proofing:** Leverage native **Web Components** as the standardized interface for external modules.
* **Optimize Performance:** Minimize runtime overhead via efficient build management with **Vite 5**.
* **Maintain UX Consistency:** Deliver a unified look-and-feel across framework boundaries using modern, native CSS without the bloat of utility frameworks.

## 🛠 Tech-Stack & Architecture

The system follows the principle of **"Orchestrated Independence"**: Each widget acts as an autonomous agent but remains subject to central lifecycle management.

| Widget | Technology | Logic / Skill Showcase |
| --- | --- | --- |
| **Shell / Host** | **Svelte + TypeScript** | Layout orchestration, Drag & Drop engine, Global State Sync. |
| **Crypto Pulse** | **Web Components** | Framework-agnosticism, direct DOM manipulation, high performance. |
| **News Aggregator** | **React (TSX)** | Asynchronous data streams (HackerNews API), Effect-based state. |
| **Weather/Vibe** | **Vue.js** | Reactive Two-Way-Binding and Open-Meteo API integration. |
| **Wordle Game** | **Svelte** | Complex local state, high-performance animations & transitions. |

### Key Architectural Features:

* **Global Event Bus:** A "Reset All" command that synchronizes the state across all framework boundaries using native Custom Events.
* **Dynamic Layout Engine:** Native Drag & Drop reordering based on the HTML5 API and CSS Grid—no heavy third-party libraries required.
* **Modern CSS Implementation:** Advanced use of `:where`, `:is`, and **Container Queries** to ensure true widget responsiveness.

## 📂 Project Structure

```text
src/
 ├── main.ts                # TypeScript Entry Point
 ├── dashboard.ts           # Orchestrator (Central Logic & Event Bus)
 ├── style.css              # Design System (Variables & Global Styles)
 └── widgets/               # The Micro-Frontends
      ├── webcomponents/    # Vanilla JS / Web Components
      ├── react/            # React Components & Hooks
      ├── vue/              # Vue SFCs
      └── svelte/           # Svelte Components & Stores

```

## ⚙️ Installation & Development

Designed for maximum compatibility and modern developer experience (DX).

```bash
# Install dependencies
npm install

# Start the dev server (HMR for all frameworks simultaneously)
npm run dev

# Production build
npm run build

```

## 🧩 About the Author

A Senior Fullstack Developer with a background in the Berlin tech scene, currently focusing on high-performance industrial software solutions. This project reflects my commitment to bridging complex backend logic with clean, scalable frontend architectures.