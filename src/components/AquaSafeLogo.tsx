type AquaSafeLogoProps = {
  size?: 'sm' | 'lg'
}

export function AquaSafeLogo({ size = 'sm' }: AquaSafeLogoProps) {
  return (
    <span className={`aquasafe-logo aquasafe-logo-${size}`} aria-hidden="true">
      <svg viewBox="0 0 64 64" focusable="false">
        <defs>
          <linearGradient id="aquasafeDrop" x1="16" x2="50" y1="10" y2="56">
            <stop offset="0%" stopColor="#7ee7df" />
            <stop offset="52%" stopColor="#2e9a90" />
            <stop offset="100%" stopColor="#185f73" />
          </linearGradient>
        </defs>
        <path
          className="aquasafe-shield"
          d="M32 6 52 14v16c0 13.8-8.3 24.5-20 28C20.3 54.5 12 43.8 12 30V14L32 6Z"
        />
        <path
          className="aquasafe-drop"
          d="M32 15c7.6 8 12 14.6 12 22.1 0 7-5.3 12.4-12 12.4s-12-5.4-12-12.4C20 29.6 24.4 23 32 15Z"
        />
        <path
          className="aquasafe-wave"
          d="M21 38c3.2-2.3 6.4-2.3 9.6 0 3.5 2.5 7 2.3 10.4-.2"
        />
        <circle className="aquasafe-spark" cx="41" cy="24" r="3.2" />
      </svg>
    </span>
  )
}
