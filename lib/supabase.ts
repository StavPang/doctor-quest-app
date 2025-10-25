import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

export interface Question {
  id: number
  subject: string
  source_file: string
  question_number: number
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  option_e: string
  correct_option: string
  correct_text: string
}

export interface UserScore {
  id: string
  user_id: string
  question_id: string
  subject: string
  is_correct: boolean
  created_at: string
}

export interface UserStats {
  id: string
  user_id: string
  total_questions_answered: number
  total_correct_answers: number
  current_streak: number
  longest_streak: number
  last_answered_at: string
  created_at: string
  updated_at: string
}
