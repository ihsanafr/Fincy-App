import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import ScrollReveal from '../components/ScrollReveal'
import CounterAnimation from '../components/CounterAnimation'

function HomePage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-purple-50/20 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900/5 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-500 via-purple-600 to-brand-700 dark:from-brand-700 dark:via-purple-800 dark:to-brand-900">
        {/* Subtle Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-96 h-96 bg-purple-300/15 rounded-full mix-blend-overlay filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-brand-300/15 rounded-full mix-blend-overlay filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32">
          <div className="text-center">
            <ScrollReveal direction="fade" delay={100}>
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-md rounded-full text-white/90 text-sm font-medium mb-8 border border-white/20 hover:bg-white/20 transition-all duration-300 cursor-default">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Financial Literacy for Society
              </div>
            </ScrollReveal>
            
            <ScrollReveal direction="up" delay={200}>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                Revolutionize Your{' '}
                <span className="bg-gradient-to-r from-yellow-200 via-pink-200 to-purple-200 bg-clip-text text-transparent">
                  Financial Future
                </span>
              </h1>
            </ScrollReveal>
            
            <ScrollReveal direction="up" delay={300}>
              <p className="text-xl sm:text-2xl text-white/95 mb-8 max-w-2xl mx-auto leading-relaxed font-light">
                Simple, Secure, and Convenient. Learn financial literacy and manage your money effectively.
              </p>
            </ScrollReveal>
            
            {user && (
              <ScrollReveal direction="fade" delay={400}>
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-md rounded-full text-white border border-white/20 hover:bg-white/20 transition-all duration-300">
                  <span>Welcome back, {user.name}!</span>
                  <span className="text-2xl">👋</span>
                </div>
              </ScrollReveal>
            )}
            {!user && (
              <ScrollReveal direction="up" delay={400}>
                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
                  <Link
                    to="/register"
                    className="group px-8 py-4 bg-white text-brand-600 rounded-xl font-medium hover:bg-brand-50 transition-all duration-200 shadow-lg transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    Get Started
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                  <Link
                    to="/learning-modules"
                    className="px-8 py-4 bg-white/10 backdrop-blur-md text-white border-2 border-white/30 rounded-xl font-medium hover:bg-white/20 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Explore Modules
                  </Link>
                </div>
              </ScrollReveal>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-y border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <ScrollReveal direction="up" delay={100}>
              <div className="text-center group cursor-default">
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent mb-2 transition-all duration-300 group-hover:scale-110 inline-block">
                  <CounterAnimation end={500} suffix="+" />
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Active Learners</div>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={200}>
              <div className="text-center group cursor-default">
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2 transition-all duration-300 group-hover:scale-110 inline-block">
                  <CounterAnimation end={50} suffix="+" />
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Learning Modules</div>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={300}>
              <div className="text-center group cursor-default">
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-brand-600 to-blue-600 bg-clip-text text-transparent mb-2 transition-all duration-300 group-hover:scale-110 inline-block">
                  <CounterAnimation end={1000} suffix="+" />
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Certificates Issued</div>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={400}>
              <div className="text-center group cursor-default">
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2 transition-all duration-300 group-hover:scale-110 inline-block">
                  <CounterAnimation end={4.8} suffix="★" />
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Average Rating</div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-50/20 to-transparent dark:via-purple-900/5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <ScrollReveal direction="fade" delay={100}>
            <div className="text-center mb-16">
              <div className="inline-block px-5 py-2 bg-purple-100/80 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium mb-6 hover:scale-105 transition-transform duration-300 cursor-default">
                Our Features
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-5 leading-tight">
                Everything You Need to{' '}
                <span className="bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent">
                  Improve Your Financial Literacy
                </span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
                Discover powerful tools designed to help you save more, invest wisely, and plan ahead — effortlessly.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 items-stretch">
            {/* Learning Modules Card */}
            <ScrollReveal direction="left" delay={100}>
              <div className="group relative bg-white dark:bg-gray-800 rounded-3xl p-8 lg:p-10 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:-translate-y-1 overflow-hidden h-full flex flex-col">
                {/* Subtle Background */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-brand-50/40 to-transparent dark:from-brand-900/10 rounded-full -mr-32 -mt-32 opacity-20 group-hover:opacity-30 transition-opacity blur-3xl"></div>
                
                <div className="relative flex flex-col flex-grow">
                  <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300 shadow-md">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    Learning Modules
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg leading-relaxed flex-grow">
                    Access free learning modules with video and text content. Complete quizzes and earn certificates to showcase your knowledge.
                  </p>
                  <Link
                    to="/learning-modules"
                    className="inline-flex items-center gap-2 text-brand-600 dark:text-brand-400 font-medium text-lg hover:gap-3 transition-all group/link mt-auto"
                  >
                    Explore Modules
                    <svg className="w-5 h-5 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>
              </div>
            </ScrollReveal>

            {/* Finance Tools Card */}
            <ScrollReveal direction="right" delay={200}>
              <div className="group relative bg-white dark:bg-gray-800 rounded-3xl p-8 lg:p-10 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:-translate-y-1 overflow-hidden h-full flex flex-col">
                {/* Subtle Background */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-50/40 to-transparent dark:from-purple-900/10 rounded-full -mr-32 -mt-32 opacity-20 group-hover:opacity-30 transition-opacity blur-3xl"></div>
                
                <div className="relative flex flex-col flex-grow">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300 shadow-md">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    Finance Tools
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg leading-relaxed flex-grow">
                    Simple money management tools to help you track and manage your finances effectively. Take control of your financial future.
                  </p>
                  <Link
                    to="/finance-tools"
                    className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 font-medium text-lg hover:gap-3 transition-all group/link mt-auto"
                  >
                    View Tools
                    <svg className="w-5 h-5 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 sm:py-24 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="fade" delay={100}>
            <div className="text-center mb-16">
              <div className="inline-block px-5 py-2 bg-brand-100/80 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 rounded-full text-sm font-medium mb-6 hover:scale-105 transition-transform duration-300 cursor-default">
                How It Works
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-5 leading-tight">
                Start Your Journey in{' '}
                <span className="bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent">
                  3 Easy Steps
                </span>
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
            {[
              { step: '01', title: 'Create Account', desc: 'Sign up for free and join our community of learners', icon: '👤', color: 'from-brand-500 to-brand-600' },
              { step: '02', title: 'Choose Module', desc: 'Browse and select learning modules that interest you', icon: '📚', color: 'from-purple-500 to-purple-600' },
              { step: '03', title: 'Learn & Earn', desc: 'Complete modules, take quizzes, and earn certificates', icon: '🎓', color: 'from-pink-500 to-pink-600' },
            ].map((item, index) => (
              <ScrollReveal key={index} direction="up" delay={index * 100}>
                <div className="group">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:-translate-y-1">
                    <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mb-6 text-3xl shadow-md group-hover:scale-105 transition-transform duration-300`}>
                      {item.icon}
                    </div>
                    <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-wider">
                      STEP {item.step}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 sm:py-24 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="fade" delay={100}>
            <div className="text-center mb-16">
              <div className="inline-block px-5 py-2 bg-purple-100/80 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium mb-6">
                Testimonials
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-5 leading-tight">
                What Our{' '}
                <span className="bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent">
                  Learners Say
                </span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
                Join thousands of satisfied learners who have transformed their financial future with Fincy
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
            {[
              {
                name: 'Sarah Johnson',
                role: 'Entrepreneur',
                image: '👩‍💼',
                rating: 5,
                text: 'Fincy has completely changed how I manage my finances. The learning modules are comprehensive and the finance tools help me track my expenses effortlessly. Highly recommended!',
                gradient: 'from-blue-500 to-cyan-500',
              },
              {
                name: 'Michael Chen',
                role: 'Student',
                image: '👨‍🎓',
                rating: 5,
                text: 'As a student, I needed to learn about personal finance. Fincy\'s modules are easy to understand and the certificates I earned have been great additions to my resume.',
                gradient: 'from-purple-500 to-pink-500',
              },
              {
                name: 'Emily Rodriguez',
                role: 'Freelancer',
                image: '👩‍💻',
                rating: 5,
                text: 'The finance tools are a game-changer! I can now track my income and expenses properly. The budgeting features help me plan better for my freelance projects.',
                gradient: 'from-orange-500 to-red-500',
              },
              {
                name: 'David Kim',
                role: 'Business Owner',
                image: '👨‍💼',
                rating: 5,
                text: 'Excellent platform for financial education. The quizzes are challenging but fair, and the certificates are professionally designed. Worth every minute spent learning!',
                gradient: 'from-green-500 to-emerald-500',
              },
              {
                name: 'Lisa Anderson',
                role: 'Parent',
                image: '👩',
                rating: 5,
                text: 'I wanted to teach my kids about money management. Fincy provided me with the knowledge I needed, and now I can guide them better. Thank you Fincy!',
                gradient: 'from-indigo-500 to-blue-500',
              },
              {
                name: 'James Wilson',
                role: 'Retiree',
                image: '👨',
                rating: 5,
                text: 'Even at my age, I found Fincy\'s modules very helpful. The platform is user-friendly and the content is relevant. It\'s never too late to learn about finances!',
                gradient: 'from-pink-500 to-rose-500',
              },
            ].map((testimonial, index) => (
              <ScrollReveal key={index} direction="scale" delay={index * 100}>
                <div className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 lg:p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:-translate-y-1 h-full flex flex-col">
                {/* Quote Icon */}
                <div className={`absolute top-4 right-4 w-12 h-12 bg-gradient-to-br ${testimonial.gradient} rounded-lg opacity-10 group-hover:opacity-20 transition-opacity flex items-center justify-center`}>
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.996 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Testimonial Text */}
                <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed text-sm lg:text-base flex-grow">
                  "{testimonial.text}"
                </p>

                {/* User Info */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-700 mt-auto">
                  <div className={`w-12 h-12 bg-gradient-to-br ${testimonial.gradient} rounded-full flex items-center justify-center text-2xl shadow-md`}>
                    {testimonial.image}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
              </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="py-20 sm:py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-600 via-purple-600 to-pink-600"></div>
          
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <ScrollReveal direction="up" delay={100}>
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight">
                Ready to Start Your Financial Journey?
              </h2>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={200}>
              <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
                Join thousands of learners improving their financial literacy and taking control of their financial future.
              </p>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={300}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register"
                  className="group px-8 py-4 bg-white text-brand-600 rounded-xl font-medium hover:bg-brand-50 transition-all duration-300 shadow-xl transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  Create Free Account
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-4 bg-white/10 backdrop-blur-md text-white border-2 border-white/30 rounded-xl font-medium hover:bg-white/20 hover:border-white/50 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Sign In
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>
      )}
    </div>
  )
}

export default HomePage
