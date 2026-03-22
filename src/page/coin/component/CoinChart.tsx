import { useEffect, useRef } from 'react'
import { dispose, init, type KLineData } from 'klinecharts'

type CoinChartProps = {
  market: string
  candles: KLineData[]
}

function CoinChart({ market, candles }: CoinChartProps) {
  const chartRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!chartRef.current) {
      return
    }

    const chart = init(chartRef.current, {
      styles: {
        candle: {
          tooltip: {
            showRule: 'none',
          },
        },
        indicator: {
          tooltip: {
            showRule: 'none',
          },
        },
        crosshair: {
          horizontal: {
            text: {
              show: false,
            },
          },
          vertical: {
            text: {
              show: false,
            },
          },
        },
      },
    })
    if (!chart) {
      return
    }

    chart.setDataLoader({
      getBars: ({ callback }) => {
        callback(candles, false)
      },
    })
    chart.setSymbol({
      ticker: market,
      pricePrecision: 0,
      volumePrecision: 3,
    })
    chart.setPeriod({ type: 'day', span: 1 })
    chart.removeIndicator({ name: 'VOL' })
    chart.createIndicator('BOLL', true, { id: 'candle_pane' })

    return () => {
      dispose(chart)
    }
  }, [market, candles])

  return (
    <div
      ref={chartRef}
      style={{
        width: '100%',
        height: '130px',
        marginTop: '12px',
        borderRadius: '14px',
        border: '1px solid #dbeafe',
        background: 'rgba(255,255,255,0.75)',
        overflow: 'hidden',
      }}
    />
  )
}

export default CoinChart
