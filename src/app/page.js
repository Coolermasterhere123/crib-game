'use client'
import { useState } from 'react'

export default function Home() {
  const [playerHand, setPlayerHand] = useState([])
  const [computerHand, setComputerHand] = useState([])
  const [crib, setCrib] = useState([])
  const [starterCard, setStarterCard] = useState(null)
  const [discardPhase, setDiscardPhase] = useState(true)
  const [currentTurn, setCurrentTurn] = useState('player')
  const [message, setMessage] = useState('')
  const [scores, setScores] = useState({ player: 0, computer: 0 })
  const [gamePhase, setGamePhase] = useState('deal')
  const [selectedCards, setSelectedCards] = useState([])
  const [playedCards, setPlayedCards] = useState({ player: [], computer: [] })
  const [currentCount, setCurrentCount] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [dealer, setDealer] = useState('player')
  const [roundHistory, setRoundHistory] = useState([])

  const suits = ['♠', '♥', '♦', '♣']
  const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
  const rankValues = { A: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10, J: 10, Q: 10, K: 10 }

  const createDeck = () => {
    const deck = []
    for (let suit of suits) {
      for (let rank of ranks) {
        deck.push({ rank, suit, value: rankValues[rank] })
      }
    }
    return shuffle(deck)
  }

  const shuffle = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]
    }
    return array
  }

  const isRedSuit = (suit) => suit === '♥' || suit === '♦'

  const dealCards = () => {
    const deck = createDeck()
    const player = deck.slice(0, 6)
    const computer = deck.slice(6, 12)
    const starter = deck[12]
    
    setPlayerHand(player)
    setComputerHand(computer)
    setStarterCard(starter)
    setCrib([])
    setSelectedCards([])
    setPlayedCards({ player: [], computer: [] })
    setCurrentCount(0)
    setDiscardPhase(true)
    setGamePhase('discard')
    setMessage('Dealer: ' + (dealer === 'player' ? 'You' : 'Computer') + ' - Select 2 cards to put in the crib')
    setCurrentTurn('player')
    setIsProcessing(false)
    setRoundHistory([])
  }

  const handleDiscard = () => {
    if (selectedCards.length !== 2) {
      setMessage('Select exactly 2 cards to put in the crib')
      return
    }

    const remainingPlayer = playerHand.filter((_, i) => !selectedCards.includes(i))
    const discardedCards = selectedCards.map(i => playerHand[i])
    
    const sortedComputer = [...computerHand].sort((a, b) => b.value - a.value)
    const computerDiscard = sortedComputer.slice(0, 2)
    const remainingComputer = sortedComputer.slice(2)

    setPlayerHand(remainingPlayer)
    setComputerHand(remainingComputer)
    setCrib([...discardedCards, ...computerDiscard])
    setDiscardPhase(false)
    setGamePhase('play')
    setMessage('Start playing cards!')
    setSelectedCards([])
    setPlayedCards({ player: [], computer: [] })
    setCurrentCount(0)
    setCurrentTurn('player')
  }

  const handlePlayCard = (index) => {
    if (currentTurn !== 'player' || isProcessing) return

    const card = playerHand[index]
    const newCount = currentCount + card.value

    if (newCount > 31) {
      setMessage('That would go over 31!')
      return
    }

    const newPlayerHand = [...playerHand]
    newPlayerHand.splice(index, 1)
    setPlayerHand(newPlayerHand)
    setPlayedCards({ ...playedCards, player: [...playedCards.player, card] })
    setCurrentCount(newCount)
    setIsProcessing(true)

    let points = 0
    if (newCount === 31) points = 2
    else if (newCount === 15) points = 2
    
    if (points > 0) {
      setScores(prev => ({ ...prev, player: prev.player + points }))
      setMessage('You scored ' + points + ' points! 🎉')
    }

    if (newPlayerHand.length === 0) {
      setScores(prev => ({ ...prev, player: prev.player + 1 }))
      setMessage('You played your last card! (+1 point)')
      setTimeout(() => {
        setIsProcessing(false)
        scoreRound()
      }, 1200)
      return
    }

    setTimeout(() => {
      setIsProcessing(false)
      if (points === 0) {
        setMessage('Your turn played')
      }
      setCurrentTurn('computer')
      setTimeout(() => computerTurn(), 800)
    }, points > 0 ? 1200 : 300)
  }

  const computerTurn = () => {
    if (isProcessing) return
    setIsProcessing(true)

    if (computerHand.length === 0) {
      setScores(prev => ({ ...prev, computer: prev.computer + 1 }))
      setMessage('Computer played its last card! (+1 point)')
      setTimeout(() => {
        setIsProcessing(false)
        scoreRound()
      }, 1200)
      return
    }

    let bestCard = null
    let bestIndex = -1
    let bestScore = -1

    for (let i = 0; i < computerHand.length; i++) {
      const card = computerHand[i]
      if (currentCount + card.value <= 31) {
        const newCount = currentCount + card.value
        let score = 0
        if (newCount === 31) score = 2
        else if (newCount === 15) score = 2
        if (score > bestScore) {
          bestScore = score
          bestCard = card
          bestIndex = i
        }
      }
    }

    if (bestCard === null) {
      setMessage('Computer passes')
      setCurrentTurn('player')
      setIsProcessing(false)
      return
    }

    const newComputerHand = [...computerHand]
    newComputerHand.splice(bestIndex, 1)
    setComputerHand(newComputerHand)
    const newCount = currentCount + bestCard.value
    setPlayedCards({ ...playedCards, computer: [...playedCards.computer, bestCard] })
    setCurrentCount(newCount)

    if (bestScore > 0) {
      setScores(prev => ({ ...prev, computer: prev.computer + bestScore }))
      setMessage('Computer scored ' + bestScore + ' points! 🤖')
    }

    if (newComputerHand.length === 0) {
      setScores(prev => ({ ...prev, computer: prev.computer + 1 }))
      setMessage('Computer played its last card! (+1 point)')
      setTimeout(() => {
        setIsProcessing(false)
        scoreRound()
      }, 1200)
      return
    }

    setTimeout(() => {
      setIsProcessing(false)
      if (bestScore === 0) {
        setMessage('Computer played')
      }
      setCurrentTurn('player')
    }, bestScore > 0 ? 1200 : 400)
  }

  const scoreRound = () => {
    let playerPoints = 0
    let computerPoints = 0
    
    const allCards = [...playerHand, ...computerHand, ...crib]
    const values = allCards.map(c => c.value)
    
    const counts = {}
    values.forEach(v => { counts[v] = (counts[v] || 0) + 1 })
    for (let v in counts) {
      if (counts[v] === 2) {
        if (playerHand.some(c => c.value === parseInt(v))) {
          playerPoints += 2
        } else {
          computerPoints += 2
        }
      } else if (counts[v] === 3) {
        if (playerHand.some(c => c.value === parseInt(v))) {
          playerPoints += 6
        } else {
          computerPoints += 6
        }
      } else if (counts[v] === 4) {
        if (playerHand.some(c => c.value === parseInt(v))) {
          playerPoints += 12
        } else {
          computerPoints += 12
        }
      }
    }

    if (dealer === 'player') {
      playerPoints += Math.floor(crib.length / 2)
    } else {
      computerPoints += Math.floor(crib.length / 2)
    }

    if (starterCard) {
      const starterValue = starterCard.value
      values.forEach(v => {
        if (v === starterValue) {
          if (dealer === 'player') {
            playerPoints += 1
          } else {
            computerPoints += 1
          }
        }
      })
    }

    setScores(prev => ({
      player: prev.player + playerPoints,
      computer: prev.computer + computerPoints
    }))

    const roundResult = {
      playerPoints,
      computerPoints,
      dealer: dealer === 'player' ? 'You' : 'Computer'
    }
    setRoundHistory([...roundHistory, roundResult])

    setGamePhase('scoring')
    setMessage('Scoring complete! You: +' + playerPoints + ', Computer: +' + computerPoints)
    setIsProcessing(false)
  }

  const nextRound = () => {
    setDealer(prev => prev === 'player' ? 'computer' : 'player')
    dealCards()
  }

  const startGame = () => {
    setScores({ player: 0, computer: 0 })
    setDealer('player')
    setRoundHistory([])
    dealCards()
  }

  const resetGame = () => {
    setScores({ player: 0, computer: 0 })
    setDealer('player')
    setRoundHistory([])
    dealCards()
  }

  const toggleCard = (index) => {
    if (!discardPhase) return
    const newSelected = [...selectedCards]
    const pos = newSelected.indexOf(index)
    if (pos > -1) {
      newSelected.splice(pos, 1)
    } else if (newSelected.length < 2) {
      newSelected.push(index)
    }
    setSelectedCards(newSelected)
  }

  const styles = {
    main: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f0e17, #1a1a2e, #16213e)',
      color: 'white',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      margin: 0,
      padding: '20px'
    },
    container: {
      maxWidth: '750px',
      width: '100%',
      textAlign: 'center',
      padding: '30px',
      background: 'rgba(255,255,255,0.05)',
      borderRadius: '20px',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255,255,255,0.1)'
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      marginBottom: '0.5rem',
      background: 'linear-gradient(135deg, #ff8906, #f25f4c)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent'
    },
    subtitle: {
      fontSize: '1rem',
      opacity: 0.6,
      marginBottom: '1rem'
    },
    dealerDisplay: {
      fontSize: '0.9rem',
      opacity: 0.7,
      marginBottom: '1.5rem'
    },
    scores: {
      display: 'flex',
      justifyContent: 'space-around',
      padding: '15px',
      background: 'rgba(255,255,255,0.05)',
      borderRadius: '12px',
      marginBottom: '1.5rem'
    },
    scoreItem: {
      textAlign: 'center'
    },
    scoreLabel: {
      fontSize: '0.8rem',
      opacity: 0.6,
      textTransform: 'uppercase',
      letterSpacing: '1px'
    },
    scoreValue: {
      fontSize: '2rem',
      fontWeight: 'bold'
    },
    scorePlayer: {
      color: '#4ade80'
    },
    scoreComputer: {
      color: '#f87171'
    },
    message: {
      fontSize: '1.2rem',
      marginBottom: '1rem',
      minHeight: '40px',
      padding: '10px',
      background: 'rgba(255,255,255,0.03)',
      borderRadius: '8px'
    },
    playedCards: {
      display: 'flex',
      justifyContent: 'center',
      gap: '8px',
      marginBottom: '1rem',
      minHeight: '50px',
      flexWrap: 'wrap'
    },
    playedCard: {
      padding: '8px 14px',
      background: 'rgba(255,255,255,0.08)',
      borderRadius: '6px',
      fontSize: '0.9rem',
      fontWeight: 'bold',
      border: '1px solid rgba(255,255,255,0.1)'
    },
    playedCardRed: {
      color: '#f87171'
    },
    playedCardBlack: {
      color: '#e2e8f0'
    },
    playedLabel: {
      fontSize: '0.7rem',
      opacity: 0.5,
      marginRight: '4px'
    },
    cards: {
      display: 'grid',
      gridTemplateColumns: 'repeat(6, 1fr)',
      gap: '8px',
      marginBottom: '1rem'
    },
    card: {
      padding: '12px 4px',
      background: 'rgba(255,255,255,0.05)',
      border: '2px solid rgba(255,255,255,0.1)',
      borderRadius: '8px',
      fontSize: '1.2rem',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      minHeight: '60px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    cardSelected: {
      borderColor: '#ff8906',
      background: 'rgba(255,137,6,0.2)',
      transform: 'scale(1.05)'
    },
    cardDisabled: {
      opacity: 0.5,
      cursor: 'not-allowed'
    },
    cardRed: {
      color: '#f87171'
    },
    cardBlack: {
      color: '#e2e8f0'
    },
    cardPlayed: {
      opacity: 0.3,
      cursor: 'default',
      transform: 'scale(0.9)'
    },
    cribCards: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '8px',
      marginBottom: '1rem'
    },
    cribCard: {
      padding: '8px',
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.05)',
      borderRadius: '6px',
      textAlign: 'center',
      fontSize: '0.9rem',
      opacity: 0.6
    },
    starter: {
      display: 'inline-block',
      padding: '10px 20px',
      background: 'rgba(255,255,255,0.08)',
      borderRadius: '10px',
      marginBottom: '1rem',
      fontSize: '1.3rem',
      fontWeight: 'bold',
      border: '2px solid #ff8906'
    },
    button: {
      padding: '12px 30px',
      fontSize: '1rem',
      background: 'linear-gradient(135deg, #ff8906, #f25f4c)',
      color: 'white',
      border: 'none',
      borderRadius: '50px',
      cursor: 'pointer',
      transition: 'transform 0.2s, opacity 0.2s',
      fontWeight: 'bold',
      margin: '5px'
    },
    buttonSecondary: {
      padding: '12px 30px',
      fontSize: '1rem',
      background: 'rgba(255,255,255,0.05)',
      color: 'white',
      border: '1px solid rgba(255,255,255,0.2)',
      borderRadius: '50px',
      cursor: 'pointer',
      transition: 'transform 0.2s, opacity 0.2s',
      fontWeight: 'bold',
      margin: '5px'
    },
    buttonGroup: {
      display: 'flex',
      justifyContent: 'center',
      gap: '10px',
      flexWrap: 'wrap',
      marginTop: '1rem'
    },
    port: {
      marginTop: '1.5rem',
      fontSize: '0.8rem',
      opacity: 0.4,
      fontFamily: 'monospace'
    },
    handLabel: {
      fontSize: '0.8rem',
      opacity: 0.6,
      textAlign: 'left',
      marginBottom: '0.5rem'
    },
    cribLabel: {
      fontSize: '0.8rem',
      opacity: 0.6,
      textAlign: 'left',
      marginTop: '0.5rem',
      marginBottom: '0.5rem'
    },
    infoRow: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '0.5rem',
      fontSize: '0.9rem',
      opacity: 0.7
    },
    history: {
      marginTop: '1rem',
      padding: '10px',
      background: 'rgba(255,255,255,0.03)',
      borderRadius: '8px',
      fontSize: '0.8rem',
      opacity: 0.6,
      maxHeight: '80px',
      overflow: 'auto'
    },
    roundHistory: {
      fontSize: '0.7rem',
      opacity: 0.5
    }
  }

  return (
    <main style={styles.main}>
      <div style={styles.container}>
        <h1 style={styles.title}>🃏 Crib Game</h1>
        <p style={styles.subtitle}>Port 3005</p>
        <div style={styles.dealerDisplay}>
          Dealer: {dealer === 'player' ? 'You' : 'Computer'}
        </div>

        <div style={styles.scores}>
          <div style={styles.scoreItem}>
            <div style={styles.scoreLabel}>You</div>
            <div style={{...styles.scoreValue, ...styles.scorePlayer}}>{scores.player}</div>
          </div>
          <div style={styles.scoreItem}>
            <div style={styles.scoreLabel}>Computer</div>
            <div style={{...styles.scoreValue, ...styles.scoreComputer}}>{scores.computer}</div>
          </div>
        </div>

        <div style={styles.message}>{message}</div>

        {starterCard && (
          <div style={styles.starter}>
            Starter: <span style={isRedSuit(starterCard.suit) ? {color: '#f87171'} : {color: '#e2e8f0'}}>
              {starterCard.rank}{starterCard.suit}
            </span>
          </div>
        )}

        {(gamePhase === 'play' || gamePhase === 'discard') && (
          <>
            <div style={styles.infoRow}>
              <span>Count: {currentCount}</span>
              <span>Turn: {currentTurn === 'player' ? 'You' : 'Computer'}</span>
            </div>

            <div style={styles.playedCards}>
              <span style={styles.playedLabel}>Played:</span>
              {playedCards.player.map((card, i) => (
                <span key={i} style={{
                  ...styles.playedCard,
                  ...(isRedSuit(card.suit) ? styles.playedCardRed : styles.playedCardBlack)
                }}>
                  {card.rank}{card.suit}
                </span>
              ))}
              {playedCards.computer.map((card, i) => (
                <span key={i} style={{
                  ...styles.playedCard,
                  ...(isRedSuit(card.suit) ? styles.playedCardRed : styles.playedCardBlack)
                }}>
                  🤖{card.rank}{card.suit}
                </span>
              ))}
            </div>
          </>
        )}

        {gamePhase === 'deal' && (
          <button
            onClick={startGame}
            style={styles.button}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            🃏 Deal Cards
          </button>
        )}

        {gamePhase === 'discard' && (
          <>
            <div style={styles.handLabel}>Your hand (select 2 to discard):</div>
            <div style={styles.cards}>
              {playerHand.map((card, i) => (
                <button
                  key={i}
                  onClick={() => toggleCard(i)}
                  style={{
                    ...styles.card,
                    ...(selectedCards.includes(i) ? styles.cardSelected : {}),
                    ...(isRedSuit(card.suit) ? styles.cardRed : styles.cardBlack)
                  }}
                  onMouseEnter={(e) => {
                    if (!selectedCards.includes(i)) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!selectedCards.includes(i)) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                    }
                  }}
                >
                  {card.rank}
                  <span style={{ fontSize: '0.8rem' }}>{card.suit}</span>
                </button>
              ))}
            </div>
            <div style={styles.buttonGroup}>
              <button
                onClick={handleDiscard}
                style={styles.button}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                Discard to Crib
              </button>
            </div>
          </>
        )}

        {gamePhase === 'play' && (
          <>
            <div style={styles.handLabel}>Your hand ({playerHand.length} cards):</div>
            <div style={styles.cards}>
              {playerHand.map((card, i) => (
                <button
                  key={i}
                  onClick={() => handlePlayCard(i)}
                  disabled={currentTurn !== 'player' || isProcessing}
                  style={{
                    ...styles.card,
                    ...(currentTurn !== 'player' || isProcessing ? styles.cardDisabled : {}),
                    ...(isRedSuit(card.suit) ? styles.cardRed : styles.cardBlack)
                  }}
                  onMouseEnter={(e) => {
                    if (currentTurn === 'player' && !isProcessing) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                  }}
                >
                  {card.rank}
                  <span style={{ fontSize: '0.8rem' }}>{card.suit}</span>
                  <span style={{ fontSize: '0.6rem', opacity: 0.5 }}>{card.value}</span>
                </button>
              ))}
            </div>

            {crib.length > 0 && (
              <>
                <div style={styles.cribLabel}>Crib:</div>
                <div style={styles.cribCards}>
                  {crib.map((card, i) => (
                    <div key={i} style={{
                      ...styles.cribCard,
                      ...(isRedSuit(card.suit) ? styles.cardRed : styles.cardBlack)
                    }}>
                      {card.rank}{card.suit}
                    </div>
                  ))}
                </div>
              </>
            )}

            <div style={styles.buttonGroup}>
              <button
                onClick={() => {
                  if (currentTurn === 'player' && !isProcessing) {
                    setCurrentTurn('computer')
                    setTimeout(() => computerTurn(), 500)
                  }
                }}
                style={styles.buttonSecondary}
                disabled={currentTurn !== 'player' || isProcessing}
              >
                Pass Turn
              </button>
            </div>
          </>
        )}

        {gamePhase === 'scoring' && (
          <div style={styles.buttonGroup}>
            <button
              onClick={nextRound}
              style={styles.button}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              🔄 Next Round
            </button>
            <button
              onClick={resetGame}
              style={styles.buttonSecondary}
            >
              📊 Reset Game
            </button>
          </div>
        )}

        {roundHistory.length > 0 && (
          <div style={styles.history}>
            <div style={styles.roundHistory}>
              {roundHistory.map((r, i) => (
                <span key={i}>
                  R{i+1}: {r.dealer} dealer → You +{r.playerPoints}, Computer +{r.computerPoints}
                  {i < roundHistory.length - 1 ? ' | ' : ''}
                </span>
              ))}
            </div>
          </div>
        )}

        <div style={styles.port}>Port: 3005</div>
      </div>
    </main>
  )
}