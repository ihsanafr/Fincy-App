/**
 * @fincy-doc
 * Ringkasan: File ini berisi kode aplikasi.
 * Manfaat: Membantu memisahkan tanggung jawab dan memudahkan perawatan.
 */
import { useEffect, useRef } from 'react'

export function usePullToRefresh(onRefresh, options = {}) {
  const {
    threshold = 80,
    resistance = 2.5,
    disabled = false,
  } = options

  const touchStartY = useRef(0)
  const pullDistance = useRef(0)
  const isPulling = useRef(false)
  const elementRef = useRef(null)

  useEffect(() => {
    if (disabled || typeof window === 'undefined') return

    const element = elementRef.current || document.body
    let startY = 0

    const handleTouchStart = (e) => {
      // Only trigger if at the top of the page
      if (window.scrollY > 10) return
      
      startY = e.touches[0].clientY
      touchStartY.current = startY
      isPulling.current = true
    }

    const handleTouchMove = (e) => {
      if (!isPulling.current) return
      
      const currentY = e.touches[0].clientY
      const distance = currentY - startY

      // Only allow pull down
      if (distance > 0 && window.scrollY <= 10) {
        pullDistance.current = Math.min(distance / resistance, threshold * 1.5)
        e.preventDefault()
      } else {
        isPulling.current = false
      }
    }

    const handleTouchEnd = () => {
      if (!isPulling.current) return

      if (pullDistance.current >= threshold) {
        onRefresh()
      }

      isPulling.current = false
      pullDistance.current = 0
    }

    element.addEventListener('touchstart', handleTouchStart, { passive: false })
    element.addEventListener('touchmove', handleTouchMove, { passive: false })
    element.addEventListener('touchend', handleTouchEnd)

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [onRefresh, threshold, resistance, disabled])

  return elementRef
}

