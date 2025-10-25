'use client'

import { useEffect, useState } from 'react'
import { supabase, Question, UserStats } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import AuthButton from '@/components/AuthButton'

export default function Home() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [answeredQuestions, setAnsweredQuestions] = useState(0)
  const [loading, setLoading] = useState(true)
  const [subjects, setSubjects] = useState<string[]>([])
  const [selectedSubject, setSelectedSubject] = useState<string>('all')
  const [user, setUser] = useState<User | null>(null)
  const [userStats, setUserStats] = useState<UserStats | null>(null)

  useEffect(() => {
    fetchQuestions()
    checkUser()

    // Listen for auth changes
    const { data: { subscription }} = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUserStats(session.user.id)
      } else {
        setUserStats(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [selectedSubject])

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    setUser(session?.user ?? null)
    if (session?.user) {
      await fetchUserStats(session.user.id)
    }
  }

  const fetchUserStats = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user stats:', error)
        return
      }

      setUserStats(data)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const fetchQuestions = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('questions')
        .select('*')
        .order('id', { ascending: true })

      if (selectedSubject !== 'all') {
        query = query.eq('subject', selectedSubject)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching questions:', error)
        return
      }

      if (data) {
        setQuestions(data)
        setCurrentIndex(0)
        setSelectedAnswer(null)
        setShowResult(false)
        setScore(0)
        setAnsweredQuestions(0)

        // Extract unique subjects
        const uniqueSubjects = Array.from(new Set(data.map(q => q.subject)))
        setSubjects(uniqueSubjects)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const currentQuestion = questions[currentIndex]

  const handleAnswerClick = (option: string) => {
    if (showResult) return
    setSelectedAnswer(option)
  }

  const handleSubmit = async () => {
    if (!selectedAnswer) return

    const isCorrect = selectedAnswer === currentQuestion.correct_option

    setShowResult(true)
    setAnsweredQuestions(prev => prev + 1)

    if (isCorrect) {
      setScore(prev => prev + 1)
    }

    // Save score to database if user is logged in
    if (user) {
      try {
        const { error } = await supabase
          .from('user_scores')
          .upsert({
            user_id: user.id,
            question_id: currentQuestion.id.toString(),
            subject: currentQuestion.subject,
            is_correct: isCorrect
          }, {
            onConflict: 'user_id,question_id'
          })

        if (error) {
          console.error('Error saving score:', error)
        } else {
          // Refresh user stats
          await fetchUserStats(user.id)
        }
      } catch (error) {
        console.error('Error:', error)
      }
    }
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setSelectedAnswer(null)
      setShowResult(false)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
      setSelectedAnswer(null)
      setShowResult(false)
    }
  }

  const handleReset = () => {
    setCurrentIndex(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setScore(0)
    setAnsweredQuestions(0)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-cyan-500 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-300">Φόρτωση ερωτήσεων...</p>
        </div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800">
        <div className="text-center bg-slate-800 p-8 rounded-lg shadow-2xl border border-slate-700">
          <p className="text-xl text-gray-200">Δεν βρέθηκαν ερωτήσεις στη βάση δεδομένων.</p>
        </div>
      </div>
    )
  }

  const options = [
    { key: 'A', value: currentQuestion.option_a },
    { key: 'B', value: currentQuestion.option_b },
    { key: 'C', value: currentQuestion.option_c },
    { key: 'D', value: currentQuestion.option_d },
    { key: 'E', value: currentQuestion.option_e },
  ].filter(opt => opt.value && opt.value.trim() !== '')

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 py-4 sm:py-8 px-2 sm:px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-slate-800 rounded-t-2xl shadow-2xl p-4 sm:p-6 border-b-2 border-cyan-500/30">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-center bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
                DoctorQuest
              </h1>
              <p className="text-center text-gray-400 text-sm sm:text-base">Ερωτήσεις Ιατρικής</p>
            </div>
            <div className="hidden sm:block">
              <AuthButton />
            </div>
          </div>

          {/* Mobile Auth Button */}
          <div className="sm:hidden mb-4 flex justify-center">
            <AuthButton />
          </div>

          {/* User Stats Banner */}
          {user && userStats && (
            <div className="mb-4 p-3 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-lg">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-lg sm:text-xl font-bold text-cyan-400">{userStats.total_questions_answered}</p>
                  <p className="text-xs text-gray-400">Συνολικές</p>
                </div>
                <div>
                  <p className="text-lg sm:text-xl font-bold text-emerald-400">{userStats.total_correct_answers}</p>
                  <p className="text-xs text-gray-400">Σωστές</p>
                </div>
                <div>
                  <p className="text-lg sm:text-xl font-bold text-purple-400">
                    {userStats.total_questions_answered > 0
                      ? Math.round((userStats.total_correct_answers / userStats.total_questions_answered) * 100)
                      : 0}%
                  </p>
                  <p className="text-xs text-gray-400">Ποσοστό</p>
                </div>
              </div>
            </div>
          )}

          {/* Subject Filter */}
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-2">
            <label className="text-sm font-medium text-gray-300">Θέμα:</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 bg-slate-700 border border-slate-600 text-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-sm"
            >
              <option value="all">Όλα τα θέματα</option>
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>

          {/* Progress */}
          <div className="mt-4">
            <div className="flex justify-between text-xs sm:text-sm text-gray-400 mb-2">
              <span>Ερώτηση {currentIndex + 1} από {questions.length}</span>
              <span>Σκορ: {score}/{answeredQuestions}</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-slate-800 shadow-2xl p-4 sm:p-8 border-x border-slate-700">
          <div className="mb-4">
            <span className="inline-block px-3 py-1 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-full text-xs sm:text-sm font-medium">
              {currentQuestion.subject}
            </span>
          </div>

          <h2 className="text-base sm:text-xl font-semibold text-gray-100 mb-4 sm:mb-6 leading-relaxed">
            {currentQuestion.question_text}
          </h2>

          {/* Options */}
          <div className="space-y-2 sm:space-y-3">
            {options.map((option) => {
              const isSelected = selectedAnswer === option.key
              const isCorrect = option.key === currentQuestion.correct_option
              const showCorrectAnswer = showResult && isCorrect
              const showWrongAnswer = showResult && isSelected && !isCorrect

              return (
                <button
                  key={option.key}
                  onClick={() => handleAnswerClick(option.key)}
                  disabled={showResult}
                  className={`w-full text-left p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 ${
                    showCorrectAnswer
                      ? 'border-emerald-500 bg-emerald-500/20'
                      : showWrongAnswer
                      ? 'border-red-500 bg-red-500/20'
                      : isSelected
                      ? 'border-cyan-500 bg-cyan-500/20'
                      : 'border-slate-600 bg-slate-700/50 hover:border-cyan-500/50 hover:bg-slate-700'
                  } ${showResult ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-start">
                    <span className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold mr-2 sm:mr-3 text-sm ${
                      showCorrectAnswer
                        ? 'bg-emerald-500 text-white'
                        : showWrongAnswer
                        ? 'bg-red-500 text-white'
                        : isSelected
                        ? 'bg-cyan-500 text-white'
                        : 'bg-slate-600 text-gray-300'
                    }`}>
                      {option.key}
                    </span>
                    <span className="flex-1 pt-0.5 sm:pt-1 text-sm sm:text-base text-gray-200 break-words">{option.value}</span>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Result Message */}
          {showResult && (
            <div className={`mt-4 sm:mt-6 p-3 sm:p-4 rounded-lg border-2 ${
              selectedAnswer === currentQuestion.correct_option
                ? 'bg-emerald-500/20 border-emerald-500'
                : 'bg-red-500/20 border-red-500'
            }`}>
              <p className={`font-semibold text-sm sm:text-base ${
                selectedAnswer === currentQuestion.correct_option
                  ? 'text-emerald-400'
                  : 'text-red-400'
              }`}>
                {selectedAnswer === currentQuestion.correct_option
                  ? 'Σωστά! '
                  : `Λάθος! Η σωστή απάντηση είναι: ${currentQuestion.correct_option} - ${currentQuestion.correct_text}`}
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="bg-slate-800 rounded-b-2xl shadow-2xl p-4 sm:p-6 border-t-2 border-cyan-500/30">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-between items-stretch sm:items-center">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-slate-700 text-gray-300 rounded-lg font-medium hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-slate-600 text-sm sm:text-base order-2 sm:order-1"
            >
              ← Προηγούμενη
            </button>

            <div className="flex gap-2 sm:gap-3 order-1 sm:order-2">
              {!showResult ? (
                <button
                  onClick={handleSubmit}
                  disabled={!selectedAnswer}
                  className="flex-1 sm:flex-none px-6 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-cyan-500/20 text-sm sm:text-base"
                >
                  Υποβολή
                </button>
              ) : (
                <button
                  onClick={handleReset}
                  className="flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg shadow-purple-500/20 text-sm sm:text-base"
                >
                  Επανεκκίνηση
                </button>
              )}
            </div>

            <button
              onClick={handleNext}
              disabled={currentIndex === questions.length - 1}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-slate-700 text-gray-300 rounded-lg font-medium hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-slate-600 text-sm sm:text-base order-3"
            >
              Επόμενη →
            </button>
          </div>
        </div>

        {/* Stats Summary */}
        {answeredQuestions > 0 && (
          <div className="mt-4 sm:mt-6 bg-slate-800 rounded-2xl shadow-2xl p-4 sm:p-6 border border-slate-700">
            <h3 className="text-base sm:text-lg font-semibold text-gray-200 mb-3">Στατιστικά</h3>
            <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
              <div>
                <p className="text-xl sm:text-2xl font-bold text-cyan-400">{answeredQuestions}</p>
                <p className="text-xs sm:text-sm text-gray-400">Απαντήθηκαν</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-emerald-400">{score}</p>
                <p className="text-xs sm:text-sm text-gray-400">Σωστές</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-purple-400">
                  {answeredQuestions > 0 ? Math.round((score / answeredQuestions) * 100) : 0}%
                </p>
                <p className="text-xs sm:text-sm text-gray-400">Ποσοστό</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
