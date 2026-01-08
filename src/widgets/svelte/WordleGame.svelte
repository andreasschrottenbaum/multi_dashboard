<script lang="ts">
  import { onMount, onDestroy } from 'svelte'

  type Language = 'en' | 'de'
  type LetterStatus = 'correct' | 'present' | 'absent' | 'empty'

  const LABELS = {
    en: {
      title: 'Wordle',
      language: 'Language',
      guess: 'Guess',
      guesses: 'Guesses',
      submit: 'Submit',
      won: 'You Won!',
      lost: 'Game Over',
      playAgain: 'Play Again',
      instructions: 'Guess the word in 6 tries',
      loading: 'Loading word...'
    },
    de: {
      title: 'Wordle',
      language: 'Sprache',
      guess: 'Tipp',
      guesses: 'Tipps',
      submit: 'Absenden',
      won: 'Du hast gewonnen!',
      lost: 'Spiel vorbei',
      playAgain: 'Nochmal spielen',
      instructions: 'Erraten Sie das Wort in 6 Versuchen',
      loading: 'Wort wird geladen...'
    }
  }

  let language: Language = 'en'
  let targetWord = ''
  let guesses: string[] = []
  let currentGuess = ''
  let gameOver = false
  let won = false
  let letterStatuses: Map<string, LetterStatus> = new Map()
  let isLoading = true

  $: t = LABELS[language]
  $: maxGuesses = 6

  async function fetchRandomWord(lang: Language): Promise<string> {
    const wordLists = {
      en: ['ABOUT', 'BEACH', 'DREAM', 'FLAME', 'GHOST', 'HEART', 'LIGHT', 'MUSIC', 'QUEEN', 'WORLD'],
      de: ['ABEND', 'BLUME', 'FARBE', 'GAMER', 'HEUER', 'INGER', 'JAGER', 'KUNST', 'LAGER', 'MUSIK']
    }
    const words = wordLists[lang]
    return words[Math.floor(Math.random() * words.length)]
  }

  async function initGame() {
    isLoading = true
    targetWord = await fetchRandomWord(language)
    guesses = []
    currentGuess = ''
    gameOver = false
    won = false
    letterStatuses = new Map()
    isLoading = false
  }

  function getLetterStatus(letter: string, word: string, pos: number): LetterStatus {
    if (word[pos] === letter) return 'correct'
    if (word.includes(letter)) return 'present'
    return 'absent'
  }

  function submitGuess() {
    if (currentGuess.length !== 5) return
    if (gameOver || won) return

    guesses = [...guesses, currentGuess.toUpperCase()]

    // Update letter statuses
    for (let i = 0; i < 5; i++) {
      const letter = currentGuess[i].toUpperCase()
      const status = getLetterStatus(letter, targetWord, i)
      if (!letterStatuses.has(letter) || status === 'correct') {
        letterStatuses.set(letter, status)
      }
    }

    if (currentGuess.toUpperCase() === targetWord) {
      won = true
      gameOver = true
    } else if (guesses.length >= maxGuesses) {
      gameOver = true
    }

    currentGuess = ''
  }

  function handleKeydown(e: KeyboardEvent) {
    if (gameOver || won || isLoading) return
    if (/^[a-zA-Z]$/.test(e.key)) {
      if (currentGuess.length < 5) {
        currentGuess += e.key.toUpperCase()
      }
    } else if (e.key === 'Backspace') {
      currentGuess = currentGuess.slice(0, -1)
    } else if (e.key === 'Enter') {
      submitGuess()
    }
  }

  function getRowStatus(guess: string): LetterStatus[] {
    return Array.from(guess).map((letter, i) => getLetterStatus(letter, targetWord, i))
  }

  async function handleLanguageChange(event: Event) {
    const select = event.target as HTMLSelectElement
    language = select.value as Language
    await initGame()
  }

  onMount(() => {
    initGame()
    window.addEventListener('keydown', handleKeydown)
    window.addEventListener('reset-widgets', () => {
      initGame()
    })
  })

  onDestroy(() => {
    window.removeEventListener('keydown', handleKeydown)
  })
</script>

