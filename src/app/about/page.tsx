import Navbar from '@/components/Navbar'
import styles from './page.module.css'

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className={styles.page}>

        <div className={styles.logo}>
          <span className={styles.wordmark}><a href="/">Sonata</a></span>
          <p className={styles.tagline}>Discover more about music</p>
        </div>

        <div className={styles.content}>
          <h1 className={styles.title}>About Sonata</h1>

          <p className={styles.text}>
            Sonata is an AI-powered web application that analyses a song and identifies
            its genre and subgenre using an ensemble of machine learning models trained
            on the GTZAN and FMA Medium datasets.
          </p>

          <p className={styles.text}>
            Upload an audio file, search by song name, or paste a Spotify link. Sonata
            will then predict the top 5 genres and subgenres with confidence scores, visualise
            the model's confidence over time as an interactive chart, analyse the lyrics,
            describe the emotions and instruments, recommend similar songs, and find
            upcoming concerts near you.
          </p>

          <p className={styles.text}>
            Sonata was developed as a bachelor's thesis project at the University of
            Library Studies and Information Technologies (UNIBIT), Sofia, 2026.
          </p>

          <a href="/" className={styles.backBtn}>← Back to Home</a>
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