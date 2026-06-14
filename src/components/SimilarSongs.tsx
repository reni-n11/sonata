'use client'
import { useState, useRef } from 'react'
import styles from './SimilarSongs.module.css'

interface Track {
  title:    string
  artist:   string
  url:      string
  cover?:   string
  preview?: string
}

interface Props {
  title:  string
  tracks: Track[]
}

export default function SimilarSongs({ title, tracks = [] }: Props) {
  const [playingIdx, setPlayingIdx] = useState<number | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const display: Track[] = (tracks ?? []).length > 0
    ? tracks.slice(0, 6)
    : Array.from({ length: 6 }, (_, i) => ({
        title:   `Lorem ipsum song ${i + 1}`,
        artist:  'Lorem ipsum band',
        url:     '#',
        cover:   undefined,
        preview: undefined,
      }))

  function handlePlay(idx: number, previewUrl?: string) {
    // Stop current
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    // Toggle off if same song
    if (playingIdx === idx) {
      setPlayingIdx(null)
      return
    }
    if (!previewUrl) return
    const audio = new Audio(previewUrl)
    audio.volume = 0.8
    audio.play()
    audio.addEventListener('ended', () => setPlayingIdx(null))
    audioRef.current = audio
    setPlayingIdx(idx)
  }

  return (
    <section className={styles.card} aria-label={title}>
      <h2 className={styles.heading}>{title}</h2>
      <div className={styles.grid} role="list">
        {display.map((t, i) => (
          <div key={i} className={styles.item} role="listitem">

            {/* Cover with play button overlay */}
            <div className={styles.coverWrapper}>
              {t.cover
                ? <img src={t.cover} alt={`${t.title} cover`} className={styles.coverImg} />
                : <div className={styles.coverPlaceholder} aria-hidden>
                    <span className={styles.placeholderX} />
                  </div>
              }
              {t.preview && (
                <button
                  className={`${styles.playOverlay} ${playingIdx === i ? styles.playingOverlay : ''}`}
                  onClick={() => handlePlay(i, t.preview)}
                  aria-label={playingIdx === i ? `Stop ${t.title}` : `Play preview of ${t.title}`}
                  type="button"
                >
                  {playingIdx === i ? '⏸' : '▶'}
                </button>
              )}
            </div>

            {/* Song info — click goes to Deezer */}
            <a
              href={t.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.songInfo}
              aria-label={`Open ${t.title} by ${t.artist} on Deezer`}
            >
              <span className={styles.songTitle}>{t.title}</span>
              <span className={styles.artist}>{t.artist}</span>
            </a>

          </div>
        ))}
      </div>
    </section>
  )
}
