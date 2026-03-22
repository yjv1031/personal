import { useMemo, useState } from 'react'
import CommonLayout from '../../common/CommonLayout'
import './Home.css'

const GAME_COUNT = 5
const NUMBER_COUNT = 6
const MIN_NUMBER = 1
const MAX_NUMBER = 45

function getCurrentTimeMicros() {
  return BigInt(Math.floor((performance.timeOrigin + performance.now()) * 1000))
}

function getMixedUint32() {
  const cryptoValue = new Uint32Array(1)
  crypto.getRandomValues(cryptoValue)

  const timeMicros = getCurrentTimeMicros()
  const lower = timeMicros & 0xffffffffn
  const upper = (timeMicros >> 32n) & 0xffffffffn
  const mixed = (BigInt(cryptoValue[0]) ^ lower ^ upper) & 0xffffffffn

  return Number(mixed)
}

function randomIntInclusive(min: number, max: number) {
  const range = max - min + 1
  const maxUint32 = 0x1_0000_0000
  const limit = Math.floor(maxUint32 / range) * range

  let value = getMixedUint32()
  while (value >= limit) {
    value = getMixedUint32()
  }

  return min + (value % range)
}

function createOneGame() {
  const picked = new Set<number>()

  while (picked.size < NUMBER_COUNT) {
    picked.add(randomIntInclusive(MIN_NUMBER, MAX_NUMBER))
  }

  return [...picked].sort((a, b) => a - b)
}

function Home() {
  const [games, setGames] = useState<number[][]>([])
  const generatedAtMicros = useMemo(() => getCurrentTimeMicros().toString(), [games])

  const handleGenerate = () => {
    const next = Array.from({ length: GAME_COUNT }, () => createOneGame())
    setGames(next)
  }

  return (
    <CommonLayout>
      <section className="lotto">
        <h2>Lotto Number Generator</h2>
        <button type="button" onClick={handleGenerate}>
          5게임 생성
        </button>

        {games.length > 0 && (
          <>
            <p className="generated-time">생성 시각(us): {generatedAtMicros}</p>
            <ul>
              {games.map((game, gameIndex) => (
                <li key={`game-${gameIndex}`}>
                  <strong>{gameIndex + 1}게임</strong>
                  <div className="balls">
                    {game.map((num) => (
                      <span key={`${gameIndex}-${num}`}>{num}</span>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </CommonLayout>
  )
}

export default Home
