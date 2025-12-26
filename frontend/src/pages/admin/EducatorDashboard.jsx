/**
 * @fincy-doc
 * Ringkasan: Dashboard sederhana untuk educator (tanpa chart berat).
 * Manfaat: Memberi ringkasan cepat (jumlah modul/materi/quiz) dan shortcut kerja tanpa fitur admin seperti pembayaran & user.
 */
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { useBreadcrumbs } from '../../hooks/useBreadcrumbs'
import RatingsModerationPanel from '../../components/dashboard/RatingsModerationPanel'

function StatCard({ title, value, icon, accent = 'brand' }) {
  const accentMap = {
    brand: 'from-brand-500/15 to-brand-500/0 text-brand-700 dark:text-brand-300 border-brand-200 dark:border-brand-800',
    emerald: 'from-emerald-500/15 to-emerald-500/0 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    purple: 'from-purple-500/15 to-purple-500/0 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    amber: 'from-amber-500/15 to-amber-500/0 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  }
  const cls = accentMap[accent] || accentMap.brand

  return (
    <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
      <div className={`absolute inset-0 bg-gradient-to-br ${cls.split(' ').slice(0, 2).join(' ')} pointer-events-none`} />
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
        <div className={`w-11 h-11 rounded-xl border ${cls.split(' ').slice(-2).join(' ')} bg-white/70 dark:bg-gray-900/40 flex items-center justify-center`}>
          <span className={`${cls.split(' ').slice(2, 4).join(' ')}`}>{icon}</span>
        </div>
      </div>
    </div>
  )
}

function EducatorDashboard() {
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)
  const breadcrumbs = useBreadcrumbs()

  useEffect(() => {
    const fetchModules = async () => {
      setLoading(true)
      try {
        const res = await api.get('/admin/modules')
        setModules(Array.isArray(res.data) ? res.data : [])
      } catch (e) {
        // Diamkan: halaman tetap bisa tampil (tanpa angka)
        setModules([])
      } finally {
        setLoading(false)
      }
    }

    fetchModules()
  }, [])

  const stats = useMemo(() => {
    const totalModules = modules.length
    const activeModules = modules.filter((m) => Boolean(m.is_active)).length
    const totalContents = modules.reduce((sum, m) => sum + (Array.isArray(m.contents) ? m.contents.length : 0), 0)
    const totalQuizQuestions = modules.reduce((sum, m) => {
      const questions = m.quiz?.questions
      return sum + (Array.isArray(questions) ? questions.length : 0)
    }, 0)
    return { totalModules, activeModules, totalContents, totalQuizQuestions }
  }, [modules])

  return (
    <div>
      <Breadcrumbs items={breadcrumbs} />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Educator Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Ringkasan singkat untuk mengelola modul dan materi.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
            <p className="mt-4 text-gray-500 dark:text-gray-400">Memuat data...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="Total Modul"
              value={stats.totalModules}
              accent="brand"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6l-2 4h4l-2 4m6-10H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V10a2 2 0 00-2-2z" />
                </svg>
              }
            />
            <StatCard
              title="Modul Aktif"
              value={stats.activeModules}
              accent="emerald"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m7 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <StatCard
              title="Total Materi"
              value={stats.totalContents}
              accent="purple"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              }
            />
            <StatCard
              title="Total Soal Quiz"
              value={stats.totalQuizQuestions}
              accent="amber"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16h6M7 20h10a2 2 0 002-2V6a2 2 0 00-2-2H9l-2 2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              }
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-1 bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Shortcut</h2>
              <div className="flex flex-col gap-3">
                <Link
                  to="/admin/modules"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Kelola Modul
                </Link>
                <Link
                  to="/admin/guide"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Lihat Panduan
                </Link>
              </div>
            </div>

            <div className="xl:col-span-2">
              <RatingsModerationPanel />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default EducatorDashboard


