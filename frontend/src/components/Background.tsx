import { useEffect, useRef } from 'react'

/**
 * Background environment.
 *  - soft grain lives on body::before
 *  - mouse-tracked bloom (lerped radial)
 */
export default function Background() {
  const bloomRef = useRef<HTMLDivElement>(null)

  /* ───── mouse bloom ───── */
  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const el = bloomRef.current
    if (!el) return

    let tx = window.innerWidth / 2
    let ty = window.innerHeight / 2
    let cx = tx
    let cy = ty
    let raf = 0

    const onMove = (e: MouseEvent) => {
      tx = e.clientX
      ty = e.clientY
    }
    window.addEventListener('mousemove', onMove, { passive: true })

    const tick = () => {
      cx += (tx - cx) * 0.05
      cy += (ty - cy) * 0.05
      el.style.background = `radial-gradient(720px circle at ${Math.round(cx)}px ${Math.round(cy)}px, rgba(56,189,248,0.08), transparent 65%)`
      raf = requestAnimationFrame(tick)
    }
    tick()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
    }
  }, [])

  return (
    <>
      {/* Mouse heat bloom */}
      <div
        ref={bloomRef}
        aria-hidden
        className="fixed inset-0 z-0 pointer-events-none"
      />

      <div
        aria-hidden
        className="fixed inset-x-0 top-0 z-0 h-[420px] pointer-events-none"
        style={{
          background:
            'linear-gradient(120deg, rgba(56,189,248,0.12), transparent 35%), linear-gradient(80deg, transparent 50%, rgba(16,185,129,0.08))',
        }}
      />
    </>
  )
}
