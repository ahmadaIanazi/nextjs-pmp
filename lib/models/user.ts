import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  // ... existing fields
  credits: { type: Number, default: 1000 },
  quizHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'QuizHistory' }],
  questionLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  }
})

export const User = mongoose.model('User', UserSchema)
