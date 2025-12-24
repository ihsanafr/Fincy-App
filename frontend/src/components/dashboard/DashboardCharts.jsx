import { useState, useMemo, useRef } from 'react'
import Badge from '../ui/Badge'
import { formatRupiah } from '../../utils/currency'

const formatNumber = (value = 0) =>
  value >= 1000 ? `${(value / 1000).toFixed(1).replace('.0', '')}k` : value.toString()

// Tooltip Component with smooth animations
const ChartTooltip = ({ x, y, label, value, isCurrency = false, color, visible }) => {
  if (!x || !y || !visible) return null
  
  return (
    <>
      <style>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(5px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0) scale(1);
          }
        }
        .chart-tooltip {
          animation: fadeInScale 0.2s ease-out;
        }
      `}</style>
      <div
        className="chart-tooltip fixed z-50 px-4 py-2.5 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-lg shadow-2xl pointer-events-none border border-gray-700/50 dark:border-gray-600/50 backdrop-blur-sm"
        style={{
          left: `${x}px`,
          top: `${y - 50}px`,
          transform: 'translateX(-50%)',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div className="font-semibold mb-1.5 text-white">{label}</div>
        <div className="flex items-center gap-2">
          <div
            className="w-2.5 h-2.5 rounded-full shadow-sm"
            style={{ backgroundColor: color }}
          ></div>
          <span className="font-bold text-sm">
            {isCurrency ? formatRupiah(value) : `${value} ${value === 1 ? 'item' : 'items'}`}
          </span>
        </div>
      </div>
    </>
  )
}

const SimpleAreaChart = ({ data = [], color = '#4f46e5', label, height = 160 }) => {
  const [tooltip, setTooltip] = useState(null)
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const chartRef = useRef(null)

  const chart = useMemo(() => {
    if (!data.length) return { points: '', area: '', max: 0, dataPoints: [] }
    const max = Math.max(...data.map((d) => d.value), 1)
    const width = 300
    const pad = 12
    const h = height - pad * 2
    const w = width - pad * 2

    const dataPoints = data.map((d, idx) => {
      const x = pad + (w / Math.max(data.length - 1, 1)) * idx
      const y = pad + (1 - d.value / max) * h
      return { x, y, ...d }
    })

    const points = dataPoints.map((dp) => `${dp.x},${dp.y}`).join(' ')
    const area = `${pad + w},${pad + h} ${points} ${pad},${pad + h}`
    return { points, area, max, dataPoints, pad, h, w }
  }, [data, height])

  const gradientId = `grad-${(label || 'area').replace(/\s+/g, '-').toLowerCase()}-${Math.random().toString(36).substr(2, 9)}`

  const handleMouseMove = (e, point, index) => {
    if (!chartRef.current) return
    const rect = chartRef.current.getBoundingClientRect()
    const svgElement = chartRef.current.querySelector('svg')
    if (!svgElement) return
    
    const svgRect = svgElement.getBoundingClientRect()
    const scaleX = svgRect.width / 300
    const scaleY = svgRect.height / (height + 20)
    
    setHoveredIndex(index)
    setTooltip({
      x: rect.left + point.x * scaleX,
      y: rect.top + point.y * scaleY,
      label: point.label,
      value: point.value,
      visible: true,
    })
  }

  const handleMouseLeave = () => {
    setTooltip((prev) => prev ? { ...prev, visible: false } : null)
    setTimeout(() => {
      setTooltip(null)
      setHoveredIndex(null)
    }, 200)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{label}</p>
        <Badge color="primary" size="sm">
          {formatNumber(data.at(-1)?.value || 0)}
        </Badge>
      </div>
      <div
        ref={chartRef}
        className="relative w-full overflow-hidden rounded-xl bg-gradient-to-b from-brand-50 via-white to-white dark:from-brand-950/40 dark:via-gray-900 dark:to-gray-900 border border-gray-100 dark:border-gray-800"
        onMouseLeave={handleMouseLeave}
      >
        <svg viewBox={`0 0 300 ${height + 20}`} className="w-full" style={{ height: `${height}px` }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={color} stopOpacity="0.02" />
            </linearGradient>
            <filter id={`glow-${gradientId}`}>
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <polygon fill={`url(#${gradientId})`} points={chart.area} />
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            points={chart.points}
            className="transition-all duration-300"
          />
          {/* Vertical guide line on hover */}
          {hoveredIndex !== null && chart.dataPoints[hoveredIndex] && (
            <line
              x1={chart.dataPoints[hoveredIndex].x}
              y1={12}
              x2={chart.dataPoints[hoveredIndex].x}
              y2={height - 12}
              stroke={color}
              strokeWidth="1"
              strokeDasharray="4 4"
              opacity="0.3"
              className="transition-opacity duration-300"
            />
          )}
          {/* Interactive points with smooth transitions */}
          {chart.dataPoints.map((point, idx) => {
            const isHovered = hoveredIndex === idx
            return (
              <g key={idx}>
                {/* Outer glow circle */}
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={isHovered ? "10" : "8"}
                  fill={color}
                  opacity={isHovered ? "0.2" : "0"}
                  className="transition-all duration-300 ease-out"
                  filter={`url(#glow-${gradientId})`}
                />
                {/* Main point */}
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={isHovered ? "7" : "5"}
                  fill={color}
                  stroke="white"
                  strokeWidth={isHovered ? "3" : "2"}
                  className="cursor-pointer transition-all duration-300 ease-out"
                  style={{
                    filter: isHovered ? `drop-shadow(0 0 6px ${color})` : 'none',
                  }}
                  onMouseEnter={(e) => handleMouseMove(e, point, idx)}
                />
              </g>
            )
          })}
        </svg>
        {tooltip && (
          <ChartTooltip
            x={tooltip.x}
            y={tooltip.y}
            label={tooltip.label}
            value={tooltip.value}
            color={color}
            visible={tooltip.visible}
          />
        )}
        <div 
          className="px-4 pb-2 text-xs text-gray-400 dark:text-gray-500 grid gap-1"
          style={{ gridTemplateColumns: `repeat(${Math.max(data.length, 1)}, minmax(0, 1fr))` }}
        >
          {data.map((d, idx) => (
            <span
              key={d.label}
              className={`text-center truncate transition-colors duration-200 ${
                hoveredIndex === idx ? 'text-gray-600 dark:text-gray-300 font-medium' : ''
              }`}
            >
              {d.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

const SimpleBarChart = ({ data = [], color = '#22c55e', label, isCurrency = false }) => {
  const [tooltip, setTooltip] = useState(null)
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const max = Math.max(...data.map((d) => d.value), 1)
  const total = data.reduce((acc, curr) => acc + (curr.value || 0), 0)
  
  const handleMouseEnter = (e, d, index) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setHoveredIndex(index)
    setTooltip({
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
      label: d.label,
      value: d.value,
      visible: true,
    })
  }

  const handleMouseLeave = () => {
    setTooltip((prev) => prev ? { ...prev, visible: false } : null)
    setTimeout(() => {
      setTooltip(null)
      setHoveredIndex(null)
    }, 200)
  }
  
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{label}</p>
        <Badge color="success" size="sm">
          {isCurrency ? formatRupiah(total) : formatNumber(total)}
        </Badge>
      </div>
      <div 
        className="relative flex items-end gap-2 w-full rounded-xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
        onMouseLeave={handleMouseLeave}
      >
        {data.map((d, index) => {
          const isHovered = hoveredIndex === index
          return (
            <div
              key={d.label}
              className="flex-1 flex flex-col items-center gap-2 group relative"
              onMouseEnter={(e) => handleMouseEnter(e, d, index)}
            >
              <div
                className="w-full rounded-lg bg-gradient-to-t transition-all duration-300 ease-out cursor-pointer relative overflow-hidden"
                style={{ 
                  height: `${(d.value / max) * 110 || 6}px`,
                  backgroundColor: color,
                  transform: isHovered ? 'scaleY(1.05) translateY(-2px)' : 'scaleY(1)',
                  boxShadow: isHovered ? `0 4px 12px ${color}40` : 'none',
                }}
              >
                <div 
                  className="absolute inset-0 rounded-lg bg-white/30 transition-opacity duration-300"
                  style={{ opacity: isHovered ? 1 : 0 }}
                ></div>
                {/* Shine effect */}
                <div 
                  className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/40 to-transparent transition-opacity duration-300"
                  style={{ opacity: isHovered ? 1 : 0 }}
                ></div>
              </div>
              <span 
                className={`text-[10px] transition-all duration-200 ${
                  isHovered 
                    ? 'text-gray-600 dark:text-gray-300 font-semibold scale-105' 
                    : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                {d.label}
              </span>
            </div>
          )
        })}
        {tooltip && (
          <ChartTooltip
            x={tooltip.x}
            y={tooltip.y}
            label={tooltip.label}
            value={tooltip.value}
            isCurrency={isCurrency}
            color={color}
            visible={tooltip.visible}
          />
        )}
      </div>
    </div>
  )
}

function DashboardCharts({ chartData, showEngagementOnly = false, showPaymentsOnly = false }) {
  const registrations = (chartData?.registrations || []).map((d) => ({
    label: d.label,
    value: d.count || 0,
  }))

  const completions = (chartData?.completions || []).map((d) => ({
    label: d.label,
    value: d.count || 0,
  }))

  const paymentsAmount = (chartData?.payments || []).map((d) => ({
    label: d.label,
    value: d.amount || 0,
  }))

  const statusSummary = chartData?.status_summary || {}

  // Show only Engagement Trend (larger)
  if (showEngagementOnly) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 md:p-6 lg:p-8">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">Engagement Trend</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Last 7 days</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <SimpleAreaChart data={registrations} color="#6366f1" label="Registrations" height={220} />
          <SimpleAreaChart data={completions} color="#22d3ee" label="Completions" height={220} />
        </div>
      </div>
    )
  }

  // Show only Payments Insight
  if (showPaymentsOnly) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 md:p-6 h-full flex flex-col">
        <div className="mb-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Payments Insight</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Approved amounts (7 days)</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-200 text-xs font-medium">
                Pending {statusSummary.pending ?? 0}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-200 text-xs font-medium">
                Approved {statusSummary.approved ?? 0}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-200 text-xs font-medium">
                Rejected {statusSummary.rejected ?? 0}
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <SimpleBarChart data={paymentsAmount} color="#22c55e" label="Approved amount" isCurrency={true} />
        </div>

        <div className="mt-3 text-xs text-gray-400 dark:text-gray-500">
          * Amounts are summed from approved payments per day.
        </div>
      </div>
    )
  }

  // Default: Show both (for backward compatibility)
  return (
    <div className="space-y-6">
      {/* Engagement Trend Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 md:p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Engagement Trend</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Last 7 days</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SimpleAreaChart data={registrations} color="#6366f1" label="Registrations" height={160} />
          <SimpleAreaChart data={completions} color="#22d3ee" label="Completions" height={160} />
        </div>
      </div>

      {/* Payments Insight Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 md:p-6">
        <div className="mb-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Payments Insight</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Approved amounts (7 days)</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-200 text-xs font-medium">
                Pending {statusSummary.pending ?? 0}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-200 text-xs font-medium">
                Approved {statusSummary.approved ?? 0}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-200 text-xs font-medium">
                Rejected {statusSummary.rejected ?? 0}
              </span>
            </div>
          </div>
        </div>

        <SimpleBarChart data={paymentsAmount} color="#22c55e" label="Approved amount" isCurrency={true} />

        <div className="mt-3 text-xs text-gray-400 dark:text-gray-500">
          * Amounts are summed from approved payments per day.
        </div>
      </div>
    </div>
  )
}

export default DashboardCharts


