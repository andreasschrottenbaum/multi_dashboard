## Multi-Framework Dashboard

This project is a **frontend architecture showcase** that demonstrates how different frontend frameworks can be combined in a single application in a clean, maintainable way.

The dashboard consists of multiple widgets, each implemented using a different technology:

* **React**
* **Vue**
* **Svelte**
* **Vanilla Web Components**

All widgets are written in **TypeScript** and integrated via **Web Components**, allowing them to remain framework-agnostic at the application level.

---

## Motivation

Modern frontend teams often face heterogeneous environments:

* Legacy systems mixed with modern frameworks
* Micro-frontends owned by different teams
* Gradual framework migrations

This project explores a solution where **Web Components act as a stable contract**, enabling multiple frameworks to coexist without tight coupling.

The goal is not to compare frameworks by performance or features, but to demonstrate:

* Architectural decision-making
* Framework isolation
* Clean integration patterns

---

## Intent & Constraints

**Intent**

The intent of this project is to demonstrate how architectural control can be maintained in heterogeneous frontend environments. Rather than optimizing for a single framework or maximum development speed, the focus is on **clear boundaries, explicit contracts, and long-term maintainability**.

This dashboard is designed as a controlled integration surface where independently developed widgets can coexist without dictating technology choices to individual teams. The shell application defines the rules; widgets must comply with them.

**Constraints**

The architecture is shaped by several deliberate constraints:

* No shared framework runtime between widgets
* Communication limited to attributes and custom events
* No shared global state by default
* Minimal assumptions about widget internals

These constraints intentionally trade short-term simplicity for predictability, isolation, and team autonomy. They are meant to reflect real-world conditions

**Core ideas:**

* Each widget is a self-contained unit
* No shared framework runtime between widgets
* Communication via attributes and custom events
* Dashboard layout is framework-agnostic

**High-level structure:**

* Shell application: layout, styling, widget orchestration
* Widgets: independently built, bundled, and registered as custom elements

This approach allows widgets to be developed, tested, and replaced independently.

---

## Widgets

### 📰 News Ticker (React)

* Fetches data from a public news API
* Demonstrates async data loading and list rendering
* Shows how React components can be exposed as Web Components

### 🌦️ Weather Widget (Vue)

* City-based weather search and local weather detection
* Demonstrates form handling, API integration, and conditional rendering

### 📈 Crypto Tracker (Web Components)

* Framework-free implementation
* Simple chart rendering and state updates
* Demonstrates how far native Web APIs can go without a framework

### 🎮 Wordle Clone (Svelte)

* Stateful interactive game
* Keyboard input handling
* Demonstrates Svelte’s reactive model inside a Web Component boundary

---

## Technology Stack

* TypeScript
* Web Components (Custom Elements, Shadow DOM)
* React
* Vue
* Svelte
* Vite

---

## Design Decisions & Trade-offs

**Why Web Components?**

* Native browser standard
* Framework-agnostic
* Ideal integration layer for micro-frontends

**Trade-offs:**

* More boilerplate compared to single-framework apps
* Debugging across framework boundaries requires discipline
* Shared global state is intentionally avoided

These trade-offs are acceptable in scenarios where long-term maintainability and team autonomy are priorities.

---

## Accessibility & UX

* Semantic HTML where possible
* Keyboard navigation support for interactive elements
* Focus states for inputs and buttons

Accessibility was considered during implementation, though this project does not aim to be fully WCAG-certified.

---

## Possible Improvements

* Shared design system for widgets
* Lazy-loading widgets
* Cross-widget communication via event bus
* More advanced accessibility support
* Persistent user settings

---

## About Me

I am a frontend developer with a strong focus on **TypeScript**, **UI architecture**, and **maintainable frontend systems**. I enjoy working at the intersection of design and engineering, especially on projects that require thoughtful structure rather than framework lock-in.

This project reflects how I approach frontend development: pragmatic, architecture-aware, and focused on long-term scalability.

---

## License

MIT
