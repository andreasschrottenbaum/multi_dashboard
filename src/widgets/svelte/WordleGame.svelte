<script lang="ts">
  import { onMount, onDestroy } from 'svelte'

  type Language = 'en' | 'de'
  type LetterStatus = 'correct' | 'present' | 'absent' | 'empty'

  const LABELS = {
    en: {
      language: 'Language',
      guess: 'Guess',
      guesses: 'Guesses',
      submit: 'Submit',
      won: 'You Won!',
      lost: 'Game Over',
      playAgain: 'Play Again',
      loading: 'Loading word...'
    },
    de: {
      language: 'Sprache',
      guess: 'Tipp',
      guesses: 'Tipps',
      submit: 'Absenden',
      won: 'Du hast gewonnen!',
      lost: 'Spiel vorbei',
      playAgain: 'Nochmal spielen',
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
  let isFlipped = false

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
    window.addEventListener('toggle-flip-svelte', () => {
      isFlipped = !isFlipped
    })
  })

  onDestroy(() => {
    window.removeEventListener('keydown', handleKeydown)
  })
</script>

<div class="widget-flipper">
  <div class="widget-flip-inner" class:flipped={isFlipped}>
    <div class="widget-flip-front">
      <div class="wordle-game">
        <div class="wordle-header">
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
                    <input type="text" class="wordle-cell current" class:filled={j < currentGuess.length} value={currentGuess[j] || ''} readonly />
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
            <button on:click={submitGuess} class:active={currentGuess.length === 5} disabled={currentGuess.length !== 5 || gameOver || won}>
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
                <button on:click={initGame} class="active">{t.playAgain}</button>
              </div>
            </div>
          {/if}
        {/if}
      </div>
    </div>
    <div class="widget-flip-back">
      <div>
        <h3>Wordle Game</h3> 
        <p><strong>Motivation:</strong> This widget focuses on complex local state, user input handling, validation, and feedback loops — all common patterns in enterprise UIs.</p>
        <p><strong>Description:</strong> Classic word guessing game with English and German language support.</p>
        <p><strong>How to play:</strong> Guess the 5-letter word in 6 attempts. Green = correct position, Yellow = in word wrong position, Gray = not in word.</p>
        <p><strong>Languages:</strong> English (en) and German (de)</p>
      </div>
    </div>
  </div>
</div>

<style>
  .wordle-game {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
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

  .wordle-loading {
    padding: 2rem;
    text-align: center;
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
    min-width: 0;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 1.2rem;
    border-radius: 4px;
    background: var(--secondary-text-color);
    border: 2px solid hsl(from var(--secondary-text-color) h s calc(l - 20));
    text-transform: uppercase;
    text-align: center;
  }

  .wordle-cell.correct {
    background: var(--clr-success);
    border-color: hsl(from var(--clr-success) h s calc(l - 20));
  }

  .wordle-cell.present {
    background: var(--clr-danger);
    border-color: hsl(from var(--clr-danger) h s calc(l - 20));
  }

  .wordle-cell.absent {
    background: var(--border-color);
    border-color: hsl(from var(--border-color) h s calc(l - 20));
  }

  .wordle-cell.current {
    border: 2px solid var(--accent-color);
  }

  .wordle-cell.empty {
    background: var(--clr-background);
  }

  .wordle-controls {
    display: flex;
    gap: 0.5rem;
  }

  .wordle-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: .5em;
    z-index: 100;
  }

  .wordle-result {
    background: var(--card-bg-color);
    padding: 2rem;
    border-radius: .5em;
    text-align: center;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  }

  .wordle-result h4 {
    margin: 0 0 2rem 0;
    font-size: 1.5rem;
  }

  .wordle-result p {
    margin: 0 0 1rem 0;
  }
</style>
