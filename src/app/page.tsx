'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import LoadingScreen from '@/components/LoadingScreen'
import styles from './page.module.css'

export default function HomePage() {
  const router   = useRouter()
  const fileRef  = useRef<HTMLInputElement>(null)
  const [file,     setFile]     = useState<File | null>(null)
  const [query,    setQuery]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [dragging, setDragging] = useState(false)

  async function handleAnalyse() {
    setError('')
    if (!file && !query.trim()) {
      setError('Please upload a file or enter a song name / link.')
      return
    }
    setLoading(true)
    try {
      const fd = new FormData()
      if (file) fd.append('file', file)
      if (query.trim()) {
        if (query.includes('spotify.com')) {
          fd.append('link', query.trim())
        } else {
          fd.append('search', query.trim())
        }
      }

      const endpoint = file
        ? `${process.env.NEXT_PUBLIC_HF_BACKEND_URL}/api/analyse`
        : '/api/analyse'

      const res  = await fetch(endpoint, { method: 'POST', body: fd })
      const text = await res.text()

      let data
      try {
        data = JSON.parse(text)
      } catch {
        throw new Error(`Backend returned: ${text.slice(0, 100)}`)
      }

      if (!res.ok || data.error) throw new Error(data.error ?? 'Analysis failed')

      if (file) {
        sessionStorage.setItem('sonata_audio_url', URL.createObjectURL(file))
      } else {
        sessionStorage.removeItem('sonata_audio_url')
      }

      sessionStorage.setItem('sonata_result', JSON.stringify(data))
      router.push('/results')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped && (
      dropped.type === 'audio/mpeg' ||
      dropped.type === 'audio/wav'  ||
      dropped.name.endsWith('.mp3') ||
      dropped.name.endsWith('.wav')
    )) {
      setFile(dropped)
    }
  }

  return (
    <>
      {/* Full-viewport loading overlay */}
      {loading && <LoadingScreen />}

      <Navbar />
      <main className={styles.page}>

        {/* Logo */}
        <div className={styles.logo}>
          <span className={styles.wordmark}><a href="/">Sonata</a></span>
          <p className={styles.tagline}>Discover more about music</p>
        </div>

        {/* Title */}
        <h1 className={styles.heroTitle}>AI Song Genre Identifier</h1>

        {/* Search input */}
        <div className={styles.searchRow}>
          <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            id="song-search"
            className={styles.searchInput}
            type="text"
            placeholder="Search for a song or paste a Spotify link"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAnalyse()}
            aria-label="Search for a song or paste a link"
          />
        </div>

        {/* Upload dropzone */}
        <div
          className={`${styles.dropzone} ${dragging ? styles.dropzoneDragging : ''} ${file ? styles.dropzoneActive : ''}`}
          onClick={() => fileRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          role="button"
          tabIndex={0}
          aria-label="Upload audio file"
          onKeyDown={e => e.key === 'Enter' && fileRef.current?.click()}
        >
          {file ? (
            <>
              <svg className={styles.uploadIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <p className={styles.dropText}>{file.name}</p>
              <p className={styles.dropSub}>Click to change file</p>
            </>
          ) : (
            <>
              <svg className={styles.uploadIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <p className={styles.dropText}>Or drag &amp; drop an audio file</p>
              <p className={styles.dropSub}>(MP3 and WAV formats supported)</p>
              <p className={styles.dropBrowse}>or click to browse</p>
            </>
          )}
        </div>

        <input
          ref={fileRef}
          type="file"
          accept=".mp3,.wav,audio/*"
          className={styles.hiddenInput}
          onChange={e => setFile(e.target.files?.[0] ?? null)}
        />

        {error && <p className={styles.error} role="alert">{error}</p>}

        {/* Analyse button — always visible, not disabled during loading */}
        <button
          className={styles.analyseBtn}
          onClick={handleAnalyse}
          disabled={loading}
          type="button"
        >
          Analyze
        </button>

        {/* Waveform decoration */}
        <div className={styles.waveDecoration} aria-hidden>
          <svg viewBox="0 0 700 40" preserveAspectRatio="none" width="100%" height="40">
            <polyline
              points="0,20 5,14 10,24 15,12 20,22 25,10 30,20 35,15 40,25 45,11 50,21 55,13 60,23 65,11 70,22 75,14 80,24 85,12 90,22 95,10 100,20 105,16 110,26 115,12 120,22 125,14 130,24 135,12 140,22 145,10 150,20 155,15 160,25 165,11 170,21 175,13 180,23 185,11 190,21 195,15 200,25 205,12 210,22 215,14 220,24 225,10 230,20 235,16 240,26 245,12 250,22 255,14 260,24 265,12 270,20 275,15 280,25 285,11 290,21 295,13 300,23 305,11 310,21 315,15 320,25 325,12 330,22 335,14 340,24 345,10 350,20 355,16 360,26 365,12 370,22 375,14 380,24 385,12 390,22 395,10 400,20 405,15 410,25 415,11 420,21 425,13 430,23 435,11 440,21 445,15 450,25 455,12 460,22 465,14 470,24 475,10 480,20 485,16 490,26 495,12 500,22 505,14 510,24 515,12 520,20 525,15 530,25 535,11 540,21 545,13 550,23 555,11 560,21 565,15 570,25 575,12 580,22 585,14 590,24 595,10 600,20 605,16 610,26 615,12 620,22 625,14 630,24 635,12 640,22 645,10 650,20 655,15 660,25 665,11 670,21 675,13 680,23 685,11 690,21 695,15 700,20"
              fill="none"
              stroke="rgba(0,0,0,0.25)"
              strokeWidth="1.5"
            />
          </svg>
        </div>

        {/* Features */}
        <div className={styles.features}>
          <p className={styles.featuresTitle}>With Sonata you get:</p>
          <div className={styles.featureItem}>
            <span className={styles.star} aria-hidden>☆</span>
            <span>AI genre and subgenre identification of a song (including lyrical analysis, key, tempo and more)</span>
          </div>
          <div className={styles.featureItem}>
            <span className={styles.star} aria-hidden>☆</span>
            <span>Recommended songs</span>
          </div>
          <div className={styles.featureItem}>
            <span className={styles.star} aria-hidden>☆</span>
            <span>Concerts and events near you</span>
          </div>
        </div>

      </main>

      <footer className={styles.footer}>
        <div>
          <p>Sonata</p>
          <p>&nbsp;</p>
          <p><a href="/" className={styles.link}>Home</a> | <a href="/about" className={styles.link}>About</a></p>
          <p>&nbsp;</p>
          <p>Email: 178knr@unibit.bg</p>
          <p>&nbsp;</p>
          <p>© 2026 Sonata</p>
        </div>
      </footer>
    </>
  )
}