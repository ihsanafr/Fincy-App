import { useEffect, useState, useRef } from 'react'

function CounterAnimation({ end, duration = 2000, suffix = '', prefix = '' }) {
  const [count, setCount] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true)
          animateCounter()
        }
      },
      { threshold: 0.5 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [hasAnimated])

  const animateCounter = () => {
    const startTime = Date.now()
    const startValue = 0

    const updateCounter = () => {
      const now = Date.now()
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const currentValue = startValue + (end - startValue) * easeOut
      
      // Check if end value is decimal
      if (end % 1 !== 0) {
        setCount(parseFloat(currentValue.toFixed(1)))
      } else {
        setCount(Math.floor(currentValue))
      }

      if (progress < 1) {
        requestAnimationFrame(updateCounter)
      } else {
        if (end % 1 !== 0) {
          setCount(end)
        } else {
          setCount(end)
        }
      }
    }

    requestAnimationFrame(updateCounter)
  }

  return (
    <span ref={ref}>
      {prefix}{count}{suffix}
    </span>
  )
}

export default CounterAnimation

