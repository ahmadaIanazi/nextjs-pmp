import mongoose from 'mongoose'

const QuizHistorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: { type: Date, default: Date.now },
  score: Number,
  questionLevel: String
})

export const QuizHistory = mongoose.model('QuizHistory', QuizHistorySchema)
