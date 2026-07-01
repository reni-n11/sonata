'use client'
import { useState } from 'react'
import Link from 'next/link'
import styles from './Navbar.module.css'

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <header className={styles.navbar}>
        <button
          className={styles.hamburger}
          aria-label="Toggle navigation"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen(o => !o)}
        >
          <span className={open ? styles.bar1open : styles.bar1} />
          <span className={open ? styles.bar2open : styles.bar2} />
          <span className={open ? styles.bar3open : styles.bar3} />
        </button>

        <nav className={styles.links} aria-label="Main navigation">
          <Link href="/about"       className={styles.link}>About</Link>
        </nav>

      </header>

      <nav
        id="mobile-menu"
        className={`${styles.mobileMenu} ${open ? styles.mobileMenuOpen : ''}`}
        aria-label="Mobile navigation"
      >
        <Link href="/"        className={styles.mobileLink} onClick={() => setOpen(false)}>Home</Link>
        <Link href="/about"  className={styles.mobileLink} onClick={() => setOpen(false)}>About</Link>
      </nav>
    </>
  )
}
