# Multi-Framework Dashboard

A TypeScript + Vite dashboard with counter widgets implemented in multiple frameworks:
- **Web Component** (vanilla JavaScript)
- **React** (functional component with hooks)
- **Vue** (single-file component)
- **Svelte** (reactive component)
- **Angular** (separate Angular Element—see instructions below)

## Quick Start

Install dependencies (no `--legacy-peer-deps` needed):

```bash
npm install
```

Run the dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the build:

```bash
npm run preview
```

## Project Structure

```
src/
  main.ts                    # Entry point (TypeScript)
  dashboard.ts               # Dashboard orchestrator
  style.css                  # Global styles
  widgets/
    webcomponents/
      VanillaCounter.ts      # Web Component widget
    react/
      Counter.tsx            # React widget
    vue/
      Counter.vue            # Vue widget
    svelte/
      Counter.svelte         # Svelte widget
```

## Angular Widget Setup (Separate Project)

The Angular counter is implemented as a separate Angular Element (web component). To integrate it:

### 1. Create a new Angular project (in a sibling folder):

```bash
cd ..
ng new angular-counter-widget --routing=false --style=css --skip-git=true
cd angular-counter-widget
```

### 2. Add Angular Elements:

```bash
ng add @angular/elements
npm install @webcomponents/custom-elements --save-dev
```

### 3. Create the counter component:

```bash
ng generate component counter --skip-tests=true
```

Replace `src/app/counter/counter.component.ts` with:

```typescript
import { Component } from '@angular/core'

@Component({
  selector: 'app-counter',
  standalone: true,
  templateUrl: './counter.component.html',
  styleUrls: ['./counter.component.css']
})
export class CounterComponent {
  count = 0

  increment(): void {
    this.count++
  }

  decrement(): void {
    this.count--
  }

  reset(): void {
    this.count = 0
  }
}
```

Replace `src/app/counter/counter.component.html` with:

```html
<div class="counter-display">{{ count }}</div>
<div class="counter-buttons">
  <button class="counter-btn" (click)="decrement()">−</button>
  <button class="counter-btn" (click)="increment()">+</button>
  <button class="counter-btn reset" (click)="reset()">Reset</button>
</div>
```

Add `src/app/counter/counter.component.css`:

```css
.counter-display {
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  color: #2563eb;
  padding: 1rem 0;
  background: #f9fafb;
  border-radius: 6px;
  margin-bottom: 1rem;
}

.counter-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.counter-btn {
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 6px;
  background: #2563eb;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
}

.counter-btn:hover {
  background: #1d4ed8;
}

.counter-btn:active {
  transform: scale(0.98);
}

.counter-btn.reset {
  background: #ef4444;
}

.counter-btn.reset:hover {
  background: #dc2626;
}
```

### 4. Modify `src/main.ts` to bootstrap the component as a web component:

```typescript
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic'
import { createCustomElement } from '@angular/elements'
import { CounterComponent } from './app/counter/counter.component'

createCustomElement(CounterComponent, {
  injector: injector
}).setAsCustomElement()

const element = document.createElement('angular-counter')
document.body.appendChild(element)
```

Actually, a simpler approach: modify `src/main.ts` to:

```typescript
import { bootstrapApplication } from '@angular/platform-browser'
import { createCustomElement } from '@angular/elements'
import { Injector, NgZone } from '@angular/core'
import { CounterComponent } from './app/counter/counter.component'

bootstrapApplication(CounterComponent).then(appRef => {
  const injector = appRef.injector
  const counterElement = createCustomElement(CounterComponent, { injector })
  customElements.define('angular-counter', counterElement)
})
```

### 5. Build the Angular Element:

```bash
ng build
```

The built files will be in `dist/angular-counter-widget/`. You can either:

- **Option A**: Copy the bundle (`dist/angular-counter-widget/main.js`, etc.) and load it in the main dashboard's `index.html`:

  ```html
  <script src="path/to/angular-counter-widget/main.js"></script>
  ```

- **Option B**: Use Vite's dynamic imports or module federation to load the built bundle at runtime.

### 6. Add the widget to the dashboard:

In `src/dashboard.ts`, import and mount the Angular element:

```typescript
// After loading the Angular bundle (see step 5), add:
const angularContainer = document.querySelector('#angular-counter') as HTMLDivElement | null
if (angularContainer) {
  const el = document.createElement('angular-counter')
  angularContainer.appendChild(el)
}
```

And add the section to the dashboard HTML in `src/dashboard.ts`:

```html
<section class="widget-section">
  <div class="widget-header">
    <h2>Angular Widget</h2>
    <span class="framework-badge">Angular</span>
  </div>
  <div id="angular-counter"></div>
</section>
```

## Notes

- All widgets use the same CSS classes for consistent styling.
- The project uses **Vite 5** with official plugins for React, Vue, and Svelte.
- Web Components are native and don't require external plugins.
- **No `--legacy-peer-deps` required**—all dependencies are compatible.
