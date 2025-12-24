import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../services/api'
import html2pdf from 'html2pdf.js'

function PublicCertificatePage() {
  const { token } = useParams()
  const [certificate, setCertificate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pdfUrl, setPdfUrl] = useState(null)
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const [customFileName, setCustomFileName] = useState('')
  const certificateRef = useRef(null)

  // Fixed positions based on the image
  const positions = {
    name: { top: 42, left: 24 },
    module: { top: 56.8, left: 24 },
    certNumber: { top: 77, left: 24 },
    date: { top: 77, left: 68.5 }
  }

  useEffect(() => {
    fetchPublicCertificate()
  }, [token])

  useEffect(() => {
    if (certificate && !customFileName) {
      const sanitizeFileName = (str) => {
        return str
          .replace(/[^a-z0-9]/gi, '_')
          .replace(/_+/g, '_')
          .toLowerCase()
          .substring(0, 50)
      }
      const userName = certificate.user.name || 'User'
      const moduleTitle = certificate.module.title || 'Module'
      const date = new Date(certificate.certificate.issued_at).toISOString().split('T')[0]
      setCustomFileName(`Sertifikat_${sanitizeFileName(userName)}_${sanitizeFileName(moduleTitle)}_${date}`)
    }
  }, [certificate, customFileName])

  useEffect(() => {
    if (certificate && certificateRef.current) {
      // Debounce PDF generation to avoid generating too frequently
      const timeoutId = setTimeout(() => {
        generatePdf()
      }, 500) // Wait 500ms after component mounts

      return () => clearTimeout(timeoutId)
    }
  }, [certificate])

  const fetchPublicCertificate = async () => {
    setLoading(true)
    try {
      const response = await api.get(`/certificate/public/${token}`)
      setCertificate(response.data)
    } catch (error) {
      console.error('Error fetching public certificate:', error)
    } finally {
      setLoading(false)
    }
  }

  const generatePdf = async () => {
    if (!certificate || !certificateRef.current) return
    
    setGeneratingPdf(true)
    const certificateElement = certificateRef.current

    // Set fixed size for PDF generation
    const fixedWidth = '1123px'
    const fixedHeight = '794px'
    
    const originalWidth = certificateElement.style.width
    const originalHeight = certificateElement.style.height
    const originalMaxWidth = certificateElement.style.maxWidth
    
    certificateElement.style.width = fixedWidth
    certificateElement.style.height = fixedHeight
    certificateElement.style.maxWidth = 'none'
    certificateElement.setAttribute('data-exporting', 'true')

    // Wait for browser to render with new size
    setTimeout(() => {
      const opt = {
        margin: 0,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          letterRendering: true,
          logging: false
        },
        jsPDF: { 
          unit: 'mm', 
          format: [297, 210],
          orientation: 'landscape'
        }
      }

      html2pdf().set(opt).from(certificateElement).outputPdf('blob').then((pdfBlob) => {
        // Revoke old URL if exists
        if (pdfUrl) {
          URL.revokeObjectURL(pdfUrl)
        }
        
        const url = URL.createObjectURL(pdfBlob)
        setPdfUrl(url)
        setGeneratingPdf(false)
        
        // Restore original styles
        certificateElement.style.width = originalWidth
        certificateElement.style.height = originalHeight
        certificateElement.style.maxWidth = originalMaxWidth
        certificateElement.removeAttribute('data-exporting')
      }).catch((error) => {
        console.error('Error generating PDF:', error)
        setGeneratingPdf(false)
        
        // Restore original styles even on error
        certificateElement.style.width = originalWidth
        certificateElement.style.height = originalHeight
        certificateElement.style.maxWidth = originalMaxWidth
        certificateElement.removeAttribute('data-exporting')
      })
    }, 100)
  }


  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl)
      }
    }
  }, [pdfUrl])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Loading certificate...</p>
        </div>
      </div>
    )
  }

  if (!certificate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Certificate Not Found</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            This certificate is not publicly shared or the link is invalid.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-semibold"
          >
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  const userName = certificate.user.name || 'Nama Penerima'
  const moduleTitle = certificate.module.title || 'Nama Kelas'
  const certificateNumber = certificate.certificate.certificate_number || 'CERT-000000'
  const issuedDate = new Date(certificate.certificate.issued_at).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Controls */}
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
        </div>

        {/* Owner Profile Section */}
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div 
            className="h-24 transition-colors duration-300"
            style={{ 
              background: certificate?.user?.banner_color 
                ? `linear-gradient(to right, ${certificate.user.banner_color}, ${certificate.user.banner_color}dd)`
                : 'linear-gradient(to right, #3b82f6, #2563eb)'
            }}
          ></div>
          <div className="px-8 pb-6 -mt-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
              {/* Profile Photo */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-700 overflow-hidden shadow-lg">
                  {certificate?.user?.profile_photo ? (
                    <img
                      src={certificate.user.profile_photo}
                      alt={userName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Jika image gagal load, sembunyikan dan tampilkan initial
                        e.target.style.display = 'none'
                        const fallback = e.target.parentElement.querySelector('.profile-photo-fallback')
                        if (fallback) {
                          fallback.style.display = 'flex'
                        }
                      }}
                    />
                  ) : null}
                  <div 
                    className="profile-photo-fallback w-full h-full flex items-center justify-center text-3xl font-bold text-gray-400 dark:text-gray-500"
                    style={{ display: certificate?.user?.profile_photo ? 'none' : 'flex' }}
                  >
                    {userName.charAt(0).toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {userName}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Certificate Owner
                </p>
                <Link
                  to={`/profile/${certificate?.user?.slug || certificate?.user?.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-semibold text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  View Profile
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="max-w-7xl mx-auto mb-8">
          {generatingPdf ? (
            <div className="flex items-center justify-center min-h-[600px] bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
                <p className="mt-4 text-gray-500 dark:text-gray-400">Generating PDF certificate...</p>
              </div>
            </div>
          ) : pdfUrl ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <iframe
                src={pdfUrl}
                className="w-full h-[80vh] min-h-[600px] border-0"
                title="Certificate PDF"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center min-h-[600px] bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
                <p className="mt-4 text-gray-500 dark:text-gray-400">Preparing certificate...</p>
              </div>
            </div>
          )}
        </div>

        {/* Hidden HTML Certificate for PDF Generation */}
        <div className="hidden">
          <div 
            ref={certificateRef} 
            className="certificate-wrapper"
            onContextMenu={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
            onSelectStart={(e) => e.preventDefault()}
          >
            {/* SVG Template as Background */}
            <div className="certificate-svg-background">
              <img 
                src="/certificate-template.svg" 
                alt="Certificate Template" 
                className="certificate-template-img"
              />
            </div>
            
            {/* Text Overlays - Fixed positions */}
            <div className="certificate-text-overlay">
              {/* Recipient Name */}
              <div 
                className="cert-text cert-name"
                style={{
                  top: `${positions.name.top}%`,
                  left: `${positions.name.left}%`
                }}
              >
                {userName}
              </div>
              
              {/* Module Title */}
              <div 
                className="cert-text cert-module"
                style={{
                  top: `${positions.module.top}%`,
                  left: `${positions.module.left}%`
                }}
              >
                {moduleTitle}
              </div>
              
              {/* Certificate Number */}
              <div 
                className="cert-text cert-number-value"
                style={{
                  top: `${positions.certNumber.top}%`,
                  left: `${positions.certNumber.left}%`
                }}
              >
                {certificateNumber}
              </div>
              
              {/* Date */}
              <div 
                className="cert-text cert-date-value"
                style={{
                  top: `${positions.date.top}%`,
                  left: `${positions.date.left}%`
                }}
              >
                {issuedDate}
              </div>
            </div>
          </div>
        </div>

        {/* Certificate Info */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Certificate Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Recipient</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{userName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Module</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{moduleTitle}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Certificate Number</p>
              <p className="text-lg font-mono text-gray-900 dark:text-white">{certificateNumber}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Issued Date</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{issuedDate}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Styles */}
      <style>{`
        .certificate-wrapper {
          position: relative;
          width: 100%;
          background: white;
          overflow: hidden;
          user-select: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
        }
        
        .certificate-wrapper[data-exporting] {
          width: 1123px !important;
          height: 794px !important;
          max-width: none !important;
          aspect-ratio: unset !important;
        }
        
        .certificate-svg-background {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }
        
        .certificate-template-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
          user-select: none;
          -webkit-user-select: none;
          -webkit-user-drag: none;
          -khtml-user-drag: none;
          -moz-user-select: none;
          -ms-user-select: none;
          pointer-events: none;
        }
        
        .certificate-text-overlay {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          user-select: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
        }
        
        .cert-text {
          position: absolute;
          font-family: Arial, sans-serif;
          user-select: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
        }
        
        .cert-name {
          font-size: 42px;
          font-weight: 700;
          color: #465fff;
          max-width: calc(100% - 24%);
          white-space: nowrap;
          overflow: visible;
          line-height: 1.2;
          text-align: left;
          transform: none;
        }
        
        .cert-module {
          font-size: 26px;
          font-weight: 600;
          color: #000000;
          max-width: calc(100% - 24%);
          white-space: nowrap;
          overflow: visible;
          line-height: 1.4;
          text-align: left;
          transform: none;
        }
        
        .cert-number-value {
          font-size: 20px;
          font-family: 'Courier New', monospace;
          font-weight: 600;
          color: #475569;
          max-width: calc(100% - 24%);
          white-space: nowrap;
          overflow: visible;
          text-align: left;
          transform: none;
        }
        
        .cert-date-value {
          font-size: 20px;
          font-weight: 600;
          color: #475569;
          max-width: calc(100% - 68.5%);
          white-space: nowrap;
          overflow: visible;
          text-align: left;
          transform: none;
        }
      `}</style>
    </div>
  )
}

export default PublicCertificatePage

