'use client'
import styles from './LoadingScreen.module.css'

const ALL_GENRES = [
  'Blues', 'Classical', 'Country', 'Disco',
  'Electronic', 'Hip-Hop', 'Jazz', 'Metal',
  'Pop', 'Reggae', 'Rock',
]

const BARS = [
  20, 38, 55, 45, 70, 60, 80, 65, 75, 80,
  68, 78, 55, 42, 30, 18, 28, 50, 65, 75,
  80, 70, 58, 44, 32, 20, 15, 25,
]

const DELAYS = [
  0.00, 0.10, 0.20, 0.08, 0.28, 0.16, 0.35, 0.05,
  0.22, 0.40, 0.12, 0.30, 0.18, 0.42, 0.08, 0.25,
  0.38, 0.14, 0.32, 0.06, 0.20, 0.44, 0.11, 0.27,
  0.36, 0.19, 0.43, 0.09,
]

export default function LoadingScreen() {
  return (
    <div className={styles.overlay} role="status" aria-live="polite" aria-label="Analysing your track">
      <div className={styles.wrap}>

        <div className={styles.titleArea}>
          <h1>Analysing your track</h1>
          <p>DETECTING GENRE SIGNATURE</p>
        </div>

        <div className={styles.waveform} aria-hidden="true">
          {BARS.map((peak, i) => (
            <div
              key={i}
              className={styles.bar}
              style={{
                '--peak': `${peak}px`,
                '--delay': `${DELAYS[i]}s`,
              } as React.CSSProperties}
            />
          ))}
        </div>

        <div className={styles.genreTags} aria-label="Genres being scanned">
          {ALL_GENRES.map((g, i) => (
            <span
              key={g}
              className={styles.tag}
              style={{ '--tag-delay': `${(i * 0.22) % 2.5}s` } as React.CSSProperties}
            >
              {g}
            </span>
          ))}
        </div>

        <div className={styles.progressTrack} role="progressbar" aria-label="Analysis progress">
          <div className={styles.progressFill} />
        </div>

        <div className={styles.status}>Processing audio features…</div>

      </div>
    </div>
  )
}