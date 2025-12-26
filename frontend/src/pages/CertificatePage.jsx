/**
 * @fincy-doc
 * Ringkasan: File ini berisi kode aplikasi.
 * Manfaat: Membantu memisahkan tanggung jawab dan memudahkan perawatan.
 */
import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../services/api'
import html2pdf from 'html2pdf.js'
import { useModal } from '../contexts/ModalContext'

function CertificatePage() {
  const { id } = useParams()
  const { showAlert } = useModal()
  const [certificate, setCertificate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pdfUrl, setPdfUrl] = useState(null)
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const [customFileName, setCustomFileName] = useState('')
  const [publicLink, setPublicLink] = useState('')
  const certificateRef = useRef(null)

  // Fixed positions based on the image
  const positions = {
    name: { top: 42, left: 24 },
    module: { top: 56.8, left: 24 },
    certNumber: { top: 77, left: 24 },
    date: { top: 77, left: 68.5 }
  }

  useEffect(() => {
    fetchCertificate()
  }, [id])

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

  const fetchCertificate = async () => {
    try {
      const response = await api.get(`/modules/${id}/certificate`)
      setCertificate(response.data)
      // Sertifikat selalu public, pastikan public_link selalu ada
      if (response.data.public_link) {
        setPublicLink(response.data.public_link)
      } else {
        // Jika belum ada public_link, generate dengan membuat sertifikat public
        try {
          const toggleResponse = await api.post(`/modules/${id}/certificate/toggle-public`)
          setPublicLink(toggleResponse.data.public_link || '')
        } catch (error) {
          console.error('Error generating public link:', error)
        }
      }
    } catch (error) {
      console.error('Error fetching certificate:', error)
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

  const handleDownload = () => {
    if (!pdfUrl || !certificate) return

    const sanitizeFileName = (str) => {
      return str
        .replace(/[^a-z0-9]/gi, '_')
        .replace(/_+/g, '_')
        .toLowerCase()
        .substring(0, 50)
    }

    const fileName = customFileName 
      ? `${sanitizeFileName(customFileName)}.pdf`
      : (() => {
          const userName = certificate.user.name || 'User'
          const moduleTitle = certificate.module.title || 'Module'
          const date = new Date(certificate.certificate.issued_at).toISOString().split('T')[0]
          return `Sertifikat_${sanitizeFileName(userName)}_${sanitizeFileName(moduleTitle)}_${date}.pdf`
        })()

    const link = document.createElement('a')
    link.href = pdfUrl
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Loading certificate...</p>
        </div>
      </div>
    )
  }

  if (!certificate) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Certificate Not Found</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            You haven't earned a certificate for this module yet.
          </p>
          <Link
            to={`/learning-modules/${id}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-semibold"
          >
            Back to Module
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
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
        {/* Header Controls */}
        <div className="max-w-7xl mx-auto mb-8 flex items-center justify-between">
          <Link
            to={`/learning-modules/${id}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Module
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleDownload}
              disabled={!pdfUrl || generatingPdf}
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generatingPdf ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Generating PDF...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download PDF
                </>
              )}
            </button>
          </div>
        </div>

        {/* Settings Panel - Share & PDF File Name */}
        <div className="max-w-7xl mx-auto mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Pengaturan Sertifikat</h3>
            
            <div className="space-y-6">
              {/* Public Share Link */}
              {publicLink && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Share Certificate
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    Share this link with anyone (no login required):
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={publicLink}
                      readOnly
                      className="flex-1 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-sm font-mono"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(publicLink)
                        showAlert({
                          type: 'success',
                          title: 'Link Copied!',
                          message: 'Public link has been copied to clipboard'
                        })
                      }}
                      className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-medium"
                    >
                      Copy Link
                    </button>
                  </div>
                </div>
              )}

              {/* Custom File Name */}
              <div>
                <label htmlFor="file-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nama File PDF
                </label>
                <input
                  id="file-name"
                  type="text"
                  value={customFileName}
                  onChange={(e) => setCustomFileName(e.target.value)}
                  placeholder="Sertifikat_Nama_Modul_Tanggal"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Nama file saat download (tanpa ekstensi .pdf)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="max-w-7xl mx-auto">
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
      </div>

      {/* Styles */}
      <style>{`
        .certificate-wrapper {
          position: relative;
          width: 1123px;
          height: 794px;
          background: white;
          overflow: hidden;
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
        }
        
        .certificate-text-overlay {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }
        
        .cert-text {
          position: absolute;
          font-family: Arial, sans-serif;
        }
        
        /* Recipient Name */
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
        
        /* Module Title */
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
        
        /* Certificate Number */
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
        
        /* Date */
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
    </>
  )
}

export default CertificatePage
