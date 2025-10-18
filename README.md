# DoctorQuest - Medical Quiz Application

A Next.js application for practicing medical questions from your Supabase database.

## Features

- **Question Navigation**: Browse through questions one at a time with previous/next buttons
- **Subject Filtering**: Filter questions by medical subject
- **Interactive Quiz**: Select answers and get immediate feedback
- **Progress Tracking**: Real-time progress bar and question counter
- **Score Tracking**: View your correct answers and success percentage
- **Responsive Design**: Beautiful, mobile-friendly interface with Tailwind CSS
- **Greek Language Support**: Fully localized for Greek medical questions

## Setup Instructions

1. **Navigate to the project directory**:
   ```bash
   cd doctor-quest-app
   ```

2. **Environment Variables**:
   The `.env.local` file has already been created with your Supabase credentials.

3. **Install dependencies** (if needed):
   ```bash
   npm install
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Database Schema

The application expects a Supabase table named `questions` with the following columns:

- `id` (number) - Unique identifier
- `subject` (string) - Medical subject category
- `source_file` (string) - Source document name
- `question_number` (number) - Question number in source
- `question_text` (string) - The question text
- `option_a` (string) - Answer option A
- `option_b` (string) - Answer option B
- `option_c` (string) - Answer option C
- `option_d` (string) - Answer option D
- `option_e` (string) - Answer option E
- `correct_option` (string) - Correct answer letter (A, B, C, D, or E)
- `correct_text` (string) - Text of the correct answer

## How to Use

1. **Select a Subject**: Use the dropdown filter at the top to choose a specific medical subject or view all questions
2. **Read the Question**: Each question is displayed with all available answer options
3. **Select an Answer**: Click on one of the answer options (A, B, C, D, E)
4. **Submit**: Click the "Υποβολή" (Submit) button to check your answer
5. **View Result**: The correct answer will be highlighted in green, incorrect answers in red
6. **Navigate**: Use "Προηγούμενη" (Previous) and "Επόμενη" (Next) buttons to move between questions
7. **Reset**: Click "Επανεκκίνηση" (Reset) to restart the quiz
8. **Track Progress**: View your statistics at the bottom showing answered questions, correct answers, and success percentage

## Technologies Used

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Supabase** - Backend database and authentication
- **React Hooks** - State management and side effects

## Project Structure

```
doctor-quest-app/
├── app/
│   ├── page.tsx         # Main quiz interface
│   ├── layout.tsx       # Root layout
│   └── globals.css      # Global styles
├── lib/
│   └── supabase.ts      # Supabase client configuration
├── .env.local           # Environment variables
└── package.json         # Dependencies
```

## Deployment

To build for production:

```bash
npm run build
npm start
```

## Notes

- Make sure your Supabase table `questions` has the correct RLS (Row Level Security) policies to allow reading data
- The application uses the anonymous key, so ensure your table is publicly readable or adjust the security settings accordingly
