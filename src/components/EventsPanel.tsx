'use client'
import { useState } from 'react'
import styles from './EventsPanel.module.css'

interface Event {
  name:  string
  date:  string
  venue: string
  city:  string
  url:   string
}

interface EventsPanelProps {
  genre:    string | null
  subgenre: string | null
}

function capitalize(str: string | null | undefined): string {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export default function EventsPanel({ genre, subgenre }: EventsPanelProps) {
  const [stage,       setStage]       = useState<'idle' | 'locating' | 'results' | 'error'>('idle')
  const [loading,     setLoading]     = useState(false)
  const [locError,    setLocError]    = useState('')
  const [genreEvts,    setGenreEvts]    = useState<Event[]>([])
  const [subgenreEvts, setSubgenreEvts] = useState<Event[]>([])

  async function handleFindEvents() {
    setLocError('')

    if (!navigator.geolocation) {
      setLocError('Geolocation is not supported by your browser.')
      return
    }

    setStage('locating')
    setLoading(true)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords

          const geo = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { 'Accept-Language': 'en' } }
          )
          const geoData = await geo.json()
          const code    = geoData.address?.country_code?.toUpperCase()

          if (!code) {
            setLocError('Could not determine your country.')
            setStage('error')
            setLoading(false)
            return
          }

          const res = await fetch(
            `/api/events?genre=${encodeURIComponent(genre ?? '')}&subgenre=${encodeURIComponent(subgenre ?? '')}&country=${encodeURIComponent(code)}&lat=${latitude}&lng=${longitude}`
          )
          const data = await res.json()
          setGenreEvts(data.genreEvents    ?? [])
          setSubgenreEvts(data.subgenreEvents ?? [])
          setStage('results')
        } catch {
          setLocError('Could not fetch events. Please try again.')
          setStage('error')
        } finally {
          setLoading(false)
        }
      },
      (err) => {
        setLoading(false)
        if (err.code === err.PERMISSION_DENIED) {
          setLocError('Location access was denied.')
        } else {
          setLocError('Could not get your location.')
        }
        setStage('error')
      },
      { timeout: 10000 }
    )
  }

  // ── Idle — just the button ──────────────────────────────
  if (stage === 'idle') {
    return (
      <div className={styles.btnWrapper}>
        <button
          className={styles.pill}
          onClick={handleFindEvents}
          type="button"
        >
          Find {capitalize(genre ?? 'genre')} and {capitalize(subgenre ?? 'subgenre')} events near you
        </button>
      </div>
    )
  }

  // ── Locating ────────────────────────────────────────────
  if (stage === 'locating' && loading) {
    return (
      <div className={styles.btnWrapper}>
        <p className={styles.locatingText}>📍 Getting your location...</p>
      </div>
    )
  }

  // ── Error ───────────────────────────────────────────────
  if (stage === 'error') {
    return (
      <div className={styles.btnWrapper} style={{ flexDirection: 'column', gap: 12 }}>
        <p className={styles.locError}>{locError}</p>
        <button className={styles.pill} onClick={() => setStage('idle')} type="button">
          Try again
        </button>
      </div>
    )
  }

  // ── Results ─────────────────────────────────────────────
  return (
    <aside className={styles.panel} aria-label="Nearby events">
      <h2 className={styles.heading}>
        Find {capitalize(genre ?? 'genre')} and {capitalize(subgenre ?? 'subgenre')} events near you
      </h2>

      <div className={styles.cols}>
        <div>
          <div className={styles.colTitle}>{genre ?? 'Genre'}</div>
          <div className={styles.col} role="list">
            {genreEvts.length === 0
              ? <p className={styles.empty}>No events found</p>
              : genreEvts.map((e, i) => (
                <a key={i} href={e.url} target="_blank" rel="noopener noreferrer"
                  className={styles.eventCard} role="listitem">
                  <span className={styles.eventDate}>{e.date}</span>
                  <span className={styles.eventName}>{e.name}</span>
                  <span className={styles.eventVenue}>{e.venue}, {e.city}</span>
                </a>
              ))
            }
          </div>
        </div>

        <div className={styles.divider} aria-hidden />

        <div>
          <div className={styles.colTitle}>{subgenre ?? 'Subgenre'}</div>
          <div className={styles.col} role="list">
            {subgenreEvts.length === 0
              ? <p className={styles.empty}>No events found</p>
              : subgenreEvts.map((e, i) => (
                <a key={i} href={e.url} target="_blank" rel="noopener noreferrer"
                  className={styles.eventCard} role="listitem">
                  <span className={styles.eventDate}>{e.date}</span>
                  <span className={styles.eventName}>{e.name}</span>
                  <span className={styles.eventVenue}>{e.venue}, {e.city}</span>
                </a>
              ))
            }
          </div>
        </div>
      </div>
    </aside>
  )
}