<div class="wordle-game">
  <div class="wordle-header">
    <h3>{t.title}</h3>
    <div class="language-selector">
      <label for="language-select">{t.language}:</label>
      <select id="language-select" on:change={handleLanguageChange} disabled={isLoading}>
        <option value="en" selected={language === 'en'}>English</option>
        <option value="de" selected={language === 'de'}>Deutsch</option>
      </select>
    </div>
  </div>

  {#if isLoading}
    <div class="wordle-loading">{t.loading}</div>
  {:else}
    <div class="wordle-board">
      {#each Array(maxGuesses) as _, i}
        <div class="wordle-row">
          {#if i < guesses.length}
            {#each guesses[i] as letter, j}
              <div
                class="wordle-cell"
                class:correct={getRowStatus(guesses[i])[j] === 'correct'}
                class:present={getRowStatus(guesses[i])[j] === 'present'}
                class:absent={getRowStatus(guesses[i])[j] === 'absent'}
              >
                {letter}
              </div>
            {/each}
          {:else if i === guesses.length}
            {#each Array(5) as _, j}
              <div class="wordle-cell current" class:filled={j < currentGuess.length}>
                {currentGuess[j] || ''}
              </div>
            {/each}
          {:else}
            {#each Array(5) as _}
              <div class="wordle-cell empty" />
            {/each}
          {/if}
        </div>
      {/each}
    </div>

    <div class="wordle-controls">
      <button on:click={submitGuess} disabled={currentGuess.length !== 5 || gameOver || won}>
        {t.submit}
      </button>
    </div>

    <div class="wordle-info">
      <p>{t.guesses}: {guesses.length}/{maxGuesses}</p>
    </div>

    {#if gameOver || won}
      <div class="wordle-overlay">
        <div class="wordle-result">
          {#if won}
            <h4>{t.won}</h4>
          {:else}
            <h4>{t.lost}</h4>
            <p>Word: {targetWord}</p>
          {/if}
          <button on:click={initGame}>{t.playAgain}</button>
        </div>
      </div>
    {/if}

    <div class="wordle-instructions">
      <p>{t.instructions}</p>
    </div>
  {/if}
</div>

<style>
  .wordle-game {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
  }

  .wordle-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    gap: 1rem;
  }

  .wordle-header h3 {
    margin: 0;
    font-size: 1.5rem;
    color: #1f2937;
  }

  .language-selector {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .language-selector label {
    font-size: 0.9rem;
    font-weight: 600;
  }

  .language-selector select {
    padding: 0.4rem 0.6rem;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-size: 0.9rem;
    cursor: pointer;
  }

  .wordle-loading {
    padding: 2rem;
    text-align: center;
    color: #6b7280;
    font-size: 1rem;
  }

  .wordle-board {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .wordle-row {
    display: flex;
    gap: 0.5rem;
  }

  .wordle-cell {
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 1.2rem;
    border: 2px solid #d1d5db;
    border-radius: 4px;
    background: white;
    color: #1f2937;
    text-transform: uppercase;
  }

  .wordle-cell.correct {
    background: #10b981;
    color: white;
    border-color: #059669;
  }

  .wordle-cell.present {
    background: #f59e0b;
    color: white;
    border-color: #d97706;
  }

  .wordle-cell.absent {
    background: #9ca3af;
    color: white;
    border-color: #6b7280;
  }

  .wordle-cell.current {
    border: 2px solid #2563eb;
  }

  .wordle-cell.current.filled {
    background: #f3f4f6;
  }

  .wordle-cell.empty {
    background: #f9fafb;
  }

  .wordle-controls {
    display: flex;
    gap: 0.5rem;
  }

  .wordle-controls button {
    padding: 0.75rem 1.5rem;
    background: #2563eb;
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
  }

  .wordle-controls button:hover:not(:disabled) {
    background: #1d4ed8;
  }

  .wordle-controls button:disabled {
    background: #d1d5db;
    cursor: not-allowed;
  }

  .wordle-info {
    text-align: center;
    font-size: 0.9rem;
    color: #6b7280;
  }

  .wordle-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    z-index: 100;
  }

  .wordle-result {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    text-align: center;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  }

  .wordle-result h4 {
    margin: 0 0 0.5rem 0;
    font-size: 1.5rem;
  }

  .wordle-result p {
    margin: 0 0 1rem 0;
    color: #6b7280;
  }

  .wordle-result button {
    padding: 0.75rem 1.5rem;
    background: #2563eb;
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
  }

  .wordle-result button:hover {
    background: #1d4ed8;
  }

  .wordle-instructions {
    text-align: center;
    padding: 0.75rem;
    background: #f9fafb;
    border-radius: 4px;
    font-size: 0.85rem;
    color: #6b7280;
  }

  .wordle-instructions p {
    margin: 0;
  }
</style>
