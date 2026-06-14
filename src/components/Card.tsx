import styles from './Card.module.css'

interface CardProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  solid?: boolean
}

export default function Card({ children, className = '', style, solid }: CardProps) {
  return (
    <div
      className={`${styles.card} ${solid ? styles.solid : ''} ${className}`}
      style={style}
    >
      {children}
    </div>
  )
}
