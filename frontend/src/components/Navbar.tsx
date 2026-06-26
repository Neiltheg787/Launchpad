import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <header
      className="fixed top-0 inset-x-0 z-50"
      style={{
        height: 64,
        background: 'rgba(10, 15, 25, 0.82)',
        backdropFilter: 'blur(16px) saturate(1.2)',
        WebkitBackdropFilter: 'blur(16px) saturate(1.2)',
        borderBottom: '1px solid var(--color-border-1)',
      }}
    >
      <div className="shell h-full flex items-center justify-between">
        <Link
          to="/"
          data-cursor="link"
          className="flex items-center gap-3 select-none"
        >
          <span
            className="grid h-8 w-8 place-items-center rounded-lg font-display text-lg font-black"
            style={{ background: 'var(--color-charge)', color: 'var(--color-void)' }}
          >
            L
          </span>
          <span className="flex flex-col leading-tight">
            <span className="font-display font-extrabold text-[18px] text-ink">
              Launchpad
            </span>
            <span className="font-mono text-[9px] tracking-[0.12em] uppercase mt-0.5" style={{ color: 'var(--color-text-2)' }}>
              validation studio
            </span>
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-6">
          {[
            ['AGENTS', '#agents'],
            ['METHOD', '#method'],
            ['SIGNAL', '#runtime'],
          ].map(([label, href]) => (
            <a
              key={label}
              href={href}
              data-cursor="link"
              className="nav-link"
            >
              {label}
            </a>
          ))}
        </nav>

        {/* Right — status + primary action */}
        <div className="flex items-center gap-5">
          <div className="hidden md:flex items-center gap-2 font-mono text-[10px] tracking-[0.15em] uppercase" style={{ color: 'var(--color-online)' }}>
            <span className="live-dot" />
            ONLINE
          </div>
          <Link
            to="/validate"
            data-cursor="link"
            className="font-mono text-[10px] tracking-[0.14em] uppercase px-4 py-2 rounded-full"
            style={{
              background: 'var(--color-charge)',
              color: 'var(--color-void)',
            }}
          >
            New report ↗
          </Link>
        </div>
      </div>
    </header>
  )
}
