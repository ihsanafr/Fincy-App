import { useState } from 'react'
import { useLocation } from 'react-router-dom'

function UserGuidePage() {
  const location = useLocation()
  const [language, setLanguage] = useState('id') // 'id' for Indonesian, 'en' for English
  const isAdmin = location.pathname.includes('/admin')

  const adminGuide = {
    id: {
      title: 'Panduan Dashboard Admin',
      sections: [
        {
          title: 'Dashboard Overview',
          content: 'Di sini kamu bisa lihat semua statistik penting, pengguna terbaru, dan permintaan pembayaran yang masuk. Ada juga grafik interaktif yang bisa kamu hover untuk lihat detail lebih lengkap. Semua data penting ada di satu tempat!',
        },
        {
          title: 'Learning Modules',
          content: 'Buat modul pembelajaran baru atau edit yang sudah ada. Kamu bisa tambahkan materi berupa video YouTube atau artikel, lalu buat kuis untuk modul tersebut. Tips: pakai search bar di atas untuk cari modul dengan cepat, atau klik header kolom untuk urutkan data sesuai kebutuhan.',
        },
        {
          title: 'Payment Requests',
          content: 'Kelola semua permintaan pembayaran langganan di sini. Kamu bisa approve atau reject pembayaran, dan juga hapus yang pending atau rejected. Cari pengguna tertentu dengan search bar, atau urutkan berdasarkan nama, jumlah, atau status dengan klik header kolom.',
        },
        {
          title: 'User Management',
          content: 'Lihat semua pengguna yang terdaftar di platform. Kamu bisa ubah role mereka jadi admin atau user biasa, dan juga hapus akun jika diperlukan. Fitur search dan sorting juga tersedia untuk memudahkan kamu menemukan pengguna tertentu.',
        },
        {
          title: 'Tips & Trik',
          content: '💡 Pakai search bar untuk cari data dengan cepat\n💡 Klik header kolom untuk urutkan tabel (ascending/descending)\n💡 Hover di grafik untuk lihat info detail\n💡 Notifikasi di pojok kanan atas akan kasih tahu kalau ada pembayaran pending atau user baru\n💡 Modul yang sudah approved tidak bisa dihapus untuk menjaga data tetap aman',
        },
      ],
    },
    en: {
      title: 'Admin Dashboard Guide',
      sections: [
        {
          title: 'Dashboard Overview',
          content: 'Here you can see all important statistics, recent users, and incoming payment requests. There are also interactive charts that you can hover over to see more detailed information. All important data is in one place!',
        },
        {
          title: 'Learning Modules',
          content: 'Create new learning modules or edit existing ones. You can add materials like YouTube videos or articles, then create quizzes for those modules. Tip: use the search bar at the top to quickly find modules, or click column headers to sort data as needed.',
        },
        {
          title: 'Payment Requests',
          content: 'Manage all subscription payment requests here. You can approve or reject payments, and also delete pending or rejected ones. Search for specific users with the search bar, or sort by name, amount, or status by clicking column headers.',
        },
        {
          title: 'User Management',
          content: 'View all registered users on the platform. You can change their roles to admin or regular user, and also delete accounts if needed. Search and sorting features are also available to help you find specific users easily.',
        },
        {
          title: 'Tips & Tricks',
          content: '💡 Use the search bar to quickly find data\n💡 Click column headers to sort tables (ascending/descending)\n💡 Hover over charts for detailed information\n💡 Notifications in the top right will notify you of pending payments or new users\n💡 Approved modules cannot be deleted to keep data safe',
        },
      ],
    },
  }

  const financeGuide = {
    id: {
      title: 'Panduan Finance Tools',
      sections: [
        {
          title: 'Dashboard',
          content: 'Lihat ringkasan keuangan kamu di satu tempat! Ada pendapatan, pengeluaran, dan saldo yang ditampilkan dengan jelas. Grafik interaktif juga bisa membantu kamu lihat pola pengeluaran dari waktu ke waktu. Semua info penting ada di sini!',
        },
        {
          title: 'Transactions',
          content: 'Catat semua pemasukan dan pengeluaran kamu di sini. Jangan lupa kategorikan transaksi dan tambahkan catatan kecil supaya lebih mudah diingat nanti. Semua riwayat transaksi tersimpan rapi dan bisa kamu lihat kapan saja.',
        },
        {
          title: 'Budgets',
          content: 'Buat anggaran bulanan untuk berbagai kategori pengeluaran. Sistem akan kasih tahu kalau pengeluaran kamu sudah melewati batas anggaran, jadi kamu bisa lebih aware dengan spending kamu. Pantau terus supaya keuangan tetap terkontrol!',
        },
        {
          title: 'Reports',
          content: 'Buat laporan keuangan yang detail dan mudah dipahami. Analisis pola pengeluaran dan tren pendapatan kamu dari waktu ke waktu. Dengan laporan ini, kamu bisa lihat kemana aja uang kamu pergi dan bikin keputusan keuangan yang lebih baik.',
        },
        {
          title: 'Categories',
          content: 'Kelola kategori transaksi sesuai kebutuhan kamu. Buat kategori custom sendiri untuk mengatur keuangan lebih rapi. Dengan kategorisasi yang baik, kamu jadi lebih paham kemana uang kamu mengalir setiap bulannya.',
        },
        {
          title: 'Tips & Trik',
          content: '💡 Catat transaksi setiap hari supaya lebih akurat\n💡 Buat anggaran yang realistis, jangan terlalu ketat atau terlalu longgar\n💡 Review laporan bulanan untuk lihat tren pengeluaran\n💡 Pakai kategori yang jelas untuk lebih mudah tracking\n💡 Cek anggaran secara berkala supaya tidak kelebihan spending',
        },
      ],
    },
    en: {
      title: 'Finance Tools Guide',
      sections: [
        {
          title: 'Dashboard',
          content: 'See your financial overview all in one place! Income, expenses, and balance are displayed clearly. Interactive charts also help you see your spending patterns over time. All important info is right here!',
        },
        {
          title: 'Transactions',
          content: 'Record all your income and expenses here. Don\'t forget to categorize transactions and add small notes so they\'re easier to remember later. All transaction history is neatly stored and you can view it anytime.',
        },
        {
          title: 'Budgets',
          content: 'Set monthly budgets for different expense categories. The system will notify you if your spending exceeds the budget limit, so you can be more aware of your spending. Keep monitoring to stay in control of your finances!',
        },
        {
          title: 'Reports',
          content: 'Generate detailed and easy-to-understand financial reports. Analyze your spending patterns and income trends over time. With these reports, you can see where your money goes and make better financial decisions.',
        },
        {
          title: 'Categories',
          content: 'Manage transaction categories according to your needs. Create your own custom categories to organize your finances better. With good categorization, you\'ll better understand where your money flows each month.',
        },
        {
          title: 'Tips & Tricks',
          content: '💡 Record transactions daily for better accuracy\n💡 Set realistic budgets - not too tight or too loose\n💡 Review monthly reports to see spending trends\n💡 Use clear categories for easier tracking\n💡 Check budgets regularly to avoid overspending',
        },
      ],
    },
  }

  const guide = isAdmin ? adminGuide[language] : financeGuide[language]
  const bgColor = isAdmin ? 'bg-brand-50 dark:bg-brand-900/10' : 'bg-purple-50 dark:bg-purple-900/10'
  const textColor = isAdmin ? 'text-brand-600 dark:text-brand-400' : 'text-purple-600 dark:text-purple-400'
  const borderColor = isAdmin ? 'border-brand-200 dark:border-brand-800' : 'border-purple-200 dark:border-purple-800'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {guide.title}
            </h1>
            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
              className="flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              title={language === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'}
            >
              <span className={language === 'id' ? 'font-semibold text-brand-600 dark:text-brand-400' : 'text-gray-400 dark:text-gray-500'}>
                IND
              </span>
              <span className="text-gray-300 dark:text-gray-600">-</span>
              <span className={language === 'en' ? 'font-semibold text-brand-600 dark:text-brand-400' : 'text-gray-400 dark:text-gray-500'}>
                ENG
              </span>
            </button>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {language === 'id'
              ? 'Yuk, pelajari cara pakai dashboard dengan panduan lengkap ini!'
              : 'Let\'s learn how to use the dashboard with this complete guide!'}
          </p>
        </div>

        {/* Guide Sections */}
        <div className="space-y-6">
          {guide.sections.map((section, index) => (
            <div
              key={index}
              className={`${bgColor} rounded-xl border ${borderColor} p-6 shadow-sm hover:shadow-md transition-shadow`}
            >
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-10 h-10 ${textColor} bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center font-bold text-lg border ${borderColor}`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h2 className={`text-xl font-semibold mb-3 ${textColor}`}>
                    {section.title}
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                    {section.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {language === 'id'
              ? 'Masih ada yang bingung? Jangan ragu untuk hubungi tim support kami ya!'
              : 'Still confused? Don\'t hesitate to contact our support team!'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default UserGuidePage

