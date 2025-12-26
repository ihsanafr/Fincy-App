/**
 * @fincy-doc
 * Ringkasan: Context untuk mengatur bahasa aplikasi (IND/ENG).
 * Manfaat: Menyimpan pilihan bahasa secara global dan persist ke localStorage agar bahasa tetap sama saat refresh.
 */
import { createContext, useContext, useState, useEffect } from 'react'

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    // Get from localStorage or default to 'id'
    const saved = localStorage.getItem('language')
    return saved || 'id'
  })

  useEffect(() => {
    localStorage.setItem('language', language)
  }, [language])

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'id' ? 'en' : 'id')
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}

