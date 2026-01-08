import React, { useState, useEffect } from 'react'

export default function Counter(): JSX.Element {
  const [count, setCount] = useState<number>(0)

  useEffect(() => {
    const handler = () => setCount(0)
    window.addEventListener('reset-widgets', handler as EventListener)
    return () => window.removeEventListener('reset-widgets', handler as EventListener)
  }, [])

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
