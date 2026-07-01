'use client'
import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import Card from '@/components/Card'
import PredictionTimeline from '@/components/PredictionTimeline'
import SimilarSongs from '@/components/SimilarSongs'
import EventsPanel from '@/components/EventsPanel'
import styles from './results.module.css'

function capitalize(str: string | null | undefined): string {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function lowercase(str: string | null | undefined): string {
  if (!str) return ''
  return str.charAt(0).toLowerCase() + str.slice(1)
}

const DEMO = {
  main_genre:           'rock',
  main_confidence:      '49.7%',
  main_breakdown:       [
    ['rock', 49.7], ['jazz', 17.1], ['country', 10.5],
    ['disco', 8.7], ['pop', 7.1],
  ] as [string, number][],
  subgenre:             'Punk',
  subgenre_confidence:  '27.5%',
  subgenre_breakdown:   [
    ['Punk', 27.5], ['Indie-Rock', 12.0], ['Rock', 9.4],
    ['Metal', 7.5], ['Post-Punk', 5.3],
  ] as [string, number][],
  tempo:                '143',
  key:                  'E',
  instruments:          'Electric guitar, drums, bass guitar',
  genre_description:    'Rock music emerged in the 1950s as a blend of blues, country, and rhythm & blues. Characterised by its electric guitar-driven sound and energetic rhythms, it gave rise to countless subgenres.',
  subgenre_description: 'Punk rock arose in the mid-1970s as a raw, stripped-down reaction to the perceived excesses of mainstream rock.',
  lyrics_analysis:      'Lyrics unavailable for this track.',
  emotions_analysis:    'The track conveys high-energy tension with an undercurrent of controlled aggression.',
  similar_genre_songs:    [] as { title: string; artist: string; url: string; cover?: string; preview?: string }[],
  similar_subgenre_songs: [] as { title: string; artist: string; url: string; cover?: string; preview?: string }[],
  segment_confidences:     null as number[][] | null,
  sub_segment_confidences: null as number[][] | null,
  display_genres: ['blues','classical','country','disco','hiphop','jazz','pop','reggae','rock'],
  sub_labels:     ['Punk','Indie-Rock','Rock','Metal','Post-Punk'],
  audio_url:      null as string | null,
  waveform_data: null as number[] | null,
}

type ResultType = typeof DEMO

export default function ResultsPage() {
  const [result, setResult] = useState<ResultType>(DEMO)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const raw = sessionStorage.getItem('sonata_result')
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        console.log('FULL RESULT:', parsed)
        console.log('similar_genre_songs:', parsed.similar_genre_songs)
        console.log('segment_confidences:', parsed.segment_confidences)
        const audioUrl = sessionStorage.getItem('sonata_audio_url')
        if (audioUrl) parsed.audio_url = audioUrl
        setResult({ ...DEMO, ...parsed })
      } catch(e) {
        console.log('Parse error:', e)
      }
    }
    setLoaded(true)
  }, [])

  if (!loaded) {
    return (
      <>
        <Navbar />
        <main style={{ padding: '100px 20px', textAlign: 'center' }}>
          <p>Loading results...</p>
        </main>
      </>
    )
  }

  const top5genres    = result.main_breakdown?.slice(0, 5) ?? []
  const top5subgenres = result.subgenre_breakdown?.slice(0, 5) ?? []

  return (
    <>
      <Navbar />
      <main className={styles.page}>

        {/* Logo */}
        <div className={styles.logo}>
          <span className={styles.wordmark}><a href="/">Sonata</a></span>
          <p className={styles.tagline}>Discover more about music</p>
        </div>

        {/* Title bar */}
        <div className={styles.titleBar}>
          <svg className={styles.titleWave} viewBox="0 0 600 30" preserveAspectRatio="none" aria-hidden>
            <polyline
              points="0,15 10,8 20,18 30,10 40,20 50,12 60,16 70,7 80,19 90,11 100,17 110,9 120,20 130,13 140,18 150,8 160,16 170,10 180,20 190,12 200,17 210,9 220,19 230,11 240,16 250,8 260,18 270,10 280,20 290,13 300,15 310,7 320,19 330,11 340,17 350,9 360,20 370,12 380,16 390,8 400,18 410,10 420,20 430,13 440,17 450,9 460,19 470,11 480,16 490,8 500,18 510,10 520,20 530,12 540,17 550,9 560,19 570,11 580,16 590,8 600,15"
              fill="none"
              stroke="rgba(0,0,0,0.4)"
              strokeWidth="1.5"
            />
          </svg>

          <h1 className={styles.titleText}>Analysis Results</h1>

          <svg className={styles.titleWave} viewBox="0 0 600 30" preserveAspectRatio="none" aria-hidden>
            <polyline
              points="0,15 10,22 20,12 30,20 40,10 50,18 60,14 70,23 80,11 90,19 100,13 110,21 120,10 130,17 140,12 150,22 160,14 170,20 180,10 190,18 200,13 210,21 220,11 230,19 240,14 250,22 260,12 270,20 280,10 290,17 300,15 310,23 320,11 330,19 340,13 350,21 360,10 370,18 380,14 390,22 400,12 410,20 420,10 430,17 440,13 450,21 460,11 470,19 480,14 490,22 500,12 510,20 520,10 530,18 540,13 550,21 560,11 570,19 580,14 590,22 600,15"
              fill="none"
              stroke="rgba(0,0,0,0.4)"
              strokeWidth="1.5"
            />
          </svg>
        </div>

        {/* ── Row 1: 4 cards ── */}
        <section className={styles.grid4} aria-label="Primary results">

          <Card>
            <h2 className={styles.cardTitle}>Top 5 genres</h2>
            <ol className={styles.rankList}>
              {top5genres.map((item: [string, number], i: number) => (
                <li key={i} className={i === 0 ? styles.rankFirst : styles.rankItem}>
                  {item[0]} ({item[1]}%)
                </li>
              ))}
            </ol>
          </Card>

          <Card>
            <h2 className={styles.cardTitle}>Top 5 subgenres</h2>
            <ol className={styles.rankList}>
              {top5subgenres.map((item: [string, number], i: number) => (
                <li key={i} className={i === 0 ? styles.rankFirst : styles.rankItem}>
                  {item[0]} ({item[1]}%)
                </li>
              ))}
            </ol>
          </Card>

          <div className={styles.splitCard}>
            <Card className={styles.halfCard}>
              <div className={styles.halfTitle}>Tempo</div>
              <div className={styles.halfValue}>{result.tempo} BPM</div>
            </Card>
            <Card className={styles.halfCard}>
              <div className={styles.halfTitle}>Key</div>
              <div className={styles.halfValue}>{result.key}</div>
            </Card>
          </div>

          <Card>
            <h2 className={styles.cardTitle}>Musical instruments</h2>
            <p className={styles.cardBody}>{result.instruments}</p>
          </Card>

        </section>

        {/* ── Row 2: What is genre / Lyrics ── */}
        <section className={styles.grid2} aria-label="Genre and lyrics context">
          <Card>
            <div className={styles.descCard}>
              <h2 className={styles.descTitle}>What is {result.main_genre}?</h2>
              <p className={styles.descText}>{result.genre_description}</p>
            </div>
          </Card>
          <Card>
            <div className={styles.descCard}>
              <h2 className={styles.descTitle}>Lyrics analysis</h2>
              <p className={styles.descText}>{result.lyrics_analysis}</p>
            </div>
          </Card>
        </section>

        {/* ── Row 3: What is subgenre / Emotions ── */}
        <section className={styles.grid2} aria-label="Subgenre and emotions">
          <Card>
            <div className={styles.descCard}>
              <h2 className={styles.descTitle}>
                What is {result.subgenre ?? 'subgenre'}?
              </h2>
              <p className={styles.descText}>{result.subgenre_description}</p>
            </div>
          </Card>
          <Card>
            <div className={styles.descCard}>
              <h2 className={styles.descTitle}>Emotions analysis</h2>
              <p className={styles.descText}>{result.emotions_analysis}</p>
            </div>
          </Card>
        </section>

        {/* ── Rows 4+5: Similar songs + Events ── */}
        <section className={styles.songsAndEvents} aria-label="Recommendations and events">
          <SimilarSongs
            title={`Similar ${capitalize(result.main_genre)} songs`}
            tracks={result.similar_genre_songs ?? []}
          />
          <div className={styles.eventsSpan}>
            <EventsPanel
              genre={result.main_genre}
              subgenre={result.subgenre ?? null}
            />
          </div>
          <SimilarSongs
            title={`Similar ${capitalize(result.subgenre ?? result.main_genre)} songs`}
            tracks={result.similar_subgenre_songs ?? []}
          />
        </section>

        {/* ── Prediction timeline ── */}
        <section className={styles.timelineSection} aria-label="Prediction timeline">
          <PredictionTimeline
            genreSegments={result.segment_confidences ?? null}
            subgenreSegments={result.sub_segment_confidences ?? null}
            genreLabels={result.display_genres ?? []}
            subgenreLabels={result.sub_labels ?? []}
            audioUrl={result.audio_url ?? null}
            waveformData={result.waveform_data ?? null}
          />
        </section>

      </main>

      <footer className={styles.footer}>
        <div>
          <p>Sonata</p>
          <p>&nbsp;</p>
          <p><a href="/"       className={styles.link}>Home</a> | <a href="/about" className={styles.link}>About</a></p>
          <p>&nbsp;</p>
          <p>Email: 178knr@unibit.bg</p>
          <p>&nbsp;</p>
          <p>© 2026 Sonata</p>
        </div>
      </footer>
    </>
  )
}
