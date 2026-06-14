'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts'
import styles from './PredictionTimeline.module.css'

interface TimelineProps {
  genreSegments:    number[][] | null
  subgenreSegments: number[][] | null
  genreLabels:      string[]
  subgenreLabels:   string[]
  audioUrl:         string | null
  waveformData:     number[] | null
}

const COLORS = ['#3B8BD4','#E8593C','#1D9E75','#EF9F27','#9B59B6','#e74c3c','#2ecc71','#f39c12']

export default function PredictionTimeline({
  genreSegments    = null,
  subgenreSegments = null,
  genreLabels      = [],
  subgenreLabels   = [],
  audioUrl         = null,
  waveformData     = null,
}: TimelineProps) {
  const [activeTab, setActiveTab] = useState<'genre' | 'subgenre'>('genre')
  const [playing,   setPlaying]   = useState(false)
  const [progress,  setProgress]  = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  function buildChartData(segments: number[][] | null, labels: string[]) {
    if (!segments?.length || !labels?.length) return []
    const top5idx = Array.from(labels.keys())
      .sort((a, b) =>
        segments.reduce((s, r) => s + (r[b] ?? 0), 0) -
        segments.reduce((s, r) => s + (r[a] ?? 0), 0)
      )
      .slice(0, 5)

    return segments.map((seg, i) => {
      const point: Record<string, number | string> = { time: `${(i * 1.5).toFixed(0)}s` }
      top5idx.forEach(idx => {
        point[labels[idx]] = +(seg[idx] * 100).toFixed(1)
      })
      return point
    })
  }

  const genreData    = buildChartData(genreSegments,    genreLabels ?? [])
  const subgenreData = buildChartData(subgenreSegments, subgenreLabels ?? [])

  const data   = activeTab === 'genre' ? genreData    : subgenreData
  const labels = activeTab === 'genre' ? (genreLabels ?? []) : (subgenreLabels ?? [])

  const top5 = Array.from(labels.keys())
    .sort((a, b) => {
      const segs = activeTab === 'genre' ? genreSegments : subgenreSegments
      if (!segs) return 0
      return segs.reduce((s, r) => s + (r[b] ?? 0), 0) -
             segs.reduce((s, r) => s + (r[a] ?? 0), 0)
    })
    .slice(0, 5)
    .map(i => labels[i])

  useEffect(() => {
    if (!audioUrl) return
    const audio = new Audio(audioUrl)
    audioRef.current = audio
    audio.addEventListener('timeupdate', () => {
      setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0)
    })
    audio.addEventListener('ended', () => {
      setPlaying(false)
      setProgress(0)
    })
    return () => {
      audio.pause()
      audioRef.current = null
    }
  }, [audioUrl])

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return
    if (playing) {
      audioRef.current.pause()
      setPlaying(false)
    } else {
      audioRef.current.play()
      setPlaying(true)
    }
  }, [playing])

  // Use real waveform data or fall back to random
  const bars = waveformData && waveformData.length > 0
    ? waveformData
    : Array.from({ length: 120 }, () => Math.random())

  return (
    <section className={styles.wrapper} aria-label="Prediction timeline">
      <h2 className={styles.heading}>Prediction timeline</h2>

      <div className={styles.tabs} role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === 'genre'}
          aria-controls="panel-genre"
          id="tab-genre"
          className={`${styles.tab} ${activeTab === 'genre' ? styles.tabActive : styles.tabDim}`}
          onClick={() => setActiveTab('genre')}
        >Genre</button>
        <button
          role="tab"
          aria-selected={activeTab === 'subgenre'}
          aria-controls="panel-subgenre"
          id="tab-subgenre"
          className={`${styles.tab} ${activeTab === 'subgenre' ? styles.tabActive : styles.tabDim}`}
          onClick={() => setActiveTab('subgenre')}
        >Subgenre</button>
      </div>

      <div
        className={styles.chartArea}
        id={`panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeTab}`}
      >
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
              <XAxis dataKey="time" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
              <Tooltip formatter={(v: number) => `${v}%`} />
              <Legend />
              {top5.map((label, i) => (
                <Line
                  key={label}
                  type="monotone"
                  dataKey={label}
                  stroke={COLORS[i % COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className={styles.placeholder} aria-label="No data yet">
            <svg viewBox="0 0 1000 220" preserveAspectRatio="none" aria-hidden>
              <polyline points="0,200 250,50 500,180 750,30 1000,100"
                fill="none" stroke="#999" strokeWidth="2" opacity=".5"/>
              <polyline points="0,80 250,160 500,40 750,180 1000,80"
                fill="none" stroke="#777" strokeWidth="2" opacity=".4"/>
            </svg>
          </div>
        )}
      </div>

      <div className={styles.waveformBar}>
        <button
          className={styles.playBtn}
          onClick={togglePlay}
          aria-label={playing ? 'Pause' : 'Play'}
          disabled={!audioUrl}
        >
          {playing ? '⏸' : '▶'}
        </button>

        <div
          className={styles.waveTrack}
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <svg className={styles.waveSvg} viewBox="0 0 1200 56"
            preserveAspectRatio="none" aria-hidden>
            <defs>
              <clipPath id="progress-clip">
                <rect x="0" y="0" width={`${progress}%`} height="56" />
              </clipPath>
            </defs>

            {/* Unplayed bars — dim */}
            {bars.map((amplitude, i) => {
              const h = Math.max(4, amplitude * 53)
              return (
                <rect key={`bg-${i}`}
                  x={i * 10} y={(56 - h) / 2}
                  width="8" height={h} rx="1"
                  fill="rgba(0,0,0,.18)"
                />
              )
            })}

            {/* Played bars — dark, clipped to progress % */}
            <g clipPath="url(#progress-clip)">
              {bars.map((amplitude, i) => {
                const h = Math.max(4, amplitude * 53)
                return (
                  <rect key={`fg-${i}`}
                    x={i * 10} y={(56 - h) / 2}
                    width="8" height={h} rx="1"
                    fill="rgba(0,0,0,.6)"
                  />
                )
              })}
            </g>
          </svg>
        </div>
      </div>
    </section>
  )
}
