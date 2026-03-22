import { useEffect, useState } from 'react'
import type { KLineData } from 'klinecharts'
import CommonLayout from '../../common/CommonLayout'
import CoinChart from './component/CoinChart'

type UpbitDayCandle = {
  timestamp: number
  opening_price: number
  high_price: number
  low_price: number
  trade_price: number
  candle_acc_trade_volume: number
}

type BreakoutStat = {
  market: string
  todayProximityPct: number
  yesterdayProximityPct: number
  twoDaysAgoProximityPct: number
  bestRecent3DayProximityPct: number
  candles: KLineData[]
}

type CoinCachePayload = {
  fetchedAt: number
  stats: BreakoutStat[]
}

const ACTIVE_MARKETS = [
  'KRW-BTC',
  'KRW-ETH',
  'KRW-XRP',
  'KRW-SOL',
  'KRW-DOGE',
  'KRW-SUI',
  'KRW-LINK',
  'KRW-DOT',
  'KRW-BCH',
  'KRW-APT',
] as const

const COIN_CACHE_KEY = 'coin_ranking_cache_v1'
const CACHE_TTL_MS = 3 * 60 * 60 * 1000

function toSafeGap(value: number | undefined): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }
  return Number.POSITIVE_INFINITY
}

function readCache(): CoinCachePayload | null {
  try {
    const raw = localStorage.getItem(COIN_CACHE_KEY)
    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw) as CoinCachePayload
    if (typeof parsed?.fetchedAt !== 'number' || !Array.isArray(parsed?.stats)) {
      return null
    }

    return parsed
  } catch {
    return null
  }
}

function writeCache(stats: BreakoutStat[]) {
  const payload: CoinCachePayload = {
    fetchedAt: Date.now(),
    stats,
  }

  localStorage.removeItem(COIN_CACHE_KEY)
  localStorage.setItem(COIN_CACHE_KEY, JSON.stringify(payload))
}

function analyzeRecent3DayGap(closes: number[], period = 20, stdMultiplier = 2) {
  if (closes.length < period) {
    return {
      todayProximityPct: Number.POSITIVE_INFINITY,
      yesterdayProximityPct: Number.POSITIVE_INFINITY,
      twoDaysAgoProximityPct: Number.POSITIVE_INFINITY,
      bestRecent3DayProximityPct: Number.POSITIVE_INFINITY,
    }
  }

  const proximityPctList: number[] = []

  for (let i = period - 1; i < closes.length; i += 1) {
    const window = closes.slice(i - period + 1, i + 1)
    const mean = window.reduce((sum, value) => sum + value, 0) / period
    const variance = window.reduce((sum, value) => sum + (value - mean) ** 2, 0) / period
    const stdDev = Math.sqrt(variance)
    const lowerBand = mean - stdMultiplier * stdDev
    const denominator = Math.abs(lowerBand)
    const proximityPct = denominator > 0 ? (Math.abs(closes[i] - lowerBand) / denominator) * 100 : Number.POSITIVE_INFINITY

    proximityPctList.push(proximityPct)
  }

  const recent3 = proximityPctList.slice(-3)
  const todayProximityPct = recent3[recent3.length - 1] ?? Number.POSITIVE_INFINITY
  const yesterdayProximityPct = recent3[recent3.length - 2] ?? Number.POSITIVE_INFINITY
  const twoDaysAgoProximityPct = recent3[recent3.length - 3] ?? Number.POSITIVE_INFINITY
  const bestRecent3DayProximityPct = Math.min(...recent3)

  return {
    todayProximityPct,
    yesterdayProximityPct,
    twoDaysAgoProximityPct,
    bestRecent3DayProximityPct,
  }
}

async function fetchBreakoutStat(market: string): Promise<BreakoutStat> {
  try {
    const response = await fetch(`https://api.upbit.com/v1/candles/days?market=${market}&count=60`)
    if (!response.ok) {
      return {
        market,
        todayProximityPct: Number.POSITIVE_INFINITY,
        yesterdayProximityPct: Number.POSITIVE_INFINITY,
        twoDaysAgoProximityPct: Number.POSITIVE_INFINITY,
        bestRecent3DayProximityPct: Number.POSITIVE_INFINITY,
        candles: [],
      }
    }

    const raw = (await response.json()) as UpbitDayCandle[]
    const candles: KLineData[] = raw
      .slice()
      .reverse()
      .map((item) => ({
        timestamp: item.timestamp,
        open: item.opening_price,
        high: item.high_price,
        low: item.low_price,
        close: item.trade_price,
        volume: item.candle_acc_trade_volume,
      }))
    const closes = candles.map((item) => item.close)

    const analysis = analyzeRecent3DayGap(closes)

    return {
      market,
      todayProximityPct: analysis.todayProximityPct,
      yesterdayProximityPct: analysis.yesterdayProximityPct,
      twoDaysAgoProximityPct: analysis.twoDaysAgoProximityPct,
      bestRecent3DayProximityPct: analysis.bestRecent3DayProximityPct,
      candles,
    }
  } catch {
    return {
      market,
      todayProximityPct: Number.POSITIVE_INFINITY,
      yesterdayProximityPct: Number.POSITIVE_INFINITY,
      twoDaysAgoProximityPct: Number.POSITIVE_INFINITY,
      bestRecent3DayProximityPct: Number.POSITIVE_INFINITY,
      candles: [],
    }
  }
}

function Coin() {
  const [stats, setStats] = useState<BreakoutStat[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastFetchedAt, setLastFetchedAt] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setIsLoading(true)
      setError(null)

       const cached = readCache()
      const canUseCache = cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS
       if (canUseCache) {
        setStats(cached.stats)
        setLastFetchedAt(cached.fetchedAt)
        setIsLoading(false)
        return
      }

      try {
        const results = await Promise.all(ACTIVE_MARKETS.map((market) => fetchBreakoutStat(market)))
        if (cancelled) {
          return
        }

        results.sort((a, b) => {
          return toSafeGap(a.bestRecent3DayProximityPct) - toSafeGap(b.bestRecent3DayProximityPct)
        })

        setStats(results)
        writeCache(results)
        setLastFetchedAt(Date.now())
      } catch {
        if (!cancelled) {
          if (cached) {
            setStats(cached.stats)
            setLastFetchedAt(cached.fetchedAt)
            setError('Live fetch failed. Showing cached data.')
          } else {
            setError('Failed to load coin stats.')
          }
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <CommonLayout>
      <h2>Coin</h2>
      <h3 style={{ marginTop: '20px' }}>Recent 3-Day Lower-Band Proximity Ranking</h3>
      <p style={{ marginTop: '6px', color: '#64748b' }}>
        Latest fetched: {lastFetchedAt ? new Date(lastFetchedAt).toLocaleString() : '-'}
      </p>

      {isLoading && <p style={{ marginTop: '10px' }}>Loading...</p>}
      {error && <p style={{ marginTop: '10px', color: '#dc2626' }}>{error}</p>}

      {!isLoading &&
        !error &&
        stats.map((item, index) => (
          <section key={item.market} style={{ marginTop: '12px' }}>
            <p>
              {index + 1}. {item.market}
            </p>
            <CoinChart market={item.market} candles={item.candles} />
          </section>
        ))}
    </CommonLayout>
  )
}

export default Coin
