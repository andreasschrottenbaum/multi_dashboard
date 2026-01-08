<script>
  let count = 0

  function increment() {
    count++
  }

  function decrement() {
    count--
  }

  function reset() {
    count = 0
  }
</script>

<svelte:window on:reset-widgets={reset} />

<div class="svelte-counter">
  <div class="counter-display">{count}</div>
  <div class="counter-buttons">
    <button class="counter-btn" on:click={decrement}>−</button>
    <button class="counter-btn" on:click={increment}>+</button>
    <button class="counter-btn reset" on:click={reset}>Reset</button>
  </div>
</div>

<style>
  .svelte-counter {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
</style>
