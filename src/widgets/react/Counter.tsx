import React, { useState } from 'react'

export default function Counter(): JSX.Element {
  const [count, setCount] = useState<number>(0)

  return (
    <div className="react-counter">
      <div className="counter-display">{count}</div>
      <div className="counter-buttons">
        <button className="counter-btn" onClick={() => setCount(c => c - 1)}>
          −
        </button>
        <button className="counter-btn" onClick={() => setCount(c => c + 1)}>
          +
        </button>
        <button className="counter-btn reset" onClick={() => setCount(0)}>
          Reset
        </button>
      </div>
    </div>
  )
}
