import { useEffect } from 'react'

export function useKeyboardShortcut(key, callback, deps = []) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Check if the key combination matches
      const isCtrlOrCmd = event.ctrlKey || event.metaKey
      const isShift = event.shiftKey
      const isAlt = event.altKey

      // Parse the key string (e.g., "Ctrl+K", "Ctrl+Shift+K", "K")
      const parts = key.split('+').map(p => p.trim().toLowerCase())
      const mainKey = parts[parts.length - 1].toLowerCase()
      
      // Check modifiers
      const needsCtrl = parts.includes('ctrl') || parts.includes('cmd')
      const needsShift = parts.includes('shift')
      const needsAlt = parts.includes('alt')

      // Check if modifiers match
      if (needsCtrl && !isCtrlOrCmd) return
      if (needsShift && !isShift) return
      if (needsAlt && !isAlt) return
      if (!needsCtrl && (isCtrlOrCmd || isShift || isAlt)) return

      // Check if the main key matches
      if (event.key.toLowerCase() === mainKey || event.code.toLowerCase() === `key${mainKey}`) {
        event.preventDefault()
        callback(event)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [key, ...deps])
}

export default useKeyboardShortcut

